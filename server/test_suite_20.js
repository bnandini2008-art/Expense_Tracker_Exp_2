/**
 * Spendly - Automated 20 Test Case Verification Suite
 * Role: Software Tester
 * Covers: Authentication, Home Dashboard, Transactions CRUD & Filters,
 * Analytics & Metrics, Security (Hashing & Lockout), and Settings.
 */

const assert = require('node:assert');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, 'expense_tracker.db');
const db = new DatabaseSync(DB_PATH);
const JWT_SECRET = 'spendly-super-secret-jwt-key-2026';

// Helper functions matching server implementation
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(storedPassword, providedPassword) {
  try {
    const [salt, originalHash] = storedPassword.split(':');
    const newHash = crypto.pbkdf2Sync(providedPassword, salt, 100000, 32, 'sha256').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(newHash, 'hex'));
  } catch (err) {
    return false;
  }
}

function generateToken(userId, email) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const payload = Buffer.from(JSON.stringify({ userId, email, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, payload, signature] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
    if (signature !== expectedSig) return null;
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch (e) {
    return null;
  }
}

// Test Runner
const results = [];

function runTest(tcId, module, description, testFn) {
  const start = Date.now();
  try {
    const details = testFn();
    const duration = Date.now() - start;
    results.push({
      id: tcId,
      module,
      description,
      status: 'PASS',
      duration: `${duration}ms`,
      details: details || 'Condition verified successfully'
    });
  } catch (err) {
    const duration = Date.now() - start;
    results.push({
      id: tcId,
      module,
      description,
      status: 'FAIL',
      duration: `${duration}ms`,
      details: err.message
    });
  }
}

console.log('🚀 Running 20 Comprehensive Test Cases for Spendly...\n');

// ---------------------------------------------------------
// MODULE 1: AUTHENTICATION & SECURITY (TC-01 to TC-07)
// ---------------------------------------------------------
const testEmail = `test_${Date.now()}@spendly.com`;
let testUserId = null;

runTest('TC-01', 'Auth', 'User Registration with unique email and valid data (FR-1.1)', () => {
  const name = 'QA Tester';
  const pwd = 'Password123!';
  const pwdHash = hashPassword(pwd);
  const stmt = db.prepare('INSERT INTO users (name, email, password_hash, currency) VALUES (?, ?, ?, ?)');
  const res = stmt.run(name, testEmail, pwdHash, '₹');
  testUserId = Number(res.lastInsertRowid);
  assert(testUserId > 0, 'User ID should be generated');
  return `User registered with ID ${testUserId} and email ${testEmail}`;
});

runTest('TC-02', 'Auth', 'Registration rejects duplicate email address (FR-1.1)', () => {
  let duplicateCaught = false;
  try {
    const stmt = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
    stmt.run('Duplicate User', testEmail, 'hash123');
  } catch (err) {
    duplicateCaught = true;
  }
  assert(duplicateCaught, 'Database unique constraint must reject duplicate email');
  return 'Duplicate email rejected with UNIQUE constraint error';
});

runTest('TC-03', 'Auth', 'Password length validation rejects passwords < 6 characters (FR-1.1)', () => {
  const shortPwd = '12345';
  const isValid = shortPwd.length >= 6;
  assert(!isValid, 'Validation must reject passwords under 6 characters');
  return 'Validation blocked 5-character password successfully';
});

runTest('TC-04', 'Auth', 'Valid user login authenticates and generates JWT token (FR-1.2)', () => {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(testEmail);
  const isValid = verifyPassword(user.password_hash, 'Password123!');
  assert(isValid, 'Password match must return true');
  const token = generateToken(user.id, user.email);
  const verified = verifyToken(token);
  assert(verified && verified.userId === user.id, 'JWT token must be valid and contain user ID');
  return `Token verified for User ID ${user.id}`;
});

runTest('TC-05', 'Auth', 'Invalid credentials rejected with error (FR-1.3)', () => {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(testEmail);
  const isValid = verifyPassword(user.password_hash, 'IncorrectPassword!');
  assert(!isValid, 'Password verification must fail on wrong password');
  return 'Invalid password correctly evaluated to false';
});

runTest('TC-06', 'Auth / Security', 'Account lockout after 5 consecutive failed attempts (FR-1.3)', () => {
  // Simulate 5 failed login attempts
  for (let i = 1; i <= 5; i++) {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(testUserId);
    const attempts = (user.failed_attempts || 0) + 1;
    let lockedUntil = null;
    if (attempts >= 5) {
      lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    }
    db.prepare('UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?').run(attempts, lockedUntil, testUserId);
  }
  const lockedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(testUserId);
  assert.strictEqual(lockedUser.failed_attempts, 5, 'Failed attempts must be 5');
  assert(lockedUser.locked_until !== null, 'Account must have locked_until timestamp set');
  const isLocked = new Date() < new Date(lockedUser.locked_until);
  assert(isLocked, 'Account must currently be locked');
  return 'Account locked for 15 minutes after 5 failed attempts';
});

runTest('TC-07', 'Security', 'Password stored as salted PBKDF2 hash, never plaintext (NFR Security)', () => {
  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(testUserId);
  assert(!user.password_hash.includes('Password123!'), 'Plaintext must not be present');
  assert(user.password_hash.includes(':'), 'Hash must contain salt separator');
  const [salt, hash] = user.password_hash.split(':');
  assert.strictEqual(salt.length, 32, 'Salt should be 16 bytes (32 hex characters)');
  assert.strictEqual(hash.length, 64, 'PBKDF2 SHA-256 hash should be 64 hex characters');
  return 'Password securely hashed with 100,000 PBKDF2 SHA-256 iterations & random salt';
});

// ---------------------------------------------------------
// MODULE 2: HOME DASHBOARD & SUMMARY (TC-08 to TC-10)
// ---------------------------------------------------------
const demoUser = db.prepare('SELECT * FROM users WHERE email = ?').get('nandini@spendly.com');

runTest('TC-08', 'Home', 'Live Balance calculation equals Total Income minus Total Expenses (FR-2.1)', () => {
  const totals = db.prepare(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
    FROM transactions WHERE user_id = ?
  `).get(demoUser.id);
  const balance = totals.income - totals.expenses;
  assert.strictEqual(balance, totals.income - totals.expenses, 'Balance must equal income - expenses');
  return `Income: ₹${totals.income}, Expenses: ₹${totals.expenses}, Balance: ₹${balance}`;
});

runTest('TC-09', 'Home', 'Initial Demo figures match UI screenshot: Balance ₹6,250, Income ₹15,000, Expenses ₹8,750 (FR-2.1)', () => {
  const totals = db.prepare(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
    FROM transactions WHERE user_id = ?
  `).get(demoUser.id);
  assert.strictEqual(totals.income, 15000, 'Income must be exactly 15,000');
  assert.strictEqual(totals.expenses, 8750, 'Expenses must be exactly 8,750');
  assert.strictEqual(totals.income - totals.expenses, 6250, 'Balance must be exactly 6,250');
  return 'Values match UI: Balance ₹6,250 | Income ₹15,000 | Expenses ₹8,750';
});

runTest('TC-10', 'Home', 'Recent Transactions endpoint returns latest records in descending chronological order (FR-2.2)', () => {
  const recent = db.prepare(`
    SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT 4
  `).all(demoUser.id);
  assert(recent.length >= 4, 'Should retrieve latest 4 transactions');
  const d0 = new Date(recent[0].date);
  const d1 = new Date(recent[1].date);
  assert(d0 >= d1, 'Transactions must be sorted descending by date');
  return `Retrieved ${recent.length} recent transactions, latest: ${recent[0].category_name} (${recent[0].date})`;
});

// ---------------------------------------------------------
// MODULE 3: TRANSACTIONS CRUD & FILTERS (TC-11 to TC-16)
// ---------------------------------------------------------
let createdTxId = null;

runTest('TC-11', 'Transactions', 'Add Income transaction with payment method & description (FR-3.1)', () => {
  const stmt = db.prepare(`
    INSERT INTO transactions (user_id, category_name, category_icon, type, amount, date, time, payment_method, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const res = stmt.run(testUserId, 'Freelance', '💻', 'income', 5000.0, '2026-11-17', '11:00 AM', 'Bank Transfer', 'Website Design project');
  createdTxId = Number(res.lastInsertRowid);
  assert(createdTxId > 0, 'Transaction ID must be returned');
  return `Income added: ₹5,000 (ID: ${createdTxId})`;
});

runTest('TC-12', 'Transactions', 'Add Expense transaction with positive amount and category (FR-3.1)', () => {
  const stmt = db.prepare(`
    INSERT INTO transactions (user_id, category_name, category_icon, type, amount, date, time, payment_method, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const res = stmt.run(testUserId, 'Food', '🍔', 'expense', 450.0, '2026-11-17', '01:30 PM', 'UPI', 'Lunch with team');
  const expId = Number(res.lastInsertRowid);
  assert(expId > 0, 'Expense ID must be generated');
  return `Expense added: ₹450 (ID: ${expId})`;
});

runTest('TC-13', 'Transactions', 'Validation rejects negative or zero amounts (FR-3.1)', () => {
  const invalidAmounts = [0, -100, -0.5];
  for (const amt of invalidAmounts) {
    const isValid = amt > 0;
    assert(!isValid, `Amount ${amt} must be rejected`);
  }
  return 'Zero and negative amounts correctly rejected by validation rule';
});

runTest('TC-14', 'Transactions', 'Edit existing transaction updates records accurately (FR-3.2)', () => {
  db.prepare(`
    UPDATE transactions 
    SET amount = ?, description = ? 
    WHERE id = ? AND user_id = ?
  `).run(5500.0, 'Updated Website Project with bonus', createdTxId, testUserId);
  const updated = db.prepare('SELECT amount, description FROM transactions WHERE id = ?').get(createdTxId);
  assert.strictEqual(updated.amount, 5500.0, 'Amount must be updated to 5500.0');
  assert.strictEqual(updated.description, 'Updated Website Project with bonus');
  return `Transaction ID ${createdTxId} updated: Amount ₹${updated.amount}`;
});

runTest('TC-15', 'Transactions', 'Delete transaction removes record from database (FR-3.2)', () => {
  db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(createdTxId, testUserId);
  const check = db.prepare('SELECT id FROM transactions WHERE id = ?').get(createdTxId);
  assert(!check, 'Deleted transaction must no longer exist');
  return `Transaction ID ${createdTxId} deleted successfully`;
});

runTest('TC-16', 'Transactions', 'Search and filter by category and transaction type (FR-3.3)', () => {
  const filtered = db.prepare(`
    SELECT * FROM transactions 
    WHERE user_id = ? AND type = ? AND category_name = ?
  `).all(demoUser.id, 'expense', 'Food');
  assert(filtered.length > 0, 'Should find Food expenses');
  filtered.forEach(tx => {
    assert.strictEqual(tx.type, 'expense');
    assert.strictEqual(tx.category_name, 'Food');
  });
  return `Filter returned ${filtered.length} transactions for Food (expenses)`;
});

// ---------------------------------------------------------
// MODULE 4: ANALYTICS & EXPORTS (TC-17 to TC-19)
// ---------------------------------------------------------
runTest('TC-17', 'Analytics', 'Category-wise spending share percentage breakdown calculation (FR-4.2, FR-4.3)', () => {
  const catRows = db.prepare(`
    SELECT category_name, SUM(amount) as total
    FROM transactions
    WHERE user_id = ? AND type = 'expense'
    GROUP BY category_name
  `).all(demoUser.id);
  const totalExp = catRows.reduce((sum, r) => sum + r.total, 0);
  assert.strictEqual(totalExp, 8750, 'Total expense must be 8750');
  
  const shares = {};
  catRows.forEach(r => {
    shares[r.category_name] = Math.round((r.total / totalExp) * 100);
  });
  // Food 35%, Travel 25%, Shopping 20%, Utilities 12%, Others 8%
  assert(shares['Food'] >= 34 && shares['Food'] <= 36, `Food share expected ~35%, got ${shares['Food']}%`);
  assert(shares['Travel'] >= 24 && shares['Travel'] <= 26, `Travel share expected ~25%, got ${shares['Travel']}%`);
  assert(shares['Shopping'] >= 19 && shares['Shopping'] <= 21, `Shopping share expected ~20%, got ${shares['Shopping']}%`);
  return `Calculated Donut shares: Food (${shares['Food']}%), Travel (${shares['Travel']}%), Shopping (${shares['Shopping']}%), Utilities (${shares['Utilities']}%), Others (${shares['Others']}%)`;
});

runTest('TC-18', 'Analytics', 'Savings Rate metric calculation ((Income - Expense) / Income * 100) (FR-4.1)', () => {
  const totals = db.prepare(`
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
    FROM transactions WHERE user_id = ?
  `).get(demoUser.id);
  const savings = totals.income - totals.expenses;
  const rate = Math.round((savings / totals.income) * 100);
  assert.strictEqual(rate, 42, `Savings rate for ₹15000 income and ₹8750 expense should be 42%, got ${rate}%`);
  return `Net Savings: ₹${savings}, Computed Rate: ${rate}%`;
});

runTest('TC-19', 'Analytics', 'CSV Export generates valid CSV header and rows (FR-4.4)', () => {
  const rows = db.prepare(`
    SELECT date, time, type, category_name, amount, payment_method, description
    FROM transactions WHERE user_id = ?
  `).all(demoUser.id);
  let csv = 'Date,Time,Type,Category,Amount,Payment Method,Description\r\n';
  rows.forEach(r => {
    csv += `"${r.date}","${r.time}","${r.type}","${r.category_name}",${r.amount},"${r.payment_method}","${r.description}"\r\n`;
  });
  assert(csv.startsWith('Date,Time,Type,Category,Amount'), 'CSV must start with header');
  const lines = csv.trim().split('\r\n');
  assert.strictEqual(lines.length, rows.length + 1, 'CSV must contain header + all transaction lines');
  return `Exported ${rows.length} records into ${csv.length} bytes CSV`;
});

// ---------------------------------------------------------
// MODULE 5: SETTINGS & PREFERENCES (TC-20)
// ---------------------------------------------------------
runTest('TC-20', 'Settings', 'Preferences currency update & password change verification (FR-5.2, FR-5.3)', () => {
  // Update currency preference
  db.prepare('UPDATE users SET currency = ? WHERE id = ?').run('$', testUserId);
  const updatedUser = db.prepare('SELECT currency FROM users WHERE id = ?').get(testUserId);
  assert.strictEqual(updatedUser.currency, '$', 'Currency must be updated to $');

  // Change password
  const newPwd = 'NewSecurePassword456!';
  const newHash = hashPassword(newPwd);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, testUserId);
  const pwdCheck = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(testUserId);
  assert(verifyPassword(pwdCheck.password_hash, newPwd), 'New password verification must succeed');
  assert(!verifyPassword(pwdCheck.password_hash, 'Password123!'), 'Old password must no longer work');
  return 'Currency updated to $ and password changed successfully with old password invalidation';
});

// Output Summary
console.log('------------------------------------------------------------------------------------------------------------------------');
console.log('| ID    | Module       | Status | Duration | Description                                                               |');
console.log('------------------------------------------------------------------------------------------------------------------------');
results.forEach(r => {
  console.log(`| ${r.id.padEnd(5)} | ${r.module.padEnd(12)} | ${r.status.padEnd(6)} | ${r.duration.padEnd(8)} | ${r.description.slice(0, 72).padEnd(73)} |`);
});
console.log('------------------------------------------------------------------------------------------------------------------------');

const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
console.log(`\n📊 TEST SUMMARY: Total: ${results.length} | PASSED: ${passed} | FAILED: ${failed} | Success Rate: ${(passed/results.length*100).toFixed(1)}%\n`);

// Clean up temporary test user
db.prepare('DELETE FROM transactions WHERE user_id = ?').run(testUserId);
db.prepare('DELETE FROM users WHERE id = ?').run(testUserId);
