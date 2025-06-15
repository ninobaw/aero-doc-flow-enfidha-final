const { Router } = require('express');
const { Document } = require('../models/Document.js');
const { User } = require('../models/User.js');
const { Action } = require('../models/Action.js');
const { Correspondance } = require('../models/Correspondance.js'); // Import Correspondance model
const { ActivityLog } = require('../models/ActivityLog.js');

const router = Router();

// Helper to get dates for the last N months
const getLastNMonthsDates = (n) => {
  const dates = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    dates.push({
      yearMonth: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      monthName: date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' }),
    });
  }
  return dates;
};

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const { userId, userRole } = req.query;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let documentFilter = {};
    let actionFilter = {};
    let activityLogFilter = {};
    let correspondanceFilter = {}; // New filter for correspondences

    let calculatedActiveUsers = 0;
    let calculatedCompletedActions = 0;
    let calculatedPendingActions = 0;
    let calculatedAverageCompletionTime = 0;

    // Apply specific filters for 'AGENT_BUREAU_ORDRE' role
    if (userRole === 'AGENT_BUREAU_ORDRE') {
      documentFilter = {
        $or: [
          { type: 'CORRESPONDANCE' },
          { authorId: userId }
        ]
      };
      actionFilter = { assignedTo: userId };
      activityLogFilter = { userId: userId };
      correspondanceFilter = {
        $or: [
          { fromAddress: userId }, // Assuming userId can be an email or a user ID that matches fromAddress/toAddress
          { toAddress: userId },
          { authorId: userId } // If Correspondance also has an authorId
        ]
      };
      calculatedActiveUsers = 0; // Not relevant for this role
    } else {
      // Default filters for other roles (global view)
      documentFilter = {};
      actionFilter = {};
      activityLogFilter = {};
      correspondanceFilter = {};
      calculatedActiveUsers = await User.countDocuments({ isActive: true });
    }

    const [
      totalDocumentsCount,
      completedActionsCount,
      pendingActionsCount,
      documentsThisMonthCount,
      recentDocuments,
      urgentActions,
      activityLogs,
      completedActionsForAvgTime,
      documentsCreatedMonthlyRaw, // New: for chart
      documentsByTypeStatsRaw,    // New: for chart
      correspondencesCreatedMonthlyRaw, // New: for chart
      correspondencesByTypeStatsRaw,    // New: for chart
      correspondencesByPriorityStatsRaw // New: for chart
    ] = await Promise.all([
      Document.countDocuments(documentFilter),
      Action.countDocuments({ ...actionFilter, status: 'COMPLETED' }),
      Action.countDocuments({ ...actionFilter, status: 'PENDING' }),
      Document.countDocuments({ createdAt: { $gte: startOfMonth }, ...documentFilter }),
      Document.find(documentFilter).sort({ createdAt: -1 }).limit(3).populate('authorId', 'firstName lastName'),
      Action.find({ ...actionFilter, priority: 'URGENT', status: { $ne: 'COMPLETED' } }).sort({ dueDate: 1 }).limit(3).populate('assignedTo', 'firstName lastName'),
      ActivityLog.find(activityLogFilter).sort({ timestamp: -1 }).limit(4).populate('userId', 'firstName lastName'),
      Action.find({ ...actionFilter, status: 'COMPLETED', actualHours: { $exists: true, $ne: null } }),

      // New aggregation queries for charts
      Document.aggregate([
        { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }, ...documentFilter } }, // Last 6 months
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      Document.aggregate([
        { $match: documentFilter },
        { $group: { _id: "$type", count: { $sum: 1 } } }
      ]),
      Correspondance.aggregate([
        { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }, ...correspondanceFilter } }, // Last 6 months
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      Correspondance.aggregate([
        { $match: correspondanceFilter },
        { $group: { _id: "$type", count: { $sum: 1 } } }
      ]),
      Correspondance.aggregate([
        { $match: correspondanceFilter },
        { $group: { _id: "$priority", count: { $sum: 1 } } }
      ])
    ]);

    calculatedCompletedActions = completedActionsCount;
    calculatedPendingActions = pendingActionsCount;

    calculatedAverageCompletionTime = completedActionsForAvgTime.length > 0
      ? completedActionsForAvgTime.reduce((acc, action) => acc + (action.actualHours || 0), 0) / completedActionsForAvgTime.length
      : 0;

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
      priority: 'medium',
    }));

    // Format data for charts
    const last6Months = getLastNMonthsDates(6);

    const documentsCreatedMonthly = last6Months.map(month => {
      const found = documentsCreatedMonthlyRaw.find(d => d._id.year === new Date(month.yearMonth).getFullYear() && d._id.month === new Date(month.yearMonth).getMonth() + 1);
      return { name: month.monthName, count: found ? found.count : 0 };
    });

    const documentsByTypeStats = documentsByTypeStatsRaw.map(d => ({ name: d._id, value: d.count }));

    const correspondencesCreatedMonthly = last6Months.map(month => {
      const found = correspondencesCreatedMonthlyRaw.find(d => d._id.year === new Date(month.yearMonth).getFullYear() && d._id.month === new Date(month.yearMonth).getMonth() + 1);
      return { name: month.monthName, count: found ? found.count : 0 };
    });

    const correspondencesByTypeStats = correspondencesByTypeStatsRaw.map(d => ({ name: d._id, value: d.count }));
    const correspondencesByPriorityStats = correspondencesByPriorityStatsRaw.map(d => ({ name: d._id, value: d.count }));

    res.json({
      totalDocuments: totalDocumentsCount,
      activeUsers: calculatedActiveUsers,
      completedActions: calculatedCompletedActions,
      pendingActions: calculatedPendingActions,
      documentsThisMonth: documentsThisMonthCount,
      averageCompletionTime: parseFloat(calculatedAverageCompletionTime.toFixed(1)),
      recentDocuments: formattedRecentDocuments,
      urgentActions: formattedUrgentActions,
      activityLogs: formattedActivityLogs,
      documentsCreatedMonthly, // New
      documentsByTypeStats,    // New
      correspondencesCreatedMonthly, // New
      correspondencesByTypeStats,    // New
      correspondencesByPriorityStats // New
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

module.exports = router;