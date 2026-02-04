import axios from 'axios';
import https from 'https';

const agent = new https.Agent({
    rejectUnauthorized: false
});

const axiosInstance = axios.create({
    httpsAgent: agent,
    headers: {
        'User-Agent': 'EsportsPlatform/1.0'
    }
});

// Remove top level const to avoid hoisting issues
const getApiKey = () => process.env.RIOT_API_KEY;

// Region mapping for routing values (e.g., americas, europe, asia)
// For Account-V1, we need "americas", "europe", etc.
// For League-V4, we need "na1", "euw1", etc.

const getClusterRegion = (platformId) => {
    // Simple mapping, can be expanded
    const map = {
        // Americas
        'na1': 'americas',
        'br1': 'americas',
        'la1': 'americas',
        'la2': 'americas',

        // Asia
        'kr': 'asia',
        'jp1': 'asia',
        'ph2': 'asia',
        'sg2': 'asia',
        'th2': 'asia',
        'tw2': 'asia',
        'vn2': 'asia',
        'oc1': 'americas', // OCE is typically routed to Americas for Account-V1

        // Europe
        'euw1': 'europe',
        'eun1': 'europe',
        'tr1': 'europe',
        'ru': 'europe',
        'me1': 'europe', // Middle East
    };
    return map[platformId] || 'americas';
};

// 1. Get PUUID by Riot ID (GameName + TagLine)
export const getAccountByRiotId = async (gameName, tagLine, region = 'na1') => {
    try {
        const cluster = getClusterRegion(region);
        const url = `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

        console.log(`[RiotAPI] Fetching Account: ${url}`);
        const response = await axiosInstance.get(url, {
            headers: {
                "X-Riot-Token": getApiKey()
            }
        });
        return response.data; // { puuid, gameName, tagLine }
    } catch (error) {
        console.error("Riot API Error (getAccountByRiotId):", error.response?.data || error.message);
        throw error;
    }
};

// 2. Get Summoner by PUUID (needed for summonerId)
export const getSummonerByPuuid = async (puuid, region = 'na1') => {
    try {
        const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`;
        const response = await axiosInstance.get(url, {
            headers: { "X-Riot-Token": getApiKey() }
        });
        return response.data; // { id, accountId, puuid, name, profileIconId, revisionDate, summonerLevel }
    } catch (error) {
        console.error("Riot API Error (getSummonerByPuuid):", error.response?.data || error.message);
        throw error;
    }
};

// 3. Get Rank/League Entries by Summoner ID
export const getLeagueEntries = async (summonerId, region = 'na1') => {
    try {
        const url = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${encodeURIComponent(summonerId)}`;
        const response = await axiosInstance.get(url, {
            headers: { "X-Riot-Token": getApiKey() }
        });
        return response.data; // Array of league entries (Solo/Duo, Flex)
    } catch (error) {
        console.error("Riot API Error (getLeagueEntries):", error.response?.data || error.message);
        throw error;
    }
};

// Orchestrator: Get Full Player Stats
export const getPlayerStats = async (gameName, tagLine, region = 'na1') => {
    try {
        // Step 1: Get Account (PUUID)
        const account = await getAccountByRiotId(gameName, tagLine, region);

        // Step 2: Get Summoner (ID)
        const summoner = await getSummonerByPuuid(account.puuid, region);

        // Step 3: Get League Entries (Rank)
        const leagues = await getLeagueEntries(summoner.id, region);

        return {
            account,
            summoner,
            leagues
        };
    } catch (error) {
        throw error; // Let controller handle status codes
    }
};
