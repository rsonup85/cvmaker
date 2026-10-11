/**
 * CVMaker AI - Landing Hero & Showcase Component
 */

import React from 'react';
import { TemplateType } from '../data/catalog';
import { 
  Briefcase, Heart, Sparkles, ShieldCheck, Download, 
  CheckCircle2, ArrowRight, Star, FileText, Users, Award 
} from 'lucide-react';
import { t } from '../i18n';

interface LandingHeroProps {
  onStartJob: () => void;
  onStartMarriage: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartJob,
  onStartMarriage
}) => {
  return (
    <div className="space-y-12 py-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-radial from-slate-900 via-slate-950 to-black text-white p-8 md:p-14 overflow-hidden border border-slate-800 shadow-2xl">
        {/* Decorative Background Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            400+ Premium Indian Templates • 2026 Edition
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            The Ultimate <span className="text-amber-400">Resume</span> &{' '}
            <span className="text-rose-400">Marriage Biodata</span> Maker
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Build ATS-compliant corporate resumes and traditional matrimonial biodatas with live A4 preview, 
            Gemini AI optimization, auspicious motifs, and instant PDF download.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartJob}
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <Briefcase className="w-5 h-5" />
              <span>Create Job Resume / CV</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onStartMarriage}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer backdrop-blur-xs"
            >
              <Heart className="w-5 h-5 text-rose-400" />
              <span>Create Marriage Biodata</span>
            </button>
          </div>

          {/* Feature Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 border-t border-slate-800/80">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Exactly 200 Job Designs
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 200+ Marriage Layouts
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 98% ATS Compliance
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free PDF Export
            </span>
          </div>
        </div>
      </div>

      {/* Two Pillars Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Job Resume Card */}
        <div 
          onClick={onStartJob}
          className="group relative bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Career & Employment
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Job Resume & CV Maker
              </h2>
              <p className="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed">
                Single-column ATS standard, Tech stack grids, Two-column executive suites, PSU / Government declarations, and fresher portfolios tailored for Indian & global hiring standards.
              </p>
            </div>

            <div className="space-y-2 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>200 distinct layouts from minimal line to executive suite</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>AI-powered resume tailoring & ATS keyword scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Crisp A4 print compliance with zero clipped footers</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-amber-600">
            <span>Explore 200 Job Templates</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Marriage Biodata Card */}
        <div 
          onClick={onStartMarriage}
          className="group relative bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-rose-500 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Matrimonial & Vedic
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Marriage Biodata Maker
              </h2>
              <p className="text-xs md:text-sm text-slate-600 mt-2 leading-relaxed">
                Rajputana royal gold, Vedic sandalwood shlokas, temple arch borders, contemporary pastel florals, Kundali details, and comprehensive family heritage trees.
              </p>
            </div>

            <div className="space-y-2 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>200+ matrimonial designs with authentic auspicious motifs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Lord Ganesha, Om, Swastik & Kalash invocations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Empty fields automatically hidden with clean print layout</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-rose-600">
            <span>Explore 200+ Marriage Templates</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
