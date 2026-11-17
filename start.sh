#!/bin/bash
echo "==================================================="
echo "    ✨ Launching Spendly - Expense Tracker ✨"
echo "==================================================="

cd "$(dirname "$0")"

# Open default browser
if which xdg-open > /dev/null; then
  xdg-open http://localhost:5000 &
elif which open > /dev/null; then
  open http://localhost:5000 &
fi

# Run Node or Python server
if command -v node > /dev/null; then
  node server/server.js
elif command -v python3 > /dev/null; then
  python3 server/app.py
else
  python server/app.py
fi
