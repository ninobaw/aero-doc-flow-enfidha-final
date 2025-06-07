import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string; // Using string for compatibility with Supabase UUIDs if needed for migration
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'ADMINISTRATOR' | 'APPROVER' | 'USER' | 'VISITOR';
  profilePhoto?: string;
  airport: 'ENFIDHA' | 'MONASTIR';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  phone?: string;
  department?: string;
  position?: string;
  lastLogin?: Date;
}

const UserSchema = new Schema<IUser>({
  _id: { type: String, required: true }, // Store Supabase UUID as string _id
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['SUPER_ADMIN', 'ADMINISTRATOR', 'APPROVER', 'USER', 'VISITOR'], 
    default: 'USER' 
  },
  profilePhoto: { type: String },
  airport: { 
    type: String, 
    enum: ['ENFIDHA', 'MONASTIR'], 
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  phone: { type: String },
  department: { type: String },
  position: { type: String },
  lastLogin: { type: Date },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export const User = model<IUser>('User', UserSchema);