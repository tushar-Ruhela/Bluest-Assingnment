"use client";

import { useEffect, useState } from "react";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Zap, 
  BarChart3,
  TrendingUp,
  LayoutDashboard
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DriftStatus {
  is_drift_detected: boolean;
  sample_count: number;
  performance: {
    value: number;
    history: any[];
  };
  data_drift: Record<string, any>;
}

export default function Dashboard() {
  const [status, setStatus] = useState<DriftStatus | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch("http://localhost:8000/drift-status");
      const data = await res.json();
      setStatus(data);
      setLoading(false);
    } catch (e) {
      console.error("Backend unreachable");
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const simulateDrift = async () => {
    const nextState = !isSimulating;
    setIsSimulating(nextState);
    await fetch(`http://localhost:8000/simulate-drift?enable=${nextState}`, { method: 'POST' });
    if (nextState) {
        await fetch(`http://localhost:8000/inject-data?n=50`, { method: 'POST' });
    }
  };

  const retrainModel = async () => {
    setLoading(true);
    await fetch("http://localhost:8000/retrain", { method: 'POST' });
    setIsSimulating(false);
    await fetch(`http://localhost:8000/simulate-drift?enable=false`, { method: 'POST' });
    setTimeout(fetchStatus, 500);
  };

  const injectData = async () => {
    await fetch("http://localhost:8000/inject-data?n=20", { method: 'POST' });
  };

  const chartData = {
    labels: status?.performance.history.map((_, i) => i) || [],
    datasets: [
      {
        fill: true,
        label: 'Prediction Error (MAE)',
        data: status?.performance.history.map(h => h.error) || [],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { grid: { display: false } },
    },
  };

  return (
    <main>
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Lumina AI</h1>
          <p style={{ opacity: 0.6 }}>Advanced Model Monitoring & Drift Detection</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={injectData}
            title="Inject Production Data"
            className="glass" style={{ padding: '0.8rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} /> Add Production Traffic
          </button>
          <button 
            onClick={simulateDrift} 
            className="glass" 
            style={{ 
                padding: '0.8rem 1.2rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                backgroundColor: isSimulating ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                borderColor: isSimulating ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'
            }}>
            <Activity size={18} color={isSimulating ? '#ef4444' : '#fff'} /> 
            {isSimulating ? 'Stop Simulation' : 'Simulate Drift'}
          </button>
        </div>
      </header>

      <div className="grid-cols" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem' }}>
        <div className="glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>Overall Health</span>
            <CheckCircle size={20} color={status?.is_drift_detected ? '#ef4444' : '#10b981'} />
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {status?.is_drift_detected ? 'Drifted' : 'Healthy'}
          </p>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: status?.is_drift_detected ? '#ef4444' : '#10b981' }}>
            {status?.is_drift_detected ? 'Action Required' : 'Operational'}
          </div>
        </div>

        <div className="glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>Data Drift Score</span>
            <Activity size={20} color="#3b82f6" />
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {(Math.max(...Object.values(status?.data_drift || {}).map(v => v.drift_score), 0)).toFixed(3)}
          </p>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#10b981' }}>
            Based on K-S Test
          </div>
        </div>

        <div className="glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>Model Performance</span>
            <TrendingUp size={20} color="#8b5cf6" />
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {status?.performance.value.toFixed(4)}
          </p>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#3b82f6' }}>
            Mean Absolute Error
          </div>
        </div>

        <div className="glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>Sample Count</span>
            <LayoutDashboard size={20} color="#10b981" />
          </div>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {status?.sample_count || 0}
          </p>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#10b981' }}>
            Active inferences
          </div>
        </div>
      </div>

      <div className="grid-cols" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} className="gradient-text" /> Performance Trend
            </h3>
            <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Last 20 points</span>
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="glass" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <AlertTriangle size={20} className="gradient-text" /> Feature Analysis
          </h3>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {status && Object.entries(status.data_drift).map(([field, meta]) => (
              <div key={field} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{field.replace('_', ' ')}</span>
                  <span style={{ fontSize: '0.8rem', color: meta.is_drift ? '#ef4444' : '#10b981' }}>
                    {meta.is_drift ? 'Drift High' : 'Stable'}
                  </span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                  <div style={{ 
                    width: `${meta.drift_score * 100}%`, 
                    height: '100%', 
                    background: meta.is_drift ? '#ef4444' : '#3b82f6',
                    borderRadius: '2px' 
                  }}></div>
                </div>
              </div>
            ))}
            {!status && <div className="animate-pulse" style={{ height: '20px', width: '100%', background: 'rgba(255,255,255,0.05)' }}></div>}
          </div>
          
          <button 
            onClick={retrainModel}
            disabled={!status?.is_drift_detected}
            style={{ 
                marginTop: '1.5rem', 
                width: '100%', 
                padding: '1rem', 
                background: status?.is_drift_detected ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'rgba(255,255,255,0.05)',
                color: status?.is_drift_detected ? '#fff' : 'rgba(255,255,255,0.2)',
                borderRadius: '0.5rem'
            }}>
            <RefreshCw size={18} style={{ marginRight: '0.5rem' }} /> Trigger Retraining
          </button>
        </div>
      </div>
    </main>
  );
}
