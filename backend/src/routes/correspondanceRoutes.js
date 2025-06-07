const { Router } = require('express');
const { Correspondance } = require('../models/Correspondance');
const { Document } = require('../models/Document'); // To populate parent document details
const { v4: uuidv4 } = require('uuid');

const router = Router();

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
    }));
    res.json(formattedCorrespondances);
  } catch (error) {
    console.error('Error fetching correspondances:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/correspondances
router.post('/', async (req, res) => {
  const { title, from_address, to_address, subject, content, priority, airport, attachments, actions_decidees, author_id } = req.body;

  if (!title || !from_address || !to_address || !subject || !airport || !author_id) {
    return res.status(400).json({ message: 'Missing required fields for correspondence' });
  }

  try {
    // First, create the associated Document
    const newDocument = new Document({
      _id: uuidv4(),
      title,
      type: 'CORRESPONDANCE',
      content,
      authorId: author_id,
      airport,
      qrCode: `QR-${uuidv4()}`,
      version: 1,
      status: 'DRAFT',
      viewsCount: 0,
      downloadsCount: 0,
    });
    await newDocument.save();

    const newCorrespondance = new Correspondance({
      _id: uuidv4(),
      documentId: newDocument._id,
      fromAddress: from_address,
      toAddress: to_address,
      subject,
      content,
      priority,
      status: 'DRAFT', // Default status
      airport,
      attachments: attachments || [],
      actionsDecidees: actions_decidees || [],
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
    };
    res.status(201).json(formattedCorrespondance);
  } catch (error) {
    console.error('Error creating correspondence:', error);
    res.status(500).json({ message: 'Server error' });
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

  try {
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
    };
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