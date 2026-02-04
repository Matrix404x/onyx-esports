import express from 'express';
import auth from '../middleware/auth.js';
import Message from '../models/Message.js';

const router = express.Router();

// Get messages for a specific room
router.get('/:roomId', auth, async (req, res) => {
    try {
        const messages = await Message.find({ room: req.params.roomId })
            .sort({ timestamp: 1 }) // Oldest first
            .limit(100); // Limit to last 100 messages for performance

        // Format for frontend
        const formattedMessages = messages.map(msg => ({
            roomId: msg.room,
            sender: msg.sender,
            senderId: msg.senderId,
            text: msg.text,
            time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: msg.timestamp
        }));

        res.json(formattedMessages);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

export default router;
