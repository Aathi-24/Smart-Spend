// ============================================================
// emailService.js  –  Nodemailer-based email service
// Place this file at:
//   expense-tracker/server/src/services/emailService.js
// (Replace the existing file completely)
// ============================================================

const nodemailer = require('nodemailer');

// ── Helper utilities ─────────────────────────────────────────
const formatAmount = (amount) =>
  `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

// ── Transporter factory ───────────────────────────────────────
// Uses Gmail SMTP with an App Password (not the Gmail API).
// Generate an App Password at:
//   https://myaccount.google.com/apppasswords
//   (2-Step Verification must be ON for your Gmail account)
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for port 465, false for 587 (STARTTLS)
    auth: {
      user: process.env.EMAIL_USER, // your Gmail address
      pass: process.env.EMAIL_PASS, // 16-char App Password (spaces are fine)
    },
  });
  return transporter;
};

// ── 1.  Loan Reminder  (you GAVE a loan → remind the borrower) ─
/**
 * @param {Object} opts
 * @param {string} opts.to            Borrower's email
 * @param {string} opts.borrowerName  Borrower's display name
 * @param {string} opts.lenderName    Your (lender's) name
 * @param {number} opts.amount        Loan amount (numeric)
 * @param {Date}   opts.dueDate       Repayment due date
 * @param {string} opts.reason        Purpose / reason for the loan
 */
const sendLoanReminder = async ({ to, borrowerName, lenderName, amount, dueDate, reason }) => {
  const transporter = createTransporter();

  const daysUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;

  const urgencyText = isOverdue
    ? `This payment is <strong>${Math.abs(daysUntilDue)} day(s) overdue!</strong>`
    : daysUntilDue === 0
    ? `This payment is <strong>due today!</strong>`
    : `Payment is due in <strong>${daysUntilDue} day(s)</strong>.`;

  const badgeColor = isOverdue ? '#ff4757' : '#ffa502';
  const badgeLabel = isOverdue ? '⚠️ OVERDUE' : '📅 DUE SOON';
  const urgencyBg = isOverdue ? '#fff0f0' : '#fff8e7';
  const urgencyBorder = isOverdue ? '#ffcdd2' : '#ffe0b2';
  const urgencyColor = isOverdue ? '#c62828' : '#e65100';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4ff;padding:20px}
    .container{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,.1)}
    .header{background:linear-gradient(135deg,#1130FF,#0066FF);padding:40px 30px;text-align:center}
    .header h1{color:#fff;font-size:26px;font-weight:700}
    .header p{color:rgba(255,255,255,.8);margin-top:8px}
    .badge{display:inline-block;background:${badgeColor};color:#fff;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600;margin-top:12px}
    .body{padding:36px 30px}
    .greeting{font-size:18px;color:#1a1a2e;font-weight:600;margin-bottom:16px}
    .amount-card{background:linear-gradient(135deg,#f0f4ff,#e8eeff);border:2px solid #c7d2fe;border-radius:12px;padding:24px;margin:24px 0;text-align:center}
    .amount{font-size:42px;font-weight:800;color:#1130FF}
    .amount-label{font-size:14px;color:#666;margin-top:4px}
    .details{background:#f8faff;border-radius:10px;padding:20px;margin:20px 0}
    .detail-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e8e8e8}
    .detail-row:last-child{border-bottom:none}
    .detail-label{color:#666;font-size:14px}
    .detail-value{color:#1a1a2e;font-weight:600;font-size:14px}
    .urgency{background:${urgencyBg};border:1px solid ${urgencyBorder};border-radius:8px;padding:14px 18px;margin:20px 0;color:${urgencyColor};font-size:15px}
    .footer{background:#f8faff;padding:20px 30px;text-align:center;font-size:12px;color:#999;border-top:1px solid #eee}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Loan Payment Reminder</h1>
      <p>Sent via SmartSpend</p>
      <span class="badge">${badgeLabel}</span>
    </div>
    <div class="body">
      <p class="greeting">Hello ${borrowerName},</p>
      <p style="color:#555;line-height:1.6;">
        This is a friendly reminder from <strong>${lenderName}</strong> about a loan repayment.
      </p>
      <div class="amount-card">
        <div class="amount">${formatAmount(amount)}</div>
        <div class="amount-label">Amount Due</div>
      </div>
      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Lender</span>
          <span class="detail-value">${lenderName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Purpose</span>
          <span class="detail-value">${reason}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Due Date</span>
          <span class="detail-value">${formatDate(dueDate)}</span>
        </div>
      </div>
      <div class="urgency">${urgencyText}</div>
      <p style="color:#555;line-height:1.6;font-size:14px;">
        Please arrange for the repayment at your earliest convenience.
        If you have already made the payment, please disregard this message.
      </p>
    </div>
    <div class="footer">
      <p>Automated reminder from <strong>SmartSpend</strong></p>
      <p style="margin-top:6px;">If this is an error, please contact ${lenderName} directly.</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `SmartSpend <${process.env.EMAIL_USER}>`,
    to,
    subject: `${isOverdue ? '⚠️ OVERDUE' : '📅 Payment Reminder'}: ${formatAmount(amount)} loan from ${lenderName}`,
    html,
  });

  console.log(`✉️  Loan reminder sent to ${to}`);
  return true;
};


// ── 2.  Due-Date Alert  (you BORROWED a loan → remind yourself) ─
/**
 * @param {Object} opts
 * @param {string} opts.to        Your email (the borrower)
 * @param {string} opts.userName  Your display name
 * @param {number} opts.amount    Loan amount (numeric)
 * @param {Date}   opts.dueDate   Repayment due date
 * @param {string} opts.reason    Purpose / reason for the loan
 */
const sendDueDateAlert = async ({ to, userName, amount, dueDate, reason }) => {
  const transporter = createTransporter();

  const daysUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;

  const headerBg = isOverdue
    ? 'linear-gradient(135deg,#FF4757,#c0392b)'
    : 'linear-gradient(135deg,#FF6B35,#FF4757)';

  const statusLine = isOverdue
    ? `This loan is <strong>${Math.abs(daysUntilDue)} day(s) overdue!</strong> Please repay immediately.`
    : daysUntilDue === 0
    ? `This loan is <strong>due today!</strong> Please repay as soon as possible.`
    : `You have <strong>${daysUntilDue} day(s)</strong> remaining to repay this loan.`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#fff5f0;padding:20px}
    .container{max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,.1)}
    .header{background:${headerBg};padding:40px 30px;text-align:center}
    .header h1{color:#fff;font-size:26px;font-weight:700}
    .header p{color:rgba(255,255,255,.9);margin-top:8px;font-size:15px}
    .body{padding:36px 30px}
    .amount-card{background:#fff5f5;border:2px solid #ffcdd2;border-radius:12px;padding:24px;margin:24px 0;text-align:center}
    .amount{font-size:42px;font-weight:800;color:#FF4757}
    .amount-label{font-size:14px;color:#888;margin-top:4px}
    .details{background:#fafafa;border-radius:10px;padding:20px;margin:20px 0}
    .detail-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}
    .detail-row:last-child{border-bottom:none}
    .detail-label{color:#666;font-size:14px}
    .detail-value{color:#1a1a2e;font-weight:600;font-size:14px}
    .status-box{background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:14px 18px;margin:20px 0;color:#e65100;font-size:15px}
    .footer{background:#fafafa;padding:20px 30px;text-align:center;font-size:12px;color:#aaa;border-top:1px solid #eee}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Loan Repayment Reminder</h1>
      <p>You have a loan repayment coming up!</p>
    </div>
    <div class="body">
      <p style="font-size:18px;font-weight:600;color:#1a1a2e;margin-bottom:16px;">Hello ${userName},</p>
      <p style="color:#555;line-height:1.6;">
        This is an automated reminder that you have an upcoming loan repayment.
        Please ensure you have sufficient funds ready.
      </p>
      <div class="amount-card">
        <div class="amount">${formatAmount(amount)}</div>
        <div class="amount-label">Amount You Need to Repay</div>
      </div>
      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Purpose</span>
          <span class="detail-value">${reason}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Due Date</span>
          <span class="detail-value">${formatDate(dueDate)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value" style="color:${isOverdue ? '#FF4757' : '#FF6B35'}">
            ${isOverdue ? '🔴 Overdue' : '🟡 Pending'}
          </span>
        </div>
      </div>
      <div class="status-box">${statusLine}</div>
      <p style="color:#888;line-height:1.6;font-size:13px;">
        If you have already repaid this loan, you can mark it as paid in your SmartSpend dashboard.
      </p>
    </div>
    <div class="footer">
      <p>Automated alert from <strong>SmartSpend</strong></p>
      <p style="margin-top:6px;">Log in to your dashboard to manage your loans.</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `SmartSpend <${process.env.EMAIL_USER}>`,
    to,
    subject: `🔔 Loan Repayment ${isOverdue ? 'OVERDUE' : `Due in ${daysUntilDue} day(s)`}: ${formatAmount(amount)}`,
    html,
  });

  console.log(`🔔 Due-date alert sent to ${to}`);
  return true;
};


module.exports = { sendLoanReminder, sendDueDateAlert };
