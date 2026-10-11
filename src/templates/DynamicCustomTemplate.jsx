import React from 'react';
import { RichText } from "../components/RichTextEditor";

export function DynamicCustomTemplate({ data, aiConfig, isPro }) {
  const { primaryColor = '#1e293b', backgroundColor = '#f8fafc', fontStyle = 'sans-serif' } = aiConfig || {};

  return (
    <div
      id="resume-document"
      className="bg-white p-10 w-[210mm] min-h-[297mm] shadow-lg mx-auto relative"
      style={{ fontFamily: fontStyle === 'serif' ? 'Georgia, serif' : 'Inter, sans-serif' }}
    >
      {!isPro && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
          <span className="text-8xl font-black uppercase tracking-widest text-slate-900 rotate-45">CV Maker Free</span>
        </div>
      )}

      <div className="p-6 mb-6 rounded-2xl" style={{ backgroundColor }}>
        <h1 className="text-3xl font-black" style={{ color: primaryColor }}>
          {data.fullName || 'YOUR NAME'}
        </h1>
        <p className="text-xs text-slate-600 mt-1">{[data.email, data.phone].filter(Boolean).join(' | ')}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase border-b pb-1 mb-2" style={{ color: primaryColor }}>
            Summary
          </h2>
          <p className="text-xs text-slate-700"><RichText value={data.summary || 'Your summary goes here...'} /></p>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase border-b pb-1 mb-2" style={{ color: primaryColor }}>
            Skills
          </h2>
          <p className="text-xs text-slate-700">{data.skills || 'Your skills go here...'}</p>
        </div>
      </div>
    </div>
  );
}
