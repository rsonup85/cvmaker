import React, { useState } from "react";
import {
  Sparkles,
  Loader2,
  Wand2,
  Target,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  ScanSearch,
  Languages,
  Palette,
  ListTree,
  Star,
} from "lucide-react";
import { aiEnhance } from "../lib/serverApi";

/** Client-side passport-style photo polish + center square crop (no server). */
export async function enhanceProfilePhoto(dataUrl, { size = 512, brightness = 1.08, contrast = 1.12 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const side = Math.min(img.width, img.height);
        const sx = Math.max(0, (img.width - side) / 2);
        const sy = Math.max(0, (img.height - side) / 2 - side * 0.08);
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size);
        const d = imageData.data;
        const b = brightness;
        const c = contrast;
        const intercept = 128 * (1 - c);
        for (let i = 0; i < d.length; i += 4) {
          d[i] = Math.min(255, Math.max(0, d[i] * b * c + intercept));
          d[i + 1] = Math.min(255, Math.max(0, d[i + 1] * b * c + intercept));
          d[i + 2] = Math.min(255, Math.max(0, d[i + 2] * b * c + intercept));
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Photo load failed"));
    img.src = dataUrl;
  });
}

const PALETTE_MAP = {
  navy: { primaryColor: "#1e3a5f", accentColor: "#3b82f6", fontStyle: "sans-serif", themeLabel: "Corporate Navy" },
  slate: { primaryColor: "#334155", accentColor: "#64748b", fontStyle: "sans-serif", themeLabel: "Corporate Slate" },
  teal: { primaryColor: "#0f766e", accentColor: "#14b8a6", fontStyle: "sans-serif", themeLabel: "Modern Teal" },
  emerald: { primaryColor: "#065f46", accentColor: "#10b981", fontStyle: "sans-serif", themeLabel: "Fresh Emerald" },
  maroon: { primaryColor: "#7f1d1d", accentColor: "#b91c1c", fontStyle: "serif", themeLabel: "Traditional Maroon" },
  charcoal: { primaryColor: "#1f2937", accentColor: "#4b5563", fontStyle: "sans-serif", themeLabel: "Executive Charcoal" },
};

/**
 * Compact AI action bar used next to resume/biodata text fields.
 * types: rewrite | grammar | roleTune | biodata | a4Fit
 */
