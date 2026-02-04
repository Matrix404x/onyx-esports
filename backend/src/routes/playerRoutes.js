import express from 'express';
import { linkRiotAccount, getMyStats } from '../controllers/playerController.js';
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

export default router;
