const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db.js'); // Added .js
const authRoutes = require('./routes/authRoutes.js'); // Added .js
const userRoutes = require('./routes/userRoutes.js'); // Added .js
const documentRoutes = require('./routes/documentRoutes.js'); // Added .js
const formulaireRoutes = require('./routes/formulaireRoutes.js'); // Added .js
const actionRoutes = require('./routes/actionRoutes.js'); // Added .js
const correspondanceRoutes = require('./routes/correspondanceRoutes.js'); // Added .js
const procesVerbalRoutes = require('./routes/procesVerbalRoutes.js'); // Added .js
const reportRoutes = require('./routes/reportRoutes.js'); // Added .js
const notificationRoutes = require('./routes/notificationRoutes.js'); // Added .js
const appSettingsRoutes = require('./routes/appSettingsRoutes.js'); // Added .js
const activityLogRoutes = require('./routes/activityLogRoutes.js'); // Added .js

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
app.use('/api/actions', actionRoutes);
app.use('/api/correspondances', correspondanceRoutes);
app.use('/api/proces-verbaux', procesVerbalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', appSettingsRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// Define a simple root route
app.get('/', (req, res) => {
  res.send('AeroDoc Backend API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));