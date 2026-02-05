import express from 'express';
import auth from '../middleware/auth.js';
import {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendRequests,
    getFriendsList
} from '../controllers/friendController.js';

const router = express.Router();

// All routes require auth
router.use(auth);

// @route   POST api/friends/request/:userId
// @desc    Send friend request
router.post('/request/:userId', sendFriendRequest);

// @route   PUT api/friends/accept/:requestId
// @desc    Accept friend request
router.put('/accept/:requestId', acceptFriendRequest);

// @route   PUT api/friends/reject/:requestId
// @desc    Reject friend request
router.put('/reject/:requestId', rejectFriendRequest);

// @route   GET api/friends/requests
// @desc    Get pending friend requests
router.get('/requests', getFriendRequests);

// @route   GET api/friends/list
// @desc    Get friends list
router.get('/list', getFriendsList);

export default router;
