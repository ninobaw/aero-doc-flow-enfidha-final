import { Router } from 'express';
import { Report } from '../models/Report';
import { Document } from '../models/Document';
import { User } from '../models/User';
import { Action } from '../models/Action';
import { Correspondance } from '../models/Correspondance';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Helper function to generate report content based on type
const generateReportContent = async (type: string, config: Record<string, any>) => {
  let reportContent: Record<string, any> = {};

  try {
    switch (type) {
      case 'DOCUMENT_USAGE':
        const documentsData = await Document.find({});
        reportContent = {
          totalDocuments: documentsData?.length || 0,
          documentsByType: documentsData?.reduce((acc: any, doc: any) => {
            acc[doc.type] = (acc[doc.type] || 0) + 1;
            return acc;
          }, {}) || {},
          documentsByAirport: documentsData?.reduce((acc: any, doc: any) => {
            acc[doc.airport] = (acc[doc.airport] || 0) + 1;
            return acc;
          }, {}) || {},
          totalViews: documentsData?.reduce((sum: number, doc: any) => sum + (doc.viewsCount || 0), 0) || 0,
          totalDownloads: documentsData?.reduce((sum: number, doc: any) => sum + (doc.downloadsCount || 0), 0) || 0,
        };
        break;

      case 'USER_ACTIVITY':
        const usersData = await User.find({});
        reportContent = {
          totalUsers: usersData?.length || 0,
          activeUsers: usersData?.filter((user: any) => user.isActive).length || 0,
          usersByRole: usersData?.reduce((acc: any, user: any) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          }, {}) || {},
          usersByAirport: usersData?.reduce((acc: any, user: any) => {
            acc[user.airport] = (acc[user.airport] || 0) + 1;
            return acc;
          }, {}) || {},
        };
        break;

      case 'ACTION_STATUS':
        const actionsData = await Action.find({});
        reportContent = {
          totalActions: actionsData?.length || 0,
          actionsByStatus: actionsData?.reduce((acc: any, action: any) => {
            acc[action.status] = (acc[action.status] || 0) + 1;
            return acc;
          }, {}) || {},
          actionsByPriority: actionsData?.reduce((acc: any, action: any) => {
            acc[action.priority] = (acc[action.priority] || 0) + 1;
            return acc;
          }, {}) || {},
          averageProgress: actionsData?.reduce((sum: number, action: any) => sum + (action.progress || 0), 0) / (actionsData?.length || 1) || 0,
        };
        break;

      case 'PERFORMANCE':
        const [documentsRes, actionsRes, correspondancesRes] = await Promise.all([
          Document.find({}),
          Action.find({}),
          Correspondance.find({})
        ]);

        const documents = documentsRes || [];
        const actions = actionsRes || [];
        const correspondances = correspondancesRes || [];

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        reportContent = {
          productivity: {
            documentsCreatedThisMonth: documents.filter((doc: any) => 
              doc.createdAt.getMonth() === currentMonth && doc.createdAt.getFullYear() === currentYear
            ).length,
            actionsCompletedThisMonth: actions.filter((action: any) => 
              action.status === 'COMPLETED' &&
              action.createdAt.getMonth() === currentMonth && action.createdAt.getFullYear() === currentYear
            ).length,
            correspondancesSentThisMonth: correspondances.filter((corr: any) => 
              corr.createdAt.getMonth() === currentMonth && corr.createdAt.getFullYear() === currentYear
            ).length,
          },
          efficiency: {
            totalActions: actions.length,
            completedActions: actions.filter((action: any) => action.status === 'COMPLETED').length,
            overdueActions: actions.filter((action: any) => 
              action.status !== 'COMPLETED' && action.dueDate < now
            ).length,
          }
        };
        break;

      default:
        reportContent = { message: 'Type de rapport non supporté' };
    }

    return reportContent;
  } catch (error) {
    console.error('Error generating report data:', error);
    return { error: 'Error generating report data' };
  }
};

// GET /api/reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find({}).populate('createdBy', 'firstName lastName');
    const formattedReports = reports.map(report => ({
      ...report.toObject(),
      id: report._id,
      created_by: report.createdBy ? {
        first_name: (report.createdBy as any).firstName,
        last_name: (report.createdBy as any).lastName,
      } : null,
      last_generated: report.lastGenerated?.toISOString(), // Ensure date is ISO string
    }));
    res.json(formattedReports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/reports
router.post('/', async (req, res) => {
  const { name, type, config, frequency, created_by } = req.body;

  if (!name || !type || !created_by) {
    return res.status(400).json({ message: 'Missing required fields for report' });
  }

  try {
    const content = await generateReportContent(type, config || {});

    const newReport = new Report({
      _id: uuidv4(),
      name,
      type,
      config: config || {},
      content,
      status: 'COMPLETED', // Reports are generated immediately upon creation
      frequency,
      lastGenerated: new Date(),
      createdBy: created_by,
    });

    await newReport.save();
    
    const populatedReport = await newReport.populate('createdBy', 'firstName lastName');
    const formattedReport = {
      ...populatedReport.toObject(),
      id: populatedReport._id,
      created_by: populatedReport.createdBy ? {
        first_name: (populatedReport.createdBy as any).firstName,
        last_name: (populatedReport.createdBy as any).lastName,
      } : null,
      last_generated: populatedReport.lastGenerated?.toISOString(),
    };
    res.status(201).json(formattedReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/reports/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const report = await Report.findByIdAndDelete(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;