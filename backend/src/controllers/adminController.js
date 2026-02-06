import User from '../models/User.js';
import Tournament from '../models/Tournament.js';
import Team from '../models/Team.js';

export const getSystemStats = async (req, res) => {
    try {
        const userCount = await User.countDocuments();

        // Detailed Tournament Stats
        const tournaments = await Tournament.find();
        const activeTournaments = tournaments.filter(t => t.status === 'ongoing').length;
        const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming').length;
        const completedTournaments = tournaments.filter(t => t.status === 'completed').length;

        // Team Stats
        const teamCount = await Team.countDocuments();

        res.json({
            userCount,
            tournamentCount: tournaments.length,
            activeTournaments,
            upcomingTournaments,
            completedTournaments,
            teamCount
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body; // Expecting { role: 'admin' } or { role: 'user' }
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const getAllTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find().sort({ createdAt: -1 });

        // Update status for tournaments that have passed
        const updatedTournaments = await Promise.all(tournaments.map(async (t) => {
            if (t.status === 'upcoming' && new Date(t.date) < new Date()) {
                t.status = 'completed';
                await t.save();
            }
            return t;
        }));

        res.json(updatedTournaments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export const deleteTournament = async (req, res) => {
    try {
        await Tournament.findByIdAndDelete(req.params.id);
        res.json({ message: 'Tournament removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
