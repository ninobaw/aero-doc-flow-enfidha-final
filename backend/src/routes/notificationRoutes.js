const { Router } = require('express');
const { Notification } = require('../models/Notification.js');
const { sendSms } = require('../utils/smsSender.js'); // Import the new SMS sender utility
const { sendEmail } = require('../utils/emailSender.js'); // Import the new EMAIL sender utility
const { v4: uuidv4 } = require('uuid');

const router = Router();

// Helper function to create a notification (now also attempts to send SMS and Email)
const createNotification = async (userId, title, message, type = 'info') => {
  try {
    const newNotification = new Notification({
      _id: uuidv4(),
      userId,
      title,
      message,
      type,
      isRead: false,
    });
    await newNotification.save();
    console.log(`Notification created for user ${userId}: ${title}`);

    // Attempt to send SMS if it's a warning or error notification AND SMS is enabled
    if (type === 'warning' || type === 'error') {
      await sendSms(userId, `AeroDoc Alerte: ${title} - ${message}`);
    }

    // Attempt to send Email for all notification types if Email is enabled
    await sendEmail(userId, `AeroDoc Notification: ${title}`, message, `<p>${message}</p>`);

  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    // In a real app, you'd filter by userId from auth middleware
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    const formattedNotifications = notifications.map(notif => ({
      ...notif.toObject(),
      id: notif._id,
      is_read: notif.isRead,
      created_at: notif.createdAt.toISOString(),
      updated_at: notif.updatedAt.toISOString(),
    }));
    res.json(formattedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/notifications (for internal use, e.g., by other services/routes)
router.post('/', async (req, res) => {
  const { userId, title, message, type, isRead } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: 'Title and message are required' });
  }

  try {
    const newNotification = new Notification({
      _id: uuidv4(),
      userId,
      title,
      message,
      type: type || 'info',
      isRead: isRead || false,
    });

    await newNotification.save();

    // Attempt to send SMS if it's a warning or error notification AND SMS is enabled
    if (type === 'warning' || type === 'error') {
      await sendSms(userId, `AeroDoc Alerte: ${title} - ${message}`);
    }

    // Attempt to send Email for all notification types if Email is enabled
    await sendEmail(userId, `AeroDoc Notification: ${title}`, message, `<p>${message}</p>`);

    res.status(201).json({
      ...newNotification.toObject(),
      id: newNotification._id,
      is_read: newNotification.isRead,
      created_at: newNotification.createdAt.toISOString(),
      updated_at: newNotification.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/notifications/:id (Mark as read)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { is_read } = req.body; // Expecting is_read from frontend

  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: is_read },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({
      ...notification.toObject(),
      id: notification._id,
      is_read: notification.isRead,
      created_at: notification.createdAt.toISOString(),
      updated_at: notification.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/notifications/mark-all-read (Mark all as read for a user)
router.put('/mark-all-read', async (req, res) => {
  const { userId } = req.body; // Expecting userId from frontend (or auth middleware)

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required to mark all as read' });
  }

  try {
    await Notification.updateMany(
      { userId: userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = { router, createNotification }; // Export both router and createNotification