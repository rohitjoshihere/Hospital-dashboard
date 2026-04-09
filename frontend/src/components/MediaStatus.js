import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import client from '../api/client';
const STATUS_COLORS = {
    PENDING: '#f59e0b',
    PROCESSING: '#3b82f6',
    COMPLETED: '#10b981',
    FAILED: '#ef4444',
};
export default function MediaStatus({ mediaId }) {
    const [data, setData] = useState(null);
    useEffect(() => {
        let interval;
        async function fetchStatus() {
            try {
                const res = await client.get(`/media/${mediaId}/status`);
                setData(res.data);
                if (res.data.status === 'COMPLETED' || res.data.status === 'FAILED') {
                    clearInterval(interval);
                }
            }
            catch {
                clearInterval(interval);
            }
        }
        fetchStatus();
        interval = setInterval(fetchStatus, 2000);
        return () => clearInterval(interval);
    }, [mediaId]);
    if (!data)
        return _jsx("span", { style: { fontSize: '0.8rem', color: '#888' }, children: "Loading..." });
    return (_jsx("span", { style: { fontSize: '0.8rem', fontWeight: 600, color: STATUS_COLORS[data.status] ?? '#888' }, children: data.status }));
}
