import React, { useState, useMemo } from 'react';
import { useCsm } from '../../context/CsmContext';
import { Ticket, TicketStatus, TicketPriority, ChannelType } from '../../types/csm';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Mail,
  MessageSquare,
  Globe,
  Terminal,
  Phone,
  Check,
  Trash2,
} from 'lucide-react';

export const TicketList: React.FC = () => {
  const {
    tickets,
    selectedTicketId,
    setSelectedTicketId,
    agents,
    bulkUpdateStatus,
    bulkAssign,
  } = useCsm();

  // Filter states
  const [tabFilter, setTabFilter] = useState<'all' | 'urgent' | 'open' | 'pending' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);

  // Count calculations
  const counts = useMemo(() => {
    return {
      all: tickets.length,
      urgent: tickets.filter((t) => t.priority === 'urgent' || t.isSlaBreached).length,
      open: tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length,
      pending: tickets.filter((t) => t.status === 'pending').length,
      resolved: tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
    };
  }, [tickets]);

  // Filter logic
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Tab filter
      if (tabFilter === 'urgent') {
        if (ticket.priority !== 'urgent' && !ticket.isSlaBreached) return false;
      } else if (tabFilter === 'open') {
        if (ticket.status !== 'open' && ticket.status !== 'in_progress' && ticket.status !== 'escalated') return false;
      } else if (tabFilter === 'pending') {
        if (ticket.status !== 'pending') return false;
      } else if (tabFilter === 'resolved') {
        if (ticket.status !== 'resolved' && ticket.status !== 'closed') return false;
      }

      // Channel filter
      if (channelFilter !== 'all' && ticket.channel !== channelFilter) {
        return false;
      }

      // Assignee filter
      if (assigneeFilter !== 'all') {
        if (assigneeFilter === 'unassigned' && ticket.assigneeId) return false;
        if (assigneeFilter !== 'unassigned' && ticket.assigneeId !== assigneeFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchId = ticket.id.toLowerCase().includes(query);
        const matchSubject = ticket.subject.toLowerCase().includes(query);
        const matchCustomer = ticket.customer.name.toLowerCase().includes(query);
        const matchCompany = ticket.customer.company.toLowerCase().includes(query);
        const matchTag = ticket.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchId && !matchSubject && !matchCustomer && !matchCompany && !matchTag) return false;
      }

      return true;
    });
  }, [tickets, tabFilter, channelFilter, assigneeFilter, searchQuery]);

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedTicketIds.length === filteredTickets.length) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(filteredTickets.map((t) => t.id));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTicketIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getChannelIcon = (channel: ChannelType) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-slate-500" />;
      case 'chat':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-500" />;
      case 'api':
        return <Terminal className="w-3.5 h-3.5 text-indigo-500" />;
      case 'phone':
        return <Phone className="w-3.5 h-3.5 text-emerald-500" />;
      case 'portal':
      default:
        return <Globe className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatPriority = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-red-700 font-semibold">Urgent</span>;
      case 'high':
        return <span className="text-amber-700 font-medium">High</span>;
      case 'medium':
        return <span className="text-slate-700">Medium</span>;
      case 'low':
        return <span className="text-slate-500">Low</span>;
    }
  };

  const formatStatus = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <span className="text-blue-700 font-medium">Open</span>;
      case 'in_progress':
        return <span className="text-indigo-700 font-medium">In Progress</span>;
      case 'pending':
        return <span className="text-amber-700 font-medium">Pending Customer</span>;
      case 'escalated':
        return <span className="text-rose-700 font-semibold">Escalated</span>;
      case 'resolved':
        return <span className="text-emerald-700 font-medium">Resolved</span>;
      case 'closed':
        return <span className="text-slate-500">Closed</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* 1. Quick Filter Segment Bar */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setTabFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              tabFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Queue <span className="font-mono tabular-nums text-slate-500 ml-1">({counts.all})</span>
          </button>

          <button
            onClick={() => setTabFilter('urgent')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              tabFilter === 'urgent'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Urgent / Breached <span className="font-mono tabular-nums text-red-600 ml-1">({counts.urgent})</span>
          </button>

          <button
            onClick={() => setTabFilter('open')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              tabFilter === 'open'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active <span className="font-mono tabular-nums text-slate-500 ml-1">({counts.open})</span>
          </button>

          <button
            onClick={() => setTabFilter('pending')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              tabFilter === 'pending'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending <span className="font-mono tabular-nums text-slate-500 ml-1">({counts.pending})</span>
          </button>

          <button
            onClick={() => setTabFilter('resolved')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              tabFilter === 'resolved'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resolved <span className="font-mono tabular-nums text-slate-500 ml-1">({counts.resolved})</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Select Filters */}
      <div className="p-3 border-b border-slate-200 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tickets, customers, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="flex-1 py-1 px-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Channels</option>
            <option value="email">Email</option>
            <option value="chat">Live Chat</option>
            <option value="api">API / Webhook</option>
            <option value="portal">Web Portal</option>
            <option value="phone">Phone</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="flex-1 py-1 px-2 text-xs text-slate-700 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Bulk Action Bar (Visible when tickets selected) */}
      {selectedTicketIds.length > 0 && (
        <div className="p-2.5 bg-slate-900 text-white flex items-center justify-between text-xs transition-all">
          <div className="flex items-center gap-2">
            <span className="font-medium font-mono tabular-nums">
              {selectedTicketIds.length} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                bulkUpdateStatus(selectedTicketIds, 'resolved');
                setSelectedTicketIds([]);
              }}
              className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 rounded text-2xs font-medium"
            >
              Resolve Selected
            </button>
            <button
              onClick={() => {
                bulkUpdateStatus(selectedTicketIds, 'in_progress');
                setSelectedTicketIds([]);
              }}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-2xs font-medium"
            >
              Mark In Progress
            </button>
            <button
              onClick={() => setSelectedTicketIds([])}
              className="px-2 py-1 text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* 4. Ticket Table / Queue List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredTickets.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700">No tickets found</p>
            <p className="text-xs text-slate-500 mt-1">
              Adjust your search query or filter options above.
            </p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const isSelected = ticket.id === selectedTicketId;
            const isChecked = selectedTicketIds.includes(ticket.id);

            return (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={`p-3.5 cursor-pointer transition-colors relative group ${
                  isSelected
                    ? 'bg-slate-100/90 text-slate-900 border-l-2 border-slate-900'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                {/* Header row: Checkbox, Ticket ID, Channel, Priority */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onClick={(e) => handleToggleSelect(ticket.id, e)}
                      onChange={() => {}}
                      className="rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                    />
                    <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                      #{ticket.id}
                    </span>
                    <span title={`Channel: ${ticket.channel}`}>
                      {getChannelIcon(ticket.channel)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {formatPriority(ticket.priority)}
                    {ticket.isSlaBreached && (
                      <span className="text-2xs text-rose-600 font-semibold uppercase tracking-wider">
                        SLA Breach
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject Title */}
                <h4 className="text-sm font-medium text-slate-900 line-clamp-2 leading-snug mb-1">
                  {ticket.subject}
                </h4>

                {/* Quiet unboxed metadata with bullet separators (anti-slop standard) */}
                <div className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{ticket.customer.name}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate max-w-[120px]">{ticket.customer.company}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatStatus(ticket.status)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-400">
                    {ticket.assignee ? ticket.assignee.name.split(' ')[0] : 'Unassigned'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Footer stats bar */}
      <div className="p-2.5 px-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-2xs text-slate-500">
        <span className="font-mono tabular-nums">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </span>
        <button
          onClick={handleSelectAll}
          className="text-slate-600 hover:text-slate-900 font-medium"
        >
          {selectedTicketIds.length === filteredTickets.length && filteredTickets.length > 0
            ? 'Deselect All'
            : 'Select All in View'}
        </button>
      </div>
    </div>
  );
};
