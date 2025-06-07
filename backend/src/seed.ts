import connectDB from './db';
import { User } from './models/User';
import { v4 as uuidv4 } from 'uuid';

const seedDatabase = async () => {
  await connectDB();

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
    },
  ];

  try {
    console.log('Deleting existing users...');
    await User.deleteMany({});
    console.log('Existing users deleted.');

    console.log('Seeding new users...');
    await User.insertMany(usersToSeed);
    console.log('Users seeded successfully!');
    console.log('\n--- Test Accounts ---');
    console.log('  Email: superadmin@aerodoc.tn, Password: admin123 (Role: SUPER_ADMIN, Airport: ENFIDHA)');
    console.log('  Email: admin@aerodoc.tn, Password: admin123 (Role: ADMINISTRATOR, Airport: MONASTIR)');
    console.log('  Email: approver@aerodoc.tn, Password: user123 (Role: APPROVER, Airport: ENFIDHA)');
    console.log('  Email: user@aerodoc.tn, Password: user123 (Role: USER, Airport: MONASTIR)');
    console.log('  Email: visitor@aerodoc.tn, Password: user123 (Role: VISITOR, Airport: ENFIDHA)');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
};

seedDatabase();