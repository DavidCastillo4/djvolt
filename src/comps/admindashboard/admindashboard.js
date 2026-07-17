'use client';

import { useState } from 'react';

const TABS = [
 { id: 'dashboard', label: 'Dashboard' },
 { id: 'gallery', label: 'Gallery' },
 { id: 'videos', label: 'Videos' },
];

const TAB_CONTENT = {
 dashboard: {
  title: 'Dashboard',
  description: 'Administrative tools and site controls will be added here.',
 },
 gallery: {
  title: 'Gallery',
  description: 'Gallery management tools will be added here.',
 },
 videos: {
  title: 'Videos',
  description: 'Video management tools will be added here.',
 },
};

export const AdminDashboard = () => {
 const [activeTab, setActiveTab] = useState('dashboard');
 const content = TAB_CONTENT[activeTab];

 return (
  <main className="admin-dashboard-page">
   <section className="admin-dashboard-shell" aria-labelledby="admin-dashboard-title">
    <header className="admin-dashboard-header">
     <span className="admin-kicker">DJ Volts Administration</span>
     <h1 id="admin-dashboard-title">Admin Dashboard</h1>
    </header>

    <nav className="admin-tabs" aria-label="Dashboard sections">
     {TABS.map((tab) => (
      <button
       key={tab.id}
       type="button"
       className={activeTab === tab.id ? 'active' : ''}
       aria-selected={activeTab === tab.id}
       onClick={() => setActiveTab(tab.id)}
      >
       {tab.label}
      </button>
     ))}
    </nav>

    <div className="admin-tab-content">
     <div className="admin-placeholder">
      <h2>{content.title}</h2>
      <p>{content.description}</p>
     </div>
    </div>
   </section>
  </main>
 );
};
