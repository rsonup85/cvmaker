import React from 'react';

export default function TemplateCard({ template, onSelect, onPreview }) {
  const { title, category, thumbnail, isNew, tags } = template;

  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Visual Header / Image Preview */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => onPreview(template)}
            className="px-4 py-2 bg-white/90 hover:bg-white text-slate-900 font-medium text-sm rounded-lg backdrop-blur-sm transition-colors shadow-lg"
          >
            Quick Preview
          </button>
          <button
            onClick={() => onSelect(template)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors shadow-lg"
          >
            Use Template
          </button>
        </div>
        {isNew && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-500 text-white font-semibold text-xs rounded-full shadow-sm">
            NEW
          </span>
        )}
      </div>

      {/* Template Metadata */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            {category}
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}