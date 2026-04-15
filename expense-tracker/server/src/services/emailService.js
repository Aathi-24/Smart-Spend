const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const formatAmount = (amount) => `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

/**
 * Send loan reminder email to borrower
 */
const sendLoanReminder = async ({ to, borrowerName, lenderName, amount, dueDate, reason }) => {
  const transporter = createTransporter();

  const daysUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;
  const urgencyText = isOverdue
    ? `This payment is <strong>${Math.abs(daysUntilDue)} days overdue!</strong>`
    : daysUntilDue === 0
    ? `This payment is <strong>due today!</strong>`
    : `Payment is due in <strong>${daysUntilDue} day(s)</strong>.`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4ff; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1130FF, #0066FF); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; font-size: 26px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.8); margin-top: 8px; }
    .badge { display: inline-block; background: ${isOverdue ? '#ff4757' : '#ffa502'}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-top: 12px; }
    .body { padding: 36px 30px; }
    .greeting { font-size: 18px; color: #1a1a2e; font-weight: 600; margin-bottom: 16px; }
    .amount-card { background: linear-gradient(135deg, #f0f4ff, #e8eeff); border: 2px solid #c7d2fe; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
    .amount { font-size: 42px; font-weight: 800; color: #1130FF; }
    .amount-label { font-size: 14px; color: #666; margin-top: 4px; }
    .details { background: #f8faff; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e8e8e8; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #666; font-size: 14px; }
    .detail-value { color: #1a1a2e; font-weight: 600; font-size: 14px; }
    .urgency { background: ${isOverdue ? '#fff0f0' : '#fff8e7'}; border: 1px solid ${isOverdue ? '#ffcdd2' : '#ffe0b2'}; border-radius: 8px; padding: 14px 18px; margin: 20px 0; color: ${isOverdue ? '#c62828' : '#e65100'}; font-size: 15px; }
    .cta { text-align: center; margin: 28px 0; }
    .footer { background: #f8faff; padding: 20px 30px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Loan Payment Reminder</h1>
      <p>Sent via ExpenseTracker Pro</p>
      <span class="badge">${isOverdue ? '⚠️ OVERDUE' : '📅 DUE SOON'}</span>
    </div>
    <div class="body">
      <p class="greeting">Hello ${borrowerName},</p>
      <p style="color:#555; line-height:1.6;">This is a friendly reminder from <strong>${lenderName}</strong> about a loan repayment.</p>
      
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
      
      <p style="color:#555; line-height:1.6; font-size:14px;">Please arrange for the repayment at your earliest convenience. If you have already made the payment, please disregard this message.</p>
    </div>
    <div class="footer">
      <p>This is an automated reminder from <strong>ExpenseTracker Pro</strong></p>
      <p style="margin-top:6px;">If you believe this is an error, please contact ${lenderName} directly.</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `ExpenseTracker <${process.env.EMAIL_USER}>`,
    to,
    subject: `${isOverdue ? '⚠️ OVERDUE' : '📅 Payment Reminder'}: ${formatAmount(amount)} loan from ${lenderName}`,
    html,
  });

  console.log(`✉️  Reminder email sent to ${to}`);
  return true;
};

/**
 * Send due date alert to user (you need to pay back)
 */
const sendDueDateAlert = async ({ to, userName, amount, dueDate, reason }) => {
  const transporter = createTransporter();
  const daysUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4ff; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 30px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #FF6B35, #FF4757); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; font-size: 26px; font-weight: 700; }
    .amount { font-size: 42px; font-weight: 800; color: #FF4757; text-align: center; padding: 20px; }
    .body { padding: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Loan Repayment Alert</h1>
      <p style="color:rgba(255,255,255,0.9)">You need to repay a loan!</p>
    </div>
    <div class="body">
      <p>Hello <strong>${userName}</strong>,</p>
      <p style="margin:16px 0;">This is a reminder that you have a loan repayment coming up in <strong>${daysUntilDue} day(s)</strong>.</p>
      <div class="amount">${formatAmount(amount)}</div>
      <p><strong>Purpose:</strong> ${reason}</p>
      <p><strong>Due Date:</strong> ${formatDate(dueDate)}</p>
      <p style="margin-top:16px;color:#666;font-size:14px;">Please ensure you have sufficient funds to repay this loan on time.</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `ExpenseTracker <${process.env.EMAIL_USER}>`,
    to,
    subject: `🔔 Loan Repayment Due in ${daysUntilDue} day(s): ${formatAmount(amount)}`,
    html,
  });

  return true;
};

module.exports = { sendLoanReminder, sendDueDateAlert };
