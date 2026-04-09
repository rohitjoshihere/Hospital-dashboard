import { useState } from 'react';
import MediaUpload from './MediaUpload';

interface Tag {
  tag: { id: string; name: string };
}

interface Patient {
  id: string;
  name: string;
  dob: string | null;
  createdAt: string;
  doctor: { name: string; email: string };
  tags: Tag[];
}

export default function PatientCard({ patient }: { patient: Patient }) {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.name}>{patient.name}</h3>
        <span style={styles.date}>
          {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'DOB N/A'}
        </span>
      </div>
      <p style={styles.doctor}>Dr. {patient.doctor.name}</p>
      <div style={styles.tags}>
        {patient.tags.map(({ tag }) => (
          <span key={tag.id} style={styles.tag}>{tag.name}</span>
        ))}
      </div>
      <button style={styles.uploadBtn} onClick={() => setShowUpload((v) => !v)}>
        {showUpload ? 'Hide Upload' : 'Upload Media'}
      </button>
      {showUpload && <MediaUpload patientId={patient.id} />}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '0.75rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' },
  name: { margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1a1a2e' },
  date: { fontSize: '0.8rem', color: '#888' },
  doctor: { margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#555' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' },
  tag: { background: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '999px' },
  uploadBtn: { fontSize: '0.8rem', padding: '0.35rem 0.75rem', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' },
};
