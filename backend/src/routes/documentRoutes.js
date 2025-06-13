const { Router } = require('express');
const { Document } = require('../models/Document.js'); // Changed to require with .js extension
const { User } = require('../models/User.js'); // Changed to require with .js extension
const { DocumentCodeConfig } = require('../models/DocumentCodeConfig.js'); // Changed to require with .js extension
const { ActivityLog } = require('../models/ActivityLog.js'); // Changed to require with .js extension
const { v4: uuidv4 } = require('uuid'); // uuid is a CommonJS module, no change needed here

const router = Router();

// Helper function to generate the document code and update sequence
const generateDocumentCodeAndSequence = async (
  company_code,
  scope_code,
  department_code,
  sub_department_code,
  document_type_code,
  language_code
) => {
  const config = await DocumentCodeConfig.findOne({});
  if (!config) {
    throw new Error('Document code configuration not found.');
  }

  // Construct the key for the sequence counter
  const sequenceKey = `${company_code}-${scope_code}-${department_code}-${sub_department_code || 'NA'}-${document_type_code}-${language_code}`;
  
  let currentSequence = config.sequenceCounters.get(sequenceKey) || 0;
  currentSequence++;
  
  // Update the sequence counter in the database
  config.sequenceCounters.set(sequenceKey, currentSequence);
  await config.save();

  const paddedSequence = String(currentSequence).padStart(3, '0'); // e.g., 001, 002

  // Construct the full QR code string
  const qrCode = `${company_code}-${scope_code}-${department_code}${sub_department_code ? `-${sub_department_code}` : ''}-${document_type_code}-${paddedSequence}-${language_code}`;
  
  return { qrCode, sequence_number: currentSequence };
};


