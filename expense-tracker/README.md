# 💸 ExpenseTracker Pro

A full-stack, real-time expense tracking application with Google Sheets integration, loan management, automated email reminders, and stunning 3D/animated UI.

---

## 🏗️ Tech Stack

| Layer       | Technology                                      |
|-------------|--------------------------------------------------|
| Frontend    | React.js (Vite), Tailwind CSS, Framer Motion    |
| 3D / Visual | Three.js (@react-three/fiber), Particles.js     |
| Backend     | Node.js, Express.js                              |
| Database    | MongoDB (Mongoose)                               |
| Sheets      | Google Sheets API v4                             |
| Email       | Nodemailer (Gmail SMTP)                          |
| Auth        | JWT (JSON Web Tokens)                            |
| Scheduler   | node-cron (daily reminders)                      |

---

## 📁 Project Structure

```
expense-tracker/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # GlassCard, LoadingScreen
│   │   │   ├── layout/        # Sidebar, Navbar, PageTransition
│   │   │   ├── dashboard/     # StatsCards, Charts, RecentTransactions
│   │   │   ├── transactions/  # AddTransactionModal, TransactionTable, Filters
│   │   │   ├── loans/         # LoanCard, LoanAlerts
│   │   │   ├── three/         # ThreeScene (3D animated canvas)
│   │   │   └── particles/     # ParticleBackground
│   │   ├── context/           # AuthContext, AppContext
│   │   ├── pages/             # LoginPage, Dashboard, Transactions, Loans, Settings
│   │   └── utils/             # api.js, formatters.js
│   └── package.json
│
└── server/                    # Node.js + Express backend
    ├── src/
    │   ├── routes/            # auth, transactions, loans, sheets
    │   ├── models/            # User, Transaction
    │   ├── services/          # googleSheets, emailService, alertService
    │   ├── middleware/        # auth (JWT)
    │   └── config/            # db.js (MongoDB + seed)
    └── package.json
```

---

## 🚀 Quick Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Google Cloud project with Sheets API enabled
- Gmail account (for email reminders)

---

### 1. Clone & Install

```bash
# Install server dependencies
cd expense-tracker/server
npm install

# Install client dependencies
cd ../client
npm install
```

---

### 2. Server Environment Variables

Copy `.env.example` to `.env` in the `server/` directory:

```bash
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_super_secret_key_here

# Google Sheets (see setup below)
GOOGLE_SHEETS_CLIENT_EMAIL=your-service@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms

# Gmail SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password   # Gmail App Password (not account password)
EMAIL_FROM=ExpenseTracker <your_gmail@gmail.com>

FRONTEND_URL=http://localhost:5173
```

---

### 3. Google Sheets Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Sheets API**
4. Go to **IAM & Admin > Service Accounts**
5. Create a service account, download JSON key
6. Copy `client_email` and `private_key` into `.env`
7. Create a new Google Sheet
8. **Share the sheet** with the service account email (editor access)
9. Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/`
10. Add the following sheets (tabs) in your spreadsheet:
    - `Transactions` (main data)
    - `Users` (user registry)
    - `Activity` (login log)

---

### 4. Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication
3. Go to **App Passwords**
4. Generate a password for "Mail"
5. Use that 16-character password as `EMAIL_PASS`

---

### 5. Run the Application

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 👤 Default Login Accounts

These are seeded automatically on first run and synced to Google Sheets:

| Name        | Email                            | Password   | Role  |
|-------------|----------------------------------|------------|-------|
| Admin User  | admin@expensetracker.com         | Admin@123  | admin |
| John Doe    | john@expensetracker.com          | John@123   | user  |
| Jane Smith  | jane@expensetracker.com          | Jane@123   | user  |

---

## 📊 Google Sheets Column Structure

### Transactions Sheet
| Column | Content                  |
|--------|--------------------------|
| A      | Date of Transaction      |
| B      | Type of Expense          |
| C      | Amount (₹)               |
| D      | Reason / Description     |
| E      | Category                 |
| F      | Due Date                 |
| G      | Loan Receiver Email      |
| H      | Loan Receiver Name       |
| I      | Loan Status              |
| J      | User Name                |
| K      | User Email               |
| L      | Transaction ID           |
| M      | Synced At                |

### Color coding
- 🟢 Green rows — Normal expenses
- 🟡 Yellow rows — Loans Given
- 🔴 Red rows — Loans Borrowed

---

## ✨ Features

### Core
- ✅ Add/delete transactions (Normal, Loan Given, Loan Borrowed)
- ✅ Reason & date stored for every transaction
- ✅ Auto-sync every transaction to Google Sheets
- ✅ Color-coded rows in Sheets by type

### Loans
- ✅ Track loans given with borrower name & email
- ✅ Track loans borrowed with due dates
- ✅ Mark loans as paid
- ✅ Automated email reminder to borrower (3 days before due)
- ✅ Alert when your borrowed loan is due
- ✅ Overdue loan detection & flagging

### Dashboard
- ✅ Stats cards (total spent, loans, pending recovery)
- ✅ Weekly spending line chart
- ✅ Category donut chart
- ✅ Transaction type bar chart
- ✅ Real-time loan alerts panel

### UI/UX
- ✅ Light-themed glassmorphism design
- ✅ Three.js 3D animated hero scene
- ✅ Particle.js interactive cursor-reactive background
- ✅ Framer Motion page transitions (unique per page)
- ✅ Fully responsive (mobile / tablet / desktop)
- ✅ JWT authentication with persistent sessions

---

## 📧 Email Reminders (Automated)

- **Loan Given:** Borrower receives an HTML email reminder 3 days before due date
- **Loan Borrowed:** You receive an alert email 3 days before your repayment is due
- Cron runs daily at **9:00 AM**
- Manual reminder can be sent from Loans page or Transaction table

---

## 🛠️ API Endpoints

```
POST   /api/auth/login              Login
GET    /api/auth/me                 Get current user
GET    /api/auth/users              List default users

GET    /api/transactions            List transactions (with filters)
POST   /api/transactions            Create transaction → auto-syncs to Sheets
PUT    /api/transactions/:id        Update transaction
DELETE /api/transactions/:id        Delete transaction
GET    /api/transactions/stats/summary  Dashboard statistics

GET    /api/loans                   List loans
PUT    /api/loans/:id/mark-paid     Mark loan paid
POST   /api/loans/:id/send-reminder Send reminder email
GET    /api/loans/alerts/upcoming   Get upcoming/overdue loans

GET    /api/sheets/status           Check Sheets connection
POST   /api/sheets/sync-all         Bulk sync all transactions
GET    /api/sheets/data             Get raw sheet data
```
