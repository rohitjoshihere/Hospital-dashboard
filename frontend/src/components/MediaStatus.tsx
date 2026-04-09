import { useEffect, useState } from 'react';
import client from '../api/client';

interface MediaStatusData {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  type: string;
  thumbPath: string | null;
  processedAt: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PROCESSING: '#3b82f6',
  COMPLETED: '#10b981',
  FAILED: '#ef4444',
};

export default function MediaStatus({ mediaId }: { mediaId: string }) {
  const [data, setData] = useState<MediaStatusData | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function fetchStatus() {
      try {
        const res = await client.get<MediaStatusData>(`/media/${mediaId}/status`);
        setData(res.data);
        if (res.data.status === 'COMPLETED' || res.data.status === 'FAILED') {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }

    fetchStatus();
    interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [mediaId]);

  if (!data) return <span style={{ fontSize: '0.8rem', color: '#888' }}>Loading...</span>;

  return (
    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: STATUS_COLORS[data.status] ?? '#888' }}>
      {data.status}
    </span>
  );
}
