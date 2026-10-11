/**
 * CVMaker AI - Design & Typography Customization Settings
 */

import React from 'react';
import { DesignSettingsState } from '../data/initialData';
import { TemplateType } from '../data/catalog';
import { Type, Palette, AlignJustify, Maximize2, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { t } from '../i18n';

interface DesignSettingsProps {
  settings: DesignSettingsState;
  onChange: (updated: DesignSettingsState) => void;
  mode: TemplateType;
}

const POPULAR_FONTS = [
  { name: 'Inter', category: 'Clean Sans (ATS Safe)' },
  { name: 'Plus Jakarta Sans', category: 'Modern Tech' },
  { name: 'Outfit', category: 'Geometric Crisp' },
  { name: 'Playfair Display', category: 'Editorial Serif' },
  { name: 'Cinzel', category: 'Royal Heritage' },
  { name: 'Merriweather', category: 'Classic Book Serif' },
  { name: 'Tiro Devanagari Hindi', category: 'Devanagari Authentic' }
];

const PRESET_COLORS = [
  '#0f172a', '#1e3a8a', '#047857', '#800020', '#991b1b',
  '#701a75', '#312e81', '#7c2d12', '#0e7490', '#111827'
];

export const DesignSettings: React.FC<DesignSettingsProps> = ({
  settings,
  onChange,
  mode
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 md:p-6 space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-600" />
          Document Styling & Customization
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Changes apply live to the A4 preview and exported PDF.
        </p>
      </div>

      {/* Typography Font Picker */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-slate-500" />
          {t('fontFamily')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {POPULAR_FONTS.map((font) => (
            <button
              key={font.name}
              type="button"
              onClick={() => onChange({ ...settings, fontFamily: font.name })}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                settings.fontFamily === font.name
                  ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div>
                <span className="text-xs font-bold block text-slate-900" style={{ fontFamily: font.name }}>
                  {font.name}
                </span>
                <span className="text-[10px] text-slate-500">{font.category}</span>
              </div>
              {settings.fontFamily === font.name && (
                <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Primary Color Accent */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 block">
          Primary Brand / Header Color
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ ...settings, primaryColor: color })}
              className={`w-7 h-7 rounded-full transition-transform border-2 ${
                settings.primaryColor === color ? 'scale-110 border-white ring-2 ring-slate-900 shadow-sm' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
          {settings.primaryColor && (
            <button
              type="button"
              onClick={() => onChange({ ...settings, primaryColor: undefined })}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 ml-2"
            >
              Reset to Template
            </button>
          )}
        </div>
      </div>

      {/* Spacing & Density */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <AlignJustify className="w-3.5 h-3.5 text-slate-500" />
          {t('spacing')} & Content Density
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['compact', 'normal', 'relaxed'] as const).map((space) => (
            <button
              key={space}
              type="button"
              onClick={() => onChange({ ...settings, spacing: space })}
              className={`py-2 text-xs font-bold capitalize rounded-xl border transition-all ${
                settings.spacing === space
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {space}
            </button>
          ))}
        </div>
      </div>

      {/* Page Margins */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
          {t('margins')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['tight', 'normal', 'wide'] as const).map((margin) => (
            <button
              key={margin}
              type="button"
              onClick={() => onChange({ ...settings, margins: margin })}
              className={`py-2 text-xs font-bold capitalize rounded-xl border transition-all ${
                settings.margins === margin
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {margin}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Shape Override */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
          {t('photoShape')}
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {(['circle', 'rounded', 'arch', 'square', 'none'] as const).map((shape) => (
            <button
              key={shape}
              type="button"
              onClick={() => onChange({ ...settings, photoShape: shape })}
              className={`py-2 text-xs font-bold capitalize rounded-xl border transition-all ${
                settings.photoShape === shape
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>

      {/* Marriage Motifs Toggle */}
      {mode === 'marriage' && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              {t('showReligiousMotif')}
            </span>
            <span className="text-[11px] text-slate-500">
              Display auspicious symbols (Ganesh / Om / Swastik) at the top
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...settings, showMotif: !settings.showMotif })}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              settings.showMotif ? 'bg-amber-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                settings.showMotif ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
};
