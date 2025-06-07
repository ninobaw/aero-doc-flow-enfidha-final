import connectDB from './db';
import { User } from './models/User';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs'; // Import bcryptjs

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
      password: 'admin123', // Temporary plain text password for seeding
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
      password: 'admin123', // Temporary plain text password for seeding
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
      password: 'user123', // Temporary plain text password for seeding
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
      password: 'user123', // Temporary plain text password for seeding
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
      password: 'user123', // Temporary plain text password for seeding
    },
  ];

  try {
    console.log('Deleting existing users...');
    await User.deleteMany({});
    console.log('Existing users deleted.');

    console.log('Seeding new users...');
    const hashedUsers = await Promise.all(usersToSeed.map(async (user) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      return { ...user, password: hashedPassword };
    }));

    await User.insertMany(hashedUsers);
    console.log('Users seeded successfully!');
    console.log('\n--- Test Accounts (Passwords are hashed in DB) ---');
    console.log('  Email: superadmin@aerodoc.tn, Password: admin123');
    console.log('  Email: admin@aerodoc.tn, Password: admin123');
    console.log('  Email: approver@aerodoc.tn, Password: user123');
    console.log('  Email: user@aerodoc.tn, Password: user123');
    console.log('  Email: visitor@aerodoc.tn, Password: user123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
};

seedDatabase();