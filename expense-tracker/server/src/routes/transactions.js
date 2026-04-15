const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const googleSheets = require('../services/googleSheets');

// @route   GET /api/transactions
// @desc    Get all transactions for logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit = 50, page = 1 } = req.query;

    const query = { userId: req.user._id };

    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(query),
    ]);

    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/transactions
// @desc    Create new transaction
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      date, type, amount, reason, category,
      loanGetterEmail, loanGetterName, dueDate,
      gpayTransactionId,
    } = req.body;

    const transaction = await Transaction.create({
      userId: req.user._id,
      date: date || new Date(),
      type,
      amount: parseFloat(amount),
      reason,
      category: category || 'Other',
      loanGetterEmail: type === 'Loan Given' ? loanGetterEmail : null,
      loanGetterName: type === 'Loan Given' ? loanGetterName : null,
      dueDate: (type === 'Loan Given' || type === 'Loan Borrowed') ? dueDate : null,
      loanStatus: (type === 'Loan Given' || type === 'Loan Borrowed') ? 'Pending' : null,
      gpayTransactionId,
    });

    // Sync to Google Sheets
    let sheetResult = null;
    try {
      sheetResult = await googleSheets.addTransactionToSheet(transaction, req.user);
      if (sheetResult) {
        transaction.syncedToSheet = true;
        transaction.sheetRowIndex = sheetResult.rowIndex;
        await transaction.save();
      }
    } catch (err) {
      console.log('⚠️  Google Sheets sync failed:', err.message);
    }

    res.status(201).json({
      success: true,
      transaction,
      sheetSynced: !!sheetResult,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Update Google Sheets
    try {
      await googleSheets.updateTransactionInSheet(transaction, req.user);
    } catch (err) {
      console.log('⚠️  Sheets update failed');
    }

    res.json({ success: true, transaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/transactions/stats
// @desc    Get transaction statistics
// @access  Private
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalStats, monthlyStats, categoryBreakdown, weeklyData] = await Promise.all([
      // All time totals
      Transaction.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      // This month
      Transaction.aggregate([
        { $match: { userId, date: { $gte: startOfMonth } } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      // Category breakdown
      Transaction.aggregate([
        { $match: { userId, type: 'Normal' } },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
      // Last 7 days daily spending
      Transaction.aggregate([
        {
          $match: {
            userId,
            date: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) },
            type: 'Normal',
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Process total stats
    const stats = { Normal: 0, 'Loan Given': 0, 'Loan Borrowed': 0 };
    totalStats.forEach((s) => (stats[s._id] = s.total));

    const monthly = { Normal: 0, 'Loan Given': 0, 'Loan Borrowed': 0 };
    monthlyStats.forEach((s) => (monthly[s._id] = s.total));

    // Pending loans
    const pendingLoans = await Transaction.aggregate([
      { $match: { userId, type: 'Loan Given', loanStatus: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const overdueLoans = await Transaction.find({
      userId,
      loanStatus: 'Pending',
      dueDate: { $lt: now },
    }).select('amount reason dueDate type loanGetterEmail loanGetterName');

    res.json({
      success: true,
      stats: {
        totalSpent: stats['Normal'],
        totalLoanGiven: stats['Loan Given'],
        totalLoanBorrowed: stats['Loan Borrowed'],
        monthlySpent: monthly['Normal'],
        monthlyLoanGiven: monthly['Loan Given'],
        pendingLoansAmount: pendingLoans[0]?.total || 0,
        pendingLoansCount: pendingLoans[0]?.count || 0,
        overdueLoans,
        categoryBreakdown,
        weeklyData,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
