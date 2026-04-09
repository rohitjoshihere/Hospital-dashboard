import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { createDoctor } from '../api/doctors';
export default function CreateDoctorModal({ onClose, onCreated }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await createDoctor({ name, email, password });
            onCreated();
            onClose();
        }
        catch {
            setError('Failed to create doctor account. The email might already be in use.');
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx("div", { className: "fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.95, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.95, y: 20 }, className: "bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden", children: [_jsxs("div", { className: "px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50", children: [_jsxs("h3", { className: "text-lg font-bold text-slate-900 flex items-center gap-2", children: [_jsx(UserPlus, { className: "w-5 h-5 text-blue-600" }), "Create Doctor Profile"] }), _jsx("button", { onClick: onClose, className: "p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-5", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsxs("label", { className: "text-sm font-semibold text-slate-700 flex items-center gap-2", children: [_jsx(UserPlus, { className: "w-4 h-4 text-slate-400" }), "Full Name"] }), _jsx("input", { className: "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400", value: name, onChange: (e) => setName(e.target.value), placeholder: "Dr. Jane Smith", required: true })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsxs("label", { className: "text-sm font-semibold text-slate-700 flex items-center gap-2", children: [_jsx(Mail, { className: "w-4 h-4 text-slate-400" }), "Email Address"] }), _jsx("input", { className: "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "jane.smith@hospital.com", required: true })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsxs("label", { className: "text-sm font-semibold text-slate-700 flex items-center gap-2", children: [_jsx(Lock, { className: "w-4 h-4 text-slate-400" }), "Password"] }), _jsx("input", { className: "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, minLength: 8 }), _jsx("p", { className: "text-[10px] text-slate-400", children: "Must be at least 8 characters long" })] }), error && (_jsxs("div", { className: "flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100", children: [_jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), error] })), _jsxs("div", { className: "flex justify-end gap-3 pt-4 border-t border-slate-50", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", disabled: loading, className: "px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-100 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70", children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), "Creating..."] })) : 'Create Doctor' })] })] })] }) }));
}
