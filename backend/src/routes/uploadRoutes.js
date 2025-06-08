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
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const documentType = req.body.documentType || 'general'; // Get document type from request body
    const typeDir = path.join(uploadsDir, documentType.toLowerCase());
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir);
    }
    cb(null, typeDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// POST /api/uploads/file - Upload a single file
router.post('/file', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  const filePath = path.relative(uploadsDir, req.file.path); // Store path relative to uploadsDir
  res.status(200).json({
    message: 'File uploaded successfully',
    fileName: req.file.filename,
    filePath: filePath, // e.g., 'formulaires/file-12345.pdf'
    fileUrl: `/uploads/${filePath}` // URL to access the file
  });
});

// POST /api/uploads/template - Upload a template file
router.post('/template', upload.single('templateFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No template file uploaded.' });
  }
  const filePath = path.relative(uploadsDir, req.file.path);
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

  if (!templateFilePath || !documentType) {
    return res.status(400).json({ message: 'Template file path and document type are required.' });
  }

  const sourcePath = path.join(uploadsDir, templateFilePath);
  const targetDir = path.join(uploadsDir, documentType.toLowerCase());

  if (!fs.existsSync(sourcePath)) {
    return res.status(404).json({ message: 'Template file not found.' });
  }
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }

  const fileName = path.basename(sourcePath);
  const newFileName = `${uuidv4()}-${fileName}`; // Ensure unique name for the copy
  const destinationPath = path.join(targetDir, newFileName);

  fs.copyFile(sourcePath, destinationPath, (err) => {
    if (err) {
      console.error('Error copying template file:', err);
      return res.status(500).json({ message: 'Failed to copy template file.' });
    }
    const relativePath = path.relative(uploadsDir, destinationPath);
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

  if (!filePath) {
    return res.status(400).json({ message: 'File path is required.' });
  }

  const fullPath = path.join(uploadsDir, filePath);

  fs.unlink(fullPath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ message: 'File not found.' });
      }
      console.error('Error deleting file:', err);
      return res.status(500).json({ message: 'Failed to delete file.' });
    }
    res.status(200).json({ message: 'File deleted successfully.' });
  });
});

module.exports = router;