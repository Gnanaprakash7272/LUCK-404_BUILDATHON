import React, { useState } from 'react';
import { Shield, ChevronDown, ChevronRight, Zap, AlertTriangle, CheckCircle2, Flame } from 'lucide-react';

interface ThreatCat {
  name: string;
  severity: 'BENIGN' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  count: string;
  desc: string;
  subcategories?: Array<{ name: string; severity: 'HIGH' | 'CRITICAL'; count: string }>;
}

export const ThreatIntelligenceCatalog: React.FC = () => {
  const [expandedWeb, setExpandedWeb] = useState<boolean>(true);

  const categories: ThreatCat[] = [
    { name: 'BENIGN', severity: 'BENIGN', count: '11,558', desc: 'Legitimate encrypted network traffic flows and clean requests.' },
    { name: 'BOT', severity: 'MEDIUM', count: '1,966', desc: 'Automated crawler activity and unauthorized botnet command traffic.' },
    { name: 'DDOS', severity: 'CRITICAL', count: '128,027', desc: 'Distributed denial-of-service volumetric flood vectors.' },
    { name: 'DOS', severity: 'HIGH', count: '252,661', desc: 'Denial of service state exhaustion targeting HTTP and TCP services.' },
    { name: 'PORT SCAN', severity: 'MEDIUM', count: '158,930', desc: 'Reconnaissance port scanning and IP sweep probes.' },
    { name: 'FTP PATATOR', severity: 'HIGH', count: '7,938', desc: 'Dictionary and brute-force password attempts against FTP services.' },
    { name: 'SSH PATATOR', severity: 'HIGH', count: '5,897', desc: 'SSH authentication brute force probes targeting port 22.' },
    { name: 'HEARTBLEED', severity: 'CRITICAL', count: '11', desc: 'OpenSSL TLS Heartbeat extension memory leak exploit vectors.' },
    { name: 'INFILTRATION', severity: 'CRITICAL', count: '36', desc: 'Internal network pivot attempts and malicious binary execution.' },
    {
      name: 'WEB ATTACKS',
      severity: 'CRITICAL',
      count: '2,180',
      desc: 'Layer-7 web application attacks expanding into specialized sub-vectors.',
      subcategories: [
        { name: 'BRUTE FORCE', severity: 'HIGH', count: '1,507' },
        { name: 'SQL INJECTION', severity: 'CRITICAL', count: '21' },
        { name: 'XSS', severity: 'HIGH', count: '652' }
      ]
    }
  ];

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEDIUM':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'LOW':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <section className="space-y-6 font-mono-code">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-wider flex items-center gap-2 uppercase">
            <Shield className="w-5 h-5 text-sky-600" />
            <span>THREAT INTELLIGENCE CATALOG</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            COMPREHENSIVE ATTACK TAXONOMY & SEVERITY CLASSIFICATION MATRIX
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-bold">
            15 TOTAL THREAT CLASSES
          </span>
        </div>
      </div>

      {/* Grid of Threat Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, idx) => {
          const isWeb = cat.name === 'WEB ATTACKS';
          return (
            <div
              key={idx}
              className={`white-card p-4 border bg-white shadow-sm ${
                isWeb ? 'border-purple-200 bg-purple-50/20 md:col-span-2 lg:col-span-3' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isWeb ? (
                    <Flame className="w-4 h-4 text-purple-600" />
                  ) : cat.severity === 'CRITICAL' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  ) : cat.severity === 'BENIGN' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Zap className="w-4 h-4 text-amber-600" />
                  )}
                  <span className="font-bold text-slate-900 tracking-wider">{cat.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600">{cat.count} SAMPLES</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getSeverityBadge(cat.severity)}`}>
                    {cat.severity}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                {cat.desc}
              </p>

              {/* Subcategories Expansion for Web Attacks */}
              {isWeb && cat.subcategories && (
                <div className="mt-4 pt-3 border-t border-purple-200 space-y-2">
                  <div
                    onClick={() => setExpandedWeb(!expandedWeb)}
                    className="flex items-center justify-between cursor-pointer text-xs text-purple-800 font-bold hover:text-purple-900"
                  >
                    <span className="flex items-center gap-1.5 uppercase">
                      SPECIALIZED WEB THREAT SUB-CATEGORIES ({cat.subcategories.length})
                    </span>
                    {expandedWeb ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>

                  {expandedWeb && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {cat.subcategories.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-3 rounded-lg bg-white border border-purple-200 text-xs space-y-1 shadow-sm"
                        >
                          <div className="flex justify-between items-center font-bold text-slate-900">
                            <span>{sub.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border ${getSeverityBadge(sub.severity)}`}>
                              {sub.severity}
                            </span>
                          </div>
                          <div className="text-[11px] text-purple-700 font-semibold">
                            {sub.count} DETECTIONS
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
