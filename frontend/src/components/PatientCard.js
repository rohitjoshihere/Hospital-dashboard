import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Stethoscope, Tag as TagIcon, Upload, Edit2, Trash2, ChevronDown, ChevronUp, Image as ImageIcon, CheckCircle2, Clock, Activity, Loader2 } from 'lucide-react';
import MediaUpload from './MediaUpload';
import PatientFormModal from './PatientFormModal';
import MediaViewerModal from './MediaViewerModal';
import { deletePatient } from '../api/patients';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
function toMediaUrl(filePath) {
    if (!filePath)
        return '';
    // Handle absolute container paths like /app/uploads/... or /app/thumbnails/...
    const uploadsMatch = filePath.match(/[/\\]uploads[/\\](.+)$/);
    const thumbsMatch = filePath.match(/[/\\]thumbnails[/\\](.+)$/);
    if (uploadsMatch)
        return `/uploads/${uploadsMatch[1]}`;
    if (thumbsMatch)
        return `/thumbnails/${thumbsMatch[1]}`;
    // Already a relative URL like /thumbnails/...
    return filePath.startsWith('/') ? filePath : `/${filePath}`;
}
export default function PatientCard({ patient, onRefresh }) {
    const { isAdmin } = useAuth();
    const [showUpload, setShowUpload] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    async function handleDelete() {
        if (!confirm(`Are you sure you want to delete patient "${patient.name}"? This action cannot be undone.`))
            return;
        setDeleting(true);
        try {
            await deletePatient(patient.id);
            onRefresh();
        }
        catch {
            alert('Failed to delete patient record.');
        }
        finally {
            setDeleting(false);
        }
    }
    const completedMedia = patient.media?.filter((m) => m.status === 'COMPLETED') ?? [];
    const processingMedia = patient.media?.filter((m) => m.status !== 'COMPLETED') ?? [];
    return (_jsxs("div", { className: "bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all", children: [_jsxs("div", { className: "p-5", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex gap-4", children: [_jsx("div", { className: "w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm shrink-0", children: patient.name.charAt(0).toUpperCase() }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-slate-900", children: patient.name }), _jsxs("div", { className: "flex items-center gap-3 mt-1", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-xs text-slate-500", children: [_jsx(Calendar, { className: "w-3.5 h-3.5" }), patient.dob ? new Date(patient.dob).toLocaleDateString() : 'DOB N/A'] }), _jsx("div", { className: "w-1 h-1 bg-slate-300 rounded-full" }), _jsxs("div", { className: "flex items-center gap-1.5 text-xs text-slate-500", children: [_jsx(Stethoscope, { className: "w-3.5 h-3.5" }), "Dr. ", patient.doctor.name] })] })] })] }), _jsx("div", { className: "flex gap-2", children: isAdmin && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowEdit(true), className: "p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors", title: "Edit Record", children: _jsx(Edit2, { className: "w-4 h-4" }) }), _jsx("button", { onClick: handleDelete, disabled: deleting, className: "p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors", title: "Delete Record", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })) })] }), _jsx("div", { className: "flex flex-wrap gap-2 mt-4", children: patient.tags.length > 0 ? (patient.tags.map(({ tag }) => (_jsxs("span", { className: "flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full tracking-wider", children: [_jsx(TagIcon, { className: "w-2.5 h-2.5" }), tag.name] }, tag.id)))) : (_jsx("span", { className: "text-[10px] text-slate-400 italic", children: "No tags associated" })) }), _jsxs("div", { className: "mt-6 pt-4 border-t border-slate-50 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("button", { onClick: () => setShowUpload(!showUpload), className: cn("flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all", showUpload
                                            ? "bg-slate-900 text-white"
                                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"), children: [_jsx(Upload, { className: "w-3.5 h-3.5" }), showUpload ? 'Close Upload' : 'Upload Media'] }), (completedMedia.length > 0 || processingMedia.length > 0) && (_jsxs("button", { onClick: () => setIsExpanded(!isExpanded), className: "flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors", children: [completedMedia.length + processingMedia.length, " Files", isExpanded ? _jsx(ChevronUp, { className: "w-3.5 h-3.5" }) : _jsx(ChevronDown, { className: "w-3.5 h-3.5" })] }))] }), processingMedia.length > 0 && (_jsxs("div", { className: "flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md animate-pulse", children: [_jsx(Clock, { className: "w-3 h-3" }), processingMedia.length, " PROCESSING"] }))] })] }), _jsxs(AnimatePresence, { children: [showUpload && (_jsx(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: 'auto', opacity: 1 }, exit: { height: 0, opacity: 0 }, className: "border-t border-slate-100 bg-slate-50/50", children: _jsx("div", { className: "p-4", children: _jsx(MediaUpload, { patientId: patient.id, onUploaded: onRefresh }) }) })), isExpanded && (_jsx(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: 'auto', opacity: 1 }, exit: { height: 0, opacity: 0 }, className: "border-t border-slate-100", children: _jsxs("div", { className: "p-5 bg-slate-50/30", children: [_jsxs("h4", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2", children: [_jsx(ImageIcon, { className: "w-3 h-3" }), "Patient Media Gallery"] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3", children: [completedMedia.map((m) => (_jsxs("div", { onClick: () => {
                                                console.log('Opening media:', m);
                                                setSelectedMedia(m);
                                            }, className: "group relative aspect-square bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer", children: [m.thumbPath ? (_jsx("img", { src: toMediaUrl(m.thumbPath), alt: m.type, className: "w-full h-full object-cover transition-transform group-hover:scale-110" })) : (_jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center text-slate-300", children: [_jsx(Activity, { className: "w-6 h-6 mb-1" }), _jsx("span", { className: "text-[8px] font-bold uppercase", children: m.type })] })), _jsx("div", { className: "absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity", children: _jsx(CheckCircle2, { className: "w-4 h-4 text-green-500 fill-white" }) })] }, m.id))), processingMedia.map((m) => (_jsxs("div", { className: "relative aspect-square bg-slate-100 rounded-lg border border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400 overflow-hidden", children: [_jsx(Loader2, { className: "w-6 h-6 animate-spin opacity-50" }), _jsx("span", { className: "text-[8px] font-bold mt-2 uppercase", children: m.type }), _jsx("div", { className: "absolute inset-0 bg-amber-500/5 opacity-20 animate-pulse" })] }, m.id)))] })] }) }))] }), showEdit && (_jsx(PatientFormModal, { patient: patient, onClose: () => setShowEdit(false), onSaved: onRefresh })), _jsx(AnimatePresence, { children: selectedMedia && (_jsx(MediaViewerModal, { media: selectedMedia, onClose: () => setSelectedMedia(null) })) })] }));
}
