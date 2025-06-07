import { Schema, model, Document } from 'mongoose';

export interface IActivityLog extends Document {
  _id: string;
  action: string;
  details: string;
  entityId: string;
  entityType: 'USER' | 'DOCUMENT' | 'ACTION' | 'TASK' | 'CORRESPONDANCE' | 'PROCES_VERBAL' | 'REPORT' | 'SETTINGS';
  timestamp: Date;
  userId: string; // Reference to User
  ipAddress?: string;
  userAgent?: string;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  _id: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  entityId: { type: String, required: true },
  entityType: { 
    type: String, 
    enum: ['USER', 'DOCUMENT', 'ACTION', 'TASK', 'CORRESPONDANCE', 'PROCES_VERBAL', 'REPORT', 'SETTINGS'], 
    required: true 
  },
  timestamp: { type: Date, default: Date.now },
  userId: { type: String, ref: 'User', required: true }, // Reference to User model
  ipAddress: { type: String },
  userAgent: { type: String },
});

export const ActivityLog = model<IActivityLog>('ActivityLog', ActivityLogSchema);