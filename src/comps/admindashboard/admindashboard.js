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
 const [uploadedVideos, setUploadedVideos] = useState([]);
 const [isLoadingVideos, setIsLoadingVideos] = useState(true);
 const [isUploading, setIsUploading] = useState(false);
 const [uploadProgress, setUploadProgress] = useState('');
 const [message, setMessage] = useState('');
 const [error, setError] = useState('');
 const fileInputRef = useRef(null);

 const totalSelectedSize = useMemo(
  () => selectedFiles.reduce((total, file) => total + file.size, 0),
  [selectedFiles],
 );

 const loadVideos = async () => {
  setIsLoadingVideos(true);

  try {
   const response = await fetch('/api/admin/videos', { cache: 'no-store' });
   const data = await response.json();

   if (!response.ok) {
    throw new Error(data.message || 'Unable to load uploaded videos.');
   }

   setUploadedVideos(data.videos || []);
  } catch (loadError) {
   setError(loadError.message);
  } finally {
   setIsLoadingVideos(false);
  }
 };

 useEffect(() => {
  loadVideos();
 }, []);

 const handleFileSelection = (event) => {
  const files = Array.from(event.target.files || []);
  setSelectedFiles(files);
  setMessage('');
  setError('');
  setUploadProgress('');
 };

 const clearSelection = () => {
  setSelectedFiles([]);
  setUploadProgress('');

  if (fileInputRef.current) {
   fileInputRef.current.value = '';
  }
 };

 const uploadVideos = async () => {
  if (selectedFiles.length === 0 || isUploading) return;

  setIsUploading(true);
  setMessage('');
  setError('');

  let uploadedCount = 0;

  try {
   for (let index = 0; index < selectedFiles.length; index += 1) {
    const file = selectedFiles[index];
    setUploadProgress(`Uploading ${index + 1} of ${selectedFiles.length}: ${file.name}`);

    const formData = new FormData();
    formData.append('video', file);

    const response = await fetch('/api/admin/videos', {
     method: 'POST',
     body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
     throw new Error(data.message || `Unable to upload ${file.name}.`);
    }

    uploadedCount += 1;
   }

   clearSelection();
   setMessage(`${uploadedCount} video${uploadedCount === 1 ? '' : 's'} uploaded successfully.`);
   await loadVideos();
  } catch (uploadError) {
   setError(
    uploadedCount > 0
     ? `${uploadedCount} video${uploadedCount === 1 ? '' : 's'} uploaded before the error. ${uploadError.message}`
     : uploadError.message,
   );
   await loadVideos();
  } finally {
   setIsUploading(false);
   setUploadProgress('');
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
         <h2>Upload Website Videos</h2>
         <p>
          Select the videos you want stored in Neon. Videos are uploaded one at a time
          in the order shown below and assigned sort values in increments of 10.
         </p>
        </div>
        <div className="admin-image-count">
         <strong>{uploadedVideos.length}</strong>
         <span>currently in database</span>
        </div>
       </div>

       <div className="admin-image-picker">
        <label htmlFor="admin-video-files">Choose videos</label>
        <input
         ref={fileInputRef}
         id="admin-video-files"
         type="file"
         accept="video/mp4,video/webm,video/quicktime"
         multiple
         onChange={handleFileSelection}
         disabled={isUploading}
        />
        <p>MP4, WebM, or MOV. Maximum 25 MB per video. Files upload sequentially.</p>
       </div>

       {selectedFiles.length > 0 && (
        <div className="admin-selected-images">
         <div className="admin-selected-images-header">
          <div>
           <h3>Ready to upload</h3>
           <p>{selectedFiles.length} video{selectedFiles.length === 1 ? '' : 's'} · {formatBytes(totalSelectedSize)}</p>
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
          onClick={uploadVideos}
          disabled={isUploading}
         >
          {isUploading ? 'Uploading videos…' : `Upload ${selectedFiles.length} video${selectedFiles.length === 1 ? '' : 's'} to Neon`}
         </button>

         {uploadProgress && <p className="admin-image-empty">{uploadProgress}</p>}
        </div>
       )}

       {message && <div className="admin-upload-message success">{message}</div>}
       {error && <div className="admin-upload-message error">{error}</div>}

       <div className="admin-database-images">
        <div className="admin-database-images-header">
         <div>
          <h3>Videos currently stored</h3>
          <p>This list reads metadata only; it does not download the video data.</p>
         </div>
         <button type="button" className="admin-secondary-button" onClick={loadVideos} disabled={isLoadingVideos || isUploading}>
          Refresh
         </button>
        </div>

        {isLoadingVideos ? (
         <p className="admin-image-empty">Loading database videos…</p>
        ) : uploadedVideos.length === 0 ? (
         <p className="admin-image-empty">No videos have been uploaded yet.</p>
        ) : (
         <div className="admin-image-table-wrap">
          <table className="admin-image-table">
           <thead>
            <tr>
             <th>ID</th>
             <th>Video name</th>
             <th>Type</th>
             <th>Size</th>
             <th>Sort ID</th>
            </tr>
           </thead>
           <tbody>
            {uploadedVideos.map((video) => (
             <tr key={video.vidpk}>
              <td>{video.vidpk}</td>
              <td>{video.vidname}</td>
              <td>{video.vidtype}</td>
              <td>{formatBytes(video.videosize)}</td>
              <td>{video.sortid}</td>
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
