import os
import sys
import json
import sqlite3
import csv
import io
from datetime import datetime, timedelta
from urllib.parse import urlparse, parse_qs

# Import models & helper utilities
from models import (
    init_db, get_db_connection, hash_password, verify_password,
    generate_token, verify_token
)

init_db()

# Seed a default demo user matching the UI screenshot if not exists
def seed_demo_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM users WHERE email = ?', ('nandini@spendly.com',))
    user = cursor.fetchone()
    
    if not user:
        pwd_hash = hash_password('Password123!')
        cursor.execute('''
            INSERT INTO users (name, email, password_hash, currency, date_format, theme)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('Nandini Boopathi', 'nandini@spendly.com', pwd_hash, '₹', 'DD/MM/YYYY', 'light'))
        user_id = cursor.lastrowid
        
        # Sample transactions that exactly match the screenshot!
        # Total Balance: ₹ 6,250 | Total Income: ₹ 15,000 | Total Expenses: ₹ 8,750
        # Breakdown:
        # Food: 35% of 8750 = ~3062.50
        # Travel: 25% of 8750 = ~2187.50
        # Shopping: 20% of 8750 = ~1750.00
        # Utilities: 12% of 8750 = ~1050.00
        # Others: 8% of 8750 = ~700.00
        # Recent visible transactions:
        # 1. Food | Today, 7:45 PM | - ₹ 250
        # 2. Travel | Yesterday, 6:20 PM | - ₹ 600
        # 3. Shopping | 16 Nov, 2:30 PM | - ₹ 1,200
        # 4. Salary | 15 Nov, 9:00 AM | + ₹ 15,000
        
        today_str = datetime.now().strftime('%Y-%m-%d')
        yesterday_str = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        two_days_ago = (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d')
        three_days_ago = (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d')
        five_days_ago = (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d')
        ten_days_ago = (datetime.now() - timedelta(days=10)).strftime('%Y-%m-%d')

        demo_txs = [
            (user_id, 'Salary', '⚡', 'income', 15000.0, three_days_ago, '09:00 AM', 'Bank Transfer', 'Monthly Job Salary'),
            (user_id, 'Food', '🍔', 'expense', 250.0, today_str, '07:45 PM', 'UPI', 'Dinner at Cafe'),
            (user_id, 'Travel', '✈️', 'expense', 600.0, yesterday_str, '06:20 PM', 'Card', 'Cab commute'),
            (user_id, 'Shopping', '🛍️', 'expense', 1200.0, two_days_ago, '02:30 PM', 'UPI', 'Weekend clothes'),
            (user_id, 'Food', '🍔', 'expense', 2812.5, five_days_ago, '01:15 PM', 'Card', 'Groceries & provisions'),
            (user_id, 'Travel', '🚗', 'expense', 1587.5, ten_days_ago, '04:00 PM', 'UPI', 'Train and metro recharge'),
            (user_id, 'Shopping', '🛍️', 'expense', 550.0, ten_days_ago, '06:45 PM', 'Card', 'Accessories & gifts'),
            (user_id, 'Utilities', '🏠', 'expense', 1050.0, five_days_ago, '10:00 AM', 'Net Banking', 'Electricity & Internet bills'),
            (user_id, 'Others', '🟢', 'expense', 700.0, ten_days_ago, '11:30 AM', 'Cash', 'Miscellaneous supplies')
        ]
        
        cursor.executemany('''
            INSERT INTO transactions (user_id, category_name, category_icon, type, amount, date, time, payment_method, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', demo_txs)
        conn.commit()
    conn.close()

seed_demo_data()

# Business logic handler functions (callable by both Flask & standard http.server)
def handle_register(data):
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return {"error": "Name, email and password are required."}, 400
    
    if len(password) < 6:
        return {"error": "Password must be at least 6 characters."}, 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
    if cursor.fetchone():
        conn.close()
        return {"error": "An account with this email already exists."}, 409

    pwd_hash = hash_password(password)
    cursor.execute('''
        INSERT INTO users (name, email, password_hash)
        VALUES (?, ?, ?)
    ''', (name, email, pwd_hash))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    token = generate_token(user_id, email)
    return {
        "message": "Registration successful!",
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "currency": "₹",
            "date_format": "DD/MM/YYYY",
            "theme": "light"
        }
    }, 201

def handle_login(data):
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return {"error": "Email and password are required."}, 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return {"error": "Invalid email or password."}, 401

    # Check account lockout (FR-1.3)
    if user['locked_until']:
        locked_until = datetime.fromisoformat(user['locked_until'])
        if datetime.utcnow() < locked_until:
            rem = int((locked_until - datetime.utcnow()).total_seconds() / 60) + 1
            conn.close()
            return {"error": f"Account is temporarily locked due to repeated failed attempts. Please try again in {rem} minutes."}, 403

    if not verify_password(user['password_hash'], password):
        failed_attempts = (user['failed_attempts'] or 0) + 1
        locked_until_val = None
        msg = "Invalid email or password."

        if failed_attempts >= 5:
            locked_until_val = (datetime.utcnow() + timedelta(minutes=15)).isoformat()
            msg = "Too many failed attempts. Account locked for 15 minutes."

        cursor.execute('''
            UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?
        ''', (failed_attempts, locked_until_val, user['id']))
        conn.commit()
        conn.close()
        return {"error": msg}, 401

    # Reset failure counter on successful login
    cursor.execute('''
        UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?
    ''', (user['id'],))
    conn.commit()
    conn.close()

    token = generate_token(user['id'], user['email'])
    return {
        "message": "Login successful!",
        "token": token,
        "user": {
            "id": user['id'],
            "name": user['name'],
            "email": user['email'],
            "currency": user['currency'],
            "date_format": user['date_format'],
            "theme": user['theme']
        }
    }, 200

def get_current_user(token_header):
    if not token_header or not token_header.startswith('Bearer '):
        return None
    token = token_header.split(' ')[1]
    payload = verify_token(token)
    if not payload:
        return None
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, email, currency, date_format, theme FROM users WHERE id = ?', (payload['user_id'],))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def handle_get_transactions(user_id, params):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = 'SELECT * FROM transactions WHERE user_id = ?'
    query_args = [user_id]

    # Filters
    if 'type' in params and params['type'] in ('income', 'expense'):
        query += ' AND type = ?'
        query_args.append(params['type'])

    if 'category' in params and params['category'] and params['category'] != 'All':
        query += ' AND category_name = ?'
        query_args.append(params['category'])

    if 'startDate' in params and params['startDate']:
        query += ' AND date >= ?'
        query_args.append(params['startDate'])

    if 'endDate' in params and params['endDate']:
        query += ' AND date <= ?'
        query_args.append(params['endDate'])

    if 'search' in params and params['search']:
        query += ' AND (description LIKE ? OR category_name LIKE ?)'
        term = f"%{params['search']}%"
        query_args.extend([term, term])

    query += ' ORDER BY date DESC, id DESC'

    if 'limit' in params:
        try:
            limit = int(params['limit'])
            query += ' LIMIT ?'
            query_args.append(limit)
        except ValueError:
            pass

    cursor.execute(query, query_args)
    rows = cursor.fetchall()
    conn.close()

    transactions = [dict(row) for row in rows]
    return {"transactions": transactions}, 200

def handle_add_transaction(user_id, data):
    tx_type = data.get('type', 'expense')
    amount = float(data.get('amount', 0))
    category_name = data.get('category_name', 'Others')
    category_icon = data.get('category_icon', '🏷️')
    date_str = data.get('date', datetime.now().strftime('%Y-%m-%d'))
    time_str = data.get('time', datetime.now().strftime('%I:%M %p'))
    payment_method = data.get('payment_method', 'UPI')
    description = data.get('description', '')

    if amount <= 0:
        return {"error": "Amount must be greater than 0."}, 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO transactions (user_id, category_name, category_icon, type, amount, date, time, payment_method, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, category_name, category_icon, tx_type, amount, date_str, time_str, payment_method, description))
    tx_id = cursor.lastrowid
    conn.commit()

    cursor.execute('SELECT * FROM transactions WHERE id = ?', (tx_id,))
    new_tx = dict(cursor.fetchone())
    conn.close()

    return {"message": "Transaction added successfully!", "transaction": new_tx}, 201

