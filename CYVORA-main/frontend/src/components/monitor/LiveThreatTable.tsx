import React, { useState } from 'react';
import {
  Play,
  Pause,
  Search,
  Eye,
  Shield,
  ShieldAlert,
  Download,
  Filter
} from 'lucide-react';
import { ThreatEvent } from '../../types/threat';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EventDetailModal } from './EventDetailModal';
import { formatPercent } from '../../utils/formatters';
import { CYVORA_ATTACK_CLASSES } from '../../data/attackClasses';

interface Props {
  events: ThreatEvent[];
  isPaused: boolean;
  onTogglePause: () => void;
  filterSeverity: string;
  onFilterSeverityChange: (sev: string) => void;
  filterAttack: string;
  onFilterAttackChange: (atk: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSimulated?: boolean;
}

export const LiveThreatTable: React.FC<Props> = ({
  events,
  isPaused,
  onTogglePause,
  filterSeverity,
  onFilterSeverityChange,
  filterAttack,
  onFilterAttackChange,
  searchQuery,
  onSearchChange,
  isSimulated = true,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<ThreatEvent | null>(null);

  const exportCsv = () => {
    if (!events.length) return;
    const headers = ['Time', 'Source IP', 'Destination IP', 'Port', 'Protocol', 'Prediction', 'Confidence', 'Anomaly Score', 'Novelty Label', 'Risk Score', 'Risk Level', 'Severity', 'Status'];
    const rows = events.map((e) => [
      e.timestamp,
      e.sourceIp,
      e.destinationIp,
      e.port,
      e.protocol,
      e.prediction,
      e.confidence,
      e.anomalyScore !== undefined ? e.anomalyScore : '',
      e.noveltyLabel || '',
      e.riskScore !== undefined ? e.riskScore : '',
      e.riskLevel || '',
      e.severity,
      e.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cyvora_threat_events_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-4 font-mono-code">
      {/* Control & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 cyber-glass rounded-xl border border-cyan-500/30 bg-[#070D1D]/95 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Stream Status / Live Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="relative flex h-2.5 w-2.5">
              {!isPaused && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isPaused ? 'bg-amber-400' : 'bg-cyan-400'
                }`}
              />
            </span>
            <span className="text-xs font-bold text-white uppercase">
              {isPaused ? 'Stream Paused' : 'Live Telemetry'}
            </span>
          </div>

          <button
            onClick={onTogglePause}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-1.5"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-cyan-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isPaused ? 'RESUME STREAM' : 'PAUSE STREAM'}</span>
          </button>

          {isSimulated ? (
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
              SIMULATED SOC FEED
            </span>
          ) : (
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              POSTGRESQL PERSISTED FEED
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search IP, Port, Attack..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44 sm:w-56 font-mono-code"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => onFilterSeverityChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono-code"
          >
            <option value="ALL">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {/* Attack Type Filter */}
          <select
            value={filterAttack}
            onChange={(e) => onFilterAttackChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono-code max-w-[150px] truncate"
          >
            <option value="ALL">All Attack Classes</option>
            {CYVORA_ATTACK_CLASSES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={exportCsv}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      {/* Threat Event Table */}
      <div className="cyber-glass rounded-xl border border-cyan-500/20 bg-[#070D1B]/95 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-cyan-500/40 bg-slate-950 text-cyan-300 tracking-wider uppercase text-xs font-black">
                <th className="py-3.5 px-4 text-cyan-300">Time</th>
                <th className="py-3.5 px-4 text-cyan-300">Source IP</th>
                <th className="py-3.5 px-4 text-cyan-300">Destination IP</th>
                <th className="py-3.5 px-4 text-cyan-300">Port</th>
                <th className="py-3.5 px-4 text-cyan-300">Protocol</th>
                <th className="py-3.5 px-4 text-cyan-300">AI Prediction</th>
                <th className="py-3.5 px-4 text-cyan-300">Confidence</th>
                <th className="py-3.5 px-4 text-cyan-300">Anomaly</th>
                <th className="py-3.5 px-4 text-cyan-300">Risk</th>
                <th className="py-3.5 px-4 text-cyan-300">Severity</th>
                <th className="py-3.5 px-4 text-cyan-300">Status</th>
                <th className="py-3.5 px-4 text-cyan-300 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Shield className="w-6 h-6 text-slate-600" />
                      <span className="font-bold text-slate-300 text-xs">No persisted security events in PostgreSQL database.</span>
                      <span className="text-[11px] text-slate-500">Trigger /predict or click "INJECT PROBE FLOW" above to generate genuine telemetry.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                events.map((event) => {
                  const isBenign = event.prediction.toUpperCase() === 'BENIGN';
                  return (
                    <tr
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="hover:bg-cyan-950/20 cursor-pointer transition-colors duration-150 group"
                    >
                      <td className="py-3 px-4 text-cyan-400 font-bold whitespace-nowrap">{event.timestamp}</td>
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{event.sourceIp}</td>
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{event.destinationIp}</td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{event.port}</td>
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">
                          {event.protocol}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          {isBenign ? (
                            <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                          )}
                          <span>{event.prediction}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-emerald-400 whitespace-nowrap font-bold">
                        {formatPercent(event.confidence)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {event.anomalyScore !== undefined ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                event.noveltyLabel === 'UNKNOWN_ANOMALOUS'
                                  ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                                  : event.isAnomalous
                                  ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                                  : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              }`}
                            >
                              {event.noveltyLabel === 'UNKNOWN_ANOMALOUS'
                                ? 'NOVEL'
                                : event.isAnomalous
                                ? 'ANOMALOUS'
                                : 'NORMAL'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {(event.anomalyScore * 100).toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[10px] italic">UNAVAILABLE</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {event.riskScore !== undefined ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                event.riskLevel === 'CRITICAL'
                                  ? 'bg-rose-950 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                                  : event.riskLevel === 'HIGH'
                                  ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                                  : event.riskLevel === 'MEDIUM'
                                  ? 'bg-sky-950 text-sky-300 border-sky-500/40'
                                  : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              }`}
                            >
                              {event.riskLevel || 'LOW'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {(event.riskScore * 100).toFixed(0)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[10px] italic">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            event.severity === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-400 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                              : event.severity === 'HIGH'
                              ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                              : 'bg-sky-950 text-sky-400 border-sky-500/40'
                          }`}
                        >
                          {event.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                            event.status === 'BLOCKED'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                              : event.status === 'ACTIVE'
                              ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition-colors"
                          title="Inspect Telemetry"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector Modal */}
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};
