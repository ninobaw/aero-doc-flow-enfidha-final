const { Router } = require('express');
const { Document } = require('../models/Document.js'); // Import Document model
const { User } = require('../models/User.js'); // Import User model
const { ActivityLog } = require('../models/ActivityLog.js'); // Import ActivityLog model
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // Import axios for file download
const { v4: uuidv4 } = require('uuid');

const router = Router();

// Configuration de base pour OnlyOffice Document Server
// REMPLACEZ CETTE URL PAR L'URL DE VOTRE PROPRE SERVEUR ONLYOFFICE DOCUMENT SERVER
const ONLYOFFICE_DOC_SERVER_URL = process.env.ONLYOFFICE_DOC_SERVER_URL || 'http://localhost:8000'; // Default for local testing

// Helper function to map file extension to OnlyOffice document type
const getOnlyOfficeDocumentType = (fileExtension) => {
  switch (fileExtension) {
    case 'docx':
    case 'doc':
    case 'odt':
    case 'rtf':
      return 'word';
    case 'xlsx':
    case 'xls':
    case 'ods':
    case 'csv':
      return 'cell';
    case 'pptx':
    case 'ppt':
    case 'odp':
      return 'slide';
    default:
      return null; // Or handle unsupported types
  }
};

// Endpoint pour obtenir la configuration de l'éditeur
router.post('/editor', async (req, res) => {
  const { documentId, userId, userName, userEmail } = req.body;

  if (!documentId || !userId || !userName || !userEmail) {
    return res.status(400).json({ message: 'Missing required parameters for editor configuration.' });
  }

  try {
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    if (!document.filePath) {
      return res.status(400).json({ message: 'Document has no associated file for editing.' });
    }

    // Construct the full URL to the document file
    // Assuming your backend serves static files from /uploads
    const documentFileUrl = `${req.protocol}://${req.get('host')}/uploads/${document.filePath}`;
    const fileExtension = path.extname(document.filePath).toLowerCase().substring(1); // e.g., 'docx', 'pdf'
    const onlyOfficeDocType = getOnlyOfficeDocumentType(fileExtension);

    if (!onlyOfficeDocType) {
      return res.status(400).json({ message: `Unsupported file type for OnlyOffice editor: ${fileExtension}` });
    }

    // Generate a unique document key for OnlyOffice
    // This key is crucial for OnlyOffice to track document versions and co-editing sessions.
    // It should change if the document content changes significantly (e.g., new version).
    // For simplicity, we'll use document ID + updated_at timestamp.
    const documentKey = `${document.id}-${new Date(document.updatedAt).getTime()}`;

    // OnlyOffice editor configuration
    const editorConfig = {
      documentType: onlyOfficeDocType, // 'word', 'cell', 'slide'
      document: {
        fileType: fileExtension,
        key: documentKey,
        title: document.title,
        url: documentFileUrl,
        // Permissions for the user
        permissions: {
          edit: true, // Allow editing
          download: true,
          print: true,
          fillForms: true,
          review: true,
          comment: true,
          // Add other permissions as needed based on user role
        },
      },
      editorConfig: {
        callbackUrl: `${req.protocol}://${req.get('host')}/api/onlyoffice/track`, // URL for OnlyOffice to send updates
        lang: 'fr', // Editor language
        mode: 'edit', // 'edit' or 'view'
        user: {
          id: userId,
          name: userName,
          email: userEmail,
        },
        customization: {
          // Example customization: hide chat, show autosave
          chat: false,
          autosave: true,
          // Add more customization options as needed
        },
      },
      // The URL to the OnlyOffice Document Server's API script
      apiScriptUrl: `${ONLYOFFICE_DOC_SERVER_URL}/web-apps/apps/api/documents/api.js`,
      // The URL to the OnlyOffice Document Server's editor page (for embedding)
      editorUrl: ONLYOFFICE_DOC_SERVER_URL, // This is the base URL for the Document Server
      // You might need to pass a token or other security parameters here in a real app
    };

    res.json({ config: editorConfig }); // Send the full config object to the frontend

  } catch (error) {
    console.error('Error generating OnlyOffice editor config:', error);
    res.status(500).json({ message: 'Server error generating editor configuration.' });
  }
});