def handle_update_transaction(user_id, tx_id, data):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM transactions WHERE id = ? AND user_id = ?', (tx_id, user_id))
    if not cursor.fetchone():
        conn.close()
        return {"error": "Transaction not found."}, 404

    cursor.execute('''
        UPDATE transactions
        SET category_name = ?, category_icon = ?, type = ?, amount = ?, date = ?, time = ?, payment_method = ?, description = ?
        WHERE id = ? AND user_id = ?
    ''', (
        data.get('category_name', 'Others'),
        data.get('category_icon', '🏷️'),
        data.get('type', 'expense'),
        float(data.get('amount', 0)),
        data.get('date'),
        data.get('time', '12:00 PM'),
        data.get('payment_method', 'UPI'),
        data.get('description', ''),
        tx_id, user_id
    ))
    conn.commit()
    cursor.execute('SELECT * FROM transactions WHERE id = ?', (tx_id,))
    updated_tx = dict(cursor.fetchone())
    conn.close()

    return {"message": "Transaction updated successfully!", "transaction": updated_tx}, 200

def handle_delete_transaction(user_id, tx_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM transactions WHERE id = ? AND user_id = ?', (tx_id, user_id))
    if not cursor.fetchone():
        conn.close()
        return {"error": "Transaction not found."}, 404

    cursor.execute('DELETE FROM transactions WHERE id = ? AND user_id = ?', (tx_id, user_id))
    conn.commit()
    conn.close()
    return {"message": "Transaction deleted successfully!"}, 200

def handle_analytics_summary(user_id, period='this_month'):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Determine date range based on period
    now = datetime.now()
    if period == 'this_month':
        start_date = now.strftime('%Y-%m-01')
        end_date = now.strftime('%Y-%m-%d')
    elif period == 'last_month':
        first_day_this_month = now.replace(day=1)
        last_day_prev_month = first_day_this_month - timedelta(days=1)
        start_date = last_day_prev_month.strftime('%Y-%m-01')
        end_date = last_day_prev_month.strftime('%Y-%m-%d')
    elif period == 'this_year':
        start_date = now.strftime('%Y-01-01')
        end_date = now.strftime('%Y-%m-%d')
    else:  # all
        start_date = '1970-01-01'
        end_date = '2099-12-31'

    # Get totals
    cursor.execute('''
        SELECT 
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
        FROM transactions
        WHERE user_id = ? AND date BETWEEN ? AND ?
    ''', (user_id, start_date, end_date))
    totals = cursor.fetchone()
    total_income = totals['total_income']
    total_expenses = totals['total_expenses']
    total_balance = total_income - total_expenses

    # Category breakdown for donut chart
    cursor.execute('''
        SELECT category_name, category_icon, SUM(amount) as amount
        FROM transactions
        WHERE user_id = ? AND type = 'expense' AND date BETWEEN ? AND ?
        GROUP BY category_name
        ORDER BY amount DESC
    ''', (user_id, start_date, end_date))
    cat_rows = cursor.fetchall()
    
    breakdown = []
    category_colors = {
        'Food': '#4ECDC4',
        'Travel': '#5DADE2',
        'Shopping': '#F1948A',
        'Utilities': '#F5B041',
        'Others': '#48C9B0',
        'Entertainment': '#A569BD',
        'Healthcare': '#E74C3C'
    }

    for row in cat_rows:
        pct = round((row['amount'] / total_expenses * 100), 1) if total_expenses > 0 else 0
        breakdown.append({
            "category": row['category_name'],
            "icon": row['category_icon'],
            "amount": row['amount'],
            "percentage": pct,
            "color": category_colors.get(row['category_name'], '#5DADE2')
        })

    # Savings Rate
    savings_rate = round(((total_income - total_expenses) / total_income * 100), 1) if total_income > 0 else 0

    # Monthly trends (last 6 months)
    cursor.execute('''
        SELECT 
            strftime('%Y-%m', date) as month,
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
        FROM transactions
        WHERE user_id = ?
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month ASC
        LIMIT 6
    ''', (user_id,))
    month_rows = cursor.fetchall()
    trends = []
    for m in month_rows:
        trends.append({
            "month": m['month'],
            "income": m['income'],
            "expenses": m['expenses'],
            "savings": m['income'] - m['expenses']
        })

    conn.close()

    return {
        "period": period,
        "total_balance": total_balance,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "balance_growth_pct": "+12%",
        "income_growth_pct": "+8%",
        "expense_growth_pct": "+5%",
        "savings_rate": savings_rate,
        "spending_comparison_pct": -18,
        "breakdown": breakdown,
        "trends": trends
    }, 200

def handle_export_csv(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT date, time, type, category_name, amount, payment_method, description
        FROM transactions
        WHERE user_id = ?
        ORDER BY date DESC, id DESC
    ''', (user_id,))
    rows = cursor.fetchall()
    conn.close()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Date', 'Time', 'Type', 'Category', 'Amount', 'Payment Method', 'Description'])
    for r in rows:
        writer.writerow([r['date'], r['time'], r['type'].capitalize(), r['category_name'], r['amount'], r['payment_method'], r['description']])
    
    return output.getvalue(), 200

# Standalone WSGI/HTTP server entry point
def run_standalone_server(port=5000):
    from http.server import HTTPServer, BaseHTTPRequestHandler

    class RequestHandler(BaseHTTPRequestHandler):
        def _set_headers(self, status=200, content_type='application/json'):
            self.send_response(status)
            self.send_header('Content-Type', content_type)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            self.end_headers()

        def do_OPTIONS(self):
            self._set_headers(204)

        def do_GET(self):
            parsed = urlparse(self.path)
            path = parsed.path
            params = {k: v[0] for k, v in parse_qs(parsed.query).items()}

            if path == '/api/health':
                self._set_headers(200)
                self.wfile.write(json.dumps({"status": "ok", "app": "Spendly API"}).encode())
                return

            # Auth protected routes
            auth_header = self.headers.get('Authorization')
            user = get_current_user(auth_header)

            if path == '/api/auth/me':
                if not user:
                    self._set_headers(401)
                    self.wfile.write(json.dumps({"error": "Unauthorized"}).encode())
                    return
                self._set_headers(200)
                self.wfile.write(json.dumps({"user": user}).encode())
                return

            if not user:
                self._set_headers(401)
                self.wfile.write(json.dumps({"error": "Unauthorized"}).encode())
                return

            if path == '/api/transactions':
                res, code = handle_get_transactions(user['id'], params)
                self._set_headers(code)
                self.wfile.write(json.dumps(res).encode())
            elif path == '/api/analytics/summary':
                res, code = handle_analytics_summary(user['id'], params.get('period', 'this_month'))
                self._set_headers(code)
                self.wfile.write(json.dumps(res).encode())
            elif path == '/api/analytics/export/csv':
                csv_data, code = handle_export_csv(user['id'])
                self.send_response(200)
                self.send_header('Content-Type', 'text/csv')
                self.send_header('Content-Disposition', 'attachment; filename=spendly_transactions.csv')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(csv_data.encode())
            elif path == '/api/settings/categories':
                conn = get_db_connection()
                c = conn.cursor()
                c.execute('SELECT * FROM categories WHERE user_id = ? OR is_system = 1 ORDER BY is_system DESC, name ASC', (user['id'],))
                cats = [dict(row) for row in c.fetchall()]
                conn.close()
                self._set_headers(200)
                self.wfile.write(json.dumps({"categories": cats}).encode())
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())

        def do_POST(self):
            parsed = urlparse(self.path)
            path = parsed.path
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode() if content_length > 0 else '{}'
            data = json.loads(body) if body else {}

            if path == '/api/auth/register':
                res, code = handle_register(data)
                self._set_headers(code)
                self.wfile.write(json.dumps(res).encode())
                return
            elif path == '/api/auth/login':
                res, code = handle_login(data)
                self._set_headers(code)
                self.wfile.write(json.dumps(res).encode())
                return

            auth_header = self.headers.get('Authorization')
            user = get_current_user(auth_header)
            if not user:
                self._set_headers(401)
                self.wfile.write(json.dumps({"error": "Unauthorized"}).encode())
                return

            if path == '/api/transactions':
                res, code = handle_add_transaction(user['id'], data)
                self._set_headers(code)
                self.wfile.write(json.dumps(res).encode())
            elif path == '/api/settings/categories':
                conn = get_db_connection()
                c = conn.cursor()
                c.execute('''
                    INSERT INTO categories (user_id, name, icon, color, type, is_system)
                    VALUES (?, ?, ?, ?, ?, 0)
                ''', (user['id'], data.get('name'), data.get('icon', '🏷️'), data.get('color', '#4ECDC4'), data.get('type', 'expense')))
                cat_id = c.lastrowid
                conn.commit()
                c.execute('SELECT * FROM categories WHERE id = ?', (cat_id,))
                new_cat = dict(c.fetchone())
                conn.close()
                self._set_headers(201)
                self.wfile.write(json.dumps({"category": new_cat}).encode())
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())

        def do_PUT(self):
            parsed = urlparse(self.path)
            path = parsed.path
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode() if content_length > 0 else '{}'
            data = json.loads(body) if body else {}

            auth_header = self.headers.get('Authorization')
            user = get_current_user(auth_header)
            if not user:
                self._set_headers(401)
                self.wfile.write(json.dumps({"error": "Unauthorized"}).encode())
                return

            if path.startswith('/api/transactions/'):
                tx_id = int(path.split('/')[-1])
                res, code = handle_update_transaction(user['id'], tx_id, data)
                self._set_headers(code)
                self.wfile.write(json.dumps(res).encode())
            elif path == '/api/settings/profile':
                conn = get_db_connection()
                c = conn.cursor()
                c.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', (data.get('name'), data.get('email'), user['id']))
                conn.commit()
                conn.close()
                self._set_headers(200)
                self.wfile.write(json.dumps({"message": "Profile updated successfully!"}).encode())
            elif path == '/api/settings/password':
                current_pwd = data.get('current_password', '')
                new_pwd = data.get('new_password', '')
                conn = get_db_connection()
                c = conn.cursor()
                c.execute('SELECT password_hash FROM users WHERE id = ?', (user['id'],))
                row = c.fetchone()
                if not verify_password(row['password_hash'], current_pwd):
                    conn.close()
                    self._set_headers(400)
                    self.wfile.write(json.dumps({"error": "Current password is incorrect."}).encode())
                    return
                c.execute('UPDATE users SET password_hash = ? WHERE id = ?', (hash_password(new_pwd), user['id']))
                conn.commit()
                conn.close()
                self._set_headers(200)
                self.wfile.write(json.dumps({"message": "Password changed successfully!"}).encode())
            elif path == '/api/settings/preferences':
                conn = get_db_connection()
                c = conn.cursor()
                c.execute('''
                    UPDATE users SET currency = ?, date_format = ?, theme = ? WHERE id = ?
                ''', (data.get('currency', '₹'), data.get('date_format', 'DD/MM/YYYY'), data.get('theme', 'light'), user['id']))
                conn.commit()
                conn.close()
                self._set_headers(200)
                self.wfile.write(json.dumps({"message": "Preferences saved!"}).encode())
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())

        def do_DELETE(self):
            parsed = urlparse(self.path)
            path = parsed.path
            auth_header = self.headers.get('Authorization')
            user = get_current_user(auth_header)
            if not user:
                self._set_headers(401)
                self.wfile.write(json.dumps({"error": "Unauthorized"}).encode())
                return

            if path.startswith('/api/transactions/'):
                tx_id = int(path.split('/')[-1])
                res, code = handle_delete_transaction(user['id'], tx_id)
                self._set_headers(code)
                self.wfile.write(json.dumps(res).encode())
            elif path.startswith('/api/settings/categories/'):
                cat_id = int(path.split('/')[-1])
                conn = get_db_connection()
                c = conn.cursor()
                c.execute('DELETE FROM categories WHERE id = ? AND user_id = ? AND is_system = 0', (cat_id, user['id']))
                conn.commit()
                conn.close()
                self._set_headers(200)
                self.wfile.write(json.dumps({"message": "Category deleted!"}).encode())
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())

    server = HTTPServer(('0.0.0.0', port), RequestHandler)
    print(f"✨ Spendly Python API Server running on http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("Stopping server...")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    run_standalone_server(port)
