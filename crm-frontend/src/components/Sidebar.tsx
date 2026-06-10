import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Sparkles, BarChart3 } from 'lucide-react';
import './Sidebar.css';

export function Sidebar() {
  return (
    <div className="sidebar glass-panel">
      <div className="sidebar-logo">
        <Sparkles className="logo-icon" />
        <h2>Xeno CRM</h2>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'} end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/customers" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <Users size={20} />
          <span>Audience</span>
        </NavLink>
        
        <NavLink to="/copilot" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <Sparkles size={20} />
          <span>AI Copilot</span>
        </NavLink>
      </nav>
    </div>
  );
}
