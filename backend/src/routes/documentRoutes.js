const { Router } = require('express');
const { Document } = require('../models/Document.js');
const { User } = require('../models/User.js');
const { DocumentCodeConfig } = require('../models/DocumentCodeConfig.js');
const { ActivityLog } = require('../models/ActivityLog.js');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { generateCodeAndSequence, generateSimpleQRCode } = require('../utils/codeGenerator.js'); // Import new code generator

const router = Router();

// Helper function to generate the document code and update sequence
const generateDocumentCodeAndSequenceForDocument = async (
  company_code,
  scope_code,
  department_code,
  sub_department_code,
  document_type_code,
  language_code,
  documentId // Pass document ID to generate the full URL
) => {
  const { generatedCode, sequence_number } = await generateCodeAndSequence(
    'DOCUMENT',
    company_code,
    scope_code,
    department_code,
    sub_department_code,
    document_type_code,
    null, // No correspondence/PV type code for documents
    language_code
  );
  
  const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:8080';
  const qrCodeUrl = `${frontendBaseUrl}/public-view/document/${documentId}`; // Use the generated code as part of the URL or just the ID
  
  return { qrCode: qrCodeUrl, sequence_number: sequence_number, structuredCode: generatedCode };
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
    document_type_code, language_code, isTemplate // Added isTemplate
  } = req.body;

  if (!title || !type || !author_id || !airport || !company_code || !scope_code || !department_code || !document_type_code || !language_code) {
    return res.status(400).json({ message: 'Missing required fields for document creation, including codification fields.' });
  }

  try {
    const newDocumentId = uuidv4(); // Generate ID first to use in QR code URL

    const { qrCode, sequence_number, structuredCode } = await generateDocumentCodeAndSequenceForDocument(
      company_code,
      scope_code,
      department_code,
      sub_department_code,
      document_type_code,
      language_code,
      newDocumentId // Pass the newly generated ID
    );

    const newDocument = new Document({
      _id: newDocumentId,
      title,
      type,
      content,
      authorId: author_id,
      airport,
      filePath: file_path, // Save file path
      fileType: file_type, // Save file type
      qrCode, // Use the generated QR code URL
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
      isTemplate: isTemplate || false, // Set isTemplate
    });

    await newDocument.save();
    
    // Re-fetch the document by ID and populate to ensure correct population
    const populatedDocument = await Document.findById(newDocument._id)
      .populate('authorId', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');
    
    // Log document creation
    await ActivityLog.create({
      _id: uuidv4(),
      action: 'DOCUMENT_CREATED',
      details: `Document "${populatedDocument.title}" (ID: ${populatedDocument._id}) créé.`,
      entityId: populatedDocument._id,
      entityType: 'DOCUMENT',
      userId: author_id,
      timestamp: new Date(),
    });

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

// POST /api/documents/from-template - Create a new document by copying a template file
router.post('/from-template', async (req, res) => {
  const { 
    templateId, title, description, author_id, airport, 
    company_code, department_code, sub_department_code,
    document_type_code, language_code
  } = req.body;

  if (!templateId || !title || !author_id || !airport || !company_code || !department_code || !document_type_code || !language_code) {
    return res.status(400).json({ message: 'Missing required fields for document creation from template.' });
  }

  try {
    const template = await Document.findById(templateId);
    if (!template || !template.isTemplate || !template.filePath) {
      return res.status(404).json({ message: 'Template not found or invalid.' });
    }

    // Determine the target directory for the new document
    const uploadsDir = path.join(__dirname, '../../uploads');
    const documentTypeFolder = template.type; // Use template's type for folder structure
    const scopeFolder = airport; // Use the selected airport as scope folder
    const departmentFolder = department_code; // Use the selected department code

    const targetDir = path.join(uploadsDir, scopeFolder, departmentFolder, documentTypeFolder);
    
    // Ensure the target directory exists
    fs.mkdirSync(targetDir, { recursive: true });

    const fileName = path.basename(template.filePath);
    const newFileName = `${uuidv4()}-${fileName}`; // Ensure unique name for the copy
    const destinationPath = path.join(targetDir, newFileName);
    const relativeFilePath = path.relative(uploadsDir, destinationPath);

    // Copy the template file
    await fs.promises.copyFile(path.join(uploadsDir, template.filePath), destinationPath);

    const newDocumentId = uuidv4(); // Generate ID first to use in QR code URL
    // Generate new document code and sequence number
    const { qrCode, sequence_number, structuredCode } = await generateDocumentCodeAndSequenceForDocument(
      company_code,
      airport, // Use selected airport as scope_code for the new document
      department_code,
      sub_department_code,
      document_type_code,
      language_code,
      newDocumentId // Pass the newly generated ID
    );

    const newDocument = new Document({
      _id: newDocumentId,
      title,
      type: template.type, // Keep the type from the template
      content: description, // Use description as content
      authorId: author_id,
      airport,
      filePath: relativeFilePath, // Save the path to the copied file
      fileType: template.fileType, // Keep the file type from the template
      qrCode, // Use the newly generated QR code URL
      version: 0, // Start with version 0 (REV:0) for a new document
      status: 'DRAFT', // New documents from template start as DRAFT
      viewsCount: 0,
      downloadsCount: 0,
      company_code,
      scope_code: airport, // Use selected airport as scope_code
      department_code,
      sub_department_code,
      document_type_code,
      language_code,
      sequence_number,
      isTemplate: false, // This is a new document, not a template
    });

    await newDocument.save();
    
    // Re-fetch the document by ID and populate to ensure correct population
    const populatedDocument = await Document.findById(newDocument._id)
      .populate('authorId', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');
    
    // Log document creation from template
    await ActivityLog.create({
      _id: uuidv4(),
      action: 'DOCUMENT_CREATED_FROM_TEMPLATE',
      details: `Document "${populatedDocument.title}" (ID: ${populatedDocument._id}) créé à partir du modèle "${template.title}".`,
      entityId: populatedDocument._id,
      entityType: 'DOCUMENT',
      userId: author_id,
      timestamp: new Date(),
    });

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
    console.error('Error creating document from template:', error);
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

    // Check if any codification fields are being updated
    const codificationFieldsChanged = [
      'company_code', 'scope_code', 'department_code', 'sub_department_code',
      'document_type_code', 'language_code'
    ].some(field => updates[field] !== undefined && updates[field] !== oldDocument[field]);

    // If codification fields changed, regenerate QR code and sequence number
    if (codificationFieldsChanged) {
      const { qrCode, sequence_number, structuredCode } = await generateDocumentCodeAndSequenceForDocument(
        updates.company_code || oldDocument.company_code,
        updates.scope_code || oldDocument.scope_code,
        updates.department_code || oldDocument.department_code,
        updates.sub_department_code || oldDocument.sub_department_code,
        updates.document_type_code || oldDocument.document_type_code,
        updates.language_code || oldDocument.language_code,
        id // Pass the document ID
      );
      updates.qrCode = qrCode;
      updates.sequence_number = sequence_number;
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
        userId: req.user ? req.user.id : 'system', // Assuming req.user from auth middleware
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