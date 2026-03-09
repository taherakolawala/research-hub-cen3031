import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import piRoutes from './routes/pis.js';
import positionRoutes from './routes/positions.js';
import applicationRoutes from './routes/applications.js';
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/pis', piRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/applications', applicationRoutes);
app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});
app.listen(PORT, () => {
    console.log(`ResearchHub server running on http://localhost:${PORT}`);
});
