/**
 * CVMaker AI - Reusable Master Marriage Biodata Template Engine
 * Renders all 200 Marriage Biodata templates across 12 cultural/artistic families.
 * Supports authentic motifs (Ganesh, Om, Swastik, Kalash, Khanda, Floral, etc.)
 * Fields render ONLY when populated (empty labels strictly suppressed).
 */

import React from 'react';
import { MarriageBiodataData, DesignSettingsState } from '../data/initialData';
import { TemplateConfig } from '../data/catalog';

interface MarriageTemplateEngineProps {
  data: MarriageBiodataData;
  template: TemplateConfig;
  settings?: DesignSettingsState;
  className?: string;
}

export const MarriageTemplateEngine: React.FC<MarriageTemplateEngineProps> = ({
  data,
  template,
  settings,
  className = ''
}) => {
  const { header, personal, horoscope, educationCareer, family, contact, expectations } = data;

  // Colors
  const primary = settings?.primaryColor || template.palette.primary;
  const secondary = template.palette.secondary;
  const accent = settings?.accentColor || template.palette.accent;
  const bg = template.palette.bg;
  const surface = template.palette.surface;
  const text = template.palette.text;
  const muted = template.palette.muted;
  const border = template.palette.border;

  // Fonts
  const headingFont = template.fontFamily.heading || 'Cinzel';
  const bodyFont = settings?.fontFamily || template.fontFamily.body || 'Playfair Display';

  // Photo
  const photoShape = settings?.photoShape !== 'none' ? (settings?.photoShape || template.photoStyle) : 'none';
  const showPhoto = photoShape !== 'none' && Boolean(personal.photo);

  const photoRadius = photoShape === 'circle' ? 'rounded-full' :
    photoShape === 'arch' ? 'rounded-t-full rounded-b-lg' :
    photoShape === 'rounded' ? 'rounded-2xl' : 'rounded-none';

  // Auspicious Motifs SVGs
  const renderMotif = () => {
    if (settings?.showMotif === false) return null;
    const motifType = template.motif || 'ganesh';
    if (motifType === 'none') return null;

    switch (motifType) {
      case 'ganesh':
        return (
          <div className="flex flex-col items-center justify-center my-1 select-none">
            <svg viewBox="0 0 100 100" className="w-14 h-14" fill={primary}>
              {/* Auspicious Ganesha Icon */}
              <path d="M50 12 C35 12 28 22 28 32 C28 42 34 48 38 52 C35 56 31 62 31 70 C31 82 40 88 50 88 C60 88 69 82 69 70 C69 62 65 56 62 52 C66 48 72 42 72 32 C72 22 65 12 50 12 Z M50 20 C58 20 63 26 63 32 C63 38 58 44 50 44 C42 44 37 38 37 32 C37 26 42 20 50 20 Z" opacity="0.95" />
              <circle cx="50" cy="30" r="3.5" fill={accent} />
              <path d="M48 40 Q50 52 54 58 Q58 64 62 60" stroke={primary} strokeWidth="3" fill="none" strokeLinecap="round" />
              <circle cx="43" cy="28" r="1.5" fill="#ffffff" />
              <circle cx="57" cy="28" r="1.5" fill="#ffffff" />
              <path d="M47 24 Q50 20 53 24" stroke={accent} strokeWidth="2" fill="none" />
            </svg>
          </div>
        );
      case 'om':
        return (
          <div className="flex justify-center my-1 select-none">
            <span className="text-3xl font-bold" style={{ color: primary }}>ॐ</span>
          </div>
        );
      case 'swastik':
        return (
          <div className="flex justify-center my-1 select-none">
            <span className="text-2xl font-bold tracking-widest" style={{ color: primary }}>卐</span>
          </div>
        );
      case 'kalash':
        return (
          <div className="flex flex-col items-center justify-center my-1 select-none">
            <svg viewBox="0 0 80 80" className="w-12 h-12" fill={primary}>
              <circle cx="40" cy="26" r="10" fill={accent} opacity="0.9" />
              <path d="M30 36 Q40 32 50 36 L54 58 Q54 66 40 66 Q26 66 26 58 Z" />
              <path d="M32 30 Q40 18 48 30 Z" fill={primary} />
            </svg>
          </div>
        );
      case 'khanda':
        return (
          <div className="flex justify-center my-1 select-none">
            <span className="text-2xl font-bold" style={{ color: primary }}>☬</span>
          </div>
        );
      case 'cross':
        return (
          <div className="flex justify-center my-1 select-none">
            <span className="text-2xl font-bold" style={{ color: primary }}>✝</span>
          </div>
        );
      case 'crescent':
        return (
          <div className="flex justify-center my-1 select-none">
            <span className="text-2xl font-bold" style={{ color: primary }}>☪</span>
          </div>
        );
      case 'floral':
      default:
        return (
          <div className="flex justify-center items-center gap-2 my-1 text-xs select-none" style={{ color: accent }}>
            <span>❖</span>
            <span className="text-base">⚜</span>
            <span>❖</span>
          </div>
        );
    }
  };

  // Section Header Component
  const SectionHeader = ({ title, hindiTitle }: { title: string; hindiTitle?: string }) => (
    <div className="relative my-3 text-center">
      <div className="flex items-center justify-center gap-3">
        <div className="h-[1px] flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, transparent, ${primary})` }} />
        <div className="px-3 py-0.5 rounded-full" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
          <h3
            className="text-xs md:text-sm font-bold uppercase tracking-wider"
            style={{ color: primary, fontFamily: headingFont }}
          >
            {title} {hindiTitle && <span className="font-normal opacity-90">({hindiTitle})</span>}
          </h3>
        </div>
        <div className="h-[1px] flex-1 max-w-[80px]" style={{ background: `linear-gradient(90deg, ${primary}, transparent)` }} />
      </div>
    </div>
  );

  // Field Row helper: Only renders if value is present and non-empty!
  const BiodataField = ({ label, value }: { label: string; value?: string | null }) => {
    if (!value || value.trim() === '') return null;
    return (
      <div className="flex flex-col sm:flex-row sm:items-baseline py-1 border-b border-dashed border-amber-200/50 text-xs">
        <span className="w-40 sm:w-44 font-semibold shrink-0" style={{ color: secondary }}>
          {label} :
        </span>
        <span className="flex-1 font-medium text-slate-800" style={{ color: text }}>
          {value}
        </span>
      </div>
    );
  };

  // Border frame decoration
  const getFrameStyle = () => {
    switch (template.borderStyle) {
      case 'royal-corner':
        return 'border-4 border-double shadow-lg relative p-8';
      case 'temple-arch':
        return 'border-2 rounded-t-[40px] shadow-md p-8';
      case 'clean-frame':
        return 'border-2 shadow-sm p-8';
      case 'gold-double':
      default:
        return 'border-4 border-double shadow-md p-8';
    }
  };

  return (
    <div
      className={`cvmaker-a4-document relative w-full text-slate-800 transition-all ${getFrameStyle()} ${className}`}
      style={{
        backgroundColor: bg,
        color: text,
        fontFamily: bodyFont,
        borderColor: primary,
        minHeight: '297mm'
      }}
    >
      {/* Royal Corner Ornaments */}
      {template.borderStyle === 'royal-corner' && (
        <>
          <div className="absolute top-2 left-2 text-base select-none pointer-events-none" style={{ color: accent }}>╔</div>
          <div className="absolute top-2 right-2 text-base select-none pointer-events-none" style={{ color: accent }}>╗</div>
          <div className="absolute bottom-2 left-2 text-base select-none pointer-events-none" style={{ color: accent }}>╚</div>
          <div className="absolute bottom-2 right-2 text-base select-none pointer-events-none" style={{ color: accent }}>╝</div>
        </>
      )}

      {/* Auspicious Invocation Header */}
      <div className="text-center pb-2">
        {renderMotif()}
        {header.shloka && (
          <h2
            className="text-sm md:text-base font-bold tracking-widest mt-1"
            style={{ color: primary, fontFamily: headingFont }}
          >
            {header.shloka}
          </h2>
        )}
        {header.subHeading && (
          <p className="text-xs italic tracking-wider mt-0.5 opacity-80" style={{ color: muted }}>
            {header.subHeading}
          </p>
        )}
      </div>

      {/* Top Candidate Showcase: Name & Photo */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-4 p-4 rounded-xl border" style={{ backgroundColor: surface, borderColor: border }}>
        <div className="text-center sm:text-left flex-1">
          <h1
            className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide"
            style={{ color: primary, fontFamily: headingFont }}
          >
            {personal.fullName}
          </h1>
          {educationCareer.occupation && (
            <p className="text-xs md:text-sm font-semibold tracking-wide mt-1" style={{ color: accent }}>
              {educationCareer.occupation} {educationCareer.company ? `• ${educationCareer.company}` : ''}
            </p>
          )}
          {personal.aboutMe && (
            <p className="text-xs leading-relaxed mt-2 text-slate-700 italic border-l-2 pl-2" style={{ borderColor: accent }}>
              "{personal.aboutMe}"
            </p>
          )}
        </div>

        {showPhoto && (
          <div className="relative shrink-0">
            <img
              src={personal.photo}
              alt={personal.fullName}
              className={`w-32 h-40 object-cover border-4 shadow-md ${photoRadius}`}
              style={{ borderColor: primary }}
            />
          </div>
        )}
      </div>

      {/* SECTION 1: PERSONAL INFORMATION */}
      <div className="space-y-1">
        <SectionHeader title="Personal Details" hindiTitle="व्यक्तिगत विवरण" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <BiodataField label="Full Name" value={personal.fullName} />
          <BiodataField label="Date of Birth" value={personal.dob} />
          <BiodataField label="Time of Birth" value={personal.timeOfBirth} />
          <BiodataField label="Place of Birth" value={personal.placeOfBirth} />
          <BiodataField label="Height" value={personal.height} />
          <BiodataField label="Complexion" value={personal.complexion} />
          <BiodataField label="Blood Group" value={personal.bloodGroup} />
          <BiodataField label="Mother Tongue" value={personal.motherTongue} />
          <BiodataField label="Marital Status" value={personal.maritalStatus} />
          <BiodataField label="Diet Preference" value={personal.diet} />
        </div>
      </div>

      {/* SECTION 2: HOROSCOPE / KUNDALI DETAILS (Only renders if at least one field is filled) */}
      {(horoscope.rashi || horoscope.nakshatra || horoscope.gotra || horoscope.manglik) && (
        <div className="space-y-1 mt-3">
          <SectionHeader title="Kundali / Astrological Details" hindiTitle="कुंडली विवरण" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 p-2 rounded-lg" style={{ backgroundColor: surface }}>
            <BiodataField label="Rashi (Zodiac)" value={horoscope.rashi} />
            <BiodataField label="Nakshatra" value={horoscope.nakshatra} />
            <BiodataField label="Gotra" value={horoscope.gotra} />
            <BiodataField label="Manglik Status" value={horoscope.manglik} />
            <BiodataField label="Nadi" value={horoscope.nadi} />
            <BiodataField label="Gan" value={horoscope.gan} />
            <BiodataField label="Charan" value={horoscope.charan} />
          </div>
        </div>
      )}

      {/* SECTION 3: EDUCATION & OCCUPATION */}
      {(educationCareer.highestEducation || educationCareer.occupation || educationCareer.schoolCollege) && (
        <div className="space-y-1 mt-3">
          <SectionHeader title="Education & Profession" hindiTitle="शिक्षा एवं व्यवसाय" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <BiodataField label="Highest Education" value={educationCareer.highestEducation} />
            <BiodataField label="Degree Details" value={educationCareer.degreeDetails} />
            <BiodataField label="College / University" value={educationCareer.schoolCollege} />
            <BiodataField label="Profession / Role" value={educationCareer.occupation} />
            <BiodataField label="Organization / MNC" value={educationCareer.company} />
            <BiodataField label="Annual Package (CTC)" value={educationCareer.annualIncome} />
            <BiodataField label="Work City / Location" value={educationCareer.workLocation} />
          </div>
        </div>
      )}

      {/* SECTION 4: FAMILY BACKGROUND */}
      {(family.fatherName || family.motherName || family.nativePlace) && (
        <div className="space-y-1 mt-3">
          <SectionHeader title="Family Background" hindiTitle="पारिवारिक पृष्ठभूमि" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <BiodataField label="Father's Name" value={family.fatherName} />
            <BiodataField label="Father's Profession" value={family.fatherOccupation} />
            <BiodataField label="Mother's Name" value={family.motherName} />
            <BiodataField label="Mother's Profession" value={family.motherOccupation} />
            <BiodataField label="Brothers" value={family.brothers} />
            <BiodataField label="Sisters" value={family.sisters} />
            <BiodataField label="Family Type" value={family.familyType} />
            <BiodataField label="Family Values" value={family.familyValues} />
            <BiodataField label="Native Place" value={family.nativePlace} />
            <BiodataField label="Kuldevata / Ishta Dev" value={family.kuldevata} />
          </div>
        </div>
      )}

      {/* SECTION 5: CONTACT DETAILS */}
      {(contact.phone || contact.contactPerson || contact.address) && (
        <div className="space-y-1 mt-3">
          <SectionHeader title="Contact Information" hindiTitle="संपर्क विवरण" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <BiodataField label="Contact Person" value={contact.contactPerson} />
            <BiodataField label="Relationship" value={contact.relation} />
            <BiodataField label="Primary Mobile" value={contact.phone} />
            <BiodataField label="Alternate Mobile" value={contact.altPhone} />
            <BiodataField label="Email Address" value={contact.email} />
            <div className="col-span-1 md:col-span-2">
              <BiodataField label="Residential Address" value={contact.address} />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: PARTNER EXPECTATIONS (Optional) */}
      {(expectations.preferences || expectations.ageRange || expectations.education) && (
        <div className="space-y-1 mt-3">
          <SectionHeader title="Partner Expectations" hindiTitle="जीवनसाथी से अपेक्षाएं" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <BiodataField label="Age Preference" value={expectations.ageRange} />
            <BiodataField label="Height Preference" value={expectations.heightRange} />
            <BiodataField label="Education" value={expectations.education} />
            <BiodataField label="Occupation" value={expectations.profession} />
            <div className="col-span-1 md:col-span-2">
              <BiodataField label="Key Preferences" value={expectations.preferences} />
            </div>
          </div>
        </div>
      )}

      {/* Auspicious Footer Blessings */}
      <div className="text-center pt-6 mt-4 border-t border-amber-200/60 text-xs italic opacity-75" style={{ color: muted }}>
        <span>॥ सर्व मंगल मांगल्ये शिवे सर्वार्थ साधिके । शरण्ये त्र्यम्बके गौरी नारायणि नमोऽस्तु ते ॥</span>
      </div>
    </div>
  );
};
