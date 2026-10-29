/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CsmProvider, useCsm } from './context/CsmContext';
import { Header } from './components/Header';
import { TicketList } from './components/tickets/TicketList';
import { TicketDetail } from './components/tickets/TicketDetail';
import { NewTicketModal } from './components/tickets/NewTicketModal';
import { CustomersView } from './components/customers/CustomersView';
import { KnowledgeBaseView } from './components/knowledge/KnowledgeBaseView';
import { AgentsSlaView } from './components/agents/AgentsSlaView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { CustomerPortalModal } from './components/customer-portal/CustomerPortalModal';

const AppContent: React.FC = () => {
  const { activeView } = useCsm();
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);

  return (
    <div className="min-h-screen h-screen flex flex-col bg-slate-100 text-slate-900 font-sans overflow-hidden">
      {/* Top Bar Contract compliant Navigation */}
      <Header onOpenNewTicket={() => setIsNewTicketOpen(true)} />

      {/* Main Workspace Viewport */}
      <main className="flex-1 flex overflow-hidden">
        {activeView === 'tickets' && (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left Queue Panel */}
            <div className="w-full md:w-96 lg:w-[420px] h-full shrink-0">
              <TicketList />
            </div>

            {/* Right Ticket Detail & Customer Context */}
            <div className="flex-1 h-full overflow-hidden">
              <TicketDetail />
            </div>
          </div>
        )}

        {activeView === 'customers' && (
          <CustomersView onOpenNewTicket={() => setIsNewTicketOpen(true)} />
        )}

        {activeView === 'knowledge' && <KnowledgeBaseView />}

        {activeView === 'agents' && <AgentsSlaView />}

        {activeView === 'analytics' && <AnalyticsView />}
      </main>

      {/* Global Modals */}
      <NewTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
      />

      <CustomerPortalModal />
    </div>
  );
};

export default function App() {
  return (
    <CsmProvider>
      <AppContent />
    </CsmProvider>
  );
}
