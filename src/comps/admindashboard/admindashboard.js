/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const TABS = [
 { id: 'gallery', label: 'Gallery' },
 { id: 'videos', label: 'Video Backgrounds' },
];

const IMAGE_MAX_BYTES = 4 * 1024 * 1024;
const VIDEO_MAX_BYTES = Math.floor(4.2 * 1024 * 1024);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const VIDEO_EXTENSIONS = new Set(['mp4']);
const VIDEO_TYPES = new Set(['video/mp4']);

const getExtension = (name = '') => name.split('.').pop()?.toLowerCase() || '';

const readResponse = async (response) => {
 const text = await response.text();
 if (!text) return {};

 try {
  return JSON.parse(text);
 } catch {
  if (response.status === 413) {
   return { message: 'The selected file is too large. Images must be 4 MB or smaller and videos must be 4.2 MB or smaller.' };
  }
  return { message: 'The upload failed. Please try again.' };
 }
};

const GalleryManager = () => {
 const [items, setItems] = useState([]);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [uploading, setUploading] = useState(false);
 const [message, setMessage] = useState('');
 const [error, setError] = useState('');
 const [draggedKey, setDraggedKey] = useState(null);
 const [pendingDelete, setPendingDelete] = useState(null);
 const [deleting, setDeleting] = useState(false);
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

 useEffect(() => {
  if (!message) return undefined;

  const timer = window.setTimeout(() => setMessage(''), 3200);
  return () => window.clearTimeout(timer);
 }, [message]);

 useEffect(() => {
  if (!error) return undefined;

  const timer = window.setTimeout(() => setError(''), 4200);
  return () => window.clearTimeout(timer);
 }, [error]);

 const uploadFiles = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  setError('');
  setMessage('');

  const extension = getExtension(file.name);
  const mimeType = String(file.type || '').toLowerCase();
  const isImage = IMAGE_EXTENSIONS.has(extension) && IMAGE_TYPES.has(mimeType);
  const isVideo = VIDEO_EXTENSIONS.has(extension) && VIDEO_TYPES.has(mimeType);

  if (file.size === 0) {
   setError('This file is empty. Please choose another file.');
   event.target.value = '';
   return;
  }

  if (extension === 'heic' || extension === 'heif' || mimeType === 'image/heic' || mimeType === 'image/heif') {
   setError('HEIC photos are not supported. Please convert the photo to JPG before uploading.');
   event.target.value = '';
   return;
  }

  if (!isImage && !isVideo) {
   setError(mimeType.startsWith('video/') || VIDEO_EXTENSIONS.has(extension)
    ? 'This video format is not supported. Please upload an MP4 video.'
    : 'This file type is not supported. Upload a JPG, JPEG, PNG, WebP, GIF, or MP4 file.');
   event.target.value = '';
   return;
  }

  if (isImage && file.size > IMAGE_MAX_BYTES) {
   setError('This image is too large. Images must be 4 MB or smaller.');
   event.target.value = '';
   return;
  }

  if (isVideo && file.size > VIDEO_MAX_BYTES) {
   setError('This video is too large. Videos must be 4.2 MB or smaller.');
   event.target.value = '';
   return;
  }

  setUploading(true);

  try {
   const formData = new FormData();
   formData.append('file', file);

   const response = await fetch('/api/admin/gallery', { method: 'POST', body: formData });
   const data = await readResponse(response);
   if (!response.ok) throw new Error(data.message || 'Unable to upload media.');

   setMessage('Media uploaded.');
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

 useEffect(() => {
  if (!pendingDelete) return undefined;

  const closeOnEscape = (event) => {
   if (event.key === 'Escape' && !deleting) setPendingDelete(null);
  };

  window.addEventListener('keydown', closeOnEscape);
  return () => window.removeEventListener('keydown', closeOnEscape);
 }, [pendingDelete, deleting]);

 const requestDelete = (item) => {
  if (item.isHero || item.isBackground) return;
  setPendingDelete(item);
 };

 const deleteItem = async () => {
  if (!pendingDelete || pendingDelete.isHero || pendingDelete.isBackground) return;

  const item = pendingDelete;
  setDeleting(true);
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
   setPendingDelete(null);
   setMessage('Gallery item deleted. Save the order when you are finished.');
  } catch (deleteError) {
   setError(deleteError.message);
  } finally {
   setDeleting(false);
  }
 };

 return (
  <div className="admin-gallery-manager">
   <div className="admin-gallery-toolbar">
    <div>
     <p>Upload, hide, delete, and drag media into the order it should appear on the website</p>
    </div>
    <div className="admin-gallery-actions">
     <label className={`admin-upload-button${uploading ? ' disabled' : ''}`}>
      {uploading ? 'Uploading…' : '+ Upload media'}
      <input
       ref={fileInputRef}
       type="file"
       accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,image/jpeg,image/png,image/webp,image/gif,video/mp4"
       disabled={uploading}
       onChange={uploadFiles}
      />
     </label>
     <button type="button" className="admin-save-order" disabled={saving || loading} onClick={saveOrder}>
      {saving ? 'Saving…' : 'Save order'}
     </button>
    </div>
   </div>
   <p className="admin-upload-rules">One file at a time · JPG, JPEG, PNG, WebP, GIF up to 4 MB · MP4 up to 4.2 MB</p>

   {message && (
    <div className="admin-gallery-toast" role="status" aria-live="polite">
     {message}
    </div>
   )}
   {error && <div className="admin-gallery-toast error" role="alert" aria-live="assertive">{error}</div>}

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
           onClick={() => requestDelete(item)}
          >
           Delete
          </button>
         </div>
         {protectedVideo && <small>Protected background video</small>}
        </div>
       </article>
      );
     })}
    </div>
   )}

   {pendingDelete && (
    <div
     className="admin-confirm-overlay"
     role="presentation"
     onMouseDown={(event) => {
      if (event.target === event.currentTarget && !deleting) setPendingDelete(null);
     }}
    >
     <section
      className="admin-confirm-modal"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-media-title"
     >
      <h2 id="delete-media-title">Delete media?</h2>
      <div className="admin-confirm-actions">
       <button type="button" className="cancel" autoFocus disabled={deleting} onClick={() => setPendingDelete(null)}>
        Cancel
       </button>
       <button type="button" className="confirm-delete" disabled={deleting} onClick={deleteItem}>
        {deleting ? 'Deleting…' : 'Delete'}
       </button>
      </div>
     </section>
    </div>
   )}
  </div>
 );
};

export const AdminDashboard = () => {
 const [activeTab, setActiveTab] = useState('gallery');

 return (
  <main className="admin-dashboard-page">
   <section className="admin-dashboard-shell" aria-labelledby="admin-dashboard-title">
    <header className="admin-dashboard-header">     
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
       <h2>Video Backgrounds</h2>
       <p>Hero and page-background video controls will be built here separately.</p>
      </div>
     )}
    </div>
   </section>
  </main>
 );
};
