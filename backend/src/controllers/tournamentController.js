import Tournament from '../models/Tournament.js';

export const createTournament = async (req, res) => {
    try {
        const { title, game, prize, entryFee, date, maxTeams, image } = req.body;

        const newTournament = new Tournament({
            title,
            game,
            prize,
            entryFee,
            date,
            maxTeams,
            image,
            organizer: req.user.id // From auth middleware
        });

        const tournament = await newTournament.save();
        res.json(tournament);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const getAllTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find().sort({ date: 1 }); // Sort by date ascending
        res.json(tournaments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const getTournamentById = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id).populate('organizer', 'username');
        if (!tournament) return res.status(404).json({ message: "Tournament not found" });
        res.json(tournament);
    } catch (err) {
        if (err.kind === 'ObjectId') return res.status(404).json({ message: "Tournament not found" });
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const deleteTournament = async (req, res) => {
    try {
        let tournament = await Tournament.findById(req.params.id);

        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

        // Check Permissions: Admin OR Organizer
        if (tournament.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to delete this tournament' });
        }

        await tournament.deleteOne();
        res.json({ message: 'Tournament removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const joinTournament = async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: "Tournament not found" });

        // Check if already joined
        if (tournament.participants.includes(req.user.id)) {
            return res.status(400).json({ message: "You have already joined this tournament" });
        }

        // Check if full
        if (tournament.participants.length >= tournament.maxTeams) {
            return res.status(400).json({ message: "Tournament is full" });
        }

        tournament.participants.push(req.user.id);
        tournament.currentTeams = tournament.participants.length;

        await tournament.save();
        res.json(tournament);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
