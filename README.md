# Spendly ♡ — Personal Expense Tracker Application

> **"Track • Save • Grow"**  
> A full-stack personal finance application built to strictly adhere to the attached Software Requirements Specification (SRS) and faithfully replicate the attached user interface design.

---

## 🌟 Key Features & SRS Compliance

### 1. Login Module (SRS Section 2.1)
- **FR-1.1 Registration:** New users can register with Name, Email, and Password. Email addresses are unique.
- **FR-1.2 Authentication:** Token-based session authentication (JWT).
- **FR-1.3 Security & Lockout:** Salted password hashing (PBKDF2 SHA-256 / bcrypt). Account is automatically locked for 15 minutes after 5 consecutive failed login attempts.
- **FR-1.4 Logout:** Terminates session and clears stored tokens.
- **1-Click Demo Login:** Preloaded with the exact data matching the SRS and UI screenshot.

### 2. Home Module (SRS Section 2.2 & UI Replication)
- **Total Balance Card:** Live balance (`₹ 6,250`, `↑ +12%`) in pastel blue card with wavy contours.
- **Total Income Card:** Total income (`₹ 15,000`, `↑ +8%`) in mint pastel card.
- **Total Expenses Card:** Total expenses (`₹ 8,750`, `↑ +5%`) in coral pastel card.
- **Expense Overview Donut Chart:**
  - Center label: `₹ 8,750` / `Total Expenses`
  - Multi-color categories: Food (35%), Travel (25%), Shopping (20%), Utilities (12%), Others (8%).
  - Period selector (`This Month`, `Last Month`, `This Year`, `All Time`).
- **Quick Add Expense Widget:**
  - Category selector with reactive emojis.
  - Amount input (`₹`).
  - Date selector.
  - Optional note input.
  - Gradient pill button with celebration confetti effect.
- **Recent Transactions:**
  - Displays latest transactions with icons, category, timestamp, and colored amounts (`- ₹ 250`, `- ₹ 600`, `- ₹ 1,200`, `+ ₹ 15,000`).
  - Direct `See All →` shortcut to the full Transactions module.
- **Insights Widget:**
  - Spending comparison: *"You spent 18% less than last month! 💙"*
  - Motivational pill badge: *"Keep up the great spending habits! 💙"*
  - Circular gauge: `63%` Savings Rate.
  - Ascending mini bar chart visualization.
- **Bottom Quote Banner:** *"✨ Plan smart. Spend better. Live happier. ♡ ═"*
- **Cute Kitty & Piggy Bank Illustration:** Custom SVG artwork featuring the cat hugging a blue piggy bank with a hovering gold coin and quote *"Smart choices, Brighter tomorrow ♡"*.

### 3. Transactions Module (SRS Section 2.3)
- **FR-3.1 Add Transactions:** Income or Expense with amount, date, time, category, payment method (UPI, Card, Cash, Net Banking, Bank Transfer), and note.
- **FR-3.2 Edit & Delete:** Edit any transaction or delete with safety confirmation modal.
- **FR-3.3 Search & Filter:** Filter by type (All, Expense, Income), category, or keyword search.

### 4. Analytics Module (SRS Section 2.4)
- **FR-4.1 Monthly Reports:** Income, expenses, net savings, and savings rate.
- **FR-4.2 Category Breakdown:** Category-wise spending with animated progress bars.
- **FR-4.3 Graphical Analysis:** Pie/Donut category share and trend analysis.
- **FR-4.4 Exports:**
  - **CSV Export:** Instant download of `spendly_report.csv`.
  - **PDF Export:** Downloads client-generated branded `Spendly_Financial_Report.pdf` with tables and summary KPIs.

### 5. Settings Module (SRS Section 2.5)
- **FR-5.1 Profile Management:** Update name, email, and view account stats.
- **FR-5.2 Security:** Change password with verification of the current password.
- **FR-5.3 Preferences & Categories:**
  - Currency switcher (`₹` INR, `$` USD, `€` EUR, `£` GBP, `¥` JPY).
  - Custom category manager (create categories with custom emojis, colors, and types; delete custom categories).

---

## 🏗️ Architecture & Technologies

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | React 18, HTML5, CSS3, JavaScript | Component-based single-page app, Tailwind CSS, Google Fonts (Plus Jakarta Sans & Nunito) |
| **Backend** | Python Flask & Node.js | REST API, SQLite (`expense_tracker.db`), PBKDF2/bcrypt hashing, JWT tokens |
| **Database** | SQLite3 | Relational schema with Users, Categories, and Transactions tables |
| **Export Engines** | jsPDF & CSV | Formatted financial statements in PDF & CSV formats |

---

## 🚀 How to Run the Application

The web server is already running on your machine:
👉 **[http://localhost:5000](http://localhost:5000)**

### Quick Start (Windows)
Double-click:
```cmd
start.bat
```

### Manual Commands
- **Node.js Server:**
  ```cmd
  node server/server.js
  ```
- **Python Flask Server:**
  ```cmd
  pip install -r server/requirements.txt
  python server/app.py
  ```

---

## 🔑 Demo Account Credentials
- **Email:** `nandini@spendly.com`
- **Password:** `Password123!`
- *(Or simply click the green **"✨ 1-Click Demo Login"** button on the sign-in screen)*
