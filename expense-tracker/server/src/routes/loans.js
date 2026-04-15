const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const emailService = require('../services/emailService');

// @route   GET /api/loans
// @desc    Get all loan transactions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {
      userId: req.user._id,
      type: { $in: ['Loan Given', 'Loan Borrowed'] },
    };
    if (status) query.loanStatus = status;
    if (type) query.type = type;

    const loans = await Transaction.find(query).sort({ date: -1 });
    res.json({ success: true, loans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/loans/:id/mark-paid
// @desc    Mark loan as paid
// @access  Private
router.put('/:id/mark-paid', protect, async (req, res) => {
  try {
    const loan = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { loanStatus: 'Paid' },
      { new: true }
    );
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }
    res.json({ success: true, loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/loans/:id/send-reminder
// @desc    Manually send reminder email to loan getter
// @access  Private
router.post('/:id/send-reminder', protect, async (req, res) => {
  try {
    const loan = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
      type: 'Loan Given',
    });

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (!loan.loanGetterEmail) {
      return res.status(400).json({ success: false, message: 'No email address for loan recipient' });
    }

    await emailService.sendLoanReminder({
      to: loan.loanGetterEmail,
      borrowerName: loan.loanGetterName || 'Friend',
      lenderName: req.user.name,
      amount: loan.amount,
      dueDate: loan.dueDate,
      reason: loan.reason,
    });

    loan.reminderSent = true;
    await loan.save();

    res.json({ success: true, message: 'Reminder email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/loans/upcoming
// @desc    Get upcoming due loans (within 3 days)
// @access  Private
router.get('/alerts/upcoming', protect, async (req, res) => {
  try {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const upcomingLoans = await Transaction.find({
      userId: req.user._id,
      loanStatus: 'Pending',
      dueDate: { $gte: now, $lte: threeDaysLater },
    }).sort({ dueDate: 1 });

    const overdueLoans = await Transaction.find({
      userId: req.user._id,
      loanStatus: 'Pending',
      dueDate: { $lt: now },
    }).sort({ dueDate: -1 });

    // Auto-mark overdue
    if (overdueLoans.length > 0) {
      await Transaction.updateMany(
        {
          userId: req.user._id,
          loanStatus: 'Pending',
          dueDate: { $lt: now },
        },
        { loanStatus: 'Overdue' }
      );
    }

    res.json({
      success: true,
      upcomingLoans,
      overdueLoans,
      hasAlerts: upcomingLoans.length > 0 || overdueLoans.length > 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
