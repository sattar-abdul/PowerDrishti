
import { connect } from 'mongoose';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { BOQ } from '../models/BOQ.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkData = async () => {
    try {
        await connect(process.env.MONGO_URI);
        const email = "tester_ysy@test.com";
        const user = await User.findOne({ email });

        if (!user) {
            console.log("Test user not found!");
            process.exit(1);
        }

        const projects = await Project.find({ user: user._id });
        console.log(`Found ${projects.length} projects for user.`);

        for (const p of projects) {
            const boq = await BOQ.findOne({ project: p._id });
            console.log(`Project: ${p.project_name} (${p._id}) - BOQ Found: ${!!boq}`);
            if (boq) {
                console.log('BOQ Material Sample:', boq.materials.slice(0, 3));
            }
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkData();
