import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/user.model.js';
import dotenv from 'dotenv';

dotenv.config({});

const testUsers = [
    {
        username: 'john_doe',
        email: 'john@gmail.com',
        password: 'password123',
        bio: 'Photography enthusiast',
        gender: 'male'
    },
    {
        username: 'jane_smith',
        email: 'jane@gmail.com',
        password: 'password123',
        bio: 'Designer & Artist',
        gender: 'female'
    },
    {
        username: 'tech_guru',
        email: 'tech@gmail.com',
        password: 'password123',
        bio: 'Web Developer',
        gender: 'male'
    },
    {
        username: 'sarah_pink',
        email: 'sarah@gmail.com',
        password: 'password123',
        bio: 'Fashion blogger',
        gender: 'female'
    },
    {
        username: 'mike_travel',
        email: 'mike@gmail.com',
        password: 'password123',
        bio: 'Travel vlogger',
        gender: 'male'
    }
];

const createTestUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        // Check existing users
        const existingUsers = await User.find();
        console.log(`\nFound ${existingUsers.length} existing users:\n`);
        existingUsers.forEach(u => console.log(`  - ${u.username} (${u.email})`));

        // Create test users
        console.log('\n\nCreating test users...\n');
        let created = 0;

        for (const userData of testUsers) {
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`⚠️  User ${userData.username} (${userData.email}) already exists - skipping`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const newUser = await User.create({
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                bio: userData.bio,
                gender: userData.gender
            });

            console.log(`✅ Created user: ${newUser.username} (${newUser.email})`);
            created++;
        }

        console.log(`\n✨ Successfully created ${created} test users!\n`);

        // Show all users
        const allUsers = await User.find();
        console.log(`Total users now: ${allUsers.length}\n`);
        allUsers.forEach(u => console.log(`  - ${u.username} (${u.email})`));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createTestUsers();
