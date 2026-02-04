import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
    try {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            console.log('Admin Seeder: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env. Skipping.');
            return;
        }

        let user = await User.findOne({ email });

        if (user) {
            // User exists, ensure they are admin
            if (user.role !== 'admin') {
                user.role = 'admin';
                await user.save();
                console.log(`Admin Seeder: User ${email} promoted to ADMIN.`);
            } else {
                console.log(`Admin Seeder: Admin account ${email} already exists.`);
            }
        } else {
            // Create new admin user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = new User({
                username: 'SuperAdmin',
                email: email,
                password: hashedPassword,
                role: 'admin',
                game: 'lol', // Default
                region: 'na1' // Default
            });

            await user.save();
            console.log(`Admin Seeder: Created permanent admin account for ${email}.`);
        }
    } catch (err) {
        console.error('Admin Seeder Error:', err.message);
    }
};

export default seedAdmin;
