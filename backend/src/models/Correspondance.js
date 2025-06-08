const { Schema, model } = require('mongoose');

// Embedded schema for ActionDecidee
const ActionDecideeSchema = new Schema({
  titre: { type: String, required: true },
  description: { type: String },
  responsable: { type: String, required: true },
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
  documentId: { type: String, ref: 'Document', required: true },
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
  createdAt: { type: Date, default: Date.now },
});

const Correspondance = model('Correspondance', CorrespondanceSchema);
module.exports = { Correspondance };