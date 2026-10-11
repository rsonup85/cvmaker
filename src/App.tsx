/**
 * CVMaker AI - Main Application Workspace
 * 
 * Features:
 * - 200 Job Templates + 200 Marriage Templates (Strictly Isolated Pools)
 * - Desktop Two-Pane Workspace (Editor Left / Live A4 Preview Right)
 * - Mobile Tabbed Navigation (Edit / Templates / Preview)
 * - Gemini AI Copilot & Inline Polish
 * - Free PDF Download & Razorpay High-Res Email PDF Checkout
 * - Hindi & English i18n
 * - Versioned localStorage Autosave with Safe Error Recovery
 * - Toast Notification System (No blocking alerts)
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  JobResumeData, 
  MarriageBiodataData, 
  DesignSettingsState, 
  INITIAL_JOB_RESUME, 
  INITIAL_MARRIAGE_BIODATA, 
  INITIAL_DESIGN_SETTINGS 
} from './data/initialData';
import { 
  TemplateType, 
  getTemplateById, 
  isValidTemplateId, 
  ALL_JOB_TEMPLATES, 
  ALL_MARRIAGE_TEMPLATES 
} from './data/catalog';
import { LayoutRouter } from './engine/layoutRouter';
import { JobFormEditor } from './components/JobFormEditor';
import { MarriageFormEditor } from './components/MarriageFormEditor';
import { TemplateGallery } from './components/TemplateGallery';
import { DesignSettings } from './components/DesignSettings';
import { AiCopilot } from './components/AiCopilot';
import { DownloadModal } from './components/DownloadModal';
import { AdminPanel } from './components/AdminPanel';
import { LandingHero } from './components/LandingHero';
import { SEO } from './SEO';
import { t, setLanguage, getLanguage, Language } from './i18n';
import { 
  Briefcase, Heart, LayoutGrid, FileText, Palette, Sparkles, 
  Download, ShieldCheck, Languages, ZoomIn, ZoomOut, RotateCcw, 
  CheckCircle2, ArrowLeft, Eye, Edit3, Settings 
} from 'lucide-react';

const STORAGE_KEYS = {
  MODE: 'cvmaker_mode_v2',
  JOB_DATA: 'cvmaker_job_draft_v2',
  MARRIAGE_DATA: 'cvmaker_marriage_draft_v2',
  JOB_TMPL: 'cvmaker_job_tmpl_v2',
  MARRIAGE_TMPL: 'cvmaker_marriage_tmpl_v2',
  SETTINGS: 'cvmaker_settings_v2',
  LANG: 'cvmaker_lang_v2'
};

export default function App() {
  // Navigation & Mode
  const [currentView, setCurrentView] = useState<'landing' | 'workspace'>('workspace');
  const [mode, setMode] = useState<TemplateType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MODE);
      return (saved === 'marriage' ? 'marriage' : 'job') as TemplateType;
    } catch {
      return 'job';
    }
  });

  // Mobile active tab: 'edit' | 'templates' | 'preview'
  const [mobileTab, setMobileTab] = useState<'edit' | 'templates' | 'preview'>('edit');
  // Desktop secondary drawer: 'editor' | 'templates' | 'settings'
  const [activePane, setActivePane] = useState<'editor' | 'templates' | 'settings'>('editor');

  // Selected Template IDs (strict isolation)
  const [jobTemplateId, setJobTemplateId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOB_TMPL);
      return (saved && isValidTemplateId(saved)) ? saved : 'job-001';
    } catch {
      return 'job-001';
    }
  });

  const [marriageTemplateId, setMarriageTemplateId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MARRIAGE_TMPL);
      return (saved && isValidTemplateId(saved)) ? saved : 'marriage-001';
    } catch {
      return 'marriage-001';
    }
  });

  // Active template ID based on current mode
  const activeTemplateId = mode === 'job' ? jobTemplateId : marriageTemplateId;
  const activeTemplate = getTemplateById(activeTemplateId, mode);

  // Document Data States with safe localStorage recovery
  const [jobData, setJobData] = useState<JobResumeData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOB_DATA);
      return saved ? JSON.parse(saved) : INITIAL_JOB_RESUME;
    } catch {
      return INITIAL_JOB_RESUME;
    }
  });

  const [marriageData, setMarriageData] = useState<MarriageBiodataData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MARRIAGE_DATA);
      return saved ? JSON.parse(saved) : INITIAL_MARRIAGE_BIODATA;
    } catch {
      return INITIAL_MARRIAGE_BIODATA;
    }
  });

  const [designSettings, setDesignSettings] = useState<DesignSettingsState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_DESIGN_SETTINGS;
    } catch {
      return INITIAL_DESIGN_SETTINGS;
    }
  });

  // Language state
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANG) as Language;
      return saved === 'hi' ? 'hi' : 'en';
    } catch {
      return 'en';
    }
  });

  // Preview zoom scale (0.5 to 1.2)
  const [zoomScale, setZoomScale] = useState<number>(0.85);

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiInitialField, setAiInitialField] = useState<{ type: string; text: string }>({
    type: 'atsOptimize',
    text: ''
  });
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Toast notifications
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Printable root element ref
  const documentPrintRef = useRef<HTMLDivElement>(null);

  // Autosave to versioned localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MODE, mode);
      localStorage.setItem(STORAGE_KEYS.JOB_TMPL, jobTemplateId);
      localStorage.setItem(STORAGE_KEYS.MARRIAGE_TMPL, marriageTemplateId);
      localStorage.setItem(STORAGE_KEYS.JOB_DATA, JSON.stringify(jobData));
      localStorage.setItem(STORAGE_KEYS.MARRIAGE_DATA, JSON.stringify(marriageData));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(designSettings));
      localStorage.setItem(STORAGE_KEYS.LANG, lang);
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [mode, jobTemplateId, marriageTemplateId, jobData, marriageData, designSettings, lang]);

  // Mode change handler with strict isolation
  const handleModeChange = (newMode: TemplateType) => {
    setMode(newMode);
    if (newMode === 'job') {
      if (!jobTemplateId.startsWith('job-')) {
        setJobTemplateId('job-001');
      }
    } else {
      if (!marriageTemplateId.startsWith('marriage-')) {
        setMarriageTemplateId('marriage-001');
      }
    }
    showToast(newMode === 'job' ? 'Switched to Job Resume Mode' : 'Switched to Marriage Biodata Mode');
  };

  // Language switch
  const handleLanguageToggle = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    setLanguage(nextLang);
    showToast(nextLang === 'hi' ? 'हिंदी भाषा चुनी गई' : 'Switched to English');
  };

  // Reset current document to initial authentic data
  const handleResetDocument = () => {
    if (confirm(t('confirmReset', lang))) {
      if (mode === 'job') {
        setJobData(INITIAL_JOB_RESUME);
      } else {
        setMarriageData(INITIAL_MARRIAGE_BIODATA);
      }
      setDesignSettings(INITIAL_DESIGN_SETTINGS);
      showToast('Document reset to sample data');
    }
  };

  // Open contextual AI
  const handleOpenAiEnhance = (field: string, text: string) => {
    const aiType = mode === 'job' ? 'rewrite' : 'biodata';
    setAiInitialField({ type: aiType, text });
    setIsAiModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      <SEO
        title={mode === 'job' ? 'CVMaker AI — Professional Resume & CV Maker' : 'CVMaker AI — Auspicious Marriage Biodata Maker'}
        mode={mode}
      />

      {/* Top Universal Navbar */}
      <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900 tracking-tight leading-none group-hover:text-amber-600 transition-colors">
                  CVMaker AI
                </h1>
                <p className="text-[10px] font-semibold text-slate-500 tracking-wide mt-0.5">
                  Resume & Biodata Maker
                </p>
              </div>
            </button>
          </div>

          {/* Mode Switcher Pills */}
          <div className="hidden md:flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => {
                setCurrentView('workspace');
                handleModeChange('job');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'job' && currentView === 'workspace'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>{t('jobResumeTab', lang)} (200)</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('workspace');
                handleModeChange('marriage');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'marriage' && currentView === 'workspace'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-600" />
              <span>{t('marriageBiodataTab', lang)} (200+)</span>
            </button>
          </div>

          {/* Action Buttons: Language, AI, Admin, Download */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={handleLanguageToggle}
              className="p-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Change Language"
            >
              <Languages className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">{lang === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            {/* AI Copilot Button */}
            <button
              onClick={() => {
                setAiInitialField({
                  type: mode === 'job' ? 'atsOptimize' : 'biodata',
                  text: mode === 'job' ? jobData.personal.summary : marriageData.personal.aboutMe
                });
                setIsAiModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-300/60 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Admin Pricing Panel"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* Download PDF CTA */}
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-900/10 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Mobile Mode Switcher Sub-header */}
        <div className="flex md:hidden items-center justify-around border-t border-slate-100 p-2 bg-white">
          <button
            onClick={() => {
              setCurrentView('workspace');
              handleModeChange('job');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
              mode === 'job' && currentView === 'workspace' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Job Resume (200)
          </button>
          <button
            onClick={() => {
              setCurrentView('workspace');
              handleModeChange('marriage');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
              mode === 'marriage' && currentView === 'workspace' ? 'bg-rose-50 text-rose-700' : 'text-slate-600'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            Marriage (200+)
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {currentView === 'landing' ? (
          <LandingHero
            onStartJob={() => {
              handleModeChange('job');
              setCurrentView('workspace');
            }}
            onStartMarriage={() => {
              handleModeChange('marriage');
              setCurrentView('workspace');
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col space-y-4">
            {/* Workspace Sub-Toolbar */}
            <div className="no-print bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
              {/* Secondary view tabs on desktop */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActivePane('editor')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activePane === 'editor'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t('editMode', lang)}</span>
                </button>

                <button
                  onClick={() => setActivePane('templates')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activePane === 'templates'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>
                    {mode === 'job' ? 'Job Templates (200)' : 'Marriage Templates (200+)'}
                  </span>
                </button>

                <button
                  onClick={() => setActivePane('settings')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activePane === 'settings'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>{t('designSettings', lang)}</span>
                </button>
              </div>

              {/* Status and Reset */}
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('saveDraft', lang)}
                </span>

                <button
                  onClick={handleResetDocument}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                  title="Reset to default sample data"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('resetForm', lang)}</span>
                </button>
              </div>
            </div>

            {/* Main Workspace Layout */}
            {activePane === 'templates' ? (
              /* Full Width Template Gallery */
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
                <TemplateGallery
                  mode={mode}
                  selectedTemplateId={activeTemplateId}
                  onSelectTemplate={(newId) => {
                    if (mode === 'job') setJobTemplateId(newId);
                    else setMarriageTemplateId(newId);
                    showToast(`Selected Template #${newId.toUpperCase()}`);
                    setActivePane('editor');
                  }}
                />
              </div>
            ) : (
              /* Two-Column Workspace (Editor Left / Live A4 Preview Right) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Form Editor or Design Settings */}
                <div className={`lg:col-span-6 xl:col-span-5 space-y-4 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
                  {activePane === 'settings' ? (
                    <DesignSettings
                      settings={designSettings}
                      onChange={setDesignSettings}
                      mode={mode}
                    />
                  ) : mode === 'job' ? (
                    <JobFormEditor
                      data={jobData}
                      onChange={setJobData}
                      onOpenAiEnhance={handleOpenAiEnhance}
                    />
                  ) : (
                    <MarriageFormEditor
                      data={marriageData}
                      onChange={setMarriageData}
                      onOpenAiEnhance={handleOpenAiEnhance}
                    />
                  )}
                </div>

                {/* Right Column: Live A4 Preview */}
                <div className={`lg:col-span-6 xl:col-span-7 flex flex-col items-center ${mobileTab === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
                  {/* Preview Toolbar */}
                  <div className="no-print w-full bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Template: <strong className="text-amber-700">#{activeTemplate.id.toUpperCase()}</strong>
                      </span>
                      <span className="text-[11px] text-slate-500 hidden sm:inline">
                        ({activeTemplate.name})
                      </span>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setZoomScale((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-semibold text-slate-600 w-12 text-center">
                        {Math.round(zoomScale * 100)}%
                      </span>
                      <button
                        onClick={() => setZoomScale((z) => Math.min(1.2, Number((z + 0.1).toFixed(2))))}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setZoomScale(0.85)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-100"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* A4 Preview Container Frame */}
                  <div className="w-full flex justify-center overflow-x-auto pb-8">
                    <div
                      style={{
                        transform: `scale(${zoomScale})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.15s ease-out'
                      }}
                      className="shadow-2xl rounded-sm border border-slate-300"
                    >
                      <LayoutRouter
                        ref={documentPrintRef}
                        templateId={activeTemplateId}
                        mode={mode}
                        jobData={jobData}
                        marriageData={marriageData}
                        settings={designSettings}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Tabs */}
      <nav className="no-print lg:hidden sticky bottom-0 z-40 bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => {
            setCurrentView('workspace');
            setActivePane('editor');
            setMobileTab('edit');
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            mobileTab === 'edit' && activePane === 'editor' ? 'text-amber-600' : 'text-slate-500'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Form</span>
        </button>

        <button
          onClick={() => {
            setCurrentView('workspace');
            setActivePane('templates');
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activePane === 'templates' ? 'text-amber-600' : 'text-slate-500'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Templates (400+)</span>
        </button>

        <button
          onClick={() => {
            setCurrentView('workspace');
            setActivePane('editor');
            setMobileTab('preview');
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            mobileTab === 'preview' && activePane === 'editor' ? 'text-amber-600' : 'text-slate-500'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Live A4 Preview</span>
        </button>

        <button
          onClick={() => setIsDownloadModalOpen(true)}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-slate-900"
        >
          <Download className="w-4 h-4 text-amber-600" />
          <span>Export</span>
        </button>
      </nav>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Gemini AI Copilot Modal */}
      <AiCopilot
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        mode={mode}
        jobData={jobData}
        marriageData={marriageData}
        onApplyJobData={(updated) => {
          setJobData(updated);
          showToast('AI enhancement applied to Job Resume!');
        }}
        onApplyMarriageData={(updated) => {
          setMarriageData(updated);
          showToast('AI enhancement applied to Marriage Biodata!');
        }}
        initialType={aiInitialField.type}
        initialText={aiInitialField.text}
      />

      {/* Download & Razorpay Modal */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        templateId={activeTemplateId}
        documentRef={documentPrintRef}
        candidateName={mode === 'job' ? jobData.personal.fullName : marriageData.personal.fullName}
        customerEmailDefault={mode === 'job' ? jobData.personal.email : marriageData.contact.email}
        snapshotData={mode === 'job' ? jobData : marriageData}
      />

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}
