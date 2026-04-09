import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, UserPlus, Users, Loader2, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import client from '../api/client';
import PatientCard from './PatientCard';
import SearchBar, { SearchFilters } from './SearchBar';
import PatientFormModal from './PatientFormModal';
import CreateDoctorModal from './CreateDoctorModal';
import { useAuth } from '../context/AuthContext';
import { Patient } from '../api/patients';
import { cn } from '../lib/utils';

interface PaginatedResponse {
  data: Patient[];
  page: number;
  limit: number;
  total: number;
}

export default function PatientList() {
  const { isAdmin } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<SearchFilters>({ q: '', tags: '', from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [showCreatePatient, setShowCreatePatient] = useState(false);
  const [showCreateDoctor, setShowCreateDoctor] = useState(false);
  const limit = 10;

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit };
      if (filters.q) params['q'] = filters.q;
      if (filters.tags) params['tags'] = filters.tags;
      if (filters.from) params['from'] = filters.from;
      if (filters.to) params['to'] = filters.to;

      const res = await client.get<PaginatedResponse>('/patients', { params });
      setPatients(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  function handleSearch(f: SearchFilters) {
    setFilters(f);
    setPage(1);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Patient Directory</h3>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {total} Total
            </span>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2">
            <button 
              onClick={() => setShowCreateDoctor(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Add Doctor
            </button>
            <button 
              onClick={() => setShowCreatePatient(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
            >
              <Plus className="w-4 h-4" />
              Add Patient
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="font-medium">Fetching patient records...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <Inbox className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium text-slate-500 text-lg">No patients found</p>
            <p className="text-sm mt-1">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {patients.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                >
                  <PatientCard patient={p} onRefresh={fetchPatients} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-900">{(page-1)*limit + 1}</span> to <span className="font-semibold text-slate-900">{Math.min(page*limit, total)}</span> of <span className="font-semibold text-slate-900">{total}</span> results
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage((p) => p - 1)}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage((p) => p + 1)}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {showCreatePatient && (
        <PatientFormModal
          onClose={() => setShowCreatePatient(false)}
          onSaved={fetchPatients}
        />
      )}

      {showCreateDoctor && (
        <CreateDoctorModal
          onClose={() => setShowCreateDoctor(false)}
          onCreated={() => {}}
        />
      )}
    </div>
  );
}
