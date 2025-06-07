import { Schema, model, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  _id: string;
  title: string;
  type: 'FORMULAIRE_DOC' | 'CORRESPONDANCE' | 'PROCES_VERBAL' | 'QUALITE_DOC' | 'NOUVEAU_DOC' | 'GENERAL';
  content?: string;
  authorId: string; // Reference to User
  version: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  airport: 'ENFIDHA' | 'MONASTIR';
  filePath?: string;
  fileType?: string;
  qrCode: string;
  viewsCount: number;
  downloadsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['FORMULAIRE_DOC', 'CORRESPONDANCE', 'PROCES_VERBAL', 'QUALITE_DOC', 'NOUVEAU_DOC', 'GENERAL'], 
    required: true 
  },
  content: { type: String },
  authorId: { type: String, ref: 'User', required: true }, // Reference to User model
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

export const Document = model<IDocument>('Document', DocumentSchema);