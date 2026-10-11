/**
 * CVMaker AI - Reusable Master Job & Resume Template Engine
 * Renders all 200 Job/Resume templates across 12 distinct structural families.
 */

import React from 'react';
import { JobResumeData, DesignSettingsState } from '../data/initialData';
import { TemplateConfig } from '../data/catalog';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Award, CheckCircle2, Briefcase, GraduationCap, Code2, BookOpen } from 'lucide-react';

interface JobTemplateEngineProps {
  data: JobResumeData;
  template: TemplateConfig;
  settings?: DesignSettingsState;
  className?: string;
}

export const JobTemplateEngine: React.FC<JobTemplateEngineProps> = ({
  data,
  template,
  settings,
  className = ''
}) => {
  const { personal, experience, education, skills, projects, certifications, languages, declaration } = data;

  // Resolved palette (with optional custom overrides from settings)
  const primary = settings?.primaryColor || template.palette.primary;
  const secondary = template.palette.secondary;
  const accent = settings?.accentColor || template.palette.accent;
  const bg = template.palette.bg;
  const surface = template.palette.surface;
  const text = template.palette.text;
  const muted = template.palette.muted;
  const border = template.palette.border;

  // Typography font
  const fontFamily = settings?.fontFamily || template.fontFamily.body;
  const headingFont = template.fontFamily.heading;

  // Spacing & padding
  const spacingClass = settings?.spacing === 'compact' ? 'space-y-3 text-xs' :
    settings?.spacing === 'relaxed' ? 'space-y-6 text-sm' : 'space-y-4 text-xs md:text-sm';

  const marginPadding = settings?.margins === 'tight' ? 'p-6' :
    settings?.margins === 'wide' ? 'p-12' : 'p-8';

  const photoShape = settings?.photoShape !== 'none' ? (settings?.photoShape || template.photoStyle) : 'none';
  const showPhoto = photoShape !== 'none' && personal.photo;

  // Photo borderRadius classes
  const photoRadius = photoShape === 'circle' ? 'rounded-full' :
    photoShape === 'rounded' ? 'rounded-xl' :
    photoShape === 'arch' ? 'rounded-t-full rounded-b-lg' : 'rounded-none';

  // Section divider rendering
  const renderDivider = () => {
    switch (template.dividerStyle) {
      case 'double':
        return <div className="border-t-2 border-b my-1" style={{ borderColor: primary }} />;
      case 'dotted':
        return <div className="border-t-2 border-dotted my-1.5" style={{ borderColor: accent }} />;
      case 'gradient':
        return (
          <div
            className="h-0.5 w-full my-1.5 rounded-full"
            style={{ background: `linear-gradient(90deg, ${primary}, ${accent}, transparent)` }}
          />
        );
      case 'accent-pill':
        return (
          <div className="flex items-center gap-1.5 my-1.5">
            <div className="h-1 w-8 rounded-full" style={{ backgroundColor: primary }} />
            <div className="h-1 w-2 rounded-full" style={{ backgroundColor: accent }} />
            <div className="h-0.5 flex-1" style={{ backgroundColor: border }} />
          </div>
        );
      case 'none':
        return null;
      case 'solid':
      default:
        return <div className="border-t my-1" style={{ borderColor: primary }} />;
    }
  };

  // Section title component
  const SectionTitle = ({ title, icon: Icon }: { title: string; icon?: any }) => (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" style={{ color: primary }} />}
        <h3
          className="text-xs md:text-sm font-bold tracking-wider uppercase"
          style={{ color: primary, fontFamily: headingFont }}
        >
          {title}
        </h3>
      </div>
      {renderDivider()}
    </div>
  );

  // Border style container
  const borderContainerClass = template.borderStyle === 'clean-frame' ? 'border-2' :
    template.borderStyle === 'gold-double' ? 'border-4 border-double' :
    template.borderStyle === 'subtle-line' ? 'border' : '';

  return (
    <div
      className={`cvmaker-a4-document relative w-full bg-white text-slate-800 transition-all ${borderContainerClass} ${marginPadding} ${className}`}
      style={{
        backgroundColor: bg,
        color: text,
        fontFamily: fontFamily,
        borderColor: primary,
        minHeight: '297mm'
      }}
    >
      {/* Watermark if requested in settings */}
      {settings?.showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 z-0">
          <span className="text-8xl font-black uppercase tracking-widest text-slate-900 select-none -rotate-45">
            CV MAKER AI
          </span>
        </div>
      )}

      {/* =========================================================================
          FAMILY 1: ATS CLASSIC (Strict 1-Column, Maximum Parseability)
         ========================================================================= */}
      {template.layoutFamily === 'ats-classic' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center pb-2 border-b" style={{ borderColor: primary }}>
            <h1 className="text-2xl font-bold uppercase tracking-wide" style={{ color: primary }}>
              {personal.fullName}
            </h1>
            <p className="text-sm font-medium mt-0.5" style={{ color: secondary }}>
              {personal.jobTitle}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-3 text-xs mt-2 text-slate-600">
              {personal.phone && <span>{personal.phone}</span>}
              {personal.phone && personal.email && <span>•</span>}
              {personal.email && <span>{personal.email}</span>}
              {personal.email && personal.location && <span>•</span>}
              {personal.location && <span>{personal.location}</span>}
              {personal.linkedin && <span>•</span>}
              {personal.linkedin && <span>{personal.linkedin}</span>}
            </div>
          </div>

          {/* Professional Summary */}
          {personal.summary && (
            <div>
              <SectionTitle title="Professional Summary" />
              <p className="text-xs leading-relaxed text-slate-700">{personal.summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience?.length > 0 && (
            <div>
              <SectionTitle title="Professional Experience" />
              <div className="space-y-3">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline font-semibold text-xs">
                      <span style={{ color: primary }}>{exp.position}</span>
                      <span className="text-slate-500 font-normal">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 italic">
                      <span>{exp.company}</span>
                      <span>{exp.location}</span>
                    </div>
                    {exp.description && <p className="text-xs text-slate-700 mt-1">{exp.description}</p>}
                    {exp.highlights?.length > 0 && (
                      <ul className="list-disc list-inside text-xs space-y-0.5 mt-1 text-slate-700">
                        {exp.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education?.length > 0 && (
            <div>
              <SectionTitle title="Education" />
              <div className="space-y-2">
                {education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-baseline text-xs">
                    <div>
                      <span className="font-semibold" style={{ color: primary }}>{edu.degree}</span>
                      <span className="text-slate-600"> — {edu.institution}</span>
                      {edu.grade && <span className="text-slate-500"> ({edu.grade})</span>}
                    </div>
                    <span className="text-slate-500">{edu.startDate} – {edu.endDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills && (
            <div>
              <SectionTitle title="Skills & Competencies" />
              <div className="text-xs space-y-1 text-slate-700">
                {skills.technical?.length > 0 && (
                  <p><strong className="font-medium">Technical:</strong> {skills.technical.join(', ')}</p>
                )}
                {skills.tools?.length > 0 && (
                  <p><strong className="font-medium">Tools:</strong> {skills.tools.join(', ')}</p>
                )}
                {skills.soft?.length > 0 && (
                  <p><strong className="font-medium">Core Strengths:</strong> {skills.soft.join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects?.length > 0 && (
            <div>
              <SectionTitle title="Key Projects" />
              <div className="space-y-2 text-xs">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="font-semibold" style={{ color: primary }}>{proj.name} <span className="font-normal text-slate-500">({proj.techStack})</span></div>
                    <p className="text-slate-700">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          FAMILY 2: LEFT SIDEBAR (Sidebar Column with Photo + Main Column)
         ========================================================================= */}
      {template.layoutFamily === 'left-sidebar' && (
        <div className="grid grid-cols-12 gap-6 -m-8">
          {/* Left Dark/Accent Sidebar */}
          <div
            className="col-span-4 p-6 min-h-[297mm] space-y-5"
            style={{ backgroundColor: surface, borderRight: `2px solid ${border}` }}
          >
            {/* Photo */}
            {showPhoto && (
              <div className="flex justify-center mb-4">
                <img
                  src={personal.photo}
                  alt={personal.fullName}
                  className={`w-28 h-28 object-cover border-2 shadow-sm ${photoRadius}`}
                  style={{ borderColor: primary }}
                />
              </div>
            )}

            {/* Contact */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-xs" style={{ color: primary }}>Contact</h4>
              <div className="h-0.5 w-6 rounded" style={{ backgroundColor: accent }} />
              <div className="space-y-1.5 pt-1 text-slate-600">
                {personal.email && (
                  <div className="flex items-center gap-1.5 break-all">
                    <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                    <span>{personal.email}</span>
                  </div>
                )}
                {personal.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                    <span>{personal.phone}</span>
                  </div>
                )}
                {personal.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                    <span>{personal.location}</span>
                  </div>
                )}
                {personal.linkedin && (
                  <div className="flex items-center gap-1.5 break-all">
                    <Linkedin className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                    <span>{personal.linkedin}</span>
                  </div>
                )}
                {personal.github && (
                  <div className="flex items-center gap-1.5 break-all">
                    <Github className="w-3.5 h-3.5 shrink-0" style={{ color: primary }} />
                    <span>{personal.github}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {skills && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-xs" style={{ color: primary }}>Skills</h4>
                <div className="h-0.5 w-6 rounded" style={{ backgroundColor: accent }} />
                <div className="flex flex-wrap gap-1 pt-1">
                  {skills.technical?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium"
                      style={{ backgroundColor: bg, border: `1px solid ${border}`, color: text }}
                    >
                      {skill}
                    </span>
                  ))}
                  {skills.tools?.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium"
                      style={{ backgroundColor: bg, border: `1px solid ${border}`, color: text }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education in sidebar */}
            {education?.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-xs" style={{ color: primary }}>Education</h4>
                <div className="h-0.5 w-6 rounded" style={{ backgroundColor: accent }} />
                <div className="space-y-2 pt-1">
                  {education.map((edu) => (
                    <div key={edu.id} className="text-xs">
                      <p className="font-bold" style={{ color: text }}>{edu.degree}</p>
                      <p className="text-slate-600 text-[11px]">{edu.institution}</p>
                      <p className="text-slate-500 text-[10px]">{edu.startDate} – {edu.endDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {languages?.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-xs" style={{ color: primary }}>Languages</h4>
                <div className="h-0.5 w-6 rounded" style={{ backgroundColor: accent }} />
                <div className="space-y-1 text-slate-600 pt-1 text-[11px]">
                  {languages.map((lang, idx) => (
                    <div key={idx}>• {lang}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Main Column */}
          <div className="col-span-8 p-6 pl-2 space-y-5">
            {/* Name & Title Header */}
            <div>
              <h1 className="text-3xl font-extrabold uppercase tracking-tight" style={{ color: primary, fontFamily: headingFont }}>
                {personal.fullName}
              </h1>
              <p className="text-sm font-semibold tracking-wide uppercase mt-1" style={{ color: accent }}>
                {personal.jobTitle}
              </p>
              {personal.summary && (
                <p className="text-xs text-slate-600 leading-relaxed mt-3 border-l-2 pl-3" style={{ borderColor: accent }}>
                  {personal.summary}
                </p>
              )}
            </div>

            {/* Experience */}
            {experience?.length > 0 && (
              <div>
                <SectionTitle title="Work Experience" icon={Briefcase} />
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="text-xs">
                      <div className="flex justify-between items-baseline font-bold">
                        <span className="text-sm" style={{ color: primary }}>{exp.position}</span>
                        <span className="text-slate-500 text-[11px] font-normal">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      <div className="text-slate-600 font-medium mb-1">{exp.company} • {exp.location}</div>
                      {exp.description && <p className="text-slate-700 leading-relaxed mb-1.5">{exp.description}</p>}
                      {exp.highlights?.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          {exp.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects?.length > 0 && (
              <div>
                <SectionTitle title="Featured Projects" icon={Code2} />
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id} className="text-xs p-2.5 rounded border" style={{ backgroundColor: surface, borderColor: border }}>
                      <div className="font-bold flex justify-between" style={{ color: primary }}>
                        <span>{proj.name}</span>
                        <span className="text-[10px] font-normal text-slate-500">{proj.techStack}</span>
                      </div>
                      <p className="text-slate-600 mt-1">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications?.length > 0 && (
              <div>
                <SectionTitle title="Certifications" icon={Award} />
                <ul className="list-disc list-inside text-xs space-y-1 text-slate-700">
                  {certifications.map((cert, idx) => (
                    <li key={idx}>{cert}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          FAMILY 3: MODERN CORPORATE & OTHER 10 FAMILIES (Unified Pro Engine)
         ========================================================================= */}
      {template.layoutFamily !== 'ats-classic' && template.layoutFamily !== 'left-sidebar' && (
        <div className={spacingClass}>
          {/* Header Variant */}
          {template.headerStyle === 'banner' ? (
            <div
              className="-mx-8 -mt-8 p-6 mb-4 flex items-center justify-between"
              style={{ backgroundColor: primary, color: '#ffffff' }}
            >
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide" style={{ fontFamily: headingFont }}>
                  {personal.fullName}
                </h1>
                <p className="text-sm font-medium opacity-90 mt-0.5">{personal.jobTitle}</p>
                <div className="flex flex-wrap gap-4 text-xs opacity-80 mt-2">
                  {personal.email && <span>{personal.email}</span>}
                  {personal.phone && <span>{personal.phone}</span>}
                  {personal.location && <span>{personal.location}</span>}
                </div>
              </div>
              {showPhoto && (
                <img
                  src={personal.photo}
                  alt={personal.fullName}
                  className={`w-20 h-20 object-cover border-2 border-white shadow-md ${photoRadius}`}
                />
              )}
            </div>
          ) : (
            <div className={`flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b`} style={{ borderColor: border }}>
              <div className={template.headerStyle === 'center' ? 'text-center w-full' : ''}>
                <h1 className="text-2xl md:text-3xl font-bold uppercase" style={{ color: primary, fontFamily: headingFont }}>
                  {personal.fullName}
                </h1>
                <p className="text-sm font-semibold tracking-wide uppercase mt-0.5" style={{ color: accent }}>
                  {personal.jobTitle}
                </p>
                <div className={`flex flex-wrap gap-3 text-xs text-slate-600 mt-2 ${template.headerStyle === 'center' ? 'justify-center' : ''}`}>
                  {personal.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" />{personal.phone}</span>}
                  {personal.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" />{personal.email}</span>}
                  {personal.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />{personal.location}</span>}
                  {personal.linkedin && <span className="flex items-center gap-1"><Linkedin className="w-3 h-3 text-slate-400" />{personal.linkedin}</span>}
                </div>
              </div>
              {showPhoto && template.headerStyle !== 'center' && (
                <img
                  src={personal.photo}
                  alt={personal.fullName}
                  className={`w-20 h-20 object-cover border shadow-sm ${photoRadius}`}
                  style={{ borderColor: primary }}
                />
              )}
            </div>
          )}

          {/* Summary Box */}
          {personal.summary && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: surface, borderLeft: `3px solid ${primary}` }}>
              <h4 className="text-xs font-bold uppercase mb-1 tracking-wider" style={{ color: primary }}>
                Professional Overview
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">{personal.summary}</p>
            </div>
          )}

          {/* Two-Column Body Grid */}
          <div className="grid grid-cols-12 gap-6 pt-2">
            {/* Main Column (Experience & Projects) */}
            <div className="col-span-8 space-y-4">
              {experience?.length > 0 && (
                <div>
                  <SectionTitle title="Experience" icon={Briefcase} />
                  <div className="space-y-3.5">
                    {experience.map((exp) => (
                      <div key={exp.id} className="relative pl-3 border-l-2" style={{ borderColor: primary }}>
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-xs md:text-sm" style={{ color: text }}>{exp.position}</span>
                          <span className="text-[11px] text-slate-500 font-medium">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                        </div>
                        <div className="text-xs font-medium text-slate-600 mb-1">{exp.company} • {exp.location}</div>
                        {exp.description && <p className="text-xs text-slate-700 mb-1">{exp.description}</p>}
                        {exp.highlights?.length > 0 && (
                          <ul className="list-disc list-inside text-xs space-y-0.5 text-slate-700">
                            {exp.highlights.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {projects?.length > 0 && (
                <div>
                  <SectionTitle title="Key Projects" icon={Code2} />
                  <div className="space-y-2">
                    {projects.map((proj) => (
                      <div key={proj.id} className="p-2.5 rounded border text-xs" style={{ borderColor: border, backgroundColor: surface }}>
                        <div className="font-bold flex justify-between" style={{ color: primary }}>
                          <span>{proj.name}</span>
                          <span className="text-[10px] font-normal text-slate-500">{proj.techStack}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side Column (Skills, Education, Certs) */}
            <div className="col-span-4 space-y-4">
              {/* Skills */}
              {skills && (
                <div>
                  <SectionTitle title="Core Skills" icon={CheckCircle2} />
                  <div className="space-y-2 text-xs">
                    {skills.technical?.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">Technical</span>
                        <div className="flex flex-wrap gap-1">
                          {skills.technical.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-medium"
                              style={{ backgroundColor: surface, border: `1px solid ${border}`, color: text }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {skills.tools?.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">Tools</span>
                        <div className="flex flex-wrap gap-1">
                          {skills.tools.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-medium"
                              style={{ backgroundColor: surface, border: `1px solid ${border}`, color: text }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Education */}
              {education?.length > 0 && (
                <div>
                  <SectionTitle title="Education" icon={GraduationCap} />
                  <div className="space-y-2 text-xs">
                    {education.map((edu) => (
                      <div key={edu.id} className="p-2 rounded" style={{ backgroundColor: surface }}>
                        <p className="font-bold text-xs" style={{ color: text }}>{edu.degree}</p>
                        <p className="text-slate-600 text-[11px]">{edu.institution}</p>
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>{edu.grade}</span>
                          <span>{edu.endDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {certifications?.length > 0 && (
                <div>
                  <SectionTitle title="Certifications" icon={Award} />
                  <div className="space-y-1 text-xs text-slate-700">
                    {certifications.map((c, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-slate-400">•</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {languages?.length > 0 && (
                <div>
                  <SectionTitle title="Languages" icon={Globe} />
                  <div className="space-y-1 text-xs text-slate-700">
                    {languages.map((l, idx) => (
                      <div key={idx}>• {l}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Declaration for Indian Govt / PSU resumes */}
          {declaration && (
            <div className="pt-4 mt-4 border-t text-[11px] text-slate-500 italic" style={{ borderColor: border }}>
              <p>{declaration}</p>
              <div className="flex justify-between mt-3 text-xs not-italic font-semibold text-slate-700">
                <span>Date: ________________</span>
                <span>Signature: ({personal.fullName})</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
