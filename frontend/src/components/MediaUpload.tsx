import { useState, DragEvent, ChangeEvent } from 'react';
import client from '../api/client';
import MediaStatus from './MediaStatus';

interface UploadedMedia {
  mediaId: string;
  fileName: string;
}

export default function MediaUpload({ patientId }: { patientId: string }) {
  const [uploads, setUploads] = useState<UploadedMedia[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  async function uploadFile(file: File) {
    setError('');
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await client.post<{ mediaId: string }>(
        `/patients/${patientId}/media`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setUploads((prev: UploadedMedia[]) => [...prev, { mediaId: res.data.mediaId, fileName: file.name }]);
    } catch {
      setError('Upload failed. Check file type and size (max 10MB).');
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  }

  return (
    <div style={styles.wrapper}>
      <div
        style={{ ...styles.dropzone, borderColor: dragging ? '#2563eb' : '#ccc' }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
          Drag & drop an image or video here, or{' '}
          <label style={styles.browseLabel}>
            browse
            <input type="file" accept="image/*,video/*" onChange={handleChange} style={{ display: 'none' }} />
          </label>
        </p>
      </div>
      {error && <p style={styles.error}>{error}</p>}
      {uploads.length > 0 && (
        <ul style={styles.list}>
          {uploads.map((u) => (
            <li key={u.mediaId} style={styles.listItem}>
              <span style={{ fontSize: '0.85rem', color: '#333' }}>{u.fileName}</span>
              <MediaStatus mediaId={u.mediaId} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles: Record<string, import('react').CSSProperties> = {
  wrapper: { marginTop: '0.75rem' },
  dropzone: { border: '2px dashed', borderRadius: '6px', padding: '1.25rem', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' },
  browseLabel: { color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' },
  error: { color: '#dc2626', fontSize: '0.8rem', marginTop: '0.4rem' },
  list: { listStyle: 'none', padding: 0, margin: '0.75rem 0 0' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #f0f0f0' },
};
