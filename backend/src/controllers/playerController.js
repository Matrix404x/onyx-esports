import User from '../models/User.js';
import { getPlayerStats } from '../services/riotService.js';

// Link Riot Account
export const linkRiotAccount = async (req, res) => {
    try {
        const { gameName, tagLine, region } = req.body;
        const userId = req.user.id;

        // Verify with Riot
        const stats = await getPlayerStats(gameName, tagLine, region);

        // Update User
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.summonerName = stats.account.gameName;
        user.tagLine = stats.account.tagLine;
        user.riotPuuid = stats.account.puuid;
        user.region = region;

        await user.save();

        res.json({ message: "Riot Account Linked", user, stats });

    } catch (err) {
        console.error("Link Riot Error:", err.message);
        if (err.response) {
            console.error("Riot Response:", err.response.status, err.response.data);
            if (err.response.status === 404) {
                return res.status(404).json({ message: "Riot account not found" });
            }
            // Pass through the specific error from Riot
            return res.status(err.response.status).json({
                message: err.response.data?.status?.message || "Riot API Error",
                details: err.response.data
            });
        }
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// Get Player Stats (My Stats)
export const getMyStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.riotPuuid) {
            return res.status(400).json({ message: "No Riot account linked" });
        }

        // Fetch fresh stats from Riot
        const stats = await getPlayerStats(user.summonerName, user.tagLine, user.region);

        res.json(stats);

    } catch (err) {
        console.error("Get Stats Error:", err.message);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
};
