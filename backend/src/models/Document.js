const { Schema, model } = require('mongoose');

const DocumentSchema = new Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['FORMULAIRE_DOC', 'CORRESPONDANCE', 'PROCES_VERBAL', 'QUALITE_DOC', 'NOUVEAU_DOC', 'GENERAL', 'TEMPLATE'], // Added TEMPLATE
    required: true 
  },
  content: { type: String },
  authorId: { type: String, ref: 'User', required: true },
  version: { type: Number, default: 1 },
  status: { 
    type: String, 
    enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'], 
    default: 'DRAFT' 
  },
  airport: { 
    type: String, 
    enum: ['ENFIDHA', 'MONASTIR', 'GENERALE'], 
    required: true 
  },
  filePath: { type: String }, // Relative path to the file in the uploads directory
  fileType: { type: String },
  qrCode: { type: String, unique: true, required: true },
  viewsCount: { type: Number, default: 0 },
  downloadsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // New codification fields
  company_code: { type: String },
  scope_code: { type: String },
  department_code: { type: String },
  sub_department_code: { type: String },
  document_type_code: { type: String },
  language_code: { type: String },
  sequence_number: { type: Number },
  isTemplate: { type: Boolean, default: false }, // New field
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

const Document = model('Document', DocumentSchema);
module.exports = { Document };