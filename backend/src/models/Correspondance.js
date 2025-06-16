const { Schema, model } = require('mongoose');

// Embedded schema for ActionDecidee
const ActionDecideeSchema = new Schema({
  titre: { type: String, required: true },
  description: { type: String },
  responsable: [{ type: String, required: true }], // Changed to array of Strings
  echeance: { type: String, required: true },
  priorite: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], 
    default: 'MEDIUM' 
  },
  statut: { 
    type: String, 
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], 
    default: 'PENDING' 
  },
  collaborateurs: [{ type: String }],
});

const CorrespondanceSchema = new Schema({
  _id: { type: String, required: true },
  authorId: { type: String, ref: 'User', required: true }, // Added authorId
  qrCode: { type: String, unique: true, required: true }, // Added qrCode
  filePath: { type: String }, // Added filePath
  fileType: { type: String }, // Added fileType
  type: { // New field: INCOMING or OUTGOING
    type: String,
    enum: ['INCOMING', 'OUTGOING'],
    required: true,
  },
  code: { type: String }, // New field: Manual code for now
  fromAddress: { type: String, required: true },
  toAddress: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], 
    default: 'MEDIUM' 
  },
  status: { 
    type: String, 
    enum: ['DRAFT', 'SENT', 'RECEIVED', 'ARCHIVED'], 
    default: 'DRAFT' 
  },
  airport: { 
    type: String, 
    enum: ['ENFIDHA', 'MONASTIR', 'GENERALE'], 
    required: true 
  },
  attachments: [{ type: String }],
  actionsDecidees: [ActionDecideeSchema],
  tags: [{ type: String }], // New field for tags
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }, // Added updatedAt
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }); // Ensure timestamps are handled

const Correspondance = model('Correspondance', CorrespondanceSchema);
module.exports = { Correspondance };