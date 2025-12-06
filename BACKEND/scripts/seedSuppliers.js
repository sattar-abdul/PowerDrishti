import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Supplier } from '../models/Supplier.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Sample supplier data for all 7 categories
const suppliers = [
    // Vendor 1: Conductors & OPGW
    {
        name: 'National Conductors Ltd',
        category: 'Conductors & OPGW',
        items_sold: ['ACSR Conductors', 'OPGW', 'Earthwire', 'Conductor Accessories'],
        location: { lat: 28.6139, lng: 77.2090 }, // Delhi
        address: 'Sector 18, Noida, Delhi NCR, 201301',
        contact: {
            phone: '+91-120-4567890',
            email: 'sales@nationalconductors.in',
            person: 'Rajesh Kumar'
        },
        reliability_score: 8.5,
        past_deliveries: 45,
        average_delivery_days: 12
    },
    {
        name: 'PowerLine Conductors Pvt Ltd',
        category: 'Conductors & OPGW',
        items_sold: ['ACSR Moose', 'ACSR Zebra', 'AAAC', 'OPGW'],
        location: { lat: 19.0760, lng: 72.8777 }, // Mumbai
        address: 'Andheri East, Mumbai, Maharashtra, 400069',
        contact: {
            phone: '+91-22-67891234',
            email: 'info@powerlineconductors.com',
            person: 'Amit Sharma'
        },
        reliability_score: 9.0,
        past_deliveries: 62,
        average_delivery_days: 10
    },
    {
        name: 'Eastern Cable Corporation',
        category: 'Conductors & OPGW',
        items_sold: ['Conductors', 'OPGW', 'Accessories'],
        location: { lat: 22.5726, lng: 88.3639 }, // Kolkata
        address: 'Salt Lake, Kolkata, West Bengal, 700091',
        contact: {
            phone: '+91-33-40123456',
            email: 'sales@easterncable.in',
            person: 'Subrata Das'
        },
        reliability_score: 7.8,
        past_deliveries: 38,
        average_delivery_days: 14
    },

    // Vendor 2: Tower Steel
    {
        name: 'Tata Steel Infrastructure',
        category: 'Tower Steel',
        items_sold: ['Tower Steel', 'Angle Steel', 'Bolts & Nuts', 'Hardware'],
        location: { lat: 22.8046, lng: 86.2029 }, // Jamshedpur
        address: 'Bistupur, Jamshedpur, Jharkhand, 831001',
        contact: {
            phone: '+91-657-2345678',
            email: 'infrastructure@tatasteel.com',
            person: 'Vikram Singh'
        },
        reliability_score: 9.5,
        past_deliveries: 78,
        average_delivery_days: 8
    },
    {
        name: 'JSW Steel Towers',
        category: 'Tower Steel',
        items_sold: ['Steel Structures', 'Tower Components', 'Fasteners'],
        location: { lat: 15.3647, lng: 76.4630 }, // Bellary
        address: 'Toranagallu, Bellary, Karnataka, 583123',
        contact: {
            phone: '+91-8392-234567',
            email: 'towers@jswsteel.in',
            person: 'Ramesh Babu'
        },
        reliability_score: 8.8,
        past_deliveries: 55,
        average_delivery_days: 11
    },
    {
        name: 'Bharat Heavy Steel Ltd',
        category: 'Tower Steel',
        items_sold: ['Tower Steel', 'Angles', 'Bolts', 'Misc Hardware'],
        location: { lat: 17.3850, lng: 78.4867 }, // Hyderabad
        address: 'Kukatpally, Hyderabad, Telangana, 500072',
        contact: {
            phone: '+91-40-23456789',
            email: 'sales@bharatsteel.com',
            person: 'Suresh Reddy'
        },
        reliability_score: 8.2,
        past_deliveries: 42,
        average_delivery_days: 13
    },

    // Vendor 3: Insulators
    {
        name: 'NGK Insulators India',
        category: 'Insulators',
        items_sold: ['Disc Insulators', 'Long Rod Insulators', 'Earthing Equipment'],
        location: { lat: 13.0827, lng: 80.2707 }, // Chennai
        address: 'Ambattur, Chennai, Tamil Nadu, 600058',
        contact: {
            phone: '+91-44-26781234',
            email: 'sales@ngkindia.com',
            person: 'Karthik Iyer'
        },
        reliability_score: 9.2,
        past_deliveries: 68,
        average_delivery_days: 9
    },
    {
        name: 'Aditya Birla Insulators',
        category: 'Insulators',
        items_sold: ['Insulators', 'Earth Rods', 'Earthing Mats'],
        location: { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
        address: 'Naroda, Ahmedabad, Gujarat, 382330',
        contact: {
            phone: '+91-79-22345678',
            email: 'info@adityabirlainsulators.com',
            person: 'Jayesh Patel'
        },
        reliability_score: 8.7,
        past_deliveries: 51,
        average_delivery_days: 12
    },

    // Vendor 4: Civil Materials
    {
        name: 'UltraTech Cement',
        category: 'Civil Materials',
        items_sold: ['Cement', 'Concrete', 'Aggregates'],
        location: { lat: 18.5204, lng: 73.8567 }, // Pune
        address: 'Pimpri, Pune, Maharashtra, 411018',
        contact: {
            phone: '+91-20-27411234',
            email: 'sales@ultratech.com',
            person: 'Prakash Deshmukh'
        },
        reliability_score: 9.3,
        past_deliveries: 92,
        average_delivery_days: 7
    },
    {
        name: 'ACC Limited',
        category: 'Civil Materials',
        items_sold: ['Cement', 'Sand', 'Aggregate', 'Foundation Concrete'],
        location: { lat: 28.4595, lng: 77.0266 }, // Gurgaon
        address: 'Sector 29, Gurgaon, Haryana, 122001',
        contact: {
            phone: '+91-124-4567890',
            email: 'contact@acclimited.com',
            person: 'Manish Gupta'
        },
        reliability_score: 8.9,
        past_deliveries: 74,
        average_delivery_days: 8
    },
    {
        name: 'Ambuja Cements',
        category: 'Civil Materials',
        items_sold: ['Cement', 'Ready Mix Concrete', 'Aggregates'],
        location: { lat: 21.1702, lng: 72.8311 }, // Surat
        address: 'Udhna, Surat, Gujarat, 394210',
        contact: {
            phone: '+91-261-2345678',
            email: 'sales@ambujacement.com',
            person: 'Hitesh Shah'
        },
        reliability_score: 8.6,
        past_deliveries: 58,
        average_delivery_days: 10
    },

    // Vendor 5: Power Equipment
    {
        name: 'ABB India Limited',
        category: 'Power Equipment',
        items_sold: ['Transformers', 'Circuit Breakers', 'CT/PT Sets', 'Relay Panels'],
        location: { lat: 12.9716, lng: 77.5946 }, // Bangalore
        address: 'Whitefield, Bangalore, Karnataka, 560066',
        contact: {
            phone: '+91-80-22123456',
            email: 'power@in.abb.com',
            person: 'Sanjay Menon'
        },
        reliability_score: 9.7,
        past_deliveries: 85,
        average_delivery_days: 15
    },
    {
        name: 'Siemens Power Solutions',
        category: 'Power Equipment',
        items_sold: ['Power Transformers', 'Isolators', 'Circuit Breakers', 'Protection Equipment'],
        location: { lat: 19.1176, lng: 72.9060 }, // Navi Mumbai
        address: 'Kalwa, Navi Mumbai, Maharashtra, 400605',
        contact: {
            phone: '+91-22-33456789',
            email: 'power.india@siemens.com',
            person: 'Ravi Krishnan'
        },
        reliability_score: 9.4,
        past_deliveries: 71,
        average_delivery_days: 16
    },
    {
        name: 'BHEL Power Equipment',
        category: 'Power Equipment',
        items_sold: ['Transformers', 'Switchgear', 'CT/PT', 'Relay Panels'],
        location: { lat: 26.8467, lng: 80.9462 }, // Lucknow
        address: 'Gomti Nagar, Lucknow, Uttar Pradesh, 226010',
        contact: {
            phone: '+91-522-2345678',
            email: 'sales@bhel.in',
            person: 'Anil Verma'
        },
        reliability_score: 8.8,
        past_deliveries: 63,
        average_delivery_days: 14
    },

    // Vendor 6: Cables
    {
        name: 'Polycab Wires Pvt Ltd',
        category: 'Cables',
        items_sold: ['Control Cables', 'Power Cables', 'Cable Trays', 'Busbars'],
        location: { lat: 19.2183, lng: 72.9781 }, // Thane
        address: 'Dombivli, Thane, Maharashtra, 421201',
        contact: {
            phone: '+91-251-2345678',
            email: 'sales@polycab.com',
            person: 'Deepak Joshi'
        },
        reliability_score: 9.1,
        past_deliveries: 76,
        average_delivery_days: 9
    },
    {
        name: 'Havells India Ltd',
        category: 'Cables',
        items_sold: ['Power Cables', 'Control Cables', 'Cable Management'],
        location: { lat: 28.7041, lng: 77.1025 }, // Delhi
        address: 'Rohini, Delhi, 110085',
        contact: {
            phone: '+91-11-27891234',
            email: 'cables@havells.com',
            person: 'Mohit Kapoor'
        },
        reliability_score: 8.9,
        past_deliveries: 69,
        average_delivery_days: 10
    },
    {
        name: 'KEI Industries',
        category: 'Cables',
        items_sold: ['Cables', 'Cable Trays', 'Busbar Systems'],
        location: { lat: 26.9124, lng: 75.7873 }, // Jaipur
        address: 'Sitapura Industrial Area, Jaipur, Rajasthan, 302022',
        contact: {
            phone: '+91-141-2345678',
            email: 'info@kei-ind.com',
            person: 'Ashok Sharma'
        },
        reliability_score: 8.4,
        past_deliveries: 54,
        average_delivery_days: 11
    },

    // Vendor 7: Safety Equipment
    {
        name: 'Lightning Protection Systems India',
        category: 'Safety Equipment',
        items_sold: ['Lightning Protection', 'Vibration Dampers', 'Spacer Dampers', 'Clamp Fittings'],
        location: { lat: 17.4065, lng: 78.4772 }, // Hyderabad
        address: 'Gachibowli, Hyderabad, Telangana, 500032',
        contact: {
            phone: '+91-40-44567890',
            email: 'safety@lpsindia.com',
            person: 'Venkat Rao'
        },
        reliability_score: 8.6,
        past_deliveries: 47,
        average_delivery_days: 12
    },
    {
        name: 'SafeGrid Solutions',
        category: 'Safety Equipment',
        items_sold: ['Lightning Protection Sets', 'Dampers', 'Safety Fittings'],
        location: { lat: 11.0168, lng: 76.9558 }, // Coimbatore
        address: 'Peelamedu, Coimbatore, Tamil Nadu, 641004',
        contact: {
            phone: '+91-422-2345678',
            email: 'contact@safegrid.in',
            person: 'Murugan S'
        },
        reliability_score: 8.3,
        past_deliveries: 41,
        average_delivery_days: 13
    }
];

// Seed function
const seedSuppliers = async () => {
    try {
        await connectDB();

        // Clear existing suppliers
        await Supplier.deleteMany({});
        console.log('Existing suppliers cleared');

        // Insert new suppliers
        const createdSuppliers = await Supplier.insertMany(suppliers);
        console.log(`${createdSuppliers.length} suppliers created successfully`);

        // Display summary by category
        const categories = [...new Set(suppliers.map(s => s.category))];
        console.log('\n=== Suppliers by Category ===');
        for (const category of categories) {
            const count = suppliers.filter(s => s.category === category).length;
            console.log(`${category}: ${count} suppliers`);
        }

        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Run the seed function
seedSuppliers();
