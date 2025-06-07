import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import documentRoutes from './routes/documentRoutes';
import formulaireRoutes from './routes/formulaireRoutes';
import actionRoutes from './routes/actionRoutes'; // New import
import correspondanceRoutes from './routes/correspondanceRoutes'; // New import
import procesVerbalRoutes from './routes/procesVerbalRoutes'; // New import
import reportRoutes from './routes/reportRoutes'; // New import
import notificationRoutes from './routes/notificationRoutes'; // New import
import appSettingsRoutes from './routes/appSettingsRoutes'; // New import
import activityLogRoutes from './routes/activityLogRoutes'; // New import

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json()); // Allows us to get data in req.body
app.use(cors()); // Enable CORS for all origins

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/formulaires', formulaireRoutes);
app.use('/api/actions', actionRoutes); // Use action routes
app.use('/api/correspondances', correspondanceRoutes); // Use correspondance routes
app.use('/api/proces-verbaux', procesVerbalRoutes); // Use proces verbal routes
app.use('/api/reports', reportRoutes); // Use report routes
app.use('/api/notifications', notificationRoutes); // Use notification routes
app.use('/api/settings', appSettingsRoutes); // Use app settings routes
app.use('/api/activity-logs', activityLogRoutes); // Use activity log routes

// Define a simple root route
app.get('/', (req, res) => {
  res.send('AeroDoc Backend API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));