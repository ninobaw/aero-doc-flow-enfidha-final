const { Router } = require('express');
const { User } = require('../models/User.js'); // Changed to require with .js extension
const { AppSettings } = require('../models/AppSettings.js'); // Import AppSettings model
const { v4: uuidv4 } = require('uuid'); // uuid is a CommonJS module, no change needed here
const bcrypt = require('bcryptjs'); // Changed to require

const router = Router();

// Helper to format user object for consistent frontend consumption
const formatUserResponse = async (userDoc) => { // Made async to fetch AppSettings
  const userObject = userDoc.toObject();
  delete userObject.password; // Ensure password is never sent
  userObject.id = userObject._id; // Explicitly map _id to id

  // Fetch user-specific app settings to get sessionTimeout
  const userSettings = await AppSettings.findOne({ userId: userDoc._id });
  userObject.sessionTimeout = userSettings ? userSettings.sessionTimeout : 60; // Default to 60 minutes

  return userObject;
};

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    // Use Promise.all to await all formatUserResponse calls
    const formattedUsers = await Promise.all(users.map(user => formatUserResponse(user)));
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Use the async formatUserResponse helper
    res.json(await formatUserResponse(user));
  } catch (error) {
    console.error('Error fetching single user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users
router.post('/', async (req, res) => {
  const { email, firstName, lastName, role, airport, phone, department, password } = req.body;

  if (!email || !firstName || !lastName || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      _id: uuidv4(),
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role,
      airport,
      phone,
      department,
      isActive: true,
    });

    await newUser.save();
    
    // When creating a new user, also create default AppSettings for them
    const defaultAppSettings = {
      _id: uuidv4(),
      userId: newUser._id,
      companyName: 'AeroDoc - Gestion Documentaire',
      defaultAirport: newUser.airport,
      language: 'fr',
      theme: 'light',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      sessionTimeout: 60, // Default session timeout for new users
      requireTwoFactor: false,
      passwordExpiry: 90,
      documentRetention: 365,
      autoArchive: true,
      maxFileSize: 10,
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      useSsl: true,
      twilioAccountSid: '',
      twilioAuthToken: '',
      twilioPhoneNumber: '',
    };
    await AppSettings.create(defaultAppSettings);

    res.status(201).json(await formatUserResponse(newUser)); // Use async helper
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(await formatUserResponse(user)); // Use async helper
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/:id/change-password
router.put('/:id/change-password', async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required.' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error during password change.' });
  }
});


// DELETE /api/users/:id (now performs a hard delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id); // Changed to findByIdAndDelete
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(204).send(); // 204 No Content for successful deletion
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;