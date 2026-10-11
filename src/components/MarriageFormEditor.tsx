/**
 * CVMaker AI - Marriage Biodata Form Editor
 * Full matrimonial form editor for authentic Indian biodatas.
 * Input font size >= 16px on mobile (prevents iOS auto-zoom).
 */

import React, { useState } from 'react';
import { MarriageBiodataData } from '../data/initialData';
import { 
  Heart, User, Moon, Briefcase, Users, Phone, Sparkles, 
  Upload, Image as ImageIcon, ChevronDown, ChevronUp 
} from 'lucide-react';
import { t } from '../i18n';

interface MarriageFormEditorProps {
  data: MarriageBiodataData;
  onChange: (updated: MarriageBiodataData) => void;
  onOpenAiEnhance?: (field: string, text: string) => void;
}

export const MarriageFormEditor: React.FC<MarriageFormEditorProps> = ({
  data,
  onChange,
  onOpenAiEnhance
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    header: false,
    personal: true,
    horoscope: true,
    educationCareer: true,
    family: true,
    contact: false,
    expectations: false
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleUpdate = <K extends keyof MarriageBiodataData>(
    section: K,
    key: keyof MarriageBiodataData[K],
    value: string
  ) => {
    onChange({
      ...data,
      [section]: {
        ...data[section],
        [key]: value
      }
    });
  };

  // Photo upload
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
      handleUpdate('personal', 'photo', base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* SECTION 1: AUSPICIOUS SHLOKA & HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('header')}
          className="w-full flex items-center justify-between p-4 bg-amber-50/50 hover:bg-amber-100/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs md:text-sm font-bold text-slate-900">{t('shlokaHeading')}</h3>
              <p className="text-[11px] text-slate-500">Invocation shloka, header text & title</p>
            </div>
          </div>
          {openSections.header ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.header && (
          <div className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Auspicious Shloka (मांगलिक श्लोक)</label>
                <input
                  type="text"
                  value={data.header.shloka}
                  onChange={(e) => handleUpdate('header', 'shloka', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="|| श्री गणेशाय नमः ||"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Subheading / Category Title</label>
                <input
                  type="text"
                  value={data.header.subHeading}
                  onChange={(e) => handleUpdate('header', 'subHeading', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="शुभ विवाह बायोडाटा / Matrimonial Biodata"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: PERSONAL INFORMATION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('personal')}
          className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs md:text-sm font-bold text-slate-900">{t('personalInfo')}</h3>
              <p className="text-[11px] text-slate-500">Name, birth date & time, height, complexion & photo</p>
            </div>
          </div>
          {openSections.personal ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.personal && (
          <div className="p-4 md:p-6 space-y-4">
            {/* Photo upload row */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-20 h-24 rounded-2xl bg-amber-50 border-2 border-dashed border-amber-300 flex items-center justify-center overflow-hidden shrink-0">
                {data.personal.photo ? (
                  <img src={data.personal.photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-amber-400" />
                )}
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="text-xs font-semibold text-slate-700 block">Candidate Portrait Photo</span>
                <p className="text-[11px] text-slate-500">Traditional or clean studio portrait photo (Max 2MB)</p>
                <div className="flex items-center gap-2 pt-1">
                  <label className="cursor-pointer px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Photo
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {data.personal.photo && (
                    <button
                      type="button"
                      onClick={() => handleUpdate('personal', 'photo', '')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
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
                  onChange={(e) => handleUpdate('personal', 'fullName', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Pooja Kashyap"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Gender (लिंग)</label>
                <select
                  value={data.personal.gender}
                  onChange={(e) => handleUpdate('personal', 'gender', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Female">Female (कन्या)</option>
                  <option value="Male">Male (वर)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">{t('dateOfBirth')}</label>
                <input
                  type="text"
                  value={data.personal.dob}
                  onChange={(e) => handleUpdate('personal', 'dob', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. 18 October 1998"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">{t('timeOfBirth')}</label>
                <input
                  type="text"
                  value={data.personal.timeOfBirth}
                  onChange={(e) => handleUpdate('personal', 'timeOfBirth', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. 07:45 AM"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">{t('placeOfBirth')}</label>
                <input
                  type="text"
                  value={data.personal.placeOfBirth}
                  onChange={(e) => handleUpdate('personal', 'placeOfBirth', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Jaipur, Rajasthan"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">{t('height')}</label>
                <input
                  type="text"
                  value={data.personal.height}
                  onChange={(e) => handleUpdate('personal', 'height', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. 5' 5&quot; (165 cm)"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">{t('complexion')}</label>
                <input
                  type="text"
                  value={data.personal.complexion}
                  onChange={(e) => handleUpdate('personal', 'complexion', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Fair / Wheatish"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">{t('bloodGroup')}</label>
                <input
                  type="text"
                  value={data.personal.bloodGroup}
                  onChange={(e) => handleUpdate('personal', 'bloodGroup', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="B+ / O+ / A+"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">{t('motherTongue')}</label>
                <input
                  type="text"
                  value={data.personal.motherTongue}
                  onChange={(e) => handleUpdate('personal', 'motherTongue', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Hindi / Punjabi / Gujarati"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">{t('maritalStatus')}</label>
                <input
                  type="text"
                  value={data.personal.maritalStatus}
                  onChange={(e) => handleUpdate('personal', 'maritalStatus', e.target.value)}
                  className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Never Married"
                />
              </div>
            </div>

            {/* About Me */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">{t('aboutMe')}</label>
                {onOpenAiEnhance && (
                  <button
                    type="button"
                    onClick={() => onOpenAiEnhance('biodata', data.personal.aboutMe)}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md"
                  >
                    <Sparkles className="w-3 h-3" /> AI Biodata Polish
                  </button>
                )}
              </div>
              <textarea
                rows={2}
                value={data.personal.aboutMe}
                onChange={(e) => handleUpdate('personal', 'aboutMe', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Cultured, family-oriented, modern outlook with respect for Indian traditions..."
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: KUNDALI & HOROSCOPE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('horoscope')}
          className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Moon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs md:text-sm font-bold text-slate-900">{t('horoscopeDetails')}</h3>
              <p className="text-[11px] text-slate-500">Rashi, Nakshatra, Gotra, Manglik status & Nadi</p>
            </div>
          </div>
          {openSections.horoscope ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.horoscope && (
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('rashi')}</label>
              <input
                type="text"
                value={data.horoscope.rashi}
                onChange={(e) => handleUpdate('horoscope', 'rashi', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Tula (Libra)"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('nakshatra')}</label>
              <input
                type="text"
                value={data.horoscope.nakshatra}
                onChange={(e) => handleUpdate('horoscope', 'nakshatra', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Swati / Rohini"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('gotra')}</label>
              <input
                type="text"
                value={data.horoscope.gotra}
                onChange={(e) => handleUpdate('horoscope', 'gotra', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Kashyap / Bhardwaj"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('manglik')}</label>
              <select
                value={data.horoscope.manglik}
                onChange={(e) => handleUpdate('horoscope', 'manglik', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="No (Non-Manglik)">No (Non-Manglik / अ-मांगलिक)</option>
                <option value="Yes (Manglik)">Yes (Manglik / मांगलिक)</option>
                <option value="Anshik Manglik">Anshik Manglik (आंशिक मांगलिक)</option>
                <option value="Don't Know">Not Known / कुंडली मान्य नहीं</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: EDUCATION & OCCUPATION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('educationCareer')}
          className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Briefcase className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs md:text-sm font-bold text-slate-900">{t('educationCareer')}</h3>
              <p className="text-[11px] text-slate-500">Degree, college, company, occupation & annual package</p>
            </div>
          </div>
          {openSections.educationCareer ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.educationCareer && (
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('highestEducation')}</label>
              <input
                type="text"
                value={data.educationCareer.highestEducation}
                onChange={(e) => handleUpdate('educationCareer', 'highestEducation', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="e.g. MBA / B.Tech / MBBS"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('schoolCollege')}</label>
              <input
                type="text"
                value={data.educationCareer.schoolCollege}
                onChange={(e) => handleUpdate('educationCareer', 'schoolCollege', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="e.g. Delhi University / IIT"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('occupation')}</label>
              <input
                type="text"
                value={data.educationCareer.occupation}
                onChange={(e) => handleUpdate('educationCareer', 'occupation', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="e.g. Senior Financial Analyst"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('companyName')}</label>
              <input
                type="text"
                value={data.educationCareer.company}
                onChange={(e) => handleUpdate('educationCareer', 'company', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="e.g. Deloitte India"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('annualIncome')}</label>
              <input
                type="text"
                value={data.educationCareer.annualIncome}
                onChange={(e) => handleUpdate('educationCareer', 'annualIncome', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="e.g. ₹ 18,50,000 p.a."
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('workLocation')}</label>
              <input
                type="text"
                value={data.educationCareer.workLocation}
                onChange={(e) => handleUpdate('educationCareer', 'workLocation', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="e.g. Gurugram / NCR"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: FAMILY BACKGROUND */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('family')}
          className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs md:text-sm font-bold text-slate-900">{t('familyBackground')}</h3>
              <p className="text-[11px] text-slate-500">Parents, siblings, family values & native place</p>
            </div>
          </div>
          {openSections.family ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.family && (
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('fatherName')}</label>
              <input
                type="text"
                value={data.family.fatherName}
                onChange={(e) => handleUpdate('family', 'fatherName', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Shri Rameshwar Kashyap"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('fatherOccupation')}</label>
              <input
                type="text"
                value={data.family.fatherOccupation}
                onChange={(e) => handleUpdate('family', 'fatherOccupation', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Executive Engineer (Govt)"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('motherName')}</label>
              <input
                type="text"
                value={data.family.motherName}
                onChange={(e) => handleUpdate('family', 'motherName', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Smt. Sunita Kashyap"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('motherOccupation')}</label>
              <input
                type="text"
                value={data.family.motherOccupation}
                onChange={(e) => handleUpdate('family', 'motherOccupation', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Homemaker / Teacher"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('brothers')}</label>
              <input
                type="text"
                value={data.family.brothers}
                onChange={(e) => handleUpdate('family', 'brothers', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="1 Elder Brother (Married)"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('sisters')}</label>
              <input
                type="text"
                value={data.family.sisters}
                onChange={(e) => handleUpdate('family', 'sisters', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="None / 1 Younger Sister"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('nativePlace')}</label>
              <input
                type="text"
                value={data.family.nativePlace}
                onChange={(e) => handleUpdate('family', 'nativePlace', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Jaipur, Rajasthan"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('kuldevata')}</label>
              <input
                type="text"
                value={data.family.kuldevata || ''}
                onChange={(e) => handleUpdate('family', 'kuldevata', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Shri Khatu Shyam Ji"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 6: CONTACT INFORMATION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('contact')}
          className="w-full flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Phone className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs md:text-sm font-bold text-slate-900">{t('contactDetails')}</h3>
              <p className="text-[11px] text-slate-500">Contact persons, mobile numbers & residence address</p>
            </div>
          </div>
          {openSections.contact ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.contact && (
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('contactPerson')}</label>
              <input
                type="text"
                value={data.contact.contactPerson}
                onChange={(e) => handleUpdate('contact', 'contactPerson', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Shri Rameshwar Kashyap (Father)"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('mobileNumber')}</label>
              <input
                type="tel"
                value={data.contact.phone}
                onChange={(e) => handleUpdate('contact', 'phone', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="+91 98290 12345"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 mb-1 block">{t('residentialAddress')}</label>
              <textarea
                rows={2}
                value={data.contact.address}
                onChange={(e) => handleUpdate('contact', 'address', e.target.value)}
                className="w-full text-base md:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Complete postal address for matrimonial correspondence..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
