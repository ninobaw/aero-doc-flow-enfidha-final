const { Schema, model } = require('mongoose');

// Embedded schema for ActionDecidee (re-used from Correspondance)
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

const ProcesVerbalSchema = new Schema({
  _id: { type: String, required: true },
  documentId: { type: String, ref: 'Document', required: true },
  meetingDate: { type: Date, required: true },
  participants: [{ type: String }],
  agenda: { type: String, required: true },
  decisions: { type: String, required: true },
  location: { type: String, required: true },
  meetingType: { type: String, required: true },
  airport: { 
    type: String, 
    enum: ['ENFIDHA', 'MONASTIR', 'GENERALE'], 
    required: true 
  },
  nextMeetingDate: { type: Date },
  actionsDecidees: [ActionDecideeSchema],
  createdAt: { type: Date, default: Date.now },
});

const ProcesVerbal = model('ProcesVerbal', ProcesVerbalSchema);
module.exports = { ProcesVerbal };