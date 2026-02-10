
import axios from 'axios';
import https from 'https';

// Hardcoded new key from user
const API_KEY = "RGAPI-c533df48-9a59-4261-90ad-a2db9609afa7";

const agent = new https.Agent({ rejectUnauthorized: false });
const axiosInstance = axios.create({
    httpsAgent: agent,
    headers: { "X-Riot-Token": API_KEY }
});

const run = async () => {
    // 1. Account-V1 (Asia/Global)
    console.log("--- Testing Account-V1 ---");
    try {
        const url = "https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/Matrix404/404";
        const res = await axiosInstance.get(url);
        console.log("✅ Account:", res.data);

        const puuid = res.data.puuid;

        // 2. Val-Match-V1 (AP)
        console.log("\n--- Testing Val-Match-V1 (AP) ---");
        try {
            // https://ap.api.riotgames.com/val/match/v1/matches/by-puuid/{puuid}
            const matchUrl = `https://ap.api.riotgames.com/val/match/v1/matches/by-puuid/${puuid}`;
            const matchRes = await axiosInstance.get(matchUrl);
            console.log("✅ Matches:", matchRes.data.length);
        } catch (e) {
            console.log("❌ Val-Match-V1 Failed:", e.response?.status, e.response?.data);
        }

        // 3. Val-Ranked-V1 (AP)
        console.log("\n--- Testing Val-Ranked-V1 (AP) ---");
        try {
            // https://ap.api.riotgames.com/val/ranked/v1/by-puuid/{puuid}
            const rankUrl = `https://ap.api.riotgames.com/val/ranked/v1/by-puuid/${puuid}`;
            const rankRes = await axiosInstance.get(rankUrl);
            console.log("✅ Ranked:", rankRes.data);
        } catch (e) {
            console.log("❌ Val-Ranked-V1 Failed:", e.response?.status, e.response?.data);
        }

    } catch (e) {
        console.log("❌ Account-V1 Failed:", e.response?.status, e.response?.data);
    }
};

run();
