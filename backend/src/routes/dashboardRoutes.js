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

    let calculatedActiveUsers = 0; // Default to 0 for specific roles if not globally relevant
    let calculatedCompletedActions = 0;
    let calculatedPendingActions = 0;
    let calculatedAverageCompletionTime = 0;

    // Base filters for all roles
    let baseActionFilter = {};

    // Apply specific filters for 'AGENT_BUREAU_ORDRE' role
    if (userRole === 'AGENT_BUREAU_ORDRE') {
      documentFilter = {
        $or: [
          { type: 'CORRESPONDANCE' },
          { authorId: userId }
        ]
      };
      baseActionFilter = { assignedTo: userId }; // Actions assigned to this specific user
      activityLogFilter = { userId: userId }; // Activity logs for this specific user

      // For Agent Bureau d'Ordre, activeUsers is not a relevant metric, set to 0
      calculatedActiveUsers = 0;

    } else {
      // Default filters for other roles (global view)
      documentFilter = {}; // All documents
      baseActionFilter = {}; // All actions
      activityLogFilter = {}; // All activity logs

      // For other roles, calculate active users globally
      calculatedActiveUsers = await User.countDocuments({ isActive: true });
    }

    // Fetch data concurrently based on the determined filters
    const [
      totalDocumentsCount,
      completedActionsCount,
      pendingActionsCount,
      documentsThisMonthCount,
      recentDocuments,
      urgentActions,
      activityLogs,
      completedActionsForAvgTime // Separate query for average time calculation
    ] = await Promise.all([
      Document.countDocuments(documentFilter),
      Action.countDocuments({ ...baseActionFilter, status: 'COMPLETED' }), // Filter completed actions by role
      Action.countDocuments({ ...baseActionFilter, status: 'PENDING' }),   // Filter pending actions by role
      Document.countDocuments({ createdAt: { $gte: startOfMonth }, ...documentFilter }),
      Document.find(documentFilter).sort({ createdAt: -1 }).limit(3).populate('authorId', 'firstName lastName'),
      Action.find({ ...baseActionFilter, priority: 'URGENT', status: { $ne: 'COMPLETED' } }).sort({ dueDate: 1 }).limit(3).populate('assignedTo', 'firstName lastName'),
      ActivityLog.find(activityLogFilter).sort({ timestamp: -1 }).limit(4).populate('userId', 'firstName lastName'),
      Action.find({ ...baseActionFilter, status: 'COMPLETED', actualHours: { $exists: true, $ne: null } }) // Filter for average time
    ]);

    calculatedCompletedActions = completedActionsCount;
    calculatedPendingActions = pendingActionsCount;

    calculatedAverageCompletionTime = completedActionsForAvgTime.length > 0
      ? completedActionsForAvgTime.reduce((acc, action) => acc + (action.actualHours || 0), 0) / completedActionsForAvgTime.length
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
      totalDocuments: totalDocumentsCount,
      activeUsers: calculatedActiveUsers, // Use the calculated value
      completedActions: calculatedCompletedActions, // Use the calculated value
      pendingActions: calculatedPendingActions,     // Use the calculated value
      documentsThisMonth: documentsThisMonthCount,
      averageCompletionTime: parseFloat(calculatedAverageCompletionTime.toFixed(1)), // Use the calculated value
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