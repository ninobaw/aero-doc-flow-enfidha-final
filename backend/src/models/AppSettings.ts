import { Schema, model, Document } from 'mongoose';

export interface IAppSettings extends Document {
  _id: string;
  userId: string; // Reference to User
  companyName: string;
  defaultAirport: 'ENFIDHA' | 'MONASTIR';
  language: string;
  theme: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  sessionTimeout: number;
  requireTwoFactor: boolean;
  passwordExpiry: number;
  documentRetention: number;
  autoArchive: boolean;
  maxFileSize: number;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  useSsl: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AppSettingsSchema = new Schema<IAppSettings>({
  _id: { type: String, required: true },
  userId: { type: String, ref: 'User', required: true, unique: true }, // One-to-one with User
  companyName: { type: String, default: 'AeroDoc - Gestion Documentaire' },
  defaultAirport: { 
    type: String, 
    enum: ['ENFIDHA', 'MONASTIR'], 
    default: 'ENFIDHA' 
  },
  language: { type: String, default: 'fr' },
  theme: { type: String, default: 'light' },
  emailNotifications: { type: Boolean, default: true },
  smsNotifications: { type: Boolean, default: false },
  pushNotifications: { type: Boolean, default: true },
  sessionTimeout: { type: Number, default: 60 },
  requireTwoFactor: { type: Boolean, default: false },
  passwordExpiry: { type: Number, default: 90 },
  documentRetention: { type: Number, default: 365 },
  autoArchive: { type: Boolean, default: true },
  maxFileSize: { type: Number, default: 10 },
  smtpHost: { type: String, default: '' },
  smtpPort: { type: Number, default: 587 },
  smtpUsername: { type: String, default: '' },
  useSsl: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export const AppSettings = model<IAppSettings>('AppSettings', AppSettingsSchema);