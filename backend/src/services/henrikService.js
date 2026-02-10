
import axios from 'axios';
import { HENRIK_API_BASE, HENRIK_API_KEY } from '../config/henrikConfig.js';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

const henrikAxios = axios.create({
    baseURL: HENRIK_API_BASE,
    headers: {
        'Authorization': HENRIK_API_KEY,
        'User-Agent': 'EsportsPlatform/1.0'
    },
    httpsAgent: agent
});

// 1. Get Account (Unofficial - but Henrik uses Name/Tag directly for stats mostly)
export const getHenrikAccount = async (name, tag) => {
    try {
        // endpoint: /valorant/v1/account/{name}/{tag}
        const url = `/valorant/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
        console.log(`[HenrikAPI] Account: ${url}`);
        const res = await henrikAxios.get(url);
        return res.data.data; // { puuid, region, account_level, card, ... }
    } catch (err) {
        console.error("Henrik Account Error:", err.response?.data || err.message);
        throw err;
    }
};

// 2. Get MMR / Rank (V1 or V2)
export const getHenrikMMR = async (region, name, tag) => {
    try {
        // endpoint: /valorant/v2/mmr/{region}/{name}/{tag}
        // Region: na, eu, ap, kr
        const mapRegion = (r) => {
            // Map standard Riot platform IDs to Henrik regions (na, eu, ap, kr)
            if (['na1', 'br1', 'latam'].includes(r) || r === 'americas') return 'na';
            if (['euw1', 'eun1', 'tr1'].includes(r) || r === 'europe') return 'eu';
            if (['kr'].includes(r)) return 'kr';
            return 'ap'; // Default for sg2, jp1, etc.
        };

        const r = mapRegion(region);
        const url = `/valorant/v2/mmr/${r}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
        console.log(`[HenrikAPI] MMR: ${url}`);

        const res = await henrikAxios.get(url);
        return res.data.data; // { current_data: { currenttier, currenttierpatched, ... } }
    } catch (err) {
        console.error("Henrik MMR Error:", err.response?.data || err.message);
        return null; // Return null on error (unranked or private)
    }
};

// 3. Get Recent Matches
export const getHenrikMatches = async (region, name, tag) => {
    try {
        // endpoint: /valorant/v3/matches/{region}/{name}/{tag}
        const mapRegion = (r) => {
            if (['na1', 'br1', 'latam'].includes(r) || r === 'americas') return 'na';
            if (['euw1', 'eun1', 'tr1'].includes(r) || r === 'europe') return 'eu';
            if (['kr'].includes(r)) return 'kr';
            return 'ap';
        };

        const r = mapRegion(region);
        const url = `/valorant/v3/matches/${r}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
        console.log(`[HenrikAPI] Matches: ${url}`);

        const res = await henrikAxios.get(url);
        return res.data.data; // Array of matches
    } catch (err) {
        console.error("Henrik Matches Error:", err.response?.data || err.message);
        return [];
    }
};

export const getHenrikStats = async (gameName, tagLine, platformId) => {
    try {
        // 1. Get Account (Basic Info + PUUID + Card)
        const account = await getHenrikAccount(gameName, tagLine);

        // 2. Identify Region for Stats
        // Use platformId if available, or account.region from API
        const region = account.region || platformId || 'ap';

        // 3. Get MMR (Rank)
        const mmr = await getHenrikMMR(region, gameName, tagLine);

        // 4. Get Matches
        const matches = await getHenrikMatches(region, gameName, tagLine);

        // Structure to match existing Controller expectation (roughly)
        return {
            account: {
                gameName: account.name,
                tagLine: account.tag,
                puuid: account.puuid,
                card: account.card, // Player card image object { small, large, wide, id }
                accountLevel: account.account_level
            },
            ranked: mmr ? {
                competitiveTier: mmr.current_data?.currenttier || 0,
                rankName: mmr.current_data?.currenttierpatched || "Unranked",
                elo: mmr.current_data?.elo || 0,
                mmr_change: mmr.current_data?.mmr_change_to_last_game
            } : null,
            recentMatches: matches, // Henrik returns clean match objects
            region: region
        };

    } catch (err) {
        throw err;
    }
};
