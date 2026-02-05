import Team from '../models/Team.js';

// Get All Teams
export const getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('captain', 'username avatar')
            .populate('members', 'username avatar');
        res.json(teams);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create Team
export const createTeam = async (req, res) => {
    try {
        const { name, tag, logo } = req.body;

        // Check if team name already exists
        let team = await Team.findOne({ name });
        if (team) {
            return res.status(400).json({ message: 'Team name already taken' });
        }

        team = new Team({
            name,
            tag,
            logo,
            captain: req.user.id,
            members: [req.user.id] // Captain is automatically a member
        });

        await team.save();
        res.json(team);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update Team (Captain or Admin)
export const updateTeam = async (req, res) => {
    try {
        const { name, tag, logo } = req.body;
        let team = await Team.findById(req.params.id);

        if (!team) return res.status(404).json({ message: 'Team not found' });

        // Check Permissions: Admin OR Team Captain
        if (team.captain.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to edit this team' });
        }

        if (name) team.name = name;
        if (tag) team.tag = tag;
        if (logo) team.logo = logo;

        await team.save();
        res.json(team);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Delete Team (Captain or Admin)
export const deleteTeam = async (req, res) => {
    try {
        let team = await Team.findById(req.params.id);

        if (!team) return res.status(404).json({ message: 'Team not found' });

        // Check Permissions: Admin OR Team Captain
        if (team.captain.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to delete this team' });
        }

        await team.deleteOne();
        res.json({ message: 'Team removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
