#!/bin/bash

echo "🚀 Starting Lumina AI Monitoring System..."

# Start Backend
echo "Starting Backend on http://localhost:8000..."
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
fi
# Use python3 -m to ensure we use the installed uvicorn even if not in PATH
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start Frontend
echo "Starting Frontend on http://localhost:3000..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Handle exit
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT

echo "✅ Lumina AI is running!"
wait
