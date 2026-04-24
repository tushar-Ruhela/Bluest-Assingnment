# 📦 Installation Guide - Lumina AI

This guide will help you set up the Lumina AI Monitoring System on your local machine.

## Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

## 1. Backend Setup
Navigate to the backend directory and set up a virtual environment:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
```

## 2. Frontend Setup
Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

## 3. Configuration
Create a `.env` file in the root directory (one is provided by default):

```env
BACKEND_URL=http://localhost:8000
FRONTEND_PORT=3000
```

## 4. Running the System
We recommend running both servers simultaneously using the provided `run.sh` script:

```bash
# From the root directory
chmod +x run.sh
./run.sh
```

Alternatively, run them in separate terminals:
- **Backend**: `cd backend && uvicorn main:app --reload`
- **Frontend**: `cd frontend && npm run dev`
