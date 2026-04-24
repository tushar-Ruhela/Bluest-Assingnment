import numpy as np
import pandas as pd
from scipy.stats import ks_2samp
from typing import Dict, List, Any
import time

class DriftDetector:
    def __init__(self, reference_data: pd.DataFrame):
        """
        Initialize with training/reference data.
        """
        self.reference_data = reference_data
        self.current_data = []
        self.performance_history = []
        self.drift_threshold = 0.05  # Alpha level for K-S test
        self.window_size = 100

    def calculate_data_drift(self, new_data: pd.DataFrame) -> Dict[str, float]:
        """
        Detects data drift using the Kolmogorov-Smirnov test.
        Returns a dictionary of p-values for each feature.
        """
        drift_metrics = {}
        for column in self.reference_data.columns:
            if column in new_data.columns:
                stat, p_value = ks_2samp(self.reference_data[column], new_data[column])
                drift_metrics[column] = {
                    "p_value": float(p_value),
                    "is_drift": p_value < self.drift_threshold,
                    "drift_score": 1 - float(p_value) # Normalized score
                }
        return drift_metrics

    def add_prediction(self, features: Dict[str, float], actual: float, prediction: float):
        """
        Logs a new prediction event.
        """
        self.current_data.append(features)
        
        # Calculate moving error
        error = abs(actual - prediction)
        self.performance_history.append({
            "timestamp": time.time(),
            "error": error,
            "actual": actual,
            "prediction": prediction
        })
        
        if len(self.current_data) > self.window_size * 2:
            self.current_data = self.current_data[-self.window_size:]
        
        if len(self.performance_history) > self.window_size * 2:
            self.performance_history = self.performance_history[-self.window_size:]

    def get_status(self) -> Dict[str, Any]:
        """
        Returns the overall monitoring status.
        """
        if not self.current_data:
            return {"status": "Waiting for data"}

        current_df = pd.DataFrame(self.current_data)
        drift_report = self.calculate_data_drift(current_df)
        
        # Aggregate drift
        drift_detected = any(metric["is_drift"] for metric in drift_report.values())
        
        # Calculate performance metric (e.g., Mean Absolute Error)
        recent_errors = [h["error"] for h in self.performance_history]
        mae = sum(recent_errors) / len(recent_errors) if recent_errors else 0
        
        return {
            "data_drift": drift_report,
            "is_drift_detected": drift_detected,
            "performance": {
                "metric": "MAE",
                "value": mae,
                "history": self.performance_history[-20:]
            },
            "sample_count": len(self.current_data)
        }

def generate_reference_data(n_samples=500):
    """
    Generates synthetic churn data.
    Features: usage_frequency, support_tickets, age, tenure
    """
    np.random.seed(42)
    data = {
        "usage_frequency": np.random.normal(20, 5, n_samples),
        "support_tickets": np.random.poisson(2, n_samples),
        "age": np.random.randint(18, 70, n_samples),
        "tenure": np.random.gamma(2, 5, n_samples)
    }
    return pd.DataFrame(data)

def simulate_prediction(features: pd.Series):
    """
    Mock model logic: Churn (1) or No Churn (0)
    Based on high support tickets and low usage.
    """
    # Simple rule-based mock model
    score = (features['support_tickets'] * 0.3) - (features['usage_frequency'] * 0.1)
    return 1 if score > 0 else 0
