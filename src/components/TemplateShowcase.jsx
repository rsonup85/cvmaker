import React, { useState, useMemo } from 'react';
import TemplateCard from './TemplateCard';

export default function TemplateShowcase({ templates = [], onSelectTemplate }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Filter categories dynamically
  const categories = useMemo(() => {
    const list = templates.map((t) => t.category).filter(Boolean);
    return ['All', ...Array.from(new Set(list))];
  }, [templates]);

  // Filter templates based on category and search prompt
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesCategory =
        activeCategory === 'All' || template.category === activeCategory;
      const matchesSearch =
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [templates, activeCategory, searchQuery]);

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Select a Template
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Choose from modern visual designs for your resume or portfolio project.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeCategory === category
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid Display */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={onSelectTemplate}
              onPreview={(item) => setPreviewTemplate(item)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            No templates found matching your filter criteria.
          </p>
        </div>
      )}

      {/* Quick Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {previewTemplate.title}
              </h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-grow bg-slate-100 dark:bg-slate-950 flex justify-center">
              <img
                src={previewTemplate.thumbnail}
                alt={previewTemplate.title}
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSelectTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Apply Template
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}