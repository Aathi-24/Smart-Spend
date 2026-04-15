require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Models ────────────────────────────────────────────────────────────────────
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// ── Helpers ───────────────────────────────────────────────────────────────────
const daysAgo   = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const daysLater = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

// ── Default Users ─────────────────────────────────────────────────────────────
const DEFAULT_USERS = [
  {
    name:     'Admin User',
    email:    'admin@expensetracker.com',
    password: 'Admin@123',
    role:     'admin',
    currency: 'INR',
  },
  {
    name:     'John Doe',
    email:    'john@expensetracker.com',
    password: 'John@123',
    role:     'user',
    currency: 'INR',
  },
  {
    name:     'Jane Smith',
    email:    'jane@expensetracker.com',
    password: 'Jane@123',
    role:     'user',
    currency: 'INR',
  },
];

// ── Demo Transactions per user ────────────────────────────────────────────────
// Returns an array of transaction objects for a given userId
const getDemoTransactions = (userId) => [

  // ── NORMAL EXPENSES ─────────────────────────────────────────────────────────

  // Food & Beverages
  { userId, date: daysAgo(1),  type: 'Normal', amount: 45,   reason: 'Morning tea & biscuits at canteen',  category: 'Food',          syncedToSheet: false },
  { userId, date: daysAgo(1),  type: 'Normal', amount: 180,  reason: 'Lunch – Biryani at Hotel Saravana',  category: 'Food',          syncedToSheet: false },
  { userId, date: daysAgo(2),  type: 'Normal', amount: 320,  reason: 'Dinner with family at restaurant',   category: 'Food',          syncedToSheet: false },
  { userId, date: daysAgo(3),  type: 'Normal', amount: 60,   reason: 'Snacks – Samosa & chai',             category: 'Food',          syncedToSheet: false },
  { userId, date: daysAgo(4),  type: 'Normal', amount: 850,  reason: 'Weekend groceries – Big Bazaar',     category: 'Shopping',      syncedToSheet: false },
  { userId, date: daysAgo(5),  type: 'Normal', amount: 120,  reason: 'Coffee – Café Coffee Day',           category: 'Food',          syncedToSheet: false },
  { userId, date: daysAgo(6),  type: 'Normal', amount: 95,   reason: 'Juice & sandwich – office canteen',  category: 'Food',          syncedToSheet: false },
  { userId, date: daysAgo(7),  type: 'Normal', amount: 240,  reason: 'Pizza – Domino\'s order online',     category: 'Food',          syncedToSheet: false },
  { userId, date: daysAgo(9),  type: 'Normal', amount: 75,   reason: 'Evening snacks – bhel puri',         category: 'Food',          syncedToSheet: false },
  { userId, date: daysAgo(10), type: 'Normal', amount: 430,  reason: 'Monthly vegetable & fruit purchase', category: 'Food',          syncedToSheet: false },

  // Transport
  { userId, date: daysAgo(1),  type: 'Normal', amount: 85,   reason: 'Ola cab – office to home',          category: 'Transport',     syncedToSheet: false },
  { userId, date: daysAgo(3),  type: 'Normal', amount: 40,   reason: 'Auto-rickshaw – market trip',        category: 'Transport',     syncedToSheet: false },
  { userId, date: daysAgo(5),  type: 'Normal', amount: 210,  reason: 'Petrol – Hero Splendor refill',      category: 'Transport',     syncedToSheet: false },
  { userId, date: daysAgo(8),  type: 'Normal', amount: 550,  reason: 'Uber – airport drop for colleague',  category: 'Transport',     syncedToSheet: false },
  { userId, date: daysAgo(12), type: 'Normal', amount: 130,  reason: 'Bus pass recharge – monthly',        category: 'Transport',     syncedToSheet: false },
  { userId, date: daysAgo(15), type: 'Normal', amount: 320,  reason: 'Rapido bike taxi – weekly rides',    category: 'Transport',     syncedToSheet: false },

  // Shopping
  { userId, date: daysAgo(4),  type: 'Normal', amount: 1200, reason: 'T-shirts (2 pcs) – Myntra sale',     category: 'Shopping',      syncedToSheet: false },
  { userId, date: daysAgo(7),  type: 'Normal', amount: 580,  reason: 'Sports shoes – Decathlon',           category: 'Shopping',      syncedToSheet: false },
  { userId, date: daysAgo(11), type: 'Normal', amount: 2400, reason: 'Formal trousers & shirt – Allen Solly', category: 'Shopping',   syncedToSheet: false },
  { userId, date: daysAgo(18), type: 'Normal', amount: 340,  reason: 'Stationery & notebooks – Classmate', category: 'Shopping',      syncedToSheet: false },
  { userId, date: daysAgo(22), type: 'Normal', amount: 890,  reason: 'Headphones – boAt Rockerz 255',      category: 'Shopping',      syncedToSheet: false },

  // Entertainment
  { userId, date: daysAgo(3),  type: 'Normal', amount: 499,  reason: 'Netflix subscription – monthly',     category: 'Entertainment', syncedToSheet: false },
  { userId, date: daysAgo(6),  type: 'Normal', amount: 360,  reason: 'Movie tickets (2) – PVR Cinemas',    category: 'Entertainment', syncedToSheet: false },
  { userId, date: daysAgo(14), type: 'Normal', amount: 179,  reason: 'Spotify Premium – 3 months',         category: 'Entertainment', syncedToSheet: false },
  { userId, date: daysAgo(20), type: 'Normal', amount: 299,  reason: 'Amazon Prime renewal',               category: 'Entertainment', syncedToSheet: false },
  { userId, date: daysAgo(25), type: 'Normal', amount: 650,  reason: 'Weekend trek – travel + food',       category: 'Entertainment', syncedToSheet: false },

  // Medical
  { userId, date: daysAgo(5),  type: 'Normal', amount: 380,  reason: 'Doctor consultation – General OPD',  category: 'Medical',       syncedToSheet: false },
  { userId, date: daysAgo(5),  type: 'Normal', amount: 620,  reason: 'Medicines – Apollo pharmacy',        category: 'Medical',       syncedToSheet: false },
  { userId, date: daysAgo(20), type: 'Normal', amount: 1500, reason: 'Blood test & health checkup',        category: 'Medical',       syncedToSheet: false },
  { userId, date: daysAgo(30), type: 'Normal', amount: 450,  reason: 'Eye checkup & vitamin supplements',  category: 'Medical',       syncedToSheet: false },

  // Utilities
  { userId, date: daysAgo(8),  type: 'Normal', amount: 1340, reason: 'Electricity bill – TNEB November',   category: 'Utilities',     syncedToSheet: false },
  { userId, date: daysAgo(10), type: 'Normal', amount: 499,  reason: 'Jio broadband – monthly plan',       category: 'Utilities',     syncedToSheet: false },
  { userId, date: daysAgo(12), type: 'Normal', amount: 349,  reason: 'Mobile recharge – Airtel 84 days',   category: 'Utilities',     syncedToSheet: false },
  { userId, date: daysAgo(15), type: 'Normal', amount: 280,  reason: 'Water bill – corporation',           category: 'Utilities',     syncedToSheet: false },
  { userId, date: daysAgo(22), type: 'Normal', amount: 180,  reason: 'LPG cylinder booking – Indane',      category: 'Utilities',     syncedToSheet: false },

  // Education
  { userId, date: daysAgo(7),  type: 'Normal', amount: 999,  reason: 'Udemy course – React & Node JS',     category: 'Education',     syncedToSheet: false },
  { userId, date: daysAgo(16), type: 'Normal', amount: 2499, reason: 'Coursera certification – monthly',   category: 'Education',     syncedToSheet: false },
  { userId, date: daysAgo(28), type: 'Normal', amount: 450,  reason: 'Books – Clean Code & DSA',           category: 'Education',     syncedToSheet: false },

  // ── LOAN GIVEN (money you lent to others) ───────────────────────────────────

  {
    userId,
    date:           daysAgo(20),
    type:           'Loan Given',
    amount:         5000,
    reason:         'Lent money to Ramesh for bike repair',
    category:       'Loan',
    loanGetterName:  'Ramesh Kumar',
    loanGetterEmail: 'ramesh.kumar@gmail.com',
    dueDate:         daysLater(5),        // due in 5 days → UPCOMING ALERT
    loanStatus:      'Pending',
    reminderSent:    false,
    syncedToSheet:   false,
  },
  {
    userId,
    date:           daysAgo(35),
    type:           'Loan Given',
    amount:         12000,
    reason:         'Helped Priya with college fee payment',
    category:       'Loan',
    loanGetterName:  'Priya Sharma',
    loanGetterEmail: 'priya.sharma@outlook.com',
    dueDate:         daysLater(1),        // due TOMORROW → urgent alert
    loanStatus:      'Pending',
    reminderSent:    false,
    syncedToSheet:   false,
  },
  {
    userId,
    date:           daysAgo(60),
    type:           'Loan Given',
    amount:         3500,
    reason:         'Emergency cash to Suresh for medical bill',
    category:       'Loan',
    loanGetterName:  'Suresh Babu',
    loanGetterEmail: 'suresh.b@yahoo.com',
    dueDate:         daysAgo(5),          // overdue by 5 days
    loanStatus:      'Overdue',
    reminderSent:    true,
    syncedToSheet:   false,
  },
  {
    userId,
    date:           daysAgo(45),
    type:           'Loan Given',
    amount:         8000,
    reason:         'Lent to Anitha for house rent deposit',
    category:       'Loan',
    loanGetterName:  'Anitha Rajan',
    loanGetterEmail: 'anitha.rajan@gmail.com',
    dueDate:         daysAgo(10),         // overdue
    loanStatus:      'Overdue',
    reminderSent:    true,
    syncedToSheet:   false,
  },
  {
    userId,
    date:           daysAgo(90),
    type:           'Loan Given',
    amount:         15000,
    reason:         'Personal loan to brother for business',
    category:       'Loan',
    loanGetterName:  'Karthik (Brother)',
    loanGetterEmail: 'karthik.personal@gmail.com',
    dueDate:         daysLater(20),
    loanStatus:      'Pending',
    reminderSent:    false,
    syncedToSheet:   false,
  },
  {
    userId,
    date:           daysAgo(50),
    type:           'Loan Given',
    amount:         2000,
    reason:         'Lent to office colleague for travel',
    category:       'Loan',
    loanGetterName:  'Deepak Nair',
    loanGetterEmail: 'deepak.nair@company.com',
    dueDate:         daysAgo(15),
    loanStatus:      'Paid',
    reminderSent:    true,
    syncedToSheet:   false,
  },
  {
    userId,
    date:           daysAgo(70),
    type:           'Loan Given',
    amount:         6500,
    reason:         'Gave to Meena for wedding shopping',
    category:       'Loan',
    loanGetterName:  'Meena Sundaram',
    loanGetterEmail: 'meena.s@hotmail.com',
    dueDate:         daysAgo(30),
    loanStatus:      'Paid',
    reminderSent:    false,
    syncedToSheet:   false,
  },

  // ── LOAN BORROWED (money you borrowed from others) ───────────────────────────

  {
    userId,
    date:       daysAgo(25),
    type:       'Loan Borrowed',
    amount:     10000,
    reason:     'Borrowed from Vijay for laptop down payment',
    category:   'Loan',
    dueDate:    daysLater(3),             // due in 3 days → you need to pay back
    loanStatus: 'Pending',
    syncedToSheet: false,
  },
  {
    userId,
    date:       daysAgo(40),
    type:       'Loan Borrowed',
    amount:     4500,
    reason:     'Borrowed from mom for phone repair',
    category:   'Loan',
    dueDate:    daysAgo(2),              // overdue
    loanStatus: 'Overdue',
    syncedToSheet: false,
  },
  {
    userId,
    date:       daysAgo(55),
    type:       'Loan Borrowed',
    amount:     20000,
    reason:     'Home renovation – borrowed from uncle',
    category:   'Loan',
    dueDate:    daysLater(30),
    loanStatus: 'Pending',
    syncedToSheet: false,
  },
  {
    userId,
    date:       daysAgo(80),
    type:       'Loan Borrowed',
    amount:     7000,
    reason:     'Emergency borrowed from friend Raj',
    category:   'Loan',
    dueDate:    daysAgo(20),
    loanStatus: 'Paid',
    syncedToSheet: false,
  },
  {
    userId,
    date:       daysAgo(95),
    type:       'Loan Borrowed',
    amount:     3000,
    reason:     'Borrowed for train ticket booking',
    category:   'Loan',
    dueDate:    daysAgo(50),
    loanStatus: 'Paid',
    syncedToSheet: false,
  },
];

