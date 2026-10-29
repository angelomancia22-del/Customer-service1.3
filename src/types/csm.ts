export type TicketPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TicketStatus = 'open' | 'pending' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
export type ChannelType = 'email' | 'chat' | 'portal' | 'phone' | 'api';
export type CustomerTier = 'enterprise' | 'growth' | 'starter';
export type AgentStatus = 'available' | 'busy' | 'away' | 'offline';

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  avatar: string;
  tier: CustomerTier;
  totalSpend: number;
  openTicketsCount: number;
  csatScore: number;
  joinedDate: string;
  phone?: string;
  timeZone?: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  status: AgentStatus;
  activeTicketsCount: number;
  resolvedCount: number;
  avgResponseTimeMinutes: number;
  csatScore: number;
  specialization: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: 'customer' | 'agent' | 'system';
  authorAvatar?: string;
  isInternalNote: boolean;
  content: string;
  timestamp: string;
  attachments?: { name: string; size: string }[];
}

export interface Ticket {
  id: string;
  subject: string;
  customerId: string;
  customer: Customer;
  assigneeId?: string;
  assignee?: Agent;
  status: TicketStatus;
  priority: TicketPriority;
  channel: ChannelType;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  slaDueAt: string;
  firstResponseDueAt: string;
  firstResponseSentAt?: string;
  isSlaBreached: boolean;
  csatRating?: number;
  csatFeedback?: string;
  messages: TicketMessage[];
}

export interface KnowledgeArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  readTimeMinutes: number;
  updatedAt: string;
  views: number;
  helpfulYes: number;
  helpfulNo: number;
}

export interface CannedMacro {
  id: string;
  title: string;
  category: string;
  shortcut: string;
  body: string;
}

export interface SlaPolicyRule {
  priority: TicketPriority;
  tier: CustomerTier;
  firstResponseMinutes: number;
  resolutionHours: number;
}
