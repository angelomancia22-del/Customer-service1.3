import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Ticket,
  Customer,
  Agent,
  KnowledgeArticle,
  CannedMacro,
  TicketStatus,
  TicketPriority,
  ChannelType,
  TicketMessage,
  AgentStatus,
} from '../types/csm';
import {
  INITIAL_AGENTS,
  INITIAL_CUSTOMERS,
  INITIAL_TICKETS,
  INITIAL_KNOWLEDGE_ARTICLES,
  INITIAL_CANNED_MACROS,
  SLA_POLICY_RULES,
} from '../data/mockData';

interface CsmContextType {
  tickets: Ticket[];
  customers: Customer[];
  agents: Agent[];
  knowledgeArticles: KnowledgeArticle[];
  cannedMacros: CannedMacro[];
  selectedTicket: Ticket | null;
  selectedTicketId: string | null;
  activeView: 'tickets' | 'customers' | 'knowledge' | 'agents' | 'analytics';
  customerPortalOpen: boolean;
  activeCustomerForPortal: Customer;
  
  // Actions
  setActiveView: (view: 'tickets' | 'customers' | 'knowledge' | 'agents' | 'analytics') => void;
  setSelectedTicketId: (id: string | null) => void;
  setCustomerPortalOpen: (open: boolean) => void;
  setActiveCustomerForPortal: (customer: Customer) => void;
  
  // Ticket Operations
  createTicket: (data: {
    subject: string;
    customerId: string;
    priority: TicketPriority;
    channel: ChannelType;
    category: string;
    description: string;
    tags: string[];
    assigneeId?: string;
  }) => Ticket;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  updateTicketPriority: (ticketId: string, priority: TicketPriority) => void;
  assignTicket: (ticketId: string, agentId?: string) => void;
  addTicketMessage: (ticketId: string, message: {
    authorId: string;
    authorName: string;
    authorRole: 'customer' | 'agent' | 'system';
    authorAvatar?: string;
    isInternalNote: boolean;
    content: string;
    attachments?: { name: string; size: string }[];
  }) => void;
  updateTicketTags: (ticketId: string, tags: string[]) => void;
  rateTicketCsat: (ticketId: string, rating: number, feedback: string) => void;
  bulkUpdateStatus: (ticketIds: string[], status: TicketStatus) => void;
  bulkAssign: (ticketIds: string[], agentId?: string) => void;
  
  // Agent Operations
  updateAgentStatus: (agentId: string, status: AgentStatus) => void;
  
  // Knowledge Base
  voteArticleHelpful: (articleId: string, helpful: boolean) => void;
  createKnowledgeArticle: (data: {
    title: string;
    category: string;
    summary: string;
    content: string;
  }) => void;
  
  // Reset
  resetToDefaultData: () => void;
  exportTicketsJson: () => void;
}

const CsmContext = createContext<CsmContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TICKETS: 'vanguard_tickets_v1',
  CUSTOMERS: 'vanguard_customers_v1',
  AGENTS: 'vanguard_agents_v1',
  ARTICLES: 'vanguard_articles_v1',
};

