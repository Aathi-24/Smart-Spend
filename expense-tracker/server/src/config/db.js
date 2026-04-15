const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Seed default users on first connection
    await seedDefaultUsers();
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

const seedDefaultUsers = async () => {
  const User = require('../models/User');
  const bcrypt = require('bcryptjs');
  const googleSheets = require('../services/googleSheets');

  const defaultUsers = [
    {
      name: 'Admin User',
      email: 'admin@expensetracker.com',
      password: 'Admin@123',
      role: 'admin',
    },
    {
      name: 'John Doe',
      email: 'john@expensetracker.com',
      password: 'John@123',
      role: 'user',
    },
    {
      name: 'Jane Smith',
      email: 'jane@expensetracker.com',
      password: 'Jane@123',
      role: 'user',
    },
  ];

  for (const userData of defaultUsers) {
    const existing = await User.findOne({ email: userData.email });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });
      console.log(`👤 Default user created: ${userData.email}`);

      // Sync to Google Sheets
      try {
        await googleSheets.addUserToSheet(userData);
      } catch (err) {
        console.log('⚠️  Google Sheets sync skipped (configure credentials)');
      }
    }
  }
};

module.exports = connectDB;