// Endpoint for document tracking (OnlyOffice Document Server sends updates here)
router.post('/track', async (req, res) => {
  // This is the callback URL where OnlyOffice Document Server sends document changes.
  // You would parse the body, save the document, handle co-editing, etc.
  console.log('OnlyOffice: Track callback received.');
  console.log('OnlyOffice Callback Body:', JSON.stringify(req.body, null, 2));

  const { status, url, key, users } = req.body;

  // Status 2: document is being edited (intermediate save)
  // Status 6: document is saved (final save, editor closed or force save)
  if (status === 2 || status === 6) {
    try {
      // Extract document ID from the key (assuming key format: documentId-timestamp)
      const documentId = key.split('-')[0];
      const document = await Document.findById(documentId);

      if (!document) {
        console.error(`OnlyOffice: Document with ID ${documentId} not found for tracking.`);
        return res.json({ error: 1, message: 'Document not found' });
      }

      if (!url) {
        console.error('OnlyOffice: No download URL provided in callback.');
        return res.json({ error: 1, message: 'No download URL' });
      }

      // Determine the full path where the file should be saved
      // Reconstruct the original file path based on the document's filePath
      const uploadsDir = path.join(__dirname, '../../uploads');
      const targetFilePath = path.join(uploadsDir, document.filePath);

      // Ensure the directory exists
      const targetDir = path.dirname(targetFilePath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Download the updated file from OnlyOffice Document Server
      const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream',
      });

      const writer = fs.createWriteStream(targetFilePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      console.log(`OnlyOffice: Document ${document.title} (ID: ${documentId}) saved to ${targetFilePath}`);

      // Update document in MongoDB
      const updatedDocument = await Document.findByIdAndUpdate(
        documentId,
        {
          $inc: { version: 1 }, // Increment version
          updatedAt: new Date(), // Update modification timestamp
        },
        { new: true }
      );

      // Log document update activity
      const editorUser = users && users.length > 0 ? users[0] : { id: 'unknown', name: 'Unknown Editor' };
      await ActivityLog.create({
        _id: uuidv4(),
        action: 'DOCUMENT_UPDATED_ONLYOFFICE',
        details: `Document "${updatedDocument.title}" (ID: ${updatedOffice.id}) modifié via OnlyOffice. Nouvelle version: ${updatedDocument.version}.`,
        entityId: updatedDocument._id,
        entityType: 'DOCUMENT',
        userId: editorUser.id, // Use the user ID from OnlyOffice callback
        timestamp: new Date(),
      });

      res.json({ error: 0 }); // Respond with success to OnlyOffice Document Server

    } catch (error) {
      console.error('OnlyOffice: Error processing track callback:', error);
      res.json({ error: 1, message: 'Internal server error during document save' });
    }
  } else {
    // Handle other statuses if necessary (e.g., 1: document is being edited, 3: document is closed)
    console.log(`OnlyOffice: Received status ${status} for document ${key}. No save action taken.`);
    res.json({ error: 0 });
  }
});

// Endpoint for document conversion (if you need to convert documents via OnlyOffice)
router.post('/convert', (req, res) => {
  // This endpoint would typically send a request to the OnlyOffice Document Server
  // to convert a document from one format to another.
  console.log('OnlyOffice: Convert endpoint hit.');
  res.status(200).json({ message: 'OnlyOffice convert endpoint placeholder.' });
});

// Endpoint to get document info (used by OnlyOffice Document Server)
router.get('/document-info', (req, res) => {
  // This endpoint provides metadata about a document to the OnlyOffice Document Server.
  // You would typically return document URL, file type, document key, etc.
  console.log('OnlyOffice: Document info endpoint hit.');
  res.status(200).json({ message: 'OnlyOffice document info endpoint placeholder.' });
});

module.exports = router;