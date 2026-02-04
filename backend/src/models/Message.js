import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    room: {
        type: String,
        required: true,
        index: true // Index for faster queries by room
    },
    sender: {
        type: String, // Username
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: false // Not required if sending media
    },
    type: {
        type: String,
        enum: ['text', 'image', 'video'],
        default: 'text'
    },
    mediaUrl: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Message', MessageSchema);
