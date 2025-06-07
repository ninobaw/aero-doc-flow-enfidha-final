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
    permissions: ['manage_users', 'manage_documents', 'view_reports', 'manage_settings', 'manage_forms']
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

export const TASK_STATUS = {
  TODO: { label: 'À faire', color: 'gray' },
  IN_PROGRESS: { label: 'En cours', color: 'blue' },
  COMPLETED: { label: 'Terminé', color: 'green' },
  BLOCKED: { label: 'Bloqué', color: 'red' }
} as const;

export const DOCUMENT_HISTORY_ACTIONS = {
  CREATED: { label: 'Créé', color: 'green', icon: 'FileText' },
  VIEWED: { label: 'Consulté', color: 'blue', icon: 'Eye' },
  DOWNLOADED: { label: 'Téléchargé', color: 'purple', icon: 'Download' },
  UPDATED: { label: 'Modifié', color: 'orange', icon: 'Edit' },
  APPROVED: { label: 'Approuvé', color: 'green', icon: 'CheckCircle' },
  REJECTED: { label: 'Rejeté', color: 'red', icon: 'XCircle' },
  ARCHIVED: { label: 'Archivé', color: 'gray', icon: 'Archive' }
} as const;

export const QR_CODE_STATUS = {
  ACTIVE: { label: 'Actif', color: 'green' },
  EXPIRED: { label: 'Expiré', color: 'red' },
  DISABLED: { label: 'Désactivé', color: 'gray' }
} as const;

export const USER_STATUS = {
  ACTIVE: { label: 'Actif', color: 'green' },
  INACTIVE: { label: 'Inactif', color: 'red' },
  PENDING: { label: 'En attente', color: 'yellow' },
  SUSPENDED: { label: 'Suspendu', color: 'orange' }
} as const;

export const ACTIVITY_TYPES = {
  USER_LOGIN: { label: 'Connexion utilisateur', icon: 'LogIn' },
  USER_LOGOUT: { label: 'Déconnexion utilisateur', icon: 'LogOut' },
  DOCUMENT_CREATED: { label: 'Document créé', icon: 'FileText' },
  DOCUMENT_UPDATED: { label: 'Document modifié', icon: 'Edit' },
  DOCUMENT_DELETED: { label: 'Document supprimé', icon: 'Trash' },
  ACTION_CREATED: { label: 'Action créée', icon: 'Plus' },
  ACTION_UPDATED: { label: 'Action mise à jour', icon: 'Edit' },
  ACTION_COMPLETED: { label: 'Action terminée', icon: 'CheckCircle' },
  TASK_COMPLETED: { label: 'Tâche terminée', icon: 'Check' },
  QR_CODE_GENERATED: { label: 'QR Code généré', icon: 'QrCode' },
  QR_CODE_SCANNED: { label: 'QR Code scanné', icon: 'Scan' }
} as const;

export const FILE_TYPES = {
  DOCUMENTS: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
  SPREADSHEETS: ['.xls', '.xlsx', '.csv'],
  PRESENTATIONS: ['.ppt', '.pptx'],
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.svg'],
  ARCHIVES: ['.zip', '.rar', '.7z']
} as const;

export const NOTIFICATION_TYPES = {
  ACTION_ASSIGNED: { label: 'Action assignée', color: 'blue' },
  ACTION_DUE_SOON: { label: 'Action bientôt échue', color: 'orange' },
  ACTION_OVERDUE: { label: 'Action en retard', color: 'red' },
  DOCUMENT_APPROVED: { label: 'Document approuvé', color: 'green' },
  DOCUMENT_REJECTED: { label: 'Document rejeté', color: 'red' },
  TASK_ASSIGNED: { label: 'Tâche assignée', color: 'blue' },
  MENTION: { label: 'Mention', color: 'purple' }
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_QR_CODE_SCANS = 1000;
export const ACTION_DUE_SOON_DAYS = 3;
export const DOCUMENT_RETENTION_DAYS = 365;