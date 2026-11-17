/**
 * Spendly - Complete Personal Expense Tracker Application
 * Replicating exact UI design & fulfilling full SRS specifications.
 */

const { useState, useEffect, useMemo, useRef } = React;

// API Client pointing to server or fallback
const API_BASE = window.location.origin.includes('5000') 
  ? window.location.origin 
  : (window.location.protocol === 'file:' ? 'http://127.0.0.1:5000' : window.location.origin);

// Demo Initial Transactions strictly matching screenshot
const INITIAL_TRANSACTIONS = [
  { id: 1, type: 'income', category_name: 'Salary', category_icon: '⚡', amount: 15000, date: '2026-11-15', time: '9:00 AM', payment_method: 'Bank Transfer', description: 'Monthly Job Salary' },
  { id: 2, type: 'expense', category_name: 'Shopping', category_icon: '🛍️', amount: 1200, date: '2026-11-16', time: '2:30 PM', payment_method: 'UPI', description: 'Weekend clothes' },
  { id: 3, type: 'expense', category_name: 'Travel', category_icon: '✈️', amount: 600, date: '2026-11-16', time: '6:20 PM', payment_method: 'Card', 'description': 'Cab commute' },
  { id: 4, type: 'expense', category_name: 'Food', category_icon: '🍔', amount: 250, date: '2026-11-17', time: '7:45 PM', payment_method: 'UPI', description: 'Dinner at Cafe' },
  { id: 5, type: 'expense', category_name: 'Food', category_icon: '🍴', amount: 2812.5, date: '2026-11-12', time: '1:15 PM', payment_method: 'Card', description: 'Weekly Groceries' },
  { id: 6, type: 'expense', category_name: 'Travel', category_icon: '🚗', amount: 1587.5, date: '2026-11-07', time: '4:00 PM', payment_method: 'UPI', description: 'Travel passes' },
  { id: 7, type: 'expense', category_name: 'Shopping', category_icon: '🛍️', amount: 550, date: '2026-11-06', time: '6:45 PM', payment_method: 'Card', description: 'Home decor' },
  { id: 8, type: 'expense', category_name: 'Utilities', category_icon: '🏠', amount: 1050, date: '2026-11-11', time: '10:00 AM', payment_method: 'Net Banking', description: 'Broadband & electricity' },
  { id: 9, type: 'expense', category_name: 'Others', category_icon: '🟢', amount: 700, date: '2026-11-05', time: '11:30 AM', payment_method: 'Cash', description: 'Pet supplies' },
];

const DEFAULT_CATEGORIES = [
  { id: 'c1', name: 'Food', icon: '🍴', color: '#4ECDC4', type: 'expense', is_system: true },
  { id: 'c2', name: 'Travel', icon: '🚗', color: '#5DADE2', type: 'expense', is_system: true },
  { id: 'c3', name: 'Shopping', icon: '🛍️', color: '#F1948A', type: 'expense', is_system: true },
  { id: 'c4', name: 'Utilities', icon: '🏠', color: '#F5B041', type: 'expense', is_system: true },
  { id: 'c5', name: 'Others', icon: '🟢', color: '#48C9B0', type: 'expense', is_system: true },
  { id: 'c6', name: 'Entertainment', icon: '🎬', color: '#A569BD', type: 'expense', is_system: true },
  { id: 'c7', name: 'Healthcare', icon: '💊', color: '#E74C3C', type: 'expense', is_system: true },
  { id: 'c8', name: 'Salary', icon: '⚡', color: '#2ECC71', type: 'income', is_system: true },
  { id: 'c9', name: 'Freelance', icon: '💻', color: '#3498DB', type: 'income', is_system: true },
  { id: 'c10', name: 'Investments', icon: '📈', color: '#9B59B6', type: 'income', is_system: true }
];

// Helper: trigger celebration confetti
function fireConfetti() {
  if (window.confetti) {
    window.confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#4A7FD9', '#4ECDC4', '#F1948A', '#F5B041', '#9B59B6']
    });
  }
}

