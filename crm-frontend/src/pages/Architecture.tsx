import React, { useEffect, useState } from 'react';
import { Server, Database, Smartphone, Globe, ArrowRight, Activity } from 'lucide-react';
import './Architecture.css';

interface SystemEvent {
  id: string;
  timestamp: string;
  service: 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'CHANNEL' | 'WEBHOOK';
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export function Architecture() {
  const [events, setEvents] = useState<SystemEvent[]>([]);

  // Simulate system events for the demo
  useEffect(() => {
    const simulateEvents = () => {
      const newEvent: SystemEvent = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        service: ['FRONTEND', 'BACKEND', 'DATABASE', 'CHANNEL', 'WEBHOOK'][Math.floor(Math.random() * 5)] as any,
        message: '',
        type: 'info'
      };

      switch(newEvent.service) {
        case 'FRONTEND':
          newEvent.message = 'Polling /api/campaigns/:id/stats for UI updates...';
          newEvent.type = 'info';
          break;
        case 'BACKEND':
          newEvent.message = 'Handling POST /api/campaigns dispatch request...';
          newEvent.type = 'info';
          break;
        case 'DATABASE':
          newEvent.message = 'Executing aggregate $group query on Communications collection.';
          newEvent.type = 'success';
          break;
        case 'CHANNEL':
          newEvent.message = 'Simulating randomized delivery outcome for communication batch...';
          newEvent.type = 'warning';
          break;
        case 'WEBHOOK':
          newEvent.message = 'Received status update receipt. Updating campaign metrics.';
          newEvent.type = 'success';
          break;
      }

      setEvents(prev => [newEvent, ...prev].slice(0, 50));
    };

    // Initial events
    simulateEvents();
    
    // Add new event every 2.5 seconds
    const interval = setInterval(simulateEvents, 2500);
    return () => clearInterval(interval);
  }, []);

  const getServiceColor = (service: string) => {
    switch(service) {
      case 'FRONTEND': return '#3b82f6';
      case 'BACKEND': return '#8b5cf6';
      case 'DATABASE': return '#10b981';
      case 'CHANNEL': return '#f59e0b';
      case 'WEBHOOK': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <div className="architecture-container animate-fade-in">
      <div className="header-section">
        <h1>System Architecture</h1>
        <p className="text-secondary">A live visual representation of our event-driven microservices architecture.</p>
      </div>

      <div className="architecture-content">
        {/* DIAGRAM SECTION */}
        <div className="diagram-section glass-panel">
          <div className="node-grid">
            
            <div className="arch-node frontend">
              <div className="node-icon"><Globe size={32} /></div>
              <h3>React Frontend</h3>
              <p>Vite + TS + Recharts</p>
            </div>

            <div className="connector">
              <div className="pulse-line"></div>
              <ArrowRight className="arrow" />
            </div>

            <div className="arch-node backend">
              <div className="node-icon"><Server size={32} /></div>
              <h3>CRM Backend</h3>
              <p>Express + Gemini SDK</p>
            </div>

            <div className="connector vertical-down">
              <div className="pulse-line vertical"></div>
            </div>

            <div className="arch-node database">
              <div className="node-icon"><Database size={32} /></div>
              <h3>MongoDB</h3>
              <p>Mongoose + Aggregations</p>
            </div>

            <div className="connector vertical-up-right">
              <div className="pulse-line diagonal"></div>
            </div>

            <div className="arch-node channel">
              <div className="node-icon"><Smartphone size={32} /></div>
              <h3>Channel Service</h3>
              <p>Delivery Simulator</p>
            </div>

            <div className="connector back-to-backend">
              <div className="pulse-line returning"></div>
              <p className="webhook-label">Webhook Receipts</p>
            </div>

          </div>
        </div>

        {/* TERMINAL SECTION */}
        <div className="terminal-section glass-panel">
          <div className="terminal-header">
            <Activity size={16} />
            <span>Live System Event Log</span>
          </div>
          <div className="terminal-body">
            {events.map((ev, i) => (
              <div key={ev.id} className="terminal-line animate-slide-in" style={{opacity: 1 - (i * 0.05)}}>
                <span className="term-time">[{ev.timestamp}]</span>
                <span className="term-service" style={{color: getServiceColor(ev.service)}}>
                  [{ev.service}]
                </span>
                <span className={`term-message ${ev.type}`}>{ev.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
