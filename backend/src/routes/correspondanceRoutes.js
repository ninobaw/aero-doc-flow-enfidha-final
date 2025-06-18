const { Router } = require('express');
const { Correspondance } = require('../models/Correspondance.js');
const { Notification } = require('../models/Notification.js'); // Import Notification model
const { User } = require('../models/User.js'); // Import User model to find users for notifications
const { generateCodeAndSequence, generateSimpleQRCode } = require('../utils/codeGenerator.js'); // Import new code generator
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
      .populate('authorId', 'firstName lastName'); // Populate author details directly
    
    const formattedCorrespondances = correspondances.map(corr => ({
      ...corr.toObject(),
      id: corr._id,
      author: corr.authorId ? { // Map authorId to author for frontend
        first_name: corr.authorId.firstName,
        last_name: corr.authorId.lastName,
      } : null,
      actions_decidees: corr.actionsDecidees,
      tags: corr.tags,
      type: corr.type,
      code: corr.code,
      file_path: corr.filePath,
      file_type: corr.fileType,
      qr_code: corr.qrCode, // Include qr_code
      version: corr.version, // Include version
      views_count: corr.viewsCount, // Include views_count
      downloads_count: corr.downloadsCount, // Include downloads_count
    }));
    res.json(formattedCorrespondances);
  } catch (error) {
    console.error('Error fetching correspondances:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/correspondances
router.post('/', async (req, res) => {
  const { 
    title, from_address, to_address, subject, content, priority, airport, 
    attachments, actions_decidees, author_id, tags, type, code, file_path, file_type,
    company_code, scope_code, department_code, sub_department_code, language_code
  } = req.body;

  if (!title || !from_address || !to_address || !subject || !airport || !author_id || !type) {
    return res.status(400).json({ message: 'Missing required fields for correspondence: title, from_address, to_address, subject, airport, author_id, type' });
  }

  try {
    let generatedCode = code; // Use provided code if available
    let qrCode = generateSimpleQRCode(); // Generate a simple UUID-based QR code by default
    let sequence_number = null;

    // If codification fields are provided, generate a structured code and QR
    if (company_code && scope_code && department_code && language_code) {
      const { generatedCode: newGeneratedCode, sequence_number: newSequenceNumber } = await generateCodeAndSequence(
        'CORRESPONDANCE',
        company_code,
        scope_code,
        department_code,
        sub_department_code,
        null, // document_type_code is null for correspondences
        type === 'INCOMING' ? 'IN' : 'OUT', // Use IN/OUT as correspondence type code
        language_code
      );
      generatedCode = newGeneratedCode;
      qrCode = newGeneratedCode; // Use the structured code as QR code
      sequence_number = newSequenceNumber;
    }

    const newCorrespondance = new Correspondance({
      _id: uuidv4(),
      title, // Directly on Correspondance
      authorId: author_id, // Directly on Correspondance
      qrCode, // Directly on Correspondance
      filePath: file_path, // Directly on Correspondance
      fileType: file_type, // Directly on Correspondance
      version: 1, // Directly on Correspondance
      viewsCount: 0, // Directly on Correspondance
      downloadsCount: 0, // Directly on Correspondance

      type,
      code: generatedCode, // Use generated code or provided code
      fromAddress: from_address,
      toAddress: to_address,
      subject,
      content,
      priority,
      status: 'DRAFT', // Default status
      airport,
      attachments: attachments || [],
      actionsDecidees: actions_decidees || [],
      tags: tags || [],
      // Store codification fields if generated
      company_code, scope_code, department_code, sub_department_code, language_code, sequence_number
    });

    await newCorrespondance.save();
    
    const populatedCorrespondance = await newCorrespondance
      .populate('authorId', 'firstName lastName');

    const formattedCorrespondance = {
      ...populatedCorrespondance.toObject(),
      id: populatedCorrespondance._id,
      author: populatedCorrespondance.authorId ? {
        first_name: populatedCorrespondance.authorId.firstName,
        last_name: populatedCorrespondance.authorId.lastName,
      } : null,
      actions_decidees: populatedCorrespondance.actionsDecidees,
      tags: populatedCorrespondance.tags,
      type: populatedCorrespondance.type,
      code: populatedCorrespondance.code,
      file_path: populatedCorrespondance.filePath,
      file_type: populatedCorrespondance.fileType,
      qr_code: populatedCorrespondance.qrCode,
      version: populatedCorrespondance.version,
      views_count: populatedCorrespondance.viewsCount,
      downloads_count: populatedCorrespondance.downloadsCount,
    };

    // --- Notifications for new correspondence ---
    await createNotification(author_id, 'Nouvelle correspondance créée', `Votre correspondance "${subject}" a été créée.`);
    
    const recipientUser = await User.findOne({ email: to_address });
    if (recipientUser) {
      await createNotification(recipientUser._id, 'Nouvelle correspondance reçue', `Vous avez reçu une nouvelle correspondance: "${subject}".`);
    }

    if (actions_decidees && actions_decidees.length > 0) {
      for (const action of actions_decidees) {
        if (Array.isArray(action.responsable) && action.responsable.length > 0) {
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
  if (updates.file_path) { updates.filePath = updates.file_path; delete updates.file_path; }
  if (updates.file_type) { updates.fileType = updates.file_type; delete updates.file_type; }
  if (updates.views_count !== undefined) { updates.viewsCount = updates.views_count; delete updates.views_count; }
  if (updates.downloads_count !== undefined) { updates.downloadsCount = updates.downloads_count; delete updates.downloads_count; }
  if (updates.qr_code !== undefined) { updates.qrCode = updates.qr_code; delete updates.qr_code; }
  if (updates.version !== undefined) { updates.version = updates.version; delete updates.version; }
  if (updates.author_id !== undefined) { updates.authorId = updates.author_id; delete updates.author_id; }


  try {
    const oldCorrespondance = await Correspondance.findById(id);
    if (!oldCorrespondance) {
      return res.status(404).json({ message: 'Correspondance not found' });
    }

    // Check if any codification fields are being updated to regenerate code/QR
    const codificationFieldsChanged = [
      'company_code', 'scope_code', 'department_code', 'sub_department_code',
      'type', 'language_code' // 'type' here refers to INCOMING/OUTGOING for correspondence code generation
    ].some(field => updates[field] !== undefined && updates[field] !== oldCorrespondance[field]);

    if (codificationFieldsChanged) {
      const { generatedCode, sequence_number } = await generateCodeAndSequence(
        'CORRESPONDANCE',
        updates.company_code || oldCorrespondance.company_code,
        updates.scope_code || oldCorrespondance.scope_code,
        updates.department_code || oldCorrespondance.department_code,
        updates.sub_department_code || oldCorrespondance.sub_department_code,
        null, // document_type_code is null for correspondences
        updates.type === 'INCOMING' ? 'IN' : 'OUT' || oldCorrespondance.type === 'INCOMING' ? 'IN' : 'OUT', // Use IN/OUT as correspondence type code
        updates.language_code || oldCorrespondance.language_code
      );
      generatedCode = newGeneratedCode;
      qrCode = newGeneratedCode; // Update QR code with the new structured code
      sequence_number = newSequenceNumber;
    }


    const correspondance = await Correspondance.findByIdAndUpdate(id, updates, { new: true })
      .populate('authorId', 'firstName lastName');
    if (!correspondance) {
      return res.status(404).json({ message: 'Correspondance not found' });
    }

    const formattedCorrespondance = {
      ...correspondance.toObject(),
      id: correspondance._id,
      author: correspondance.authorId ? {
        first_name: correspondance.authorId.firstName,
        last_name: correspondance.authorId.lastName,
      } : null,
      actions_decidees: correspondance.actionsDecidees,
      tags: correspondance.tags,
      type: correspondance.type,
      code: correspondance.code,
      file_path: correspondance.filePath,
      file_type: correspondance.fileType,
      qr_code: correspondance.qrCode,
      version: correspondance.version,
      views_count: correspondance.viewsCount,
      downloads_count: correspondance.downloadsCount,
    };

    // --- Notifications for updated correspondence ---
    const changedFields = Object.keys(updates).filter(key => 
      JSON.stringify(updates[key]) !== JSON.stringify(oldCorrespondance.toObject()[key])
    );

    if (changedFields.length > 0) {
      const authorId = correspondance.authorId;
      if (authorId) {
        await createNotification(authorId, 'Correspondance mise à jour', `La correspondance "${correspondance.subject}" a été mise à jour. Champs modifiés: ${changedFields.join(', ')}.`);
      }

      const oldActionTitles = new Set(oldCorrespondance.actionsDecidees.map(a => a.titre));
      const addedActions = correspondance.actionsDecidees.filter(action => !oldActionTitles.has(action.titre));
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
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting correspondence:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;