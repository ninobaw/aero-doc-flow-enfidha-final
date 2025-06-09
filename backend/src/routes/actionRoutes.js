const { Router } = require('express');
const { Action } = require('../models/Action.js'); // Changed to .js extension
const { Document } = require('../models/Document.js'); // Changed to .js extension
const { v4: uuidv4 } = require('uuid');

const router = Router();

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