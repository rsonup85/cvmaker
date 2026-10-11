import React, { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  Check,
  CheckCircle2,
  ClipboardPaste,
  FileText,
  Linkedin,
  Loader2,
  Mail,
  MessageSquareText,
  ScanSearch,
  Sparkles,
  Target,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { aiEnhance } from "../lib/serverApi";

const iconMap = {
  improve: Wand2,
  job: Target,
  import: Upload,
  bullets: MessageSquareText,
  consistency: ScanSearch,
  cover: FileText,
  email: Mail,
  linkedin: Linkedin,
  interview: Briefcase,
};

const actions = [
  { id: "improve", label: "Improve my CV", desc: "AI audit + safe content improvements", tone: "violet" },
  { id: "job", label: "Match a Job", desc: "Paste JD and tailor the resume", tone: "blue" },
  { id: "import", label: "Import old CV", desc: "PDF, image, DOCX or text extraction", tone: "emerald" },
  { id: "bullets", label: "Improve bullets", desc: "Turn rough work notes into strong bullets", tone: "amber" },
  { id: "consistency", label: "Check resume", desc: "Dates, duplicates and consistency", tone: "slate" },
  { id: "cover", label: "Cover letter", desc: "Resume + JD based cover letter", tone: "rose" },
  { id: "email", label: "Application email", desc: "Subject + ready-to-send email", tone: "cyan" },
  { id: "linkedin", label: "LinkedIn pack", desc: "Headline, About and experience", tone: "indigo" },
  { id: "interview", label: "Interview prep", desc: "Questions + answer guidance", tone: "orange" },
];

function cleanText(value = "") {
  return String(value)
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}

function toneClasses(tone) {
  const map = {
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    orange: "bg-orange-50 text-orange-700 border-orange-100",
  };
  return map[tone] || map.violet;
}

async function extractDocxText(file) {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const view = new DataView(buf);
  let offset = 0;
  const decoder = new TextDecoder("utf-8");
  while (offset + 30 <= bytes.length) {
    const signature = view.getUint32(offset, true);
    if (signature !== 0x04034b50) {
      offset += 1;
      continue;
    }
    const flags = view.getUint16(offset + 6, true);
    const method = view.getUint16(offset + 8, true);
    const compSize = view.getUint32(offset + 18, true);
    const nameLen = view.getUint16(offset + 26, true);
    const extraLen = view.getUint16(offset + 28, true);
    const name = decoder.decode(bytes.slice(offset + 30, offset + 30 + nameLen));
    const dataStart = offset + 30 + nameLen + extraLen;
    if (flags & 0x08) {
      throw new Error("This DOCX uses a ZIP data descriptor and could not be read in-browser.");
    }
    if (dataStart + compSize > bytes.length) throw new Error("DOCX file appears corrupted.");
    if (name === "word/document.xml") {
      const compressed = bytes.slice(dataStart, dataStart + compSize);
      let xmlBytes = compressed;
      if (method === 8) {
        if (typeof DecompressionStream === "undefined") {
          throw new Error("Browser DOCX decompression is not supported.");
        }
        const ds = new DecompressionStream("deflate-raw");
        const stream = new Blob([compressed]).stream().pipeThrough(ds);
        xmlBytes = new Uint8Array(await new Response(stream).arrayBuffer());
      } else if (method !== 0) {
        throw new Error("Unsupported DOCX compression method.");
      }
      const xml = decoder.decode(xmlBytes);
      const text = xml
        .replace(/<w:tab\/?\s*>/gi, "\t")
        .replace(/<w:br\/?\s*>/gi, "\n")
        .replace(/<w:p[^>]*>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/\s{2,}/g, " ")
        .trim();
      return text;
    }
    offset = dataStart + compSize;
  }
  throw new Error("word/document.xml not found in DOCX.");
}

async function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read uploaded file."));
    reader.readAsDataURL(file);
  });
}

function ResultBox({ children }) {
  return <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">{children}</div>;
}

function BulletList({ items, empty = "Nothing flagged." }) {
  if (!Array.isArray(items) || !items.length) return <p className="text-xs text-slate-400">{empty}</p>;
  return (
    <ul className="space-y-2 text-xs text-slate-700">
      {items.map((item, idx) => (
        <li key={idx} className="flex gap-2 leading-relaxed">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
          <span>{typeof item === "string" ? item : item?.text || item?.issue || item?.question || ""}</span>
        </li>
      ))}
    </ul>
  );
}

