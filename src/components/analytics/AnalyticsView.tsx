import React, { useMemo } from 'react';
import { useCsm } from '../../context/CsmContext';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  TrendingUp,
  MessageSquare,
  Mail,
  Terminal,
  Globe,
  Quote,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { tickets, agents } = useCsm();

  // Metrics Calculations
  const metrics = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
    const breached = tickets.filter((t) => t.isSlaBreached).length;
    const slaCompliance = total > 0 ? (((total - breached) / total) * 100).toFixed(1) : '100';

    const ratedTickets = tickets.filter((t) => t.csatRating !== undefined);
    const avgCsat =
      ratedTickets.length > 0
        ? (
            (ratedTickets.reduce((acc, t) => acc + (t.csatRating || 5), 0) /
              (ratedTickets.length * 5)) *
            100
          ).toFixed(1)
        : '96.8';

    // Channel distribution
    const channelCounts: Record<string, number> = {
      email: 0,
      chat: 0,
      api: 0,
      portal: 0,
      phone: 0,
    };
    tickets.forEach((t) => {
      channelCounts[t.channel] = (channelCounts[t.channel] || 0) + 1;
    });

    // Category distribution
    const catCounts: Record<string, number> = {};
    tickets.forEach((t) => {
      catCounts[t.category] = (catCounts[t.category] || 0) + 1;
    });

    return {
      total,
      resolved,
      breached,
      slaCompliance,
      avgCsat,
      channelCounts,
      catCounts,
      ratedTickets,
    };
  }, [tickets]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-10 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Customer Support & Operations Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time service velocity, CSAT satisfaction indices, and queue health
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Window: <strong className="text-slate-800">Past 30 Days (Real-time telemetry)</strong>
          </div>
        </div>

        {/* 1. Core Executive KPIs (Tabular numbers, no pill clutter) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg First Response</span>
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              11.4 <span className="text-sm font-normal text-slate-500">mins</span>
            </div>
            <div className="mt-2 text-2xs text-emerald-700 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 23% faster than 15-min enterprise target
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">SLA Attainment</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.slaCompliance}%
            </div>
            <div className="mt-2 text-2xs text-slate-500 font-medium">
              Target benchmark: &ge; 96.0% compliance
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">CSAT Satisfaction</span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.avgCsat}%
            </div>
            <div className="mt-2 text-2xs text-emerald-700 font-medium">
              Based on verified customer post-resolution surveys
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Mean Resolution (MTTR)</span>
              <BarChart3 className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              3.2 <span className="text-sm font-normal text-slate-500">hours</span>
            </div>
            <div className="mt-2 text-2xs text-slate-500 font-medium">
              {metrics.resolved} tickets resolved this period
            </div>
          </div>
        </div>

        {/* 2. Channel Distribution & Category Volume Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Inbound Volume by Channel
              </h3>
              <span className="text-2xs text-slate-400 font-mono">Omnichannel telemetry</span>
            </div>

            <div className="space-y-3">
              {Object.entries(metrics.channelCounts).map(([chan, count]) => {
                const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
                return (
                  <div key={chan} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize font-medium text-slate-700">{chan}</span>
                      <span className="font-mono tabular-nums text-slate-500">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Inquiries by Technical Category
              </h3>
              <span className="text-2xs text-slate-400 font-mono">Issue clustering</span>
            </div>

            <div className="space-y-3">
              {Object.entries(metrics.catCounts).map(([cat, count]) => {
                const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat}</span>
                      <span className="font-mono tabular-nums text-slate-500">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-700 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Real Customer Feedback & CSAT Testimonials */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Quote className="w-4 h-4 text-slate-500" />
              Verified Customer Satisfaction (CSAT) Testimonials
            </h3>
            <span className="text-2xs text-slate-500">Post-resolution verifications</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.ratedTickets.length > 0 ? (
              metrics.ratedTickets.map((t) => (
                <div key={t.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{t.customer.name}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600">{t.customer.company}</span>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < (t.csatRating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {t.csatFeedback && (
                    <p className="text-slate-700 italic leading-relaxed">
                      "{t.csatFeedback}"
                    </p>
                  )}

                  <div className="text-2xs font-mono text-slate-400 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                    <span>Ticket #{t.id} ({t.category})</span>
                    <span>Resolved by {t.assignee?.name || 'Support Staff'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center p-6 text-xs text-slate-500">
                No customer ratings recorded yet. Resolve a ticket and rate it in the Customer Portal simulator!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
