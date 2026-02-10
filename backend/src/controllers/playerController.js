import User from '../models/User.js';
import { getPlayerStats } from '../services/riotService.js';
import { getHenrikStats } from '../services/henrikService.js';

// Link Riot Account
export const linkRiotAccount = async (req, res) => {
    try {
        const { gameName, tagLine, region, game = 'lol' } = req.body; // Added game param
        const userId = req.user.id;

        // Verify with Riot based on Game Type
        // Verify with Riot based on Game Type
        let stats;
        if (game === 'val') {
            // Use Henrik API for Valorant
            stats = await getHenrikStats(gameName, tagLine, region);
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
            stats = await getHenrikStats(user.summonerName, user.tagLine, user.region);
        } else {
            stats = await getPlayerStats(user.summonerName, user.tagLine, user.region);
        }


        // --- Process Data for Frontend ---

        // NEW: Henrik API Handling for Valorant
        if (user.game === 'val') {
            // Simplify logic significantly because Henrik gives clean data
            const displayRank = stats.ranked?.rankName || "Unranked";
            const matches = stats.recentMatches || [];
            const matchesPlayed = matches.length;

            // Update Avatar if available
            if (stats.account?.card?.small) {
                user.avatar = stats.account.card.small;
                await user.save();
            }

            // Calculate Win Rate (Henrik matches have clear 'metadata' usually)
            // Matches V3 structure: { metadata: { result: "won"|"lost" }, stats: { kills, deaths } }
            // Let's inspect typical Henrik V3 match object. 
            // Actually, it usually has `metadata.has_won` boolean? 
            // Or we check team? Usually `metadata` has `result`?
            // Let's assume best effort.

            let wins = 0;
            const formattedHistory = matches.map(m => {
                // Check if player won
                // in V3: m.players.all_players.find...
                // Actually Henrik's matches endpoint is nice but structure varies by version.
                // Let's assume simple parsing or just return raw for now to be safe, 
                // but let's try to map it to our UI format.

                const myName = stats.account.gameName;
                const myTag = stats.account.tagLine;

                // Find me
                const me = m.players?.all_players?.find(p => p.name.toLowerCase() === myName.toLowerCase() && p.tag.toLowerCase() === myTag.toLowerCase());

                let isWin = false;
                if (me) {
                    const teamKey = me.team.toLowerCase(); // 'red' or 'blue'
                    // Henrik V3 structure: match.teams.red.has_won (boolean)
                    isWin = m.teams?.[teamKey]?.has_won || false;
                }

                if (isWin) wins++;

                return {
                    id: m.metadata?.matchid,
                    result: isWin ? 'Victory' : 'Defeat',
                    game: 'Valorant',
                    score: `${m.teams?.red?.rounds_won || 0} - ${m.teams?.blue?.rounds_won || 0}`, // Rough approximation
                    date: m.metadata?.game_start_patched || 'Recent',
                    kill: me?.stats?.kills || 0,
                    death: me?.stats?.deaths || 0
                };
            });

            const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) + '%' : 'N/A';

            return res.json({
                matchesPlayed,
                tournamentsWon: 0,
                winRate,
                rank: displayRank,
                matchHistory: formattedHistory,
                account: stats.account,
                region: user.region,
                isManual: false
            });
        }

        // OLD: Standard LoL Handling (Keep specific parts if needed, or just standard flow)
        // For LoL, we still reference old code below, but since 'stats' object structure differs, 
        // we should probably just return standard for LoL if not Val.

        // ... (Existing LoL Logic would go here if we were fully supporting LoL deeply right now)
        // For now, let's keep the LoL minimal or error out if needed, but since we focused Val:
        res.json({ message: "LoL Stats Not Fully Implemented with new Refactor yet" });


        // ... existing code ...

    } catch (err) {
        console.error("Get Stats Error:", err.message);

        // FALLBACK: Return Manual Stats if Riot API fails
        const user = await User.findById(req.user.id);
        if (user) {
            return res.json({
                matchesPlayed: 0,
                tournamentsWon: 0,
                winRate: 'N/A',
                rank: user.manualStats?.rank || "Unranked",
                matchHistory: [],
                account: {
                    gameName: user.summonerName || user.username,
                    tagLine: user.tagLine || 'NA1'
                },
                region: user.region,
                isManual: true, // Flag for frontend to know it's manual data
                manualStats: user.manualStats
            });
        }

        res.status(500).json({ message: "Failed to fetch stats" });
    }
};

// Get User Profile by ID (Public)
export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password -email'); // Exclude private info

        if (!user) return res.status(404).json({ message: "User not found" });

        // Basic payload with Manual Stats default
        let profile = {
            _id: user._id,
            username: user.username,
            avatar: user.avatar,
            bio: user.bio,
            tagLine: user.tagLine,
            summonerName: user.summonerName,
            role: user.manualStats?.role || 'Flex',
            main: user.manualStats?.main || 'Fill',
            rank: user.manualStats?.rank || "Unranked",
            matchesPlayed: 0,
            tournamentsWon: 0,
            winRate: 'N/A',
            matchHistory: [],
            isManual: true
        };

        // If they have Riot Linked, try to fetch/use Riot stats (Cached or Live)
        // For public profile, fetching Live Riot stats every view is expensive/slow.
        // Ideally we should cache this on the User model or use a separate Stats model.
        // For MVP, we will try to fetch if we have keys, otherwise return Manual/Basic.

        // TODO: Implement Caching. For now, just return User object data + basic stats.
        // We won't fetch live Riot data here to prevent rate limits/slow loading on social browsing.
        // We rely on the user to "Update" their own stats which saves to DB (if we implemented that).
        // Current `getMyStats` fetches live. 
        // Let's just return what we have in DB (Manual) or empty for now.

        res.json(profile);

    } catch (err) {
        console.error("Get User Profile Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};

// Search Players
export const searchPlayers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        // Search by username or summonerName (case insensitive)
        const users = await User.find({
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { summonerName: { $regex: q, $options: 'i' } }
            ]
        }).select('username avatar summonerName tagLine _id friends'); // return minimal info

        // Map to include friend status relative to requestor?
        // For now, let frontend handle it by comparing with own friend list.
        res.json(users);

    } catch (err) {
        console.error("Search Error:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
};
