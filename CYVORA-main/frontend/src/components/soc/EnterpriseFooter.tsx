import React from 'react';
import { Shield } from 'lucide-react';

export const EnterpriseFooter: React.FC = () => {
  return (
    <footer className="white-card rounded-2xl border border-slate-200 bg-white p-8 shadow-sm font-mono-code space-y-8 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Brand & Description */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo-transparent.png"
              alt="CYVORA Logo"
              className="w-9 h-9 object-contain drop-shadow-sm flex-shrink-0"
            />
            <h3 className="text-xl font-bold text-slate-900 tracking-widest uppercase">
              CYVORA
            </h3>
          </div>

          <p className="text-xs text-slate-600 font-sans leading-relaxed max-w-sm">
            AI-Powered Autonomous Cyber Threat Detection & Real-Time Intelligence Platform. Engineered for next-generation SOC operations.
          </p>

          <div className="text-[11px] text-sky-700 font-bold tracking-wider pt-1">
            "Built for the next generation of cybersecurity."
          </div>
        </div>

        {/* Links Grid */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
          <div className="space-y-2">
            <h4 className="text-slate-900 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1">
              PLATFORM
            </h4>
            <ul className="space-y-1.5 text-slate-600 font-sans">
              <li className="hover:text-sky-600 cursor-pointer">Live Detection</li>
              <li className="hover:text-sky-600 cursor-pointer">AI Prediction Engine</li>
              <li className="hover:text-sky-600 cursor-pointer">Network Topology</li>
              <li className="hover:text-sky-600 cursor-pointer">Alert Management</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-slate-900 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1">
              TECHNOLOGY
            </h4>
            <ul className="space-y-1.5 text-slate-600 font-sans">
              <li className="hover:text-sky-600 cursor-pointer">Random Forest + Extra Trees</li>
              <li className="hover:text-sky-600 cursor-pointer">Web Specialist Model</li>
              <li className="hover:text-sky-600 cursor-pointer">Confidence Gating</li>
              <li className="hover:text-sky-600 cursor-pointer">CICIDS-2017 Dataset</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-slate-900 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1">
              DOCUMENTATION
            </h4>
            <ul className="space-y-1.5 text-slate-600 font-sans">
              <li className="hover:text-sky-600 cursor-pointer">API Reference</li>
              <li className="hover:text-sky-600 cursor-pointer">Model Evolution</li>
              <li className="hover:text-sky-600 cursor-pointer">Security Audits</li>
              <li className="hover:text-sky-600 cursor-pointer">System Health</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex flex-wrap justify-between items-center text-[10px] text-slate-500 gap-4">
        <div>
          <span>© 2026 CYVORA INTELLIGENCE PLATFORM. ALL RIGHTS RESERVED.</span>
        </div>
        <div className="flex items-center gap-4">
          <span>MODEL: V21.1 ENSEMBLE</span>
          <span>LATENCY: 0.2ms</span>
          <span className="text-emerald-700 font-bold">STATUS: OPERATIONAL</span>
        </div>
      </div>
    </footer>
  );
};
