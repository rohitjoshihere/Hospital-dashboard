import { useState, FormEvent } from 'react';

export interface SearchFilters {
  q: string;
  tags: string;
  from: string;
  to: string;
}

interface Props {
  onSearch: (filters: SearchFilters) => void;
}

export default function SearchBar({ onSearch }: Props) {
  const [q, setQ] = useState('');
  const [tags, setTags] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch({ q, tags, from, to });
  }

  function handleReset() {
    setQ(''); setTags(''); setFrom(''); setTo('');
    onSearch({ q: '', tags: '', from: '', to: '' });
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input style={styles.input} placeholder="Search by name..." value={q} onChange={(e) => setQ(e.target.value)} />
      <input style={styles.input} placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
      <input style={styles.input} type="date" title="From date" value={from} onChange={(e) => setFrom(e.target.value)} />
      <input style={styles.input} type="date" title="To date" value={to} onChange={(e) => setTo(e.target.value)} />
      <button style={styles.btn} type="submit">Search</button>
      <button style={{ ...styles.btn, background: '#6b7280' }} type="button" onClick={handleReset}>Reset</button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' },
  input: { padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', minWidth: '160px' },
  btn: { padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' },
};
