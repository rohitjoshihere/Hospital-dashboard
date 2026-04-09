import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Stethoscope, 
  Tag as TagIcon, 
  Upload, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  Loader2
} from 'lucide-react';
import MediaUpload from './MediaUpload';
import PatientFormModal from './PatientFormModal';
import { deletePatient, Patient } from '../api/patients';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface Props {
  patient: Patient;
  onRefresh: () => void;
}

function toMediaUrl(thumbPath: string): string {
  // Use environment variable or window.location if possible, for now keeping localhost
  return `http://localhost:3001${thumbPath}`;
}

export default function PatientCard({ patient, onRefresh }: Props) {
  const { isAdmin } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete patient "${patient.name}"? This action cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deletePatient(patient.id);
      onRefresh();
    } catch {
      alert('Failed to delete patient record.');
    } finally {
      setDeleting(false);
    }
  }

  const completedMedia = patient.media?.filter((m) => m.status === 'COMPLETED') ?? [];
  const processingMedia = patient.media?.filter((m) => m.status !== 'COMPLETED') ?? [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm shrink-0">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{patient.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'DOB N/A'}
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Stethoscope className="w-3.5 h-3.5" />
                  Dr. {patient.doctor.name}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {isAdmin && (
              <>
                <button 
                  onClick={() => setShowEdit(true)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Record"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {patient.tags.length > 0 ? (
            patient.tags.map(({ tag }) => (
              <span key={tag.id} className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                <TagIcon className="w-2.5 h-2.5" />
                {tag.name}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-400 italic">No tags associated</span>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowUpload(!showUpload)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                showUpload 
                  ? "bg-slate-900 text-white" 
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              <Upload className="w-3.5 h-3.5" />
              {showUpload ? 'Close Upload' : 'Upload Media'}
            </button>
            
            {(completedMedia.length > 0 || processingMedia.length > 0) && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {completedMedia.length + processingMedia.length} Files
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {processingMedia.length > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md animate-pulse">
              <Clock className="w-3 h-3" />
              {processingMedia.length} PROCESSING
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showUpload && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-slate-50/50"
          >
            <div className="p-4">
              <MediaUpload patientId={patient.id} onUploaded={onRefresh} />
            </div>
          </motion.div>
        )}

        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100"
          >
            <div className="p-5 bg-slate-50/30">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ImageIcon className="w-3 h-3" />
                Patient Media Gallery
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {completedMedia.map((m) => (
                  <div key={m.id} className="group relative aspect-square bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer">
                    {m.thumbPath ? (
                      <img
                        src={toMediaUrl(m.thumbPath)}
                        alt={m.type}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <Activity className="w-6 h-6 mb-1" />
                        <span className="text-[8px] font-bold uppercase">{m.type}</span>
                      </div>
                    )}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CheckCircle2 className="w-4 h-4 text-green-500 fill-white" />
                    </div>
                  </div>
                ))}
                
                {processingMedia.map((m) => (
                  <div key={m.id} className="relative aspect-square bg-slate-100 rounded-lg border border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400 overflow-hidden">
                    <Loader2 className="w-6 h-6 animate-spin opacity-50" />
                    <span className="text-[8px] font-bold mt-2 uppercase">{m.type}</span>
                    <div className="absolute inset-0 bg-amber-500/5 opacity-20 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showEdit && (
        <PatientFormModal
          patient={patient}
          onClose={() => setShowEdit(false)}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}
