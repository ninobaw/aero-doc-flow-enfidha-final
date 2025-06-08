const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db.js');
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const documentRoutes = require('./routes/documentRoutes.js');
const formulaireRoutes = require('./routes/formulaireRoutes.js');
const actionRoutes = require('./routes/actionRoutes.js');
const correspondanceRoutes = require('./routes/correspondanceRoutes.js');
const procesVerbalRoutes = require('./routes/procesVerbalRoutes.js');
const reportRoutes = require('./routes/reportRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');
const appSettingsRoutes = require('./routes/appSettingsRoutes.js');
const activityLogRoutes = require('./routes/activityLogRoutes.js');
const documentCodeConfigRoutes = require('./routes/documentCodeConfigRoutes.js');
const uploadRoutes = require('./routes/uploadRoutes.js'); // New import
const path = require('path'); // New import

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json()); // Allows us to get data in req.body
app.use(cors()); // Enable CORS for all origins

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/document-code-config', documentCodeConfigRoutes);
app.use('/api/uploads', uploadRoutes); // New route for file uploads

// Define a simple root route
app.get('/', (req, res) => {
  res.send('AeroDoc Backend API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));