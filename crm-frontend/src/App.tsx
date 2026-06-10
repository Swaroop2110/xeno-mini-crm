import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Customers } from './pages/Customers';
import { Copilot } from './pages/Copilot';

// Temporary placeholder pages
const Dashboard = () => <div className="animate-fade-in"><h1>Dashboard</h1><p>Welcome to Xeno CRM</p></div>;

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/copilot" element={<Copilot />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
