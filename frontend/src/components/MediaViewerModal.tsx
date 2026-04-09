import { motion } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { MediaItem } from '../api/patients';

interface Props {
  media: MediaItem;
  onClose: () => void;
}

function toMediaUrl(filePath: string): string {
  if (!filePath) return '';
  // Handle absolute container paths like /app/uploads/... or /app/thumbnails/...
  const uploadsMatch = filePath.match(/[/\\]uploads[/\\](.+)$/);
  const thumbsMatch = filePath.match(/[/\\]thumbnails[/\\](.+)$/);
  if (uploadsMatch) return `http://localhost:3001/uploads/${uploadsMatch[1]}`;
  if (thumbsMatch) return `http://localhost:3001/thumbnails/${thumbsMatch[1]}`;
  // Already a relative URL like /thumbnails/...
  if (filePath.startsWith('/')) return `http://localhost:3001${filePath}`;
  return filePath;
}

export default function MediaViewerModal({ media, onClose }: Props) {
  const isImage = media.type === 'IMAGE';
  // Use filePath if available. For images, we can fallback to thumbPath.
  const fullUrl = toMediaUrl(media.filePath || (isImage ? media.thumbPath : '') || '');

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md flex items-center justify-center z-[200] p-4 md:p-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center"
      >
        {/* Controls Overlay */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20">
               <span className="text-white text-xs font-bold uppercase tracking-widest">{media.type}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a 
              href={fullUrl} 
              download 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all border border-white/10"
              title="Download Full Quality"
            >
              <Download className="w-5 h-5" />
            </a>
            <button 
              onClick={onClose}
              className="p-3 bg-white/10 hover:bg-red-500/80 backdrop-blur-md text-white rounded-full transition-all border border-white/10"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Container */}
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          {media.type === 'IMAGE' ? (
            <motion.img 
              layoutId={`media-${media.id}`}
              src={fullUrl} 
              alt="Patient Record"
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl shadow-black/50"
            />
          ) : (
            <motion.video 
              layoutId={`media-${media.id}`}
              src={fullUrl} 
              poster={media.thumbPath ? toMediaUrl(media.thumbPath) : undefined}
              controls 
              autoPlay
              className="max-h-full max-w-full rounded-lg shadow-2xl shadow-black/50 bg-black"
            >
              Your browser does not support the video tag.
            </motion.video>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 flex flex-col items-center gap-1">
           <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em]">Record Captured On</p>
           <p className="text-white font-medium">{new Date(media.uploadedAt).toLocaleString()}</p>
        </div>
      </motion.div>
    </div>
  );
}
