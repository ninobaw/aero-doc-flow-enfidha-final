const { Router } = require('express');
const { User } = require('../models/User.js'); // Changed to require with .js extension
const { v4: uuidv4 } = require('uuid'); // uuid is a CommonJS module, no change needed here
const bcrypt = require('bcryptjs'); // Changed to require

const router = Router();

// Helper to format user object for consistent frontend consumption
const formatUserResponse = (userDoc) => {
  const userObject = userDoc.toObject();
  delete userObject.password; // Ensure password is never sent
  userObject.id = userObject._id; // Explicitly map _id to id
  return userObject;
};

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    const formattedUsers = users.map(user => formatUserResponse(user));
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
    res.json(formatUserResponse(user));
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
    
    res.status(201).json(formatUserResponse(newUser));
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
    res.json(formatUserResponse(user));
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/:id (soft delete by setting isActive to false)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deactivated successfully', user: formatUserResponse(user) });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;