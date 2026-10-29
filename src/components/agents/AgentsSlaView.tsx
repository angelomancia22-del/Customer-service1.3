import React from 'react';
import { useCsm } from '../../context/CsmContext';
import { AgentStatus, TicketPriority, CustomerTier } from '../../types/csm';
import { SLA_POLICY_RULES } from '../../data/mockData';
import {
  Users,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Star,
  Activity,
  ChevronRight,
} from 'lucide-react';

export const AgentsSlaView: React.FC = () => {
  const { agents, updateAgentStatus, tickets } = useCsm();

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'available':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'busy':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'away':
        return 'text-slate-600 bg-slate-100 border-slate-200';
      case 'offline':
        return 'text-slate-400 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-10 space-y-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Support Operations & SLA Enforcement
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor team capacity, agent shifts, and contractually binding response thresholds
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-2xs text-slate-700">
              Active Agents On-Duty: <span className="font-bold text-slate-900 font-mono tabular-nums">{agents.filter(a => a.status === 'available' || a.status === 'busy').length}/{agents.length}</span>
            </div>
          </div>
        </div>

        {/* 1. Support Specialists Team Roster */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              Customer Engineering & Success Roster
            </h2>
            <span className="text-2xs text-slate-500">
              Click status pill to toggle availability
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.map((agent) => {
              const liveTicketCount = tickets.filter(
                (t) => t.assigneeId === agent.id && t.status !== 'resolved' && t.status !== 'closed'
              ).length;

              return (
                <div
                  key={agent.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    {/* Top row: Avatar & Status dropdown */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      {agent.avatar ? (
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm uppercase">
                          {agent.name.slice(0, 2)}
                        </div>
                      )}

                      {/* Interactive Agent Status Selector */}
                      <select
                        value={agent.status}
                        onChange={(e) => updateAgentStatus(agent.id, e.target.value as AgentStatus)}
                        className={`text-2xs font-semibold uppercase tracking-wider py-1 px-2 rounded-md border focus:outline-none cursor-pointer ${getStatusColor(
                          agent.status
                        )}`}
                      >
                        <option value="available">Available</option>
                        <option value="busy">In Call / Busy</option>
                        <option value="away">Away</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{agent.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{agent.role}</p>
                    <p className="text-2xs font-mono text-slate-400 mt-1">{agent.specialization}</p>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-2xs">
                    <div className="bg-slate-50 p-2 rounded">
                      <span className="text-slate-400 block">Active Load</span>
                      <span className="font-mono tabular-nums font-bold text-slate-900 text-xs">
                        {liveTicketCount} tickets
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded">
                      <span className="text-slate-400 block">Avg Response</span>
                      <span className="font-mono tabular-nums font-bold text-slate-900 text-xs">
                        {agent.avgResponseTimeMinutes} mins
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded">
                      <span className="text-slate-400 block">Lifetime Resolved</span>
                      <span className="font-mono tabular-nums font-bold text-slate-900 text-xs">
                        {agent.resolvedCount}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded">
                      <span className="text-slate-400 block">CSAT Rating</span>
                      <span className="font-mono tabular-nums font-bold text-emerald-700 text-xs">
                        {agent.csatScore}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. SLA Matrix Policies Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-600" />
                Deterministic Service Level Agreement (SLA) Policy Matrix
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Contractual response times (FRT) and mean time to resolution (MTTR) targets
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-2xs text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Enforced 24/7/365</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-2xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Priority Level</th>
                  <th className="py-3 px-4">Customer Tier</th>
                  <th className="py-3 px-4">First Response SLA</th>
                  <th className="py-3 px-4">Target Resolution SLA</th>
                  <th className="py-3 px-4">Escalation Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {SLA_POLICY_RULES.map((rule, idx) => {
                  const isUrgentEnterprise = rule.priority === 'urgent' && rule.tier === 'enterprise';

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isUrgentEnterprise ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold capitalize text-slate-900">
                        {rule.priority === 'urgent' ? (
                          <span className="text-red-700 font-bold">Urgent (P1)</span>
                        ) : rule.priority === 'high' ? (
                          <span className="text-amber-700">High (P2)</span>
                        ) : rule.priority === 'medium' ? (
                          <span>Medium (P3)</span>
                        ) : (
                          <span className="text-slate-500">Low (P4)</span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-semibold uppercase tracking-wider text-2xs text-slate-600">
                        {rule.tier}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums font-medium text-slate-900">
                        {rule.firstResponseMinutes < 60
                          ? `< ${rule.firstResponseMinutes} minutes`
                          : `< ${(rule.firstResponseMinutes / 60).toFixed(0)} hours`}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums font-medium text-slate-900">
                        &le; {rule.resolutionHours} hours
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {rule.priority === 'urgent'
                          ? 'Page Tier 3 Lead & SRE on-call'
                          : rule.priority === 'high'
                          ? 'Automated dispatch to Senior Specialist'
                          : 'General triage round-robin queue'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
