import React, { useState } from 'react';
import { useCsm } from '../../context/CsmContext';
import { TicketPriority, TicketStatus } from '../../types/csm';
import {
  Send,
  Lock,
  MessageSquare,
  Clock,
  AlertTriangle,
  User,
  Building2,
  Mail,
  Phone,
  Tag,
  Paperclip,
  CheckCircle2,
  FileText,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Star,
  X,
  Plus,
} from 'lucide-react';

export const TicketDetail: React.FC = () => {
  const {
    selectedTicket,
    agents,
    cannedMacros,
    knowledgeArticles,
    updateTicketStatus,
    updateTicketPriority,
    assignTicket,
    addTicketMessage,
    updateTicketTags,
    setSelectedTicketId,
    tickets,
  } = useCsm();

  // Reply Composer State
  const [composerMode, setComposerMode] = useState<'public' | 'internal'>('public');
  const [replyText, setReplyText] = useState('');
  const [selectedMacroId, setSelectedMacroId] = useState('');
  const [showMacrosDropdown, setShowMacrosDropdown] = useState(false);
  const [showKbDropdown, setShowKbDropdown] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState<string>(agents[0]?.id || 'agent-1');

  if (!selectedTicket) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-8 text-center">
        <div>
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No Ticket Selected</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Select an active ticket from the queue on the left to review the conversation, SLA timers, and customer record.
          </p>
        </div>
      </div>
    );
  }

  const currentAgent = agents.find((a) => a.id === activeAgentId) || agents[0];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim()) return;

    addTicketMessage(selectedTicket.id, {
      authorId: currentAgent.id,
      authorName: currentAgent.name,
      authorRole: 'agent',
      authorAvatar: currentAgent.avatar,
      isInternalNote: composerMode === 'internal',
      content: replyText.trim(),
    });

    setReplyText('');
  };

  const handleApplyMacro = (macroId: string) => {
    const macro = cannedMacros.find((m) => m.id === macroId);
    if (!macro) return;

    const personalized = macro.body.replace(
      /\{\{customer_name\}\}/g,
      selectedTicket.customer.name.split(' ')[0]
    );

    setReplyText((prev) => (prev ? `${prev}\n\n${personalized}` : personalized));
    setShowMacrosDropdown(false);
    setSelectedMacroId('');
  };

  const handleInsertKbLink = (articleId: string) => {
    const art = knowledgeArticles.find((a) => a.id === articleId);
    if (!art) return;
    const snippet = `Refer to our documentation: "${art.title}" (${art.summary})`;
    setReplyText((prev) => (prev ? `${prev}\n\n${snippet}` : snippet));
    setShowKbDropdown(false);
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!selectedTicket.tags.includes(cleanTag)) {
      updateTicketTags(selectedTicket.id, [...selectedTicket.tags, cleanTag]);
    }
    setNewTagInput('');
    setShowAddTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateTicketTags(
      selectedTicket.id,
      selectedTicket.tags.filter((t) => t !== tagToRemove)
    );
  };

  // Other tickets from this customer
  const otherCustomerTickets = tickets.filter(
    (t) => t.customerId === selectedTicket.customerId && t.id !== selectedTicket.id
  );

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50">
      {/* Main Conversation Column */}
      <div className="flex-1 flex flex-col h-full bg-white border-r border-slate-200 overflow-hidden">
        {/* Ticket Header & Action Strip */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                #{selectedTicket.id}
              </span>
              <span className="text-xs text-slate-500">
                Channel: <strong className="text-slate-800 capitalize font-medium">{selectedTicket.channel}</strong>
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">
                Category: <strong className="text-slate-800 font-medium">{selectedTicket.category}</strong>
              </span>
            </div>

            {/* Quick Status, Priority & Assign Controls */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* Status Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-xs">Status:</span>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as TicketStatus)}
                  className="py-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending Customer</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Priority Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-xs">Priority:</span>
                <select
                  value={selectedTicket.priority}
                  onChange={(e) => updateTicketPriority(selectedTicket.id, e.target.value as TicketPriority)}
                  className="py-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Assignee Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-xs">Assignee:</span>
                <select
                  value={selectedTicket.assigneeId || ''}
                  onChange={(e) => assignTicket(selectedTicket.id, e.target.value || undefined)}
                  className="py-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="">Unassigned</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Ticket Subject */}
          <h2 className="text-lg font-bold text-slate-900 leading-snug tracking-tight" style={{ textWrap: 'balance' }}>
            {selectedTicket.subject}
          </h2>

          {/* SLA Timeline Banner */}
          <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-md">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600">
                Resolution SLA Target: <span className="font-mono tabular-nums font-semibold text-slate-900">{new Date(selectedTicket.slaDueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} UTC</span>
              </span>
            </div>

            {selectedTicket.isSlaBreached ? (
              <span className="text-rose-700 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> SLA Breached
              </span>
            ) : selectedTicket.status === 'resolved' ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Resolved within SLA
              </span>
            ) : (
              <span className="text-slate-600">
                Created: <span className="font-mono tabular-nums">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
              </span>
            )}
          </div>
        </div>

        {/* Message Thread History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedTicket.messages.map((msg) => {
            if (msg.authorRole === 'system') {
              return (
                <div key={msg.id} className="flex items-center justify-center my-3">
                  <div className="text-2xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-mono">
                    {msg.content} · {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            }

            const isCustomer = msg.authorRole === 'customer';
            const isInternal = msg.isInternalNote;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${
                  isInternal
                    ? 'p-3.5 bg-amber-50/80 border border-amber-200 rounded-lg'
                    : isCustomer
                    ? 'p-3.5 bg-white border border-slate-200 rounded-lg shadow-2xs'
                    : 'p-3.5 bg-slate-50 border border-slate-200/90 rounded-lg'
                }`}
              >
                {/* Author Avatar */}
                <div className="shrink-0">
                  {msg.authorAvatar ? (
                    <img
                      src={msg.authorAvatar}
                      alt={msg.authorName}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-2xs uppercase">
                      {msg.authorName.slice(0, 2)}
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{msg.authorName}</span>
                      {isInternal && (
                        <span className="inline-flex items-center gap-1 text-2xs font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          <Lock className="w-2.5 h-2.5" /> Internal Note
                        </span>
                      )}
                      {!isInternal && !isCustomer && (
                        <span className="text-2xs text-slate-500 font-medium">Support Agent</span>
                      )}
                    </div>
                    <span className="text-2xs text-slate-400 font-mono tabular-nums">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>

                  {/* Attachments if any */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap gap-2">
                      {msg.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded text-2xs font-mono text-slate-700 shadow-2xs"
                        >
                          <Paperclip className="w-3 h-3 text-slate-400" />
                          <span className="font-medium">{att.name}</span>
                          <span className="text-slate-400">({att.size})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CSAT Rating Banner if already rated */}
        {selectedTicket.csatRating && (
          <div className="px-4 py-3 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-emerald-900 font-medium">Customer CSAT Review:</span>
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < selectedTicket.csatRating! ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              {selectedTicket.csatFeedback && (
                <span className="italic text-slate-700">"{selectedTicket.csatFeedback}"</span>
              )}
            </div>
            <span className="text-2xs font-mono text-emerald-800 font-semibold">
              Score: {selectedTicket.csatRating}/5
            </span>
          </div>
        )}

        {/* Response Composer */}
        <div className="p-4 border-t border-slate-200 bg-white">
          {/* Mode Switch Tabs & Macros Bar */}
          <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setComposerMode('public')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  composerMode === 'public'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Public Reply
              </button>
              <button
                type="button"
                onClick={() => setComposerMode('internal')}
                className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  composerMode === 'internal'
                    ? 'bg-amber-100 text-amber-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3 h-3" /> Internal Note
              </button>
            </div>

            {/* Quick Macro & Knowledge Base Inserters */}
            <div className="flex items-center gap-2 relative">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMacrosDropdown(!showMacrosDropdown)}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  Canned Macros
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showMacrosDropdown && (
                  <div className="absolute right-0 bottom-full mb-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-30 p-1 text-xs">
                    <div className="px-2 py-1 text-2xs font-bold text-slate-400 uppercase tracking-wider">
                      Select Canned Macro
                    </div>
                    {cannedMacros.map((macro) => (
                      <button
                        key={macro.id}
                        type="button"
                        onClick={() => handleApplyMacro(macro.id)}
                        className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded text-slate-800 transition-colors flex flex-col"
                      >
                        <span className="font-medium text-slate-900">{macro.title}</span>
                        <span className="text-2xs font-mono text-slate-400">{macro.shortcut} · {macro.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowKbDropdown(!showKbDropdown)}
                  className="px-2.5 py-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded font-medium flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                  Knowledge Base Link
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showKbDropdown && (
                  <div className="absolute right-0 bottom-full mb-1 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-30 p-1 text-xs">
                    <div className="px-2 py-1 text-2xs font-bold text-slate-400 uppercase tracking-wider">
                      Insert Article Citation
                    </div>
                    {knowledgeArticles.map((art) => (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => handleInsertKbLink(art.id)}
                        className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded text-slate-800 transition-colors flex flex-col"
                      >
                        <span className="font-medium text-slate-900 truncate">{art.title}</span>
                        <span className="text-2xs text-slate-400">{art.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Text Area */}
          <div
            className={`border rounded-lg p-2.5 transition-colors ${
              composerMode === 'internal'
                ? 'bg-amber-50/50 border-amber-300 focus-within:ring-1 focus-within:ring-amber-500'
                : 'bg-white border-slate-200 focus-within:ring-1 focus-within:ring-slate-900'
            }`}
          >
            <textarea
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                composerMode === 'internal'
                  ? 'Add private team note (hidden from customer)...'
                  : 'Write a public reply to the customer...'
              }
              className="w-full text-xs bg-transparent text-slate-800 placeholder-slate-400 resize-none focus:outline-none"
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-2xs text-slate-400">
                Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-2xs font-mono">Cmd + Enter</kbd> to send
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!replyText.trim()}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md shadow-xs transition-colors ${
                    !replyText.trim()
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : composerMode === 'internal'
                      ? 'bg-amber-800 text-white hover:bg-amber-900'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  {composerMode === 'internal' ? 'Add Note' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Customer CRM & Ticket Metadata */}
      <div className="w-full lg:w-80 bg-slate-50 overflow-y-auto p-4 space-y-4">
        {/* Customer Card */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Customer Profile
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              {selectedTicket.customer.tier}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            {selectedTicket.customer.avatar ? (
              <img
                src={selectedTicket.customer.avatar}
                alt={selectedTicket.customer.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs uppercase">
                {selectedTicket.customer.name.slice(0, 2)}
              </div>
            )}
            <div>
              <h4 className="text-sm font-bold text-slate-900">{selectedTicket.customer.name}</h4>
              <p className="text-xs text-slate-500">{selectedTicket.customer.role}</p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-800">{selectedTicket.customer.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{selectedTicket.customer.email}</span>
            </div>
            {selectedTicket.customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{selectedTicket.customer.phone}</span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded">
              <span className="block text-2xs text-slate-400">Total Spend</span>
              <span className="font-mono tabular-nums font-bold text-slate-900">
                ${(selectedTicket.customer.totalSpend / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded">
              <span className="block text-2xs text-slate-400">CSAT Score</span>
              <span className="font-mono tabular-nums font-bold text-slate-900">
                {selectedTicket.customer.csatScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Properties Card */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ticket Details
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Ticket ID</span>
              <span className="font-mono font-medium text-slate-900">#{selectedTicket.id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Channel</span>
              <span className="font-medium text-slate-900 capitalize">{selectedTicket.channel}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Category</span>
              <span className="font-medium text-slate-900">{selectedTicket.category}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">First Response</span>
              <span className="font-mono text-slate-900">
                {selectedTicket.firstResponseSentAt
                  ? 'Fulfilled'
                  : 'Pending'}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                Tags
              </span>
              <button
                type="button"
                onClick={() => setShowAddTag(!showAddTag)}
                className="text-2xs text-slate-600 hover:text-slate-900 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" /> Add Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {selectedTicket.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-2xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-600"
                    title="Remove tag"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>

            {showAddTag && (
              <div className="mt-2 flex items-center gap-1">
                <input
                  type="text"
                  placeholder="tag-name..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 py-1 px-2 text-2xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-2 py-1 text-2xs bg-slate-900 text-white rounded font-medium"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Other Customer Tickets */}
        {otherCustomerTickets.length > 0 && (
          <div className="p-3.5 bg-white border border-slate-200 rounded-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Related Customer Tickets ({otherCustomerTickets.length})
            </span>
            <div className="space-y-2">
              {otherCustomerTickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className="w-full text-left p-2 rounded hover:bg-slate-50 transition-colors border border-slate-100 flex flex-col text-xs"
                >
                  <div className="flex items-center justify-between text-2xs mb-0.5">
                    <span className="font-mono text-slate-500 font-medium">#{t.id}</span>
                    <span className="capitalize text-slate-600">{t.status}</span>
                  </div>
                  <span className="font-medium text-slate-900 line-clamp-1">{t.subject}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
