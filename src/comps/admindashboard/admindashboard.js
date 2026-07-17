'use client';

import { useState } from 'react';

const tabs = [{ id: 'dashboard', label: 'Dashboard' }];

export const AdminDashboard = () => {
 const [activeTab, setActiveTab] = useState('dashboard');

 return (
  <main className="admin-dashboard-page">
   <div className="admin-dashboard-shell">
    <header className="admin-dashboard-header">
     <div>
      <span className="admin-kicker">DJ Volts</span>
      <h1>Admin Dashboard</h1>
     </div>
    </header>

    <nav className="admin-tabs" aria-label="Admin dashboard sections">
     {tabs.map((tab) => (
      <button
       key={tab.id}
       type="button"
       className={activeTab === tab.id ? 'active' : ''}
       onClick={() => setActiveTab(tab.id)}
      >
       {tab.label}
      </button>
     ))}
    </nav>

    <section className="admin-tab-content" aria-live="polite">
     {activeTab === 'dashboard' && <div className="admin-placeholder"></div>}
    </section>
   </div>
  </main>
 );
};
