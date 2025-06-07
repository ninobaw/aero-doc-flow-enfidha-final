import { Schema, model, Document } from 'mongoose';

// Embedded schema for ActionDecidee (re-used from Correspondance)
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

export interface IProcesVerbal extends Document {
  _id: string;
  documentId: string; // Reference to Document
  meetingDate: Date;
  participants: string[];
  agenda: string;
  decisions: string;
  location: string;
  meetingType: string;
  airport: 'ENFIDHA' | 'MONASTIR';
  nextMeetingDate?: Date;
  actionsDecidees?: typeof ActionDecideeSchema[]; // Embedded actions
  createdAt: Date;
}

const ProcesVerbalSchema = new Schema<IProcesVerbal>({
  _id: { type: String, required: true },
  documentId: { type: String, ref: 'Document', required: true }, // Reference to Document model
  meetingDate: { type: Date, required: true },
  participants: [{ type: String }],
  agenda: { type: String, required: true },
  decisions: { type: String, required: true },
  location: { type: String, required: true },
  meetingType: { type: String, required: true },
  airport: { 
    type: String, 
    enum: ['ENFIDHA', 'MONASTIR'], 
    required: true 
  },
  nextMeetingDate: { type: Date },
  actionsDecidees: [ActionDecideeSchema], // Embedded sub-documents
  createdAt: { type: Date, default: Date.now },
});

export const ProcesVerbal = model<IProcesVerbal>('ProcesVerbal', ProcesVerbalSchema);