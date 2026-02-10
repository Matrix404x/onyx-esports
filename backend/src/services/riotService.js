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
const getApiKey = () => {
    let key = process.env.RIOT_API_KEY;
    // Fallback if env is missing or clearly the old one (simple check)
    if (!key || key.startsWith("RGAPI-95564")) {
        console.warn("WARNING: RIOT_API_KEY missing or old in process.env. Using hardcoded fallback.");
        key = "RGAPI-c533df48-9a59-4261-90ad-a2db9609afa7";
    }
    const finalKey = key.trim();
    console.log(`[RiotAPI] Using Key: ${finalKey.substring(0, 10)}...`);
    return finalKey;
};

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


//    Get Riot Account (PUUID)

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

/* ===============================
   5️⃣ Valorant Specifics
================================ */

// Get Active Shard (Val requires this to know which server to query)
// https://{cluster}.api.riotgames.com/riot/account/v1/active-shards/by-game/val/by-puuid/{puuid}
export const getActiveShard = async (puuid, cluster = 'americas') => {
    try {
        const url = `https://${cluster}.api.riotgames.com/riot/account/v1/active-shards/by-game/val/by-puuid/${encodeURIComponent(puuid)}`;
        console.log("[RiotAPI] ActiveShard-V1:", url);

        const response = await axiosInstance.get(url, {
            headers: { "X-Riot-Token": getApiKey() }
        });
        return response.data; // { activeShard: "na", game: "val", ... }
    } catch (error) {
        console.error("Riot API Error (ActiveShard):", error.response?.data || error.message);
        throw error;
    }
};

// Get Valorant Ranked Stats (Competitive Updates / Match History / MMR)
// NOTE: "Ranked" endpoint by PUUID is unofficial/hidden in some docs or standard Match-V1. 
// Official documented approach for rank is: /val/ranked/v1/leaderboards/by-act/{actId}?size=200&startIndex=0
// However, finding a specific player in leaderboard is hard.
// Instead, most apps use: /val/match/v1/matches/by-puuid/{puuid}/recent (for history)
// OR /val/ranked/v1/by-puuid/{puuid} (if available/documented)
// Let's try the common endpoint for stats: /val/ranked/v1/by-puuid/{puuid} (often used, though sometimes restricted)
// If unrestricted access is needed, we check match history. Let's try standard ranked endpoint first.
export const getValorantRankedStats = async (puuid, shard) => {
    try {
        const url = `https://${shard}.api.riotgames.com/val/ranked/v1/by-puuid/${encodeURIComponent(puuid)}`;
        console.log("[RiotAPI] ValRanked-V1:", url);

        const response = await axiosInstance.get(url, {
            headers: { "X-Riot-Token": getApiKey() }
        });
        return response.data;
        return null;
    } catch (error) {
        // 404 means no ranked data or wrong shard
        console.error("Riot API Error (ValRanked):", error.response?.data || error.message);
        // If 403 (Forbidden), return specific error to notify user
        if (error.response?.status === 403) return { error: 403 };
        return null;
    }
};


// Get Valorant Match History (Recent Matches)
export const getValorantMatchHistory = async (puuid, shard) => {
    try {
        const url = `https://${shard}.api.riotgames.com/val/match/v1/matches/by-puuid/${encodeURIComponent(puuid)}`;
        console.log("[RiotAPI] ValMatches-V1:", url);

        const response = await axiosInstance.get(url, {
            headers: { "X-Riot-Token": getApiKey() }
        });
        return response.data; // List of matches
        return response.data; // List of matches
    } catch (error) {
        console.error("Riot API Error (ValMatches):", error.response?.data || error.message);
        if (error.response?.status === 403) return { error: 403 };
        return []; // Return empty array on error
    }
};


/* ===============================
   6️⃣ Orchestrator (Valorant)
================================ */
export const getValorantStats = async (gameName, tagLine, platformId) => {
    try {
        // Step 1: Account (PUUID)
        // We still need a cluster region for Account-V1. 
        // We can reuse getClusterRegion(platformId) if platformId is passed (e.g. 'na1'), 
        // or just default to 'americas' if unknown, but better to ask user for close region.
        // Assuming platformId for Val is passed as 'na1', 'ap', 'eu', etc.

        // Improve cluster mapping for Val if needed, but existing ONE works for Account lookup.
        const account = await getAccountByRiotId(gameName, tagLine, platformId);

        // Step 2: Get Active Shard
        // We MUST know the cluster to ask for shard. 
        const cluster = getClusterRegion(platformId);
        const shardData = await getActiveShard(account.puuid, cluster);

        // Step 3: Get Ranked Stats
        const ranked = await getValorantRankedStats(account.puuid, shardData.activeShard);

        // Step 4: Get Match History (For visual stats when unranked)
        const recentMatches = await getValorantMatchHistory(account.puuid, shardData.activeShard);

        return {
            account,
            shard: shardData,
            ranked,
            recentMatches
        };
    } catch (error) {
        throw error;
    }
};
