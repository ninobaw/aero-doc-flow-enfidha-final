const { Router } = require('express');
const { Document } = require('../models/Document.js');
const { User } = require('../models/User.js');
const { Action } = require('../models/Action.js');
const { ActivityLog } = require('../models/ActivityLog.js');

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const { userId, userRole } = req.query; // Get userId and userRole from query parameters
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let documentFilter = {};
    let actionFilter = {};
    let activityLogFilter = {};

    // Apply specific filters for 'AGENT_BUREAU_ORDRE' role
    if (userRole === 'AGENT_BUREAU_ORDRE') {
      // For Agent Bureau d'Ordre:
      // Recent Documents: Only correspondences OR documents created by this user
      documentFilter = {
        $or: [
          { type: 'CORRESPONDANCE' },
          { authorId: userId }
        ]
      };
      // Urgent Actions: Only actions assigned to this user
      actionFilter = {
        assignedTo: userId,
        priority: 'URGENT',
        status: { $ne: 'COMPLETED' }
      };
      // Activity Logs: Only logs related to this user
      activityLogFilter = { userId: userId };
    } else {
      // Default filters for other roles (or if no specific role filter is needed)
      actionFilter = { priority: 'URGENT', status: { $ne: 'COMPLETED' } };
    }

    // Fetch all data concurrently
    const [
      totalDocuments,
      activeUsers,
      completedActions,
      pendingActions,
      documentsThisMonth,
      recentDocuments,
      urgentActions,
      activityLogs
    ] = await Promise.all([
      Document.countDocuments(documentFilter), // Apply document filter
      User.countDocuments({ isActive: true }),
      Action.countDocuments({ status: 'COMPLETED' }),
      Action.countDocuments({ status: 'PENDING' }),
      Document.countDocuments({ createdAt: { $gte: startOfMonth }, ...documentFilter }), // Apply document filter
      Document.find(documentFilter).sort({ createdAt: -1 }).limit(3).populate('authorId', 'firstName lastName'), // Apply document filter
      Action.find(actionFilter).sort({ dueDate: 1 }).limit(3).populate('assignedTo', 'firstName lastName'), // Apply action filter
      ActivityLog.find(activityLogFilter).sort({ timestamp: -1 }).limit(4).populate('userId', 'firstName lastName'), // Apply activity log filter
    ]);

    // Calculate average completion time for actions
    const completedActionsWithTime = await Action.find({ status: 'COMPLETED', actualHours: { $exists: true, $ne: null } });
    const averageCompletionTime = completedActionsWithTime.length > 0
      ? completedActionsWithTime.reduce((acc, action) => acc + (action.actualHours || 0), 0) / completedActionsWithTime.length
      : 0;

    // Format recent documents and urgent actions for frontend
    const formattedRecentDocuments = recentDocuments.map(doc => ({
      id: doc._id,
      title: doc.title,
      type: doc.type,
      airport: doc.airport,
      status: doc.status,
      created_at: doc.createdAt.toISOString(),
      author: doc.authorId ? {
        first_name: doc.authorId.firstName,
        last_name: doc.authorId.lastName,
      } : null,
    }));

    const formattedUrgentActions = urgentActions.map(action => ({
      id: action._id,
      title: action.title,
      priority: action.priority,
      due_date: action.dueDate.toISOString(),
      assigned_to: action.assignedTo.map(user => `${user.firstName} ${user.lastName}`),
    }));

    const formattedActivityLogs = activityLogs.map(log => ({
      id: log._id,
      type: log.action,
      title: log.action.replace(/_/g, ' ').toUpperCase(),
      description: log.details,
      user: log.userId ? {
        name: `${log.userId.firstName} ${log.userId.lastName}`,
        initials: `${log.userId.firstName?.[0] || ''}${log.userId.lastName?.[0] || ''}`,
      } : { name: 'Utilisateur Inconnu', initials: 'UI' },
      timestamp: log.timestamp.toISOString(),
      priority: 'medium', // Defaulting priority for activity logs
    }));

    res.json({
      totalDocuments,
      activeUsers,
      completedActions,
      pendingActions,
      documentsThisMonth,
      averageCompletionTime: parseFloat(averageCompletionTime.toFixed(1)),
      recentDocuments: formattedRecentDocuments,
      urgentActions: formattedUrgentActions,
      activityLogs: formattedActivityLogs,
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

module.exports = router;