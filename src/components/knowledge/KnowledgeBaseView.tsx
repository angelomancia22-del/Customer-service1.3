import React, { useState, useMemo } from 'react';
import { useCsm } from '../../context/CsmContext';
import { KnowledgeArticle } from '../../types/csm';
import {
  Search,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Eye,
  Plus,
  X,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const { knowledgeArticles, voteArticleHelpful, createKnowledgeArticle } = useCsm();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArticleId, setSelectedArticleId] = useState<string>(knowledgeArticles[0]?.id || '');
  const [showNewArticleModal, setShowNewArticleModal] = useState(false);

  // New Article Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('API & Webhooks');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');

  const categories = useMemo(() => {
    const set = new Set<string>();
    knowledgeArticles.forEach((a) => set.add(a.category));
    return ['all', ...Array.from(set)];
  }, [knowledgeArticles]);

  const filteredArticles = useMemo(() => {
    return knowledgeArticles.filter((art) => {
      if (selectedCategory !== 'all' && art.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          art.title.toLowerCase().includes(q) ||
          art.summary.toLowerCase().includes(q) ||
          art.content.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [knowledgeArticles, selectedCategory, searchQuery]);

  const activeArticle =
    knowledgeArticles.find((a) => a.id === selectedArticleId) || filteredArticles[0] || null;

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    createKnowledgeArticle({
      title: newTitle.trim(),
      category: newCategory,
      summary: newSummary.trim() || newTitle.trim(),
      content: newContent.trim(),
    });

    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    setShowNewArticleModal(false);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50">
      {/* Left Column: Article Index & Categories */}
      <div className="w-full lg:w-96 flex flex-col h-full bg-white border-r border-slate-200 overflow-hidden">
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Knowledge Base</h2>
              <p className="text-xs text-slate-500">
                Self-service documentation and agent triage playbooks
              </p>
            </div>
            <button
              onClick={() => setShowNewArticleModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Article
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search help articles and guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Categories Horizontal Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat === 'all' ? 'All Guides' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Article List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredArticles.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No articles match your search criteria.
            </div>
          ) : (
            filteredArticles.map((art) => {
              const isSelected = activeArticle?.id === art.id;

              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticleId(art.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-slate-100/90 border-l-2 border-slate-900'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-2xs text-slate-400 mb-1">
                    <span className="font-medium text-slate-600">{art.category}</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {art.readTimeMinutes}m read
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug mb-1">
                    {art.title}
                  </h4>

                  <p className="text-2xs text-slate-500 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Full Article View */}
      <div className="flex-1 overflow-y-auto bg-white p-6 lg:p-10">
        {activeArticle ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header info */}
            <div className="border-b border-slate-200 pb-5">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span className="font-semibold text-slate-900">{activeArticle.category}</span>
                <span aria-hidden="true">·</span>
                <span>Updated {activeArticle.updatedAt}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 font-mono tabular-nums">
                  <Eye className="w-3.5 h-3.5 text-slate-400" /> {activeArticle.views} views
                </span>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                {activeArticle.title}
              </h1>

              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {activeArticle.summary}
              </p>
            </div>

            {/* Article Content */}
            <div className="text-sm text-slate-800 leading-relaxed space-y-4">
              {activeArticle.content.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={idx} className="text-base font-bold text-slate-900 pt-3">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
                  return (
                    <div key={idx} className="pl-4 border-l-2 border-slate-200 space-y-1 text-xs">
                      {paragraph.split('\n').map((line, lIdx) => (
                        <p key={lIdx} className="leading-relaxed font-mono text-slate-700">
                          {line}
                        </p>
                      ))}
                    </div>
                  );
                }
                return (
                  <p key={idx} className="leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Helpfulness Rating Section */}
            <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Was this article helpful?</h4>
                <p className="text-2xs text-slate-500">
                  {activeArticle.helpfulYes} people found this helpful ({activeArticle.helpfulNo} said no)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => voteArticleHelpful(activeArticle.id, true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                  Yes ({activeArticle.helpfulYes})
                </button>

                <button
                  type="button"
                  onClick={() => voteArticleHelpful(activeArticle.id, false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors"
                >
                  <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
                  No ({activeArticle.helpfulNo})
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-12 text-slate-500 text-sm">
            Select an article from the left index to read documentation.
          </div>
        )}
      </div>

      {/* New Article Modal */}
      {showNewArticleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">Publish Knowledge Base Article</h3>
              <button
                onClick={() => setShowNewArticleModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Setting up Webhook Retries & Dead Letter Queues"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
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
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="API & Webhooks">API & Webhooks</option>
                    <option value="Security & Auth">Security & Auth</option>
                    <option value="Billing & Invoices">Billing & Invoices</option>
                    <option value="Product Feature">Product Feature</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Summary / Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="Brief 1-line overview"
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    className="w-full text-xs py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Article Body (Markdown supported)
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Enter detailed documentation, step-by-step resolution paths, or curl commands..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewArticleModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
