import unittest
import os
import sqlite3
from models import (
    init_db, get_db_connection, hash_password, verify_password,
    generate_token, verify_token
)

class TestSpendlyBackend(unittest.TestCase):
    def setUp(self):
        init_db()

    def test_password_hashing(self):
        pwd = "SecretPassword123!"
        hashed = hash_password(pwd)
        self.assertTrue(verify_password(hashed, pwd))
        self.assertFalse(verify_password(hashed, "WrongPassword"))

    def test_jwt_tokens(self):
        token = generate_token(101, "test@spendly.com")
        self.assertIsNotNone(token)
        payload = verify_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload['user_id'], 101)
        self.assertEqual(payload['email'], "test@spendly.com")

    def test_database_demo_user(self):
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('SELECT * FROM users WHERE email = ?', ('nandini@spendly.com',))
        user = c.fetchone()
        self.assertIsNotNone(user)
        self.assertEqual(user['name'], 'Nandini Boopathi')
        conn.close()

if __name__ == '__main__':
    unittest.main()
