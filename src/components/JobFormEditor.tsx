/**
 * CVMaker AI - Job & Resume Form Editor
 * Clean, responsive form sections with photo upload and AI triggers.
 * Input text size >= 16px on mobile (prevents iOS auto-zoom).
 */

import React, { useState } from 'react';
import { JobResumeData, JobExperience, JobEducation, JobProject } from '../data/initialData';
import { 
  User, Briefcase, GraduationCap, Code2, Award, Globe, Plus, Trash2, 
  Upload, Image as ImageIcon, ChevronDown, ChevronUp, Sparkles, CheckCircle2 
} from 'lucide-react';
import { t } from '../i18n';

interface JobFormEditorProps {
  data: JobResumeData;
  onChange: (updated: JobResumeData) => void;
  onOpenAiEnhance?: (field: string, text: string) => void;
}

export const JobFormEditor: React.FC<JobFormEditorProps> = ({
  data,
  onChange,
  onOpenAiEnhance
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    experience: true,
    education: true,
    skills: false,
    projects: false,
    certifications: false
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper to update personal info
  const handlePersonalChange = (key: keyof JobResumeData['personal'], value: string) => {
    onChange({
      ...data,
      personal: { ...data.personal, [key]: value }
    });
  };

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Photo must be smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handlePersonalChange('photo', base64);
    };
    reader.readAsDataURL(file);
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newExp: JobExperience = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      location: '',
      description: '',
      highlights: ['']
    };
    onChange({ ...data, experience: [newExp, ...data.experience] });
  };

  const handleUpdateExperience = (id: string, updated: Partial<JobExperience>) => {
    onChange({
      ...data,
      experience: data.experience.map((exp) => (exp.id === id ? { ...exp, ...updated } : exp))
    });
  };

  const handleDeleteExperience = (id: string) => {
    onChange({
      ...data,
      experience: data.experience.filter((exp) => exp.id !== id)
    });
  };

  // Education handlers
  const handleAddEducation = () => {
    const newEdu: JobEducation = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      grade: '',
      location: ''
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const handleUpdateEducation = (id: string, updated: Partial<JobEducation>) => {
    onChange({
      ...data,
      education: data.education.map((edu) => (edu.id === id ? { ...edu, ...updated } : edu))
    });
  };

  const handleDeleteEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter((edu) => edu.id !== id)
    });
  };

  // Projects handlers
  const handleAddProject = () => {
    const newProj: JobProject = {
      id: `proj-${Date.now()}`,
      name: '',
      techStack: '',
      description: '',
      link: ''
    };
    onChange({ ...data, projects: [...data.projects, newProj] });
  };

  const handleUpdateProject = (id: string, updated: Partial<JobProject>) => {
    onChange({
      ...data,
      projects: data.projects.map((proj) => (proj.id === id ? { ...proj, ...updated } : proj))
    });
  };

  const handleDeleteProject = (id: string) => {
    onChange({
      ...data,
      projects: data.projects.filter((proj) => proj.id !== id)
    });
  };

  return (
    <div className="space-y-4">
      {/* SECTION 1: PERSONAL & CONTACT */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('personal')}
          className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs md:text-sm font-bold text-slate-900">{t('personalDetails')}</h3>
              <p className="text-[11px] text-slate-500">Name, target role, contact information & photo</p>
            </div>
          </div>
          {openSections.personal ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.personal && (
          <div className="p-4 md:p-6 space-y-4">
            {/* Photo upload row */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                {data.personal.photo ? (
                  <img src={data.personal.photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="text-xs font-semibold text-slate-700 block">Candidate Photo</span>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Image
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {data.personal.photo && (
                    <button
                      type="button"
                      onClick={() => handlePersonalChange('photo', '')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">{t('fullName')}</label>
                <input
                  type="text"
                  value={data.personal.fullName}
                  onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">{t('jobTitle')}</label>
                <input
                  type="text"
                  value={data.personal.jobTitle}
                  onChange={(e) => handlePersonalChange('jobTitle', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="e.g. Senior Full Stack Engineer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">{t('email')}</label>
                <input
                  type="email"
                  value={data.personal.email}
                  onChange={(e) => handlePersonalChange('email', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="e.g. rahul@example.com"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">{t('phone')}</label>
                <input
                  type="tel"
                  value={data.personal.phone}
                  onChange={(e) => handlePersonalChange('phone', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-700 mb-1 block">{t('location')}</label>
                <input
                  type="text"
                  value={data.personal.location}
                  onChange={(e) => handlePersonalChange('location', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  placeholder="e.g. Bengaluru, Karnataka, India"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">{t('linkedin')}</label>
                <input
                  type="text"
                  value={data.personal.linkedin || ''}
                  onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  placeholder="linkedin.com/in/username"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">{t('github')}</label>
                <input
                  type="text"
                  value={data.personal.github || ''}
                  onChange={(e) => handlePersonalChange('github', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  placeholder="github.com/username"
                />
              </div>
            </div>

            {/* Professional Summary */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">{t('professionalSummary')}</label>
                {onOpenAiEnhance && (
                  <button
                    type="button"
                    onClick={() => onOpenAiEnhance('summary', data.personal.summary)}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md"
                  >
                    <Sparkles className="w-3 h-3" /> AI Enhance Summary
                  </button>
                )}
              </div>
              <textarea
                rows={3}
                value={data.personal.summary}
                onChange={(e) => handlePersonalChange('summary', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white leading-relaxed"
                placeholder="Brief summary of your professional journey, core strengths, and achievements..."
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: WORK EXPERIENCE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-slate-50/70">
          <button
            type="button"
            onClick={() => toggleSection('experience')}
            className="flex items-center gap-2.5 text-left flex-1"
          >
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-bold text-slate-900">{t('workExperience')} ({data.experience.length})</h3>
              <p className="text-[11px] text-slate-500">Employment history, designations & impact metrics</p>
            </div>
          </button>
          <button
            type="button"
            onClick={handleAddExperience}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {openSections.experience && (
          <div className="p-4 md:p-6 space-y-4">
            {data.experience.map((exp) => (
              <div key={exp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group">
                <button
                  type="button"
                  onClick={() => handleDeleteExperience(exp.id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                  title="Delete experience"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(exp.id, { company: e.target.value })}
                      className="w-full text-base md:text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      placeholder="e.g. Google India"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Role / Designation</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => handleUpdateExperience(exp.id, { position: e.target.value })}
                      className="w-full text-base md:text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      placeholder="e.g. Tech Lead"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Duration (Start – End)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => handleUpdateExperience(exp.id, { startDate: e.target.value })}
                        className="w-1/2 text-base md:text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                        placeholder="2021"
                      />
                      <span className="text-slate-400 text-xs">to</span>
                      <input
                        type="text"
                        value={exp.endDate}
                        disabled={exp.current}
                        onChange={(e) => handleUpdateExperience(exp.id, { endDate: e.target.value })}
                        className="w-1/2 text-base md:text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg disabled:bg-slate-100"
                        placeholder="Present"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => handleUpdateExperience(exp.id, { location: e.target.value })}
                      className="w-full text-base md:text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      placeholder="e.g. Bengaluru, India"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600">Key Contributions & Highlights</label>
                    {onOpenAiEnhance && (
                      <button
                        type="button"
                        onClick={() => onOpenAiEnhance('bullet', exp.description || exp.highlights.join('\n'))}
                        className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded"
                      >
                        <Sparkles className="w-2.5 h-2.5" /> Polish Bullets
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={2}
                    value={exp.description}
                    onChange={(e) => handleUpdateExperience(exp.id, { description: e.target.value })}
                    className="w-full text-base md:text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg leading-relaxed"
                    placeholder="Led development of mission critical microservices resulting in 35% performance gain..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: EDUCATION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-slate-50/70">
          <button
            type="button"
            onClick={() => toggleSection('education')}
            className="flex items-center gap-2.5 text-left flex-1"
          >
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs md:text-sm font-bold text-slate-900">{t('education')} ({data.education.length})</h3>
              <p className="text-[11px] text-slate-500">College, degrees, certifications & grades</p>
            </div>
          </button>
          <button
            type="button"
            onClick={handleAddEducation}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {openSections.education && (
          <div className="p-4 md:p-6 space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => handleDeleteEducation(edu.id)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Degree / Course</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleUpdateEducation(edu.id, { degree: e.target.value })}
                      className="w-full text-base md:text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      placeholder="e.g. B.Tech Computer Science"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Institution / University</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleUpdateEducation(edu.id, { institution: e.target.value })}
                      className="w-full text-base md:text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      placeholder="e.g. NIT Surathkal"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Year / Period</label>
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={(e) => handleUpdateEducation(edu.id, { endDate: e.target.value })}
                      className="w-full text-base md:text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      placeholder="e.g. 2015 – 2019"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Grade / CGPA</label>
                    <input
                      type="text"
                      value={edu.grade}
                      onChange={(e) => handleUpdateEducation(edu.id, { grade: e.target.value })}
                      className="w-full text-base md:text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                      placeholder="e.g. 8.8 CGPA"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: SKILLS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-bold text-slate-900">{t('skills')}</h3>
            <p className="text-[11px] text-slate-500">Technical skills, frameworks, dev tools & strengths</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Technical Skills (comma separated)</label>
            <input
              type="text"
              value={data.skills.technical?.join(', ') || ''}
              onChange={(e) =>
                onChange({
                  ...data,
                  skills: {
                    ...data.skills,
                    technical: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  }
                })
              }
              className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              placeholder="React, TypeScript, Node.js, Python, PostgreSQL, AWS"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tools & Platforms (comma separated)</label>
            <input
              type="text"
              value={data.skills.tools?.join(', ') || ''}
              onChange={(e) =>
                onChange({
                  ...data,
                  skills: {
                    ...data.skills,
                    tools: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  }
                })
              }
              className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              placeholder="Git, Docker, Kubernetes, Redis, Jira, Figma"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
