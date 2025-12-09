
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

const seedData = async () => {
    try {
        await connect(process.env.MONGO_URI);
        const email = "tester_ysy@test.com";
        const user = await User.findOne({ email });

        if (!user) {
            console.log("Test user not found!");
            process.exit(1);
        }

        // 1. Create Project
        let project = await Project.create({
            user: user._id,
            project_name: "Test Project Alpha",
            project_start_date: new Date(),
            expected_completion_period: 12,
            state_region: "Delhi",
            district: "Delhi",
            terrain_type: "Plain",
            project_type: "Transmission Line",
            line_voltage_level: "400kV",
            total_budget: 100000000,
            status: "Ongoing"
        });
        console.log(`Created Project: ${project.project_name}`);

        // 2. Create BOQ
        const boqMaterials = [
            { material_name: "ACSR_Moose_tons", quantity: 100, unit: "tons" },
            { material_name: "Tower_Steel_MT", quantity: 500, unit: "MT" },
            { material_name: "Cement_MT", quantity: 1000, unit: "MT" }
        ];

        await BOQ.create({
            project: project._id,
            materials: boqMaterials,
            input_parameters: {
                project_type: "Transmission",
                state: "Delhi",
                project_budget_in_crores: 10
            }
        });
        console.log(`Created BOQ for project with 3 items.`);
        console.log(`Items: ACSR_Moose_tons (100), Tower_Steel_MT (500), Cement_MT (1000)`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
