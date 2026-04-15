const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const googleSheets = require('../services/googleSheets');
const Transaction = require('../models/Transaction');

// @route   GET /api/sheets/status
// @desc    Check Google Sheets connection status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const status = await googleSheets.checkConnection();
    res.json({ success: true, connected: status });
  } catch (error) {
    res.json({ success: true, connected: false, message: error.message });
  }
});

// @route   POST /api/sheets/sync-all
// @desc    Sync all transactions to Google Sheets
// @access  Private
router.post('/sync-all', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: 1 });
    let synced = 0;
    let failed = 0;

    for (const transaction of transactions) {
      try {
        await googleSheets.addTransactionToSheet(transaction, req.user);
        transaction.syncedToSheet = true;
        await transaction.save();
        synced++;
      } catch (err) {
        failed++;
      }
    }

    res.json({
      success: true,
      message: `Synced ${synced} transactions. ${failed} failed.`,
      synced,
      failed,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/sheets/data
// @desc    Get raw data from Google Sheets
// @access  Private
router.get('/data', protect, async (req, res) => {
  try {
    const data = await googleSheets.getSheetData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
