import { Schema, model, Document } from 'mongoose';

// Embedded schema for ActionDecidee
const ActionDecideeSchema = new Schema({
  titre: { type: String, required: true },
  description: { type: String },
  responsable: { type: String, required: true }, // Could be a User ID reference
  echeance: { type: String, required: true }, // Storing as string for simplicity, can be Date
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
  collaborateurs: [{ type: String }], // Array of User IDs
});

export interface ICorrespondance extends Document {
  _id: string;
  documentId: string; // Reference to Document
  fromAddress: string;
  toAddress: string;
  subject: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'DRAFT' | 'SENT' | 'RECEIVED' | 'ARCHIVED';
  airport: 'ENFIDHA' | 'MONASTIR';
  attachments?: string[];
  actionsDecidees?: typeof ActionDecideeSchema[]; // Embedded actions
  createdAt: Date;
}

const CorrespondanceSchema = new Schema<ICorrespondance>({
  _id: { type: String, required: true },
  documentId: { type: String, ref: 'Document', required: true }, // Reference to Document model
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
    enum: ['ENFIDHA', 'MONASTIR'], 
    required: true 
  },
  attachments: [{ type: String }],
  actionsDecidees: [ActionDecideeSchema], // Embedded sub-documents
  createdAt: { type: Date, default: Date.now },
});

export const Correspondance = model<ICorrespondance>('Correspondance', CorrespondanceSchema);