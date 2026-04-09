import { useState, FormEvent } from 'react';
import { Search, RotateCcw, Filter, Calendar as CalendarIcon, Tag as TagIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export interface SearchFilters {
  q: string;
  tags: string;
  from: string;
  to: string;
}

interface Props {
  onSearch: (filters: SearchFilters) => void;
}

export default function SearchBar({ onSearch }: Props) {
  const [q, setQ] = useState('');
  const [tags, setTags] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch({ q, tags, from, to });
  }

  function handleReset() {
    setQ(''); 
    setTags(''); 
    setFrom(''); 
    setTo('');
    onSearch({ q: '', tags: '', from: '', to: '' });
  }

  const activeFiltersCount = [tags, from, to].filter(Boolean).length;

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            placeholder="Search by patient name..." 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
          />
        </div>

        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-all relative",
              showFilters || activeFiltersCount > 0
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button 
            className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all shadow-sm active:scale-95" 
            type="submit"
          >
            Search
          </button>

          <button 
            type="button" 
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </form>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-inner-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <TagIcon className="w-3 h-3" />
              Tags
            </label>
            <input 
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500/30"
              placeholder="e.g. cardiac, urgent" 
              value={tags} 
              onChange={(e) => setTags(e.target.value)} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3" />
              From Date
            </label>
            <input 
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500/30"
              type="date" 
              value={from} 
              onChange={(e) => setFrom(e.target.value)} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3" />
              To Date
            </label>
            <input 
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500/30"
              type="date" 
              value={to} 
              onChange={(e) => setTo(e.target.value)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
