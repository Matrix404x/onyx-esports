import User from '../models/User.js';
import { getPlayerStats, getValorantStats } from '../services/riotService.js';

// Link Riot Account
export const linkRiotAccount = async (req, res) => {
    try {
        const { gameName, tagLine, region, game = 'lol' } = req.body; // Added game param
        const userId = req.user.id;

        // Verify with Riot based on Game Type
        let stats;
        if (game === 'val') {
            stats = await getValorantStats(gameName, tagLine, region);
        } else {
            stats = await getPlayerStats(gameName, tagLine, region); // Default to LoL
        }

        // Update User
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.summonerName = stats.account.gameName;
        user.tagLine = stats.account.tagLine;
        user.riotPuuid = stats.account.puuid;
        user.region = region;

        // Optionally store the game type properly if Schema allows, 
        // for now we trust the stored PUUID is enough for identity.
        // We might need to store 'gamePreference' or similar later.
        if (game === 'val') {
            user.game = 'val'; // Ensure Schema has this or use flexible schema
        } else {
            user.game = 'lol';
        }

        await user.save();

        res.json({ message: "Riot Account Linked", user, stats });

    } catch (err) {
        console.error("Link Riot Error:", err.message);
        if (err.response) {
            console.error("Riot Response:", err.response.status, err.response.data);
            if (err.response.status === 404) {
                return res.status(404).json({ message: "Riot account/player not found" });
            }
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
        let stats;
        if (user.game === 'val') {
            stats = await getValorantStats(user.summonerName, user.tagLine, user.region);
        } else {
            stats = await getPlayerStats(user.summonerName, user.tagLine, user.region);
        }

        res.json(stats);

    } catch (err) {
        console.error("Get Stats Error:", err.message);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
};