export const CsmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
      return saved ? JSON.parse(saved) : INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [agents, setAgents] = useState<Agent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AGENTS);
      return saved ? JSON.parse(saved) : INITIAL_AGENTS;
    } catch {
      return INITIAL_AGENTS;
    }
  });

  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ARTICLES);
      return saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE_ARTICLES;
    } catch {
      return INITIAL_KNOWLEDGE_ARTICLES;
    }
  });

  const [cannedMacros] = useState<CannedMacro[]>(INITIAL_CANNED_MACROS);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>('TKT-1084');
  const [activeView, setActiveView] = useState<'tickets' | 'customers' | 'knowledge' | 'agents' | 'analytics'>('tickets');
  const [customerPortalOpen, setCustomerPortalOpen] = useState<boolean>(false);
  const [activeCustomerForPortal, setActiveCustomerForPortal] = useState<Customer>(INITIAL_CUSTOMERS[0]);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [tickets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [agents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(knowledgeArticles));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [knowledgeArticles]);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  const createTicket = (data: {
    subject: string;
    customerId: string;
    priority: TicketPriority;
    channel: ChannelType;
    category: string;
    description: string;
    tags: string[];
    assigneeId?: string;
  }): Ticket => {
    const cust = customers.find((c) => c.id === data.customerId) || customers[0];
    const assignedAgent = data.assigneeId ? agents.find((a) => a.id === data.assigneeId) : undefined;
    
    // Find SLA policy
    const policy = SLA_POLICY_RULES.find((p) => p.tier === cust.tier && p.priority === data.priority) || {
      firstResponseMinutes: 60,
      resolutionHours: 24,
    };

    const now = new Date();
    const firstResponseDue = new Date(now.getTime() + policy.firstResponseMinutes * 60000).toISOString();
    const resolutionDue = new Date(now.getTime() + policy.resolutionHours * 3600000).toISOString();

    const newTicketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialMessage: TicketMessage = {
      id: `msg-${Date.now()}`,
      ticketId: newTicketId,
      authorId: cust.id,
      authorName: cust.name,
      authorRole: 'customer',
      authorAvatar: cust.avatar,
      isInternalNote: false,
      content: data.description,
      timestamp: now.toISOString(),
    };

    const newTicket: Ticket = {
      id: newTicketId,
      subject: data.subject,
      customerId: cust.id,
      customer: cust,
      assigneeId: assignedAgent?.id,
      assignee: assignedAgent,
      status: 'open',
      priority: data.priority,
      channel: data.channel,
      category: data.category,
      tags: data.tags,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      firstResponseDueAt: firstResponseDue,
      slaDueAt: resolutionDue,
      isSlaBreached: false,
      messages: [initialMessage],
    };

    setTickets((prev) => [newTicket, ...prev]);
    setSelectedTicketId(newTicketId);

    // Update customer ticket count
    setCustomers((prev) =>
      prev.map((c) => (c.id === cust.id ? { ...c, openTicketsCount: c.openTicketsCount + 1 } : c))
    );

    // Update agent workload if assigned
    if (assignedAgent) {
      setAgents((prev) =>
        prev.map((a) => (a.id === assignedAgent.id ? { ...a, activeTicketsCount: a.activeTicketsCount + 1 } : a))
      );
    }

    return newTicket;
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const isNowResolved = status === 'resolved' || status === 'closed';
        const wasResolved = t.status === 'resolved' || t.status === 'closed';

        return {
          ...t,
          status,
          updatedAt: new Date().toISOString(),
          messages: [
            ...t.messages,
            {
              id: `sys-${Date.now()}`,
              ticketId,
              authorId: 'system',
              authorName: 'System Automation',
              authorRole: 'system',
              isInternalNote: false,
              content: `Ticket status updated from ${t.status.toUpperCase()} to ${status.toUpperCase()}.`,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  const updateTicketPriority = (ticketId: string, priority: TicketPriority) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          priority,
          updatedAt: new Date().toISOString(),
          messages: [
            ...t.messages,
            {
              id: `sys-${Date.now()}`,
              ticketId,
              authorId: 'system',
              authorName: 'System Automation',
              authorRole: 'system',
              isInternalNote: true,
              content: `Priority adjusted from ${t.priority.toUpperCase()} to ${priority.toUpperCase()}.`,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  const assignTicket = (ticketId: string, agentId?: string) => {
    const assignedAgent = agentId ? agents.find((a) => a.id === agentId) : undefined;
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          assigneeId: assignedAgent?.id,
          assignee: assignedAgent,
          updatedAt: new Date().toISOString(),
          messages: [
            ...t.messages,
            {
              id: `sys-${Date.now()}`,
              ticketId,
              authorId: 'system',
              authorName: 'System Automation',
              authorRole: 'system',
              isInternalNote: true,
              content: assignedAgent
                ? `Reassigned to ${assignedAgent.name} (${assignedAgent.role}).`
                : 'Ticket unassigned and returned to general queue.',
              timestamp: new Date().toISOString(),
            },
          ],
        };
      })
    );
  };

  const addTicketMessage = (
    ticketId: string,
    message: {
      authorId: string;
      authorName: string;
      authorRole: 'customer' | 'agent' | 'system';
      authorAvatar?: string;
      isInternalNote: boolean;
      content: string;
      attachments?: { name: string; size: string }[];
    }
  ) => {
    const now = new Date().toISOString();
    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      ticketId,
      ...message,
      timestamp: now,
    };

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const isAgentReply = message.authorRole === 'agent' && !message.isInternalNote;
        return {
          ...t,
          updatedAt: now,
          firstResponseSentAt: t.firstResponseSentAt || (isAgentReply ? now : undefined),
          // Auto transition if customer replies to pending ticket
          status: message.authorRole === 'customer' && t.status === 'pending' ? 'in_progress' : t.status,
          messages: [...t.messages, newMsg],
        };
      })
    );
  };

  const updateTicketTags = (ticketId: string, tags: string[]) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, tags, updatedAt: new Date().toISOString() } : t))
    );
  };

  const rateTicketCsat = (ticketId: string, rating: number, feedback: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              csatRating: rating,
              csatFeedback: feedback,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const bulkUpdateStatus = (ticketIds: string[], status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (ticketIds.includes(t.id) ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    );
  };

  const bulkAssign = (ticketIds: string[], agentId?: string) => {
    const assignedAgent = agentId ? agents.find((a) => a.id === agentId) : undefined;
    setTickets((prev) =>
      prev.map((t) =>
        ticketIds.includes(t.id)
          ? { ...t, assigneeId: assignedAgent?.id, assignee: assignedAgent, updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const updateAgentStatus = (agentId: string, status: AgentStatus) => {
    setAgents((prev) => prev.map((a) => (a.id === agentId ? { ...a, status } : a)));
  };

  const voteArticleHelpful = (articleId: string, helpful: boolean) => {
    setKnowledgeArticles((prev) =>
      prev.map((a) =>
        a.id === articleId
          ? {
              ...a,
              helpfulYes: helpful ? a.helpfulYes + 1 : a.helpfulYes,
              helpfulNo: !helpful ? a.helpfulNo + 1 : a.helpfulNo,
            }
          : a
      )
    );
  };

  const createKnowledgeArticle = (data: {
    title: string;
    category: string;
    summary: string;
    content: string;
  }) => {
    const newArt: KnowledgeArticle = {
      id: `art-${Date.now()}`,
      slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: data.title,
      category: data.category,
      summary: data.summary,
      content: data.content,
      readTimeMinutes: Math.max(1, Math.ceil(data.content.split(/\s+/).length / 180)),
      updatedAt: 'Just now',
      views: 1,
      helpfulYes: 0,
      helpfulNo: 0,
    };
    setKnowledgeArticles((prev) => [newArt, ...prev]);
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.AGENTS);
    localStorage.removeItem(STORAGE_KEYS.ARTICLES);
    setTickets(INITIAL_TICKETS);
    setCustomers(INITIAL_CUSTOMERS);
    setAgents(INITIAL_AGENTS);
    setKnowledgeArticles(INITIAL_KNOWLEDGE_ARTICLES);
    setSelectedTicketId('TKT-1084');
  };

  const exportTicketsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tickets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vanguard-desk-tickets-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <CsmContext.Provider
      value={{
        tickets,
        customers,
        agents,
        knowledgeArticles,
        cannedMacros,
        selectedTicket,
        selectedTicketId,
        activeView,
        customerPortalOpen,
        activeCustomerForPortal,
        setActiveView,
        setSelectedTicketId,
        setCustomerPortalOpen,
        setActiveCustomerForPortal,
        createTicket,
        updateTicketStatus,
        updateTicketPriority,
        assignTicket,
        addTicketMessage,
        updateTicketTags,
        rateTicketCsat,
        bulkUpdateStatus,
        bulkAssign,
        updateAgentStatus,
        voteArticleHelpful,
        createKnowledgeArticle,
        resetToDefaultData,
        exportTicketsJson,
      }}
    >
      {children}
    </CsmContext.Provider>
  );
};

export const useCsm = () => {
  const context = useContext(CsmContext);
  if (!context) {
    throw new Error('useCsm must be used within a CsmProvider');
  }
  return context;
};
