import os
import sqlite3
import hashlib
import hmac
import secrets
import json
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'expense_tracker.db')
SECRET_KEY = os.environ.get('SECRET_KEY', 'spendly-super-secret-jwt-key-2026')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            avatar TEXT DEFAULT 'default',
            currency TEXT DEFAULT '₹',
            date_format TEXT DEFAULT 'DD/MM/YYYY',
            theme TEXT DEFAULT 'light',
            failed_attempts INTEGER DEFAULT 0,
            locked_until TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Categories table (system defaults & custom user categories)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NULL,
            name TEXT NOT NULL,
            icon TEXT NOT NULL,
            color TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'both')),
            is_system INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')
    
    # Transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            category_id INTEGER NULL,
            category_name TEXT NOT NULL,
            category_icon TEXT DEFAULT '🏷️',
            type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            time TEXT DEFAULT '12:00 PM',
            payment_method TEXT DEFAULT 'UPI',
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
        )
    ''')
    
    conn.commit()
    
    # Seed default system categories if empty
    cursor.execute('SELECT COUNT(*) FROM categories WHERE is_system = 1')
    if cursor.fetchone()[0] == 0:
        default_categories = [
            ('Food', '🍔', '#4ECDC4', 'expense', 1),
            ('Travel', '✈️', '#5DADE2', 'expense', 1),
            ('Shopping', '🛍️', '#F1948A', 'expense', 1),
            ('Utilities', '🏠', '#F5B041', 'expense', 1),
            ('Others', '🟢', '#48C9B0', 'expense', 1),
            ('Entertainment', '🎬', '#A569BD', 'expense', 1),
            ('Healthcare', '💊', '#E74C3C', 'expense', 1),
            ('Salary', '⚡', '#2ECC71', 'income', 1),
            ('Freelance', '💻', '#3498DB', 'income', 1),
            ('Investments', '📈', '#9B59B6', 'income', 1),
            ('Gifts', '🎁', '#F39C12', 'income', 1),
        ]
        cursor.executemany('''
            INSERT INTO categories (name, icon, color, type, is_system)
            VALUES (?, ?, ?, ?, ?)
        ''', default_categories)
        conn.commit()
        
    conn.close()

# Password hashing with PBKDF2 (NIST approved, salted, built-in python & bcrypt compatible)
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}:{key.hex()}"

def verify_password(stored_password: str, provided_password: str) -> bool:
    try:
        salt, key = stored_password.split(':')
        new_key = hashlib.pbkdf2_hmac('sha256', provided_password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return hmac.compare_digest(key, new_key.hex())
    except Exception:
        return False

# Token generation and verification (HMAC SHA256 JWT-compatible)
def generate_token(user_id: int, email: str) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": (datetime.utcnow() + timedelta(days=7)).isoformat()
    }
    
    import base64
    def b64_encode(data_dict):
        return base64.urlsafe_b64encode(json.dumps(data_dict).encode()).decode().rstrip('=')
    
    encoded_header = b64_encode(header)
    encoded_payload = b64_encode(payload)
    signature = hmac.new(
        SECRET_KEY.encode(),
        f"{encoded_header}.{encoded_payload}".encode(),
        hashlib.sha256
    ).digest()
    encoded_signature = base64.urlsafe_b64encode(signature).decode().rstrip('=')
    
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"

def verify_token(token: str):
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        encoded_header, encoded_payload, encoded_signature = parts
        import base64
        # Verify signature
        expected_sig = base64.urlsafe_b64encode(
            hmac.new(SECRET_KEY.encode(), f"{encoded_header}.{encoded_payload}".encode(), hashlib.sha256).digest()
        ).decode().rstrip('=')
        
        if not hmac.compare_digest(encoded_signature, expected_sig):
            return None
        
        # Decode payload
        padding = '=' * (4 - (len(encoded_payload) % 4))
        payload = json.loads(base64.urlsafe_b64decode(encoded_payload + padding).decode())
        
        # Check expiry
        exp_time = datetime.fromisoformat(payload['exp'])
        if datetime.utcnow() > exp_time:
            return None
            
        return payload
    except Exception:
        return None
