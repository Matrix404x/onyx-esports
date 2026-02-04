import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tournament from './src/models/Tournament.js';
import User from './src/models/User.js';

dotenv.config();

const checkOrganizer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find({ username: 'Matrix404' });
        console.log('Users with username Matrix404:');
        users.forEach(u => {
            console.log(`- ID: ${u._id}, Email: ${u.email}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

checkOrganizer();
