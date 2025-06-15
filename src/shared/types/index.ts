export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMINISTRATOR = 'ADMINISTRATOR',
  APPROVER = 'APPROVER',
  USER = 'USER',
  VISITOR = 'VISITOR',
  AGENT_BUREAU_ORDRE = 'AGENT_BUREAU_ORDRE' // Nouveau rôle
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
  QUALITE_DOC = 'QUALITE_DOC',
  NOUVEAU_DOC = 'NOUVEAU_DOC',
  GENERAL = 'GENERAL'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Define Airport enum with GENERALE option
export type Airport = 'ENFIDHA' | 'MONASTIR' | 'GENERALE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePhoto?: string;
  airport: Airport; // Updated to use Airport type
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  phone?: string;
  department?: string;
}

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  qrCode: string; // This will now store the full generated code
  version: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  actions: Action[];
  history: DocumentHistory[];
  filePath?: string;
  fileType?: string;
  airport: Airport; // Updated to use Airport type
  // New fields for document code components
  department_code?: string;
  sub_department_code?: string;
  language_code?: string;
  sequence_number?: number;
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
  filePath?: string;
  fileType?: string;
}

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'file';
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: string;
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
  priority: Priority;
  status: 'DRAFT' | 'SENT' | 'RECEIVED' | 'ARCHIVED';
  airport: Airport; // Updated to use Airport type
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
  meetingType: string;
  airport: Airport; // Updated to use Airport type
}

export interface Action {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  dueDate: Date;
  status: ActionStatus;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  parentDocumentId: string;
  tasks: Task[];
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  assignedTo: string;
  completedAt?: Date;
  actionId: string;
  estimatedHours?: number;
  actualHours?: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: 'USER' | 'DOCUMENT' | 'ACTION' | 'TASK' | 'CORRESPONDANCE' | 'PROCES_VERBAL';
  entityId: string;
  details: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface DocumentHistory {
  id: string;
  documentId: string;
  action: 'CREATED' | 'UPDATED' | 'APPROVED' | 'REJECTED' | 'ARCHIVED' | 'DOWNLOADED' | 'VIEWED';
  userId: string;
  timestamp: Date;
  changes?: Record<string, any>;
  comment?: string;
  version: number;
}

export interface QRCodeData {
  id: string;
  documentId: string;
  qrCode: string;
  generatedAt: Date;
  downloadCount: number;
  lastAccessed?: Date;
}

export interface ReportConfig {
  id: string;
  name: string;
  type: 'DOCUMENT_USAGE' | 'USER_ACTIVITY' | 'ACTION_STATUS' | 'PERFORMANCE' | 'CUSTOM';
  filters: Record<string, any>;
  schedule?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  recipients: string[];
  createdBy: string;
  createdAt: Date;
}

export interface AppSettings {
  id: string;
  companyName: string;
  companyLogo?: string;
  airports: Array<{
    code: string;
    name: string;
    address: string;
    contact: string;
  }>;
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    username: string;
    useSSL: boolean;
  };
  documentRetentionDays: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en' | 'ar';
}

// New types for Document Code Configuration
export interface DocumentCodeComponent {
  code: string;
  label: string;
  description?: string;
}

export interface DocumentCodeConfig {
  id: string;
  documentTypes: DocumentCodeComponent[];
  departments: DocumentCodeComponent[];
  subDepartments: DocumentCodeComponent[];
  languages: DocumentCodeComponent[];
  scopes: DocumentCodeComponent[]; // For NBE, MIR, GEN
  sequenceCounters: Map<string, number>; // Key: 'SCOPE-DEPT-SUBDEPT-DOCTYPE-LANG', Value: current sequence number
  createdAt: Date;
  updatedAt: Date;
}