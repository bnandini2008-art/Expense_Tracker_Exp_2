const assert = require('node:assert');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');

console.log('🧪 Starting Spendly Backend Unit Tests...');

const DB_PATH = path.join(__dirname, 'expense_tracker.db');
const db = new DatabaseSync(DB_PATH);

// 1. Verify Schema & Seeding
const user = db.prepare('SELECT * FROM users WHERE email = ?').get('nandini@spendly.com');
assert(user, 'Demo user should exist');
assert.strictEqual(user.name, 'Nandini Boopathi');
assert.strictEqual(user.currency, '₹');
console.log('✅ Demo user verified:', user.name, user.email);

const categories = db.prepare('SELECT * FROM categories WHERE is_system = 1').all();
assert(categories.length >= 8, 'Default categories should be seeded');
console.log('✅ System categories count:', categories.length);

// 2. Verify Transactions seeded for Demo User (matching UI)
const txs = db.prepare('SELECT * FROM transactions WHERE user_id = ?').all(user.id);
assert(txs.length >= 4, 'Transactions should be seeded');

const totals = db.prepare(`
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
  FROM transactions WHERE user_id = ?
`).get(user.id);

console.log('✅ Total Income:', totals.income, 'Total Expenses:', totals.expenses, 'Balance:', totals.income - totals.expenses);
assert.strictEqual(totals.income, 15000, 'Income must match screenshot ₹ 15,000');
assert.strictEqual(totals.expenses, 8750, 'Expenses must match screenshot ₹ 8,750');
assert.strictEqual(totals.income - totals.expenses, 6250, 'Balance must match screenshot ₹ 6,250');

// 3. Test Password Hashing and Verification
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

const testPwd = 'MySecurePassword!';
const hashed = hashPassword(testPwd);
assert(verifyPassword(hashed, testPwd), 'Valid password verification must succeed');
assert(!verifyPassword(hashed, 'WrongPassword'), 'Invalid password must fail');
console.log('✅ PBKDF2 Password hashing & verification verified');

// 4. Test Add Transaction
const newTxStmt = db.prepare(`
  INSERT INTO transactions (user_id, category_name, category_icon, type, amount, date, time, payment_method, description)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const addRes = newTxStmt.run(user.id, 'Coffee', '☕', 'expense', 150.0, '2026-11-17', '10:30 AM', 'UPI', 'Latte');
const insertedId = Number(addRes.lastInsertRowid);
assert(insertedId > 0, 'New transaction ID must be valid');

// 5. Test Edit Transaction
db.prepare('UPDATE transactions SET amount = ? WHERE id = ?').run(180.0, insertedId);
const updatedTx = db.prepare('SELECT amount FROM transactions WHERE id = ?').get(insertedId);
assert.strictEqual(updatedTx.amount, 180.0, 'Amount should update to 180.0');

// 6. Test Delete Transaction
db.prepare('DELETE FROM transactions WHERE id = ?').run(insertedId);
const deletedTx = db.prepare('SELECT id FROM transactions WHERE id = ?').get(insertedId);
assert(!deletedTx, 'Transaction should be deleted');
console.log('✅ CRUD operations for transactions verified');

console.log('🎉 All backend unit tests passed successfully!');
