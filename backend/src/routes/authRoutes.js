import express from 'express';
import { register, login, updateProfile } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   PUT api/auth/update
// @desc    Update user profile (bio, avatar)
// @access  Private
router.put('/update', auth, updateProfile);

export default router;
