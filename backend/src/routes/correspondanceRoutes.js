const { Router } = require('express');
const { Correspondance } = require('../models/Correspondance.js');
const { Document } = require('../models/Document.js'); // To populate parent document details
const { Notification } = require('../models/Notification.js'); // Import Notification model
const { User } = require('../models/User.js'); // Import User model to find users for notifications
const { v4: uuidv4 } = require('uuid');

const router = Router();

// Helper function to create a notification
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
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// GET /api/correspondances
router.get('/', async (req, res) => {
  try {
    const correspondances = await Correspondance.find({})
      .populate({
        path: 'documentId',
        select: 'title authorId', // Select fields from the Document
        populate: {
          path: 'authorId',
          model: 'User',
          select: 'firstName lastName' // Select fields from the User
        }
      });
    const formattedCorrespondances = correspondances.map(corr => ({
      ...corr.toObject(),
      id: corr._id,
      document: corr.documentId ? {
        title: (corr.documentId).title,
        author: (corr.documentId).authorId ? {
          first_name: ((corr.documentId).authorId).firstName,
          last_name: ((corr.documentId).authorId).lastName,
        } : null,
      } : null,
      // Ensure actions_decidees is mapped correctly if needed by frontend
      actions_decidees: corr.actionsDecidees,
      tags: corr.tags, // Include tags
      type: corr.type, // Include type
      code: corr.code, // Include code
      file_path: corr.filePath, // Include filePath
      file_type: corr.fileType, // Include fileType
    }));
    res.json(formattedCorrespondances);
  } catch (error) {
    console.error('Error fetching correspondances:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/correspondances
router.post('/', async (req, res) => {
  const { title, from_address, to_address, subject, content, priority, airport, attachments, actions_decidees, author_id, tags, type, code, file_path, file_type } = req.body;

  if (!title || !from_address || !to_address || !subject || !airport || !author_id || !type) {
    return res.status(400).json({ message: 'Missing required fields for correspondence: title, from_address, to_address, subject, airport, author_id, type' });
  }

  try {
    // First, create the associated Document
    const newDocument = new Document({
      _id: uuidv4(),
      title,
      type: 'CORRESPONDANCE', // Document type is always CORRESPONDANCE for this route
      content,
      authorId: author_id,
      airport,
      qrCode: `QR-${uuidv4()}`,
      version: 1,
      status: 'DRAFT',
      viewsCount: 0,
      downloadsCount: 0,
      filePath: file_path, // Pass file path to document
      fileType: file_type, // Pass file type to document
    });
    await newDocument.save();

    const newCorrespondance = new Correspondance({
      _id: uuidv4(),
      documentId: newDocument._id,
      type, // Save type
      code, // Save code
      fromAddress: from_address,
      toAddress: to_address,
      subject,
      content,
      priority,
      status: 'DRAFT', // Default status
      airport,
      attachments: attachments || [],
      actionsDecidees: actions_decidees || [],
      tags: tags || [], // Save tags
      filePath: file_path, // Save file path to correspondence
      fileType: file_type, // Save file type to correspondence
    });

    await newCorrespondance.save();
    
    const populatedCorrespondance = await newCorrespondance
      .populate({
        path: 'documentId',
        select: 'title authorId',
        populate: {
          path: 'authorId',
          model: 'User',
          select: 'firstName lastName'
        }
      });

    const formattedCorrespondance = {
      ...populatedCorrespondance.toObject(),
      id: populatedCorrespondance._id,
      document: populatedCorrespondance.documentId ? {
        title: (populatedCorrespondance.documentId).title,
        author: (populatedCorrespondance.documentId).authorId ? {
          first_name: ((populatedCorrespondance.documentId).authorId).firstName,
          last_name: ((populatedCorrespondance.documentId).authorId).lastName,
        } : null,
      } : null,
      actions_decidees: populatedCorrespondance.actionsDecidees,
      tags: populatedCorrespondance.tags,
      type: populatedCorrespondance.type,
      code: populatedCorrespondance.code,
      file_path: populatedCorrespondance.filePath,
      file_type: populatedCorrespondance.fileType,
    };

    // --- Notifications for new correspondence ---
    // Notify the author
    await createNotification(author_id, 'Nouvelle correspondance créée', `Votre correspondance "${subject}" a été créée.`);
    
    // Attempt to notify recipients if they are users in the system (by email)
    const recipientUser = await User.findOne({ email: to_address });
    if (recipientUser) {
      await createNotification(recipientUser._id, 'Nouvelle correspondance reçue', `Vous avez reçu une nouvelle correspondance: "${subject}".`);
    }

    // Notify responsible parties for decided actions
    if (actions_decidees && actions_decidees.length > 0) {
      for (const action of actions_decidees) {
        // Ensure action.responsable is an array and has elements
        if (Array.isArray(action.responsable) && action.responsable.length > 0) {
          // Assuming the first responsible is the primary one to notify
          await createNotification(action.responsable[0], 'Nouvelle action assignée', `Une action "${action.titre}" de la correspondance "${subject}" vous a été assignée.`);
        }
      }
    }
    // --- End Notifications ---

    res.status(201).json(formattedCorrespondance);
  } catch (error) {
    console.error('Error creating correspondence:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// PUT /api/correspondances/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Map frontend field names to backend schema names
  if (updates.from_address) { updates.fromAddress = updates.from_address; delete updates.from_address; }
  if (updates.to_address) { updates.toAddress = updates.to_address; delete updates.to_address; }
  if (updates.actions_decidees) { updates.actionsDecidees = updates.actions_decidees; delete updates.actions_decidees; }
  if (updates.tags) { updates.tags = updates.tags; } // Handle tags update
  if (updates.type) { updates.type = updates.type; } // Handle type update
  if (updates.code) { updates.code = updates.code; } // Handle code update
  if (updates.file_path) { updates.filePath = updates.file_path; delete updates.file_path; } // Handle filePath update
  if (updates.file_type) { updates.fileType = updates.file_type; delete updates.file_type; } // Handle fileType update


  try {
    const oldCorrespondance = await Correspondance.findById(id);
    if (!oldCorrespondance) {
      return res.status(404).json({ message: 'Correspondance not found' });
    }

    const correspondance = await Correspondance.findByIdAndUpdate(id, updates, { new: true })
      .populate({
        path: 'documentId',
        select: 'title authorId',
        populate: {
          path: 'authorId',
          model: 'User',
          select: 'firstName lastName'
        }
      });
    if (!correspondance) {
      return res.status(404).json({ message: 'Correspondance not found' });
    }

    // Update the associated Document if file path/type changed
    if (updates.filePath !== undefined || updates.fileType !== undefined) {
      await Document.findByIdAndUpdate(correspondance.documentId, {
        filePath: updates.filePath,
        fileType: updates.fileType,
      });
    }

    const formattedCorrespondance = {
      ...correspondance.toObject(),
      id: correspondance._id,
      document: correspondance.documentId ? {
        title: (correspondance.documentId).title,
        author: (correspondance.documentId).authorId ? {
          first_name: ((correspondance.documentId).authorId).firstName,
          last_name: ((correspondance.documentId).authorId).lastName,
        } : null,
      } : null,
      actions_decidees: correspondance.actionsDecidees,
      tags: correspondance.tags,
      type: correspondance.type,
      code: correspondance.code,
      file_path: correspondance.filePath,
      file_type: correspondance.fileType,
    };

    // --- Notifications for updated correspondence ---
    // Identify changes for notification details
    const changedFields = Object.keys(updates).filter(key => 
      JSON.stringify(updates[key]) !== JSON.stringify(oldCorrespondance.toObject()[key])
    );

    if (changedFields.length > 0) {
      // Notify the original author of the correspondence about updates
      const authorId = (await Document.findById(correspondance.documentId))?.authorId;
      if (authorId) {
        await createNotification(authorId, 'Correspondance mise à jour', `La correspondance "${correspondance.subject}" a été mise à jour. Champs modifiés: ${changedFields.join(', ')}.`);
      }

      // Notify responsible parties if actions_decidees were changed
      const oldActionIds = new Set(oldCorrespondance.actionsDecidees.map(a => a.titre));
      const newActionIds = new Set(correspondance.actionsDecidees.map(a => a.titre));

      const addedActions = correspondance.actionsDecidees.filter(action => !oldActionIds.has(action.titre));
      const updatedActions = correspondance.actionsDecidees.filter(action => {
        const oldAction = oldCorrespondance.actionsDecidees.find(oa => oa.titre === action.titre);
        return oldAction && JSON.stringify(oldAction) !== JSON.stringify(action);
      });

      for (const action of addedActions) {
        if (Array.isArray(action.responsable) && action.responsable.length > 0) {
          await createNotification(action.responsable[0], 'Nouvelle action assignée', `Une nouvelle action "${action.titre}" de la correspondance "${correspondance.subject}" vous a été assignée.`);
        }
      }
      for (const action of updatedActions) {
        if (Array.isArray(action.responsable) && action.responsable.length > 0) {
          await createNotification(action.responsable[0], 'Action mise à jour', `L'action "${action.titre}" de la correspondance "${correspondance.subject}" a été mise à jour.`);
        }
      }
    }
    // --- End Notifications ---

    res.json(formattedCorrespondance);
  } catch (error) {
    console.error('Error updating correspondence:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/correspondances/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const correspondance = await Correspondance.findByIdAndDelete(id);
    if (!correspondance) {
      return res.status(404).json({ message: 'Correspondance not found' });
    }
    // Optionally delete the associated document as well
    await Document.findByIdAndDelete(correspondance.documentId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting correspondence:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;