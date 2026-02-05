import express from 'express';
import { getAllTeams, createTeam, updateTeam, deleteTeam, addMember, removeMember } from '../controllers/teamController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/', getAllTeams);

// Protected
router.post('/', auth, createTeam);
router.put('/:id', auth, updateTeam);
router.delete('/:id', auth, deleteTeam);
router.post('/:id/members', auth, addMember);
router.delete('/:id/members/:userId', auth, removeMember);

export default router;
