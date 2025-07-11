const connectDB = require('./db');
const { User } = require('./models/User');
const { Document } = require('./models/Document');
const { Correspondance } = require('./models/Correspondance');
const { ProcesVerbal } = require('./models/ProcesVerbal');
const { Action } = require('./models/Action');
const { Notification } = require('./models/Notification');
const { Report } = require('./models/Report');
const { AppSettings } = require('./models/AppSettings');
const { ActivityLog } = require('./models/ActivityLog');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  await connectDB();

  try {
    console.log('Deleting existing data...');
    await User.deleteMany({});
    await Document.deleteMany({});
    await Correspondance.deleteMany({});
    await ProcesVerbal.deleteMany({});
    await Action.deleteMany({});
    await Notification.deleteMany({});
    await Report.deleteMany({});
    await AppSettings.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('Existing data deleted.');

    // --- Seed Users ---
    console.log('Seeding users...');
    const usersToSeed = [
      {
        _id: uuidv4(),
        email: 'superadmin@aerodoc.tn',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        airport: 'ENFIDHA',
        isActive: true,
        phone: '21611223344',
        department: 'Direction',
        position: 'CEO',
        lastLogin: new Date(),
        password: 'admin123',
      },
      {
        _id: uuidv4(),
        email: 'admin@aerodoc.tn',
        firstName: 'Airport',
        lastName: 'Admin',
        role: 'ADMINISTRATOR',
        airport: 'MONASTIR',
        isActive: true,
        phone: '21655667788',
        department: 'IT',
        position: 'IT Manager',
        lastLogin: new Date(),
        password: 'admin123',
      },
      {
        _id: uuidv4(),
        email: 'approver@aerodoc.tn',
        firstName: 'Doc',
        lastName: 'Approver',
        role: 'APPROVER',
        airport: 'ENFIDHA',
        isActive: true,
        phone: '21699887766',
        department: 'Quality',
        position: 'Quality Manager',
        lastLogin: new Date(),
        password: 'user123',
      },
      {
        _id: uuidv4(),
        email: 'user@aerodoc.tn',
        firstName: 'Normal',
        lastName: 'User',
        role: 'USER',
        airport: 'MONASTIR',
        isActive: true,
        phone: '21612345678',
        department: 'Operations',
        position: 'Agent',
        lastLogin: new Date(),
        password: 'user123',
      },
      {
        _id: uuidv4(),
        email: 'visitor@aerodoc.tn',
        firstName: 'Guest',
        lastName: 'Visitor',
        role: 'VISITOR',
        airport: 'ENFIDHA',
        isActive: true,
        phone: '21687654321',
        department: 'Public Relations',
        position: 'Visitor',
        lastLogin: new Date(),
        password: 'user123',
      },
      { // New user with GENERALE scope
        _id: uuidv4(),
        email: 'general.user@aerodoc.tn',
        firstName: 'General',
        lastName: 'User',
        role: 'USER',
        airport: 'GENERALE',
        isActive: true,
        phone: '21611111111',
        department: 'Cross-Airport',
        position: 'Coordinator',
        lastLogin: new Date(),
        password: 'user123',
      },
      { // New user with AGENT_BUREAU_ORDRE role
        _id: uuidv4(),
        email: 'agent.bo@aerodoc.tn',
        firstName: 'Agent',
        lastName: 'BureauOrdre',
        role: 'AGENT_BUREAU_ORDRE',
        airport: 'ENFIDHA',
        isActive: true,
        phone: '21622334455',
        department: 'Bureau d\'Ordre',
        position: 'Agent',
        lastLogin: new Date(),
        password: 'agent123',
      },
    ];

    const hashedUsers = await Promise.all(usersToSeed.map(async (user) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      return { ...user, password: hashedPassword };
    }));

    const createdUsers = await User.insertMany(hashedUsers);
    console.log('Users seeded successfully!');

    const superAdminId = createdUsers.find(u => u.email === 'superadmin@aerodoc.tn')._id;
    const adminId = createdUsers.find(u => u.email === 'admin@aerodoc.tn')._id;
    const approverId = createdUsers.find(u => u.email === 'approver@aerodoc.tn')._id;
    const userId = createdUsers.find(u => u.email === 'user@aerodoc.tn')._id;
    const generalUserId = createdUsers.find(u => u.email === 'general.user@aerodoc.tn')._id;
    const agentBOId = createdUsers.find(u => u.email === 'agent.bo@aerodoc.tn')._id;


    // --- Seed Documents (General, QualiteDoc, FormulaireDoc) ---
    console.log('Seeding documents...');
    const documentsToSeed = [
      {
        _id: uuidv4(),
        title: 'Manuel de Procédures Générales',
        type: 'GENERAL',
        content: 'Ce document décrit les procédures opérationnelles standard de l\'aéroport.',
        authorId: adminId,
        airport: 'ENFIDHA',
        qrCode: `QR-${uuidv4()}`,
        version: 1,
        status: 'ACTIVE',
        viewsCount: 150,
        downloadsCount: 30,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        company_code: 'TAVTUN',
        scope_code: 'NBE',
        department_code: 'OPS',
        document_type_code: 'MN',
        language_code: 'FR',
        sequence_number: 1,
      },
      {
        _id: uuidv4(),
        title: 'Politique Qualité ISO 9001',
        type: 'QUALITE_DOC',
        content: JSON.stringify({
          reference: 'POL-QUAL-2024-001',
          typeQualite: 'politique',
          version: '2.0',
          responsable: 'Fatma Trabelsi',
          description: 'Déclaration de la politique qualité de l\'entreprise.',
          objectifs: 'Assurer la satisfaction client et l\'amélioration continue.',
          processus: 'Tous les processus opérationnels.'
        }),
        authorId: approverId,
        airport: 'MONASTIR',
        qrCode: `QR-${uuidv4()}`,
        version: 2,
        status: 'ACTIVE',
        viewsCount: 80,
        downloadsCount: 15,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        company_code: 'TAVTUN',
        scope_code: 'MIR',
        department_code: 'QMS',
        document_type_code: 'PQ',
        language_code: 'FR',
        sequence_number: 1,
      },
      {
        _id: uuidv4(),
        title: 'Formulaire de Demande de Congé',
        type: 'FORMULAIRE_DOC',
        content: JSON.stringify({
          code: 'FORM-RH-005',
          category: 'Ressources Humaines',
          description: 'Formulaire standard pour les demandes de congé annuel.',
          instructions: 'Remplir toutes les sections et soumettre au responsable de département.'
        }),
        authorId: userId,
        airport: 'ENFIDHA',
        qrCode: `QR-${uuidv4()}`,
        version: 1,
        status: 'DRAFT',
        viewsCount: 20,
        downloadsCount: 5,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        company_code: 'TAVTUN',
        scope_code: 'NBE',
        department_code: 'RH',
        document_type_code: 'FM',
        language_code: 'FR',
        sequence_number: 1,
      },
      { // New document with GENERALE scope
        _id: uuidv4(),
        title: 'Rapport Annuel de Sécurité (Général)',
        type: 'GENERAL',
        content: 'Rapport consolidé sur la sécurité pour tous les aéroports.',
        authorId: superAdminId,
        airport: 'GENERALE',
        qrCode: `QR-${uuidv4()}`,
        version: 1,
        status: 'ACTIVE',
        viewsCount: 200,
        downloadsCount: 50,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        company_code: 'TAVTUN',
        scope_code: 'GEN',
        department_code: 'SEC',
        document_type_code: 'RG',
        language_code: 'FR',
        sequence_number: 1,
      },
    ];
    const createdDocuments = await Document.insertMany(documentsToSeed);
    console.log('Documents seeded successfully!');

    // --- Seed Correspondances ---
    console.log('Seeding correspondences...');
    const correspondanceToSeed = {
      _id: uuidv4(),
      title: 'Demande de matériel de bureau', // Added title
      authorId: userId, // Added authorId
      qrCode: `TAVTUN-MIR-OPS-OUT-001-FR`, // Example generated QR code
      version: 1,
      viewsCount: 10,
      downloadsCount: 2,
      type: 'OUTGOING', // Added type
      code: 'TAVTUN-MIR-OPS-OUT-001-FR', // Added code
      fromAddress: 'operations@aerodoc.tn',
      toAddress: 'logistics@aerodoc.tn',
      subject: 'Demande de matériel de bureau - Q3 2024',
      content: 'Bonjour, nous avons besoin de commander du matériel de bureau pour le troisième trimestre. Veuillez trouver la liste en pièce jointe.',
      priority: 'MEDIUM',
      status: 'SENT',
      airport: 'MONASTIR',
      attachments: ['liste_materiel.pdf'],
      actionsDecidees: [
        {
          titre: 'Vérifier la disponibilité du matériel',
          description: 'Contacter les fournisseurs pour les prix et la disponibilité.',
          responsable: [adminId], // Assign to admin
          echeance: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          priorite: 'HIGH',
          statut: 'PENDING',
          collaborateurs: [userId],
        },
        {
          titre: 'Passer la commande',
          description: 'Commander le matériel une fois les prix confirmés.',
          responsable: [adminId],
          echeance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          priorite: 'MEDIUM',
          statut: 'PENDING',
        },
      ],
      tags: ['fournitures', 'logistique'],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      company_code: 'TAVTUN',
      scope_code: 'MIR',
      department_code: 'OPS',
      language_code: 'FR',
      sequence_number: 1,
    };
    await Correspondance.create(correspondanceToSeed);

    const generalCorrespondanceToSeed = {
      _id: uuidv4(),
      title: 'Annonce de nouvelle politique', // Added title
      authorId: superAdminId, // Added authorId
      qrCode: `TAVTUN-GEN-DIR-OUT-001-FR`, // Example generated QR code
      version: 1,
      viewsCount: 50,
      downloadsCount: 10,
      type: 'OUTGOING', // Added type
      code: 'TAVTUN-GEN-DIR-OUT-001-FR', // Added code
      fromAddress: 'direction@aerodoc.tn',
      toAddress: 'all.staff@aerodoc.tn',
      subject: 'Nouvelle politique de gestion des déchets',
      content: 'Une nouvelle politique de gestion des déchets a été mise en place pour tous les sites.',
      priority: 'HIGH',
      status: 'SENT',
      airport: 'GENERALE',
      attachments: ['politique_dechets.pdf'],
      actionsDecidees: [],
      tags: ['politique', 'environnement'],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      company_code: 'TAVTUN',
      scope_code: 'GEN',
      department_code: 'DIR', // Assuming 'DIR' for Direction
      language_code: 'FR',
      sequence_number: 1,
    };
    await Correspondance.create(generalCorrespondanceToSeed);
    console.log('Correspondences seeded successfully!');

    // --- Seed Proces Verbaux ---
    console.log('Seeding proces verbaux...');
    // Removed creation of pvDocument and generalPvDocument as ProcesVerbal is now standalone
    // and no longer a Document type.

    const pvToSeed = {
      _id: uuidv4(),
      // Removed documentId as ProcesVerbal is now standalone
      title: 'PV Réunion Sécurité Mensuelle', // Added title directly
      authorId: approverId, // Added authorId directly
      qrCode: `TAVTUN-NBE-SEC-PV-001-FR`, // Example generated QR code
      filePath: null, // No file path for now, can be added later
      fileType: null,
      version: 1,
      viewsCount: 25,
      downloadsCount: 8,

      meetingDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      participants: ['Ahmed Ben Ali (Président)', 'Fatma Trabelsi (Secrétaire)', 'Mohamed Sassi (Membre)'],
      agenda: '1. Revue des incidents de sécurité\n2. Mise à jour des procédures\n3. Questions diverses',
      decisions: 'Décision 1: Renforcer la surveillance des zones sensibles.\nDécision 2: Organiser une formation sur les nouvelles procédures.',
      location: 'Salle de conférence principale',
      meetingType: 'Réunion de sécurité',
      airport: 'ENFIDHA',
      nextMeetingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      actionsDecidees: [
        {
          titre: 'Mettre à jour les panneaux de signalisation',
          description: 'Remplacer les panneaux de sécurité obsolètes dans le terminal.',
          responsable: [adminId],
          echeance: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          priorite: 'HIGH',
          statut: 'PENDING',
        },
        {
          titre: 'Planifier la formation sur les procédures',
          description: 'Contacter le formateur et fixer une date pour la formation.',
          responsable: [approverId],
          echeance: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          priorite: 'MEDIUM',
          statut: 'PENDING',
        },
      ],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      company_code: 'TAVTUN',
      scope_code: 'NBE',
      department_code: 'SEC',
      language_code: 'FR',
      sequence_number: 1,
    };
    await ProcesVerbal.create(pvToSeed);

    const generalPvToSeed = {
      _id: uuidv4(),
      // Removed documentId as ProcesVerbal is now standalone
      title: 'PV Réunion Stratégique (Général)', // Added title directly
      authorId: superAdminId, // Added authorId directly
      qrCode: `TAVTUN-GEN-DIR-PV-001-FR`, // Example generated QR code
      filePath: null,
      fileType: null,
      version: 1,
      viewsCount: 30,
      downloadsCount: 5,

      meetingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      participants: ['Super Admin', 'Airport Admin', 'Doc Approver'],
      agenda: '1. Stratégie 2025\n2. Budgets\n3. Projets inter-sites',
      decisions: 'Décision 1: Lancer le projet X.\nDécision 2: Allouer le budget Y.',
      location: 'Siège Social',
      meetingType: 'Réunion Stratégique',
      airport: 'GENERALE',
      nextMeetingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      actionsDecidees: [
        {
          titre: 'Préparer le plan de projet X',
          description: 'Élaborer un plan détaillé pour le projet X.',
          responsable: [adminId],
          echeance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          priorite: 'HIGH',
          statut: 'PENDING',
        },
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      company_code: 'TAVTUN',
      scope_code: 'GEN',
      department_code: 'DIR',
      language_code: 'FR',
      sequence_number: 1,
    };
    await ProcesVerbal.create(generalPvToSeed);
    console.log('Proces Verbaux seeded successfully!');

    // --- Seed Actions ---
    console.log('Seeding actions...');
    const actionsToSeed = [
      {
        _id: uuidv4(),
        title: 'Vérification des extincteurs',
        description: 'Vérification mensuelle de tous les extincteurs de l\'aéroport.',
        assignedTo: [adminId, userId],
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'PENDING',
        priority: 'HIGH',
        progress: 0,
        estimatedHours: 8,
      },
      {
        _id: uuidv4(),
        title: 'Mise à jour du registre des visiteurs',
        description: 'Numériser et archiver les anciens registres des visiteurs.',
        assignedTo: [userId],
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
        status: 'PENDING',
        priority: 'URGENT',
        progress: 50,
        estimatedHours: 12,
      },
      {
        _id: uuidv4(),
        title: 'Révision du plan d\'urgence',
        description: 'Revoir et mettre à jour le plan d\'urgence en cas d\'incident majeur.',
        assignedTo: [superAdminId, approverId],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        progress: 25,
        estimatedHours: 40,
      },
      {
        _id: uuidv4(),
        title: 'Nettoyage des pistes',
        description: 'Nettoyage complet des pistes d\'atterrissage et de décollage.',
        assignedTo: [adminId],
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        status: 'COMPLETED',
        priority: 'LOW',
        progress: 100,
        estimatedHours: 24,
        actualHours: 20,
      },
      { // New action with GENERALE scope
        _id: uuidv4(),
        title: 'Audit de sécurité inter-aéroports',
        description: 'Réaliser un audit de sécurité sur les deux sites.',
        assignedTo: [superAdminId, generalUserId],
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        status: 'PENDING',
        priority: 'HIGH',
        progress: 0,
        estimatedHours: 80,
      },
    ];
    await Action.insertMany(actionsToSeed);
    console.log('Actions seeded successfully!');

    // --- Seed Notifications ---
    console.log('Seeding notifications...');
    const notificationsToSeed = [
      {
        _id: uuidv4(),
        userId: userId,
        title: 'Nouvelle action assignée',
        message: 'Une nouvelle action "Vérification des extincteurs" vous a été assignée.',
        type: 'info',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        _id: uuidv4(),
        userId: adminId,
        title: 'Document approuvé',
        message: 'Le document "Politique Qualité ISO 9001" a été approuvé par Doc Approver.',
        type: 'success',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        _id: uuidv4(),
        userId: superAdminId,
        title: 'Action en retard',
        message: 'L\'action "Mise à jour du registre des visiteurs" est en retard.',
        type: 'warning',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        _id: uuidv4(),
        userId: userId,
        title: 'Erreur de téléchargement',
        message: 'Le téléchargement du fichier "rapport_mensuel.pdf" a échoué.',
        type: 'error',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      { // New notification for general user
        _id: uuidv4(),
        userId: generalUserId,
        title: 'Nouvelle correspondance générale',
        message: 'Une nouvelle correspondance "Nouvelle politique de gestion des déchets" a été publiée.',
        type: 'info',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
    ];
    await Notification.insertMany(notificationsToSeed);
    console.log('Notifications seeded successfully!');

    // --- Seed Reports ---
    console.log('Seeding reports...');
    const reportsToSeed = [
      {
        _id: uuidv4(),
        name: 'Rapport Mensuel d\'Activité',
        type: 'PERFORMANCE',
        config: { period: 'monthly' },
        content: {
          productivity: {
            documentsCreatedThisMonth: 15,
            actionsCompletedThisMonth: 10,
            correspondancesSentThisMonth: 5,
          },
          efficiency: {
            totalActions: 50,
            completedActions: 40,
            overdueActions: 5,
          }
        },
        status: 'COMPLETED',
        frequency: 'MONTHLY',
        lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        createdBy: adminId,
      },
      {
        _id: uuidv4(),
        name: 'Rapport d\'Utilisation des Documents',
        type: 'DOCUMENT_USAGE',
        config: { documentTypes: ['GENERAL', 'QUALITE_DOC'] },
        content: {
          totalDocuments: 100,
          documentsByType: { GENERAL: 50, QUALITE_DOC: 30, FORMULAIRE_DOC: 20 },
          totalViews: 1500,
          totalDownloads: 500,
        },
        status: 'PENDING',
        frequency: 'WEEKLY',
        lastGenerated: null,
        createdBy: superAdminId,
      },
      { // New report with GENERALE scope
        _id: uuidv4(),
        name: 'Rapport d\'Activité Utilisateurs (Général)',
        type: 'USER_ACTIVITY',
        config: { airport: 'GENERALE' },
        content: {
          totalUsers: 6,
          activeUsers: 6,
          usersByRole: { SUPER_ADMIN: 1, ADMINISTRATOR: 1, APPROVER: 1, USER: 2, VISITOR: 1 },
          usersByAirport: { ENFIDHA: 3, MONASTIR: 2, GENERALE: 1 },
        },
        status: 'COMPLETED',
        frequency: 'DAILY',
        lastGenerated: new Date(),
        createdBy: generalUserId,
      },
    ];
    await Report.insertMany(reportsToSeed);
    console.log('Reports seeded successfully!');

    // --- Seed AppSettings ---
    console.log('Seeding app settings...');
    const appSettingsToSeed = createdUsers.map(user => ({
      _id: uuidv4(),
      userId: user._id,
      companyName: 'AeroDoc - ' + user.airport,
      defaultAirport: user.airport,
      language: 'fr',
      theme: 'light',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      sessionTimeout: 60,
      requireTwoFactor: false,
      passwordExpiry: 90,
      documentRetention: 365,
      autoArchive: true,
      maxFileSize: 10,
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpUsername: 'user@example.com',
      useSsl: true,
    }));
    await AppSettings.insertMany(appSettingsToSeed);
    console.log('App settings seeded successfully!');

    // --- Seed Activity Logs ---
    console.log('Seeding activity logs...');
    const activityLogsToSeed = [
      {
        _id: uuidv4(),
        action: 'USER_LOGIN',
        details: 'Connexion réussie de Super Admin.',
        entityId: superAdminId,
        entityType: 'USER',
        userId: superAdminId,
        timestamp: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      {
        _id: uuidv4(),
        action: 'DOCUMENT_CREATED',
        details: 'Document "Manuel de Procédures Générales" créé.',
        entityId: createdDocuments[0]._id,
        entityType: 'DOCUMENT',
        userId: adminId,
        timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      },
      {
        _id: uuidv4(),
        action: 'ACTION_COMPLETED',
        details: 'Action "Nettoyage des pistes" marquée comme terminée.',
        entityId: actionsToSeed[3]._id,
        entityType: 'ACTION',
        userId: adminId,
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        _id: uuidv4(),
        action: 'USER_ADDED',
        details: 'Nouvel utilisateur "Normal User" ajouté.',
        entityId: userId,
        entityType: 'USER',
        userId: superAdminId,
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      },
      { // New activity log for general document
        _id: uuidv4(),
        action: 'DOCUMENT_CREATED',
        details: 'Document "Rapport Annuel de Sécurité (Général)" créé.',
        entityId: createdDocuments[3]._id,
        entityType: 'DOCUMENT',
        userId: superAdminId,
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      },
    ];
    await ActivityLog.insertMany(activityLogsToSeed);
    console.log('Activity logs seeded successfully!');


    console.log('\n--- Test Accounts (Passwords are hashed in DB) ---');
    console.log('  Email: superadmin@aerodoc.tn, Password: admin123');
    console.log('  Email: admin@aerodoc.tn, Password: admin123');
    console.log('  Email: approver@aerodoc.tn, Password: user123');
    console.log('  Email: user@aerodoc.tn, Password: user123');
    console.log('  Email: visitor@aerodoc.tn, Password: user123');
    console.log('  Email: general.user@aerodoc.tn, Password: user123');
    console.log('  Email: agent.bo@aerodoc.tn, Password: agent123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
};

seedDatabase();