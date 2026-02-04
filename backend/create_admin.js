import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const email = process.argv[2];

if (!email) {
    console.log('Please provide an email address.');
    console.log('Usage: node create_admin.js <email>');
    process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

const makeAdmin = async () => {
    await connectDB();

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`SUCCESS: User ${user.username} (${user.email}) is now an ADMIN.`);
        console.log('You can now log in and access the Admin Panel at /admin');
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.connection.close();
    }
};

makeAdmin();
