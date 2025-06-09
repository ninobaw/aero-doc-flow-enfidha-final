const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log(`Dossier 'uploads' créé à: ${uploadsDir}`);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('--- Multer Destination Debug ---');
    console.log('req.body:', req.body); // Log the entire req.body
    console.log('req.file:', file); // Log the file object

    const documentType = req.body.documentType || 'general'; // e.g., 'correspondances', 'formulaires'
    const airportCode = req.body.airportCode; // e.g., 'ENFIDHA', 'MONASTIR', 'GENERALE'
    const correspondenceType = req.body.correspondenceType; // e.g., 'INCOMING', 'OUTGOING'

    console.log(`Parsed: documentType='${documentType}', airportCode='${airportCode}', correspondenceType='${correspondenceType}'`);

    let targetDir = path.join(uploadsDir, documentType.toLowerCase());

    // Special handling for 'correspondances' to create nested folders
    if (documentType.toLowerCase() === 'correspondances' && airportCode && correspondenceType) {
      const typeFolder = correspondenceType === 'INCOMING' ? 'Arrivee' : 'Depart';
      targetDir = path.join(uploadsDir, 'correspondances', airportCode, typeFolder);
      console.log(`Conditional path for correspondence: ${targetDir}`);
    } else if (documentType.toLowerCase() === 'templates') {
      // Templates go into a specific 'templates' folder directly under uploads
      targetDir = path.join(uploadsDir, 'templates');
      console.log(`Conditional path for template: ${targetDir}`);
    } else {
      console.log(`Fallback path: ${targetDir}`);
    }

    // Create directories recursively if they don't exist
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`Dossier d'upload créé ou vérifié: ${targetDir}`);
    cb(null, targetDir);
    console.log('--- End Multer Destination Debug ---');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFileName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log(`Nom de fichier généré: ${newFileName}`);
    cb(null, newFileName);
  }
});

const upload = multer({ storage: storage });

// POST /api/uploads/file - Upload a single file
router.post('/file', upload.single('file'), (req, res) => {
  console.log('Requête POST /api/uploads/file reçue.');
  console.log('req.file (after multer processing):', req.file);
  console.log('req.body (after multer processing):', req.body);

  if (!req.file) {
    console.error('Aucun fichier uploadé.');
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  // filePath should be relative to the base 'uploads' directory
  const filePath = path.relative(uploadsDir, req.file.path); 
  console.log(`Fichier uploadé: ${req.file.filename}, Chemin relatif: ${filePath}`);
  res.status(200).json({
    message: 'File uploaded successfully',
    fileName: req.file.filename,
    filePath: filePath, // e.g., 'correspondances/MONASTIR/Arrivee/file-12345.pdf'
    fileUrl: `/uploads/${filePath}` // URL to access the file
  });
});

// POST /api/uploads/template - Upload a template file
router.post('/template', upload.single('templateFile'), (req, res) => {
  console.log('Requête POST /api/uploads/template reçue.');
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);

  if (!req.file) {
    console.error('Aucun fichier modèle uploadé.');
    return res.status(400).json({ message: 'No template file uploaded.' });
  }
  const filePath = path.relative(uploadsDir, req.file.path);
  console.log(`Fichier modèle uploadé: ${req.file.filename}, Chemin relatif: ${filePath}`);
  res.status(200).json({
    message: 'Template uploaded successfully',
    fileName: req.file.filename,
    filePath: filePath,
    fileUrl: `/uploads/${filePath}`
  });
});

// POST /api/uploads/copy-template - Copy a template file to a new document file
router.post('/copy-template', (req, res) => {
  const { templateFilePath, documentType } = req.body;
  console.log('Requête POST /api/uploads/copy-template reçue.');
  console.log('templateFilePath:', templateFilePath, 'documentType:', documentType);

  if (!templateFilePath || !documentType) {
    console.error('Chemin du fichier modèle ou type de document manquant pour la copie.');
    return res.status(400).json({ message: 'Template file path and document type are required.' });
  }

  const sourcePath = path.join(uploadsDir, templateFilePath);
  const targetDir = path.join(uploadsDir, documentType.toLowerCase()); // Target directory based on documentType

  if (!fs.existsSync(sourcePath)) {
    console.error(`Fichier modèle source non trouvé: ${sourcePath}`);
    return res.status(404).json({ message: 'Template file not found.' });
  }
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true }); // Create recursively
    console.log(`Dossier cible pour la copie créé: ${targetDir}`);
  }

  const fileName = path.basename(sourcePath);
  const newFileName = `${uuidv4()}-${fileName}`; // Ensure unique name for the copy
  const destinationPath = path.join(targetDir, newFileName);

  fs.copyFile(sourcePath, destinationPath, (err) => {
    if (err) {
      console.error('Erreur lors de la copie du fichier modèle:', err);
      return res.status(500).json({ message: 'Failed to copy template file.' });
    }
    const relativePath = path.relative(uploadsDir, destinationPath);
    console.log(`Modèle copié vers: ${relativePath}`);
    res.status(200).json({
      message: 'Template copied successfully',
      filePath: relativePath,
      fileUrl: `/uploads/${relativePath}`
    });
  });
});

// DELETE /api/uploads/file - Delete a file
router.delete('/file', (req, res) => {
  const { filePath } = req.body; // Expecting relative path, e.g., 'correspondances/MONASTIR/Arrivee/file-123.pdf'
  console.log('Requête DELETE /api/uploads/file reçue pour:', filePath);

  if (!filePath) {
    console.error('Chemin du fichier manquant pour la suppression.');
    return res.status(400).json({ message: 'File path is required.' });
  }

  const fullPath = path.join(uploadsDir, filePath);

  fs.unlink(fullPath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.warn(`Fichier non trouvé pour suppression (peut-être déjà supprimé): ${fullPath}`);
        return res.status(404).json({ message: 'File not found.' });
      }
      console.error('Erreur lors de la suppression du fichier:', err);
      return res.status(500).json({ message: 'Failed to delete file.' });
    }
    console.log(`Fichier supprimé avec succès: ${fullPath}`);
    res.status(200).json({ message: 'File deleted successfully.' });
  });
});

module.exports = router;