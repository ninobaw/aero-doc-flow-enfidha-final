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
    const documentType = req.body.documentType || 'general'; // Get document type from request body
    const typeDir = path.join(uploadsDir, documentType.toLowerCase());
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir);
      console.log(`Sous-dossier d'upload créé: ${typeDir}`);
    }
    cb(null, typeDir);
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
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);

  if (!req.file) {
    console.error('Aucun fichier uploadé.');
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  const filePath = path.relative(uploadsDir, req.file.path); // Store path relative to uploadsDir
  console.log(`Fichier uploadé: ${req.file.filename}, Chemin relatif: ${filePath}`);
  res.status(200).json({
    message: 'File uploaded successfully',
    fileName: req.file.filename,
    filePath: filePath, // e.g., 'formulaires/file-12345.pdf'
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
  const targetDir = path.join(uploadsDir, documentType.toLowerCase());

  if (!fs.existsSync(sourcePath)) {
    console.error(`Fichier modèle source non trouvé: ${sourcePath}`);
    return res.status(404).json({ message: 'Template file not found.' });
  }
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
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
  const { filePath } = req.body; // Expecting relative path, e.g., 'formulaires/file-123.pdf'
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