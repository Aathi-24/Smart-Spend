const { google } = require('googleapis');

const SHEET_HEADERS = [
  'Date of Transaction',
  'Type of Expense',
  'Amount (₹)',
  'Reason / Description',
  'Category',
  'Due Date',
  'Loan Receiver Email',
  'Loan Receiver Name',
  'Loan Status',
  'User Name',
  'User Email',
  'Transaction ID',
  'Synced At',
];

const USERS_SHEET_HEADERS = [
  'Name',
  'Email',
  'Role',
  'Password (Hashed)',
  'Created At',
];

const getAuthClient = () => {
  const credentials = {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('Google Sheets credentials not configured');
  }

  return new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
  );
};

const getSheets = () => {
  const auth = getAuthClient();
  return google.sheets({ version: 'v4', auth });
};

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

/**
 * Initialize the Google Sheet with headers
 */
const initializeSheet = async () => {
  try {
    const sheets = getSheets();

    // Check if headers exist
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Transactions!A1:M1',
    });

    if (!response.data.values || response.data.values.length === 0) {
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'Transactions!A1',
        valueInputOption: 'RAW',
        requestBody: { values: [SHEET_HEADERS] },
      });

      // Format headers (bold, background)
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.067, green: 0.373, blue: 0.969 },
                    textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat)',
              },
            },
          ],
        },
      });
    }

    // Initialize Users sheet
    const usersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Users!A1:E1',
    }).catch(() => ({ data: { values: [] } }));

    if (!usersResponse.data.values || usersResponse.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: 'Users!A1',
        valueInputOption: 'RAW',
        requestBody: { values: [USERS_SHEET_HEADERS] },
      }).catch(() => {});
    }

    return true;
  } catch (error) {
    console.error('Sheet init error:', error.message);
    return false;
  }
};

/**
 * Add a transaction row to Google Sheets
 */
const addTransactionToSheet = async (transaction, user) => {
  try {
    const sheets = getSheets();
    await initializeSheet();

    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: '2-digit',
      });
    };

    const row = [
      formatDate(transaction.date),
      transaction.type,
      transaction.amount.toFixed(2),
      transaction.reason,
      transaction.category || 'Other',
      transaction.dueDate ? formatDate(transaction.dueDate) : '',
      transaction.loanGetterEmail || '',
      transaction.loanGetterName || '',
      transaction.loanStatus || '',
      user.name,
      user.email,
      transaction._id.toString(),
      new Date().toISOString(),
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Transactions!A:M',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });

    const updatedRange = response.data.updates?.updatedRange || '';
    const rowMatch = updatedRange.match(/(\d+)$/);
    const rowIndex = rowMatch ? parseInt(rowMatch[1]) : null;

    // Color code by type
    if (rowIndex) {
      let bgColor = { red: 0.9, green: 0.97, blue: 0.9 }; // Green for normal
      if (transaction.type === 'Loan Given') bgColor = { red: 1, green: 0.95, blue: 0.8 }; // Yellow
      if (transaction.type === 'Loan Borrowed') bgColor = { red: 1, green: 0.85, blue: 0.85 }; // Red

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{
            repeatCell: {
              range: { sheetId: 0, startRowIndex: rowIndex - 1, endRowIndex: rowIndex },
              cell: { userEnteredFormat: { backgroundColor: bgColor } },
              fields: 'userEnteredFormat(backgroundColor)',
            },
          }],
        },
      }).catch(() => {});
    }

    return { rowIndex, range: response.data.updates?.updatedRange };
  } catch (error) {
    console.error('Add to sheet error:', error.message);
    throw error;
  }
};

/**
 * Update an existing transaction in Google Sheets
 */
const updateTransactionInSheet = async (transaction, user) => {
  if (!transaction.sheetRowIndex) return null;
  try {
    const sheets = getSheets();
    const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN') : '';

    const row = [
      formatDate(transaction.date),
      transaction.type,
      transaction.amount.toFixed(2),
      transaction.reason,
      transaction.category || 'Other',
      transaction.dueDate ? formatDate(transaction.dueDate) : '',
      transaction.loanGetterEmail || '',
      transaction.loanGetterName || '',
      transaction.loanStatus || '',
      user.name,
      user.email,
      transaction._id.toString(),
      new Date().toISOString(),
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Transactions!A${transaction.sheetRowIndex}:M${transaction.sheetRowIndex}`,
      valueInputOption: 'RAW',
      requestBody: { values: [row] },
    });

    return true;
  } catch (error) {
    console.error('Update sheet error:', error.message);
    return false;
  }
};

/**
 * Add user to Users sheet
 */
const addUserToSheet = async (userData) => {
  try {
    const sheets = getSheets();
    await initializeSheet();

    const row = [
      userData.name,
      userData.email,
      userData.role || 'user',
      '****** (hashed)',
      new Date().toLocaleDateString('en-IN'),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Users!A:E',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });

    return true;
  } catch (error) {
    console.error('Add user to sheet error:', error.message);
    return false;
  }
};

/**
 * Log login activity
 */
const logLoginActivity = async (email, name) => {
  try {
    const sheets = getSheets();
    const row = [
      new Date().toISOString(),
      'LOGIN',
      name,
      email,
      '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Activity!A:E',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    }).catch(() => {});

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get all sheet data
 */
const getSheetData = async () => {
  try {
    const sheets = getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Transactions!A:M',
    });
    return response.data.values || [];
  } catch (error) {
    throw error;
  }
};

/**
 * Check connection
 */
const checkConnection = async () => {
  try {
    const sheets = getSheets();
    await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  addTransactionToSheet,
  updateTransactionInSheet,
  addUserToSheet,
  logLoginActivity,
  getSheetData,
  checkConnection,
  initializeSheet,
};
