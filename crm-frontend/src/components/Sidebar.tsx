import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Sparkles, Network } from 'lucide-react';
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
        
        <NavLink to="/copilot" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Sparkles size={20} /> AI Copilot
        </NavLink>
        <NavLink to="/architecture" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Network size={20} /> Architecture
        </NavLink>
      </nav>
    </div>
  );
}
