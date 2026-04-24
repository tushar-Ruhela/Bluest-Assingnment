# 🌟 Lumina AI: Advanced Model Monitoring & Drift Detection

Lumina AI is a premium, real-time monitoring solution for production machine learning models. It identifies distribution shifts and performance degradation before they impact your business.

![Dashboard Preview](https://img.placeholder.com/800x400?text=Lumina+AI+Dashboard+Premium+UI)

## 🚀 Key Features
- **Data Drift Detection**: Real-time Kolmogorov-Smirnov statistical tests for input features.
- **Concept Drift Monitoring**: Continuous tracking of model performance (MAE/Accuracy) over time.
- **Automated Workflows**: Automated retraining triggers when drift thresholds are breached.
- **Interactive Dashboard**: Glassmorphism-style UI with dynamic charts and alerts.
- **Simulation Suite**: Built-in tools to simulate data shifts and performance drops to test robustness.

## 🛠 Technology Stack
- **Backend**: FastAPI (Python), SciPy, NumPy, Pandas.
- **Frontend**: Next.js 14, React, Chart.js, Vanilla CSS.
- **Monitoring Logic**: Statistical p-value analysis and windowed performance aggregation.

## 📈 Monitoring Metrics
1. **P-Value (K-S Test)**: Measures the probability that current production data comes from the same distribution as the training data.
2. **MAE (Mean Absolute Error)**: Tracks the average magnitude of prediction errors.
3. **Drift Score**: A normalized metric (0-1) indicating the severity of the distribution shift.

## 📂 Project Structure
```text
.
├── backend/            # FastAPI server & drift logic
│   ├── main.py
│   ├── drift_detector.py
│   └── requirements.txt
├── frontend/           # Next.js Dashboard
├── run.sh              # Single-command startup
├── .env                # Configuration
└── install.md          # Setup instructions
```

