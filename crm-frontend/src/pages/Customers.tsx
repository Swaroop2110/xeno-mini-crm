import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Customers.css';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalSpend: number;
  orderCount: number;
  lastOrderDate: string;
  churnScore: number;
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In dev, use local backend, in prod use render URL. For now, we assume local dev.
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/segments/customers');
        setCustomers(res.data.customers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const getChurnBadge = (score: number) => {
    if (score > 0.7) return <span className="badge danger">High Risk</span>;
    if (score > 0.4) return <span className="badge warning">Medium Risk</span>;
    return <span className="badge success">Loyal</span>;
  };

  return (
    <div className="animate-fade-in">
      <h1>Audience</h1>
      <p className="subtitle">Your entire customer database, synced in real-time.</p>

      <div className="glass-panel table-container">
        {loading ? (
          <div className="loading-state">Loading audience data...</div>
        ) : (
          <table className="customers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Total Spend</th>
                <th>Orders</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div className="customer-info">
                      <span className="customer-name">{c.name}</span>
                      <span className="customer-email">{c.email}</span>
                    </div>
                  </td>
                  <td>{c.city}</td>
                  <td>{c.totalSpend.toLocaleString()} INR</td>
                  <td>{c.orderCount}</td>
                  <td>{getChurnBadge(c.churnScore)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
