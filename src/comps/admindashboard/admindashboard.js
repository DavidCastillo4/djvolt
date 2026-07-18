/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const TABS = [
 { id: 'dashboard', label: 'Dashboard' },
 { id: 'gallery', label: 'Gallery' },
 { id: 'videos', label: 'Video Backgrounds' },
];

const GalleryManager = () => {
 const [items, setItems] = useState([]);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [uploading, setUploading] = useState(false);
 const [message, setMessage] = useState('');
 const [error, setError] = useState('');
 const [draggedKey, setDraggedKey] = useState(null);
 const fileInputRef = useRef(null);

 const loadItems = useCallback(async () => {
  setLoading(true);
  setError('');

  try {
   const response = await fetch('/api/admin/gallery', { cache: 'no-store' });
   const data = await response.json();
   if (!response.ok) throw new Error(data.message || 'Unable to load the gallery.');
   setItems(data.items || []);
  } catch (loadError) {
   setError(loadError.message);
  } finally {
   setLoading(false);
  }
 }, []);

 useEffect(() => {
  loadItems();
 }, [loadItems]);

 const uploadFiles = async (event) => {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  setUploading(true);
  setError('');
  setMessage('');

  try {
   const formData = new FormData();
   files.forEach((file) => formData.append('files', file));

   const response = await fetch('/api/admin/gallery', { method: 'POST', body: formData });
   const data = await response.json();
   if (!response.ok) throw new Error(data.message || 'Unable to upload media.');

   setMessage(`${data.uploaded} ${data.uploaded === 1 ? 'item was' : 'items were'} uploaded.`);
   await loadItems();
  } catch (uploadError) {
   setError(uploadError.message);
  } finally {
   setUploading(false);
   if (fileInputRef.current) fileInputRef.current.value = '';
  }
 };

 const toggleGallery = async (item) => {
  const nextValue = !item.isGallery;
  setItems((current) => current.map((candidate) => (
   candidate.key === item.key ? { ...candidate, isGallery: nextValue } : candidate
  )));
  setError('');
  setMessage('');

  try {
   const response = await fetch('/api/admin/gallery', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'visibility', id: item.id, type: item.type, isGallery: nextValue }),
   });
   const data = await response.json();
   if (!response.ok) throw new Error(data.message || 'Unable to update this item.');
  } catch (toggleError) {
   setItems((current) => current.map((candidate) => (
    candidate.key === item.key ? { ...candidate, isGallery: item.isGallery } : candidate
   )));
   setError(toggleError.message);
  }
 };

 const moveItem = (fromKey, toKey) => {
  if (!fromKey || fromKey === toKey) return;
  setItems((current) => {
   const fromIndex = current.findIndex((item) => item.key === fromKey);
   const toIndex = current.findIndex((item) => item.key === toKey);
   if (fromIndex < 0 || toIndex < 0) return current;

   const next = [...current];
   const [moved] = next.splice(fromIndex, 1);
   next.splice(toIndex, 0, moved);
   return next;
  });
 };

 const moveByButton = (index, direction) => {
  const target = index + direction;
  if (target < 0 || target >= items.length) return;
  setItems((current) => {
   const next = [...current];
   [next[index], next[target]] = [next[target], next[index]];
   return next;
  });
 };

 const saveOrder = async () => {
  setSaving(true);
  setError('');
  setMessage('');

  try {
   const response = await fetch('/api/admin/gallery', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
     action: 'reorder',
     items: items.map(({ id, type }) => ({ id, type })),
    }),
   });
   const data = await response.json();
   if (!response.ok) throw new Error(data.message || 'Unable to save the order.');

   setItems((current) => current.map((item, index) => ({ ...item, sortId: (index + 1) * 10 })));
   setMessage('Gallery order saved.');
  } catch (saveError) {
   setError(saveError.message);
  } finally {
   setSaving(false);
  }
 };

 const deleteItem = async (item) => {
  if (item.isHero || item.isBackground) return;
  const confirmed = window.confirm(`Delete ${item.type === 'video' ? 'this video' : item.name}? This cannot be undone.`);
  if (!confirmed) return;

  setError('');
  setMessage('');

  try {
   const response = await fetch('/api/admin/gallery', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: item.id, type: item.type }),
   });
   const data = await response.json();
   if (!response.ok) throw new Error(data.message || 'Unable to delete this item.');

   setItems((current) => current.filter((candidate) => candidate.key !== item.key));
   setMessage('Gallery item deleted. Save the order when you are finished.');
  } catch (deleteError) {
   setError(deleteError.message);
  }
 };

 return (
  <div className="admin-gallery-manager">
   <div className="admin-gallery-toolbar">
    <div>
     <h2>Gallery</h2>
     <p>Upload, hide, delete, and drag media into the order it should appear on the website.</p>
    </div>
    <div className="admin-gallery-actions">
     <label className={`admin-upload-button${uploading ? ' disabled' : ''}`}>
      {uploading ? 'Uploading…' : '+ Upload media'}
      <input
       ref={fileInputRef}
       type="file"
       accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
       multiple
       disabled={uploading}
       onChange={uploadFiles}
      />
     </label>
     <button type="button" className="admin-save-order" disabled={saving || loading} onClick={saveOrder}>
      {saving ? 'Saving…' : 'Save order'}
     </button>
    </div>
   </div>

   {message && <div className="admin-gallery-message success" role="status">{message}</div>}
   {error && <div className="admin-gallery-message error" role="alert">{error}</div>}

   {loading ? (
    <div className="admin-gallery-loading">Loading gallery…</div>
   ) : items.length === 0 ? (
    <div className="admin-gallery-empty">No gallery media has been uploaded yet.</div>
   ) : (
    <div className="admin-media-grid">
     {items.map((item, index) => {
      const protectedVideo = item.type === 'video' && (item.isHero || item.isBackground);
      return (
       <article
        key={item.key}
        className={`admin-media-tile${item.isGallery ? '' : ' hidden-from-gallery'}${draggedKey === item.key ? ' dragging' : ''}`}
        draggable
        onDragStart={(event) => {
         setDraggedKey(item.key);
         event.dataTransfer.effectAllowed = 'move';
         event.dataTransfer.setData('text/plain', item.key);
        }}
        onDragOver={(event) => {
         event.preventDefault();
         event.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(event) => {
         event.preventDefault();
         moveItem(event.dataTransfer.getData('text/plain') || draggedKey, item.key);
        }}
        onDragEnd={() => setDraggedKey(null)}
       >
        <div className="admin-media-preview">
         {item.type === 'video' ? (
          <video src={item.src} muted playsInline preload="metadata" />
         ) : (
          <img src={item.src} alt={item.name || 'Gallery image'} loading="lazy" />
         )}
         <span className="admin-sort-number" aria-label={`Position ${index + 1}`}>{index + 1}</span>
         <span className="admin-media-kind">{item.type === 'video' ? 'Video' : 'Image'}</span>
         {(item.isHero || item.isBackground) && (
          <div className="admin-media-badges">
           {item.isHero && <span>Hero video</span>}
           {item.isBackground && <span>Page background</span>}
          </div>
         )}
        </div>

        <div className="admin-media-details">
         <strong title={item.name}>{item.name}</strong>
         <label className="admin-gallery-toggle">
          <input type="checkbox" checked={item.isGallery} onChange={() => toggleGallery(item)} />
          <span>Included in gallery</span>
         </label>

         <div className="admin-media-controls">
          <button type="button" onClick={() => moveByButton(index, -1)} disabled={index === 0} aria-label="Move earlier">←</button>
          <button type="button" onClick={() => moveByButton(index, 1)} disabled={index === items.length - 1} aria-label="Move later">→</button>
          <button
           type="button"
           className="delete"
           disabled={protectedVideo}
           title={protectedVideo ? 'Choose another website background before deleting this video.' : 'Delete this item'}
           onClick={() => deleteItem(item)}
          >
           Delete
          </button>
         </div>
         {protectedVideo && <small>This video is protected because the website is using it.</small>}
        </div>
       </article>
      );
     })}
    </div>
   )}
  </div>
 );
};

export const AdminDashboard = () => {
 const [activeTab, setActiveTab] = useState('dashboard');

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
     {activeTab === 'gallery' ? (
      <GalleryManager />
     ) : (
      <div className="admin-placeholder">
       <h2>{activeTab === 'dashboard' ? 'Dashboard' : 'Video Backgrounds'}</h2>
       <p>{activeTab === 'dashboard'
        ? 'Administrative tools and site controls will be added here.'
        : 'Hero and page-background video controls will be built here separately.'}</p>
      </div>
     )}
    </div>
   </section>
  </main>
 );
};
