import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, Mail, CheckCircle, Eye, MousePointerClick, AlertCircle } from 'lucide-react';
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
      </div>
    </div>
  );
}
