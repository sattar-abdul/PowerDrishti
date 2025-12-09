
import { connect, disconnect } from 'mongoose';
import { User } from '../models/User.js';
import { genSalt, hash } from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const createTestUser = async () => {
    try {
        const conn = await connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const name = "tester_ysy";
        const email = "tester_ysy@test.com";
        const password = "password123";

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            console.log('User already exists. Deleting and recreating...');
            await User.deleteOne({ email });
        }

        // Hash password
        const salt = await genSalt(10);
        const hashedPassword = await hash(password, salt);

        // Create user
        user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        console.log('User created successfully!');
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

createTestUser();
