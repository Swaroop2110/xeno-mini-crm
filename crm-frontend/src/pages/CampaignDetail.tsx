import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Mail, CheckCircle, Eye, MousePointerClick, AlertCircle, Sparkles } from 'lucide-react';
import './CampaignDetail.css';

interface CampaignStats {
  queued?: number;
  sent?: number;
  delivered?: number;
  opened?: number;
  clicked?: number;
  failed?: number;
}

interface Campaign {
  _id: string;
  name: string;
  status: string;
  channel: string;
  goal: string;
}

export function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<CampaignStats>({});
  const [failures, setFailures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const API_URL = 'http://localhost:3000/api';

  useEffect(() => {
    // 1. Fetch Campaign Info
    const fetchCampaign = async () => {
      try {
        const res = await axios.get(`${API_URL}/campaigns/${id}`);
        setCampaign(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCampaign();
  }, [id]);

  useEffect(() => {
    // 2. Poll Stats every 3 seconds
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/campaigns/${id}/stats`);
        setStats(res.data.breakdown || {});
        setFailures(res.data.recentFailures || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats(); // initial
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return <div className="loading-state">Loading live campaign data...</div>;
  }

  // Formatting for Recharts
  const chartData = [
    { name: 'Queued', value: stats.queued || 0, color: '#94a3b8' },
    { name: 'Sent', value: stats.sent || 0, color: '#3b82f6' },
    { name: 'Delivered', value: stats.delivered || 0, color: '#10b981' },
    { name: 'Opened', value: stats.opened || 0, color: '#8b5cf6' },
    { name: 'Clicked', value: stats.clicked || 0, color: '#f59e0b' },
    { name: 'Failed', value: stats.failed || 0, color: '#ef4444' }
  ];

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await axios.post(`${API_URL}/campaigns/${id}/analyze`);
      setAnalysis(res.data.analysis);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze campaign');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="campaign-detail animate-fade-in">
      <div className="campaign-header glass-panel">
        <div className="flex-between">
          <div>
            <h1>{campaign?.name}</h1>
            <p className="text-secondary">{campaign?.goal}</p>
          </div>
          <div className={`status-badge ${campaign?.status}`}>
            <Activity size={16} />
            {campaign?.status.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <Mail className="metric-icon sent" />
          <div className="metric-content">
            <span className="metric-label">Sent</span>
            <span className="metric-value">{stats.sent || 0}</span>
          </div>
        </div>
        <div className="metric-card glass-panel">
          <CheckCircle className="metric-icon delivered" />
          <div className="metric-content">
            <span className="metric-label">Delivered</span>
            <span className="metric-value">{stats.delivered || 0}</span>
          </div>
        </div>
        <div className="metric-card glass-panel">
          <Eye className="metric-icon opened" />
          <div className="metric-content">
            <span className="metric-label">Opened</span>
            <span className="metric-value">{stats.opened || 0}</span>
          </div>
        </div>
        <div className="metric-card glass-panel">
          <MousePointerClick className="metric-icon clicked" />
          <div className="metric-content">
            <span className="metric-label">Clicked</span>
            <span className="metric-value">{stats.clicked || 0}</span>
          </div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card glass-panel">
          <h3>Funnel Conversion</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                  contentStyle={{backgroundColor: '#0f111a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {failures.length > 0 && (
          <div className="failures-card glass-panel">
            <h3 className="flex items-center gap-2 text-danger">
              <AlertCircle size={20} /> Recent Failures
            </h3>
            <div className="failure-list">
              {failures.map(f => (
                <div key={f._id} className="failure-item">
                  <span className="customer-name">{f.customerId?.name || 'Unknown'}</span>
                  <span className="failure-reason">Simulated Hard Bounce</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="analysis-card glass-panel" style={{ marginTop: '1.5rem', padding: '1.5rem', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#a78bfa" /> AI Campaign Analysis
            </h3>
            {!analysis && (
              <button 
                className="btn-primary" 
                onClick={handleAnalyze} 
                disabled={analyzing}
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                {analyzing ? 'Analyzing...' : 'Generate Analysis'}
              </button>
            )}
          </div>
          
          {analysis && (
            <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #8b5cf6' }}>
              <p style={{ lineHeight: '1.6', fontSize: '1.05rem' }}>{analysis}</p>
            </div>
          )}
          {!analysis && !analyzing && (
            <p className="text-secondary">Click the button to have Gemini analyze the final campaign metrics and generate an executive summary.</p>
          )}
        </div>
      </div>
    </div>
  );
}
