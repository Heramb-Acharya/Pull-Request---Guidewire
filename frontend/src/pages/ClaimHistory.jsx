import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Clock, CloudRain, Wind, Newspaper, CheckCircle, ChevronDown, ChevronUp, AlertCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TRIGGER_ICONS = {
  extreme_weather: { icon: CloudRain, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Extreme Weather' },
  poor_aqi:        { icon: Wind,      color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Poor AQI' },
  civic_disruption:{ icon: Newspaper, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Civic Disruption' },
  manual_request:  { icon: Clock,     color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Manual Request' },
};

function ClaimCard({ claim }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const trigger = claim.trigger_type?.[0] || 'extreme_weather';
  const meta = TRIGGER_ICONS[trigger] || TRIGGER_ICONS.extreme_weather;
  const Icon = meta.icon;

  const StatusIcon = claim.status === 'approved' ? CheckCircle 
                   : claim.status === 'rejected' ? XCircle 
                   : AlertCircle;
                   
  const statusColor = claim.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : claim.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30';

  const statusLabel = claim.status === 'approved' ? t('claims.approved') || 'Approved'
                    : claim.status === 'rejected' ? 'Rejected'
                    : 'Under Review';

  return (
    <div className="card hover:border-primary/20 transition-colors animate-fade-in">
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 ${meta.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${meta.color}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-slate-200">{meta.label}</span>
            {claim.trigger_type?.length > 1 && (
              <span className="text-xs text-muted">+{claim.trigger_type.length - 1} more</span>
            )}
            <span className={`badge ml-auto border ${statusColor}`}>
              <StatusIcon className="w-3 h-3" /> {statusLabel}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(claim.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span>Claim #{claim.id}</span>
            <span>{claim.city || 'Unknown'}</span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <div className={`text-xl font-black ${claim.final_payout > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
            ₹{claim.final_payout?.toLocaleString()}
          </div>
          <div className="text-xs text-muted mt-0.5">{claim.plan || 'basic'} plan</div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:text-primary-light mt-1 flex items-center gap-0.5 ml-auto"
          >
            {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Less</> : <><ChevronDown className="w-3.5 h-3.5" /> {t('claims.btn_details')}</>}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-border animate-fade-in">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* K-factors */}
            <div>
              <div className="text-xs text-muted uppercase tracking-wider mb-2 font-semibold">K-Factor Breakdown</div>
              <div className="space-y-2 bg-bg/40 border border-border rounded-xl p-3 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-blue-400">K_event</span>
                  <span className="text-slate-300">{claim.k_event || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-400">K_severity</span>
                  <span className="text-slate-300">{claim.k_severity || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400">K_trust</span>
                  <span className="text-slate-300">{claim.k_trust || '-'}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="text-muted">Base coverage</span>
                  <span className="text-slate-300">₹{(claim.base_coverage || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-emerald-400">Final payout</span>
                  <span className="text-emerald-400">₹{(claim.final_payout || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div>
              <div className="text-xs text-muted uppercase tracking-wider mb-2 font-semibold">Conditions at Trigger</div>
              <div className="bg-bg/40 border border-border rounded-xl p-3 text-xs space-y-1.5 text-slate-400">
                {claim.conditions?.weather ? (
                  <div>🌦 Weather: <span className="text-slate-300">{claim.conditions.weather.condition}</span>
                    {claim.conditions.weather.rainfall > 0 && <span className="text-slate-300"> · {claim.conditions.weather.rainfall}mm rain</span>}
                  </div>
                ) : claim.conditions?.aqi?.value ? (
                  <div>💨 AQI: <span className="text-slate-300">{claim.conditions.aqi.value} ({claim.conditions.aqi.status})</span></div>
                ) : claim.conditions?.news?.keywords_found?.length > 0 ? (
                  <div>📰 Keywords: <span className="text-red-400">{claim.conditions.news.keywords_found.join(', ')}</span></div>
                ) : (
                  <div>No automated conditions detected (Manual Request)</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClaimHistory() {
  const { claims, loading } = useAuth();
  const { t } = useTranslation();

  const totalPaid = claims.reduce((sum, c) => sum + (c.final_payout || 0), 0);
  const approvedClaims = claims.filter(c => c.status === 'approved').length;
  const approvalRate = claims.length > 0 ? Math.round((approvedClaims / claims.length) * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-bg grid-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">{t('claims.title')}</h1>
          <p className="text-muted text-sm">{t('claims.subtitle')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card text-center !py-4">
            <div className="stat-value">{claims.length}</div>
            <div className="stat-label mt-1">{t('claims.total_claims')}</div>
          </div>
          <div className="card text-center !py-4">
            <div className="stat-value text-emerald-400">₹{totalPaid.toLocaleString()}</div>
            <div className="stat-label mt-1">{t('claims.total_paid')}</div>
          </div>
          <div className="card text-center !py-4">
            <div className="stat-value text-amber-400">{approvalRate}%</div>
            <div className="stat-label mt-1">{t('claims.approval_rate')}</div>
          </div>
        </div>

        {/* Claims List */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="card h-24 animate-pulse bg-border/30" />
            ))}
          </div>
        ) : claims.length === 0 ? (
          <div className="card text-center py-16">
            <Clock className="w-12 h-12 text-muted mx-auto mb-4" />
            <div className="font-semibold text-slate-300 mb-2">No claims yet</div>
            <div className="text-sm text-muted">Claims are auto-generated when zone disruptions are detected</div>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim, index) => (
              <ClaimCard key={claim.id || index} claim={claim} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
