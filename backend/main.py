from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import random
from drift_detector import DriftDetector, generate_reference_data, simulate_prediction

app = FastAPI(title="Lumina AI Monitoring API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize reference data and detector
reference_df = generate_reference_data()
detector = DriftDetector(reference_df)

# Simulation state
is_drift_simulated = False

class PredictionRequest(BaseModel):
    usage_frequency: float
    support_tickets: int
    age: int
    tenure: float
    actual: int = None

@app.get("/")
async def root():
    return {"message": "Lumina AI Monitoring System Active"}

@app.get("/drift-status")
async def get_drift_status():
    return detector.get_status()

@app.post("/predict")
async def predict(data: PredictionRequest):
    features = data.dict()
    # Remove actual for model input
    model_input = {k: v for k, v in features.items() if k != 'actual'}
    
    # Run mock prediction
    prediction = simulate_prediction(pd.Series(model_input))
    
    # Log to detector
    # If actual isn't provided, simulate a ground truth (usually delayed in real life)
    actual = data.actual if data.actual is not None else prediction
    
    detector.add_prediction(model_input, actual, prediction)
    
    return {
        "prediction": prediction,
        "features": model_input
    }

@app.post("/simulate-drift")
async def toggle_simulation(enable: bool):
    global is_drift_simulated
    is_drift_simulated = enable
    return {"simulation_active": is_drift_simulated}

@app.post("/inject-data")
async def inject_data(n: int = 50):
    """
    Injects a batch of synthetic data.
    If simulation is active, inject 'drifted' data.
    """
    for _ in range(n):
        if is_drift_simulated:
            # Shift usage frequency down and tickets up (simulate bad UX)
            usage = np.random.normal(10, 3) 
            tickets = np.random.poisson(5)
        else:
            usage = np.random.normal(20, 5)
            tickets = np.random.poisson(2)
            
        age = np.random.randint(18, 70)
        tenure = np.random.gamma(2, 5)
        
        feat = {
            "usage_frequency": usage,
            "support_tickets": tickets,
            "age": age,
            "tenure": tenure
        }
        
        # In drifted state, the model (trained on usage=20) will fail
        # because the input distribution shifted.
        prediction = simulate_prediction(pd.Series(feat))
        
        # Concept drift simulation: actuals start differing from prediction
        actual = prediction
        if is_drift_simulated and random.random() > 0.7:
            actual = 1 - prediction # Performance degradation
            
        detector.add_prediction(feat, actual, prediction)
        
    return {"status": "Success", "injected": n, "drift_active": is_drift_simulated}

@app.post("/retrain")
async def retrain():
    """
    Simulate automated retraining by replacing reference data
    with the current (drifted) distribution.
    """
    if not detector.current_data:
        raise HTTPException(status_code=400, detail="Not enough data to retrain")
        
    new_ref = pd.DataFrame(detector.current_data)
    global detector
    detector = DriftDetector(new_ref)
    return {"status": "Retrained successful", "new_reference_size": len(new_ref)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
