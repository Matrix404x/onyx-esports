import axios from "axios";
import https from "https";

/* ===============================
   Axios instance
================================ */
const agent = new https.Agent({
    rejectUnauthorized: false,
});

const axiosInstance = axios.create({
    httpsAgent: agent,
    headers: {
        "User-Agent": "EsportsPlatform/1.0",
    },
});

/* ===============================
   API Key Getter
================================ */
const getApiKey = () => process.env.RIOT_API_KEY;

/* ===============================
   Platform → Cluster mapping
   (THIS IS THE IMPORTANT FIX)
================================ */
const getClusterRegion = (platformId) => {
    const map = {
        // Americas
        na1: "americas",
        br1: "americas",
        la1: "americas",
        la2: "americas",
        oc1: "americas",

        // Europe
        euw1: "europe",
        eun1: "europe",
        tr1: "europe",
        ru: "europe",
        me1: "europe",

        // Asia
        kr: "asia",
        jp1: "asia",
        ph2: "asia",
        sg2: "asia",
        th2: "asia",
        tw2: "asia",
        vn2: "asia",
    };

    return map[platformId];
};

/* ===============================
   1️⃣ Get Riot Account (PUUID)
================================ */
export const getAccountByRiotId = async (
    gameName,
    tagLine,
    platformId
) => {
    try {
        const cluster = getClusterRegion(platformId);

        if (!cluster) {
            throw new Error(`Unsupported platform region: ${platformId}`);
        }

        const url = `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
            gameName
        )}/${encodeURIComponent(tagLine)}`;

        console.log("[RiotAPI] Account-V1:", url);

        const response = await axiosInstance.get(url, {
            headers: {
                "X-Riot-Token": getApiKey(),
            },
        });

        return response.data; // { puuid, gameName, tagLine }
    } catch (error) {
        console.error(
            "Riot API Error (Account-V1):",
            error.response?.data || error.message
        );
        throw error;
    }
};

/* ===============================
   2️⃣ Get Summoner by PUUID
================================ */
export const getSummonerByPuuid = async (puuid, platformId) => {
    try {
        const url = `https://${platformId}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(
            puuid
        )}`;

        console.log("[RiotAPI] Summoner-V4:", url);

        const response = await axiosInstance.get(url, {
            headers: {
                "X-Riot-Token": getApiKey(),
            },
        });

        return response.data;
    } catch (error) {
        console.error(
            "Riot API Error (Summoner-V4):",
            error.response?.data || error.message
        );
        throw error;
    }
};

/* ===============================
   3️⃣ Get Rank / League Entries
================================ */
export const getLeagueEntries = async (summonerId, platformId) => {
    try {
        const url = `https://${platformId}.api.riotgames.com/lol/league/v4/entries/by-summoner/${encodeURIComponent(
            summonerId
        )}`;

        console.log("[RiotAPI] League-V4:", url);

        const response = await axiosInstance.get(url, {
            headers: {
                "X-Riot-Token": getApiKey(),
            },
        });

        return response.data;
    } catch (error) {
        console.error(
            "Riot API Error (League-V4):",
            error.response?.data || error.message
        );
        throw error;
    }
};

/* ===============================
   4️⃣ Orchestrator (FULL PLAYER DATA)
================================ */
export const getPlayerStats = async (
    gameName,
    tagLine,
    platformId
) => {
    if (!gameName || !tagLine || !platformId) {
        throw new Error(
            "gameName, tagLine, and platformId are required"
        );
    }

    try {
        // Step 1: Riot Account
        const account = await getAccountByRiotId(
            gameName,
            tagLine,
            platformId
        );

        // Step 2: Summoner
        const summoner = await getSummonerByPuuid(
            account.puuid,
            platformId
        );

        // Step 3: Ranked Data
        const leagues = await getLeagueEntries(
            summoner.id,
            platformId
        );

        return {
            account,
            summoner,
            leagues,
        };
    } catch (error) {
        throw error;
    }
};
