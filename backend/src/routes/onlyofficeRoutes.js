const { Router } = require('express');
const { Document } = require('../models/Document.js');
const { ActivityLog } = require('../models/ActivityLog.js');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const router = Router();

// Mock Document Server URL (replace with your actual OnlyOffice Document Server URL)
const ONLYOFFICE_DOC_SERVER_URL = process.env.ONLYOFFICE_DOC_SERVER_URL || 'http://localhost:80';

// Mock backend API URL (your application's backend URL)
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000';

// POST /api/onlyoffice/save-callback
// This endpoint is called by the OnlyOffice Document Server when a document is saved.
router.post('/save-callback', async (req, res) => {
  const { documentId } = req.query;
  const { status, url, history } = req.body; // OnlyOffice callback body

  console.log(`OnlyOffice Save Callback received for documentId: ${documentId}`);
  console.log('Callback Status:', status);
  console.log('New Document URL (from OnlyOffice):', url);
  console.log('History:', history);

  try {
    const document = await Document.findById(documentId);
    if (!document) {
      console.error(`Document with ID ${documentId} not found for save callback.`);
      return res.json({ error: 1, message: 'Document not found' });
    }

    // Status 2 means document is ready for saving
    if (status === 2) {
      // In a real scenario, you would:
      // 1. Download the updated document from the 'url' provided by OnlyOffice.
      //    This 'url' is a temporary URL to the updated document on the OnlyOffice server.
      // 2. Save this downloaded file to your permanent storage (e.g., local disk, S3, Supabase Storage).
      // 3. Update the document's file_path and version in your database.

      console.log(`Simulating download and save for document: ${document.title}`);
      // Mocking the file update:
      // For demonstration, we'll just update the document's `updatedAt` and increment version.
      // In a real app, you'd fetch the file from `url` and replace `document.filePath`.

      // Example of how you might download the file (requires 'node-fetch' or similar)
      /*
      const fetch = require('node-fetch');
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download document from OnlyOffice: ${response.statusText}`);
      }
      const buffer = await response.buffer();
      const newFilePath = path.join(path.dirname(document.filePath), `version_${document.version + 1}_${path.basename(document.filePath)}`);
      fs.writeFileSync(path.join(__dirname, '../../uploads', newFilePath), buffer);
      */

      const updatedDocument = await Document.findByIdAndUpdate(
        documentId,
        {
          $inc: { version: 1 }, // Increment version
          updatedAt: new Date(),
          // filePath: newFilePath, // Uncomment in real scenario
          // fileType: document.fileType, // Keep original file type
        },
        { new: true }
      );

      await ActivityLog.create({
        _id: uuidv4(),
        action: 'DOCUMENT_UPDATED_BY_EDITOR',
        details: `Document "${updatedDocument.title}" (ID: ${updatedDocument._id}) mis à jour via l'éditeur OnlyOffice. Nouvelle version: ${updatedDocument.version}.`,
        entityId: updatedDocument._id,
        entityType: 'DOCUMENT',
        userId: req.user ? req.user.id : 'system', // Use actual user ID if available from auth
        timestamp: new Date(),
      });

      console.log(`Document ${document.title} (ID: ${documentId}) saved successfully.`);
      res.json({ error: 0 }); // Success response for OnlyOffice
    } else {
      console.log(`OnlyOffice callback status ${status} received, no action taken.`);
      res.json({ error: 0 }); // Acknowledge other statuses
    }
  } catch (error) {
    console.error('Error processing OnlyOffice save callback:', error);
    res.json({ error: 1, message: 'Internal server error' });
  }
});

module.exports = router;