import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, Stethoscope, Tag, Loader2, AlertCircle, Edit2, UserPlus } from 'lucide-react';
import { getDoctors, Doctor } from '../api/doctors';
import { createPatient, updatePatient, Patient } from '../api/patients';
import { cn } from '../lib/utils';

interface Props {
  patient?: Patient;
  onClose: () => void;
  onSaved: () => void;
}

export default function PatientFormModal({ patient, onClose, onSaved }: Props) {
  const isEdit = !!patient;

  const [name, setName] = useState(patient?.name ?? '');
  const [dob, setDob] = useState(patient?.dob ? patient.dob.slice(0, 10) : '');
  const [assignedDoctorId, setAssignedDoctorId] = useState(patient?.assignedDoctorId ?? '');
  const [tags, setTags] = useState(patient?.tags.map((t) => t.tag.name).join(', ') ?? '');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDoctors().then(setDoctors).catch(() => setError('Could not load doctors list'));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      if (isEdit && patient) {
        await updatePatient(patient.id, { name, dob: dob || undefined, assignedDoctorId, tags: tagList });
      } else {
        await createPatient({ name, dob: dob || undefined, assignedDoctorId, tags: tagList });
      }
      onSaved();
      onClose();
    } catch {
      setError('Failed to save patient. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            {isEdit ? <Edit2 className="w-5 h-5 text-blue-600" /> : <UserPlus className="w-5 h-5 text-blue-600" />}
            {isEdit ? 'Edit Patient Record' : 'Register New Patient'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Full Name
            </label>
            <input 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. John Doe"
              required 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                Date of Birth
              </label>
              <input 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                type="date" 
                value={dob} 
                onChange={(e) => setDob(e.target.value)} 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-slate-400" />
                Assign Doctor
              </label>
              <select
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                value={assignedDoctorId}
                onChange={(e) => setAssignedDoctorId(e.target.value)}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" />
              Condition Tags
            </label>
            <input 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
              value={tags} 
              onChange={(e) => setTags(e.target.value)} 
              placeholder="e.g. cardiology, urgent, post-op" 
            />
            <p className="text-[10px] text-slate-400">Separate multiple tags with commas</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-100 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? 'Update Record' : 'Register Patient'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
