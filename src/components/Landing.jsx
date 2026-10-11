import React from "react";
import { NavbarLogo } from "./NavbarLogo";
import { TEMPLATES_CONFIG } from "../data/templates";
import {
  Monitor,
  Zap,
  Download,
  Smartphone,
  Home,
  LayoutTemplate,
  Edit3,
  Settings,
  Search,
  ArrowRight,
  Eye,
  Film,
  Share
} from "lucide-react";

const CATEGORIES = ["All", ...new Set(TEMPLATES_CONFIG.map((t) => t.category))].slice(0, 6);
const SWATCHES = TEMPLATES_CONFIG.slice(0, 8);
const TOTAL = TEMPLATES_CONFIG.length;

function TemplateSwatch({ tpl, compact }) {
  const s = tpl.styles || {};
  const primary = s.primaryColor || s.accentColor || "#2563eb";
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-md overflow-hidden shrink-0">
      <div className="h-10" style={{ backgroundColor: primary }} />
      <div className="p-1 space-y-0.5">
        <div className="h-1 w-4/5 bg-slate-700 rounded-full" />
        <div className="h-1 w-3/5 bg-slate-800 rounded-full" />
        {!compact && <div className="h-1 w-2/3 bg-slate-800 rounded-full" />}
      </div>
    </div>
  );
}

function LaptopMockup() {
  return (
    <div className="w-full max-w-[560px]">
      {/* Laptop lid */}
      <div className="rounded-t-xl border-4 border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Browser chrome */}
        <div className="bg-slate-800 px-3 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 bg-slate-900 rounded-md px-2 py-1 text-[9px] text-slate-500 ml-2">
            cvmaker.app
          </div>
        </div>

        {/* Screen content */}
        <div className="flex bg-slate-950 h-[300px]">
          {/* Sidebar */}
          <div className="hidden sm:flex w-24 bg-slate-900 border-r border-slate-800 flex-col p-2 gap-1 text-[8px] text-slate-400 shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-blue-600 text-white font-semibold">
              <LayoutTemplate size={10} /> Templates
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5">
              <Home size={10} /> Home
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5">
              <Edit3 size={10} /> Edit Resume
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5">
              <Download size={10} /> Download
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5">
              <Settings size={10} /> Settings
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 p-2.5 overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <p className="text-[10px] font-bold text-white leading-tight">Choose Your Template</p>
                <p className="text-[7px] text-slate-500">Select from {TOTAL} professionally designed templates</p>
              </div>
              <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md px-1.5 py-1 text-[7px] text-slate-500">
                <Search size={8} /> Search
              </div>
            </div>
            <div className="flex gap-1 mb-2 flex-wrap">
              {CATEGORIES.map((c, i) => (
                <span
                  key={c}
                  className={`text-[7px] px-1.5 py-0.5 rounded ${
                    i === 0 ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-500"
                  }`}
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {SWATCHES.map((tpl) => (
                <TemplateSwatch key={tpl.id} tpl={tpl} />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Base */}
      <div className="h-3 bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-md mx-3" />
      <div className="h-1.5 bg-slate-900 rounded-b-xl mx-8" />
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="w-[168px] rounded-[1.6rem] border-4 border-slate-700 bg-slate-900 shadow-2xl overflow-hidden shrink-0">
      <div className="bg-slate-950 px-2.5 pt-2 pb-1.5">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-4 h-4 rounded-md bg-blue-600 flex items-center justify-center">
            <LayoutTemplate size={9} className="text-white" />
          </div>
          <span className="text-[9px] font-black text-white">CV Maker</span>
        </div>
        <p className="text-[9px] font-bold text-white">Choose Template</p>
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md px-1.5 py-1 mt-1 text-[6px] text-slate-500">
          <Search size={7} /> Search templates
        </div>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {CATEGORIES.slice(0, 4).map((c, i) => (
            <span
              key={c}
              className={`text-[6px] px-1.5 py-0.5 rounded ${
                i === 0 ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-500"
              }`}
            >
              {c}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
          {SWATCHES.slice(0, 4).map((tpl) => (
            <TemplateSwatch key={tpl.id} tpl={tpl} compact />
          ))}
        </div>
      </div>
      <div className="bg-slate-900 border-t border-slate-800 py-1.5 flex items-center justify-around">
        <Home size={11} className="text-blue-400" />
        <LayoutTemplate size={11} className="text-slate-600" />
        <Edit3 size={11} className="text-slate-600" />
        <Download size={11} className="text-slate-600" />
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: Monitor, label: "Clean Design" },
  { icon: Zap, label: "ATS-Friendly" },
  { icon: Download, label: "Instant PDF" },
  { icon: Smartphone, label: "Mobile Ready" }
];

const REAL_FEATURE_CARDS = [
  {
    icon: Edit3,
    title: "Step-by-step Editor",
    desc: "Template → Details → Preview → Download"
  },
  {
    icon: Eye,
    title: "Live Preview",
    desc: "Har change real-time me dikhega"
  },
  {
    icon: Film,
    title: "Affordable PDF",
    desc: "Basic ₹9 • Professional ₹21 — clean, no watermark"
  },
  {
    icon: Share,
    title: "Install as App",
    desc: "Home screen pe add karke offline bhi use karo"
  }
];

export function Landing({ onStart }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <NavbarLogo />
        <button
          onClick={onStart}
          className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition text-xs sm:text-sm"
        >
          Shuru karein <ArrowRight size={14} />
        </button>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <div className="space-y-7 order-2 lg:order-1">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Professional resume, minutes me
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-md">
              Template choose karo, details bharo, aur clean single-page PDF download karo — browser se, kisi bhi device pe.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg border border-slate-700 flex items-center justify-center text-blue-400 shrink-0">
                  <Icon size={16} />
                </div>
                <span className="text-xs font-semibold text-slate-300">{label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onStart}
            className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/25 transition text-sm"
          >
            Start Building — Free <ArrowRight size={16} />
          </button>
        </div>

        {/* Right: device mockups */}
        <div className="order-1 lg:order-2 flex flex-col items-center gap-4">
          <div className="relative w-full flex justify-center">
            <LaptopMockup />
            <div className="hidden sm:block absolute -right-2 -bottom-6">
              <PhoneMockup />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-3 sm:pt-8">
            <span className="text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-full">
              Laptop / Desktop View
            </span>
            <span className="text-[10px] font-bold bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-full">
              Mobile View — Responsive
            </span>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {REAL_FEATURE_CARDS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-md"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600/15 text-blue-400 flex items-center justify-center">
                <Icon size={15} />
              </div>
              <p className="text-xs font-bold text-slate-100">{title}</p>
              <p className="text-[11px] text-slate-500 leading-snug">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
