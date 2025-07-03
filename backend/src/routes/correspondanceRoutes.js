const { Router } = require('express');
const { Correspondance } = require('../models/Correspondance.js');
const { createNotification } = require('./notificationRoutes.js'); // Importation de la fonction centralisée
const { User } = require('../models/User.js'); // Importation de User pour les notifications
const { generateCodeAndSequence, generateSimpleQRCode } = require('../utils/codeGenerator.js');
const { v4: uuidv4 } = require('uuid');

const router = Router();

// La fonction createNotification est maintenant importée depuis notificationRoutes.js
// Elle n'est plus définie ici pour éviter la duplication et assurer l'envoi d'emails.

// GET /api/correspondances
router.get('/', async (req, res) => {
  try {
    const correspondances = await Correspondance.find({})
      .populate('authorId', 'firstName lastName');
    
    const formattedCorrespondances = correspondances.map(corr => ({
      ...corr.toObject(),
      id: corr._id,
      author: corr.authorId ? {
        first_name: corr.authorId.firstName,
        last_name: corr.authorId.lastName,
      } : null,
      actions_decidees: corr.actionsDecidees,
      tags: corr.tags,
      type: corr.type,
      code: corr.code,
      file_path: corr.filePath,
      file_type: corr.fileType,
      qr_code: corr.qrCode,
      version: corr.version,
      views_count: corr.viewsCount,
      downloads_count: corr.downloadsCount,
      created_at: corr.createdAt ? corr.createdAt.toISOString() : null, // Ensure ISO string
      updated_at: corr.updatedAt ? corr.updatedAt.toISOString() : null, // Ensure ISO string
      to_address: corr.toAddress || '', // Ensure it's not null/undefined
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
    const newCorrespondanceId = uuidv4(); // Generate ID first to use in QR code URL

    let generatedCode = code;
    let qrCodeValue;
    let sequence_number = null;

    if (company_code && scope_code && department_code && language_code) {
      const { generatedCode: newGeneratedCode, sequence_number: newSequenceNumber } = await generateCodeAndSequence(
        'CORRESPONDANCE',
        company_code,
        scope_code,
        department_code,
        sub_department_code,
        null,
        type === 'INCOMING' ? 'IN' : 'OUT',
        language_code
      );
      generatedCode = newGeneratedCode;
      sequence_number = newSequenceNumber;
    }
    
    qrCodeValue = generateSimpleQRCode('correspondance', newCorrespondanceId); // Always generate a URL for QR code

    const newCorrespondance = new Correspondance({
      _id: newCorrespondanceId,
      title,
      authorId: author_id,
      qrCode: qrCodeValue, // Use the generated QR code URL
      filePath: file_path,
      fileType: file_type,
      version: 1,
      viewsCount: 0,
      downloadsCount: 0,

      type,
      code: generatedCode,
      fromAddress: from_address,
      toAddress: to_address,
      subject,
      content,
      priority,
      status: 'DRAFT',
      airport,
      attachments: attachments || [],
      actionsDecidees: actions_decidees || [],
      tags: tags || [],
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
      created_at: populatedCorrespondance.createdAt ? populatedCorrespondance.createdAt.toISOString() : null, // Ensure ISO string
      updated_at: populatedCorrespondance.updatedAt ? populatedCorrespondance.updatedAt.toISOString() : null, // Ensure ISO string
      to_address: populatedCorrespondance.toAddress || '', // Ensure it's not null/undefined
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

    let generatedCode = oldCorrespondance.code; // Keep existing code by default
    let qrCodeValue = oldCorrespondance.qrCode; // Keep existing QR by default
    let sequence_number = oldCorrespondance.sequence_number; // Keep existing sequence by default

    const codificationFieldsChanged = [
      'company_code', 'scope_code', 'department_code', 'sub_department_code',
      'type', 'language_code'
    ].some(field => updates[field] !== undefined && updates[field] !== oldCorrespondance[field]);

    if (codificationFieldsChanged) {
      const { generatedCode: newGeneratedCode, sequence_number: newSequenceNumber } = await generateCodeAndSequence(
        'CORRESPONDANCE',
        updates.company_code || oldCorrespondance.company_code,
        updates.scope_code || oldCorrespondance.scope_code,
        updates.department_code || oldCorrespondance.department_code,
        updates.sub_department_code || oldCorrespondance.sub_department_code,
        null,
        updates.type === 'INCOMING' ? 'IN' : 'OUT' || oldCorrespondance.type === 'INCOMING' ? 'IN' : 'OUT',
        updates.language_code || oldCorrespondance.language_code
      );
      generatedCode = newGeneratedCode;
      sequence_number = newSequenceNumber;
      updates.code = generatedCode; // Update the code field in updates
      updates.sequence_number = sequence_number; // Update the sequence_number field in updates
    }
    
    // Always regenerate QR code URL if codification changed or if QR code itself is updated
    if (codificationFieldsChanged || updates.qrCode) {
      updates.qrCode = generateSimpleQRCode('correspondance', id);
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
      created_at: correspondance.createdAt ? correspondance.createdAt.toISOString() : null, // Ensure ISO string
      updated_at: correspondance.updatedAt ? correspondance.updatedAt.toISOString() : null, // Ensure ISO string
      to_address: correspondance.toAddress || '', // Ensure it's not null/undefined
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