/**
 * CVMaker AI - AI Copilot Modal
 * Integrates all working Gemini server-side AI operations.
 */

import React, { useState } from 'react';
import { aiEnhance } from '../lib/serverApi';
import { JobResumeData, MarriageBiodataData } from '../data/initialData';
import { TemplateType } from '../data/catalog';
import { 
  Sparkles, X, Check, Copy, RefreshCw, Wand2, ShieldCheck, 
  Target, FileText, ArrowRight, AlertCircle, Heart 
} from 'lucide-react';

interface AiCopilotProps {
  isOpen: boolean;
  onClose: () => void;
  mode: TemplateType;
  jobData: JobResumeData;
  marriageData: MarriageBiodataData;
  onApplyJobData?: (updated: JobResumeData) => void;
  onApplyMarriageData?: (updated: MarriageBiodataData) => void;
  initialType?: string;
  initialText?: string;
}

export const AiCopilot: React.FC<AiCopilotProps> = ({
  isOpen,
  onClose,
  mode,
  jobData,
  marriageData,
  onApplyJobData,
  onApplyMarriageData,
  initialType = 'atsOptimize',
  initialText = ''
}) => {
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [inputText, setInputText] = useState<string>(initialText || jobData.personal.summary);
  const [targetRole, setTargetRole] = useState<string>(jobData.personal.jobTitle || 'Senior Full Stack Engineer');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRunAi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await aiEnhance({
        type: selectedType,
        text: inputText,
        targetRole,
        jobDescription,
        resumeData: mode === 'job' ? jobData : undefined,
        biodataData: mode === 'marriage' ? marriageData : undefined
      });

      if (response && response.success) {
        setResult(response);
      } else {
        setError(response?.error || 'AI generation failed. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Server AI connection error. Check API key configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!result) return;

    if (mode === 'job' && onApplyJobData) {
      if (result.enhancedText) {
        onApplyJobData({
          ...jobData,
          personal: {
            ...jobData.personal,
            summary: result.enhancedText
          }
        });
      }
    } else if (mode === 'marriage' && onApplyMarriageData) {
      if (result.enhancedText) {
        onApplyMarriageData({
          ...marriageData,
          personal: {
            ...marriageData.personal,
            aboutMe: result.enhancedText
          }
        });
      }
    }
    onClose();
  };

  const AI_TOOLS_JOB = [
    { id: 'atsOptimize', label: 'ATS Resume Optimizer', icon: ShieldCheck, desc: 'Tailor keywords and bullet structure for ATS scanners' },
    { id: 'roleTune', label: 'Role-Specific Tune', icon: Target, desc: 'Align summary and skills to your target job title' },
    { id: 'grammar', label: 'Grammar & Tone Polish', icon: Wand2, desc: 'Enhance vocabulary, clarity and active voice' },
    { id: 'smartBullet', label: 'Action-Result Bullets', icon: FileText, desc: 'Transform responsibilities into quantified accomplishments' },
    { id: 'coverLetter', label: 'Cover Letter Generator', icon: FileText, desc: 'Draft a compelling custom cover letter' }
  ];

  const AI_TOOLS_MARRIAGE = [
    { id: 'biodata', label: 'Matrimonial Polish', icon: Heart, desc: 'Refine About Me and family introduction respectfully' },
    { id: 'biodataCheck', label: 'Completeness Review', icon: ShieldCheck, desc: 'Audit biodata for missing essential matrimonial details' },
    { id: 'bilingualBiodata', label: 'Hindi & English Bilingual', icon: Wand2, desc: 'Format bilingual Sanskrit shlokas and labels' },
    { id: 'astrologyFormat', label: 'Kundali & Gotra Formatter', icon: Sparkles, desc: 'Standardize planetary Rashi, Nakshatra & Manglik info' }
  ];

  const tools = mode === 'job' ? AI_TOOLS_JOB : AI_TOOLS_MARRIAGE;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Gemini AI Copilot
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold uppercase">
                  Pro Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400">Powered by server-side Google Gemini 3.8 Flash</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Tool Selection Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Select AI Assistant Tool</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tools.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-amber-600' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold block text-slate-900 line-clamp-1">{t.label}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Target Role Input */}
          {mode === 'job' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Designation / Job Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="e.g. Lead React Architect / Product Manager"
              />
            </div>
          )}

          {/* Input Text Area */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Text to Enhance or Evaluate</label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed focus:bg-white"
              placeholder="Paste existing summary, work bullet points, or matrimonial bio here..."
            />
          </div>

          {/* Generate Button */}
          <button
            type="button"
            disabled={loading || !inputText.trim()}
            onClick={handleRunAi}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                Analyzing & Enhancing with Gemini AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                Run AI Optimization
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Result Output */}
          {result && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  AI Enhancement Complete
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(result.enhancedText || JSON.stringify(result, null, 2))}
                    className="p-1.5 text-xs font-semibold text-slate-700 hover:bg-white rounded-lg flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleApply}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    Apply to Document
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-xl border border-amber-100">
                {result.enhancedText || JSON.stringify(result, null, 2)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
