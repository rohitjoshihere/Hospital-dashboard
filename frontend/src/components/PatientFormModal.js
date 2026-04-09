import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, User, Calendar, Stethoscope, Tag, Loader2, AlertCircle, Edit2, UserPlus } from 'lucide-react';
import { getDoctors } from '../api/doctors';
import { createPatient, updatePatient } from '../api/patients';
export default function PatientFormModal({ patient, onClose, onSaved }) {
    const isEdit = !!patient;
    const [name, setName] = useState(patient?.name ?? '');
    const [dob, setDob] = useState(patient?.dob ? patient.dob.slice(0, 10) : '');
    const [assignedDoctorId, setAssignedDoctorId] = useState(patient?.assignedDoctorId ?? '');
    const [tags, setTags] = useState(patient?.tags.map((t) => t.tag.name).join(', ') ?? '');
    const [doctors, setDoctors] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        getDoctors().then(setDoctors).catch(() => setError('Could not load doctors list'));
    }, []);
    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
        try {
            if (isEdit && patient) {
                await updatePatient(patient.id, { name, dob: dob || undefined, assignedDoctorId, tags: tagList });
            }
            else {
                await createPatient({ name, dob: dob || undefined, assignedDoctorId, tags: tagList });
            }
            onSaved();
            onClose();
        }
        catch {
            setError('Failed to save patient. Please check your inputs.');
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx("div", { className: "fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 20 }, className: "bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden", children: [_jsxs("div", { className: "px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50", children: [_jsxs("h3", { className: "text-lg font-bold text-slate-900 flex items-center gap-2", children: [isEdit ? _jsx(Edit2, { className: "w-5 h-5 text-blue-600" }) : _jsx(UserPlus, { className: "w-5 h-5 text-blue-600" }), isEdit ? 'Edit Patient Record' : 'Register New Patient'] }), _jsx("button", { onClick: onClose, className: "p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-5", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsxs("label", { className: "text-sm font-semibold text-slate-700 flex items-center gap-2", children: [_jsx(User, { className: "w-4 h-4 text-slate-400" }), "Full Name"] }), _jsx("input", { className: "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. John Doe", required: true })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsxs("label", { className: "text-sm font-semibold text-slate-700 flex items-center gap-2", children: [_jsx(Calendar, { className: "w-4 h-4 text-slate-400" }), "Date of Birth"] }), _jsx("input", { className: "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all", type: "date", value: dob, onChange: (e) => setDob(e.target.value) })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsxs("label", { className: "text-sm font-semibold text-slate-700 flex items-center gap-2", children: [_jsx(Stethoscope, { className: "w-4 h-4 text-slate-400" }), "Assign Doctor"] }), _jsxs("select", { className: "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none", value: assignedDoctorId, onChange: (e) => setAssignedDoctorId(e.target.value), required: true, children: [_jsx("option", { value: "", children: "Select Doctor" }), doctors.map((d) => (_jsx("option", { value: d.id, children: d.name }, d.id)))] })] })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsxs("label", { className: "text-sm font-semibold text-slate-700 flex items-center gap-2", children: [_jsx(Tag, { className: "w-4 h-4 text-slate-400" }), "Condition Tags"] }), _jsx("input", { className: "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400", value: tags, onChange: (e) => setTags(e.target.value), placeholder: "e.g. cardiology, urgent, post-op" }), _jsx("p", { className: "text-[10px] text-slate-400", children: "Separate multiple tags with commas" })] }), error && (_jsxs("div", { className: "flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100", children: [_jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), error] })), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-slate-50", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", disabled: loading, className: "px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-100 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70", children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), "Saving..."] })) : isEdit ? 'Update Record' : 'Register Patient' })] })] })] }) }));
}
