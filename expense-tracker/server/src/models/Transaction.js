const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['Normal', 'Loan Given', 'Loan Borrowed'],
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Food', 'Transport', 'Shopping', 'Entertainment', 'Medical', 'Utilities', 'Education', 'Loan', 'Other'],
      default: 'Other',
    },
    // For Loan Given
    loanGetterEmail: {
      type: String,
      default: null,
    },
    loanGetterName: {
      type: String,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    loanStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Overdue', null],
      default: null,
    },
    // Google Pay transaction ID
    gpayTransactionId: {
      type: String,
      default: null,
    },
    // Synced to Google Sheets
    sheetRowIndex: {
      type: Number,
      default: null,
    },
    syncedToSheet: {
      type: Boolean,
      default: false,
    },
    // Reminder sent flag
    reminderSent: {
      type: Boolean,
      default: false,
    },
    alertShown: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ dueDate: 1, loanStatus: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
