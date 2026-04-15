const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const emailService = require('./emailService');

/**
 * Check and send reminders for loans given (borrower should pay back)
 */
const checkLoanGivenReminders = async () => {
  console.log('🔄 Checking loan reminders...');
  try {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Find loans due within 3 days that haven't been reminded
    const dueSoonLoans = await Transaction.find({
      type: 'Loan Given',
      loanStatus: 'Pending',
      dueDate: { $gte: now, $lte: threeDaysLater },
      reminderSent: false,
      loanGetterEmail: { $ne: null },
    });

    for (const loan of dueSoonLoans) {
      try {
        await emailService.sendLoanReminder({
          to: loan.loanGetterEmail,
          borrowerName: loan.loanGetterName || 'Friend',
          lenderName: 'the lender',
          amount: loan.amount,
          dueDate: loan.dueDate,
          reason: loan.reason,
        });

        loan.reminderSent = true;
        await loan.save();
        console.log(`✉️  Reminder sent for loan ${loan._id} to ${loan.loanGetterEmail}`);
      } catch (err) {
        console.error(`Failed to send reminder for loan ${loan._id}:`, err.message);
      }
    }

    // Mark overdue loans
    await Transaction.updateMany(
      { loanStatus: 'Pending', dueDate: { $lt: now } },
      { loanStatus: 'Overdue' }
    );

    console.log(`✅ Checked ${dueSoonLoans.length} loans for reminders`);
  } catch (error) {
    console.error('Alert service error:', error.message);
  }
};

/**
 * Check loans borrowed (user should pay back)
 */
const checkLoanBorrowedAlerts = async () => {
  try {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const dueSoonBorrowedLoans = await Transaction.find({
      type: 'Loan Borrowed',
      loanStatus: 'Pending',
      dueDate: { $gte: now, $lte: threeDaysLater },
      alertShown: false,
    }).populate('userId', 'email name notificationsEnabled');

    for (const loan of dueSoonBorrowedLoans) {
      if (loan.userId && loan.userId.notificationsEnabled) {
        try {
          await emailService.sendDueDateAlert({
            to: loan.userId.email,
            userName: loan.userId.name,
            amount: loan.amount,
            dueDate: loan.dueDate,
            reason: loan.reason,
          });

          loan.alertShown = true;
          await loan.save();
          console.log(`🔔 Due date alert sent to ${loan.userId.email}`);
        } catch (err) {
          console.error('Failed to send due date alert:', err.message);
        }
      }
    }
  } catch (error) {
    console.error('Loan borrowed alert error:', error.message);
  }
};

/**
 * Start all cron jobs
 */
const startCronJobs = () => {
  // Run every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily loan reminder check...');
    await checkLoanGivenReminders();
    await checkLoanBorrowedAlerts();
  });

  // Also run every 6 hours as backup
  cron.schedule('0 */6 * * *', async () => {
    await checkLoanGivenReminders();
  });

  console.log('⏰ Alert cron jobs started');
};

module.exports = { startCronJobs, checkLoanGivenReminders, checkLoanBorrowedAlerts };
