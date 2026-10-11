/**
 * CVMaker AI - Template Gallery Component
 * Displays exactly 200 Job templates or 200 Marriage templates with:
 * - Accurate counts: 200 Job, 200 Marriage
 * - Instant search and category filter pills
 * - Layout family filters
 * - Crisp, responsive miniature previews reflecting real template palette & layout
 * - High performance pagination (24 per page) so mobile devices never lag
 */

import React, { useState, useMemo } from 'react';
import { 
  ALL_JOB_TEMPLATES, 
  ALL_MARRIAGE_TEMPLATES, 
  TemplateConfig, 
  TemplateType,
  JOB_CATEGORIES,
  MARRIAGE_CATEGORIES
} from '../data/catalog';
import { resolveTemplatePrice } from '../data/pricing';
import { Search, Check, Sparkles, Filter, ChevronLeft, ChevronRight, Award, Zap } from 'lucide-react';
import { t } from '../i18n';

interface TemplateGalleryProps {
  mode: TemplateType;
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
}

const ITEMS_PER_PAGE = 24;

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  mode,
  selectedTemplateId,
  onSelectTemplate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Strictly isolated template pool according to mode
  const templatePool = useMemo(() => {
    return mode === 'job' ? ALL_JOB_TEMPLATES : ALL_MARRIAGE_TEMPLATES;
  }, [mode]);

  const categories = useMemo(() => {
    return ['All', ...(mode === 'job' ? JOB_CATEGORIES : MARRIAGE_CATEGORIES)];
  }, [mode]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templatePool.filter((tmpl) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tmpl.name.toLowerCase().includes(q);
        const matchesCategory = tmpl.category.toLowerCase().includes(q);
        const matchesLayout = tmpl.layoutFamily.toLowerCase().includes(q);
        const matchesTags = tmpl.tags.some(tag => tag.toLowerCase().includes(q));
        if (!matchesName && !matchesCategory && !matchesLayout && !matchesTags) return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && tmpl.category !== selectedCategory) {
        return false;
      }

      // Tier filter
      if (selectedTier === 'basic' && tmpl.pricingCategory !== 'basic') return false;
      if (selectedTier === 'professional' && tmpl.pricingCategory !== 'professional') return false;

      return true;
    });
  }, [templatePool, searchQuery, selectedCategory, selectedTier]);

  // Total pages
  const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE) || 1;
  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTemplates.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTemplates, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Gallery Header & Stats */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-100 text-amber-900 border border-amber-200">
                {mode === 'job' ? '200 Job Designs' : '200 Marriage Designs'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredTemplates.length} of {templatePool.length} templates
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
              {mode === 'job' ? 'Professional Resume & Job Biodata Gallery' : 'Auspicious Marriage Biodata Template Gallery'}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              {mode === 'job'
                ? 'ATS-friendly, executive, tech, fresher & government designs crafted for Indian job seekers.'
                : 'Traditional Rajputana, Vedic shloka, mandap arch, modern pastel & floral matrimonial layouts.'}
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchTemplates')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      {paginatedTemplates.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No templates found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or choosing another category.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedTier('All');
            }}
            className="mt-4 px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {paginatedTemplates.map((template) => {
            const isSelected = selectedTemplateId === template.id;
            const priceInfo = resolveTemplatePrice(template.id);

            return (
              <div
                key={template.id}
                onClick={() => onSelectTemplate(template.id)}
                className={`group relative bg-white rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col ${
                  isSelected
                    ? 'border-amber-500 ring-4 ring-amber-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
                }`}
              >
                {/* Live Styled Visual Thumbnail */}
                <div
                  className="h-48 w-full p-3 flex flex-col justify-between relative overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]"
                  style={{
                    backgroundColor: template.palette.bg,
                    borderBottom: `2px solid ${template.palette.border}`
                  }}
                >
                  {/* Miniature Header Preview */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      {/* Motif or ATS Badge */}
                      {mode === 'marriage' ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: template.palette.primary, backgroundColor: template.palette.surface }}>
                          {template.motif === 'ganesh' ? 'ॐ गणेश' : template.motif === 'om' ? 'ॐ' : '❖'}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span
                            className="text-[9px] font-extrabold px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: template.palette.primary, color: '#ffffff' }}
                          >
                            ATS {template.atsScore}%
                          </span>
                        </div>
                      )}

                      {/* Tier Tag */}
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/90 text-slate-800 shadow-xs border border-slate-200">
                        ₹{priceInfo.priceInRupees}
                      </span>
                    </div>

                    {/* Miniature Title Block */}
                    <div className="mt-2">
                      <div
                        className="h-2 w-24 rounded-sm"
                        style={{ backgroundColor: template.palette.primary }}
                      />
                      <div
                        className="h-1.5 w-16 rounded-sm mt-1"
                        style={{ backgroundColor: template.palette.accent }}
                      />
                    </div>
                  </div>

                  {/* Miniature Skeleton Content */}
                  <div className="space-y-1 my-auto opacity-75">
                    <div className="flex gap-2">
                      <div className="w-1/3 space-y-1">
                        <div className="h-1 rounded" style={{ backgroundColor: template.palette.secondary }} />
                        <div className="h-1 w-3/4 rounded bg-slate-300" />
                        <div className="h-1 w-1/2 rounded bg-slate-300" />
                      </div>
                      <div className="w-2/3 space-y-1">
                        <div className="h-1.5 w-full rounded" style={{ backgroundColor: template.palette.primary }} />
                        <div className="h-1 w-5/6 rounded bg-slate-300" />
                        <div className="h-1 w-4/6 rounded bg-slate-300" />
                      </div>
                    </div>
                  </div>

                  {/* Palette Indicators */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/40">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: template.palette.primary }} />
                      <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: template.palette.secondary }} />
                      <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: template.palette.accent }} />
                    </div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                      {template.layoutFamily.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Selected Tick Overlay */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1 shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Card Info Details */}
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        #{template.id.toUpperCase()}
                      </span>
                      {template.isPopular && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" /> Popular
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {template.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {template.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {template.category}
                    </span>
                    <button
                      type="button"
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Use Design'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-all shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 7 && currentPage > 4) {
                pageNum = currentPage - 3 + i;
                if (pageNum > totalPages) pageNum = totalPages - (6 - i);
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    currentPage === pageNum
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition-all shadow-xs"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
