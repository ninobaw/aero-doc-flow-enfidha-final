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

// Define a temporary directory for initial Multer uploads
const tempUploadsDir = path.join(uploadsDir, 'temp');
if (!fs.existsSync(tempUploadsDir)) {
  fs.mkdirSync(tempUploadsDir);
  console.log(`Dossier temporaire 'uploads/temp' créé à: ${tempUploadsDir}`);
}

// Multer storage configuration for temporary storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Always save to the temporary directory first
    cb(null, tempUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Use originalname, but add a unique suffix before the extension
    const originalNameWithoutExt = path.parse(file.originalname).name;
    const extension = path.extname(file.originalname);
    const newFileName = `${originalNameWithoutExt}-${uniqueSuffix}${extension}`;
    cb(null, newFileName);
  }
});

const upload = multer({ storage: storage });

// POST /api/uploads/file - Upload a single file and move it to final destination
router.post('/file', upload.single('file'), (req, res) => {
  console.log('Requête POST /api/uploads/file reçue.');
  console.log('req.file (after multer processing):', req.file);
  console.log('req.body (after multer processing):', req.body);

  if (!req.file) {
    console.error('Aucun fichier uploadé.');
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const { documentType, airportCode, correspondenceType } = req.body;
  const originalTempPath = req.file.path;
  const fileName = req.file.filename; // This now includes the original name + unique suffix

  let finalTargetDir = path.join(uploadsDir, documentType.toLowerCase());

  // Determine final target directory based on documentType and other fields
  if (documentType.toLowerCase() === 'correspondances' && airportCode && correspondenceType) {
    const typeFolder = correspondenceType === 'INCOMING' ? 'Arrivee' : 'Depart';
    finalTargetDir = path.join(uploadsDir, 'correspondances', airportCode, typeFolder);
  } else if (documentType.toLowerCase() === 'templates') {
    finalTargetDir = path.join(uploadsDir, 'templates');
  }
  // For other document types, they go directly under uploads/<documentType>

  // Ensure the final target directory exists
  fs.mkdirSync(finalTargetDir, { recursive: true });
  console.log(`Dossier cible final créé ou vérifié: ${finalTargetDir}`);

  const finalFilePath = path.join(finalTargetDir, fileName);

  // Move the file from temporary to final destination
  fs.rename(originalTempPath, finalFilePath, (err) => {
    if (err) {
      console.error('Erreur lors du déplacement du fichier:', err);
      return res.status(500).json({ message: 'Failed to move file to final destination.' });
    }

    const relativePath = path.relative(uploadsDir, finalFilePath);
    console.log(`Fichier déplacé vers: ${relativePath}`);
    res.status(200).json({
      message: 'File uploaded and moved successfully',
      fileName: fileName, // Send back the new unique filename
      filePath: relativePath, // e.g., 'correspondances/MONASTIR/Arrivee/rapport-12345.pdf'
      fileUrl: `/uploads/${relativePath}` // URL to access the file
    });
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
    fileName: req.file.filename, // Send back the new unique filename
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