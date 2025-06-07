const { Schema, model } = require('mongoose');

const DocumentSchema = new Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['FORMULAIRE_DOC', 'CORRESPONDANCE', 'PROCES_VERBAL', 'QUALITE_DOC', 'NOUVEAU_DOC', 'GENERAL'], 
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
    enum: ['ENFIDHA', 'MONASTIR'], 
    required: true 
  },
  filePath: { type: String },
  fileType: { type: String },
  qrCode: { type: String, unique: true, required: true },
  viewsCount: { type: Number, default: 0 },
  downloadsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

const Document = model('Document', DocumentSchema);
module.exports = { Document };