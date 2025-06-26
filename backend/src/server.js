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
const { router: notificationRouter } = require('./routes/notificationRoutes.js');
const appSettingsRoutes = require('./routes/appSettingsRoutes.js');
const activityLogRoutes = require('./routes/activityLogRoutes.js');
const documentCodeConfigRoutes = require('./routes/documentCodeConfigRoutes.js');
const uploadRoutes = require('./routes/uploadRoutes.js');
const dashboardRoutes = require('./routes/dashboardRoutes.js');
const onlyofficeRoutes = require('./routes/onlyofficeRoutes.js'); // Réactivé OnlyOffice routes
const path = require('path');

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
app.use('/api/notifications', notificationRouter);
app.use('/api/settings', appSettingsRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/document-code-config', documentCodeConfigRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/onlyoffice', onlyofficeRoutes); // Réactivé OnlyOffice routes

// Define a simple root route
app.get('/', (req, res) => {
  res.send('AeroDoc Backend API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT} and accessible on all network interfaces`));