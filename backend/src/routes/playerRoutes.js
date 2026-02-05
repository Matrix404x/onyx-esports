import express from 'express';
import { linkRiotAccount, getMyStats, getUserProfile, searchPlayers } from '../controllers/playerController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST api/player/link
// @desc    Link Riot Account
// @access  Private
router.post('/link', auth, linkRiotAccount);

// @route   GET api/player/stats
// @desc    Get current user's stats
// @access  Private
router.get('/stats', auth, getMyStats);

// @route   GET api/player/profile/:userId
// @desc    Get user profile by ID (Public)
// @access  Private (or Public? auth middleware used for now)
router.get('/profile/:userId', auth, getUserProfile);

// @route   GET api/player/search
// @desc    Search players
// @access  Public (or Private depending on needs, using auth for now)
router.get('/search', auth, searchPlayers);

export default router;
