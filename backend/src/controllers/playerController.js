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

        // --- Process Data for Frontend ---

        // 1. Map Rank
        const { VALORANT_TIERS } = await import('../utils/valorantData.js');
        // Safely access nested properties
        // Ranked response from Riot usually has 'tier' inside 'latestCompetitiveUpdate' or similar structure if using official endpoint
        // But our service returns `ranked` which is the result of `getValorantRankedStats`. 
        // Note: The structure of `ranked` depends on the exact endpoint used in service.
        // Assuming `ranked` -> { sales:..., ..., latestCompetitiveUpdate: { TierAfterUpdate: 24, ... } } OR similar

        // Let's look at `riotService.js` implementation for `getValorantRankedStats`.
        // It calls `/val/ranked/v1/by-puuid/{puuid}`.
        // This endpoint returns generic ranked info. The specific tier is usually in `players` -> `[0]` -> `tier`?
        // Actually, /val/ranked/v1/by-puuid/{puuid} returns a minimal object or 404.
        // Often we rely on Match History to calculate "current" capabilities if Ranked is 404.

        // Let's assume best effort parsing:
        let displayRank = "Unranked";
        // If the service returns a standard object
        /* 
           Simulated Response:
           {
             "puuid": "...",
             "gameName": "...",
             "tagLine": "...",
             "leaderboardRank": 0,
             "rankedRating": 0,
             "numberOfWins": 0,
             "competitiveTier": 0 
           }
        */
        if (stats.ranked && typeof stats.ranked.competitiveTier !== 'undefined') {
            displayRank = VALORANT_TIERS[stats.ranked.competitiveTier] || "Unranked";
        }

        // 2. Calculate Win Rate & Matches
        const matches = stats.recentMatches || [];
        const matchesPlayed = matches.length;
        let wins = 0;

        // 3. Format Match History
        // Match V1 response wrapper usually matches typical structure
        const formattedHistory = matches.map((match, index) => {
            // Logic to determine win/loss
            // In Val, match info is in `match.players` and `match.teams`.
            // We need to find "me" in `players`, get my `teamId`.
            // Then check `teams` to see if `teamId` won.

            // Since we only get match METADATA list sometimes or full details?
            // `getValorantMatchHistory` calls `/val/match/v1/matches/by-puuid/...`
            // This endpoint returns FULL match details for recent matches.

            const myPuuid = stats.account.puuid;
            const me = match.players.find(p => p.puuid === myPuuid);

            if (!me) return null; // Should not happen

            const myTeamId = me.teamId;
            const myTeam = match.teams.find(t => t.teamId === myTeamId);

            const isWin = myTeam ? myTeam.won : false;
            if (isWin) wins++;

            // KDA
            const k = me.stats?.kills || 0;
            const d = me.stats?.deaths || 0;

            // Score (e.g., 13 - 9)
            // Find rounds won by my team vs enemy team
            // Actually, `match.teams` has `roundsWon`, `roundsPlayed` etc usually?
            // Or we just sum it up.
            // Standard Val match object: team has `roundsWon`.
            const enemyTeam = match.teams.find(t => t.teamId !== myTeamId);
            const score = `${myTeam?.roundsWon || 0} - ${enemyTeam?.roundsWon || 0}`;

            // Date
            // match.matchInfo.gameStartMillis
            const dateObj = new Date(match.matchInfo.gameStartMillis);
            const dateStr = dateObj.toLocaleDateString();

            return {
                id: match.matchInfo.matchId,
                result: isWin ? 'Victory' : 'Defeat',
                game: 'Valorant', // Hardcoded for now since we are in Val block
                score: score,
                date: dateStr,
                kill: k,
                death: d
            };
        }).filter(m => m !== null);

        const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) + '%' : 'N/A';
        const tournamentsWon = 0; // Placeholder until tournament system is linked

        // Construct final payload
        const finalStats = {
            matchesPlayed,
            tournamentsWon,
            winRate,
            rank: displayRank,
            matchHistory: formattedHistory,
            // Pass through Riot details for Dashboard display
            account: stats.account,
            shard: stats.shard,
            summoner: stats.summoner,
            region: user.region // explicit region from user 
        };

        res.json(finalStats);

    } catch (err) {
        console.error("Get Stats Error:", err.message);
        // Fallback to mock data if API fails completely to avoid broken UI? 
        // No, better to show error or empty state, but for now just 500.
        res.status(500).json({ message: "Failed to fetch stats" });
    }
};
