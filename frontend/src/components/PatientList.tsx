import { useEffect, useState, useCallback } from 'react';
import client from '../api/client';
import PatientCard from './PatientCard';
import SearchBar, { SearchFilters } from './SearchBar';

interface Patient {
  id: string;
  name: string;
  dob: string | null;
  createdAt: string;
  doctor: { name: string; email: string };
  tags: { tag: { id: string; name: string } }[];
}

interface PaginatedResponse {
  data: Patient[];
  page: number;
  limit: number;
  total: number;
}

export default function PatientList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>({ q: '', tags: '', from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (filters.q) params['q'] = filters.q;
      if (filters.tags) params['tags'] = filters.tags;
      if (filters.from) params['from'] = filters.from;
      if (filters.to) params['to'] = filters.to;

      const res = await client.get<PaginatedResponse>('/patients', { params });
      setPatients(res.data.data);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  function handleSearch(f: SearchFilters) {
    setFilters(f);
    setPage(1);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      {loading && <p style={{ color: '#888', fontSize: '0.9rem' }}>Loading...</p>}
      {!loading && patients.length === 0 && (
        <p style={{ color: '#888', fontSize: '0.9rem' }}>No patients found.</p>
      )}
      {patients.map((p) => <PatientCard key={p.id} patient={p} />)}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button style={styles.pageBtn} disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <span style={{ fontSize: '0.85rem', color: '#555' }}>Page {page} of {totalPages}</span>
          <button style={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, import('react').CSSProperties> = {
  pagination: { display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' },
  pageBtn: { padding: '0.4rem 0.9rem', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', background: '#fff' },
};
