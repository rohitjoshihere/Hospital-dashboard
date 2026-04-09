import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PatientList from '../components/PatientList';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Medical Dashboard</h1>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user?.name} ({user?.role})</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main style={styles.main}>
        <PatientList />
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f0f2f5' },
  header: { background: '#1a1a2e', color: '#fff', padding: '0.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: '1.2rem', fontWeight: 700 },
  userInfo: { display: 'flex', alignItems: 'center', gap: '1rem' },
  userName: { fontSize: '0.9rem', color: '#cbd5e1' },
  logoutBtn: { padding: '0.35rem 0.8rem', background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  main: { maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem' },
};
