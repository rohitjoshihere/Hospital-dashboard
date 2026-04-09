import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await client.post('/auth/login', { email, password });
            login(res.data.token, res.data.user);
            navigate('/');
        }
        catch {
            setError('Invalid email or password');
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx("div", { className: "flex items-center justify-center min-h-screen bg-slate-50 px-4", children: _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "w-full max-w-md", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl border border-slate-200 p-8", children: [_jsxs("div", { className: "flex flex-col items-center mb-8", children: [_jsx("div", { className: "w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200", children: _jsx(LayoutDashboard, { className: "text-white w-6 h-6" }) }), _jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Welcome Back" }), _jsx("p", { className: "text-slate-500 text-sm mt-1", children: "Sign in to your medical dashboard" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-sm font-semibold text-slate-700 flex items-center gap-2", children: [_jsx(Mail, { className: "w-4 h-4 text-slate-400" }), "Email Address"] }), _jsx("input", { className: "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-slate-900", type: "email", placeholder: "doctor@hospital.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, autoFocus: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("label", { className: "text-sm font-semibold text-slate-700 flex items-center gap-2", children: [_jsx(Lock, { className: "w-4 h-4 text-slate-400" }), "Password"] }), _jsx("input", { className: "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-slate-900", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: (e) => setPassword(e.target.value), required: true })] }), error && (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), error] })), _jsx("button", { className: cn("w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-[0.98]", loading && "opacity-70 cursor-not-allowed"), type: "submit", disabled: loading, children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-5 h-5 animate-spin" }), "Signing in..."] })) : ('Sign In') })] }), _jsx("div", { className: "mt-8 pt-6 border-t border-slate-100 text-center", children: _jsx("p", { className: "text-xs text-slate-400", children: "Authorized personnel only. All access is logged." }) })] }) }) }));
}
