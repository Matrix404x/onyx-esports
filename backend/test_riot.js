import axios from 'axios';
import dotenv from 'dotenv';
import https from 'https';

dotenv.config();

const agent = new https.Agent({ rejectUnauthorized: false });
const axiosInstance = axios.create({ httpsAgent: agent });

const API_KEY = process.env.RIOT_API_KEY;
if (!API_KEY) {
    console.error("❌ RIOT_API_KEY is missing in .env");
    process.exit(1);
}

const gameName = process.argv[2] || 'Matrix404'; // Default
const tagLine = process.argv[3] || '404'; // Default
const region = process.argv[4] || 'na1'; // Default platform ID (e.g., sg2, na1)

console.log(`🔍 Testing Riot API for: ${gameName} #${tagLine} (Region: ${region})`);
console.log(`🔑 Using Key: ${API_KEY.substring(0, 10)}...`);

const getCluster = (id) => {
    const map = {
        na1: 'americas', br1: 'americas', la1: 'americas', la2: 'americas', oc1: 'americas',
        euw1: 'europe', eun1: 'europe', tr1: 'europe', ru: 'europe', me1: 'europe',
        kr: 'asia', jp1: 'asia', ph2: 'asia', sg2: 'asia', th2: 'asia', tw2: 'asia', vn2: 'asia'
    };
    return map[id] || 'americas';
};

const runTest = async () => {
    try {
        // 1. Account
        const cluster = getCluster(region);
        console.log(`\n1️⃣ Fetching Account from ${cluster}...`);
        const accUrl = `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

        const accRes = await axiosInstance.get(accUrl, { headers: { 'X-Riot-Token': API_KEY } });
        console.log("✅ Account Found:", accRes.data.puuid.substring(0, 20) + "...");
        const puuid = accRes.data.puuid;

        // 2. Encrypted Summoner ID (needed for League, not Val, but good to check)
        // Skip for Val focus

        // 3. Active Shard (Valorant)
        console.log(`\n2️⃣ Fetching Active Shard...`);
        const shardUrl = `https://${cluster}.api.riotgames.com/riot/account/v1/active-shards/by-game/val/by-puuid/${puuid}`;
        const shardRes = await axiosInstance.get(shardUrl, { headers: { 'X-Riot-Token': API_KEY } });
        const shard = shardRes.data.activeShard;
        console.log("✅ Active Shard:", shard);

        // 4. Ranked Stats
        console.log(`\n3️⃣ Fetching Valorant Ranked Stats from ${shard}...`);
        const rankUrl = `https://${shard}.api.riotgames.com/val/ranked/v1/by-puuid/${puuid}`;
        try {
            const rankRes = await axiosInstance.get(rankUrl, { headers: { 'X-Riot-Token': API_KEY } });
            console.log("✅ Ranked Data:", JSON.stringify(rankRes.data, null, 2));
        } catch (err) {
            console.error("❌ Ranked Data Failed:", err.response?.status, err.response?.data);
        }

        // 5. Match History
        console.log(`\n4️⃣ Fetching Recent Matches from ${shard}...`);
        const matchUrl = `https://${shard}.api.riotgames.com/val/match/v1/matches/by-puuid/${puuid}`;
        try {
            const matchRes = await axiosInstance.get(matchUrl, { headers: { 'X-Riot-Token': API_KEY } });
            console.log(`✅ Matches Found: ${matchRes.data.length}`);
            if (matchRes.data.length > 0) {
                console.log("   First Match Metadata:", JSON.stringify(matchRes.data[0].metadata, null, 2));
            }
        } catch (err) {
            console.error("❌ Match History Failed:", err.response?.status, err.response?.data);
        }

    } catch (err) {
        console.error("\n❌ FATAL ERROR:", err.message);
        if (err.response) console.error("Response:", err.response.data);
    }
};

runTest();