export function AiEnhanceBar({
  type = "rewrite",
  getPayload,
  onResult,
  label,
  className = "",
  extra = null,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const handleClick = async () => {
    setError("");
    setOk(false);
    setLoading(true);
    try {
      const payload = typeof getPayload === "function" ? getPayload() : getPayload || {};
      const data = await aiEnhance({ type, ...payload });
      if (typeof onResult === "function") onResult(data);
      setOk(true);
      window.setTimeout(() => setOk(false), 2500);
    } catch (e) {
      setError(e?.message || "AI Server traffic high hai, please retry karein.");
    } finally {
      setLoading(false);
    }
  };

  const icons = {
    rewrite: Wand2,
    grammar: CheckCircle2,
    roleTune: Target,
    biodata: Sparkles,
    a4Fit: Maximize2,
  };
  const Icon = icons[type] || Sparkles;
  const defaultLabels = {
    rewrite: "AI Rewrite",
    grammar: "Fix Grammar",
    roleTune: "Tune for Role",
    biodata: "AI Biodata",
    a4Fit: "Fit to A4",
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 active:scale-[0.98] disabled:opacity-60 transition"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Icon size={13} />}
          {label || defaultLabels[type] || "AI Enhance"}
        </button>
        {extra}
        {ok && (
          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 size={12} /> Updated
          </span>
        )}
      </div>
      {error && (
        <p className="text-[10px] text-red-600 flex items-start gap-1 leading-snug">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Role-tuning card */
export function RoleTuneCard({ resumeData, onApply, lang = "en" }) {
  const [role, setRole] = useState(resumeData?.role || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const run = async () => {
    if (!role.trim()) {
      setError("Target job title / role likho");
      return;
    }
    setError("");
    setOk(false);
    setLoading(true);
    try {
      const data = await aiEnhance({
        type: "roleTune",
        targetRole: role.trim(),
        summary: resumeData?.summary || "",
        workExperience: resumeData?.workExperience || "",
        skills: resumeData?.officeAutomation || resumeData?.techKnowledge || "",
        officeAutomation: resumeData?.officeAutomation || "",
        gradCourse: resumeData?.gradCourse || "",
        gradCollege: resumeData?.gradCollege || "",
        lang,
      });
      onApply?.({
        summary: data.summary || resumeData.summary,
        workExperience: data.workExperience || resumeData.workExperience,
        officeAutomation: data.skills || resumeData.officeAutomation,
        role: role.trim(),
      });
      setOk(true);
      window.setTimeout(() => setOk(false), 3000);
    } catch (e) {
      setError(e?.message || "Role tune failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-violet-800 font-semibold text-xs">
        <Target size={14} />
        One-Click Role Tuning
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">
        Target job title daalo — AI summary, experience aur skills ko us role ke hisaab se rewrite karega.
      </p>
      <input
        value={role}
        onChange={(e) => setRole(e.target.value)}
        placeholder="e.g. Sales Executive, Data Analyst, Accountant"
        className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-300"
      />
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-60 transition"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        Apply Role Tuning
      </button>
      {ok && (
        <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
          <CheckCircle2 size={12} /> Summary, experience & skills updated
        </p>
      )}
      {error && (
        <p className="text-[10px] text-red-600 flex items-start gap-1">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** A4 fit card */
export function A4FitCard({ resumeData, onApply, lang = "en" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [mode, setMode] = useState("fit");

  const run = async () => {
    setError("");
    setOk(false);
    setLoading(true);
    try {
      const data = await aiEnhance({
        type: "a4Fit",
        mode,
        summary: resumeData?.summary || "",
        workExperience: resumeData?.workExperience || "",
        skills: resumeData?.officeAutomation || "",
        officeAutomation: resumeData?.officeAutomation || "",
        techKnowledge: resumeData?.techKnowledge || "",
        targetRole: resumeData?.role || "",
        lang,
      });
      onApply?.({
        summary: data.summary ?? resumeData.summary,
        workExperience: data.workExperience ?? resumeData.workExperience,
        officeAutomation: data.skills || resumeData.officeAutomation,
      });
      setOk(true);
      window.setTimeout(() => setOk(false), 3000);
    } catch (e) {
      setError(e?.message || "A4 fit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-sky-800 font-semibold text-xs">
        <Maximize2 size={14} />
        Smart A4 Auto-Fit
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">
        Content kam hai to expand, zyada hai to 1 page me summarize. Existing AutoFit scale ke saath kaam karta hai.
      </p>
      <div className="flex gap-1">
        {[
          { id: "fit", label: "Auto" },
          { id: "expand", label: "Expand" },
          { id: "summarize", label: "Summarize" },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`flex-1 text-[10px] py-1 rounded-md border font-medium transition ${
              mode === m.id
                ? "bg-sky-600 text-white border-sky-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60 transition"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Maximize2 size={14} />}
        Fit Content to A4
      </button>
      {ok && (
        <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
          <CheckCircle2 size={12} /> Content balanced for single page
        </p>
      )}
      {error && (
        <p className="text-[10px] text-red-600 flex items-start gap-1">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Marriage biodata AI generator */
export function BiodataGenerateCard({ resumeData, onApply, lang = "en" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const run = async () => {
    setError("");
    setOk(false);
    setLoading(true);
    try {
      const data = await aiEnhance({
        type: "biodata",
        fullName: resumeData?.fullName || "",
        dob: resumeData?.dob || "",
        birthPlace: resumeData?.birthPlace || "",
        occupation: resumeData?.occupation || resumeData?.workExperience || "",
        education: resumeData?.gradCourse || resumeData?.education || "",
        gradCourse: resumeData?.gradCourse || "",
        father: resumeData?.father || resumeData?.fatherName || "",
        mother: resumeData?.mother || resumeData?.motherName || "",
        brother: resumeData?.brother || "",
        sister: resumeData?.sister || "",
        gotra: resumeData?.gotra || "",
        religion: resumeData?.religion || "",
        caste: resumeData?.caste || "",
        rawText: resumeData?.summary || resumeData?.aboutMe || "",
        lang,
      });
      onApply?.({
        summary: data.aboutMe || resumeData.summary,
        familyDetails: data.familyDetails || "",
        expectations: data.expectations || "",
      });
      setOk(true);
      window.setTimeout(() => setOk(false), 3000);
    } catch (e) {
      setError(e?.message || "Biodata generate failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-rose-800 font-semibold text-xs">
        <Sparkles size={14} />
        Smart Biodata Generation
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">
        Personal + family details se elegant About Me aur Family summary auto-generate.
      </p>
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60 transition"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        Generate Biodata Text
      </button>
      {ok && (
        <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
          <CheckCircle2 size={12} /> About Me & family text ready
        </p>
      )}
      {error && (
        <p className="text-[10px] text-red-600 flex items-start gap-1">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** ATS score + one-click optimizer */
export function AtsOptimizerCard({ resumeData, onApply, lang = "en" }) {
  const [role, setRole] = useState(resumeData?.role || "");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [optLoading, setOptLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const analyze = async () => {
    if (!role.trim() && !jd.trim()) {
      setError("Target role ya job description zaroori hai");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await aiEnhance({
        type: "atsScore",
        targetRole: role.trim(),
        jobDescription: jd.trim(),
        summary: resumeData?.summary || "",
        workExperience: resumeData?.workExperience || "",
        skills: resumeData?.officeAutomation || "",
        officeAutomation: resumeData?.officeAutomation || "",
        techKnowledge: resumeData?.techKnowledge || "",
        gradCourse: resumeData?.gradCourse || "",
        gradCollege: resumeData?.gradCollege || "",
        lang,
      });
      setResult(data);
    } catch (e) {
      setError(e?.message || "ATS analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const optimize = async () => {
    setError("");
    setOptLoading(true);
    try {
      const data = await aiEnhance({
        type: "atsOptimize",
        targetRole: role.trim(),
        jobDescription: jd.trim(),
        missingKeywords: result?.missingKeywords || [],
        summary: resumeData?.summary || "",
        workExperience: resumeData?.workExperience || "",
        skills: resumeData?.officeAutomation || "",
        officeAutomation: resumeData?.officeAutomation || "",
        techKnowledge: resumeData?.techKnowledge || "",
        lang,
      });
      onApply?.({
        summary: data.summary ?? resumeData.summary,
        workExperience: data.workExperience ?? resumeData.workExperience,
        officeAutomation: data.skills || resumeData.officeAutomation,
        role: role.trim() || resumeData.role,
      });
      setResult((prev) => (prev ? { ...prev, optimized: true, addedKeywords: data.addedKeywords } : prev));
    } catch (e) {
      setError(e?.message || "ATS optimize failed");
    } finally {
      setOptLoading(false);
    }
  };

  const scoreColor =
    result?.score >= 75 ? "text-emerald-600" : result?.score >= 50 ? "text-amber-600" : "text-red-600";

  return (
    <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-indigo-800 font-semibold text-xs">
        <ScanSearch size={14} />
        ATS Score & Keyword Optimizer
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">
        Job title / JD paste karo — missing keywords aur ATS score dekho, phir one-click optimize.
      </p>
      <input
        value={role}
        onChange={(e) => setRole(e.target.value)}
        placeholder="Target job title e.g. Sales Manager"
        className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        rows={3}
        placeholder="Optional: full job description paste karo..."
        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
      />
      <button
        type="button"
        onClick={analyze}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <ScanSearch size={14} />}
        Analyze ATS Score
      </button>
      {result && (
        <div className="rounded-lg bg-white border border-indigo-100 p-2 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Score</span>
            <span className={`font-bold text-sm ${scoreColor}`}>
              {result.score}/100 · {result.level || ""}
            </span>
          </div>
          {Array.isArray(result.missingKeywords) && result.missingKeywords.length > 0 && (
            <div>
              <span className="font-semibold text-slate-600">Missing keywords:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {result.missingKeywords.slice(0, 12).map((k) => (
                  <span key={k} className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-100 text-[10px]">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
          {Array.isArray(result.suggestions) && result.suggestions.length > 0 && (
            <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
              {result.suggestions.slice(0, 4).map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={optimize}
            disabled={optLoading}
            className="w-full mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {optLoading ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
            Auto-ATS Optimize CV
          </button>
          {result.optimized && (
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 size={12} /> Keywords inserted where natural
            </p>
          )}
        </div>
      )}
      {error && (
        <p className="text-[10px] text-red-600 flex items-start gap-1">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Translate Card */
export function TranslateCard({ getText, onApply, lang = "en" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [targetLang, setTargetLang] = useState("en");

  const run = async () => {
    const rawText = typeof getText === "function" ? getText() : getText || "";
    if (!String(rawText).trim()) {
      setError("Pehle kuch text likho");
      return;
    }
    setError("");
    setOk(false);
    setLoading(true);
    try {
      const data = await aiEnhance({
        type: "translate",
        rawText,
        targetLang,
        sourceLang: "auto",
        lang,
      });
      onApply?.(data.enhancedText || "");
      setOk(true);
      window.setTimeout(() => setOk(false), 2500);
    } catch (e) {
      setError(e?.message || "Translation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs">
        <Languages size={14} />
        Hinglish / Hindi → Professional Text
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">
        Local language ya Hinglish me likho — AI corporate English (ya formal Hindi) me convert karega.
      </p>
      <div className="flex gap-1">
        {[
          { id: "en", label: "→ English" },
          { id: "hi", label: "→ Hindi" },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setTargetLang(m.id)}
            className={`flex-1 text-[10px] py-1 rounded-md border font-medium transition ${
              targetLang === m.id
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60 transition"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
        Translate & Rewrite
      </button>
      {ok && (
        <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
          <CheckCircle2 size={12} /> Text updated
        </p>
      )}
      {error && (
        <p className="text-[10px] text-red-600 flex items-start gap-1">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Skills breakdown card */
export function SkillsBreakCard({ resumeData, onApply, lang = "en" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const run = async () => {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const raw = [resumeData?.officeAutomation, resumeData?.techKnowledge, resumeData?.hobbies]
        .filter(Boolean)
        .join(", ");
      const data = await aiEnhance({
        type: "skillsBreak",
        rawText: raw,
        targetRole: resumeData?.role || "",
        officeAutomation: resumeData?.officeAutomation || "",
        techKnowledge: resumeData?.techKnowledge || "",
        lang,
      });
      setResult(data);
      if (data.formatted || data.officeAutomation) {
        onApply?.({
          officeAutomation: data.formatted || data.officeAutomation || resumeData.officeAutomation,
          techKnowledge: (data.technicalTools || []).join(", ") || resumeData.techKnowledge,
          skillsCore: data.coreCompetencies || [],
          skillsSoft: data.softSkills || [],
          skillsTech: data.technicalTools || [],
        });
      }
    } catch (e) {
      setError(e?.message || "Skills breakdown failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-cyan-900 font-semibold text-xs">
        <ListTree size={14} />
        Skill Auto-Categorization
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">
        Paragraph / comma list ko Core, Technical aur Soft skills modules me split karega.
      </p>
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-60 transition"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <ListTree size={14} />}
        Categorize Skills
      </button>
      {result && (
        <div className="text-[10px] text-slate-700 space-y-1 bg-white border border-cyan-100 rounded-lg p-2">
          {result.coreCompetencies?.length > 0 && (
            <p>
              <span className="font-semibold">Core:</span> {result.coreCompetencies.join(", ")}
            </p>
          )}
          {result.technicalTools?.length > 0 && (
            <p>
              <span className="font-semibold">Technical:</span> {result.technicalTools.join(", ")}
            </p>
          )}
          {result.softSkills?.length > 0 && (
            <p>
              <span className="font-semibold">Soft:</span> {result.softSkills.join(", ")}
            </p>
          )}
        </div>
      )}
      {error && (
        <p className="text-[10px] text-red-600 flex items-start gap-1">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Design suggest card */
export function DesignSuggestCard({ resumeData, onApplyTheme, onApplyOrder, lang = "en" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const run = async () => {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await aiEnhance({
        type: "designSuggest",
        targetRole: resumeData?.role || "",
        workExperience: resumeData?.workExperience || "",
        gradCourse: resumeData?.gradCourse || "",
        gradCollege: resumeData?.gradCollege || "",
        skills: resumeData?.officeAutomation || "",
        officeAutomation: resumeData?.officeAutomation || "",
        lang,
      });
      setResult(data);
      const palette = PALETTE_MAP[data.paletteId] || {
        primaryColor: data.primaryColor || "#1e3a5f",
        accentColor: data.accentColor || "#3b82f6",
        fontStyle: data.fontStyle || "sans-serif",
        themeLabel: data.themeLabel || "Custom",
      };
      onApplyTheme?.({
        ...palette,
        primaryColor: data.primaryColor || palette.primaryColor,
        sectionOrder: data.sectionOrder,
        profile: data.profile,
        reason: data.reason,
      });
      if (data.sectionOrder && onApplyOrder) onApplyOrder(data.sectionOrder, data.profile);
    } catch (e) {
      setError(e?.message || "Design suggest failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-white p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-fuchsia-900 font-semibold text-xs">
        <Palette size={14} />
        Smart Theme & Section Order
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">
        Role ke hisaab se color palette + fresher/experienced section order recommend karega.
      </p>
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-fuchsia-600 text-white hover:bg-fuchsia-700 disabled:opacity-60 transition"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Palette size={14} />}
        Suggest Design
      </button>
      {result && (
        <div className="text-[10px] text-slate-700 space-y-1 bg-white border border-fuchsia-100 rounded-lg p-2">
          <p>
            <span className="font-semibold">Profile:</span> {result.profile} · {result.themeLabel || result.paletteId}
          </p>
          <p>
            <span className="font-semibold">Order:</span> {(result.sectionOrder || []).join(" → ")}
          </p>
          {result.reason && <p className="text-slate-500">{result.reason}</p>}
          <div className="flex gap-2 items-center pt-1">
            <span
              className="w-5 h-5 rounded-full border border-slate-200"
              style={{ background: result.primaryColor || "#1e3a5f" }}
            />
            <span
              className="w-5 h-5 rounded-full border border-slate-200"
              style={{ background: result.accentColor || "#3b82f6" }}
            />
            <span className="text-slate-500">{result.fontStyle}</span>
          </div>
        </div>
      )}
      {error && (
        <p className="text-[10px] text-red-600 flex items-start gap-1">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Marriage Culture Card */
export function MarriageCultureCard({ resumeData, onApply, lang = "en" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState("bilingual");

  const run = async () => {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const type = mode === "astrology" ? "astrologyFormat" : "bilingualBiodata";
      const data = await aiEnhance({
        type,
        fullName: resumeData?.fullName || "",
        dob: resumeData?.dob || "",
        birthTime: resumeData?.birthTime || "",
        birthPlace: resumeData?.birthPlace || "",
        rashi: resumeData?.rashi || "",
        nakshatra: resumeData?.nakshatra || "",
        gotra: resumeData?.gotra || "",
        fatherName: resumeData?.fatherName || "",
        fatherOccupation: resumeData?.fatherOccupation || "",
        motherName: resumeData?.motherName || "",
        motherOccupation: resumeData?.motherOccupation || "",
        brother: resumeData?.brother || "",
        sister: resumeData?.sister || "",
        occupation: resumeData?.occupation || resumeData?.workExperience || "",
        gradCourse: resumeData?.gradCourse || "",
        lang,
      });
      setResult(data);
      if (mode === "bilingual") {
        onApply?.({
          summary: data.aboutMeEn || resumeData.summary,
          summaryHi: data.aboutMeHi || "",
          familyDetails: data.familyDetailsEn || "",
          familyDetailsHi: data.familyDetailsHi || "",
          astrologyLine: data.astrologyLineEn || "",
          astrologyLineHi: data.astrologyLineHi || "",
        });
      } else {
        onApply?.({
          astrologyBlock: data.astrologyBlockEn || "",
          astrologyBlockHi: data.astrologyBlockHi || "",
          familyDetails: data.familyBlockEn || resumeData.familyDetails,
          familyDetailsHi: data.familyBlockHi || "",
        });
      }
    } catch (e) {
      setError(e?.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-rose-800 font-semibold text-xs">
        <Star size={14} />
        Cultural Biodata Customizer
      </div>
      <p className="text-[10px] text-slate-500 leading-relaxed">
        English + Hindi biodata text, aur kundli/family details ka neat cultural format.
      </p>
      <div className="flex gap-1">
        {[
          { id: "bilingual", label: "EN + HI Bio" },
          { id: "astrology", label: "Kundli Format" },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`flex-1 text-[10px] py-1 rounded-md border font-medium transition ${
              mode === m.id
                ? "bg-rose-600 text-white border-rose-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60 transition"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
        {mode === "astrology" ? "Format Astrology & Family" : "Generate Bilingual Bio"}
      </button>
      {result && (
        <div className="text-[10px] text-slate-700 space-y-1 bg-white border border-rose-100 rounded-lg p-2 max-h-40 overflow-y-auto">
          {(result.aboutMeEn || result.astrologyBlockEn) && (
            <p className="whitespace-pre-wrap">{result.aboutMeEn || result.astrologyBlockEn}</p>
          )}
          {(result.aboutMeHi || result.astrologyBlockHi) && (
            <p className="whitespace-pre-wrap text-slate-600 border-t border-slate-100 pt-1">
              {result.aboutMeHi || result.astrologyBlockHi}
            </p>
          )}
        </div>
      )}
      {error && (
        <p className="text-[10px] text-red-600 flex items-start gap-1">
          <AlertCircle size={12} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
