import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import client from '../api/client';
import { cn } from '../lib/utils';
const STATUS_CONFIG = {
    PENDING: { color: 'text-amber-600 bg-amber-50', icon: Clock },
    PROCESSING: { color: 'text-blue-600 bg-blue-50', icon: Loader2 },
    COMPLETED: { color: 'text-green-600 bg-green-50', icon: CheckCircle2 },
    FAILED: { color: 'text-red-600 bg-red-50', icon: AlertCircle },
};
export default function MediaUpload({ patientId, onUploaded, }) {
    const [uploads, setUploads] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState('');
    const intervalsRef = useRef(new Map());
    function startPolling(mediaId) {
        const interval = setInterval(async () => {
            try {
                const res = await client.get(`/media/${mediaId}/status`);
                const { status } = res.data;
                setUploads((prev) => prev.map((u) => (u.mediaId === mediaId ? { ...u, status } : u)));
                if (status === 'COMPLETED' || status === 'FAILED') {
                    clearInterval(interval);
                    intervalsRef.current.delete(mediaId);
                    if (status === 'COMPLETED')
                        onUploaded?.();
                }
            }
            catch {
                clearInterval(interval);
                intervalsRef.current.delete(mediaId);
            }
        }, 2000);
        intervalsRef.current.set(mediaId, interval);
    }
    useEffect(() => {
        return () => {
            intervalsRef.current.forEach((interval) => clearInterval(interval));
        };
    }, []);
    async function uploadFile(file) {
        setError('');
        const form = new FormData();
        form.append('file', file);
        try {
            const res = await client.post(`/patients/${patientId}/media`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
            const newUpload = {
                mediaId: res.data.mediaId,
                fileName: file.name,
                status: 'PENDING',
            };
            setUploads((prev) => [...prev, newUpload]);
            startPolling(res.data.mediaId);
        }
        catch {
            setError('Upload failed. Check file type and size (max 10MB).');
        }
    }
    function handleDrop(e) {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file)
            uploadFile(file);
    }
    function handleChange(e) {
        const file = e.target.files?.[0];
        if (file)
            uploadFile(file);
        e.target.value = '';
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { onDragOver: (e) => { e.preventDefault(); setDragging(true); }, onDragLeave: () => setDragging(false), onDrop: handleDrop, className: cn("relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer", dragging
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"), children: [_jsx("div", { className: "w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-3", children: _jsx(Upload, { className: cn("w-5 h-5 transition-colors", dragging ? "text-blue-600" : "text-slate-400") }) }), _jsxs("p", { className: "text-sm font-medium text-slate-600 text-center", children: [_jsx("span", { className: "text-blue-600 font-bold", children: "Click to upload" }), " or drag and drop", _jsx("br", {}), _jsx("span", { className: "text-[10px] text-slate-400 uppercase tracking-wider font-bold", children: "IMG, MP4 (MAX 10MB)" })] }), _jsx("input", { type: "file", accept: "image/*,video/*", onChange: handleChange, className: "absolute inset-0 opacity-0 cursor-pointer" })] }), error && (_jsxs(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, className: "flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-100", children: [_jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), error] })), uploads.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("h5", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1", children: "Recent Uploads" }), _jsx(AnimatePresence, { mode: "popLayout", children: uploads.map((u) => {
                            const status = STATUS_CONFIG[u.status];
                            const StatusIcon = status.icon;
                            return (_jsxs(motion.div, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, className: "flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 bg-slate-100 rounded flex items-center justify-center", children: _jsx(File, { className: "w-4 h-4 text-slate-400" }) }), _jsx("span", { className: "text-xs font-semibold text-slate-700 truncate max-w-[150px]", children: u.fileName })] }), _jsxs("div", { className: cn("flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold tracking-tight", status.color), children: [_jsx(StatusIcon, { className: cn("w-3 h-3", u.status === 'PROCESSING' && "animate-spin") }), u.status] })] }, u.mediaId));
                        }) })] }))] }));
}
