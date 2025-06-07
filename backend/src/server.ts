import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json()); // Allows us to get data in req.body
app.use(cors()); // Enable CORS for all origins

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // Add user routes

// Define a simple root route
app.get('/', (req, res) => {
  res.send('AeroDoc Backend API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));