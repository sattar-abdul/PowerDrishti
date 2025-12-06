import express, { json, urlencoded } from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import dotenv from "dotenv"
import { authrouter } from './routes/authRoutes.js';
import { ProjectRouter } from './routes/projectRoutes.js';
import { InventoryRouter } from './routes/inventoryRoutes.js';
import { BOQRouter } from './routes/boqRoutes.js';
import { ProcurementRouter } from './routes/procurementRoutes.js';
import { TrackingRouter } from './routes/trackingRoutes.js';
import SupplierRouter from './routes/supplierRoutes.js';

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
app.use('/api/boq', BOQRouter);
app.use('/api/procurement', ProcurementRouter);
app.use('/api/tracking', TrackingRouter);
app.use('/api/suppliers', SupplierRouter);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/', (req, res) => {
    res.send("Backend of PowerDrishti AI");
})

app.listen(port, () => console.log(`Server started on port ${port}`));
