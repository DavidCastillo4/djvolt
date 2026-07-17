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

    <div className="admin-tabs" role="tablist" aria-label="Dashboard sections">
     {TABS.map((tab) => (
      <button
       key={tab.id}
       type="button"
       id={`admin-tab-${tab.id}`}
       role="tab"
       className={activeTab === tab.id ? 'active' : ''}
       aria-selected={activeTab === tab.id}
       aria-controls={`admin-panel-${tab.id}`}
       tabIndex={activeTab === tab.id ? 0 : -1}
       onClick={() => setActiveTab(tab.id)}
      >
       {tab.label}
      </button>
     ))}
    </div>

    <div
     id={`admin-panel-${activeTab}`}
     className="admin-tab-content"
     role="tabpanel"
     aria-labelledby={`admin-tab-${activeTab}`}
    >
     <div className="admin-placeholder">
      <h2>{content.title}</h2>
      <p>{content.description}</p>
     </div>
    </div>
   </section>
  </main>
 );
};
