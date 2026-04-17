// ============================================================
// alertService.js  –  Automated loan due-date cron jobs
// Place this file at:
//   expense-tracker/server/src/services/alertService.js
// (Replace the existing file completely)
// ============================================================

const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { sendLoanReminder, sendDueDateAlert } = require('./emailService');

// ── How many days ahead to send reminders ────────────────────
const REMINDER_DAYS_AHEAD = 3;

// ── Utility ───────────────────────────────────────────────────
const getWindowEnd = (days = REMINDER_DAYS_AHEAD) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000);


// ════════════════════════════════════════════════════════════
// JOB 1 – Loans YOU GAVE  →  remind the borrower via email
// ════════════════════════════════════════════════════════════
const checkLoanGivenReminders = async () => {
  console.log('\n📬 [checkLoanGivenReminders] scanning for due loans …');
  try {
    const now = new Date();

    // ── 1a. Loans due within the reminder window (not yet reminded) ──
    const dueSoonLoans = await Transaction.find({
      type: 'Loan Given',
      loanStatus: 'Pending',
      dueDate: { $gte: now, $lte: getWindowEnd() },
      reminderSent: false,
      loanGetterEmail: { $ne: null, $exists: true },
    }).populate('userId', 'name');

    let sent = 0;
    for (const loan of dueSoonLoans) {
      try {
        const lenderName = loan.userId?.name || 'Your lender';

        await sendLoanReminder({
          to: loan.loanGetterEmail,
          borrowerName: loan.loanGetterName || 'Friend',
          lenderName,
          amount: loan.amount,
          dueDate: loan.dueDate,
          reason: loan.reason,
        });

        loan.reminderSent = true;
        await loan.save();
        sent++;
        console.log(`  ✉️  Reminder → ${loan.loanGetterEmail} (loan ${loan._id})`);
      } catch (err) {
        console.error(`  ❌ Failed reminder for loan ${loan._id}:`, err.message);
      }
    }

    // ── 1b. Auto-mark overdue loans ──────────────────────────────────
    const { modifiedCount } = await Transaction.updateMany(
      { type: 'Loan Given', loanStatus: 'Pending', dueDate: { $lt: now } },
      { loanStatus: 'Overdue' }
    );

    console.log(
      `  ✅ Reminders sent: ${sent}/${dueSoonLoans.length}` +
      (modifiedCount ? ` | Marked overdue: ${modifiedCount}` : '')
    );
  } catch (error) {
    console.error('  ❌ checkLoanGivenReminders error:', error.message);
  }
};


// ════════════════════════════════════════════════════════════
// JOB 2 – Loans YOU BORROWED  →  remind yourself (the user)
// ════════════════════════════════════════════════════════════
const checkLoanBorrowedAlerts = async () => {
  console.log('\n🔔 [checkLoanBorrowedAlerts] scanning loans you borrowed …');
  try {
    const now = new Date();

    const dueSoonBorrowedLoans = await Transaction.find({
      type: 'Loan Borrowed',
      loanStatus: 'Pending',
      dueDate: { $gte: now, $lte: getWindowEnd() },
      alertShown: false,
    }).populate('userId', 'email name notificationsEnabled');

    let sent = 0;
    for (const loan of dueSoonBorrowedLoans) {
      const user = loan.userId;

      // Skip if user opted out of notifications
      if (!user || user.notificationsEnabled === false) continue;

      try {
        await sendDueDateAlert({
          to: user.email,
          userName: user.name,
          amount: loan.amount,
          dueDate: loan.dueDate,
          reason: loan.reason,
        });

        loan.alertShown = true;
        await loan.save();
        sent++;
        console.log(`  🔔 Due-date alert → ${user.email} (loan ${loan._id})`);
      } catch (err) {
        console.error(`  ❌ Failed alert for loan ${loan._id}:`, err.message);
      }
    }

    // Auto-mark overdue borrowed loans too
    await Transaction.updateMany(
      { type: 'Loan Borrowed', loanStatus: 'Pending', dueDate: { $lt: now } },
      { loanStatus: 'Overdue' }
    );

    console.log(`  ✅ Alerts sent: ${sent}/${dueSoonBorrowedLoans.length}`);
  } catch (error) {
    console.error('  ❌ checkLoanBorrowedAlerts error:', error.message);
  }
};


// ════════════════════════════════════════════════════════════
// Run BOTH jobs together (convenience wrapper)
// ════════════════════════════════════════════════════════════
const runAllLoanChecks = async () => {
  await checkLoanGivenReminders();
  await checkLoanBorrowedAlerts();
};


// ════════════════════════════════════════════════════════════
// Cron schedules
//  • Every day at 09:00 AM  →  main daily run
//  • Every day at 06:00 PM  →  evening backup run
//  Both use Asia/Kolkata (IST) timezone
// ════════════════════════════════════════════════════════════
const startCronJobs = () => {
  // Morning run — 9 AM IST every day
  cron.schedule(
    '0 9 * * *',
    async () => {
      console.log('\n⏰ [CRON] 9 AM daily loan check — ' + new Date().toLocaleString('en-IN'));
      await runAllLoanChecks();
    },
    { timezone: 'Asia/Kolkata' }
  );

  // Evening run — 6 PM IST every day (catches late additions)
  cron.schedule(
    '0 18 * * *',
    async () => {
      console.log('\n⏰ [CRON] 6 PM daily loan check — ' + new Date().toLocaleString('en-IN'));
      await runAllLoanChecks();
    },
    { timezone: 'Asia/Kolkata' }
  );

  console.log('⏰ Loan alert cron jobs started (9 AM + 6 PM IST daily)');
};


module.exports = {
  startCronJobs,
  runAllLoanChecks,
  checkLoanGivenReminders,
  checkLoanBorrowedAlerts,
};
