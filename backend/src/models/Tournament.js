import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    game: {
        type: String,
        required: true,
        enum: ['Valorant', 'CS2', 'League of Legends', 'Dota 2', 'Rocket League', 'Other'],
        default: 'Other'
    },
    prize: {
        type: String,
        required: true
    },
    entryFee: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        required: true
    },
    maxTeams: {
        type: Number,
        required: true,
        default: 16
    },
    currentTeams: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        default: '' // Add default placeholder later
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed'],
        default: 'upcoming'
    },
    isLive: {
        type: Boolean,
        default: false
    },
    streamerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Tournament', tournamentSchema);