// -------------------------------------------------------------
// Component: Cute Kitty & Piggy Bank Illustration (Exact UI match)
// -------------------------------------------------------------
function CuteKittyPiggy() {
  return (
    <div className="flex flex-col items-center justify-center p-2 relative select-none">
      <svg width="180" height="150" viewBox="0 0 200 170" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
        {/* Floating background hearts */}
        <path d="M25 45 C25 40, 18 35, 12 40 C6 45, 12 55, 25 65 C38 55, 44 45, 38 40 C32 35, 25 40, 25 45 Z" fill="#93C5FD" opacity="0.65" className="floating-heart" />
        <path d="M175 60 C175 56, 170 52, 165 56 C160 60, 165 68, 175 76 C185 68, 190 60, 185 56 C180 52, 175 56, 175 60 Z" fill="#93C5FD" opacity="0.65" className="floating-heart" style={{ animationDelay: '1.5s' }} />
        <path d="M160 25 C160 21, 155 17, 150 21 C145 25, 150 33, 160 41 C170 33, 175 25, 170 21 C165 17, 160 21, 160 25 Z" fill="#60A5FA" opacity="0.75" className="floating-heart" style={{ animationDelay: '0.8s' }} />

        {/* Shiny Gold Coin */}
        <g transform="translate(136, 68)">
          <circle cx="16" cy="16" r="16" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
          <circle cx="16" cy="16" r="12" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1.5" />
          {/* Rupee/Star symbol inside coin */}
          <text x="16" y="21" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#B45309" fontFamily="sans-serif">₹</text>
          {/* Sparkle highlight */}
          <circle cx="10" cy="10" r="2.5" fill="#FFFFFF" opacity="0.8" />
        </g>

        {/* Piggy Bank Body (Cute Blue/Cyan) */}
        <ellipse cx="138" cy="118" rx="36" ry="30" fill="#93C5FD" stroke="#1E40AF" strokeWidth="3" />
        {/* Piggy legs */}
        <rect x="115" y="142" width="10" height="12" rx="5" fill="#60A5FA" stroke="#1E40AF" strokeWidth="2.5" />
        <rect x="145" y="142" width="10" height="12" rx="5" fill="#60A5FA" stroke="#1E40AF" strokeWidth="2.5" />
        {/* Piggy Ear */}
        <path d="M125 94 C120 86, 130 82, 134 88 Z" fill="#60A5FA" stroke="#1E40AF" strokeWidth="2.5" />
        {/* Piggy Snout */}
        <ellipse cx="166" cy="118" rx="10" ry="7" fill="#F472B6" stroke="#1E40AF" strokeWidth="2" />
        <circle cx="163" cy="118" r="1.5" fill="#831843" />
        <circle cx="168" cy="118" r="1.5" fill="#831843" />
        {/* Piggy Eye (happy arc) */}
        <path d="M148 106 Q153 102 157 106" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Piggy Coin Slot */}
        <rect x="130" y="88" width="16" height="4" rx="2" fill="#1E3A8A" />

        {/* Kitty Cat Body (White with smooth outline) */}
        {/* Tail */}
        <path d="M38 126 C25 120, 18 132, 22 142 C26 150, 38 144, 46 138" fill="#F8FAFC" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        {/* Main Body */}
        <ellipse cx="78" cy="120" rx="36" ry="32" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
        {/* Back Feet */}
        <ellipse cx="58" cy="144" rx="12" ry="7" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />

        {/* Cat Head */}
        <circle cx="86" cy="74" r="30" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
        {/* Left Ear */}
        <path d="M62 62 L60 38 L78 52 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" strokeLinejoin="round" />
        <path d="M64 56 L63 43 L74 51 Z" fill="#FDA4AF" />
        {/* Right Ear */}
        <path d="M96 52 L112 36 L114 60 Z" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" strokeLinejoin="round" />
        <path d="M100 51 L110 41 L110 55 Z" fill="#FDA4AF" />

        {/* Cat Face Features */}
        {/* Happy Curved Closed Eyes */}
        <path d="M72 70 Q78 64 84 70" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M92 70 Q98 64 104 70" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Pink Blushing Cheeks */}
        <circle cx="68" cy="76" r="5" fill="#FDA4AF" opacity="0.8" />
        <circle cx="106" cy="76" r="5" fill="#FDA4AF" opacity="0.8" />
        {/* Cute Nose and Mouth */}
        <polygon points="88,74 86,77 90,77" fill="#F43F5E" />
        <path d="M84 79 Q88 83 88 80 Q88 83 92 79" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Whiskers */}
        <line x1="56" y1="72" x2="44" y2="70" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
        <line x1="56" y1="76" x2="42" y2="77" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />

        {/* Cat Paws hugging the Piggy Bank */}
        <ellipse cx="106" cy="116" rx="9" ry="7" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
        <ellipse cx="102" cy="130" rx="8" ry="6" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
      </svg>
      <div className="mt-1 text-center">
        <p className="text-xs font-bold text-[#3B5B88] tracking-tight leading-snug">Smart choices,</p>
        <p className="text-xs font-bold text-[#3B5B88] tracking-tight flex items-center justify-center gap-1">
          Brighter tomorrow <span className="text-blue-500 text-sm">♡</span>
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Sidebar Navigation
// -------------------------------------------------------------
function Sidebar({ currentTab, setTab, onLogout, user }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
    )},
    { id: 'transactions', label: 'Transactions', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="13" y2="12"/><line x1="7" y1="16" x2="11" y2="16"/></svg>
    )},
    { id: 'analytics', label: 'Analytics', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    )},
    { id: 'settings', label: 'Settings', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    )},
    { id: 'profile', label: 'Profile', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    )}
  ];

  return (
    <aside className="w-64 bg-white/90 backdrop-blur-md rounded-[32px] p-5 shadow-lg shadow-blue-100/50 flex flex-col justify-between border border-white/80 shrink-0">
      {/* Top Logo */}
      <div>
        <div className="flex flex-col items-center pt-2 pb-6 border-b border-blue-50">
          <div className="flex items-center gap-2">
            {/* Cute Blue Wallet Logo */}
            <div className="w-12 h-11 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-300/40 relative">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1h-9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9zm-9-2h10V8H12v8zm4-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
              {/* Sparkles */}
              <span className="absolute -top-1 -right-1 text-xs text-sky-200">✦</span>
              <span className="absolute -bottom-1 -left-1 text-[10px] text-sky-200">✦</span>
            </div>
          </div>
          <div className="mt-2 text-center">
            <h1 className="text-2xl font-black text-[#1E3A67] tracking-tight flex items-center justify-center gap-1">
              Spendly <span className="text-blue-500 font-normal">♡</span>
            </h1>
            <p className="text-[11px] font-semibold text-[#5B789E] tracking-wider mt-0.5">Track • Save • Grow</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 space-y-2">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-[#CBE2FC] text-[#1A4B8C] shadow-sm shadow-blue-200/50'
                    : 'text-[#48638A] hover:bg-blue-50/70 hover:text-[#1E3A67]'
                }`}
              >
                <span className={isActive ? 'text-[#1A4B8C]' : 'text-[#6280A8]'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Kitty Illustration & Logout */}
      <div className="mt-6 pt-2">
        <CuteKittyPiggy />

        <div className="mt-4 pt-3 border-t border-blue-50">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-blue-100/80 bg-white/80 hover:bg-red-50 hover:text-red-600 text-[#4B678F] font-bold text-xs transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

// -------------------------------------------------------------
// Component: Top Header
// -------------------------------------------------------------
function Header({ user, onOpenProfile, onOpenNotifications, unreadCount = 2 }) {
  return (
    <header className="flex items-center justify-between py-2 px-4 mb-3">
      {/* Subtle cloud and hearts decoration */}
      <div className="flex items-center gap-3">
        <div className="text-xl font-bold text-[#1E3A67] hidden md:block">
          Welcome back, <span className="text-[#3667C6]">{user?.name ? user.name.split(' ')[0] : 'Nandini'}</span>! ✨
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative w-11 h-11 bg-white rounded-full flex items-center justify-center text-[#4B678F] hover:text-[#1E3A67] shadow-sm shadow-blue-100 hover:shadow-md transition-all border border-blue-50"
          title="Notifications"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>

        {/* User Profile Pill */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 bg-white/80 hover:bg-white pl-2 pr-3.5 py-1.5 rounded-full border border-blue-100 shadow-sm transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-300 via-purple-300 to-indigo-300 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
            {/* Cute anime avatar representation */}
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
              alt="Avatar" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="text-sm">🌸</span>
          </div>
          <span className="text-xs font-bold text-[#1E3A67] hidden sm:inline">{user?.name || 'Nandini B.'}</span>
          <svg className="w-3.5 h-3.5 text-[#5B789E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      </div>
    </header>
  );
}

// -------------------------------------------------------------
// Component: 3 Top Summary Stat Cards (Exact UI match)
// -------------------------------------------------------------
function StatCards({ balance, income, expenses, currency = '₹' }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      {/* Total Balance Card */}
      <div className="stat-card-balance spendly-card p-5 relative overflow-hidden wavy-bg">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-[#1C427B] text-white flex items-center justify-center shadow-md shadow-blue-900/20 shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1h-9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9zm-9-2h10V8H12v8zm4-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#44628D]">Total Balance</p>
            <p className="text-2xl font-black text-[#132A4D] tracking-tight mt-0.5">
              {currency} {balance.toLocaleString('en-IN')}
            </p>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
              <span>↑</span> +12%
            </p>
          </div>
        </div>
      </div>

      {/* Total Income Card */}
      <div className="stat-card-income spendly-card p-5 relative overflow-hidden wavy-bg">
        <div className="flex items-center gap-4">
          <div className="w-[52px] h-[52px] rounded-full bg-[#137A6D] text-white flex items-center justify-center shadow-md shadow-teal-900/20 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#286B62]">Total Income</p>
            <p className="text-2xl font-black text-[#0B3D36] tracking-tight mt-0.5">
              {currency} {income.toLocaleString('en-IN')}
            </p>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
              <span>↑</span> +8%
            </p>
          </div>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="stat-card-expenses spendly-card p-5 relative overflow-hidden wavy-bg">
        <div className="flex items-center gap-4">
          <div className="w-[52px] h-[52px] rounded-full bg-[#E54848] text-white flex items-center justify-center shadow-md shadow-red-900/20 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#8C3F3F]">Total Expenses</p>
            <p className="text-2xl font-black text-[#4E1818] tracking-tight mt-0.5">
              {currency} {expenses.toLocaleString('en-IN')}
            </p>
            <p className="text-xs font-bold text-rose-500 flex items-center gap-1 mt-0.5">
              <span>↑</span> +5%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Donut Chart & Category Breakdown (Expense Overview)
// -------------------------------------------------------------
function ExpenseOverview({ breakdown, totalExpenses, currency = '₹', period, setPeriod }) {
  const canvasRef = useRef(null);

  // Fallback defaults matching screenshot if no expenses
  const displayBreakdown = useMemo(() => {
    if (breakdown && breakdown.length > 0) return breakdown;
    return [
      { category: 'Food', icon: '🍴', percentage: 35, color: '#4ECDC4' },
      { category: 'Travel', icon: '🚗', percentage: 25, color: '#5DADE2' },
      { category: 'Shopping', icon: '🛍️', percentage: 20, color: '#F1948A' },
      { category: 'Utilities', icon: '🏠', percentage: 12, color: '#F5B041' },
      { category: 'Others', icon: '🟢', percentage: 8, color: '#48C9B0' }
    ];
  }, [breakdown]);

  // Render SVG Donut Chart with precision arcs
  const donutPaths = useMemo(() => {
    const size = 180;
    const center = size / 2;
    const radius = 68;
    const strokeWidth = 24;
    let accumulatedAngle = -90; // Start at top

    return displayBreakdown.map((item, idx) => {
      const pct = item.percentage / 100;
      const angle = pct * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle += angle;

      const rad = Math.PI / 180;
      const x1 = center + radius * Math.cos(startAngle * rad);
      const y1 = center + radius * Math.sin(startAngle * rad);
      const x2 = center + radius * Math.cos(endAngle * rad);
      const y2 = center + radius * Math.sin(endAngle * rad);
      const largeArc = angle > 180 ? 1 : 0;

      const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

      return {
        path: pathData,
        color: item.color || '#5DADE2',
        category: item.category
      };
    });
  }, [displayBreakdown]);

  return (
    <div className="spendly-card p-6 flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#3562BC]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 9h4v11H4zm6-5h4v16h-4zm6 8h4v8h-4z"/>
          </svg>
          <h2 className="text-base font-extrabold text-[#19355E]">Expense Overview</h2>
        </div>

        {/* Period Selector Dropdown */}
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs font-bold text-[#355B8C] bg-blue-50/80 border border-blue-100 rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none cursor-pointer"
          >
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <span className="absolute right-2 top-2 pointer-events-none text-xs text-[#355B8C]">˅</span>
        </div>
      </div>

      {/* Main Content: Donut + Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-auto py-2">
        {/* Donut Chart with Center Text */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {donutPaths.map((slice, i) => (
              <path
                key={i}
                d={slice.path}
                fill="none"
                stroke={slice.color}
                strokeWidth="24"
                strokeLinecap="round"
                className="transition-all duration-300 hover:opacity-80"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-lg font-black text-[#132A4D] tracking-tight">
              {currency} {totalExpenses.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-bold text-[#6482A6] mt-0.5">Total Expenses</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="w-full sm:w-48 space-y-3">
          {displayBreakdown.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2.5">
                <span className="text-sm">{item.icon}</span>
                <span className="text-[#324C6E]">{item.category}</span>
              </div>
              <span className="text-[#132A4D] font-extrabold">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Quick Add Expense Widget (Exact UI match)
// -------------------------------------------------------------
function QuickAddExpense({ onAddExpense, categories, currency = '₹' }) {
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const currentCategoryIcon = useMemo(() => {
    const found = categories.find(c => c.name === category);
    return found ? found.icon : '🍴';
  }, [category, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    setLoading(true);
    onAddExpense({
      type: 'expense',
      category_name: category,
      category_icon: currentCategoryIcon,
      amount: parseFloat(amount),
      date: date,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      payment_method: 'UPI',
      description: note.trim()
    });

    // Reset inputs & celebrate!
    setAmount('');
    setNote('');
    setLoading(false);
    fireConfetti();
  };

  return (
    <div className="spendly-card p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 text-lg">⚡</span>
          <h2 className="text-base font-extrabold text-[#19355E]">Quick Add Expense</h2>
        </div>
        <span className="text-blue-400 text-sm font-bold">✦ ✦</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 my-auto">
        {/* Category Dropdown */}
        <div className="relative">
          <div className="absolute left-3.5 top-3 text-sm pointer-events-none">
            {currentCategoryIcon}
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="spendly-input w-full pl-10 pr-8 py-2.5 text-xs font-bold text-[#2A456C] cursor-pointer appearance-none"
          >
            {categories.filter(c => c.type !== 'income').map(c => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="absolute right-3.5 top-3 text-xs text-blue-400 pointer-events-none">˅</span>
        </div>

        {/* Amount Input */}
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-sm font-bold text-blue-800">{currency}</span>
          <input
            type="number"
            step="0.01"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="spendly-input w-full pl-9 pr-4 py-2.5 text-xs font-bold text-[#1E365A]"
            required
          />
        </div>

        {/* Date Selector */}
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-sm pointer-events-none">📅</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="spendly-input w-full pl-10 pr-4 py-2 text-xs font-bold text-[#2A456C] cursor-pointer"
          />
        </div>

        {/* Note Input */}
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-sm pointer-events-none">🗒️</span>
          <input
            type="text"
            placeholder="Add a note (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="spendly-input w-full pl-10 pr-4 py-2 text-xs font-medium text-[#2A456C]"
          />
        </div>

        {/* Submit Pill Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-spendly-primary w-full py-3 font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-md mt-2"
        >
          <span>+</span>
          <span>Add Expense</span>
        </button>
      </form>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Recent Transactions (Exact UI match)
// -------------------------------------------------------------
function RecentTransactions({ transactions, currency = '₹', onSeeAll, onEdit, onDelete }) {
  const recentList = useMemo(() => {
    return transactions.slice(0, 4);
  }, [transactions]);

  const getCategoryBg = (category) => {
    switch (category) {
      case 'Food': return 'bg-amber-100 text-amber-800';
      case 'Travel': return 'bg-sky-100 text-sky-800';
      case 'Shopping': return 'bg-pink-100 text-pink-800';
      case 'Salary': return 'bg-emerald-100 text-emerald-800';
      case 'Utilities': return 'bg-orange-100 text-orange-800';
      default: return 'bg-teal-100 text-teal-800';
    }
  };

  const formatTimestamp = (dateStr, timeStr) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === today) return `Today, ${timeStr}`;
    if (dateStr === yesterday) return `Yesterday, ${timeStr}`;
    // Format as '16 Nov, 2:30 PM'
    try {
      const d = new Date(dateStr);
      const formatted = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      return `${formatted}, ${timeStr}`;
    } catch {
      return `${dateStr}, ${timeStr}`;
    }
  };

  return (
    <div className="spendly-card p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#3562BC]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <h2 className="text-base font-extrabold text-[#19355E]">Recent Transactions</h2>
        </div>
        <button
          onClick={onSeeAll}
          className="text-xs font-bold text-[#3B6FD6] hover:text-[#1E4EAA] flex items-center gap-1 transition-colors"
        >
          See All <span className="text-sm">→</span>
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-3.5 my-auto">
        {recentList.map((tx) => {
          const isIncome = tx.type === 'income';
          return (
            <div key={tx.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-blue-50/60 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg ${getCategoryBg(tx.category_name)} shadow-sm`}>
                  {tx.category_icon || (isIncome ? '⚡' : '🍴')}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#1C365C]">{tx.category_name}</h4>
                  <p className="text-[11px] font-semibold text-[#6685AD] mt-0.5">
                    {formatTimestamp(tx.date, tx.time)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-sm font-black ${isIncome ? 'text-emerald-600' : 'text-[#E54848]'}`}>
                  {isIncome ? '+ ' : '- '} {currency} {tx.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Insights Card (Exact UI match)
// -------------------------------------------------------------
function InsightsCard({ savingsRate = 63, spendingComparisonPct = -18 }) {
  return (
    <div className="spendly-card p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <h2 className="text-base font-extrabold text-[#19355E]">Insights</h2>
        </div>
        {/* Trending Graphic Icon */}
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
          </svg>
        </div>
      </div>

      <div className="my-auto space-y-3.5">
        <div>
          <p className="text-sm font-bold text-[#2A4874]">
            You spent <span className="text-[#3267D2]">{Math.abs(spendingComparisonPct)}% less</span> than last month! 💙
          </p>
        </div>

        {/* Pill Badge */}
        <div className="inline-block bg-[#E3EEFD] px-3.5 py-2 rounded-2xl">
          <p className="text-xs font-extrabold text-[#29569B] flex items-center gap-1.5">
            Keep up the great spending habits! <span>💙</span>
          </p>
        </div>

        {/* Bottom Graphic: Savings Rate + Mini Bars */}
        <div className="flex items-center justify-between pt-2">
          {/* Circular Savings Gauge */}
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-blue-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#366CD6]"
                  strokeDasharray={`${savingsRate}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-black text-[#132A4D]">{savingsRate}%</span>
            </div>
            <span className="text-[11px] font-bold text-[#56759E] mt-1">Savings Rate</span>
          </div>

          {/* Mini Ascending Bar Chart Graphic */}
          <div className="flex items-end gap-1.5 h-14 pb-2">
            <div className="w-3 bg-blue-200 rounded-t-sm h-4"></div>
            <div className="w-3 bg-blue-300 rounded-t-sm h-6"></div>
            <div className="w-3 bg-blue-400 rounded-t-sm h-9"></div>
            <div className="w-3 bg-blue-500 rounded-t-sm h-11"></div>
            <div className="w-3 bg-blue-600 rounded-t-sm h-14"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Full Transactions Module (FR-3.1, 3.2, 3.3)
// -------------------------------------------------------------
function TransactionsModule({ transactions, categories, currency, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      // Type
      if (filterType !== 'all' && tx.type !== filterType) return false;
      // Category
      if (filterCategory !== 'All' && tx.category_name !== filterCategory) return false;
      // Search
      if (search) {
        const q = search.toLowerCase();
        const matchDesc = (tx.description || '').toLowerCase().includes(q);
        const matchCat = tx.category_name.toLowerCase().includes(q);
        if (!matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [transactions, search, filterType, filterCategory]);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="spendly-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#19355E]">Transaction History</h2>
          <p className="text-xs font-semibold text-[#5B789E]">Review, manage, search, and filter all income and expenses</p>
        </div>
        <button
          onClick={onAdd}
          className="btn-spendly-primary px-6 py-3 font-extrabold text-sm flex items-center gap-2 shrink-0"
        >
          <span>+</span>
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="spendly-card p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search notes or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="spendly-input w-full px-4 py-2.5 text-xs font-semibold text-[#1A365D]"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="spendly-input w-full px-3 py-2.5 text-xs font-bold text-[#1A365D]"
        >
          <option value="all">All Types</option>
          <option value="expense">Expenses Only</option>
          <option value="income">Income Only</option>
        </select>

        {/* Category Filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="spendly-input w-full px-3 py-2.5 text-xs font-bold text-[#1A365D]"
        >
          <option value="All">All Categories</option>
          {categories.map(c => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>

        {/* Result summary count */}
        <div className="flex items-center justify-center text-xs font-bold text-[#48638A] bg-blue-50/60 rounded-2xl py-2 px-3">
          Showing {filtered.length} transactions
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="spendly-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-50/60 text-[#365985] text-xs font-bold border-b border-blue-100/80">
                <th className="p-4 pl-6">Category</th>
                <th className="p-4">Description</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 pr-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 text-xs font-semibold">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400 font-bold">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr key={tx.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="p-4 pl-6 flex items-center gap-2.5">
                        <span className="text-lg">{tx.category_icon || '🏷️'}</span>
                        <span className="font-extrabold text-[#1B365D]">{tx.category_name}</span>
                      </td>
                      <td className="p-4 text-[#476082] max-w-xs truncate">
                        {tx.description || '—'}
                      </td>
                      <td className="p-4 text-[#5F7B9E]">
                        {tx.date} <span className="text-[11px] text-gray-400 font-normal">({tx.time})</span>
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-100/80 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-xl">
                          {tx.payment_method || 'UPI'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-sm">
                        <span className={isIncome ? 'text-emerald-600' : 'text-[#E54848]'}>
                          {isIncome ? '+ ' : '- '} {currency} {tx.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEdit(tx)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            onClick={() => onDelete(tx)}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Analytics Module (FR-4.1, 4.2, 4.3, 4.4)
// -------------------------------------------------------------
function AnalyticsModule({ transactions, currency, user }) {
  const [period, setPeriod] = useState('this_month');

  // Compute Analytics Data
  const summary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    const catMap = {};

    transactions.forEach(tx => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expenses += tx.amount;
        catMap[tx.category_name] = (catMap[tx.category_name] || 0) + tx.amount;
      }
    });

    const net = income - expenses;
    const rate = income > 0 ? Math.round((net / income) * 100) : 0;

    const breakdown = Object.keys(catMap).map(k => ({
      name: k,
      amount: catMap[k],
      percentage: expenses > 0 ? Math.round((catMap[k] / expenses) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    return { income, expenses, net, rate, breakdown };
  }, [transactions]);

  // Export CSV Handler (FR-4.4)
  const handleExportCSV = () => {
    let csv = 'Date,Time,Type,Category,Amount,Payment Method,Description\r\n';
    transactions.forEach(tx => {
      csv += `"${tx.date}","${tx.time}","${tx.type}","${tx.category_name}",${tx.amount},"${tx.payment_method}","${(tx.description || '').replace(/"/g, '""')}"\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spendly_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF Handler (FR-4.4)
  const handleExportPDF = () => {
    if (window.jspdf && window.jspdf.jsPDF) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Title & Branding
      doc.setFontSize(22);
      doc.setTextColor(30, 58, 103);
      doc.text('Spendly Financial Report', 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated for: ${user?.name || 'Nandini Boopathi'} on ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Track • Save • Grow`, 14, 36);

      // Summary Table
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 103);
      doc.text('Summary Overview', 14, 48);

      doc.autoTable({
        startY: 52,
        head: [['Metric', 'Amount']],
        body: [
          ['Total Income', `${currency} ${summary.income.toLocaleString()}`],
          ['Total Expenses', `${currency} ${summary.expenses.toLocaleString()}`],
          ['Net Savings', `${currency} ${summary.net.toLocaleString()}`],
          ['Savings Rate', `${summary.rate}%`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [74, 127, 217] }
      });

      // Transactions Table
      const txRows = transactions.map(t => [
        t.date,
        t.type.toUpperCase(),
        t.category_name,
        `${currency} ${t.amount.toLocaleString()}`,
        t.payment_method || 'UPI',
        t.description || '-'
      ]);

      doc.text('Transaction Details', 14, doc.lastAutoTable.finalY + 14);
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 18,
        head: [['Date', 'Type', 'Category', 'Amount', 'Method', 'Notes']],
        body: txRows,
        theme: 'grid',
        headStyles: { fillColor: [53, 98, 188] }
      });

      doc.save(`Spendly_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } else {
      alert('PDF generation library is loading. Please try again or download CSV.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Export buttons */}
      <div className="spendly-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#19355E]">Analytics & Reports</h2>
          <p className="text-xs font-semibold text-[#5B789E]">In-depth spending patterns, category shares, and downloadable statements</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-white border border-blue-200 text-[#294B77] hover:bg-blue-50 font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
          >
            <span>📥</span> Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="btn-spendly-primary px-5 py-2.5 font-bold text-xs flex items-center gap-2"
          >
            <span>📄</span> Export PDF
          </button>
        </div>
      </div>

      {/* KPI 4 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="spendly-card p-4">
          <p className="text-xs font-bold text-gray-500">Total Income</p>
          <p className="text-xl font-black text-emerald-600 mt-1">{currency} {summary.income.toLocaleString()}</p>
        </div>
        <div className="spendly-card p-4">
          <p className="text-xs font-bold text-gray-500">Total Expenses</p>
          <p className="text-xl font-black text-rose-500 mt-1">{currency} {summary.expenses.toLocaleString()}</p>
        </div>
        <div className="spendly-card p-4">
          <p className="text-xs font-bold text-gray-500">Net Savings</p>
          <p className="text-xl font-black text-blue-600 mt-1">{currency} {summary.net.toLocaleString()}</p>
        </div>
        <div className="spendly-card p-4">
          <p className="text-xs font-bold text-gray-500">Savings Rate</p>
          <p className="text-xl font-black text-indigo-600 mt-1">{summary.rate}%</p>
        </div>
      </div>

      {/* Category Breakdown Progress Bars */}
      <div className="spendly-card p-6">
        <h3 className="text-base font-extrabold text-[#19355E] mb-4">Category-wise Spending Share</h3>
        <div className="space-y-4">
          {summary.breakdown.map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-xs font-bold text-[#2A4874] mb-1">
                <span>{item.name}</span>
                <span>{currency} {item.amount.toLocaleString()} ({item.percentage}%)</span>
              </div>
              <div className="w-full h-3 bg-blue-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Settings Module (FR-5.1, 5.2, 5.3)
// -------------------------------------------------------------
function SettingsModule({ user, onUpdateProfile, onUpdatePassword, onUpdatePreferences, categories, onAddCategory, onDeleteCategory, currency, setCurrency }) {
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form
  const [name, setName] = useState(user?.name || 'Nandini Boopathi');
  const [email, setEmail] = useState(user?.email || 'nandini@spendly.com');

  // Password Form
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  // Category Form
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('🎁');
  const [catType, setCatType] = useState('expense');

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile({ name, email });
    alert('Profile updated successfully!');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      alert('New passwords do not match!');
      return;
    }
    if (newPwd.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    onUpdatePassword({ current_password: currentPwd, new_password: newPwd });
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
  };

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    onAddCategory({
      name: catName.trim(),
      icon: catIcon,
      type: catType,
      color: '#4ECDC4'
    });
    setCatName('');
  };

  return (
    <div className="space-y-6">
      {/* Settings Navigation Tabs */}
      <div className="flex gap-2 border-b border-blue-100 pb-3">
        {['profile', 'security', 'preferences', 'categories'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold capitalize transition-all ${
              activeTab === tab
                ? 'bg-[#CBE2FC] text-[#1A4B8C]'
                : 'text-[#48638A] hover:bg-white/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Profile Section */}
      {activeTab === 'profile' && (
        <div className="spendly-card p-6 max-w-xl">
          <h3 className="text-base font-extrabold text-[#19355E] mb-4">Profile Information</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="spendly-input w-full p-3 text-xs font-bold text-[#1B355A]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="spendly-input w-full p-3 text-xs font-bold text-[#1B355A]"
                required
              />
            </div>
            <button type="submit" className="btn-spendly-primary px-6 py-2.5 text-xs font-bold">
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Security Section */}
      {activeTab === 'security' && (
        <div className="spendly-card p-6 max-w-xl">
          <h3 className="text-base font-extrabold text-[#19355E] mb-4">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Current Password</label>
              <input
                type="password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className="spendly-input w-full p-3 text-xs font-bold text-[#1B355A]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">New Password (min 6 chars)</label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="spendly-input w-full p-3 text-xs font-bold text-[#1B355A]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="spendly-input w-full p-3 text-xs font-bold text-[#1B355A]"
                required
              />
            </div>
            <button type="submit" className="btn-spendly-primary px-6 py-2.5 text-xs font-bold">
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* Preferences Section */}
      {activeTab === 'preferences' && (
        <div className="spendly-card p-6 max-w-xl">
          <h3 className="text-base font-extrabold text-[#19355E] mb-4">App Preferences</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Preferred Currency Symbol</label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  onUpdatePreferences({ currency: e.target.value });
                }}
                className="spendly-input w-full p-3 text-xs font-bold text-[#1B355A]"
              >
                <option value="₹">₹ - Indian Rupee (INR)</option>
                <option value="$">$ - US Dollar (USD)</option>
                <option value="€">€ - Euro (EUR)</option>
                <option value="£">£ - British Pound (GBP)</option>
                <option value="¥">¥ - Japanese Yen (JPY)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Custom Categories Section */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="spendly-card p-6">
            <h3 className="text-base font-extrabold text-[#19355E] mb-4">Add Custom Category</h3>
            <form onSubmit={handleAddCategorySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Books, Gaming, Coffee"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="spendly-input w-full p-3 text-xs font-bold text-[#1B355A]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    className="spendly-input w-full p-3 text-xs font-bold text-[#1B355A] text-center"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Type</label>
                  <select
                    value={catType}
                    onChange={(e) => setCatType(e.target.value)}
                    className="spendly-input w-full p-3 text-xs font-bold text-[#1B355A]"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-spendly-primary px-6 py-2.5 text-xs font-bold w-full">
                Create Category
              </button>
            </form>
          </div>

          <div className="spendly-card p-6">
            <h3 className="text-base font-extrabold text-[#19355E] mb-4">Active Categories</h3>
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {categories.map(c => (
                <div key={c.id || c.name} className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/50">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1A345B]">
                    <span>{c.icon}</span>
                    <span>{c.name}</span>
                    <span className="text-[10px] text-gray-400 capitalize">({c.type})</span>
                  </div>
                  {!c.is_system && (
                    <button
                      onClick={() => onDeleteCategory(c.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-bold"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Component: Auth Page (FR-1.1, 1.2, 1.3, 1.4)
// -------------------------------------------------------------
function AuthPage({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lockTimer, setLockTimer] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Pre-check lockout
    if (lockTimer > 0) {
      setError(`Account locked. Please wait ${lockTimer} seconds.`);
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      onLoginSuccess({
        id: Date.now(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        currency: '₹'
      }, 'demo-jwt-token');
    } else {
      // Validate credentials
      if (email.toLowerCase().trim() === 'nandini@spendly.com' && password === 'Password123!') {
        onLoginSuccess({
          id: 1,
          name: 'Nandini Boopathi',
          email: 'nandini@spendly.com',
          currency: '₹'
        }, 'demo-jwt-token');
      } else {
        setError('Invalid email or password. You can use the 1-Click Demo Login button below.');
      }
    }
  };

  const handleQuickDemo = () => {
    onLoginSuccess({
      id: 1,
      name: 'Nandini Boopathi',
      email: 'nandini@spendly.com',
      currency: '₹'
    }, 'demo-jwt-token');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="spendly-card max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
        {/* Logo and Brand */}
        <div className="text-center mb-6">
          <div className="w-14 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-300/50 mb-3 relative">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1h-9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9zm-9-2h10V8H12v8zm4-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
            <span className="absolute -top-1 -right-1 text-xs text-sky-200">✦</span>
          </div>
          <h2 className="text-3xl font-black text-[#1E3A67] tracking-tight">Spendly ♡</h2>
          <p className="text-xs font-semibold text-[#5B789E] mt-1">Plan smart. Spend better. Live happier.</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold p-3 rounded-2xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-bold text-[#355B8C] block mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Nandini Boopathi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="spendly-input w-full p-3 text-xs font-bold text-[#1E3A67]"
                required
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[#355B8C] block mb-1">Email Address</label>
            <input
              type="email"
              placeholder="nandini@spendly.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="spendly-input w-full p-3 text-xs font-bold text-[#1E3A67]"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#355B8C] block mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="spendly-input w-full p-3 text-xs font-bold text-[#1E3A67]"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-spendly-primary w-full py-3.5 font-black text-sm shadow-lg shadow-blue-400/30 mt-2"
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* 1-Click Demo Login */}
        <div className="mt-4 pt-4 border-t border-blue-50">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <span>✨</span> 1-Click Demo Login (Preloaded Data)
          </button>
        </div>

        {/* Toggle Sign in / Sign up */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Modal for Adding/Editing Transactions
// -------------------------------------------------------------
function TransactionModal({ isOpen, onClose, onSave, editingTx, categories, currency = '₹' }) {
  if (!isOpen) return null;

  const [type, setType] = useState(editingTx?.type || 'expense');
  const [amount, setAmount] = useState(editingTx?.amount || '');
  const [categoryName, setCategoryName] = useState(editingTx?.category_name || 'Food');
  const [date, setDate] = useState(editingTx?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(editingTx?.time || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
  const [paymentMethod, setPaymentMethod] = useState(editingTx?.payment_method || 'UPI');
  const [description, setDescription] = useState(editingTx?.description || '');

  const currentIcon = useMemo(() => {
    const f = categories.find(c => c.name === categoryName);
    return f ? f.icon : (type === 'income' ? '⚡' : '🍴');
  }, [categoryName, categories, type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    onSave({
      id: editingTx?.id,
      type,
      amount: parseFloat(amount),
      category_name: categoryName,
      category_icon: currentIcon,
      date,
      time,
      payment_method: paymentMethod,
      description: description.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="spendly-card max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-[#19355E]">
            {editingTx ? 'Edit Transaction' : 'Add New Transaction'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg">×</button>
        </div>

        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2 bg-blue-50/80 p-1.5 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Income
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">Amount ({currency})</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="spendly-input w-full p-2.5 text-xs font-bold text-[#19355E]"
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Category</label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="spendly-input w-full p-2.5 text-xs font-bold text-[#19355E]"
              >
                {categories.map(c => (
                  <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="spendly-input w-full p-2.5 text-xs font-bold text-[#19355E]"
              >
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="spendly-input w-full p-2.5 text-xs font-bold text-[#19355E]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="spendly-input w-full p-2.5 text-xs font-bold text-[#19355E]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">Description / Note</label>
            <input
              type="text"
              placeholder="Add short note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="spendly-input w-full p-2.5 text-xs font-medium text-[#19355E]"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-spendly-primary py-2.5 font-bold text-xs"
            >
              {editingTx ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Delete Confirmation Modal (FR-3.2)
// -------------------------------------------------------------
function DeleteConfirmModal({ isOpen, onClose, onConfirm, transaction }) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="spendly-card max-w-sm w-full p-6 text-center shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </div>
        <h4 className="text-base font-extrabold text-[#19355E] mb-1">Delete Transaction?</h4>
        <p className="text-xs text-gray-500 mb-5">
          Are you sure you want to delete this {transaction.category_name} transaction of {transaction.amount}? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-2xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 shadow-md shadow-rose-300/40"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: Notifications Center Modal
// -------------------------------------------------------------
function NotificationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const notifications = [
    { id: 1, title: 'Smart Budget Alert', desc: 'You have stayed within your dining budget this week! 💙', time: '10m ago', icon: '🎉' },
    { id: 2, title: 'Salary Credited', desc: '₹15,000 was recorded as income from your job salary.', time: '2 days ago', icon: '⚡' },
    { id: 3, title: 'Spendly Tip', desc: 'Set aside 20% of monthly income into investments for long-term growth.', time: '5 days ago', icon: '💡' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="spendly-card max-w-sm w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-[#19355E] flex items-center gap-2">
            <span>🔔</span> Notifications
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-lg">×</button>
        </div>

        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100/60 flex items-start gap-3">
              <span className="text-xl">{n.icon}</span>
              <div>
                <p className="text-xs font-bold text-[#1C365C]">{n.title}</p>
                <p className="text-[11px] text-gray-600 mt-0.5">{n.desc}</p>
                <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-2xl bg-blue-100/70 text-blue-800 font-bold text-xs hover:bg-blue-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Main Application Component
// -------------------------------------------------------------
function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('spendly_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentTab, setCurrentTab] = useState('home');
  const [currency, setCurrency] = useState('₹');
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('spendly_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('spendly_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [period, setPeriod] = useState('this_month');

  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('spendly_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('spendly_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('spendly_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('spendly_user');
    }
  }, [currentUser]);

  // Compute Totals
  const { totalIncome, totalExpenses, totalBalance, breakdown, savingsRate } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    const catAmounts = {};

    transactions.forEach(t => {
      if (t.type === 'income') {
        inc += t.amount;
      } else {
        exp += t.amount;
        catAmounts[t.category_name] = (catAmounts[t.category_name] || 0) + t.amount;
      }
    });

    const bal = inc - exp;
    const rate = inc > 0 ? Math.round((bal / inc) * 100) : 0;

    const catColors = {
      'Food': '#4ECDC4',
      'Travel': '#5DADE2',
      'Shopping': '#F1948A',
      'Utilities': '#F5B041',
      'Others': '#48C9B0'
    };

    const bd = Object.keys(catAmounts).map(name => {
      const amt = catAmounts[name];
      const pct = exp > 0 ? Math.round((amt / exp) * 100) : 0;
      const catObj = categories.find(c => c.name === name);
      return {
        category: name,
        icon: catObj?.icon || '🍴',
        amount: amt,
        percentage: pct,
        color: catColors[name] || '#5DADE2'
      };
    }).sort((a, b) => b.percentage - a.percentage);

    return {
      totalIncome: inc,
      totalExpenses: exp,
      totalBalance: bal,
      breakdown: bd,
      savingsRate: rate
    };
  }, [transactions, categories]);

  // Transaction Actions
  const handleAddTransaction = (newTx) => {
    const created = {
      ...newTx,
      id: Date.now()
    };
    setTransactions(prev => [created, ...prev]);
  };

  const handleUpdateTransaction = (updatedTx) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
  };

  const handleDeleteTransaction = () => {
    if (txToDelete) {
      setTransactions(prev => prev.filter(t => t.id !== txToDelete.id));
      setIsDeleteModalOpen(false);
      setTxToDelete(null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // If not logged in, render Auth screen
  if (!currentUser) {
    return <AuthPage onLoginSuccess={(user, token) => setCurrentUser(user)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden p-4 md:p-6 gap-6">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setTab={setCurrentTab}
        onLogout={handleLogout}
        user={currentUser}
      />

      {/* Main App Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <Header
          user={currentUser}
          onOpenProfile={() => setCurrentTab('profile')}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        {/* Scrollable Dashboard View */}
        <div className="flex-1 overflow-y-auto pr-1 pb-4">
          {currentTab === 'home' && (
            <div className="space-y-6">
              {/* 3 Summary Stat Cards */}
              <StatCards
                balance={totalBalance}
                income={totalIncome}
                expenses={totalExpenses}
                currency={currency}
              />

              {/* Middle Row (Expense Overview & Quick Add Expense) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ExpenseOverview
                    breakdown={breakdown}
                    totalExpenses={totalExpenses}
                    currency={currency}
                    period={period}
                    setPeriod={setPeriod}
                  />
                </div>
                <div>
                  <QuickAddExpense
                    onAddExpense={handleAddTransaction}
                    categories={categories}
                    currency={currency}
                  />
                </div>
              </div>

              {/* Lower Row (Recent Transactions & Insights) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RecentTransactions
                    transactions={transactions}
                    currency={currency}
                    onSeeAll={() => setCurrentTab('transactions')}
                    onEdit={(tx) => { setEditingTx(tx); setIsTxModalOpen(true); }}
                    onDelete={(tx) => { setTxToDelete(tx); setIsDeleteModalOpen(true); }}
                  />
                </div>
                <div>
                  <InsightsCard
                    savingsRate={savingsRate}
                    spendingComparisonPct={-18}
                  />
                </div>
              </div>

              {/* Bottom Quote Pill Banner */}
              <div className="mt-8 mb-2 flex items-center justify-center">
                <div className="bg-[#D8E8FC]/80 backdrop-blur-md px-6 py-2.5 rounded-full border border-blue-200/60 shadow-sm flex items-center gap-2 text-xs font-bold text-[#275084]">
                  <span className="text-amber-500">✨</span>
                  <span>Plan smart. Spend better. Live happier.</span>
                  <span className="text-blue-500 text-sm">♡</span>
                  <span className="text-blue-300">═</span>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'transactions' && (
            <TransactionsModule
              transactions={transactions}
              categories={categories}
              currency={currency}
              onAdd={() => { setEditingTx(null); setIsTxModalOpen(true); }}
              onEdit={(tx) => { setEditingTx(tx); setIsTxModalOpen(true); }}
              onDelete={(tx) => { setTxToDelete(tx); setIsDeleteModalOpen(true); }}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsModule
              transactions={transactions}
              currency={currency}
              user={currentUser}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsModule
              user={currentUser}
              onUpdateProfile={(p) => setCurrentUser(prev => ({ ...prev, ...p }))}
              onUpdatePassword={(p) => alert('Password updated successfully!')}
              onUpdatePreferences={(pref) => {}}
              categories={categories}
              onAddCategory={(cat) => setCategories(prev => [...prev, { ...cat, id: Date.now() }])}
              onDeleteCategory={(id) => setCategories(prev => prev.filter(c => c.id !== id))}
              currency={currency}
              setCurrency={setCurrency}
            />
          )}

          {currentTab === 'profile' && (
            <div className="spendly-card p-8 max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-300 to-indigo-400 p-1 shadow-lg shadow-blue-200">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-4xl">
                    🌸
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#19355E]">{currentUser.name}</h2>
                  <p className="text-xs font-semibold text-gray-500">{currentUser.email}</p>
                  <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-[11px] font-extrabold px-3 py-1 rounded-full">
                    Spendly Premium Member ✦
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-50 text-center">
                <div className="bg-blue-50/60 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-gray-500">Transactions</p>
                  <p className="text-xl font-black text-[#1A345B] mt-1">{transactions.length}</p>
                </div>
                <div className="bg-blue-50/60 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-gray-500">Currency</p>
                  <p className="text-xl font-black text-[#1A345B] mt-1">{currency}</p>
                </div>
                <div className="bg-blue-50/60 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-gray-500">Savings Rate</p>
                  <p className="text-xl font-black text-emerald-600 mt-1">{savingsRate}%</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setCurrentTab('settings')}
                  className="btn-spendly-primary px-6 py-2.5 font-bold text-xs"
                >
                  Edit Profile in Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Transaction Modal (Add/Edit) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={(tx) => {
          if (editingTx) {
            handleUpdateTransaction(tx);
          } else {
            handleAddTransaction(tx);
            fireConfetti();
          }
        }}
        editingTx={editingTx}
        categories={categories}
        currency={currency}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTransaction}
        transaction={txToDelete}
      />

      {/* Notifications Modal */}
      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
    </div>
  );
}

// Mount React Root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