// GET /api/documents
router.get('/', async (req, res) => {
  try {
    const documents = await Document.find({})
      .populate('authorId', 'firstName lastName') // Populate author details
      .populate('approvedBy', 'firstName lastName'); // Populate approvedBy details
    
    const formattedDocuments = documents.map(doc => ({
      ...doc.toObject(),
      id: doc._id, // Map _id to id for frontend compatibility
      author: doc.authorId ? {
        first_name: doc.authorId.firstName,
        last_name: doc.authorId.lastName,
      } : null,
      approved_by: doc.approvedBy ? { // Map approvedBy to approved_by for frontend
        first_name: doc.approvedBy.firstName,
        last_name: doc.approvedBy.lastName,
      } : null,
      approved_at: doc.approvedAt ? doc.approvedAt.toISOString() : null, // Map approvedAt to approved_at
    }));
    res.json(formattedDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/documents/:id/history
router.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const historyLogs = await ActivityLog.find({ entityId: id, entityType: 'DOCUMENT' })
      .populate('userId', 'firstName lastName')
      .sort({ timestamp: 1 }); // Sort by timestamp ascending for chronological order

    const formattedHistory = historyLogs.map(log => ({
      id: log._id,
      documentId: log.entityId,
      action: log.action,
      userId: log.userId._id,
      userName: `${log.userId.firstName} ${log.userId.lastName}`,
      timestamp: log.timestamp.toISOString(),
      details: log.details,
      // Assuming version and changes might be part of details or need to be parsed
      version: log.details.includes('version') ? parseInt(log.details.split('version ')[1]?.split(' ')[0]) : undefined,
      changes: log.details.includes('modifié') ? {} : undefined, // Placeholder for actual changes parsing
    }));

    res.json(formattedHistory);
  } catch (error) {
    console.error('Error fetching document history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/documents
router.post('/', async (req, res) => {
  const { 
    title, type, content, author_id, airport, file_path, file_type, // Added file_path, file_type
    company_code, scope_code, department_code, sub_department_code,
    document_type_code, language_code
  } = req.body;

  if (!title || !type || !author_id || !airport || !company_code || !scope_code || !department_code || !document_type_code || !language_code) {
    return res.status(400).json({ message: 'Missing required fields for document creation, including codification fields.' });
  }

  try {
    const { qrCode, sequence_number } = await generateDocumentCodeAndSequence(
      company_code,
      scope_code,
      department_code,
      sub_department_code,
      document_type_code,
      language_code
    );

    const newDocument = new Document({
      _id: uuidv4(),
      title,
      type,
      content,
      authorId: author_id,
      airport,
      filePath: file_path, // Save file path
      fileType: file_type, // Save file type
      qrCode, // Use the generated QR code
      version: 1,
      status: 'DRAFT', // New documents start as DRAFT
      viewsCount: 0,
      downloadsCount: 0,
      company_code,
      scope_code,
      department_code,
      sub_department_code,
      document_type_code,
      language_code,
      sequence_number,
    });

    await newDocument.save();
    
    // Log document creation
    await ActivityLog.create({
      _id: uuidv4(),
      action: 'DOCUMENT_CREATED',
      details: `Document "${newDocument.title}" (ID: ${newDocument._id}) créé.`,
      entityId: newDocument._id,
      entityType: 'DOCUMENT',
      userId: author_id,
      timestamp: new Date(),
    });

    const populatedDocument = await newDocument
      .populate('authorId', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName'); // Populate approvedBy for response
    
    const formattedDocument = {
      ...populatedDocument.toObject(),
      id: populatedDocument._id,
      author: populatedDocument.authorId ? {
        first_name: populatedDocument.authorId.firstName,
        last_name: populatedDocument.authorId.lastName,
      } : null,
      approved_by: populatedDocument.approvedBy ? {
        first_name: populatedDocument.approvedBy.firstName,
        last_name: populatedDocument.approvedBy.lastName,
      } : null,
      approved_at: populatedDocument.approvedAt ? populatedDocument.approvedAt.toISOString() : null,
    };
    res.status(201).json(formattedDocument);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// PUT /api/documents/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const oldDocument = await Document.findById(id);
    if (!oldDocument) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Handle approval specific fields
    if (updates.status === 'ACTIVE' && updates.approved_by_id && oldDocument.status !== 'ACTIVE') {
      updates.approvedBy = updates.approved_by_id; // Map frontend field to backend
      updates.approvedAt = new Date(); // Set approval timestamp
      delete updates.approved_by_id;
      // Log approval
      await ActivityLog.create({
        _id: uuidv4(),
        action: 'DOCUMENT_APPROVED',
        details: `Document "${oldDocument.title}" (ID: ${oldDocument._id}) approuvé.`,
        entityId: oldDocument._id,
        entityType: 'DOCUMENT',
        userId: updates.approvedBy, // Use the actual approver ID
        timestamp: new Date(),
      });
    } else if (updates.status !== 'ACTIVE' && oldDocument.status === 'ACTIVE') {
      // If status is changed away from ACTIVE, clear approval info
      updates.approvedBy = null;
      updates.approvedAt = null;
      // Log un-approval or status change from active
      await ActivityLog.create({
        _id: uuidv4(),
        action: 'DOCUMENT_STATUS_CHANGED',
        details: `Statut du document "${oldDocument.title}" (ID: ${oldDocument._id}) changé de ACTIF à ${updates.status}.`,
        entityId: oldDocument._id,
        entityType: 'DOCUMENT',
        userId: req.user ? req.user.id : 'system', // Assuming req.user from auth middleware
        timestamp: new Date(),
      });
    }

    // Handle general updates and log them
    const updatedDocument = await Document.findByIdAndUpdate(id, updates, { new: true })
      .populate('authorId', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');
    
    if (!updatedDocument) {
      return res.status(404).json({ message: 'Document not found after update attempt' });
    }

    // Log general update if not already logged by status change
    const changes = Object.keys(updates).filter(key => 
      key !== 'approvedBy' && key !== 'approvedAt' && key !== 'status' && 
      JSON.stringify(updates[key]) !== JSON.stringify(oldDocument.toObject()[key])
    );
    if (changes.length > 0) {
      await ActivityLog.create({
        _id: uuidv4(),
        action: 'DOCUMENT_UPDATED',
        details: `Document "${updatedDocument.title}" (ID: ${updatedDocument._id}) modifié. Champs: ${changes.join(', ')}.`,
        entityId: updatedDocument._id,
        entityType: 'DOCUMENT',
        userId: req.user ? req.user.id : 'system', // Assuming req.user from auth middleware
        timestamp: new Date(),
      });
    }

    const formattedDocument = {
      ...updatedDocument.toObject(),
      id: updatedDocument._id,
      author: updatedDocument.authorId ? {
        first_name: updatedDocument.authorId.firstName,
        last_name: updatedDocument.authorId.lastName,
      } : null,
      approved_by: updatedDocument.approvedBy ? {
        first_name: updatedDocument.approvedBy.firstName,
        last_name: updatedDocument.approvedBy.lastName,
      } : null,
      approved_at: updatedDocument.approvedAt ? updatedDocument.approvedAt.toISOString() : null,
    };
    res.json(formattedDocument);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const document = await Document.findByIdAndDelete(id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Log document deletion
    await ActivityLog.create({
      _id: uuidv4(),
      action: 'DOCUMENT_DELETED',
      details: `Document "${document.title}" (ID: ${document._id}) supprimé.`,
      entityId: document._id,
      entityType: 'DOCUMENT',
      userId: req.user ? req.user.id : 'system', // Assuming req.user from auth middleware
      timestamp: new Date(),
    });

    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;