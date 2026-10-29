import React from 'react';
import { useCsm } from '../context/CsmContext';
import { Plus, LifeBuoy, Download, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenNewTicket: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewTicket }) => {
  const {
    activeView,
    setActiveView,
    tickets,
    setCustomerPortalOpen,
    resetToDefaultData,
    exportTicketsJson,
  } = useCsm();

  const openTicketsCount = tickets.filter(
    (t) => t.status === 'open' || t.status === 'in_progress' || t.status === 'escalated'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strictly compliant 3-zone Top Bar Contract */}
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark in display face */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('tickets')}
              className="text-left group focus:outline-none"
            >
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-slate-800 transition-colors whitespace-nowrap shrink-0">
                Vanguard Desk
              </span>
            </button>
          </div>

          {/* Zone 2: 5 clean single-line nav links with hover and active states */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveView('tickets')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 relative ${
                activeView === 'tickets'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : ''
              }`}
            >
              Tickets & Queue
              {openTicketsCount > 0 && (
                <span className="ml-1.5 text-xs font-mono font-medium text-slate-500 tabular-nums">
                  ({openTicketsCount})
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('customers')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 relative ${
                activeView === 'customers'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : ''
              }`}
            >
              Customers & CRM
            </button>

            <button
              onClick={() => setActiveView('knowledge')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 relative ${
                activeView === 'knowledge'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : ''
              }`}
            >
              Knowledge Base
            </button>

            <button
              onClick={() => setActiveView('agents')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 relative ${
                activeView === 'agents'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : ''
              }`}
            >
              Team & SLAs
            </button>

            <button
              onClick={() => setActiveView('analytics')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 relative ${
                activeView === 'analytics'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : ''
              }`}
            >
              Operations Analytics
            </button>
          </nav>

          {/* Zone 3: Primary action + customer simulator trigger */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Customer Portal Simulator Launcher */}
            <button
              onClick={() => setCustomerPortalOpen(true)}
              title="Test Customer Experience & Live Chat"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-slate-600" />
              Customer View
            </button>

            {/* Quick Export & Reset */}
            <button
              onClick={exportTicketsJson}
              title="Export tickets JSON"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Export tickets JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset workspace data back to clean factory state?')) {
                  resetToDefaultData();
                }
              }}
              title="Reset sample data"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Reset workspace data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenNewTicket}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Ticket
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation strip */}
        <div className="flex md:hidden items-center gap-4 py-2 border-t border-slate-100 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveView('tickets')}
            className={`whitespace-nowrap ${
              activeView === 'tickets' ? 'text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            Tickets ({openTicketsCount})
          </button>
          <button
            onClick={() => setActiveView('customers')}
            className={`whitespace-nowrap ${
              activeView === 'customers' ? 'text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveView('knowledge')}
            className={`whitespace-nowrap ${
              activeView === 'knowledge' ? 'text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveView('agents')}
            className={`whitespace-nowrap ${
              activeView === 'agents' ? 'text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            Team & SLA
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`whitespace-nowrap ${
              activeView === 'analytics' ? 'text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setCustomerPortalOpen(true)}
            className="whitespace-nowrap text-blue-600 font-medium"
          >
            Customer View
          </button>
        </div>
      </div>
    </header>
  );
};
