import { Schema, model, Document } from 'mongoose';

export interface IReport extends Document {
  _id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  content?: Record<string, any>;
  status: string;
  frequency?: string;
  lastGenerated?: Date;
  createdBy: string; // Reference to User
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  config: { type: Schema.Types.Mixed, default: {} },
  content: { type: Schema.Types.Mixed },
  status: { type: String, default: 'PENDING' },
  frequency: { type: String },
  lastGenerated: { type: Date },
  createdBy: { type: String, ref: 'User', required: true }, // Reference to User model
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export const Report = model<IReport>('Report', ReportSchema);