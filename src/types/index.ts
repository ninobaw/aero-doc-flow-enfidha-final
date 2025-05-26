
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMINISTRATOR = 'ADMINISTRATOR',
  APPROVER = 'APPROVER',
  USER = 'USER',
  VISITOR = 'VISITOR'
}

export enum ActionStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum DocumentType {
  FORMULAIRE_DOC = 'FORMULAIRE_DOC',
  CORRESPONDANCE = 'CORRESPONDANCE',
  PROCES_VERBAL = 'PROCES_VERBAL',
  GENERAL = 'GENERAL'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePhoto?: string;
  airport: 'ENFIDHA' | 'MONASTIR';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  qrCode: string;
  version: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  actions: Action[];
  history: DocumentHistory[];
}

export interface FormulaireDoc {
  id: string;
  name: string;
  template: string;
  fields: FormField[];
  isDownloadable: boolean;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface Correspondance {
  id: string;
  documentId: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  attachments: string[];
  actions: Action[];
  createdAt: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface ProcesVerbal {
  id: string;
  documentId: string;
  meetingDate: Date;
  participants: string[];
  agenda: string;
  decisions: string;
  actions: Action[];
  nextMeetingDate?: Date;
  location: string;
}

export interface Action {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  dueDate: Date;
  status: ActionStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: Date;
  updatedAt: Date;
  parentDocumentId: string;
  tasks: Task[];
  progress: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  assignedTo: string;
  completedAt?: Date;
  actionId: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: 'USER' | 'DOCUMENT' | 'ACTION' | 'TASK';
  entityId: string;
  details: string;
  timestamp: Date;
  ipAddress?: string;
}

export interface DocumentHistory {
  id: string;
  documentId: string;
  action: 'CREATED' | 'UPDATED' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
  userId: string;
  timestamp: Date;
  changes?: Record<string, any>;
  comment?: string;
}
