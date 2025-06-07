import { Schema, model, Document } from 'mongoose';

export interface IAction extends Document {
  _id: string;
  title: string;
  description?: string;
  assignedTo: string[]; // Array of User IDs
  dueDate: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  parentDocumentId?: string; // Reference to Document
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ActionSchema = new Schema<IAction>({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: [{ type: String, ref: 'User' }], // Array of references to User model
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], 
    default: 'MEDIUM' 
  },
  parentDocumentId: { type: String, ref: 'Document' }, // Reference to Document model
  progress: { type: Number, default: 0 },
  estimatedHours: { type: Number },
  actualHours: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export const Action = model<IAction>('Action', ActionSchema);