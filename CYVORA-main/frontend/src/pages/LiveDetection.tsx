import React, { useState } from 'react';
import { Zap, RefreshCw, AlertTriangle, Lock, LogIn, CheckCircle2, ShieldAlert } from 'lucide-react';
import { LiveThreatTable } from '../components/monitor/LiveThreatTable';
import { useThreatStream } from '../hooks/useThreatStream';
import { authService } from '../services/authService';

export const LiveDetection: React.FC = () => {
  const {
    events,
    isPaused,
    togglePause,
    filterSeverity,
    setFilterSeverity,
    filterAttack,
    setFilterAttack,
    searchQuery,
    setSearchQuery,
    clearEvents,
    addNewEvent,
    refresh,
    error,
    isAuthRequired,
  } = useThreatStream(25, 3000);

  // Auth form state for when auth is required
  const [email, setEmail] = useState<string>('analyst@cyvora.example');
  const [password, setPassword] = useState<string>('SecurePass123!');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [injecting, setInjecting] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    // Try login first
    let res = await authService.login(email.trim(), password);
    if (!res.success) {
      // If user doesn't exist yet, try registering as analyst
      const reg = await authService.register(email.trim(), password, 'SOC Analyst');
      if (reg.success) {
        res = await authService.login(email.trim(), password);
      }
    }

    if (res.success) {
      setAuthError(null);
      refresh();
    } else {
      setAuthError(res.error || 'Authentication failed. Check credentials.');
    }
    setAuthLoading(false);
  };

  const handleInjectProbe = async () => {
    setInjecting(true);
    await addNewEvent();
    setTimeout(() => setInjecting(false), 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 cyber-glass rounded-xl border border-cyan-500/30 bg-[#070D1D]/90 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono-code text-xs">
            <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 font-bold border border-rose-500/40 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              LIVE SOC STREAM
            </span>
            <span className="text-cyan-400 font-medium">/ Real PostgreSQL Telemetry</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider font-mono-code">
            LIVE NETWORK THREAT MONITOR
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl font-sans">
            Real-time inspection of incoming network flows, automated anomaly scoring, and instant threat triage directly from PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2.5 font-mono-code text-xs">
          <button
            onClick={handleInjectProbe}
            disabled={injecting}
            className="px-3.5 py-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold hover:bg-cyan-900/60 transition-all flex items-center gap-2 disabled:opacity-50"
            title="Execute /predict with real network flow features to persist an event to PostgreSQL"
          >
            <Zap className={`w-4 h-4 text-cyan-400 ${injecting ? 'animate-bounce' : ''}`} />
            <span>{injecting ? 'INJECTING...' : 'INJECT PROBE FLOW'}</span>
          </button>

          <button
            onClick={clearEvents}
            className="px-3.5 py-2 rounded-lg bg-rose-950 border border-rose-500/40 text-rose-300 font-bold hover:bg-rose-900/60 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-rose-400" />
            <span>CLEAR LOG</span>
          </button>
        </div>
      </div>

      {/* Auth Requirement Banner */}
      {isAuthRequired && (
        <div className="p-5 cyber-glass rounded-xl border border-amber-500/40 bg-amber-950/30 text-amber-200 font-mono-code text-xs shadow-xl space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>AUTHENTICATION REQUIRED — POSTGRESQL EVENT STREAM</span>
          </div>
          <p className="text-slate-300 font-sans text-xs">
            The CYVORA backend endpoints <code className="text-cyan-300">/events/recent</code> and <code className="text-cyan-300">/predict</code> require a valid JWT bearer token. Please sign in to stream live persisted telemetry.
          </p>

          <form onSubmit={handleLogin} className="flex flex-wrap items-center gap-3 pt-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@cyvora.example"
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-56 font-mono-code"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44 font-mono-code"
              required
            />
            <button
              type="submit"
              disabled={authLoading}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-black text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{authLoading ? 'AUTHENTICATING...' : 'AUTHENTICATE & STREAM'}</span>
            </button>
          </form>

          {authError && (
            <div className="text-rose-400 text-xs font-semibold flex items-center gap-1.5 mt-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{authError}</span>
            </div>
          )}
        </div>
      )}

      {/* Backend Connection Error Banner */}
      {error && !isAuthRequired && (
        <div className="p-4 cyber-glass rounded-xl border border-rose-500/40 bg-rose-950/30 text-rose-200 font-mono-code text-xs flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-rose-300">STREAM DISCONNECTED:</span>{' '}
              <span className="text-slate-300 font-sans">{error}</span>
            </div>
          </div>
          <button
            onClick={() => refresh()}
            className="px-3 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-500/40 font-bold text-xs whitespace-nowrap"
          >
            RECONNECT
          </button>
        </div>
      )}

      {/* Mini live counter bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-code text-xs">
        <div className="p-3.5 cyber-glass rounded-xl border border-slate-800 bg-[#080E1C]/90 shadow-lg flex items-center justify-between">
          <span className="text-slate-400 font-semibold">BUFFERED EVENTS:</span>
          <span className="font-bold text-white text-sm">{events.length}</span>
        </div>
        <div className="p-3.5 cyber-glass rounded-xl border border-rose-500/30 bg-rose-950/20 shadow-lg flex items-center justify-between">
          <span className="text-rose-400 font-semibold">ACTIVE THREATS:</span>
          <span className="font-bold text-rose-400 text-sm">
            {events.filter((e) => e.isAttack).length}
          </span>
        </div>
        <div className="p-3.5 cyber-glass rounded-xl border border-purple-500/40 bg-purple-950/40 shadow-lg flex items-center justify-between">
          <span className="text-black bg-purple-200 px-2 py-0.5 rounded font-black text-xs border border-purple-400">RARE ATTACKS:</span>
          <span className="font-black text-black bg-purple-200 px-2 py-0.5 rounded text-sm border border-purple-400">
            {events.filter((e) => ['Heartbleed', 'Infiltration', 'Web Attack – Sql Injection', 'Web Attack – XSS', 'Web Attack – Brute Force'].includes(e.prediction)).length}
          </span>
        </div>
        <div className="p-3.5 cyber-glass rounded-xl border border-emerald-500/30 bg-emerald-950/20 shadow-lg flex items-center justify-between">
          <span className="text-emerald-400 font-semibold">BENIGN FLOWS:</span>
          <span className="font-bold text-emerald-400 text-sm">
            {events.filter((e) => !e.isAttack).length}
          </span>
        </div>
      </div>

      {/* Main Full-Featured Live Table */}
      <LiveThreatTable
        events={events}
        isPaused={isPaused}
        onTogglePause={togglePause}
        filterSeverity={filterSeverity}
        onFilterSeverityChange={setFilterSeverity}
        filterAttack={filterAttack}
        onFilterAttackChange={setFilterAttack}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSimulated={false}
      />
    </div>
  );
};

export default LiveDetection;
