import { Router } from 'express';
import { Document } from '../models/Document';
import { User } from '../models/User'; // To populate author details
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/documents
router.get('/', async (req, res) => {
  try {
    const documents = await Document.find({}).populate('authorId', 'firstName lastName'); // Populate author details
    const formattedDocuments = documents.map(doc => ({
      ...doc.toObject(),
      id: doc._id, // Map _id to id for frontend compatibility
      author: doc.authorId ? {
        first_name: (doc.authorId as any).firstName,
        last_name: (doc.authorId as any).lastName,
      } : null,
    }));
    res.json(formattedDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/documents
router.post('/', async (req, res) => {
  const { title, type, content, author_id, airport, file_path, file_type } = req.body;

  if (!title || !type || !author_id || !airport) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newDocument = new Document({
      _id: uuidv4(),
      title,
      type,
      content,
      authorId: author_id,
      airport,
      filePath: file_path,
      fileType: file_type,
      qrCode: `QR-${uuidv4()}`, // Generate a unique QR code
      version: 1,
      status: 'DRAFT',
      viewsCount: 0,
      downloadsCount: 0,
    });

    await newDocument.save();
    
    const populatedDocument = await newDocument.populate('authorId', 'firstName lastName');
    const formattedDocument = {
      ...populatedDocument.toObject(),
      id: populatedDocument._id,
      author: populatedDocument.authorId ? {
        first_name: (populatedDocument.authorId as any).firstName,
        last_name: (populatedDocument.authorId as any).lastName,
      } : null,
    };
    res.status(201).json(formattedDocument);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/documents/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const document = await Document.findByIdAndUpdate(id, updates, { new: true }).populate('authorId', 'firstName lastName');
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    const formattedDocument = {
      ...document.toObject(),
      id: document._id,
      author: document.authorId ? {
        first_name: (document.authorId as any).firstName,
        last_name: (document.authorId as any).lastName,
      } : null,
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

export default router;