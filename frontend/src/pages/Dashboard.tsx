import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, Activity, Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PatientList from '../components/PatientList';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-100">
            <Activity className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-slate-900 hidden sm:block">MedCore Dashboard</h1>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patients, records..."
              className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-1"></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name}</p>
              <p className="text-xs text-slate-500 mt-1 capitalize">{user?.role.toLowerCase()}</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
              <User className="text-slate-500 w-6 h-6" />
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto py-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Patient Overview</h2>
              <p className="text-slate-500 mt-1">Manage and track your patient records efficiently.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                Export Data
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">
                + New Patient
              </button>
            </div>
          </div>

          {/* Stats Section Placeholder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Patients', value: '1,284', change: '+12%', color: 'blue' },
              { label: 'Appointments', value: '42', change: 'Today', color: 'green' },
              { label: 'Pending Reports', value: '18', change: '-4', color: 'amber' },
              { label: 'Patient Satisfaction', value: '98%', change: '+2%', color: 'purple' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className="flex items-baseline justify-between mt-2">
                  <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    stat.change.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-slate-500 bg-slate-100'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <PatientList />
          </div>
        </motion.div>
      </main>
      
      <footer className="py-6 px-6 border-t border-slate-200 bg-white text-center text-slate-400 text-sm">
        © 2024 MedCore Health Systems. All rights reserved.
      </footer>
    </div>
  );
}
