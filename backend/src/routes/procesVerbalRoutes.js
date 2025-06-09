const { Router } = require('express');
const { ProcesVerbal } = require('../models/ProcesVerbal.js'); // Changed to require with .js extension
const { Document } = require('../models/Document.js'); // Changed to require with .js extension
const { Notification } = require('../models/Notification.js'); // Changed to require with .js extension
const { v4: uuidv4 } = require('uuid'); // uuid is a CommonJS module, no change needed here

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

// GET /api/proces-verbaux
router.get('/', async (req, res) => {
  try {
    const procesVerbaux = await ProcesVerbal.find({})
      .populate({
        path: 'documentId',
        select: 'title authorId',
        populate: {
          path: 'authorId',
          model: 'User',
          select: 'firstName lastName'
        }
      });
    const formattedProcesVerbaux = procesVerbaux.map(pv => ({
      ...pv.toObject(),
      id: pv._id,
      document: pv.documentId ? {
        title: (pv.documentId).title,
        author: (pv.documentId).authorId ? {
          first_name: ((pv.documentId).authorId).firstName,
          last_name: ((pv.documentId).authorId).lastName,
        } : null,
      } : null,
      actions_decidees: pv.actionsDecidees,
    }));
    res.json(formattedProcesVerbaux);
  } catch (error) {
    console.error('Error fetching proces verbaux:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/proces-verbaux
router.post('/', async (req, res) => {
  const { title, meeting_date, participants, agenda, decisions, location, meeting_type, airport, next_meeting_date, actions_decidees, author_id } = req.body;

  if (!title || !meeting_date || !participants || !agenda || !decisions || !location || !meeting_type || !airport || !author_id) {
    return res.status(400).json({ message: 'Missing required fields for proces verbal' });
  }

  try {
    // First, create the associated Document
    const newDocument = new Document({
      _id: uuidv4(),
      title,
      type: 'PROCES_VERBAL',
      content: agenda + '\n\nDécisions: ' + decisions,
      authorId: author_id,
      airport,
      qrCode: `QR-${uuidv4()}`,
      version: 1,
      status: 'DRAFT',
      viewsCount: 0,
      downloadsCount: 0,
    });
    await newDocument.save();

    const newProcesVerbal = new ProcesVerbal({
      _id: uuidv4(),
      documentId: newDocument._id,
      meetingDate: new Date(meeting_date),
      participants,
      agenda,
      decisions,
      location,
      meetingType: meeting_type,
      airport,
      nextMeetingDate: next_meeting_date ? new Date(next_meeting_date) : undefined,
      actionsDecidees: actions_decidees || [],
    });

    await newProcesVerbal.save();
    
    const populatedProcesVerbal = await newProcesVerbal
      .populate({
        path: 'documentId',
        select: 'title authorId',
        populate: {
          path: 'authorId',
          model: 'User',
          select: 'firstName lastName'
        }
      });

    const formattedProcesVerbal = {
      ...populatedProcesVerbal.toObject(),
      id: populatedProcesVerbal._id,
      document: populatedProcesVerbal.documentId ? {
        title: (populatedProcesVerbal.documentId).title,
        author: (populatedProcesVerbal.documentId).authorId ? {
          first_name: ((populatedProcesVerbal.documentId).authorId).firstName,
          last_name: ((populatedProcesVerbal.documentId).authorId).lastName,
        } : null,
      } : null,
      actions_decidees: populatedProcesVerbal.actionsDecidees,
    };

    // --- Notifications for new proces verbal ---
    await createNotification(author_id, 'Nouveau procès-verbal créé', `Le procès-verbal "${title}" a été créé.`);
    if (actions_decidees && actions_decidees.length > 0) {
      for (const action of actions_decidees) {
        await createNotification(action.responsable, 'Nouvelle action assignée', `Une action "${action.titre}" du procès-verbal "${title}" vous a été assignée.`);
      }
    }
    // --- End Notifications ---

    res.status(201).json(formattedProcesVerbal);
  } catch (error) {
    console.error('Error creating proces verbal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/proces-verbaux/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Map frontend field names to backend schema names and convert dates
  if (updates.meeting_date) { updates.meetingDate = new Date(updates.meeting_date); delete updates.meeting_date; }
  if (updates.next_meeting_date) { updates.nextMeetingDate = new Date(updates.next_meeting_date); delete updates.next_meeting_date; }
  if (updates.actions_decidees) { updates.actionsDecidees = updates.actions_decidees; delete updates.actions_decidees; }

  try {
    const oldProcesVerbal = await ProcesVerbal.findById(id);
    if (!oldProcesVerbal) {
      return res.status(404).json({ message: 'Proces Verbal not found' });
    }

    const procesVerbal = await ProcesVerbal.findByIdAndUpdate(id, updates, { new: true })
      .populate({
        path: 'documentId',
        select: 'title authorId',
        populate: {
          path: 'authorId',
          model: 'User',
          select: 'firstName lastName'
        }
      });
    if (!procesVerbal) {
      return res.status(404).json({ message: 'Proces Verbal not found' });
    }
    const formattedProcesVerbal = {
      ...procesVerbal.toObject(),
      id: procesVerbal._id,
      document: procesVerbal.documentId ? {
        title: (procesVerbal.documentId).title,
        author: (procesVerbal.documentId).authorId ? {
          first_name: ((procesVerbal.documentId).authorId).firstName,
          last_name: ((procesVerbal.documentId).authorId).lastName,
        } : null,
      } : null,
      actions_decidees: procesVerbal.actionsDecidees,
    };

    // --- Notifications for updated proces verbal ---
    const changedFields = Object.keys(updates).filter(key =>
      JSON.stringify(updates[key]) !== JSON.stringify(oldProcesVerbal.toObject()[key])
    );

    if (changedFields.length > 0) {
      const documentTitle = (await Document.findById(procesVerbal.documentId))?.title || 'Procès-Verbal';
      const authorId = (await Document.findById(procesVerbal.documentId))?.authorId;

      if (authorId) {
        await createNotification(authorId, 'Procès-verbal mis à jour', `Le procès-verbal "${documentTitle}" a été mis à jour. Champs modifiés: ${changedFields.join(', ')}.`);
      }

      // Notify responsible parties if actions_decidees were changed
      const oldActionTitles = new Set(oldProcesVerbal.actionsDecidees.map(a => a.titre));
      const newActionTitles = new Set(procesVerbal.actionsDecidees.map(a => a.titre));

      const addedActions = procesVerbal.actionsDecidees.filter(action => !oldActionTitles.has(action.titre));
      const updatedActions = procesVerbal.actionsDecidees.filter(action => {
        const oldAction = oldProcesVerbal.actionsDecidees.find(oa => oa.titre === action.titre);
        return oldAction && JSON.stringify(oldAction) !== JSON.stringify(action);
      });

      for (const action of addedActions) {
        if (Array.isArray(action.responsable) && action.responsable.length > 0) {
          await createNotification(action.responsable[0], 'Nouvelle action assignée', `Une nouvelle action "${action.titre}" du procès-verbal "${documentTitle}" vous a été assignée.`);
        }
      }
      for (const action of updatedActions) {
        if (Array.isArray(action.responsable) && action.responsable.length > 0) {
          await createNotification(action.responsable[0], 'Action mise à jour', `L'action "${action.titre}" du procès-verbal "${documentTitle}" a été mise à jour.`);
        }
      }
    }
    // --- End Notifications ---

    res.json(formattedProcesVerbal);
  } catch (error) {
    console.error('Error updating proces verbal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/proces-verbaux/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const procesVerbal = await ProcesVerbal.findByIdAndDelete(id);
    if (!procesVerbal) {
      return res.status(404).json({ message: 'Proces Verbal not found' });
    }
    // Optionally delete the associated document as well
    await Document.findByIdAndDelete(procesVerbal.documentId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting proces verbal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;