import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: '',
        maxlength: 500
    },
    riotPuuid: {
        type: String,
        default: ''
    },
    summonerName: {
        type: String,
        default: ''
    },
    tagLine: {
        type: String,
        default: ''
    },
    region: {
        type: String,
        default: 'na1' // Default region, can be changed
    },
    game: {
        type: String,
        default: 'lol' // 'lol' or 'val'
    },
    manualStats: {
        rank: { type: String, default: 'Unranked' },
        role: { type: String, default: '' },
        main: { type: String, default: '' }
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequests: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('User', userSchema);