// ── Main Seed Function ─────────────────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    console.log('\n🌱  Connecting to MongoDB…');
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-tracker',
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log('✅  MongoDB connected\n');

    // ── Ask for confirmation ──────────────────────────────────────────────────
    const args = process.argv.slice(2);
    const force = args.includes('--force');

    if (!force) {
      const existingTx = await Transaction.countDocuments();
      if (existingTx > 0) {
        console.log(`⚠️   Database already has ${existingTx} transaction(s).`);
        console.log('     Run with --force to wipe and re-seed:');
        console.log('     npm run seed -- --force\n');
        await mongoose.disconnect();
        return;
      }
    }

    // ── Clear existing data ───────────────────────────────────────────────────
    console.log('🗑️   Clearing existing data…');
    await Transaction.deleteMany({});
    await User.deleteMany({});
    console.log('✅  Cleared transactions & users\n');

    // ── Seed users ────────────────────────────────────────────────────────────
    console.log('👤  Seeding users…');
    const createdUsers = [];

    for (const userData of DEFAULT_USERS) {
      const salt   = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(userData.password, salt);

      const user = await User.create({
        name:     userData.name,
        email:    userData.email,
        password: hashed,
        role:     userData.role,
        currency: userData.currency,
        notificationsEnabled: true,
      });

      createdUsers.push({ ...userData, _id: user._id });
      console.log(`   ✔  ${user.name} (${user.email})`);
    }

    console.log(`\n✅  ${createdUsers.length} users created\n`);

    // ── Seed transactions for every user ──────────────────────────────────────
    console.log('💳  Seeding transactions…');
    let totalTx = 0;

    for (const user of createdUsers) {
      const transactions = getDemoTransactions(user._id);
      await Transaction.insertMany(transactions);
      totalTx += transactions.length;
      console.log(`   ✔  ${user.name} — ${transactions.length} transactions inserted`);
    }

    console.log(`\n✅  ${totalTx} transactions created across ${createdUsers.length} users\n`);

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('━'.repeat(55));
    console.log('🎉  SEED COMPLETE — Summary');
    console.log('━'.repeat(55));

    for (const user of createdUsers) {
      const txList  = await Transaction.find({ userId: user._id });
      const normal  = txList.filter((t) => t.type === 'Normal');
      const given   = txList.filter((t) => t.type === 'Loan Given');
      const borrow  = txList.filter((t) => t.type === 'Loan Borrowed');
      const pending = txList.filter((t) => t.loanStatus === 'Pending');
      const overdue = txList.filter((t) => t.loanStatus === 'Overdue');
      const paid    = txList.filter((t) => t.loanStatus === 'Paid');

      const totalSpent = normal.reduce((s, t) => s + t.amount, 0);
      const totalGiven = given.reduce((s, t)  => s + t.amount, 0);
      const totalBorrowed = borrow.reduce((s, t) => s + t.amount, 0);

      console.log(`\n  👤  ${user.name}  (${user.email})`);
      console.log(`      Password    : ${user.password}`);
      console.log(`      Normal Tx   : ${normal.length}  →  ₹${totalSpent.toLocaleString('en-IN')} spent`);
      console.log(`      Loan Given  : ${given.length}  →  ₹${totalGiven.toLocaleString('en-IN')} lent`);
      console.log(`      Loan Borrow : ${borrow.length}  →  ₹${totalBorrowed.toLocaleString('en-IN')} owed`);
      console.log(`      Loan Status : ${pending.length} pending | ${overdue.length} overdue | ${paid.length} paid`);
    }

    console.log('\n━'.repeat(55));
    console.log('🚀  Start the app and login with any account above.');
    console.log('━'.repeat(55) + '\n');

    await mongoose.disconnect();
    process.exit(0);

  } catch (err) {
    console.error('\n❌  Seed failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
