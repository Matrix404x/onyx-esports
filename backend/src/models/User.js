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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('User', userSchema);
