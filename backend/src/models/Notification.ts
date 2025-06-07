import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  _id: string;
  userId?: string; // Optional reference to User
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  _id: { type: String, required: true },
  userId: { type: String, ref: 'User' }, // Optional reference to User model
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'error'], 
    default: 'info' 
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export const Notification = model<INotification>('Notification', NotificationSchema);