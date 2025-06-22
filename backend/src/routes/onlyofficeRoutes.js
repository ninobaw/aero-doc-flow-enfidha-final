const { Router } = require('express');
const { Document } = require('../models/Document.js'); // Import Document model
const { User } = require('../models/User.js'); // Import User model
const path = require('path');
const fs = require('fs');
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
router.post('/track', (req, res) => {
  // This is the callback URL where OnlyOffice Document Server sends document changes.
  // You would parse the body, save the document, handle co-editing, etc.
  console.log('OnlyOffice: Track callback received.');
  console.log('OnlyOffice Callback Body:', req.body);

  // Example: If status is 2 (document is being edited) or 6 (document is saved)
  // In a real application, you would:
  // 1. Validate the request (e.g., check document key, token)
  // 2. Download the updated document from the URL provided in the body (req.body.url)
  // 3. Save the updated document to your storage (e.g., overwrite the old file, create a new version)
  // 4. Update your database (e.g., update document's `updatedAt` timestamp, increment version)

  const { status, url, key, users } = req.body;

  if (status === 2 || status === 6) { // 2: document is being edited, 6: document is saved
    console.log(`Document ${key} is being edited or saved. Download URL: ${url}`);
    // Here you would implement logic to download the file from 'url'
    // and save it to your server's 'uploads' directory, updating the document in MongoDB.
    // This is a complex operation involving file streams and database updates.
    // For this example, we'll just log it.
  }

  // Respond with success to OnlyOffice Document Server
  res.json({ error: 0 });
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