export function AiCopilot({ resumeData, creationType, lang = "en", onApply, onClose, className = "" }) {
  const [activeAction, setActiveAction] = useState("improve");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState(resumeData?.role || "");
  const [bulletInput, setBulletInput] = useState("");
  const [interviewCount, setInterviewCount] = useState(8);
  const fileRef = useRef(null);

  const baseResume = useMemo(() => ({
    fullName: resumeData?.fullName || "",
    role: resumeData?.role || "",
    summary: cleanText(resumeData?.summary || ""),
    workExperience: cleanText(resumeData?.workExperience || ""),
    officeAutomation: cleanText(resumeData?.officeAutomation || ""),
    techKnowledge: cleanText(resumeData?.techKnowledge || ""),
    hobbies: cleanText(resumeData?.hobbies || ""),
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
    email: resumeData?.email || "",
    phone: resumeData?.phone || "",
    address: resumeData?.address || "",
  }), [resumeData]);

  const run = async (type, payload = {}) => {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const data = await aiEnhance({
        type,
        lang,
        targetRole: targetRole.trim() || baseResume.role,
        ...baseResume,
        ...payload,
      });
      setResult(data);
      return data;
    } catch (e) {
      setError(e?.message || "AI service busy hai. Thodi der baad retry karein.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const applyPatch = (patch, message = "AI changes applied") => {
    if (!patch) return;
    onApply?.(patch);
    setError("");
    setResult((prev) => ({ ...(prev || {}), applied: true, appliedMessage: message }));
  };

  const handleImport = async (file) => {
    if (!file) return;
    setError("");
    setLoading(true);
    setResult(null);
    try {
      if (file.size > 4 * 1024 * 1024) throw new Error("File 4 MB se chhoti rakhein.");
      const lower = file.name.toLowerCase();
      const textLike = file.type.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(lower);
      let data;
      if (lower.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const text = await extractDocxText(file);
        data = await aiEnhance({ type: "resumeImportText", rawText: text, lang, creationType, sourceFile: file.name });
      } else if (textLike) {
        const text = await file.text();
        data = await aiEnhance({ type: "resumeImportText", rawText: text, lang, creationType, sourceFile: file.name });
      } else if (file.type === "application/pdf" || file.type.startsWith("image/")) {
        const dataUrl = await fileToDataUrl(file);
        const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
        if (base64.length > 4_200_000) throw new Error("PDF/image ka size 3 MB ke andar rakhein.");
        data = await aiEnhance({ type: "resumeImportFile", fileData: base64, mimeType: file.type, sourceFile: file.name, lang, creationType });
      } else {
        throw new Error("PDF, image, DOCX, TXT, MD ya JSON file upload karein.");
      }
      setResult({ ...data, importReady: true });
    } catch (e) {
      setError(e?.message || "File import failed");
    } finally {
      setLoading(false);
    }
  };

  const activeLabel = actions.find((a) => a.id === activeAction)?.label || "AI Copilot";
  const Icon = iconMap[activeAction] || Sparkles;

  return (
    <div className={`flex h-full min-h-0 flex-col bg-slate-50 ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3.5 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900"><Sparkles size={17} className="text-violet-600" /> AI Copilot</div>
          <p className="mt-0.5 text-[11px] text-slate-500">Resume se leke job application tak — ek hi place par.</p>
        </div>
        {onClose && <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close AI Copilot"><X size={18} /></button>}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {actions.map((action) => {
            const ActionIcon = iconMap[action.id] || Sparkles;
            const active = action.id === activeAction;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => { setActiveAction(action.id); setResult(null); setError(""); }}
                className={`rounded-2xl border p-3 text-left transition ${active ? "border-violet-300 bg-white shadow-sm ring-2 ring-violet-100" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"}`}
              >
                <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl border ${toneClasses(action.tone)}`}><ActionIcon size={15} /></div>
                <div className="text-[11px] font-bold leading-snug text-slate-800">{action.label}</div>
                <div className="mt-1 text-[9px] leading-snug text-slate-400">{action.desc}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-white p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-900"><Icon size={15} /> {activeLabel}</div>

          {activeAction === "improve" && (
            <div className="mt-3 space-y-3">
              <p className="text-[11px] leading-relaxed text-slate-600">AI poore CV ko audit karega, weak sections identify karega aur safe, fact-preserving improvements suggest karega.</p>
              <button type="button" onClick={() => run("resumeAnalyze")} disabled={loading} className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700 disabled:opacity-60">{loading ? <Loader2 className="mx-auto animate-spin" size={15} /> : "Analyze & Improve CV"}</button>
              {result && (
                <ResultBox>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div><div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Strengths</div><BulletList items={result.strengths || result.overall?.strengths} /></div>
                    <div><div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-rose-700">Fix first</div><BulletList items={result.concerns || result.overall?.concerns} /></div>
                  </div>
                  {(result.summary || result.workExperience || result.skills) && (
                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                      {result.summary && <div><div className="mb-1 text-[10px] font-bold text-slate-500">Suggested Summary</div><p className="text-xs leading-relaxed text-slate-700">{result.summary}</p></div>}
                      {result.workExperience && <div><div className="mb-1 text-[10px] font-bold text-slate-500">Suggested Experience</div><p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{result.workExperience}</p></div>}
                      {result.skills && <div><div className="mb-1 text-[10px] font-bold text-slate-500">Suggested Skills</div><p className="text-xs leading-relaxed text-slate-700">{result.skills}</p></div>}
                      <button type="button" onClick={() => applyPatch({ summary: result.summary || baseResume.summary, workExperience: result.workExperience || baseResume.workExperience, officeAutomation: result.skills || baseResume.officeAutomation, role: targetRole || baseResume.role }, "AI resume improvements applied")} className="mt-1 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">Apply safe improvements</button>
                    </div>
                  )}
                </ResultBox>
              )}
            </div>
          )}

          {activeAction === "job" && (
            <div className="mt-3 space-y-3">
              <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Target role — e.g. Data Analyst" />
              <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={8} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Paste job description here..." />
              <button type="button" onClick={() => run("jobMatch", { jobDescription })} disabled={loading || (!jobDescription.trim() && !targetRole.trim())} className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60">{loading ? <Loader2 className="mx-auto animate-spin" size={15} /> : "Analyze Job Match"}</button>
              {result && (
                <ResultBox>
                  <div className="flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-lg font-black text-blue-700">{result.score ?? "—"}</div><div><div className="text-sm font-bold text-slate-900">Estimated job match</div><div className="text-[11px] text-slate-500">Keyword/content alignment based on the JD you provided.</div></div></div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2"><div><div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Present</div><BulletList items={result.presentKeywords || result.matchedKeywords} /></div><div><div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">Missing / consider</div><BulletList items={result.missingKeywords} /></div></div>
                  {result.suggestions?.length > 0 && <div className="mt-3 border-t border-slate-100 pt-3"><div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Actionable tips</div><BulletList items={result.suggestions} /></div>}
                  {(result.tailoredSummary || result.tailoredExperience || result.tailoredSkills) && <button type="button" onClick={() => applyPatch({ summary: result.tailoredSummary || baseResume.summary, workExperience: result.tailoredExperience || baseResume.workExperience, officeAutomation: result.tailoredSkills || baseResume.officeAutomation, role: targetRole || baseResume.role }, "Resume tailored for this job")} className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">Apply job-tailored CV</button>}
                </ResultBox>
              )}
            </div>
          )}

          {activeAction === "import" && (
            <div className="mt-3 space-y-3">
              <div onClick={() => fileRef.current?.click()} className="cursor-pointer rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-center hover:bg-emerald-50">
                <Upload className="mx-auto text-emerald-600" size={24} />
                <div className="mt-2 text-sm font-bold text-slate-800">Upload your old CV</div>
                <div className="mt-1 text-[11px] text-slate-500">PDF, image, DOCX, TXT, MD or JSON · max 4 MB</div>
              </div>
              <input ref={fileRef} type="file" className="hidden" accept="application/pdf,image/*,.docx,.txt,.md,.json" onChange={(e) => handleImport(e.target.files?.[0])} />
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-500"><span className="font-bold text-slate-700">Privacy note:</span> uploaded content is sent to your configured AI endpoint only for extraction. Review every field before saving.</div>
              {result?.importReady && (
                <ResultBox>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700"><CheckCircle2 size={15} /> CV extracted</div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {["fullName","email","phone","role","summary","workExperience","officeAutomation","techKnowledge","gradCourse","gradCollege","gradUniv"].filter((key) => result[key]).map((key) => (
                      <div key={key} className="rounded-xl bg-slate-50 p-2"><div className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{key}</div><div className="mt-0.5 line-clamp-4 whitespace-pre-wrap text-xs text-slate-700">{String(result[key])}</div></div>
                    ))}
                  </div>
                  <button type="button" onClick={() => { const patch = { ...result }; delete patch.success; delete patch.type; delete patch.importReady; delete patch.notes; applyPatch(patch, "Imported CV fields applied"); }} className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">Fill my CV with extracted data</button>
                </ResultBox>
              )}
            </div>
          )}

          {activeAction === "bullets" && (
            <div className="mt-3 space-y-3">
              <textarea value={bulletInput} onChange={(e) => setBulletInput(e.target.value)} rows={7} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" placeholder="Rough notes likho: handled customers, billing, Excel reports, stock records..." />
              <button type="button" onClick={() => run("bulletImprove", { rawText: bulletInput || baseResume.workExperience })} disabled={loading || !(bulletInput || baseResume.workExperience).trim()} className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-60">{loading ? <Loader2 className="mx-auto animate-spin" size={15} /> : "Generate strong bullets"}</button>
              {result?.bullets && <ResultBox><BulletList items={result.bullets.map((b) => typeof b === "string" ? `• ${b}` : b)} /><div className="mt-3 rounded-xl bg-amber-50 p-2.5 text-[10px] leading-relaxed text-amber-900">AI will not invent metrics. Add real numbers such as team size, customers/day or sales handled if you have them.</div><button type="button" onClick={() => applyPatch({ workExperience: result.bullets.map((b) => `• ${typeof b === "string" ? b : b.text || b.bullet || ""}`).join("\n") }, "Experience bullets updated")} className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">Use these bullets</button></ResultBox>}
            </div>
          )}

          {activeAction === "consistency" && (
            <div className="mt-3 space-y-3"><p className="text-[11px] text-slate-600">AI dates, duplicate skills, repeated achievements, title mismatches aur formatting issues scan karega.</p><button type="button" onClick={() => run("consistencyCheck")} disabled={loading} className="w-full rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-900">{loading ? <Loader2 className="mx-auto animate-spin" size={15} /> : "Check resume consistency"}</button>{result && <ResultBox><div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-800"><ScanSearch size={15} /> Review findings</div><BulletList items={result.issues || result.warnings} empty="No major consistency issues detected." /></ResultBox>}</div>
          )}

          {(activeAction === "cover" || activeAction === "email") && (
            <div className="mt-3 space-y-3"><input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Target role" /><textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={6} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Paste job description (optional but recommended)..." /><button type="button" onClick={() => run(activeAction === "cover" ? "coverLetter" : "applicationEmail", { jobDescription })} disabled={loading || !targetRole.trim()} className="w-full rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60">{loading ? <Loader2 className="mx-auto animate-spin" size={15} /> : activeAction === "cover" ? "Generate cover letter" : "Generate application email"}</button>{result && <ResultBox>{result.subject && <div className="mb-3 rounded-xl bg-slate-50 p-2.5 text-xs font-bold text-slate-800">{result.subject}</div>}<div className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{result.coverLetter || result.body || result.enhancedText}</div><button type="button" onClick={() => navigator.clipboard?.writeText(result.coverLetter || result.body || result.enhancedText || "")} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><ClipboardPaste size={14} /> Copy to clipboard</button></ResultBox>}</div>
          )}

          {activeAction === "linkedin" && (
            <div className="mt-3 space-y-3"><button type="button" onClick={() => run("linkedinPack")} disabled={loading} className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700">{loading ? <Loader2 className="mx-auto animate-spin" size={15} /> : "Build LinkedIn profile pack"}</button>{result && <ResultBox><div className="space-y-3 text-xs text-slate-700"><div><div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700">Headline</div><div>{result.headline}</div></div><div><div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700">About</div><div className="whitespace-pre-wrap leading-relaxed">{result.about}</div></div>{result.experience && <div><div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700">Experience</div><div className="whitespace-pre-wrap leading-relaxed">{result.experience}</div></div>}</div></ResultBox>}</div>
          )}

          {activeAction === "interview" && (
            <div className="mt-3 space-y-3"><div className="flex items-center gap-2"><label className="text-[11px] font-semibold text-slate-700">Questions</label><select value={interviewCount} onChange={(e) => setInterviewCount(Number(e.target.value))} className="ml-auto rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"><option value={5}>5</option><option value={8}>8</option><option value={12}>12</option></select></div><button type="button" onClick={() => run("interviewPrep", { questionCount: interviewCount, jobDescription })} disabled={loading} className="w-full rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-700">{loading ? <Loader2 className="mx-auto animate-spin" size={15} /> : "Prepare my interview"}</button>{result?.questions && <ResultBox><div className="space-y-3">{result.questions.map((q, i) => <div key={i} className="rounded-xl border border-slate-100 p-2.5"><div className="text-xs font-bold text-slate-800">{i + 1}. {q.question || q}</div>{q.answerGuide && <div className="mt-1 text-[11px] leading-relaxed text-slate-500">{q.answerGuide}</div>}</div>)}</div>{result.introAnswer && <div className="mt-3 rounded-xl bg-orange-50 p-2.5 text-[11px] leading-relaxed text-orange-900"><b>Tell me about yourself:</b><br />{result.introAnswer}</div>}</ResultBox>}</div>
          )}
        </div>

        {error && <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[11px] leading-relaxed text-red-700"><AlertCircle size={15} className="mt-0.5 shrink-0" />{error}</div>}
        {result?.applied && <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] font-semibold text-emerald-700"><Check size={15} />{result.appliedMessage || "Applied"}</div>}
      </div>
    </div>
  );
}
