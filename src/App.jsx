import React, { useState, useEffect } from "react";
import { AdminPanel, useAdminTrigger } from "./components/AdminPanel";
import { GrandLaunch } from "./components/GrandLaunch";
import { ResumeRenderer } from "./ResumeRenderer";
import { SEO } from "./SEO";
import { DownloadModal } from "./components/DownloadModal";
import { DesignSettings, DEFAULT_DESIGN, designToStyle, getPageDims } from "./components/DesignSettings";
import { NavbarLogo } from "./components/NavbarLogo";
import { RichTextEditor } from "./components/RichTextEditor";
import {
  AiEnhanceBar,
  RoleTuneCard,
  A4FitCard,
  BiodataGenerateCard,
  AtsOptimizerCard,
  TranslateCard,
  SkillsBreakCard,
  DesignSuggestCard,
  MarriageCultureCard,
  enhanceProfilePhoto,
} from "./components/AiEnhanceBar";
import { getPricing, getLaunchConfig, getServerPdfData } from "./lib/serverApi";
import { setPricingCache } from "./data/pricing";
import { InstallPrompt } from "./components/InstallPrompt";
import { TEMPLATES_CONFIG } from "./data/templates";
import { getLang, setLang as persistLang, t as tr } from "./i18n";
import {
  Download,
  User,
  GraduationCap,
  Briefcase,
  Heart,
  Target,
  LayoutTemplate,
  Eye,
  Edit3,
  FileText,
  ZoomIn,
  ZoomOut,
  Camera,
  X,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";



const createJobDraft = () => ({
  fullName: "",
  email: "",
  phone: "",
  address: "",
  summary: "",
  role: "",
  gradCourse: "",
  gradCollege: "",
  gradUniv: "",
  gradDiv: "",
  interSchool: "",
  interBoard: "",
  interDiv: "",
  sscSchool: "",
  sscBoard: "",
  sscDiv: "",
  workExperience: "",
  officeAutomation: "",
  techKnowledge: "",
  hobbies: "",
  photo: "",
});

export default function App() {
  const { adminOpen, closeAdmin, onLogoClick } = useAdminTrigger();
  const [activeTab, setActiveTab] = useState("personal");
  const [mobileTab, setMobileTab] = useState("content");
  const [lang, setLangState] = useState(() => getLang());
  const t = (key) => tr(lang, key);
  const toggleLang = () => {
    const next = lang === "hi" ? "en" : "hi";
    setLangState(next);
    persistLang(next);
  };
  const [selectedTemplateId, setSelectedTemplateId] = useState("tpl-b-001");
  const [colorPaletteId, setColorPaletteId] = useState("navy");
  const [creationType, setCreationType] = useState(null);
  const [templateCategory, setTemplateCategory] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProDownload, setIsProDownload] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(85);
  const [savedToast, setSavedToast] = useState("");
  const [designSettings, setDesignSettings] = useState(() => {
    try {
      const raw = localStorage.getItem("cvmaker_design_settings");
      if (raw) {
        const saved = JSON.parse(raw);
        if (Number(saved?.marginLeft) === 14 || Number(saved?.marginLeft) === 15) saved.marginLeft = 8;
        if (Number(saved?.marginRight) === 14 || Number(saved?.marginRight) === 15) saved.marginRight = 8;
        return { ...DEFAULT_DESIGN, ...saved };
      }
    } catch (_) {}
    return { ...DEFAULT_DESIGN };
  });
  const [designPanelOpen, setDesignPanelOpen] = useState(false);
  useEffect(() => {
    if (!designPanelOpen) return undefined;
    const timer = window.setTimeout(() => setDesignPanelOpen(false), 8000);
    return () => window.clearTimeout(timer);
  }, [designPanelOpen, designSettings]);
  const [showGrandLaunch, setShowGrandLaunch] = useState(false);
  const [serverPdfMode, setServerPdfMode] = useState(false);
  const [serverPdfLoading, setServerPdfLoading] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      if (creationType) {
        setCreationType(null);
        setActiveTab("personal");
        setMobileTab("content");
        setDesignPanelOpen(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [creationType]);

  useEffect(() => {
    getPricing().then(setPricingCache).catch(() => {});
    const isAdminRoute = window.location.hash === "#admin";
    getLaunchConfig().then((cfg) => {
      if (!isAdminRoute && cfg?.grandLaunchEnabled) setShowGrandLaunch(true);
    }).catch(() => {
      setShowGrandLaunch(false);
    });
  }, []);

  const updateDesignSettings = (next) => {
    setDesignSettings(next);
    try {
      localStorage.setItem("cvmaker_design_settings", JSON.stringify(next));
    } catch (_) {}
  };

  useEffect(() => {
    const hash = String(window.location.hash || "");
    const prefix = "#server-pdf=";
    if (!hash.startsWith(prefix)) return;
    const query = hash.slice(prefix.length);
    const amp = query.indexOf("&paymentId=");
    const token = decodeURIComponent(amp >= 0 ? query.slice(0, amp) : query);
    const paymentId = decodeURIComponent(amp >= 0 ? query.slice(amp + "&paymentId=".length) : "");
    if (!token || !paymentId) return;
    setServerPdfMode(true);
    setServerPdfLoading(true);
    getServerPdfData({ token, paymentId }).then((payload) => {
      const snapshot = payload?.snapshot;
      if (!snapshot) throw new Error("Paid resume snapshot not found.");
      setSelectedTemplateId(snapshot.selectedTemplateId || "tpl-b-001");
      setResumeData(snapshot.resumeData || {});
      setDesignSettings((prev) => ({ ...prev, ...(snapshot.designSettings || {}) }));
      document.documentElement.dataset.cvmakerPdfReady = "true";
    }).catch((error) => {
      console.error("Server PDF load failed:", error);
      document.documentElement.dataset.cvmakerPdfReady = "error";
    }).finally(() => setServerPdfLoading(false));
  }, []);


  const isMarriage = creationType === "marriage";
  const visibleTemplates = isMarriage
    ? TEMPLATES_CONFIG.filter((t) => t.layoutType === "marriage-500")
    : TEMPLATES_CONFIG.filter((t) => t.layoutType !== "marriage-500");
  const categories = ["All", ...Array.from(new Set(visibleTemplates.map((t) => t.category).filter(Boolean)))];
  const availableTemplates =
    templateCategory === "All"
      ? visibleTemplates
      : visibleTemplates.filter((t) => t.category === templateCategory);
  const currentSectionOrder = isMarriage
    ? ["personal", "family", "contact", "templates"]
    : ["personal", "summary", "experience", "education", "skills", "templates"];

  const OriginalMiniPreview = ({ tpl }) => {
    const o = tpl.original || {};
    const primary = o.primary || "#334155";
    const soft = o.soft || "#e2e8f0";
    const isSide = ["left","left-wide","vertical","contact-first","skills-first","education-first"].includes(o.shell);
    const isRight = ["right","right-wide","header-side"].includes(o.shell);
    const isCards = ["cards","soft-grid","portfolio","gallery"].includes(o.shell);
    const isCenter = ["timeline","column-rule","frame","statement","compact","quiet","classic-plus"].includes(o.shell);
    const dark = isSide || isRight;
    return (
      <div className="relative w-full h-full overflow-hidden" style={{ background: o.paper || "#fff" }}>
        <div className="absolute inset-0" style={{ opacity: 0.9 }}>
          {isSide && <div className="absolute left-0 top-0 bottom-0" style={{ width: o.shell?.includes("wide") ? "37%" : "30%", background: primary }} />}
          {isRight && <div className="absolute right-0 top-0 bottom-0" style={{ width: o.shell?.includes("wide") ? "37%" : "30%", background: primary }} />}
          {!isSide && !isRight && o.deco === "band" && <div className="absolute top-0 left-0 right-0 h-2" style={{background:primary}}/>}
          {!isSide && !isRight && o.deco === "corner" && <div className="absolute top-0 right-0 w-8 h-8" style={{background:primary}}/>}
          {!isSide && !isRight && o.deco === "diagonal" && <div className="absolute -right-6 -top-3 w-24 h-8 rotate-[-12deg]" style={{background:soft}}/>}
          {!isSide && !isRight && o.deco === "notch" && <div className="absolute left-0 top-0 w-10 h-10" style={{background:primary,clipPath:"polygon(0 0,100% 0,0 100%)"}}/>}
          {isCenter && <div className="absolute left-[18%] right-[18%] top-5 h-px" style={{background:primary}}/>}
        </div>
        <div className="relative z-10 p-2 h-full">
          <div className={`flex ${o.head === "center" ? "justify-center text-center" : "justify-between"} items-center gap-1.5`}>
            {o.photo !== "none" && <div className={`${o.photo === "circle" ? "rounded-full" : "rounded"} w-6 h-6 shrink-0`} style={{background:soft,border:`2px solid ${primary}`}}/>}
            <div className="min-w-0 flex-1">
              <div className="h-2 rounded-sm mb-1" style={{width:o.head === "center" ? "60%" : "72%",background:dark ? "#fff" : primary,marginLeft:o.head === "center" ? "auto" : 0,marginRight:o.head === "center" ? "auto" : 0}}/>
              <div className="h-1 rounded-sm" style={{width:"42%",background:dark ? "rgba(255,255,255,.55)" : "#9aa7b2",marginLeft:o.head === "center" ? "auto" : 0,marginRight:o.head === "center" ? "auto" : 0}}/>
            </div>
          </div>
          <div className={`mt-2 grid ${isCards ? "grid-cols-2" : "grid-cols-1"} gap-1.5 ${isSide || isRight ? "ml-[31%]" : ""}`}>
            {[0,1,2,3,4].map((n)=><div key={n} className="rounded-sm p-1" style={{background:isCards ? (n%2?"rgba(226,232,240,.45)":"rgba(248,250,252,.9)") : "transparent",border:isCards?`1px solid ${soft}`:"none"}}>
              <div className="h-1 rounded-sm mb-1" style={{width:`${55 + ((n+o.variation)%4)*9}%`,background:primary,opacity:.8}}/>
              <div className="h-[2px] w-full rounded bg-slate-200 mb-1"/>
              <div className="h-[2px] w-4/5 rounded bg-slate-200"/>
            </div>)}
          </div>
        </div>
      </div>
    );
  };

  const goToNextSection = (fromId) => {
    const idx = currentSectionOrder.indexOf(fromId);
    if (idx >= 0 && idx < currentSectionOrder.length - 1) {
      const next = currentSectionOrder[idx + 1];
      setActiveTab(next);
      setMobileTab("content");
      setSavedToast("Saved ✓");
      setTimeout(() => setSavedToast(""), 1500);
    }
  };

  const handleSaveAndFinish = () => {
    setSavedToast("All details saved ✓");
    setTimeout(() => setSavedToast(""), 2000);
    setIsModalOpen(false);
    setDesignPanelOpen(false);
    setMobileTab("preview");
  };

  const objectiveOptions = [
    {
      category: "1. Freshers - General / Any Field",
      text: "Detail-oriented and motivated graduate looking to leverage strong analytical, communication, and problem-solving skills in an entry-level role. Eager to contribute to team success and grow professionally.",
    },
    {
      category: "1. Freshers - IT / Software / Coding",
      text: "Enthusiastic Computer Science graduate with strong knowledge of Java, Python, and web development. Seeking an entry-level Developer role to build scalable applications and contribute to real-world software projects.",
    },
    {
      category: "1. Freshers - Sales & Marketing",
      text: "Creative and goal-oriented professional with a passion for digital marketing and social media strategies. Looking to join the organization to help drive brand engagement and sales growth.",
    },
    {
      category: "1. Freshers - Commerce / Finance / HR",
      text: "Detail-conscious Commerce graduate skilled in basic accounting, MS Excel, and data analysis. Aiming to start my career in financial operations to support business growth and compliance.",
    },
    {
      category: "2. Experienced - 1-3 Years Experience",
      text: "Results-driven professional with 2+ years of experience in data management and operational analysis. Proven track record in optimizing processes and managing projects efficiently.",
    },
  ];

  const [resumeData, setResumeData] = useState(() => {
    try {
      const saved = localStorage.getItem("cvmaker_resume_draft_v3");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return createJobDraft();
  });

  useEffect(() => {
    if (!creationType) return;
    try {
      const key = creationType === "marriage"
        ? "cvmaker_marriage_draft_v3"
        : "cvmaker_resume_draft_v3";
      localStorage.setItem(key, JSON.stringify(resumeData));
    } catch (_) {}
  }, [resumeData, creationType]);

  const createMarriageDraft = () => ({
    fullName: "",
    dob: "",
    birthTime: "",
    birthPlace: "",
    rashi: "",
    nakshatra: "",
    gotra: "",
    manglik: "",
    religion: "",
    caste: "",
    height: "",
    weight: "",
    color: "",
    bloodGroup: "",
    gradCourse: "",
    workExperience: "",
    income: "",
    fatherName: "",
    fatherOccupation: "",
    motherName: "",
    motherOccupation: "",
    brother: "",
    sister: "",
    phone: "",
    email: "",
    address: "",
    photo: "",
    occupation: "",
    company: "",
    summary: "",
  });

  const handleCreationTypeSelect = (type) => {
    const marriage = type === "marriage";
    let nextData;
    try {
      const key = marriage ? "cvmaker_marriage_draft_v3" : "cvmaker_resume_draft_v3";
      const saved = localStorage.getItem(key);
      nextData = saved ? JSON.parse(saved) : null;
    } catch (_) {
      nextData = null;
    }
    setCreationType(type);
    try {
      window.history.pushState({ cvmakerCreationType: type }, "", window.location.href);
    } catch (_) {}
    setResumeData(nextData || (marriage ? createMarriageDraft() : createJobDraft()));
    setSelectedTemplateId(marriage ? "tpl-m-001" : "tpl-b-001");
    setTemplateCategory("All");
    setActiveTab("personal");
    setMobileTab("content");
    setDesignPanelOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResumeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownSelect = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
      setResumeData((prev) => ({ ...prev, summary: selectedValue }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPG, PNG)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const raw = reader.result;
      try {
        const polished = await enhanceProfilePhoto(raw, { size: 512, brightness: 1.08, contrast: 1.12 });
        setResumeData((prev) => ({ ...prev, photo: polished, photoRaw: raw }));
      } catch (_) {
        setResumeData((prev) => ({ ...prev, photo: raw }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoPolish = async () => {
    if (!resumeData.photo) return;
    try {
      const polished = await enhanceProfilePhoto(resumeData.photoRaw || resumeData.photo, {
        size: 512,
        brightness: 1.1,
        contrast: 1.15,
      });
      setResumeData((prev) => ({ ...prev, photo: polished }));
      setSavedToast("Photo polished ✓");
      window.setTimeout(() => setSavedToast(""), 2000);
    } catch (_) {
      alert("Photo polish failed");
    }
  };

  const handlePhotoRemove = () => {
    setResumeData((prev) => ({ ...prev, photo: "" }));
  };

  const selectedTpl = TEMPLATES_CONFIG.find((t) => t.id === selectedTemplateId);
  const supportsPhoto = !!selectedTpl;


  const handleDownloadPDF = async (isPro, verifiedPayment = null) => {
    setIsProDownload(isPro);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const element = document.getElementById("resume-document");
    if (!element) {
      console.error("Resume element not found");
      return;
    }

    const scaleParent = element.parentElement;
    const prevParentTransform = scaleParent ? scaleParent.style.transform : "";
    const prevParentWebkit = scaleParent ? scaleParent.style.webkitTransform : "";
    const prevParentClass = scaleParent ? scaleParent.className : "";

    if (scaleParent) {
      scaleParent.style.transform = "none";
      scaleParent.style.webkitTransform = "none";
      scaleParent.className = (scaleParent.className || "")
        .split(/\s+/)
        .filter(
          (c) =>
            !c.startsWith("scale-") &&
            !c.startsWith("xs:scale") &&
            !c.startsWith("sm:scale") &&
            !c.startsWith("md:scale") &&
            !c.startsWith("lg:scale")
        )
        .join(" ");
    }

    const marriageWrap = element.querySelector(".hm-exact-wrap");
    const prevMarriageTransform = marriageWrap ? marriageWrap.style.transform : "";
    const prevMarriageWebkit = marriageWrap ? marriageWrap.style.webkitTransform : "";
    const prevMarriageWidth = marriageWrap ? marriageWrap.style.width : "";
    const prevMarriageMinHeight = marriageWrap ? marriageWrap.style.minHeight : "";
    const prevMarriageTop = marriageWrap ? marriageWrap.style.top : "";
    if (marriageWrap) {
      marriageWrap.style.transform = "none";
      marriageWrap.style.webkitTransform = "none";
      marriageWrap.style.width = "100%";
      marriageWrap.style.minHeight = "100%";
      marriageWrap.style.top = "0";
    }

    const originalStyle = element.style.cssText;
    const dims = getPageDims(designSettings);
    element.style.width = `${dims.w}mm`;
    element.style.height = `${dims.h}mm`;
    element.style.minHeight = `${dims.h}mm`;
    element.style.maxHeight = `${dims.h}mm`;
    element.style.overflow = "hidden";
    element.style.margin = "0";
    element.style.boxSizing = "border-box";
    element.style.transform = "none";
    element.style.webkitTransform = "none";
    element.style.background = "#ffffff";

    const currentScale =
      parseFloat(element.style.getPropertyValue("--resume-font-scale")) ||
      parseFloat(getComputedStyle(element).getPropertyValue("--resume-font-scale")) ||
      1;
    element.style.setProperty("--resume-font-scale", String(currentScale));
    const baseFont = Number(designSettings.fontSize) || 10.5;
    const fontFactor = baseFont / 10.5;
    element.style.setProperty("--hm-font-factor", String(Number((currentScale * fontFactor).toFixed(3))));
    void element.offsetHeight;
    if (!designSettings.manualMode && element.scrollHeight > element.clientHeight - 2) {
      let lo = 0.70;
      let hi = currentScale;
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        element.style.setProperty("--resume-font-scale", String(mid));
        element.style.setProperty("--hm-font-factor", String(Number((mid * fontFactor).toFixed(3))));
        void element.offsetHeight;
        if (element.scrollHeight <= element.clientHeight - 2) lo = mid;
        else hi = mid;
      }
      const finalScale = Number(lo.toFixed(3));
      element.style.setProperty("--resume-font-scale", String(finalScale));
      element.style.setProperty("--hm-font-factor", String(Number((finalScale * fontFactor).toFixed(3))));
      void element.offsetHeight;
    }

    const filename = `${(resumeData.fullName || (isMarriage ? "Marriage_Biodata" : "Resume")).replace(/\s+/g, "_")}_${isMarriage ? "Marriage_Biodata" : "CV"}.pdf`;

    try {
      if (window.html2pdf) {
        const opt = {
          margin: [0, 0, 0, 0],
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            scrollY: 0,
            scrollX: 0,
            logging: false,
            backgroundColor: "#ffffff",
            onclone: (clonedDoc) => {
              const clonedEl = clonedDoc.getElementById("resume-document");
              if (!clonedEl) return;
              clonedEl.style.transform = "none";
              clonedEl.style.webkitTransform = "none";
              clonedEl.style.overflow = "hidden";
              const wrap = clonedEl.querySelector(".hm-exact-wrap");
              if (wrap) {
                wrap.style.transform = "none";
                wrap.style.webkitTransform = "none";
                wrap.style.width = "100%";
                wrap.style.height = "100%";
                wrap.style.minHeight = "100%";
                wrap.style.top = "0";
                wrap.style.left = "0";
              }
              clonedEl.querySelectorAll(".hm-card, .a4-marriage-template").forEach((card) => {
                card.style.width = "100%";
                card.style.height = "100%";
                card.style.minHeight = "100%";
                card.style.maxHeight = "100%";
                card.style.boxSizing = "border-box";
              });
            },
          },
          jsPDF: {
            unit: "mm",
            format:
              designSettings.pageSize === "Letter"
                ? "letter"
                : designSettings.pageSize === "Custom"
                  ? [dims.w, dims.h]
                  : "a4",
            orientation: "portrait",
          },
          pagebreak: { mode: ["avoid-all"] },
        };

        const pdf = await window.html2pdf().set(opt).from(element).toPdf().get("pdf");
        if (designSettings.fitToOnePage !== false) {
          const total = pdf.internal.getNumberOfPages();
          for (let i = total; i > 1; i--) {
            pdf.deletePage(i);
          }
        }

        pdf.save(filename);

      } else {
        window.print();
      }
    } catch (error) {
      console.error("PDF Export Error:", error);
      try {
        window.print();
      } catch (_) {}
    } finally {
      element.style.cssText = originalStyle;
      if (scaleParent) {
        scaleParent.style.transform = prevParentTransform;
        scaleParent.style.webkitTransform = prevParentWebkit;
        scaleParent.className = prevParentClass;
      }
      if (marriageWrap) {
        marriageWrap.style.transform = prevMarriageTransform;
        marriageWrap.style.webkitTransform = prevMarriageWebkit;
        marriageWrap.style.width = prevMarriageWidth;
        marriageWrap.style.minHeight = prevMarriageMinHeight;
        marriageWrap.style.top = prevMarriageTop;
      }
      setIsProDownload(false);
    }
  };

  if (serverPdfMode) {
    return (
      <div className="min-h-screen bg-white flex items-start justify-center p-0">
        {serverPdfLoading ? <div className="text-sm text-slate-500 mt-8">Preparing resume PDF…</div> : <ResumeRenderer selectedTemplateId={selectedTemplateId} data={resumeData} isPro={true} designSettings={designSettings} colorPaletteId={colorPaletteId} />}
      </div>
    );
  }

  if (!creationType) {
    return (
      <>
        <SEO />
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center shadow-sm">
            <NavbarLogo />
          </header>
          <main className="flex-1 flex items-center justify-center p-5">
            <div className="w-full max-w-3xl">
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex justify-center mb-3">
                  <button
                    type="button"
                    onClick={toggleLang}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-bold shadow-sm hover:bg-slate-50"
                    title={t("langHint")}
                  >
                    🌐 {t("langToggle")}
                  </button>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
                  <FileText size={14} /> {t("appBadge")}
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {t("chooserTitle")}
                </h1>
                <p className="mt-2 text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
                  {t("chooserSub")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <button
                  type="button"
                  onClick={() => handleCreationTypeSelect("job")}
                  className="group text-left bg-white border-2 border-slate-200 hover:border-blue-500 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all active:scale-[0.99]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition">
                    <Briefcase size={28} />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900">{t("jobTitle")}</h2>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">{t("jobDesc")}</p>
                  <span className="inline-flex items-center gap-2 mt-5 text-sm font-bold text-blue-600">{t("jobCta")} <ArrowRight size={16} /></span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCreationTypeSelect("marriage")}
                  className="group text-left bg-white border-2 border-slate-200 hover:border-rose-500 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all active:scale-[0.99]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-5 group-hover:bg-rose-600 group-hover:text-white transition">
                    <Heart size={28} />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900">{t("marriageTitle")}</h2>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">{t("marriageDesc")}</p>
                  <span className="inline-flex items-center gap-2 mt-5 text-sm font-bold text-rose-600">{t("marriageCta")} <ArrowRight size={16} /></span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

    const navItems = isMarriage
    ? [
        { id: "personal", label: t("mPersonal"), icon: User, hint: t("mPersonalHint") },
        { id: "family", label: t("mFamily"), icon: Heart, hint: t("mFamilyHint") },
        { id: "contact", label: t("mContact"), icon: FileText, hint: t("mContactHint") },
        { id: "templates", label: t("mTemplates"), icon: LayoutTemplate, hint: t("mTemplatesHint") },
      ]
    : [
        { id: "personal", label: t("jPersonal"), icon: User, hint: t("jPersonalHint") },
        { id: "objective", label: t("jObjective"), icon: Target, hint: t("jObjectiveHint") },
        { id: "experience", label: t("jExperience"), icon: Briefcase, hint: t("jExperienceHint") },
        { id: "education", label: t("jEducation"), icon: GraduationCap, hint: t("jEducationHint") },
        { id: "skills", label: t("jSkills"), icon: Heart, hint: t("jSkillsHint") },
        { id: "templates", label: t("jTemplates"), icon: LayoutTemplate, hint: t("jTemplatesHint") },
      ];

  const inputClass =
    "w-full bg-white border border-gray-200 text-gray-800 p-2.5 text-sm rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition placeholder:text-gray-400";
  const labelClass = "text-xs font-semibold text-gray-700 block mb-1";
  const helperClass = "text-[11px] text-gray-400 mt-0.5 leading-snug";
  const selectOnFocus = (e) => {
    try {
      e.target.select();
    } catch (_) {}
  };

  return (
    <>
      <SEO />
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      {savedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
          {savedToast}
        </div>
      )}
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => {
              setCreationType(null);
              setActiveTab("personal");
              setMobileTab("content");
              setDesignPanelOpen(false);
              try { window.history.back(); } catch (_) {}
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shrink-0"
            title={t("backTitle")}
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">{t("back")}</span>
          </button>
          <button type="button" onClick={onLogoClick} className="cursor-pointer bg-transparent border-0 p-0 min-w-0">
            <NavbarLogo />
          </button>
        </div>

        {/* Desktop step indicator */}
        <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1 font-medium text-blue-600">
            <CheckCircle2 size={12} /> {t("stepFill")}
          </span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="font-medium">Choose Template</span>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="font-medium">Download PDF</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-[11px] font-bold hover:bg-slate-50"
            title={t("langHint")}
          >
            🌐 {t("langToggle")}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 min-h-[40px]"
          >
            <Download size={14} />
            <span>{t("downloadPdf")}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Nav Tabs */}
        <div className="lg:hidden absolute top-0 left-0 right-0 bg-white border-b z-30 flex justify-around gap-1 p-2 text-[11px] sm:text-xs font-bold shadow-sm safe-area-top">
          <button
            onClick={() => setMobileTab("sidebar")}
            className={`flex-1 px-2 py-2.5 rounded-xl transition flex flex-col items-center gap-0.5 min-h-[44px] ${
              mobileTab === "sidebar" ? "bg-blue-50 text-blue-600" : "text-slate-600"
            }`}
          >
            <span>{t("menu")}</span>
          </button>
          <button
            onClick={() => setMobileTab("content")}
            className={`flex-1 px-2 py-2.5 rounded-xl transition flex flex-col items-center gap-0.5 min-h-[44px] ${
              mobileTab === "content" ? "bg-blue-50 text-blue-600" : "text-slate-600"
            }`}
          >
            <span>{t("edit")}</span>
          </button>
          <button
            onClick={() => setMobileTab("preview")}
            className={`flex-1 px-2 py-2.5 rounded-xl transition flex flex-col items-center gap-0.5 min-h-[44px] ${
              mobileTab === "preview" ? "bg-blue-50 text-blue-600" : "text-slate-600"
            }`}
          >
            <span>{t("preview")}</span>
          </button>
        </div>

        {/* Panel 1: Left Navigation Sidebar */}
        <aside
          className={`w-full lg:w-60 bg-white border-r border-slate-200 p-4 overflow-y-auto lg:block shrink-0 ${
            mobileTab === "sidebar" ? "block pt-12" : "hidden"
          }`}
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            {t("buildResume")}
          </div>
          <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
            {t("buildHint")}
          </p>
          <p className="text-[10px] text-blue-600/80 mb-3 leading-relaxed bg-blue-50 rounded-lg px-2 py-1.5">
            {t("tipMobile")}
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileTab("content");
                  }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 text-sm transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
                      : "text-slate-700 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <Icon size={16} className={`mt-0.5 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  <span className="flex flex-col">
                    <span className={`font-semibold ${isActive ? "text-blue-700" : ""}`}>{item.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{item.hint}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Current Selection
            </div>
            <div className="space-y-1.5 text-xs text-slate-500">
              <p>
{t("selectTemplate")}: <span className="font-semibold text-slate-700">{visibleTemplates.length}</span>
              </p>
              <p>
                Selected:{" "}
                <span className="font-semibold text-blue-600">
                  {TEMPLATES_CONFIG.find((t) => t.id === selectedTemplateId)?.name || "—"}
                </span>
              </p>
              <p>
                Tier:{" "}
                <span className="font-semibold text-gray-700">
                  {TEMPLATES_CONFIG.find((t) => t.id === selectedTemplateId)?.category || "—"}
                </span>
              </p>
            </div>
          </div>
        </aside>

        {/* Panel 2: Dynamic Form / Templates Selector */}
        <section
          className={`w-full lg:w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto lg:block shrink-0 ${
            mobileTab === "content" ? "block pt-12" : "hidden"
          }`}
        >
          {/* Templates Grid */}
          {activeTab === "templates" && (
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                <LayoutTemplate size={16} className="text-blue-600" />
                Choose Template
              </h2>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                Sab details fill karne ke baad yahan template choose karo. Phir Save & Finish dabao.
              </p>

              {/* Tier Filter */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {categories.map((cat) => {
                  const count =
                    cat === "All"
                      ? visibleTemplates.length
                      : visibleTemplates.filter((t) => t.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setTemplateCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                        templateCategory === cat
                          ? "bg-blue-600 text-white shadow"
                          : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {cat}
                      <span className="ml-1 opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                {availableTemplates.map((tpl) => {
                  const s = tpl.styles || {};
                  const isSelected = selectedTemplateId === tpl.id;
                  const primary = s.primaryColor || s.accentColor || "#3b82f6";
                  const accent = s.accentColor || s.headerBg || primary;
                  const sidebar = s.sidebarBg || null;
                  const isSidebar =
                    tpl.layoutType === "sidebar-left" ||
                    tpl.layoutType === "two-column" ||
                    tpl.layoutType === "modern-teal" ||
                    tpl.layoutType === "purple-split";
                  const isAccent = tpl.layoutType === "accent-bar";

                  return (
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`bg-white border-2 rounded-xl p-1.5 text-left cursor-pointer shadow-sm transition hover:shadow ${
                        isSelected
                          ? "border-blue-600 ring-2 ring-blue-100"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="h-16 bg-gray-50 rounded-lg mb-1.5 flex overflow-hidden">
                        {tpl.layoutType === "original-200" ? (
                          <OriginalMiniPreview tpl={tpl} />
                        ) : tpl.previewImage && tpl.spriteId ? (
                          <svg
                            viewBox="0 0 794 1123"
                            className="w-full h-full"
                            role="img"
                            aria-label={tpl.name}
                            preserveAspectRatio="xMidYMid slice"
                          >
                            <use href={`/templates/templates.svg#${tpl.spriteId}`} />
                          </svg>
                        ) : tpl.previewImage ? (
                          <img
                            src={tpl.previewImage}
                            alt={tpl.name}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                        {!tpl.previewImage && isSidebar && (
                          <div
                            className="w-[28%] h-full"
                            style={{ backgroundColor: sidebar || "#0f172a" }}
                          />
                        )}
                        {!tpl.previewImage && isAccent && (
                          <div
                            className="w-1.5 h-full shrink-0"
                            style={{ backgroundColor: accent }}
                          />
                        )}
                        {!tpl.previewImage && <div className="flex-1 p-1.5 flex flex-col gap-0.5">
                          <div
                            className="h-2 w-3/4 rounded-sm"
                            style={{ backgroundColor: primary, opacity: 0.85 }}
                          />
                          <div className="h-1 w-full rounded-sm bg-gray-200" />
                          <div className="h-1 w-5/6 rounded-sm bg-gray-200" />
                          <div
                            className="h-1 w-2/3 rounded-sm mt-0.5"
                            style={{ backgroundColor: accent, opacity: 0.5 }}
                          />
                        </div>}
                      </div>
                      <div className="px-1 pb-0.5">
                        <p className="text-[10px] font-semibold text-gray-800 truncate leading-tight">
                          {tpl.name}
                        </p>
                        <p className="text-[8px] text-gray-400 truncate">
                          {tpl.category} · {tpl.layoutType}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleSaveAndFinish}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                Save & Finish
              </button>

              <section className="mt-5 rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-600 leading-relaxed" aria-labelledby="seo-intro-heading">
                <h1 id="seo-intro-heading" className="text-sm font-bold text-gray-900 mb-2">Free CV Maker &amp; Resume Builder Online</h1>
                <p>Build a professional CV or resume online with ATS-friendly templates for freshers, experienced professionals, students, and job seekers. Add your personal details, career objective, work experience, education, skills, and hobbies, then export your finished resume as a PDF.</p>
                <h2 className="text-xs font-bold text-gray-800 mt-3 mb-1">Professional resume templates</h2>
                <p>Choose from clean, ATS-friendly resume templates across Basic and Professional styles. Pick a design, fill your details, and download a single-page PDF instantly.</p>
                <h2 className="text-xs font-bold text-gray-800 mt-3 mb-1">ATS-friendly CVs</h2>
                <p>Use clean, readable layouts that make important sections easy for recruiters and applicant tracking systems to scan. Keep your CV focused on relevant skills, measurable achievements, and clear job experience.</p>
                <h2 className="text-xs font-bold text-gray-800 mt-3 mb-1">Frequently asked questions</h2>
                <details className="mb-1">
                  <summary className="cursor-pointer font-semibold text-gray-700">Can I create a CV online for free?</summary>
                  <p className="mt-1">Yes. Create your CV in the browser, choose a template, edit your information, and export it as a PDF.</p>
                </details>
                <details className="mb-1">
                  <summary className="cursor-pointer font-semibold text-gray-700">Are the templates ATS-friendly?</summary>
                  <p className="mt-1">Clean, readable layouts are available to help recruiters and applicant tracking systems scan important resume sections.</p>
                </details>
                <details>
                  <summary className="cursor-pointer font-semibold text-gray-700">Who can use this resume builder?</summary>
                  <p className="mt-1">Students, freshers, experienced professionals, and job seekers can use the CV maker.</p>
                </details>
              </section>
            </div>
          )}

          {/* Personal Info */}
          {activeTab === "personal" && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                <User size={16} className="text-blue-600" /> {isMarriage ? t("mPersonal") : t("jPersonal")}
              </h2>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                {isMarriage ? t("marriagePersonalHint") : t("jobPersonalHint")}
              </p>

              {supportsPhoto && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <label className={labelClass}>Profile Photo</label>
                  <p className={helperClass}>
                    Har template me photo use kar sakte hain. JPG/PNG/WEBP, max 2 MB.
                  </p>
                  <div className="flex items-center gap-3">
                    {resumeData.photo ? (
                      <div className="relative">
                        <img
                          src={resumeData.photo}
                          alt="Profile"
                          className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                        />
                        <button
                          type="button"
                          onClick={handlePhotoRemove}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          title="Remove photo"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Camera size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-2 rounded-lg transition border border-blue-200 text-center">
                        {resumeData.photo ? "Change Photo" : "Upload Photo"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {resumeData.photo && (
                        <button
                          type="button"
                          onClick={handlePhotoPolish}
                          className="text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-1 rounded-lg hover:bg-violet-100"
                        >
                          AI Auto-Crop & Polish
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Upload par auto face-center crop + passport-style lighting apply hota hai.
                  </p>
                </div>
              )}

              {isMarriage ? (
                <>
                  <div>
                    <label className={labelClass}>Name</label>
                    <input name="fullName" value={resumeData.fullName || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. Rahul Kumar" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className={labelClass}>{t("dob")}</label>
                      <input name="dob" type="date" value={resumeData.dob || ""} onChange={handleInputChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t("birthTime")}</label>
                      <input name="birthTime" type="time" value={resumeData.birthTime || ""} onChange={handleInputChange} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t("birthPlace")}</label>
                    <input name="birthPlace" value={resumeData.birthPlace || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. Kargahar, Bihar" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className={labelClass}>{t("rashi")}</label>
                      <input name="rashi" value={resumeData.rashi || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. Mesh" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t("nakshatra")}</label>
                      <input name="nakshatra" value={resumeData.nakshatra || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. Rohini" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t("gotra")}</label>
                      <input name="gotra" value={resumeData.gotra || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. Kashyap" className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className={labelClass}>{t("manglik")}</label>
                      <input name="manglik" value={resumeData.manglik || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. Yes / No" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t("religion")}</label>
                      <input name="religion" value={resumeData.religion || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. Hindu" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t("caste")}</label>
                      <input name="caste" value={resumeData.caste || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. Brahmin" className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className={labelClass}>{t("height")}</label>
                      <input name="height" value={resumeData.height || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. 5 ft 7 in" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t("weight")}</label>
                      <input name="weight" value={resumeData.weight || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. 60 KG" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t("color")}</label>
                      <input name="color" value={resumeData.color || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. Fair / Wheatish" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t("bloodGroup")}</label>
                    <input name="bloodGroup" value={resumeData.bloodGroup || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. A+, B+, O+, AB+" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t("qualification")}</label>
                    <input name="gradCourse" value={resumeData.gradCourse || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. B.Com, MBA" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t("workDetails")}</label>
                    <textarea name="workExperience" value={resumeData.workExperience || ""} onChange={handleInputChange} onFocus={selectOnFocus} rows={3} placeholder="Job / business / company / work details" className={`${inputClass} resize-none`} />
                  </div>
                  <div>
                    <label className={labelClass}>{t("income")}</label>
                    <input name="income" value={resumeData.income || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. 7.2 LPA" className={inputClass} />
                  </div>
                  <p className={helperClass}>All Marriage Biodata fields are optional. Leave any field blank and it will stay hidden in the biodata.</p>
                </>
              ) : (
                <>
                  <div>
                    <label className={labelClass}>{t("fullName")}</label>
                    <input name="fullName" value={resumeData.fullName} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. Rahul Kumar" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t("email")}</label>
                    <input name="email" type="email" value={resumeData.email} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="example@mail.com" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input name="phone" value={resumeData.phone} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="9876543210" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>{t("address")}</label>
                    <textarea name="address" value={resumeData.address} onChange={handleInputChange} onFocus={selectOnFocus} rows={3} placeholder="Full address" className={`${inputClass} resize-none`} />
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => goToNextSection("personal")}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
              >
                <Check size={16} />
                {t("saveNext")}
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Marriage Family Details */}
          {activeTab === "family" && isMarriage && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Heart size={16} className="text-rose-600" /> {t("mFamily")}
              </h2>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">{t("optionalNote")}</p>

              <BiodataGenerateCard
                resumeData={resumeData}
                lang={lang}
                onApply={(patch) => {
                  setResumeData((prev) => ({
                    ...prev,
                    summary: patch.summary || prev.summary,
                    familyDetails: patch.familyDetails || prev.familyDetails,
                    expectations: patch.expectations || prev.expectations,
                  }));
                }}
              />
              <MarriageCultureCard
                resumeData={resumeData}
                lang={lang}
                onApply={(patch) => setResumeData((prev) => ({ ...prev, ...patch }))}
              />

              <div className="space-y-3 p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <label className={labelClass}>{t("fatherName")}</label>
                  <input name="fatherName" value={resumeData.fatherName || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="Father's full name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t("fatherOcc")}</label>
                  <input name="fatherOccupation" value={resumeData.fatherOccupation || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. Business, Government Service" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t("motherName")}</label>
                  <input name="motherName" value={resumeData.motherName || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="Mother's full name" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t("motherOcc")}</label>
                  <input name="motherOccupation" value={resumeData.motherOccupation || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="e.g. Homemaker, Teacher" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t("brother")}</label>
                  <textarea name="brother" value={resumeData.brother || ""} onChange={handleInputChange} onFocus={selectOnFocus} rows={2} placeholder="Brother name / occupation / married status" className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label className={labelClass}>{t("sister")}</label>
                  <textarea name="sister" value={resumeData.sister || ""} onChange={handleInputChange} onFocus={selectOnFocus} rows={2} placeholder="Sister name / occupation / married status" className={`${inputClass} resize-none`} />
                </div>
                {(resumeData.summary || resumeData.familyDetails) && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <label className={labelClass}>AI About Me / Family text (editable)</label>
                    <textarea
                      name="summary"
                      value={resumeData.summary || ""}
                      onChange={handleInputChange}
                      onFocus={selectOnFocus}
                      rows={3}
                      placeholder="About Me generated by AI"
                      className={`${inputClass} resize-none`}
                    />
                    {resumeData.familyDetails && (
                      <textarea
                        name="familyDetails"
                        value={resumeData.familyDetails || ""}
                        onChange={handleInputChange}
                        onFocus={selectOnFocus}
                        rows={2}
                        placeholder="Family details generated by AI"
                        className={`${inputClass} resize-none`}
                      />
                    )}
                  </div>
                )}
              </div>

              <button type="button" onClick={() => goToNextSection("family")} className="w-full mt-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-2">
                <Check size={16} /> Save & Next <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Marriage Contact Details */}
          {activeTab === "contact" && isMarriage && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Briefcase size={16} className="text-rose-600" /> {t("mContact")}
              </h2>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">{t("optionalNote")}</p>
              <div>
                <label className={labelClass}>Mobile No.</label>
                <input name="phone" type="tel" value={resumeData.phone || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="9876543210" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email ID</label>
                <input name="email" type="email" value={resumeData.email || ""} onChange={handleInputChange} onFocus={selectOnFocus} placeholder="example@mail.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("address")}</label>
                <textarea name="address" value={resumeData.address || ""} onChange={handleInputChange} onFocus={selectOnFocus} rows={4} placeholder="Full address" className={`${inputClass} resize-none`} />
              </div>
              <p className={helperClass}>Blank contact fields are automatically hidden from the final biodata.</p>
              <button type="button" onClick={() => goToNextSection("contact")} className="w-full mt-4 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-2">
                <Check size={16} /> Save & Choose Template <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Career Objective / Summary */}
          {activeTab === "objective" && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Target size={16} className="text-blue-600" /> Career Objective
              </h2>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                Short me batao aap kya job chahte ho. Sample select karke edit bhi kar sakte ho. AI se polish bhi kar sakte ho.
              </p>
              <RoleTuneCard
                resumeData={resumeData}
                lang={lang}
                onApply={(patch) => setResumeData((prev) => ({ ...prev, ...patch }))}
              />
              <A4FitCard
                resumeData={resumeData}
                lang={lang}
                onApply={(patch) => setResumeData((prev) => ({ ...prev, ...patch }))}
              />
              <AtsOptimizerCard
                resumeData={resumeData}
                lang={lang}
                onApply={(patch) => setResumeData((prev) => ({ ...prev, ...patch }))}
              />
              <TranslateCard
                lang={lang}
                getText={() => resumeData.summary || ""}
                onApply={(text) => setResumeData((prev) => ({ ...prev, summary: text }))}
              />
              <DesignSuggestCard
                resumeData={resumeData}
                lang={lang}
                onApplyTheme={(theme) => {
                  const id = theme?.paletteId || "navy";
                  const allowed = ["navy", "teal", "emerald", "slate", "charcoal", "burgundy", "indigo", "forest"];
                  setColorPaletteId(allowed.includes(id) ? id : id === "maroon" ? "burgundy" : "navy");
                  if (theme?.profile === "fresher") {
                    setActiveTab("education");
                  } else if (theme?.profile === "experienced") {
                    setActiveTab("experience");
                  }
                  setSavedToast(theme?.themeLabel ? `Theme: ${theme.themeLabel}` : "Design applied");
                  window.setTimeout(() => setSavedToast(""), 2500);
                }}
              />
              <div>
                <label className={labelClass}>Ready-made samples</label>
                <select
                  onChange={handleDropdownSelect}
                  className={`${inputClass} cursor-pointer mb-2`}
                >
                  <option value="">-- Sample choose karo --</option>
                  {objectiveOptions.map((opt, idx) => (
                    <option key={idx} value={opt.text}>
                      {opt.category}
                    </option>
                  ))}
                </select>
              </div>
              <RichTextEditor
                label="Apna objective likho / edit karo"
                value={resumeData.summary}
                onChange={(html) => setResumeData((prev) => ({ ...prev, summary: html }))}
                rows={6}
                placeholder="Write your career objective in 2–4 lines..."
              />
              <AiEnhanceBar
                type="rewrite"
                label="AI Rewrite Objective"
                getPayload={() => ({
                  rawText: resumeData.summary || "",
                  targetRole: resumeData.role || "",
                  tone: "third-person",
                  lang,
                })}
                onResult={(data) =>
                  setResumeData((prev) => ({ ...prev, summary: data.enhancedText || prev.summary }))
                }
                extra={
                  <AiEnhanceBar
                    type="grammar"
                    label="Fix Grammar"
                    getPayload={() => ({
                      rawText: resumeData.summary || "",
                      tone: "third-person",
                      lang,
                    })}
                    onResult={(data) =>
                      setResumeData((prev) => ({ ...prev, summary: data.enhancedText || prev.summary }))
                    }
                  />
                }
              />

              <button
                type="button"
                onClick={() => goToNextSection("summary")}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Save & Next
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Work Experience */}
          {activeTab === "experience" && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Briefcase size={16} className="text-blue-600" /> Work Experience
              </h2>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                Job title, company, year aur 2–3 bullet points. Freshers ho to internship / projects likh sakte ho. AI se professional bullets banao.
              </p>
              <RichTextEditor
                label="Experience details"
                value={resumeData.workExperience}
                onChange={(html) => setResumeData((prev) => ({ ...prev, workExperience: html }))}
                rows={10}
                placeholder={"Job title – Company (Year)\n• Achieved ...\n• Managed ..."}
              />
              <AiEnhanceBar
                type="rewrite"
                label="AI Polish Bullets"
                getPayload={() => ({
                  rawText: resumeData.workExperience || "",
                  targetRole: resumeData.role || "",
                  tone: "third-person",
                  lang,
                })}
                onResult={(data) =>
                  setResumeData((prev) => ({
                    ...prev,
                    workExperience: data.enhancedText || prev.workExperience,
                  }))
                }
                extra={
                  <AiEnhanceBar
                    type="grammar"
                    label="Fix Grammar"
                    getPayload={() => ({
                      rawText: resumeData.workExperience || "",
                      tone: "third-person",
                      lang,
                    })}
                    onResult={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        workExperience: data.enhancedText || prev.workExperience,
                      }))
                    }
                  />
                }
              />
              <TranslateCard
                lang={lang}
                getText={() => resumeData.workExperience || ""}
                onApply={(text) => setResumeData((prev) => ({ ...prev, workExperience: text }))}
              />

              <button
                type="button"
                onClick={() => goToNextSection("experience")}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Save & Next
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Education */}
          {activeTab === "education" && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                <GraduationCap size={16} className="text-blue-600" /> Education
              </h2>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                Graduation, 12th aur 10th ke details bharo. Division / percentage clearly likho.
              </p>

              <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-blue-600">Graduation</span>
                <input
                  name="gradCourse"
                  placeholder="Course (e.g. B.Com)"
                  value={resumeData.gradCourse}
                  onChange={handleInputChange}
                  onFocus={selectOnFocus}
                  className={inputClass}
                />
                <input
                  name="gradCollege"
                  placeholder="College Name"
                  value={resumeData.gradCollege}
                  onChange={handleInputChange}
                  onFocus={selectOnFocus}
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="gradUniv"
                    placeholder="University"
                    value={resumeData.gradUniv}
                    onChange={handleInputChange}
                  onFocus={selectOnFocus}
                    className={inputClass}
                  />
                  <input
                    name="gradDiv"
                    placeholder="Division / %"
                    value={resumeData.gradDiv}
                    onChange={handleInputChange}
                  onFocus={selectOnFocus}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-2 p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-blue-600">Intermediate (12th)</span>
                <input
                  name="interSchool"
                  placeholder="School / College"
                  value={resumeData.interSchool}
                  onChange={handleInputChange}
                  onFocus={selectOnFocus}
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="interBoard"
                    placeholder="Board"
                    value={resumeData.interBoard}
                    onChange={handleInputChange}
                  onFocus={selectOnFocus}
                    className={inputClass}
                  />
                  <input
                    name="interDiv"
                    placeholder="Division"
                    value={resumeData.interDiv}
                    onChange={handleInputChange}
                  onFocus={selectOnFocus}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-2 p-3 bg-white rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-blue-600">SSC (10th)</span>
                <input
                  name="sscSchool"
                  placeholder="School Name"
                  value={resumeData.sscSchool}
                  onChange={handleInputChange}
                  onFocus={selectOnFocus}
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="sscBoard"
                    placeholder="Board"
                    value={resumeData.sscBoard}
                    onChange={handleInputChange}
                  onFocus={selectOnFocus}
                    className={inputClass}
                  />
                  <input
                    name="sscDiv"
                    placeholder="Division"
                    value={resumeData.sscDiv}
                    onChange={handleInputChange}
                  onFocus={selectOnFocus}
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => goToNextSection("education")}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Save & Next
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Skills & Hobbies */}
          {activeTab === "skills" && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                <Heart size={16} className="text-blue-600" /> Skills & Hobbies
              </h2>
              <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                Softwares, technical skills aur hobbies comma se alag karke likho. AI se role-based skills polish kar sakte ho.
              </p>
              <div>
                <label className={labelClass}>Office Automation</label>
                <input
                  name="officeAutomation"
                  value={resumeData.officeAutomation}
                  onChange={handleInputChange}
                  onFocus={selectOnFocus}
                  placeholder="e.g. MS Office, Excel, PowerPoint"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Technical Knowledge</label>
                <input
                  name="techKnowledge"
                  value={resumeData.techKnowledge}
                  onChange={handleInputChange}
                  onFocus={selectOnFocus}
                  placeholder="e.g. Tally, HTML, Data Entry"
                  className={inputClass}
                />
              </div>
              <AiEnhanceBar
                type="rewrite"
                label="AI Organize Skills"
                getPayload={() => ({
                  rawText: [resumeData.officeAutomation, resumeData.techKnowledge].filter(Boolean).join(", "),
                  targetRole: resumeData.role || "",
                  tone: "third-person",
                  lang,
                })}
                onResult={(data) => {
                  const text = data.enhancedText || "";
                  setResumeData((prev) => ({
                    ...prev,
                    officeAutomation: text || prev.officeAutomation,
                  }));
                }}
              />
              <SkillsBreakCard
                resumeData={resumeData}
                lang={lang}
                onApply={(patch) => setResumeData((prev) => ({ ...prev, ...patch }))}
              />
              <TranslateCard
                lang={lang}
                getText={() =>
                  [resumeData.officeAutomation, resumeData.techKnowledge].filter(Boolean).join(", ")
                }
                onApply={(text) => setResumeData((prev) => ({ ...prev, officeAutomation: text }))}
              />
              <div>
                <label className={labelClass}>Hobbies (comma separated)</label>
                <input
                  name="hobbies"
                  value={resumeData.hobbies}
                  onChange={handleInputChange}
                  onFocus={selectOnFocus}
                  placeholder="e.g. Reading, Travel, Chess"
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={() => goToNextSection("skills")}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Save & Next
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Panel 3: Live Preview with Zoom */}
        <main
          className={`flex-1 bg-gray-200 flex flex-col overflow-hidden relative lg:flex ${
            mobileTab === "preview" ? "flex pt-12" : "hidden"
          }`}
        >
          {/* Zoom Controls */}
          <div className="h-10 bg-white border-b border-gray-200 px-4 flex items-center justify-between text-xs shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-2 font-medium text-gray-600">
              <FileText size={14} className="text-blue-500" />
              <span className="hidden sm:inline">{t("livePreview")}</span>
              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-semibold">
                {designSettings.pageSize} {t("singlePage")}
              </span>
            </div>
            <div className="flex items-center gap-2 relative">
              <DesignSettings
                settings={designSettings}
                onChange={updateDesignSettings}
                isOpen={false}
                onToggle={() => setDesignPanelOpen((v) => !v)}
              />
              <span className="text-gray-500">{t("zoom")}: {zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 10, 150))}
                className="w-7 h-7 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition"
                title="Zoom in"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 10, 40))}
                className="w-7 h-7 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition"
                title="Zoom out"
              >
                <ZoomOut size={14} />
              </button>
            </div>
          </div>

          {/* Canvas — page size is always fixed A4 (or chosen page size). */}
          <div className="flex-1 overflow-auto p-4 flex justify-center items-start relative">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top center",
              }}
              className="transition-transform duration-150"
            >
              <ResumeRenderer
                selectedTemplateId={selectedTemplateId}
                data={resumeData}
                isPro={isProDownload}
                designSettings={designSettings}
                colorPaletteId={colorPaletteId}
              />
            </div>
          </div>

          {/* Design panel: opens as a bottom sheet, but its height only
              takes as much space as needed below the template. Max 55vh
              to leave plenty of room for the preview above. */}
          {designPanelOpen && (
            <div
              className="absolute z-40 left-0 right-0 bottom-0 bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(15,23,42,0.15)] rounded-t-2xl"
              style={{ maxHeight: "55vh" }}
            >
              {/* Drag handle + close bar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-10 h-1 rounded-full bg-slate-300" />
                  <span className="text-xs font-bold text-slate-700">Design Adjustments</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDesignPanelOpen(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1"
                >
                  Close
                </button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "calc(55vh - 44px)" }}>
                <DesignSettings
                  settings={designSettings}
                  onChange={updateDesignSettings}
                  isOpen={true}
                  onToggle={() => setDesignPanelOpen(false)}
                  className="border-0 rounded-none shadow-none"
                  showColumnWidth={!isMarriage}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      <DownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDownloadPDF={handleDownloadPDF}
        selectedTemplateId={selectedTemplateId}
        resumeEmail={resumeData.email}
        resumeName={resumeData.fullName}
        resumeData={resumeData}
        designSettings={designSettings}
      />

      <InstallPrompt />
      <AdminPanel isOpen={adminOpen} onClose={closeAdmin} />
      <GrandLaunch enabled={showGrandLaunch} onComplete={() => setShowGrandLaunch(false)} />
    </div>
    </>
  );
}