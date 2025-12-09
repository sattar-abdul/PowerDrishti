
import { connect } from 'mongoose';
import { Project } from '../models/Project.js';
import { MonthlyBOQ } from '../models/MonthlyBOQ.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedMonthlyData = async () => {
    try {
        await connect(process.env.MONGO_URI);
        const project = await Project.findOne({ project_name: "Test Project Alpha" });

        if (!project) {
            console.log("Test Project Alpha not found! Run seedProjectBOQ.js first (or user deleted it)");
            process.exit(1);
        }

        console.log(`Creating monthly forecast for: ${project.project_name}`);

        // Delete existing monthly BOQ for this project if any
        await MonthlyBOQ.deleteOne({ project: project._id });

        const monthlyBreakdown = [];

        // Phase 1: Pre-Construction / Civil Works (Mapped to Month 1)
        monthlyBreakdown.push({
            month: 1,
            materials: {
                "Foundation_Concrete_m3": 1200,
                "Cement_MT": 500,
                "Rebar_MT": 200, // Added
                "Sand_m3": 800,
                "Aggregate_m3": 800,
                "Earth_Rods_units": 100
            }
        });

        // Phase 2: Structure Erection (Mapped to Month 2)
        monthlyBreakdown.push({
            month: 2,
            materials: {
                "Tower_Steel_MT": 800,
                "Bolts_Nuts_pcs": 15000,
                "Angle_Tower_MT": 150,
                "Spring_Washers_pcs": 15000 // Added
            }
        });

        // Phase 3: Conductor & Stringing (Mapped to Month 3)
        monthlyBreakdown.push({
            month: 3,
            materials: {
                "ACSR_Moose_tons": 250,
                "ACSR_Zebra_tons": 50, // Added
                "Disc_Insulators_units": 3000,
                "Longrod_Insulators_units": 500, // Added
                "Earthwire_km": 45,
                "OPGW_km": 45, // Added
                "Vibration_Dampers_pcs": 1000 // Added
            }
        });

        // Phase 4: Finishing & Commissioning (Mapped to Month 4)
        monthlyBreakdown.push({
            month: 4,
            materials: {
                "Conductor_Accessories_sets": 200,
                "Clamp_Fittings_sets": 500,
                "Spacer_Dampers_pcs": 2000,
                "Misc_Hardware_lots": 10,
                "Paint_Liters": 500 // Added
            }
        });

        await MonthlyBOQ.create({
            project: project._id,
            total_months: 4,
            monthly_breakdown: monthlyBreakdown
        });

        console.log("Monthly Forecast Seeded Successfully!");
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedMonthlyData();
