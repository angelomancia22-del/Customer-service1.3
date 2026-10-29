import React, { useState } from 'react';
import { useCsm } from '../../context/CsmContext';
import { TicketPriority, ChannelType } from '../../types/csm';
import { X, Plus, AlertCircle } from 'lucide-react';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ isOpen, onClose }) => {
  const { customers, agents, createTicket, setSelectedTicketId } = useCsm();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [channel, setChannel] = useState<ChannelType>('email');
  const [category, setCategory] = useState('API & Webhooks');
  const [assigneeId, setAssigneeId] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('triage, support-tier1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter(Boolean);

    const newTicket = createTicket({
      subject: subject.trim(),
      customerId,
      priority,
      channel,
      category,
      description: description.trim(),
      tags,
      assigneeId: assigneeId || undefined,
    });

    setSelectedTicketId(newTicket.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Create Inbound Ticket</h3>
            <p className="text-xs text-slate-500">Log customer request and initiate SLA tracking</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Requester (Customer)
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.company} ({c.tier.toUpperCase()} Tier)
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Inbound webhook latency spikes during batch run"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* 3-Column: Priority, Channel, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full text-xs py-2 px-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="urgent">Urgent (P1)</option>
                <option value="high">High (P2)</option>
                <option value="medium">Medium (P3)</option>
                <option value="low">Low (P4)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inbound Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as ChannelType)}
                className="w-full text-xs py-2 px-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="email">Email</option>
                <option value="chat">Live Chat</option>
                <option value="portal">Customer Portal</option>
                <option value="api">API / Telemetry</option>
                <option value="phone">Phone Hotline</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs py-2 px-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="API & Webhooks">API & Webhooks</option>
                <option value="Security & Auth">Security & Auth</option>
                <option value="Billing & Invoices">Billing & Invoices</option>
                <option value="Product Feature">Product Feature</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>
          </div>

          {/* Assignee & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign Specialist
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full text-xs py-2 px-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                <option value="">Leave Unassigned (Triage Pool)</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.activeTicketsCount} active)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="webhook, p1, enterprise"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full text-xs py-2 px-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Customer Description / Initial Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Message / Issue Description
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide complete description of the customer inquiry, reproduction steps, or error telemetry..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* SLA Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-2xs text-slate-600">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              SLA response targets and resolution deadlines will automatically compute based on customer subscription tier.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
            >
              Dispatch Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
