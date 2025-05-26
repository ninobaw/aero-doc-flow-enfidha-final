
import { DocumentType, Priority, ActionStatus, UserRole } from '../types';
import { DOCUMENT_TYPES, PRIORITIES, ACTION_STATUS, USER_ROLES } from '../constants';

export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatDateTime = (date: Date | string): string => {
  return new Date(date).toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const generateQRCode = (documentId: string): string => {
  return `QR-${documentId}-${Date.now()}`;
};

export const generateReference = (type: DocumentType, airport: string): string => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  const typeCode = type.substring(0, 3).toUpperCase();
  const airportCode = airport.substring(0, 3).toUpperCase();
  
  return `${typeCode}-${airportCode}-${year}${month}-${random}`;
};

export const getDocumentTypeLabel = (type: DocumentType): string => {
  return DOCUMENT_TYPES[type]?.label || type;
};

export const getPriorityLabel = (priority: Priority): string => {
  return PRIORITIES[priority]?.label || priority;
};

export const getStatusLabel = (status: ActionStatus): string => {
  return ACTION_STATUS[status]?.label || status;
};

export const getUserRoleLabel = (role: UserRole): string => {
  return USER_ROLES[role]?.label || role;
};

export const calculateProgress = (totalTasks: number, completedTasks: number): number => {
  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateFileType = (fileName: string, allowedTypes: string[]): boolean => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return allowedTypes.includes(extension);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
