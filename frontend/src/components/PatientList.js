import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, UserPlus, Users, Loader2, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import client from '../api/client';
import PatientCard from './PatientCard';
import SearchBar from './SearchBar';
import PatientFormModal from './PatientFormModal';
import CreateDoctorModal from './CreateDoctorModal';
import { useAuth } from '../context/AuthContext';
export default function PatientList() {
    const { isAdmin } = useAuth();
    const [patients, setPatients] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({ q: '', tags: '', from: '', to: '' });
    const [loading, setLoading] = useState(false);
    const [showCreatePatient, setShowCreatePatient] = useState(false);
    const [showCreateDoctor, setShowCreateDoctor] = useState(false);
    const limit = 10;
    const fetchPatients = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit };
            if (filters.q)
                params['q'] = filters.q;
            if (filters.tags)
                params['tags'] = filters.tags;
            if (filters.from)
                params['from'] = filters.from;
            if (filters.to)
                params['to'] = filters.to;
            const res = await client.get('/patients', { params });
            setPatients(res.data.data);
            setTotal(res.data.total);
        }
        catch (err) {
            console.error('Failed to fetch patients', err);
        }
        finally {
            setLoading(false);
        }
    }, [page, filters]);
    useEffect(() => { fetchPatients(); }, [fetchPatients]);
    function handleSearch(f) {
        setFilters(f);
        setPage(1);
    }
    const totalPages = Math.ceil(total / limit);
    return (_jsxs("div", { className: "flex flex-col space-y-6 px-4 py-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-5 h-5 text-blue-600" }), _jsx("h3", { className: "text-lg font-bold text-slate-900", children: "Patient Directory" }), _jsxs("span", { className: "bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full", children: [total, " Total"] })] }), isAdmin && (_jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: () => setShowCreateDoctor(true), className: "flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm", children: [_jsx(UserPlus, { className: "w-4 h-4" }), "Add Doctor"] }), _jsxs("button", { onClick: () => setShowCreatePatient(true), className: "flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100", children: [_jsx(Plus, { className: "w-4 h-4" }), "Add Patient"] })] }))] }), _jsx("div", { className: "bg-slate-50 p-4 rounded-xl border border-slate-200", children: _jsx(SearchBar, { onSearch: handleSearch }) }), _jsx("div", { className: "min-h-[400px] flex flex-col", children: loading ? (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center py-20 text-slate-400", children: [_jsx(Loader2, { className: "w-10 h-10 animate-spin mb-4" }), _jsx("p", { className: "font-medium", children: "Fetching patient records..." })] })) : patients.length === 0 ? (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-xl border-2 border-dashed border-slate-200", children: [_jsx(Inbox, { className: "w-12 h-12 mb-4 opacity-20" }), _jsx("p", { className: "font-medium text-slate-500 text-lg", children: "No patients found" }), _jsx("p", { className: "text-sm mt-1", children: "Try adjusting your search filters" })] })) : (_jsx("div", { className: "grid grid-cols-1 gap-4", children: _jsx(AnimatePresence, { mode: "popLayout", children: patients.map((p, i) => (_jsx(motion.div, { initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, scale: 0.95 }, transition: { duration: 0.2, delay: i * 0.05 }, children: _jsx(PatientCard, { patient: p, onRefresh: fetchPatients }) }, p.id))) }) })) }), totalPages > 1 && (_jsxs("div", { className: "flex items-center justify-between pt-6 border-t border-slate-100", children: [_jsxs("p", { className: "text-sm text-slate-500", children: ["Showing ", _jsx("span", { className: "font-semibold text-slate-900", children: (page - 1) * limit + 1 }), " to ", _jsx("span", { className: "font-semibold text-slate-900", children: Math.min(page * limit, total) }), " of ", _jsx("span", { className: "font-semibold text-slate-900", children: total }), " results"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { disabled: page === 1, onClick: () => setPage((p) => p - 1), className: "p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors", children: _jsx(ChevronLeft, { className: "w-5 h-5" }) }), _jsx("button", { disabled: page === totalPages, onClick: () => setPage((p) => p + 1), className: "p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors", children: _jsx(ChevronRight, { className: "w-5 h-5" }) })] })] })), showCreatePatient && (_jsx(PatientFormModal, { onClose: () => setShowCreatePatient(false), onSaved: fetchPatients })), showCreateDoctor && (_jsx(CreateDoctorModal, { onClose: () => setShowCreateDoctor(false), onCreated: () => { } }))] }));
}
