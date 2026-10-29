import React, { useState } from 'react';
import { useCsm } from '../../context/CsmContext';
import { Customer, Ticket } from '../../types/csm';
import {
  X,
  Send,
  LifeBuoy,
  MessageSquare,
  Clock,
  Star,
  CheckCircle2,
  Paperclip,
  Plus,
  Shield,
  HelpCircle,
} from 'lucide-react';

export const CustomerPortalModal: React.FC = () => {
  const {
    customerPortalOpen,
    setCustomerPortalOpen,
    customers,
    activeCustomerForPortal,
    setActiveCustomerForPortal,
    tickets,
    addTicketMessage,
    rateTicketCsat,
    createTicket,
    setSelectedTicketId,
  } = useCsm();

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [customerMessageText, setCustomerMessageText] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // New ticket state in portal
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('API & Webhooks');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');

  // CSAT rating state
  const [ratingStars, setRatingStars] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  if (!customerPortalOpen) return null;

  const customerTickets = tickets.filter((t) => t.customerId === activeCustomerForPortal.id);
  const selectedTicket = customerTickets.find((t) => t.id === activeTicketId) || customerTickets[0] || null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerMessageText.trim() || !selectedTicket) return;

    addTicketMessage(selectedTicket.id, {
      authorId: activeCustomerForPortal.id,
      authorName: activeCustomerForPortal.name,
      authorRole: 'customer',
      authorAvatar: activeCustomerForPortal.avatar,
      isInternalNote: false,
      content: customerMessageText.trim(),
    });

    setCustomerMessageText('');
  };

  const handleCreateCustomerTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) return;

    const newTicket = createTicket({
      subject: newSubject.trim(),
      customerId: activeCustomerForPortal.id,
      priority: newPriority,
      channel: 'portal',
      category: newCategory,
      description: newDescription.trim(),
      tags: ['customer-portal', activeCustomerForPortal.tier],
    });

    setActiveTicketId(newTicket.id);
    setIsSubmittingNew(false);
    setNewSubject('');
    setNewDescription('');
  };

  const handleRateCsat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    rateTicketCsat(
      selectedTicket.id,
      ratingStars,
      feedbackComment.trim() || 'Great customer service and swift turnaround.'
    );
    setFeedbackSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Portal Top Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg">
              <LifeBuoy className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Customer Service Portal</h3>
                <span className="text-2xs font-mono text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded uppercase">
                  Simulation Mode
                </span>
              </div>
              <p className="text-2xs text-slate-400">
                Live customer viewpoint — submit inquiries, test response threads & survey ratings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Identity Switcher */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-2xs hidden sm:inline">Viewing as:</span>
              <select
                value={activeCustomerForPortal.id}
                onChange={(e) => {
                  const cust = customers.find((c) => c.id === e.target.value);
                  if (cust) {
                    setActiveCustomerForPortal(cust);
                    setActiveTicketId(null);
                  }
                }}
                className="bg-slate-800 text-white text-xs py-1.5 px-2.5 rounded-lg border border-slate-700 focus:outline-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company} · {c.tier.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setCustomerPortalOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Portal Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
          {/* Left Panel: Customer Ticket History */}
          <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">My Support Tickets</h4>
                <span className="text-2xs text-slate-500 font-mono tabular-nums">
                  {customerTickets.length} active requests
                </span>
              </div>
              <button
                onClick={() => setIsSubmittingNew(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Inquiry
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {customerTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id && !isSubmittingNew;

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveTicketId(t.id);
                      setIsSubmittingNew(false);
                      setFeedbackSubmitted(false);
                    }}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-100/90 border-l-2 border-slate-900' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-2xs mb-1">
                      <span className="font-mono font-medium text-slate-500">#{t.id}</span>
                      <span className="capitalize font-semibold text-slate-700">{t.status}</span>
                    </div>
                    <h5 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                      {t.subject}
                    </h5>
                    <div className="flex items-center gap-2 mt-1.5 text-2xs text-slate-400">
                      <span>{t.category}</span>
                      <span>·</span>
                      <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Active Thread or New Ticket Form */}
          <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
            {isSubmittingNew ? (
              /* New Ticket Form */
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-xl mx-auto space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900">Submit New Support Ticket</h3>
                    <button
                      type="button"
                      onClick={() => setIsSubmittingNew(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Back to tickets
                    </button>
                  </div>

                  <form onSubmit={handleCreateCustomerTicket} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Inquiry Subject
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Brief summary of your inquiry..."
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Category
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                        >
                          <option value="API & Webhooks">API & Webhooks</option>
                          <option value="Security & Auth">Security & Auth</option>
                          <option value="Billing & Invoices">Billing & Invoices</option>
                          <option value="Product Feature">Product Feature</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Urgency
                        </label>
                        <select
                          value={newPriority}
                          onChange={(e) => setNewPriority(e.target.value as any)}
                          className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                        >
                          <option value="urgent">Urgent (Production down)</option>
                          <option value="high">High (Major impact)</option>
                          <option value="medium">Medium (General question)</option>
                          <option value="low">Low (Minor inquiry)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Message Details
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Please include full details, error logs, or request requirements..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      Submit Ticket to Support Team
                    </button>
                  </form>
                </div>
              </div>
            ) : selectedTicket ? (
              /* Conversation Thread View */
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-2xs text-slate-500">
                      <span className="font-mono font-bold text-slate-900">#{selectedTicket.id}</span>
                      <span>·</span>
                      <span className="capitalize">{selectedTicket.category}</span>
                      <span>·</span>
                      <span className="capitalize font-semibold text-slate-700">Status: {selectedTicket.status}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{selectedTicket.subject}</h4>
                  </div>

                  {selectedTicket.assignee && (
                    <div className="flex items-center gap-2 text-right">
                      {selectedTicket.assignee.avatar && (
                        <img
                          src={selectedTicket.assignee.avatar}
                          alt={selectedTicket.assignee.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                      )}
                      <div>
                        <span className="block text-2xs text-slate-400">Assigned Agent</span>
                        <span className="text-xs font-semibold text-slate-800">
                          {selectedTicket.assignee.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* CSAT Survey Banner if ticket is resolved */}
                {(selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') && (
                  <div className="p-4 bg-emerald-50/80 border-b border-emerald-200 text-xs">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      This inquiry is resolved. How was your experience?
                    </div>

                    {selectedTicket.csatRating && !feedbackSubmitted ? (
                      <div className="text-2xs text-emerald-800">
                        You rated this resolution: <strong className="font-mono">{selectedTicket.csatRating}/5 stars</strong>. Thank you for your feedback!
                      </div>
                    ) : feedbackSubmitted ? (
                      <div className="text-2xs text-emerald-800 font-medium">
                        Thank you! Your rating has been recorded into the agent's performance record.
                      </div>
                    ) : (
                      <form onSubmit={handleRateCsat} className="mt-2 space-y-2">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRatingStars(star)}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= ratingStars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-2xs font-mono text-slate-600 ml-2 font-medium">
                            {ratingStars} of 5 Stars
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Optional feedback: e.g. Marcus solved this in 10 minutes..."
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            className="flex-1 text-xs py-1.5 px-3 bg-white border border-emerald-200 rounded-md focus:outline-none"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold shadow-xs"
                          >
                            Submit Review
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* Messages list (Hides internal notes from customer!) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedTicket.messages
                    .filter((m) => !m.isInternalNote && m.authorRole !== 'system')
                    .map((msg) => {
                      const isCustomer = msg.authorRole === 'customer';

                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 text-xs ${
                            isCustomer
                              ? 'ml-auto max-w-[85%] bg-slate-900 text-white rounded-xl rounded-tr-none p-3.5 shadow-xs'
                              : 'mr-auto max-w-[85%] bg-slate-100 text-slate-800 rounded-xl rounded-tl-none p-3.5 border border-slate-200'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={`font-semibold ${isCustomer ? 'text-slate-200' : 'text-slate-900'}`}>
                                {isCustomer ? 'You' : msg.authorName}
                              </span>
                              <span className={`text-2xs font-mono ${isCustomer ? 'text-slate-400' : 'text-slate-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className="leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Customer Reply Composer */}
                <div className="p-3 border-t border-slate-200 bg-white">
                  <form onSubmit={handleSendReply} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type your message to the support specialist..."
                      value={customerMessageText}
                      onChange={(e) => setCustomerMessageText(e.target.value)}
                      className="flex-1 text-xs py-2 px-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={!customerMessageText.trim()}
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Reply
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 text-xs">
                Select an inquiry from the left or create a new request.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
