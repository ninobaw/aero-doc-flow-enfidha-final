const { Router } = require('express');
const { Action } = require('../models/Action.js'); // Changed to .js extension
const { Document } = require('../models/Document.js'); // Changed to .js extension
const { Notification } = require('../models/Notification.js'); // Import Notification model
const { User } = require('../models/User.js'); // Import User model to get user email for notifications
const { v4: uuidv4 } = require('uuid');

const router = Router();

// Helper function to create a notification (copied from notificationRoutes for local use)
const createNotification = async (userId, title, message, type = 'info') => {
  console.log(`[createNotification] Fonction appelée pour userId: ${userId}, Titre: ${title}`); // NOUVEAU LOG DE TEST
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
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// GET /api/actions
router.get('/', async (req, res) => {
  try {
    const actions = await Action.find({}).populate('parentDocumentId', 'title type'); // Populate parent document details
    const formattedActions = actions.map(action => ({
      ...action.toObject(),
      id: action._id,
      document: action.parentDocumentId ? {
        title: action.parentDocumentId.title,
        type: action.parentDocumentId.type,
      } : null,
    }));
    res.json(formattedActions);
  } catch (error) {
    console.error('Error fetching actions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/actions
router.post('/', async (req, res) => {
  const { title, description, assigned_to, due_date, priority, parent_document_id, estimated_hours } = req.body;

  if (!title || !due_date || !assigned_to) {
    return res.status(400).json({ message: 'Missing required fields: title, due_date, assigned_to' });
  }

  try {
    const newAction = new Action({
      _id: uuidv4(),
      title,
      description,
      assignedTo: assigned_to,
      dueDate: new Date(due_date),
      priority,
      parentDocumentId: parent_document_id,
      progress: 0, // Default progress
      estimatedHours: estimated_hours,
      status: 'PENDING', // Default status
    });

    await newAction.save();
    
    const populatedAction = await newAction.populate('parentDocumentId', 'title type');
    const formattedAction = {
      ...populatedAction.toObject(),
      id: populatedAction._id,
      document: populatedAction.parentDocumentId ? {
        title: populatedAction.parentDocumentId.title,
        type: populatedAction.parentDocumentId.type,
      } : null,
    };

    // --- Notifications for new action ---
    await createNotification(populatedAction.authorId, 'Nouvelle action créée', `L'action "${title}" a été créée.`);
    if (assigned_to && assigned_to.length > 0) {
      for (const assigneeId of assigned_to) {
        await createNotification(assigneeId, 'Nouvelle action assignée', `Une nouvelle action "${title}" vous a été assignée.`);
      }
    }
    // --- End Notifications ---

    res.status(201).json(formattedAction);
  } catch (error) {
    console.error('Error creating action:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/actions/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Convert due_date to Date object if present
  if (updates.due_date) {
    updates.dueDate = new Date(updates.due_date);
    delete updates.due_date; // Remove original field name
  }
  // Convert assigned_to to assignedTo if present
  if (updates.assigned_to) {
    updates.assignedTo = updates.assigned_to;
    delete updates.assigned_to;
  }
  // Convert parent_document_id to parentDocumentId if present
  if (updates.parent_document_id) {
    updates.parentDocumentId = updates.parent_document_id;
    delete updates.parent_document_id;
  }
  // Convert estimated_hours to estimatedHours if present
  if (updates.estimated_hours) {
    updates.estimatedHours = updates.estimated_hours;
    delete updates.estimated_hours;
  }
  // Convert actual_hours to actualHours if present
  if (updates.actual_hours) {
    updates.actualHours = updates.actual_hours;
    delete updates.actual_hours;
  }

  try {
    const oldAction = await Action.findById(id);
    if (!oldAction) {
      return res.status(404).json({ message: 'Action not found' });
    }

    const action = await Action.findByIdAndUpdate(id, updates, { new: true }).populate('parentDocumentId', 'title type');
    if (!action) {
      return res.status(404).json({ message: 'Action not found' });
    }
    const formattedAction = {
      ...action.toObject(),
      id: action._id,
      document: action.parentDocumentId ? {
        title: action.parentDocumentId.title,
        type: action.parentDocumentId.type,
      } : null,
    };

    // --- Notifications for updated action ---
    const changedFields = Object.keys(updates).filter(key => 
      JSON.stringify(updates[key]) !== JSON.stringify(oldAction.toObject()[key])
    );

    if (changedFields.length > 0) {
      // Notify assigned users if assignment changed
      const oldAssignedTo = new Set(oldAction.assignedTo.map(String));
      const newAssignedTo = new Set(action.assignedTo.map(String));

      const addedAssignees = [...newAssignedTo].filter(id => !oldAssignedTo.has(id));
      const removedAssignees = [...oldAssignedTo].filter(id => !newAssignedTo.has(id));

      for (const assigneeId of addedAssignees) {
        await createNotification(assigneeId, 'Action assignée', `L'action "${action.title}" vous a été assignée.`);
      }
      for (const assigneeId of removedAssignees) {
        await createNotification(assigneeId, 'Action désassignée', `L'action "${action.title}" vous a été désassignée.`);
      }

      // Notify if status changed to COMPLETED
      if (oldAction.status !== 'COMPLETED' && action.status === 'COMPLETED') {
        for (const assigneeId of action.assignedTo) {
          await createNotification(assigneeId, 'Action terminée', `L'action "${action.title}" a été marquée comme terminée.`);
        }
      } else if (oldAction.status === 'COMPLETED' && action.status !== 'COMPLETED') {
        // Notify if status changed from COMPLETED
        for (const assigneeId of action.assignedTo) {
          await createNotification(assigneeId, 'Action réouverte', `L'action "${action.title}" a été réouverte.`);
        }
      }
      // General update notification for assigned users
      for (const assigneeId of action.assignedTo) {
        await createNotification(assigneeId, 'Action mise à jour', `L'action "${action.title}" a été mise à jour. Champs modifiés: ${changedFields.join(', ')}.`);
      }
    }
    // --- End Notifications ---

    res.json(formattedAction);
  } catch (error) {
    console.error('Error updating action:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/actions/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const action = await Action.findByIdAndDelete(id);
    if (!action) {
      return res.status(404).json({ message: 'Action not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting action:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;