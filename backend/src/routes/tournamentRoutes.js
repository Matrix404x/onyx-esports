import express from 'express';

import { createTournament, getAllTournaments, getTournamentById, joinTournament } from '../controllers/tournamentController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET api/tournaments
// @desc    Get all tournaments
// @access  Public
router.get('/', getAllTournaments);

// @route   GET api/tournaments/:id
// @desc    Get tournament by ID
// @access  Public
router.get('/:id', getTournamentById);

// @route   POST api/tournaments
// @desc    Create a tournament
// @access  Private
router.post('/', auth, createTournament);

// @route   POST api/tournaments/:id/join
// @desc    Join a tournament
// @access  Private
router.post('/:id/join', auth, joinTournament);

export default router;
