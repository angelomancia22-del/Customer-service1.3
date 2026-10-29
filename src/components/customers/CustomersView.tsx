import React, { useState, useMemo } from 'react';
import { useCsm } from '../../context/CsmContext';
import { Customer, CustomerTier } from '../../types/csm';
import {
  Search,
  Building2,
  Mail,
  Phone,
  Clock,
  Star,
  Plus,
  LifeBuoy,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export const CustomersView: React.FC<{ onOpenNewTicket: () => void }> = ({ onOpenNewTicket }) => {
  const { customers, tickets, setSelectedTicketId, setActiveView, setCustomerPortalOpen, setActiveCustomerForPortal } = useCsm();

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | CustomerTier>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [customers, tierFilter, searchQuery]);

  const customerTickets = useMemo(() => {
    if (!selectedCustomer) return [];
    return tickets.filter((t) => t.customerId === selectedCustomer.id);
  }, [tickets, selectedCustomer]);

  const handleLaunchAsCustomer = (cust: Customer) => {
    setActiveCustomerForPortal(cust);
    setCustomerPortalOpen(true);
  };

  const handleViewTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setActiveView('tickets');
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50">
      {/* Left Column: Customer Directory Table */}
      <div className="flex-1 flex flex-col h-full bg-white border-r border-slate-200 overflow-hidden">
        {/* Top Header & Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Customer Accounts & CRM</h2>
              <p className="text-xs text-slate-500">
                Manage enterprise accounts, service history, and satisfaction ratings
              </p>
            </div>
            <button
              onClick={onOpenNewTicket}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Ticket
            </button>
          </div>

          {/* Search & Tier Segments */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search customers by name, company, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs">
              <button
                onClick={() => setTierFilter('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  tierFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTierFilter('enterprise')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  tierFilter === 'enterprise' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Enterprise
              </button>
              <button
                onClick={() => setTierFilter('growth')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  tierFilter === 'growth' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Growth
              </button>
              <button
                onClick={() => setTierFilter('starter')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  tierFilter === 'starter' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Starter
              </button>
            </div>
          </div>
        </div>

        {/* Customer Directory List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredCustomers.map((cust) => {
            const isSelected = selectedCustomer?.id === cust.id;
            const openCount = tickets.filter((t) => t.customerId === cust.id && t.status !== 'resolved' && t.status !== 'closed').length;

            return (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomer(cust)}
                className={`p-4 cursor-pointer transition-colors flex items-center justify-between gap-4 ${
                  isSelected ? 'bg-slate-100/90 border-l-2 border-slate-900' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {cust.avatar ? (
                    <img
                      src={cust.avatar}
                      alt={cust.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs uppercase shrink-0">
                      {cust.name.slice(0, 2)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">{cust.name}</h4>
                      <span className="text-2xs font-semibold uppercase tracking-wider text-slate-600">
                        {cust.tier}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-medium text-slate-700">{cust.company}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{cust.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 text-right text-xs">
                  <div>
                    <span className="block text-2xs text-slate-400">Total Spend</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      ${cust.totalSpend.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="block text-2xs text-slate-400">Active Tickets</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {openCount}
                    </span>
                  </div>

                  <div>
                    <span className="block text-2xs text-slate-400">CSAT Score</span>
                    <span className="font-mono tabular-nums font-semibold text-emerald-700">
                      {cust.csatScore}%
                    </span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Detailed Customer Record */}
      {selectedCustomer ? (
        <div className="w-full lg:w-96 bg-white overflow-y-auto p-5 border-l border-slate-200 space-y-5">
          {/* Profile Header */}
          <div className="text-center pb-4 border-b border-slate-100">
            {selectedCustomer.avatar ? (
              <img
                src={selectedCustomer.avatar}
                alt={selectedCustomer.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 mx-auto mb-3"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg uppercase mx-auto mb-3">
                {selectedCustomer.name.slice(0, 2)}
              </div>
            )}
            <h3 className="text-base font-bold text-slate-900">{selectedCustomer.name}</h3>
            <p className="text-xs text-slate-500">{selectedCustomer.role}</p>
            <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedCustomer.company}</p>

            {/* Launch Customer Simulator Button */}
            <div className="mt-4">
              <button
                onClick={() => handleLaunchAsCustomer(selectedCustomer)}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              >
                <LifeBuoy className="w-4 h-4 text-slate-600" />
                Experience Portal as {selectedCustomer.name.split(' ')[0]}
              </button>
            </div>
          </div>

          {/* Account Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-2xs text-slate-400">Account Tier</span>
              <span className="font-semibold text-slate-900 uppercase tracking-wide">
                {selectedCustomer.tier}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-2xs text-slate-400">Customer Since</span>
              <span className="font-semibold text-slate-900">
                {selectedCustomer.joinedDate}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-2xs text-slate-400">Annual Revenue</span>
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                ${selectedCustomer.totalSpend.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-2xs text-slate-400">Satisfaction Score</span>
              <span className="font-mono tabular-nums font-semibold text-emerald-700">
                {selectedCustomer.csatScore}% CSAT
              </span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-2xs">
              Communication Details
            </h4>
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedCustomer.email}</span>
            </div>
            {selectedCustomer.phone && (
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedCustomer.phone}</span>
              </div>
            )}
            {selectedCustomer.timeZone && (
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedCustomer.timeZone}</span>
              </div>
            )}
          </div>

          {/* Ticket History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-400 uppercase tracking-wider text-2xs">
                Inquiries & Tickets ({customerTickets.length})
              </h4>
            </div>

            <div className="space-y-2">
              {customerTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleViewTicket(t.id)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-medium text-slate-700">#{t.id}</span>
                    <span className="capitalize font-medium text-slate-600">{t.status}</span>
                  </div>
                  <p className="font-medium text-slate-900 line-clamp-1">{t.subject}</p>
                  <div className="flex items-center gap-2 mt-1 text-2xs text-slate-500">
                    <span>Priority: {t.priority}</span>
                    <span>·</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
