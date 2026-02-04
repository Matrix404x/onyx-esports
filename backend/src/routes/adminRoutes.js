import express from 'express';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import {
    getSystemStats,
    getAllUsers,
    deleteUser,
    updateUserRole,
    getAllTournaments,
    deleteTournament
} from '../controllers/adminController.js';

const router = express.Router();

// Apply auth and admin middleware to all routes in this router
router.use(auth, admin);

// @route   GET api/admin/stats
// @desc    Get system stats
router.get('/stats', getSystemStats);

// @route   GET api/admin/users
// @desc    Get all users
router.get('/users', getAllUsers);

// @route   DELETE api/admin/users/:id
// @desc    Delete user
router.delete('/users/:id', deleteUser);

// @route   PUT api/admin/users/:id/role
// @desc    Update user role
router.put('/users/:id/role', updateUserRole);

// @route   GET api/admin/tournaments
// @desc    Get all tournaments
router.get('/tournaments', getAllTournaments);

// @route   DELETE api/admin/tournaments/:id
// @desc    Delete tournament
router.delete('/tournaments/:id', deleteTournament);

export default router;
