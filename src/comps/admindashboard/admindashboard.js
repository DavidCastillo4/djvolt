/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_SITE_CONTENT } from '@/lib/siteContent';

const TABS = [
 { id: 'gallery', label: 'Gallery' },
 { id: 'videos', label: 'Video Backgrounds' },
 { id: 'content', label: 'Content' },
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
         <div className="admin-media-controls">
          <div className="admin-media-controls-left">
           <label className="admin-gallery-toggle" title="Include in gallery">
            <input
             type="checkbox"
             checked={item.isGallery}
             onChange={() => toggleGallery(item)}
             aria-label="Include in gallery"
            />
           </label>
           <button type="button" onClick={() => moveByButton(index, -1)} disabled={index === 0} aria-label="Move earlier">←</button>
           <button type="button" onClick={() => moveByButton(index, 1)} disabled={index === items.length - 1} aria-label="Move later">→</button>
          </div>
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


const captureVideoPoster = (src) => new Promise((resolve, reject) => {
 const video = document.createElement('video');
 let settled = false;

 const finish = (callback, value) => {
  if (settled) return;
  settled = true;
  video.pause();
  video.removeAttribute('src');
  video.load();
  callback(value);
 };

 const fail = () => finish(reject, new Error('A poster frame could not be created from one of the selected videos.'));
 const timeout = window.setTimeout(fail, 12000);

 video.muted = true;
 video.playsInline = true;
 video.preload = 'auto';

 video.addEventListener('error', () => {
  window.clearTimeout(timeout);
  fail();
 }, { once: true });

 video.addEventListener('loadedmetadata', () => {
  const duration = Number.isFinite(video.duration) ? video.duration : 0;
  video.currentTime = duration > 0 ? Math.min(1, Math.max(0.05, duration * 0.1)) : 0;
 }, { once: true });

 video.addEventListener('seeked', () => {
  try {
   const sourceWidth = video.videoWidth;
   const sourceHeight = video.videoHeight;
   if (!sourceWidth || !sourceHeight) throw new Error('Video dimensions are unavailable.');

   const maxWidth = 1280;
   const scale = Math.min(1, maxWidth / sourceWidth);
   const canvas = document.createElement('canvas');
   canvas.width = Math.max(1, Math.round(sourceWidth * scale));
   canvas.height = Math.max(1, Math.round(sourceHeight * scale));

   const context = canvas.getContext('2d');
   if (!context) throw new Error('Poster canvas is unavailable.');
   context.drawImage(video, 0, 0, canvas.width, canvas.height);

   const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
   window.clearTimeout(timeout);
   finish(resolve, dataUrl);
  } catch {
   window.clearTimeout(timeout);
   fail();
  }
 }, { once: true });

 video.src = src;
 video.load();
});

const VideoBackgroundManager = () => {
 const [videos, setVideos] = useState([]);
 const [heroId, setHeroId] = useState(null);
 const [backgroundId, setBackgroundId] = useState(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [message, setMessage] = useState('');
 const [error, setError] = useState('');

 const loadVideos = useCallback(async () => {
  setLoading(true);
  setError('');

  try {
   const response = await fetch('/api/admin/video-backgrounds', { cache: 'no-store' });
   const data = await response.json();
   if (!response.ok) throw new Error(data.message || 'Unable to load the videos.');

   const nextVideos = data.videos || [];
   setVideos(nextVideos);
   setHeroId(nextVideos.find((video) => video.isHero)?.id ?? null);
   setBackgroundId(nextVideos.find((video) => video.isBackground)?.id ?? null);
  } catch (loadError) {
   setError(loadError.message);
  } finally {
   setLoading(false);
  }
 }, []);

 useEffect(() => {
  loadVideos();
 }, [loadVideos]);

 useEffect(() => {
  if (!message) return undefined;
  const timer = window.setTimeout(() => setMessage(''), 3200);
  return () => window.clearTimeout(timer);
 }, [message]);

 useEffect(() => {
  if (!error) return undefined;
  const timer = window.setTimeout(() => setError(''), 5000);
  return () => window.clearTimeout(timer);
 }, [error]);

 const saveSelections = async () => {
  if (!heroId || !backgroundId) {
   setError('Choose both a hero video and a page-background video.');
   return;
  }

  const heroVideo = videos.find((video) => video.id === heroId);
  const backgroundVideo = videos.find((video) => video.id === backgroundId);
  if (!heroVideo || !backgroundVideo) {
   setError('One of the selected videos could not be found.');
   return;
  }

  setSaving(true);
  setError('');
  setMessage('');

  try {
   const heroPoster = await captureVideoPoster(heroVideo.src);
   const backgroundPoster = heroId === backgroundId
    ? heroPoster
    : await captureVideoPoster(backgroundVideo.src);

   const response = await fetch('/api/admin/video-backgrounds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ heroId, backgroundId, heroPoster, backgroundPoster }),
   });
   const data = await response.json();
   if (!response.ok) throw new Error(data.message || 'Unable to save the video backgrounds.');

   setVideos((current) => current.map((video) => ({
    ...video,
    isHero: video.id === heroId,
    isBackground: video.id === backgroundId,
   })));
   setMessage('Video backgrounds and poster images saved.');
  } catch (saveError) {
   setError(saveError.message);
  } finally {
   setSaving(false);
  }
 };

 return (
  <div className="admin-video-background-manager">
   <div className="admin-gallery-toolbar">
    <div>
     <h2>Video Backgrounds</h2>
     <p>Choose the video used in the hero and the video used behind the rest of the page. The same video may be used for both.</p>
    </div>
    <div className="admin-gallery-actions">
     <button type="button" className="admin-save-order" disabled={saving || loading || videos.length === 0} onClick={saveSelections}>
      {saving ? 'Creating posters…' : 'Save backgrounds'}
     </button>
    </div>
   </div>

   {message && <div className="admin-gallery-toast" role="status" aria-live="polite">{message}</div>}
   {error && <div className="admin-gallery-toast error" role="alert" aria-live="assertive">{error}</div>}

   {loading ? (
    <div className="admin-gallery-loading">Loading videos…</div>
   ) : videos.length === 0 ? (
    <div className="admin-gallery-empty">No videos have been uploaded yet.</div>
   ) : (
    <div className="admin-video-background-grid">
     {videos.map((video, index) => (
      <article key={video.id} className={`admin-background-tile${heroId === video.id || backgroundId === video.id ? ' selected' : ''}`}>
       <div className="admin-media-preview">
        <video src={video.src} muted playsInline preload="metadata" controls />
        <span className="admin-background-number">{index + 1}</span>
        <div className="admin-media-badges">
         {heroId === video.id && <span>Hero video</span>}
         {backgroundId === video.id && <span>Page background</span>}
        </div>
       </div>
       <div className="admin-background-choices">
        <label>
         <input type="radio" name="hero-video" checked={heroId === video.id} onChange={() => setHeroId(video.id)} />
         <span>Hero</span>
        </label>
        <label>
         <input type="radio" name="background-video" checked={backgroundId === video.id} onChange={() => setBackgroundId(video.id)} />
         <span>Background</span>
        </label>
       </div>
      </article>
     ))}
    </div>
   )}
  </div>
 );
};


const CONTENT_FIELDS = {
 nav: [['about','About link',18],['services','Services link',18],['gallery','Gallery link',18],['book','Book link',18],['cta','Quote button',24]],
 hero: [['eyebrow','Booking banner',55],['titleTop','Logo line 1',12],['titleBottom','Logo line 2',12],['tagline','Main description',260,true],['primaryButton','Primary button',28],['secondaryButton','Gallery button',28],['stat1Value','Stat 1 value',16],['stat1Label','Stat 1 label',25],['stat2Value','Stat 2 value',16],['stat2Label','Stat 2 label',25],['stat3Value','Stat 3 value',16],['stat3Label','Stat 3 label',25],['stat4Value','Stat 4 value',16],['stat4Label','Stat 4 label',25]],
 ticker: [['items','Scrolling genres (separate with |)',220,true],['speed','Scrolling speed',0,false,'speed']],
 about: [['kicker','Section label',30],['photoTag','Photo label',35],['heading','Heading',120,true],['paragraph','Story paragraph',420,true],['plateTitle','Nameplate title',35],['plateModel','Model label',35],...Array.from({length:6},(_,i)=>[[`label${i+1}`,`Specification ${i+1} label`,28],[`value${i+1}`,`Specification ${i+1} value`,45]]).flat()],
 services: [['kicker','Section label',30],['heading','Heading',100],['intro','Introduction',260,true],['panelTitle','Panel title',45],['powerLabel','Power label',24],...Array.from({length:4},(_,i)=>[[`service${i+1}Title`,`Service ${i+1} name`,35],[`service${i+1}Description`,`Service ${i+1} description`,220,true]]).flat()],
 gallery: [['kicker','Section label',30],['heading','Heading',90],['intro','Introduction',220,true],['scrollSpeed','Gallery scrolling speed',0,false,'gallerySpeed']],
 booking: [['kicker','Section label',30],['heading','Heading',90],['intro','Introduction',280,true],['phone','Phone number',28],['email','Email address',80],['instagram','Instagram label',40],['ticketTitle','Ticket title',35],['ticketCode','Ticket code',30],...Array.from({length:5},(_,i)=>[[`row${i+1}Label`,`Ticket row ${i+1} label`,35],[`row${i+1}Value`,`Ticket row ${i+1} value`,45]]).flat()],
 footer: [['brandTop','Brand line 1',12],['brandBottom','Brand line 2',12],['about','About link',18],['services','Services link',18],['gallery','Gallery link',18],['book','Book link',18]],
};

const SECTION_TITLES = { nav:'Header & Navigation', hero:'Hero', ticker:'Scrolling Music Banner', about:'About / Story', services:'Services', gallery:'Gallery', booking:'Booking', footer:'Footer' };

const TICKER_SPEED_OPTIONS = [
 ['48', 'Very slow'],
 ['40', 'Slow'],
 ['32', 'Normal'],
 ['24', 'Fast'],
 ['18', 'Very fast'],
];

const GALLERY_SPEED_OPTIONS = Array.from({ length: 50 }, (_, index) => {
 const level = index + 1;
 let label = `${level}`;
 if (level === 1) label += ' — Slowest';
 if (level === 5) label += ' — Current speed';
 if (level === 20) label += ' — Fast';
 if (level === 50) label += ' — Fastest';
 return [String(level), label];
});

const ContentField = ({ section, field, value, onChange }) => {
 const [key,label,max,multiline,type] = field;
 const id = `content-${section}-${key}`;

 if (type === 'speed') {
  return (
   <label className="content-field content-field-select" htmlFor={id}>
    <span>{label}<small>Lower seconds = faster</small></span>
    <select id={id} value={String(value ?? '32')} onChange={(e)=>onChange(section,key,e.target.value)}>
     {TICKER_SPEED_OPTIONS.map(([seconds, name]) => <option key={seconds} value={seconds}>{name} — {seconds} seconds</option>)}
    </select>
   </label>
  );
 }

 if (type === 'gallerySpeed') {
  return (
   <label className="content-field content-field-select" htmlFor={id}>
    <span>{label}<small>1 = slowest, 50 = fastest</small></span>
    <select id={id} value={String(value ?? '5')} onChange={(e)=>onChange(section,key,e.target.value)}>
     {GALLERY_SPEED_OPTIONS.map(([level, name]) => <option key={level} value={level}>{name}</option>)}
    </select>
   </label>
  );
 }

 const common = { id, value: value ?? '', maxLength:max, onChange:(e)=>onChange(section,key,e.target.value) };
 return <label className="content-field" htmlFor={id}><span>{label}<small>{String(value ?? '').length}/{max}</small></span>{multiline ? <textarea {...common} rows="3" /> : <input {...common} type="text" />}</label>;
};

const ContentManager = () => {
 const [content,setContent] = useState(DEFAULT_SITE_CONTENT);
 const [saved,setSaved] = useState(DEFAULT_SITE_CONTENT);
 const [loading,setLoading] = useState(true);
 const [saving,setSaving] = useState(false);
 const [message,setMessage] = useState('');
 const [error,setError] = useState('');

 useEffect(()=>{ (async()=>{ try { const r=await fetch('/api/content',{cache:'no-store'}); const d=await r.json(); if(!r.ok) throw new Error(d.message||'Unable to load content.'); setContent(d.content); setSaved(d.content); } catch(e){setError(e.message);} finally {setLoading(false);} })(); },[]);
 const update=(section,key,value)=>setContent((current)=>({...current,[section]:{...current[section],[key]:value}}));
 const reset=()=>{ setContent(saved); setMessage('Unsaved changes reset.'); setError(''); };
 const save=async()=>{ setSaving(true); setMessage(''); setError(''); try { const r=await fetch('/api/content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({content})}); const d=await r.json(); if(!r.ok) throw new Error(d.message||'Unable to save content.'); setContent(d.content); setSaved(d.content); setMessage('Website content saved. Refresh the public website to see the changes.'); } catch(e){setError(e.message);} finally {setSaving(false);} };
 if(loading) return <div className="admin-gallery-loading">Loading website content…</div>;
 return <div className="content-manager">
  <div className="admin-gallery-toolbar"><div><h2>Content</h2><p>Edit the words in a visual outline that follows the website from top to bottom. Changes are not live until you save.</p></div><div className="admin-gallery-actions"><button type="button" className="content-reset" onClick={reset} disabled={saving}>Reset unsaved changes</button><button type="button" className="admin-save-order" onClick={save} disabled={saving}>{saving?'Saving…':'Save content'}</button></div></div>
  {message&&<div className="admin-gallery-toast" role="status">{message}</div>}{error&&<div className="admin-gallery-toast error" role="alert">{error}</div>}
  <div className="content-site-preview">
   {Object.entries(CONTENT_FIELDS).map(([section,fields])=><section className={`content-preview-section content-preview-${section}`} key={section}><div className="content-preview-heading"><span>{SECTION_TITLES[section]}</span><small>Website section</small></div><div className="content-fields">{fields.map((field)=><ContentField key={field[0]} section={section} field={field} value={content[section]?.[field[0]]} onChange={update}/>)}</div></section>)}
  </div>
  <div className="content-sticky-save"><span>Changes stay private until saved.</span><button type="button" className="admin-save-order" onClick={save} disabled={saving}>{saving?'Saving…':'Save content'}</button></div>
 </div>;
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
     {activeTab === 'gallery' && <GalleryManager />}
     {activeTab === 'videos' && <VideoBackgroundManager />}
     {activeTab === 'content' && <ContentManager />}
    </div>
   </section>
  </main>
 );
};
