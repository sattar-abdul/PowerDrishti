import express, { json, urlencoded } from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import dotenv from "dotenv"
import { authrouter } from './routes/authRoutes.js';
import { ProjectRouter } from './routes/projectRoutes.js';
import { InventoryRouter } from './routes/inventoryRoutes.js';

dotenv.config()

const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));

app.use('/api/auth', authrouter);
app.use('/api/projects', ProjectRouter);
app.use('/api/inventory', InventoryRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/', (req, res) => {
    res.send("Backend of PowerDrishti AI");
})

app.listen(port, () => console.log(`Server started on port ${port}`));
