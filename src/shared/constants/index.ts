
export const AIRPORTS = {
  ENFIDHA: {
    code: 'ENFIDHA',
    name: 'Aéroport Enfidha-Hammamet',
    fullName: 'Aéroport International Enfidha-Hammamet Zine El Abidine Ben Ali',
    iataCode: 'NBE',
    icaoCode: 'DTNH'
  },
  MONASTIR: {
    code: 'MONASTIR',
    name: 'Aéroport Monastir',
    fullName: 'Aéroport International Monastir Habib Bourguiba',
    iataCode: 'MIR',
    icaoCode: 'DTMB'
  }
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: {
    label: 'Super Administrateur',
    permissions: ['all']
  },
  ADMINISTRATOR: {
    label: 'Administrateur',
    permissions: ['manage_users', 'manage_documents', 'view_reports', 'manage_settings']
  },
  APPROVER: {
    label: 'Approbateur',
    permissions: ['approve_documents', 'view_documents', 'create_documents']
  },
  USER: {
    label: 'Utilisateur',
    permissions: ['view_documents', 'create_documents', 'view_profile']
  },
  VISITOR: {
    label: 'Visiteur',
    permissions: ['view_documents']
  }
} as const;

export const DOCUMENT_TYPES = {
  FORMULAIRE_DOC: {
    label: 'Formulaire Doc',
    icon: 'FileSpreadsheet',
    color: 'blue'
  },
  CORRESPONDANCE: {
    label: 'Correspondance',
    icon: 'Mail',
    color: 'purple'
  },
  PROCES_VERBAL: {
    label: 'Procès-Verbal',
    icon: 'ClipboardList',
    color: 'orange'
  },
  QUALITE_DOC: {
    label: 'Qualité Doc',
    icon: 'FileCheck',
    color: 'green'
  },
  NOUVEAU_DOC: {
    label: 'Nouveau Doc',
    icon: 'FilePlus',
    color: 'indigo'
  },
  GENERAL: {
    label: 'Général',
    icon: 'FileText',
    color: 'gray'
  }
} as const;

export const PRIORITIES = {
  LOW: { label: 'Faible', color: 'gray' },
  MEDIUM: { label: 'Moyen', color: 'yellow' },
  HIGH: { label: 'Élevé', color: 'orange' },
  URGENT: { label: 'Urgent', color: 'red' }
} as const;

export const ACTION_STATUS = {
  PENDING: { label: 'En attente', color: 'yellow' },
  IN_PROGRESS: { label: 'En cours', color: 'blue' },
  COMPLETED: { label: 'Terminé', color: 'green' },
  CANCELLED: { label: 'Annulé', color: 'red' }
} as const;

export const FILE_TYPES = {
  DOCUMENTS: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
  SPREADSHEETS: ['.xls', '.xlsx', '.csv'],
  PRESENTATIONS: ['.ppt', '.pptx'],
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.svg'],
  ARCHIVES: ['.zip', '.rar', '.7z']
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
