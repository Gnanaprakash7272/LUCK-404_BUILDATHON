import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { CYVORA_ATTACK_CLASSES } from '../data/attackClasses';
import { Badge } from '../components/common/Badge';

export const AttackIntelligence: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Benign', 'Exploit / Infiltration', 'Web Attack', 'Denial of Service', 'Brute Force', 'Reconnaissance', 'Botnet'];

  const filtered = CYVORA_ATTACK_CLASSES.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.mitreId.toLowerCase().includes(q) ||
        item.mitreTactic.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5 font-mono-code text-xs">
          <span className="p-1 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
            ATTACK ENCYCLOPEDIA
          </span>
          <span className="text-slate-500 font-medium">/ MITRE ATT&CK Matrix Alignment</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight font-mono-code">
          CYVORA ATTACK INTELLIGENCE DIRECTORY
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl font-medium">
          Comprehensive threat intelligence, signature fingerprints, and MITRE mapping for all 15 evaluated CYVORA intrusion categories.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-sky-50 text-sky-700 border border-sky-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search attack or MITRE ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 w-64 font-mono-code shadow-sm"
          />
        </div>
      </div>

      {/* Grid of 15 Attack Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.name}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-sky-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 font-mono-code">{item.name}</h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block mt-0.5">{item.category}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Badge variant="severity" severity={item.severity}>
                    {item.severity}
                  </Badge>
                  {item.isRare && <Badge variant="rare">RARE</Badge>}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed my-3 font-medium">{item.description}</p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs font-mono-code">
              <div className="flex items-center justify-between text-slate-600">
                <span>MITRE Tactic:</span>
                <span className="text-slate-900 font-semibold">{item.mitreTactic}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>MITRE ID:</span>
                <span className="text-purple-700 font-bold">{item.mitreId}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Typical Ports:</span>
                <span className="text-sky-700 font-bold">{item.typicalPorts.join(', ')}</span>
              </div>

              {item.indicators && (
                <div className="pt-1.5">
                  <span className="text-[10px] text-slate-500 font-semibold block mb-1">Key Heuristics:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.indicators.map((ind, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
