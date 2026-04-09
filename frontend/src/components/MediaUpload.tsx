import { useState, DragEvent, ChangeEvent, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import client from '../api/client';
import { cn } from '../lib/utils';

interface UploadedMedia {
  mediaId: string;
  fileName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

interface MediaStatusResponse {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  thumbPath: string | null;
}

const STATUS_CONFIG = {
  PENDING: { color: 'text-amber-600 bg-amber-50', icon: Clock },
  PROCESSING: { color: 'text-blue-600 bg-blue-50', icon: Loader2 },
  COMPLETED: { color: 'text-green-600 bg-green-50', icon: CheckCircle2 },
  FAILED: { color: 'text-red-600 bg-red-50', icon: AlertCircle },
};

export default function MediaUpload({
  patientId,
  onUploaded,
}: {
  patientId: string;
  onUploaded?: () => void;
}) {
  const [uploads, setUploads] = useState<UploadedMedia[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  function startPolling(mediaId: string) {
    const interval = setInterval(async () => {
      try {
        const res = await client.get<MediaStatusResponse>(`/media/${mediaId}/status`);
        const { status } = res.data;

        setUploads((prev) =>
          prev.map((u) => (u.mediaId === mediaId ? { ...u, status } : u))
        );

        if (status === 'COMPLETED' || status === 'FAILED') {
          clearInterval(interval);
          intervalsRef.current.delete(mediaId);
          if (status === 'COMPLETED') onUploaded?.();
        }
      } catch {
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
      const newUpload: UploadedMedia = {
        mediaId: res.data.mediaId,
        fileName: file.name,
        status: 'PENDING',
      };
      setUploads((prev) => [...prev, newUpload]);
      startPolling(res.data.mediaId);
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
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center cursor-pointer",
          dragging 
            ? "border-blue-500 bg-blue-50/50" 
            : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
        )}
      >
        <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
          <Upload className={cn("w-5 h-5 transition-colors", dragging ? "text-blue-600" : "text-slate-400")} />
        </div>
        <p className="text-sm font-medium text-slate-600 text-center">
            <span className="text-blue-600 font-bold">Click to upload</span> or drag and drop<br />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">IMG, MP4 (MAX 10MB)</span>
        </p>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-100"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {uploads.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Recent Uploads</h5>
          <AnimatePresence mode="popLayout">
            {uploads.map((u) => {
              const status = STATUS_CONFIG[u.status];
              const StatusIcon = status.icon;
              return (
                <motion.div 
                  key={u.mediaId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                        <File className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[150px]">{u.fileName}</span>
                  </div>
                  <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold tracking-tight", status.color)}>
                    <StatusIcon className={cn("w-3 h-3", u.status === 'PROCESSING' && "animate-spin")} />
                    {u.status}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
