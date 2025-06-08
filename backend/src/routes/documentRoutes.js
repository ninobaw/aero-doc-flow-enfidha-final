const { Router } = require('express');
const { Document } = require('../models/Document');
const { User } = require('../models/User'); // To populate author details
const { DocumentCodeConfig } = require('../models/DocumentCodeConfig'); // Import DocumentCodeConfig model
const { v4: uuidv4 } = require('uuid');

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

// POST /api/documents
router.post('/', async (req, res) => {
  const { 
    title, type, content, author_id, airport, file_path, file_type,
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
      filePath: file_path,
      fileType: file_type,
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

  // Handle approval specific fields
  if (updates.status === 'ACTIVE' && updates.approved_by_id) {
    updates.approvedBy = updates.approved_by_id; // Map frontend field to backend
    updates.approvedAt = new Date(); // Set approval timestamp
    delete updates.approved_by_id;
  } else if (updates.status !== 'ACTIVE') {
    // If status is changed away from ACTIVE, clear approval info
    updates.approvedBy = null;
    updates.approvedAt = null;
  }

  try {
    const document = await Document.findByIdAndUpdate(id, updates, { new: true })
      .populate('authorId', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName'); // Populate approvedBy for response
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    const formattedDocument = {
      ...document.toObject(),
      id: document._id,
      author: document.authorId ? {
        first_name: document.authorId.firstName,
        last_name: document.authorId.lastName,
      } : null,
      approved_by: document.approvedBy ? {
        first_name: document.approvedBy.firstName,
        last_name: document.approvedBy.lastName,
      } : null,
      approved_at: document.approvedAt ? document.approvedAt.toISOString() : null,
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
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;