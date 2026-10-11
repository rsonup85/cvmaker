import React, { useMemo, useState, useRef } from "react";
import {
  Sparkles,
  Loader2,
  Target,
  FileText,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Wand2,
  Search,
  Upload,
  Mail,
  Linkedin,
  MessageSquare,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Copy,
  X,
  Zap,
} from "lucide-react";
import { aiEnhance } from "../lib/serverApi";

function basePayload(resumeData, lang, extra = {}) {
  return {
    fullName: resumeData?.fullName || "",
    email: resumeData?.email || "",
    phone: resumeData?.phone || "",
    address: resumeData?.address || "",
    role: resumeData?.role || "",
    summary: resumeData?.summary || "",
    workExperience: resumeData?.workExperience || "",
    skills: resumeData?.officeAutomation || resumeData?.techKnowledge || "",
    officeAutomation: resumeData?.officeAutomation || "",
    techKnowledge: resumeData?.techKnowledge || "",
    gradCourse: resumeData?.gradCourse || "",
    gradCollege: resumeData?.gradCollege || "",
    gradUniv: resumeData?.gradUniv || "",
    gradDiv: resumeData?.gradDiv || "",
    interSchool: resumeData?.interSchool || "",
    interBoard: resumeData?.interBoard || "",
    interDiv: resumeData?.interDiv || "",
    sscSchool: resumeData?.sscSchool || "",
    sscBoard: resumeData?.sscBoard || "",
    sscDiv: resumeData?.sscDiv || "",
    hobbies: resumeData?.hobbies || "",
    photo: resumeData?.photo || "",
    dob: resumeData?.dob || "",
    occupation: resumeData?.occupation || "",
    fatherName: resumeData?.fatherName || "",
    motherName: resumeData?.motherName || "",
    religion: resumeData?.religion || "",
    caste: resumeData?.caste || "",
    rashi: resumeData?.rashi || "",
    expectations: resumeData?.expectations || "",
    familyDetails: resumeData?.familyDetails || "",
    lang: lang || "en",
    ...extra,
  };
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 text-indigo-800 font-semibold text-sm">
        {Icon ? <Icon size={15} className="text-indigo-600" /> : <Sparkles size={15} className="text-indigo-600" />}
        {title}
      </div>
      {subtitle && <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function ActionChip({ active, onClick, children, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition active:scale-[0.98] ${
        active
          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
          : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
      } disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

function ResultBox({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-3 text-[12px] text-slate-700 space-y-2 ${className}`}>
      {children}
    </div>
  );
}

function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 hover:text-indigo-800"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text || "");
          setOk(true);
          setTimeout(() => setOk(false), 1500);
        } catch {}
      }}
    >
      <Copy size={12} /> {ok ? "Copied" : "Copy"}
    </button>
  );
}

const MODES = [
  { id: "copilot", label: "Improve entire CV", icon: Sparkles },
  { id: "jd", label: "Tailor for a Job", icon: Target },
  { id: "bullets", label: "Fix Weak Writing", icon: Wand2 },
  { id: "weakness", label: "Improve Experience", icon: Briefcase },
  { id: "skills", label: "Career Target", icon: Zap },
  { id: "check", label: "Check Resume", icon: Search },
  { id: "upload", label: "Upload / Paste CV", icon: Upload },
  { id: "cover", label: "Cover Letter", icon: Mail },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "interview", label: "Interview Prep", icon: MessageSquare },
];

/**
 * Unified AI Copilot for Job CV flow (and optional marriage completeness).
 */
export function AiCopilot({
  resumeData,
  onApply,
  lang = "en",
  isMarriage = false,
  className = "",
}) {
  const [mode, setMode] = useState("copilot");
  const [targetRole, setTargetRole] = useState(resumeData?.role || "");
  const [jd, setJd] = useState("");
  const [roughText, setRoughText] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [filePayload, setFilePayload] = useState(null); // { base64, mimeType, name }
  const [coverLength, setCoverLength] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [ignored, setIgnored] = useState(() => new Set());
  const [expandedQ, setExpandedQ] = useState(null);
  const fileRef = useRef(null);

  const payloadBase = useMemo(() => basePayload(resumeData, lang), [resumeData, lang]);

  const run = async () => {
    setError("");
    setResult(null);
    setIgnored(new Set());
    setLoading(true);
    try {
      let type = "resumeCopilot";
      let extra = { targetRole: targetRole.trim() || resumeData?.role || "" };

      if (mode === "copilot") {
        type = "resumeCopilot";
        extra.jobDescription = jd;
      } else if (mode === "jd") {
        type = "jdMatch";
        extra.jobDescription = jd;
        if (!jd.trim()) throw new Error("Job description paste karein.");
      } else if (mode === "bullets") {
        type = "smartBullet";
        extra.rawText = roughText || resumeData?.workExperience || "";
        if (!String(extra.rawText).trim()) throw new Error("Pehle rough experience text likhein.");
      } else if (mode === "weakness") {
        type = "weaknessDetect";
      } else if (mode === "skills") {
        type = "careerTarget";
        if (!targetRole.trim()) throw new Error("Target job title likhein.");
      } else if (mode === "check") {
        type = "factCheck";
      } else if (mode === "upload") {
        type = "parseResume";
        extra.rawText = pasteText;
        if (filePayload?.base64) {
          extra.fileBase64 = filePayload.base64;
          extra.mimeType = filePayload.mimeType;
        }
        if (!pasteText.trim() && !filePayload?.base64) {
          throw new Error("PDF/image upload karein ya resume text paste karein.");
        }
      } else if (mode === "cover") {
        type = "coverLetter";
        extra.jobDescription = jd;
        extra.length = coverLength;
      } else if (mode === "linkedin") {
        type = "linkedinGen";
      } else if (mode === "interview") {
        type = "interviewPrep";
        extra.jobDescription = jd;
      } else if (mode === "biodata" && isMarriage) {
        type = "biodataCheck";
      }

      const data = await aiEnhance({ type, ...payloadBase, ...extra });
      setResult({ type, data });
    } catch (e) {
      setError(e?.message || "AI request failed");
    } finally {
      setLoading(false);
    }
  };

  const applyPatch = (patch) => {
    if (!patch || !onApply) return;
    onApply(patch);
  };

  const applySuggestion = (s) => {
    if (!s) return;
    const section = (s.section || "").toLowerCase();
    if (s.suggestedText) {
      if (section.includes("summary")) applyPatch({ summary: s.suggestedText });
      else if (section.includes("skill")) applyPatch({ officeAutomation: s.suggestedText });
      else if (section.includes("experience")) applyPatch({ workExperience: s.suggestedText });
      else if (result?.data?.improvedSummary && section.includes("summary")) {
        applyPatch({ summary: result.data.improvedSummary });
      }
    } else if (section.includes("summary") && result?.data?.improvedSummary) {
      applyPatch({ summary: result.data.improvedSummary });
    } else if (section.includes("skill") && result?.data?.improvedSkills) {
      applyPatch({ officeAutomation: result.data.improvedSkills });
    } else if (section.includes("experience") && result?.data?.safeExperienceRewrite) {
      applyPatch({ workExperience: result.data.safeExperienceRewrite });
    }
  };

  const applyAllSafe = () => {
    const d = result?.data;
    if (!d) return;
    const patch = {};
    if (d.improvedSummary) patch.summary = d.improvedSummary;
    if (d.improvedSkills) patch.officeAutomation = d.improvedSkills;
    if (d.safeExperienceRewrite) patch.workExperience = d.safeExperienceRewrite;
    if (d.tailoredSummary) patch.summary = d.tailoredSummary;
    if (d.tailoredSkills) patch.officeAutomation = d.tailoredSkills;
    if (d.tailoredExperience) patch.workExperience = d.tailoredExperience;
    if (d.fullName) {
      [
        "fullName",
        "email",
        "phone",
        "address",
        "role",
        "summary",
        "workExperience",
        "officeAutomation",
        "techKnowledge",
        "gradCourse",
        "gradCollege",
        "gradUniv",
        "gradDiv",
        "interSchool",
        "interBoard",
        "interDiv",
        "sscSchool",
        "sscBoard",
        "sscDiv",
        "hobbies",
      ].forEach((k) => {
        if (d[k]) patch[k] = d[k];
      });
      if (d.officeAutomation || d.techKnowledge) {
        patch.officeAutomation = d.officeAutomation || d.skills || patch.officeAutomation;
      }
    }
    if (Object.keys(patch).length) applyPatch(patch);
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const mime = file.type || "";
    const name = file.name || "resume";
    const isText = mime.startsWith("text/") || /\.(txt|md|csv)$/i.test(name);
    const isPdf = mime === "application/pdf" || /\.pdf$/i.test(name);
    const isImage = mime.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(name);

    try {
      if (isText) {
        const t = await file.text();
        setPasteText(t.slice(0, 50000));
        setFilePayload(null);
        setMode("upload");
        return;
      }
      if (isPdf || isImage) {
        if (file.size > 8 * 1024 * 1024) {
          setError("File 8MB se chhoti honi chahiye.");
          return;
        }
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("File read failed"));
          reader.readAsDataURL(file);
        });
        const base64 = dataUrl.replace(/^data:[^;]+;base64,/, "");
        setFilePayload({
          base64,
          mimeType: isPdf ? "application/pdf" : mime || "image/jpeg",
          name,
        });
        setMode("upload");
        setError("");
        return;
      }
      setError("Sirf PDF, image (JPG/PNG) ya .txt support hai. DOCX ho to text copy-paste karein.");
    } catch (err) {
      setError(err?.message || "File read failed");
    }
  };

  const modes = isMarriage
    ? [...MODES.filter((m) => !["interview", "linkedin"].includes(m.id)), { id: "biodata", label: "Biodata Check", icon: ClipboardList }]
    : MODES;

  return (
    <div
      className={`rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-violet-50 shadow-sm overflow-hidden ${className}`}
    >
      <div className="px-3 pt-3 pb-2 border-b border-indigo-100/80 bg-white/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm">✨ AI Copilot</div>
            <div className="text-[10px] text-slate-500">Resume improve · JD match · bullets · cover letter</div>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div>
          <p className="text-[11px] font-semibold text-slate-600 mb-1.5">What do you want to improve?</p>
          <div className="flex flex-wrap gap-1.5">
            {modes.map((m) => (
              <ActionChip key={m.id} active={mode === m.id} onClick={() => { setMode(m.id); setResult(null); setError(""); }}>
                {m.label}
              </ActionChip>
            ))}
          </div>
        </div>

        {(mode === "copilot" || mode === "jd" || mode === "skills" || mode === "cover" || mode === "interview" || mode === "linkedin") && (
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Target Job</label>
            <input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Data Analyst, Sales Executive"
              className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            />
          </div>
        )}

        {(mode === "copilot" || mode === "jd" || mode === "cover" || mode === "interview") && (
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Job Description (optional for some modes)</label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              rows={4}
              placeholder="Paste job description here…"
              className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white resize-y min-h-[80px]"
            />
          </div>
        )}

        {mode === "bullets" && (
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Rough experience text</label>
            <textarea
              value={roughText}
              onChange={(e) => setRoughText(e.target.value)}
              rows={3}
              placeholder="e.g. handled customers and billing"
              className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            />
          </div>
        )}

        {mode === "upload" && (
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Upload PDF / photo OR paste text</label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,application/pdf,image/*,text/plain"
                className="hidden"
                onChange={onFile}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-lg shadow-sm min-h-[40px]"
              >
                <Upload size={14} /> Upload PDF / Image
              </button>
              {filePayload && (
                <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg flex items-center gap-1">
                  ✓ {filePayload.name}
                  <button
                    type="button"
                    className="text-slate-500 hover:text-red-600 ml-1"
                    onClick={() => setFilePayload(null)}
                    aria-label="Remove file"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={4}
              placeholder="Optional: paste text (DOCX se copy-paste). PDF/photo upload upar se."
              className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            />
            <p className="text-[10px] text-slate-400">PDF ya resume photo upload karke Analyze dabao — AI fields auto-fill karega.</p>
          </div>
        )}

        {mode === "cover" && (
          <div className="flex gap-1.5 flex-wrap">
            {["short", "standard", "detailed"].map((l) => (
              <ActionChip key={l} active={coverLength === l} onClick={() => setCoverLength(l)}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </ActionChip>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 shadow-sm transition"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? "Analyzing…" : "Analyze →"}
        </button>

        {error && (
          <p className="text-[11px] text-red-600 flex items-start gap-1.5 bg-red-50 border border-red-100 rounded-lg p-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        {result?.type === "resumeCopilot" && result.data && (
          <ResultBox>
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="font-bold text-slate-900 text-sm">Resume Analysis</div>
              <div className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                {result.data.jobMatchScore != null ? `${result.data.jobMatchScore}% Job Match` : `${result.data.completeness ?? "—"}% complete`}
              </div>
            </div>
            <p className="text-[10px] text-slate-500">{result.data.jobMatchNote || "Estimated match — not an official ATS guarantee."}</p>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-slate-100">Profile: {result.data.profile || "—"}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100">Target: {result.data.targetRole || targetRole || "—"}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">Completeness: {result.data.completeness ?? "—"}%</span>
            </div>
            {!!result.data.majorIssues?.length && (
              <div>
                <div className="font-semibold text-amber-800 text-[11px] mb-1">Major issues</div>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-700">
                  {result.data.majorIssues.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            )}
            {!!result.data.missingKeywords?.length && (
              <p className="text-[11px]">
                <span className="font-semibold text-red-700">Missing keywords: </span>
                {result.data.missingKeywords.join(", ")}
              </p>
            )}
            {!!result.data.presentKeywords?.length && (
              <p className="text-[11px]">
                <span className="font-semibold text-emerald-700">Present: </span>
                {result.data.presentKeywords.join(", ")}
              </p>
            )}
            {!!result.data.suggestions?.length && (
              <div className="space-y-2">
                <div className="font-semibold text-[11px] text-slate-800">Suggestions</div>
                {result.data.suggestions
                  .filter((s) => !ignored.has(s.id || s.issue))
                  .map((s, i) => (
                    <div key={s.id || i} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400">{s.section} · {s.severity}</div>
                          <div className="text-[11px] text-slate-800 font-medium">{s.issue}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{s.fix}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <button type="button" className="text-[10px] font-bold px-2 py-1 rounded-md bg-indigo-600 text-white" onClick={() => applySuggestion(s)}>
                          Apply
                        </button>
                        <button
                          type="button"
                          className="text-[10px] font-semibold px-2 py-1 rounded-md border border-slate-200 bg-white"
                          onClick={() => setIgnored((prev) => new Set(prev).add(s.id || s.issue))}
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            <button type="button" onClick={applyAllSafe} className="w-full mt-1 text-xs font-bold py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
              Apply All Safe Changes
            </button>
          </ResultBox>
        )}

        {result?.type === "jdMatch" && result.data && (
          <ResultBox>
            <div className="flex items-center justify-between gap-2">
              <div className="font-bold text-sm">Job Match</div>
              <div className="text-sm font-bold text-indigo-700">{result.data.jobMatchScore ?? "—"}%</div>
            </div>
            <p className="text-[10px] text-slate-500">{result.data.jobMatchNote}</p>
            <div className="grid grid-cols-1 gap-1.5 text-[11px]">
              <p><span className="font-semibold text-emerald-700">Strong match:</span> {(result.data.strongMatch || []).join(", ") || "—"}</p>
              <p><span className="font-semibold text-red-700">Missing:</span> {(result.data.missing || result.data.missingKeywords || []).join(", ") || "—"}</p>
              <p><span className="font-semibold text-amber-700">Weak evidence:</span> {(result.data.weakEvidence || []).join(", ") || "—"}</p>
              <p>Keywords detected: {result.data.keywordsDetected ?? (result.data.presentKeywords || []).length}</p>
            </div>
            <button
              type="button"
              onClick={() =>
                applyPatch({
                  summary: result.data.tailoredSummary,
                  officeAutomation: result.data.tailoredSkills,
                  workExperience: result.data.tailoredExperience,
                  role: targetRole.trim() || resumeData?.role,
                })
              }
              className="w-full text-xs font-bold py-2 rounded-lg bg-indigo-600 text-white"
            >
              Tailor my CV for this job
            </button>
          </ResultBox>
        )}

        {result?.type === "smartBullet" && result.data && (
          <ResultBox>
            <div className="font-bold text-sm mb-1">Smart Bullets</div>
            <ul className="space-y-1 text-[12px]">
              {(result.data.bullets || []).map((b, i) => (
                <li key={i} className="leading-snug">{b}</li>
              ))}
            </ul>
            {result.data.needsMetrics && (
              <div className="rounded-lg bg-amber-50 border border-amber-100 p-2 text-[11px] text-amber-900">
                <div className="font-semibold flex items-center gap-1"><AlertTriangle size={12} /> Can you add a number?</div>
                <ul className="list-disc pl-4 mt-1">
                  {(result.data.metricPrompts || []).map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
                {result.data.note && <p className="mt-1 opacity-80">{result.data.note}</p>}
              </div>
            )}
            <button
              type="button"
              className="w-full text-xs font-bold py-2 rounded-lg bg-indigo-600 text-white"
              onClick={() => applyPatch({ workExperience: (result.data.bullets || []).join("\n") })}
            >
              Apply bullets to Experience
            </button>
          </ResultBox>
        )}

        {result?.type === "weaknessDetect" && result.data && (
          <ResultBox>
            <div className="font-bold text-sm">Weakness Detector</div>
            {(result.data.items || []).map((item, i) => (
              <div key={i} className="border border-slate-100 rounded-lg p-2 bg-slate-50">
                <div className="text-[10px] font-bold uppercase text-slate-400">{item.section} · {item.verdict}</div>
                <p className="text-[11px] text-slate-500 line-through mt-0.5">{item.original}</p>
                <p className="text-[12px] text-slate-800 mt-1">{item.better}</p>
                <ul className="text-[10px] text-amber-800 list-disc pl-4 mt-1">
                  {(item.problems || []).map((p, j) => (
                    <li key={j}>{p}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-1.5 text-[10px] font-bold px-2 py-1 rounded-md bg-indigo-600 text-white"
                  onClick={() => {
                    const sec = (item.section || "").toLowerCase();
                    if (sec.includes("summary")) applyPatch({ summary: item.better });
                    else if (sec.includes("skill")) applyPatch({ officeAutomation: item.better });
                    else applyPatch({ workExperience: (resumeData?.workExperience || "").replace(item.original, item.better) });
                  }}
                >
                  Apply better version
                </button>
              </div>
            ))}
            {!!result.data.overallTips?.length && (
              <ul className="text-[11px] list-disc pl-4 text-slate-600">
                {result.data.overallTips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            )}
          </ResultBox>
        )}

        {result?.type === "careerTarget" && result.data && (
          <ResultBox>
            <div className="font-bold text-sm">Career Target: {result.data.targetRole}</div>
            <div className="text-[11px]">
              <span className="font-semibold">Recommended sections: </span>
              {(result.data.recommendedSections || []).join(" → ")}
            </div>
            <div className="text-[11px]">
              <span className="font-semibold">Relevant skills: </span>
              {(result.data.relevantSkills || []).join(", ")}
            </div>
            {result.data.summaryTemplate && (
              <div>
                <div className="text-[10px] font-semibold text-slate-500">Summary template</div>
                <p className="text-[12px] mt-0.5">{result.data.summaryTemplate}</p>
                <button
                  type="button"
                  className="mt-1 text-[10px] font-bold px-2 py-1 rounded-md bg-indigo-600 text-white"
                  onClick={() => applyPatch({ summary: result.data.summaryTemplate, role: result.data.targetRole, officeAutomation: (result.data.relevantSkills || []).join(", ") })}
                >
                  Apply template + skills
                </button>
              </div>
            )}
            <div className="text-[11px] text-slate-600">
              Keywords: {(result.data.keywords || []).join(", ")}
            </div>
          </ResultBox>
        )}

        {result?.type === "factCheck" && result.data && (
          <ResultBox>
            <div className="font-bold text-sm flex items-center gap-1.5">
              {result.data.ok ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertTriangle size={14} className="text-amber-600" />}
              Consistency Check
            </div>
            {(result.data.warnings || []).map((w, i) => (
              <p key={i} className="text-[11px] text-amber-900 bg-amber-50 border border-amber-100 rounded-md px-2 py-1">
                ⚠️ {w.message}
              </p>
            ))}
            {!!result.data.duplicates?.length && (
              <p className="text-[11px]"><span className="font-semibold">Duplicates:</span> {result.data.duplicates.join("; ")}</p>
            )}
            {!!result.data.formatIssues?.length && (
              <p className="text-[11px]"><span className="font-semibold">Format:</span> {result.data.formatIssues.join("; ")}</p>
            )}
            {!!result.data.toneIssues?.length && (
              <p className="text-[11px]"><span className="font-semibold">Tone:</span> {result.data.toneIssues.join("; ")}</p>
            )}
            {!result.data.warnings?.length && result.data.ok && (
              <p className="text-[11px] text-emerald-700">No major inconsistencies found.</p>
            )}
          </ResultBox>
        )}

        {result?.type === "parseResume" && result.data && (
          <ResultBox>
            <div className="font-bold text-sm">Extracted fields <span className="text-[10px] font-normal text-slate-500">({result.data.confidence} confidence)</span></div>
            <div className="grid grid-cols-1 gap-1 text-[11px]">
              {["fullName", "email", "phone", "role", "gradCourse", "gradCollege"].map((k) =>
                result.data[k] ? (
                  <div key={k}>
                    <span className="text-slate-400 capitalize">{k}: </span>
                    <span className="font-medium">{result.data[k]}</span>
                  </div>
                ) : null
              )}
            </div>
            {result.data.notes && <p className="text-[10px] text-slate-500">{result.data.notes}</p>}
            <button type="button" onClick={applyAllSafe} className="w-full text-xs font-bold py-2 rounded-lg bg-emerald-600 text-white">
              Fill form with extracted data
            </button>
          </ResultBox>
        )}

        {result?.type === "coverLetter" && result.data && (
          <ResultBox>
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm">Cover Letter</div>
              <CopyBtn text={result.data.coverLetter} />
            </div>
            <pre className="whitespace-pre-wrap text-[11px] leading-relaxed bg-slate-50 rounded-lg p-2 max-h-48 overflow-auto">{result.data.coverLetter}</pre>
            <div className="border-t border-slate-100 pt-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-[11px]">Application Email</div>
                <CopyBtn text={`Subject: ${result.data.emailSubject}\n\n${result.data.emailBody}`} />
              </div>
              <p className="text-[11px] font-medium mt-1">Subject: {result.data.emailSubject}</p>
              <pre className="whitespace-pre-wrap text-[11px] leading-relaxed mt-1">{result.data.emailBody}</pre>
            </div>
          </ResultBox>
        )}

        {result?.type === "linkedinGen" && result.data && (
          <ResultBox>
            <div className="font-bold text-sm">LinkedIn Profile</div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 flex justify-between">Headline <CopyBtn text={result.data.headline} /></div>
              <p className="text-[12px] font-medium">{result.data.headline}</p>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 flex justify-between">About <CopyBtn text={result.data.about} /></div>
              <pre className="whitespace-pre-wrap text-[11px] leading-relaxed bg-slate-50 rounded-lg p-2 max-h-40 overflow-auto">{result.data.about}</pre>
            </div>
            {!!result.data.skills?.length && (
              <p className="text-[11px]"><span className="font-semibold">Skills:</span> {result.data.skills.join(", ")}</p>
            )}
          </ResultBox>
        )}

        {result?.type === "interviewPrep" && result.data && (
          <ResultBox>
            <div className="font-bold text-sm">Interview Prep ({(result.data.questions || []).length} Qs)</div>
            <div className="space-y-1.5 max-h-72 overflow-auto">
              {(result.data.questions || []).map((item, i) => (
                <div key={i} className="border border-slate-100 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left text-[12px] font-medium bg-white hover:bg-slate-50"
                    onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                  >
                    <span>Q{i + 1}. {item.q}</span>
                    {expandedQ === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedQ === i && (
                    <div className="px-2.5 pb-2 text-[11px] text-slate-600 space-y-1 bg-slate-50">
                      <p><span className="font-semibold text-slate-800">Sample: </span>{item.sampleAnswer}</p>
                      {item.tip && <p className="text-indigo-700">Tip: {item.tip}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ResultBox>
        )}

        {result?.type === "biodataCheck" && result.data && (
          <ResultBox>
            <div className="font-bold text-sm">Biodata Completeness: {result.data.completeness ?? "—"}%</div>
            {!!result.data.missing?.length && (
              <ul className="text-[11px] list-disc pl-4 text-amber-800">
                {result.data.missing.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            )}
            {!!result.data.complete?.length && (
              <ul className="text-[11px] list-disc pl-4 text-emerald-700">
                {result.data.complete.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            )}
            {result.data.toneAdvice && <p className="text-[11px] text-slate-600">{result.data.toneAdvice}</p>}
            {result.data.languageConsistency && <p className="text-[11px] text-slate-500">{result.data.languageConsistency}</p>}
          </ResultBox>
        )}
      </div>
    </div>
  );
}

export default AiCopilot;
