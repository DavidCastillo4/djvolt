'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const tabs = [{ id: 'dashboard', label: 'Dashboard' }];

const formatBytes = (bytes) => {
 if (!Number.isFinite(Number(bytes))) return '';
 const value = Number(bytes);
 if (value < 1024) return `${value} B`;
 if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
 return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

export const AdminDashboard = () => {
 const [activeTab, setActiveTab] = useState('dashboard');
 const [selectedFiles, setSelectedFiles] = useState([]);
 const [uploadedImages, setUploadedImages] = useState([]);
 const [isLoadingImages, setIsLoadingImages] = useState(true);
 const [isUploading, setIsUploading] = useState(false);
 const [message, setMessage] = useState('');
 const [error, setError] = useState('');
 const fileInputRef = useRef(null);

 const totalSelectedSize = useMemo(
  () => selectedFiles.reduce((total, file) => total + file.size, 0),
  [selectedFiles],
 );

 const loadImages = async () => {
  setIsLoadingImages(true);

  try {
   const response = await fetch('/api/admin/images', { cache: 'no-store' });
   const data = await response.json();

   if (!response.ok) {
    throw new Error(data.message || 'Unable to load uploaded images.');
   }

   setUploadedImages(data.images || []);
  } catch (loadError) {
   setError(loadError.message);
  } finally {
   setIsLoadingImages(false);
  }
 };

 useEffect(() => {
  loadImages();
 }, []);

 const handleFileSelection = (event) => {
  const files = Array.from(event.target.files || []);
  setSelectedFiles(files);
  setMessage('');
  setError('');
 };

 const clearSelection = () => {
  setSelectedFiles([]);
  setMessage('');
  setError('');

  if (fileInputRef.current) {
   fileInputRef.current.value = '';
  }
 };

 const uploadImages = async () => {
  if (selectedFiles.length === 0 || isUploading) return;

  setIsUploading(true);
  setMessage('');
  setError('');

  try {
   const formData = new FormData();
   selectedFiles.forEach((file) => formData.append('images', file));

   const response = await fetch('/api/admin/images', {
    method: 'POST',
    body: formData,
   });
   const data = await response.json();

   if (!response.ok) {
    throw new Error(data.message || 'Unable to upload the selected images.');
   }

   setMessage(data.message);
   clearSelection();
   setMessage(data.message);
   await loadImages();
  } catch (uploadError) {
   setError(uploadError.message);
  } finally {
   setIsUploading(false);
  }
 };

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
     {activeTab === 'dashboard' && (
      <div className="admin-image-upload-panel">
       <div className="admin-image-upload-heading">
        <div>
         <span className="admin-kicker">One-Time Database Load</span>
         <h2>Upload Gallery Images</h2>
         <p>
          Select the gallery images you want stored in Neon. They will be inserted in the
          order shown below and assigned sort values in increments of 10.
         </p>
        </div>
        <div className="admin-image-count">
         <strong>{uploadedImages.length}</strong>
         <span>currently in database</span>
        </div>
       </div>

       <div className="admin-image-picker">
        <label htmlFor="admin-image-files">Choose images</label>
        <input
         ref={fileInputRef}
         id="admin-image-files"
         type="file"
         accept="image/jpeg,image/png,image/webp,image/gif"
         multiple
         onChange={handleFileSelection}
         disabled={isUploading}
        />
        <p>JPG, PNG, WebP, or GIF. Maximum 10 MB per image and 100 images per upload.</p>
       </div>

       {selectedFiles.length > 0 && (
        <div className="admin-selected-images">
         <div className="admin-selected-images-header">
          <div>
           <h3>Ready to upload</h3>
           <p>{selectedFiles.length} image{selectedFiles.length === 1 ? '' : 's'} · {formatBytes(totalSelectedSize)}</p>
          </div>
          <button type="button" className="admin-secondary-button" onClick={clearSelection} disabled={isUploading}>
           Clear
          </button>
         </div>

         <ol>
          {selectedFiles.map((file, index) => (
           <li key={`${file.name}-${file.lastModified}-${index}`}>
            <span className="admin-file-order">{index + 1}</span>
            <span className="admin-file-name">{file.name}</span>
            <span className="admin-file-size">{formatBytes(file.size)}</span>
           </li>
          ))}
         </ol>

         <button
          type="button"
          className="admin-upload-button"
          onClick={uploadImages}
          disabled={isUploading}
         >
          {isUploading ? 'Uploading images…' : `Upload ${selectedFiles.length} image${selectedFiles.length === 1 ? '' : 's'} to Neon`}
         </button>
        </div>
       )}

       {message && <div className="admin-upload-message success">{message}</div>}
       {error && <div className="admin-upload-message error">{error}</div>}

       <div className="admin-database-images">
        <div className="admin-database-images-header">
         <div>
          <h3>Images currently stored</h3>
          <p>This list reads metadata only; it does not download the image data.</p>
         </div>
         <button type="button" className="admin-secondary-button" onClick={loadImages} disabled={isLoadingImages || isUploading}>
          Refresh
         </button>
        </div>

        {isLoadingImages ? (
         <p className="admin-image-empty">Loading database images…</p>
        ) : uploadedImages.length === 0 ? (
         <p className="admin-image-empty">No images have been uploaded yet.</p>
        ) : (
         <div className="admin-image-table-wrap">
          <table className="admin-image-table">
           <thead>
            <tr>
             <th>ID</th>
             <th>Image name</th>
             <th>Type</th>
             <th>Size</th>
             <th>Sort ID</th>
            </tr>
           </thead>
           <tbody>
            {uploadedImages.map((image) => (
             <tr key={image.imgpk}>
              <td>{image.imgpk}</td>
              <td>{image.imgname}</td>
              <td>{image.imgtype}</td>
              <td>{formatBytes(image.imagesize)}</td>
              <td>{image.sortid}</td>
             </tr>
            ))}
           </tbody>
          </table>
         </div>
        )}
       </div>
      </div>
     )}
    </section>
   </div>
  </main>
 );
};
