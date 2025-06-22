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

// Helper function to determine the final target directory
const getFinalTargetDir = (baseDir, documentType, scopeCode, departmentCode, correspondenceType) => {
  let finalDir = baseDir;

  // For templates, they go directly into the 'templates' folder
  if (documentType.toLowerCase() === 'templates') {
    return path.join(baseDir, 'templates');
  }

  // For correspondences, use a specific structure: uploads/correspondances/<airportCode>/<typeFolder>
  if (documentType.toLowerCase() === 'correspondances' && scopeCode && correspondenceType) {
    const typeFolder = correspondenceType === 'INCOMING' ? 'Arrivee' : 'Depart';
    finalDir = path.join(baseDir, 'correspondances', scopeCode, typeFolder);
  } 
  // For other document types, use the requested structure: uploads/<scope>/<department>/<documentType>
  else if (scopeCode && departmentCode && documentType) {
    finalDir = path.join(baseDir, scopeCode, departmentCode, documentType);
  } else {
    // Fallback for general documents or if specific codes are missing
    finalDir = path.join(baseDir, documentType);
  }
  return finalDir;
};


// POST /api/uploads/file - Upload a single file and move it to final destination
router.post('/file', upload.single('file'), (req, res) => {
  console.log('Requête POST /api/uploads/file reçue.');
  console.log('req.file (after multer processing):', req.file);
  console.log('req.body (after multer processing):', req.body);

  const { documentType, scopeCode, departmentCode, correspondenceType } = req.body;

  // --- NOUVEAUX LOGS POUR LE DÉBOGAGE DE LA CLASSIFICATION DES CORRESPONDANCES ---
  console.log('DEBUG CLASSIFICATION: documentType reçu:', documentType);
  console.log('DEBUG CLASSIFICATION: scopeCode (aéroport) reçu:', scopeCode);
  console.log('DEBUG CLASSIFICATION: correspondenceType reçu:', correspondenceType);
  // --- FIN DES NOUVEAUX LOGS ---

  if (!req.file) {
    console.error('Aucun fichier uploadé.');
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const originalTempPath = req.file.path;
  const fileName = req.file.filename; // This now includes the original name + unique suffix

  // Determine final target directory using the helper
  const finalTargetDir = getFinalTargetDir(uploadsDir, documentType, scopeCode, departmentCode, correspondenceType);

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
  // Templates are always stored directly under 'uploads/templates'
  const finalTargetDir = path.join(uploadsDir, 'templates');
  fs.mkdirSync(finalTargetDir, { recursive: true }); // Ensure templates folder exists

  const originalTempPath = req.file.path;
  const fileName = req.file.filename;
  const finalFilePath = path.join(finalTargetDir, fileName);

  fs.rename(originalTempPath, finalFilePath, (err) => {
    if (err) {
      console.error('Erreur lors du déplacement du fichier modèle:', err);
      return res.status(500).json({ message: 'Failed to move template file.' });
    }
    const relativePath = path.relative(uploadsDir, finalFilePath);
    console.log(`Fichier modèle déplacé vers: ${relativePath}`);
    res.status(200).json({
      message: 'Template uploaded successfully',
      fileName: fileName,
      filePath: relativePath,
      fileUrl: `/uploads/${relativePath}`
    });
  });
});

// POST /api/uploads/copy-template - Copy a template file to a new document file
router.post('/copy-template', (req, res) => {
  const { templateFilePath, documentType, scopeCode, departmentCode } = req.body; // Added scopeCode, departmentCode
  console.log('Requête POST /api/uploads/copy-template reçue.');
  console.log('templateFilePath:', templateFilePath, 'documentType:', documentType, 'scopeCode:', scopeCode, 'departmentCode:', departmentCode);

  if (!templateFilePath || !documentType || !scopeCode || !departmentCode) {
    console.error('Chemin du fichier modèle, type de document, scope ou département manquant pour la copie.');
    return res.status(400).json({ message: 'Template file path, document type, scope, and department are required.' });
  }

  const sourcePath = path.join(uploadsDir, templateFilePath);
  // Determine target directory using the helper, assuming it's not a correspondence
  const targetDir = getFinalTargetDir(uploadsDir, documentType, scopeCode, departmentCode, null); // Pass null for correspondenceType

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