import React from 'react';
import { X, ShieldAlert, ArrowRight, Network, ShieldCheck } from 'lucide-react';
import { ThreatEvent } from '../../types/threat';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { getAttackInfo } from '../../data/attackClasses';
import { formatBytes, formatDuration, formatPercent } from '../../utils/formatters';

interface Props {
  event: ThreatEvent | null;
  onClose: () => void;
}

export const EventDetailModal: React.FC<Props> = ({ event, onClose }) => {
  if (!event) return null;

  const attackInfo = getAttackInfo(event.prediction);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="cyber-glass rounded-2xl border border-cyan-500/30 bg-[#070D1D]/95 w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#050A14]">
          <div className="flex items-center gap-3 font-mono-code">
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-500/40">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{event.prediction}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950 text-rose-300 border border-rose-500/40">
                  {event.severity}
                </span>
                {event.riskLevel && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    event.riskLevel === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                      : event.riskLevel === 'HIGH'
                      ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                      : event.riskLevel === 'MEDIUM'
                      ? 'bg-sky-950 text-sky-300 border-sky-500/40'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                  }`}>
                    RISK: {event.riskLevel}
                  </span>
                )}
                {event.noveltyLabel === 'UNKNOWN_ANOMALOUS' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-400 text-black border border-amber-300 animate-pulse">
                    NOVEL / UNKNOWN
                  </span>
                )}
                {attackInfo.isRare && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-200 text-black border border-purple-400">
                    RARE ATTACK
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Event ID: {event.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto font-mono-code text-xs">
          {/* Flow Connection Visualizer */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/20">
            <div className="text-[11px] uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5 font-bold">
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              FLOW TELEMETRY ROUTE
            </div>
            <div className="flex items-center justify-between gap-2 p-3 bg-slate-900/90 rounded-lg border border-slate-800">
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-semibold">SOURCE HOST</div>
                <div className="font-bold text-cyan-400 text-sm mt-0.5">{event.sourceIp}</div>
              </div>

              <div className="flex flex-col items-center px-4">
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 mb-1 font-bold">
                  {event.protocol} / Port {event.port}
                </span>
                <ArrowRight className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-semibold">DESTINATION TARGET</div>
                <div className="font-bold text-emerald-400 text-sm mt-0.5">{event.destinationIp}</div>
              </div>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">AI CONFIDENCE</span>
              <span className="text-base font-bold text-cyan-400 mt-1 block">
                {formatPercent(event.confidence)}
              </span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">ANOMALY SCORE</span>
              <span className={`text-base font-bold mt-1 block ${
                event.anomalyScore !== undefined
                  ? (event.anomalyScore >= 0.6 ? 'text-amber-400' : event.anomalyScore >= 0.5 ? 'text-rose-400' : 'text-emerald-400')
                  : 'text-slate-500'
              }`}>
                {event.anomalyScore !== undefined ? formatPercent(event.anomalyScore) : 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">RISK SCORE</span>
              <span className={`text-base font-bold mt-1 block ${
                event.riskScore !== undefined
                  ? (event.riskScore >= 0.85 ? 'text-rose-400' : event.riskScore >= 0.60 ? 'text-amber-400' : event.riskScore >= 0.30 ? 'text-sky-400' : 'text-emerald-400')
                  : 'text-slate-500'
              }`}>
                {event.riskScore !== undefined ? `${(event.riskScore * 100).toFixed(0)}%` : 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">FLOW DURATION</span>
              <span className="text-base font-bold text-white mt-1 block">
                {formatDuration(event.flowDurationUs)}
              </span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">PACKET COUNT</span>
              <span className="text-base font-bold text-white mt-1 block">{event.packetCount} pkts</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">FLOW VOLUME</span>
              <span className="text-base font-bold text-white mt-1 block">
                {formatBytes(event.byteCount)}
              </span>
            </div>
          </div>

          {/* Response & Enforcement Verification */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Defensive Action & Response Verification
              </span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded font-bold border ${
                event.verificationStatus === 'VERIFIED'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : event.verificationStatus === 'FAILED'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}>
                {event.verificationStatus === 'VERIFIED'
                  ? 'VERIFIED'
                  : event.verificationStatus === 'FAILED'
                  ? 'VERIFICATION FAILED'
                  : 'NOT APPLICABLE'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">ACTION</span>
                <span className="font-bold text-white mt-0.5 block">{event.responseAction || 'ALLOW'}</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">STATUS</span>
                <span className="font-bold text-cyan-400 mt-0.5 block">{event.responseStatus || 'ENFORCED'}</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 col-span-2">
                <span className="text-[10px] text-slate-400 block font-semibold">EVIDENCE</span>
                <span className="text-xs text-slate-300 mt-0.5 block truncate" title={event.verificationEvidence}>
                  {event.verificationEvidence || (event.responseAction === 'BLOCK' ? 'Source present in active blocked state' : 'Permitted under baseline traffic policy')}
                </span>
              </div>
            </div>
          </div>

          {/* Threat Intelligence / MITRE Mapping */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                THREAT INTELLIGENCE DOSSIER
              </span>
              <span className="text-[11px] text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/40 font-bold">
                MITRE {attackInfo.mitreId}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{attackInfo.description}</p>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">MITRE ATT&CK Tactic:</span>
                <span className="font-semibold text-white">{attackInfo.mitreTactic}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Attack Category:</span>
                <span className="font-semibold text-white">{attackInfo.category}</span>
              </div>
            </div>

            {attackInfo.indicators && attackInfo.indicators.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 block mb-1.5 font-semibold">Observed Heuristic Indicators:</span>
                <div className="flex flex-wrap gap-1.5">
                  {attackInfo.indicators.map((ind, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#050A14] font-mono-code">
          <div className="text-xs text-slate-400">
            Timestamp: <span className="text-cyan-400 font-bold">{event.timestamp}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-800"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
