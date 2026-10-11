/**
 * CVMaker AI - Internationalization (i18n)
 * Full English & Hindi (हिंदी) dictionary for UI, sections, astrology, and buttons
 */

export type Language = 'en' | 'hi';

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Navigation
    brandTitle: 'CVMaker AI',
    brandTagline: 'Premium Resume & Marriage Biodata Maker',
    jobResumeTab: 'Job Resume / CV',
    marriageBiodataTab: 'Marriage Biodata',
    editMode: 'Edit Details',
    templatesMode: 'Choose Template (400+)',
    previewMode: 'Live A4 Preview',
    designSettings: 'Design & Colors',
    aiCopilot: 'AI Copilot',
    downloadPdf: 'Download PDF',
    adminLogin: 'Admin Panel',
    switchLanguage: 'हिंदी में देखें',

    // Sections - Job
    personalDetails: 'Personal & Contact Details',
    fullName: 'Full Name',
    jobTitle: 'Professional Title / Target Role',
    email: 'Email Address',
    phone: 'Mobile Number',
    location: 'Current Location',
    linkedin: 'LinkedIn Profile URL',
    github: 'GitHub URL',
    portfolio: 'Portfolio / Website',
    professionalSummary: 'Professional Summary / Objective',
    workExperience: 'Work Experience',
    addExperience: '+ Add Experience',
    company: 'Company / Organization',
    position: 'Designation / Role',
    startDate: 'Start Date',
    endDate: 'End Date',
    currentlyWorking: 'Currently working here',
    description: 'Key Responsibilities',
    highlights: 'Achievements / Metrics',
    education: 'Education & Qualifications',
    addEducation: '+ Add Education',
    institution: 'College / University / School',
    degree: 'Degree / Certificate',
    fieldOfStudy: 'Field of Study / Branch',
    grade: 'CGPA / Percentage / Grade',
    skills: 'Skills & Competencies',
    technicalSkills: 'Technical Skills (comma separated)',
    toolsTechnologies: 'Tools & Technologies',
    softSkills: 'Core Strengths / Soft Skills',
    projects: 'Key Projects',
    addProject: '+ Add Project',
    projectName: 'Project Name',
    techStack: 'Technologies Used',
    certifications: 'Certifications',
    languages: 'Languages Known',
    declaration: 'Formal Declaration',
    photoUpload: 'Profile Photo',
    changePhoto: 'Change Photo',
    removePhoto: 'Remove',

    // Sections - Marriage
    shlokaHeading: 'Auspicious Shloka / Invocation',
    matrimonialBiodata: 'Matrimonial Biodata',
    personalInfo: 'Personal Information',
    dateOfBirth: 'Date of Birth',
    timeOfBirth: 'Time of Birth',
    placeOfBirth: 'Place of Birth',
    height: 'Height',
    complexion: 'Complexion',
    bloodGroup: 'Blood Group',
    motherTongue: 'Mother Tongue',
    maritalStatus: 'Marital Status',
    dietPreference: 'Diet Preference',
    aboutMe: 'About Candidate',

    // Horoscope & Kundali
    horoscopeDetails: 'Kundali & Astrological Details',
    rashi: 'Rashi (Zodiac)',
    nakshatra: 'Nakshatra',
    gotra: 'Gotra',
    manglik: 'Manglik Status',
    nadi: 'Nadi',
    gan: 'Gan',
    charan: 'Charan',

    // Education & Profession
    educationCareer: 'Education & Professional Details',
    highestEducation: 'Highest Education',
    degreeDetails: 'Degree Details',
    schoolCollege: 'College / University Name',
    occupation: 'Current Profession / Role',
    companyName: 'Company / Organization',
    annualIncome: 'Annual Package (CTC)',
    workLocation: 'Work City / Location',

    // Family
    familyBackground: 'Family Background',
    fatherName: "Father's Name",
    fatherOccupation: "Father's Profession",
    motherName: "Mother's Name",
    motherOccupation: "Mother's Profession",
    brothers: 'Brothers Details',
    sisters: 'Sisters Details',
    familyType: 'Family Type (Nuclear / Joint)',
    familyValues: 'Family Values',
    nativePlace: 'Native Place / Ancestral Hometown',
    kuldevata: 'Kuldevata / Ishta Dev',

    // Contact
    contactDetails: 'Contact & Residential Details',
    contactPerson: 'Contact Person Name',
    relation: 'Relation with Candidate',
    mobileNumber: 'Primary Mobile',
    alternateNumber: 'Alternate Contact Number',
    residentialAddress: 'Residential Address',

    // Expectations
    partnerExpectations: 'Partner Expectations',
    ageRange: 'Preferred Age Range',
    heightRange: 'Preferred Height Range',
    educationPreference: 'Preferred Education',
    occupationPreference: 'Preferred Profession',
    otherPreferences: 'Other Expectations / Criteria',

    // Gallery & Templates
    searchTemplates: 'Search templates by name, style or role...',
    allCategories: 'All Categories',
    allLayouts: 'All Layouts',
    popularBadge: 'Popular',
    newBadge: 'New 2026',
    atsScore: 'ATS Score',
    jobTemplatesCount: '200 Job & Resume Templates',
    marriageTemplatesCount: '200+ Marriage Biodata Templates',
    useTemplate: 'Use This Design',
    activeTemplate: 'Active Template',

    // Design Settings
    fontFamily: 'Typography Font',
    colorTheme: 'Color Palette',
    spacing: 'Line Spacing',
    margins: 'Page Margins',
    photoShape: 'Photo Border Shape',
    showReligiousMotif: 'Show Auspicious Motif (Om / Ganesh)',

    // Actions & Buttons
    saveDraft: 'Autosaved',
    savingDraft: 'Saving...',
    resetForm: 'Reset Form',
    confirmReset: 'Are you sure you want to reset to default sample data?',
    downloadFree: 'Free Instant PDF',
    upgradePaid: 'High-Res Paid PDF (₹9 - ₹21)',
    generatingPdf: 'Rendering PDF...',
    copiedToClipboard: 'Copied to clipboard!',
    photoUploaded: 'Photo uploaded successfully',
    photoRemoved: 'Photo removed',

    // AI Tools
    aiEnhanceText: 'AI Enhance',
    atsOptimizer: 'Optimize for ATS Scanner',
    fixGrammar: 'Grammar & Tone Polish',
    translateHindi: 'Translate to Hindi',
    roleTune: 'Tailor for Specific Job Role',
    biodataCheck: 'Check Matrimonial Completeness'
  },
  hi: {
    // Brand & Navigation
    brandTitle: 'सीवी मेकर एआई',
    brandTagline: 'प्रीमियम रेज़्यूमे और विवाह बायोडाटा निर्माता',
    jobResumeTab: 'जॉब रेज़्यूमे / सीवी',
    marriageBiodataTab: 'विवाह बायोडाटा',
    editMode: 'विवरण भरें',
    templatesMode: 'टेम्पलेट चुनें (400+)',
    previewMode: 'लाइव A4 प्रीव्यू',
    designSettings: 'डिज़ाइन और रंग',
    aiCopilot: 'एआई असिस्टेंट',
    downloadPdf: 'पीडीएफ डाउनलोड',
    adminLogin: 'एडमिन पैनल',
    switchLanguage: 'View in English',

    // Sections - Job
    personalDetails: 'व्यक्तिगत और संपर्क विवरण',
    fullName: 'पूरा नाम',
    jobTitle: 'कार्य पद / लक्षित भूमिका',
    email: 'ईमेल पता',
    phone: 'मोबाइल नंबर',
    location: 'वर्तमान शहर / स्थान',
    linkedin: 'लिंक्डइन प्रोफाइल',
    github: 'गिटहब यूआरएल',
    portfolio: 'वेबसाइट / पोर्टफोलियो',
    professionalSummary: 'पेशेवर सारांश / उद्देश्य',
    workExperience: 'कार्य अनुभव',
    addExperience: '+ अनुभव जोड़ें',
    company: 'कंपनी / संस्था',
    position: 'पद / पदनाम',
    startDate: 'आरंभ तिथि',
    endDate: 'समाप्ति तिथि',
    currentlyWorking: 'वर्तमान में यहीं कार्यरत हैं',
    description: 'मुख्य जिम्मेदारियां',
    highlights: 'उपलब्धियां / मुख्य परिणाम',
    education: 'शैक्षणिक योग्यता',
    addEducation: '+ शिक्षा जोड़ें',
    institution: 'कॉलेज / विश्वविद्यालय / स्कूल',
    degree: 'डिग्री / प्रमाण पत्र',
    fieldOfStudy: 'अध्ययन क्षेत्र / शाखा',
    grade: 'सीजीपीए / प्रतिशत / श्रेणी',
    skills: 'कौशल और दक्षताएं',
    technicalSkills: 'तकनीकी कौशल (अल्पविराम से अलग करें)',
    toolsTechnologies: 'टूल्स एवं टेक्नोलॉजी',
    softSkills: 'मुख्य ताकत / व्यक्तिगत कौशल',
    projects: 'प्रमुख प्रोजेक्ट्स',
    addProject: '+ प्रोजेक्ट जोड़ें',
    projectName: 'प्रोजेक्ट का नाम',
    techStack: 'उपयोग की गई तकनीकें',
    certifications: 'प्रमाणपत्र (Certifications)',
    languages: 'ज्ञात भाषाएं',
    declaration: 'औपचारिक घोषणा',
    photoUpload: 'प्रोफ़ाइल फ़ोटो',
    changePhoto: 'फ़ोटो बदलें',
    removePhoto: 'हटाएं',

    // Sections - Marriage
    shlokaHeading: 'मांगलिक श्लोक / आह्वान',
    matrimonialBiodata: 'विवाह बायोडाटा',
    personalInfo: 'व्यक्तिगत जानकारी',
    dateOfBirth: 'जन्म तिथि',
    timeOfBirth: 'जन्म समय',
    placeOfBirth: 'जन्म स्थान',
    height: 'कद / लंबाई',
    complexion: 'वर्ण / रंग',
    bloodGroup: 'रक्त समूह (Blood Group)',
    motherTongue: 'मातृभाषा',
    maritalStatus: 'वैवाहिक स्थिति',
    dietPreference: 'आहार प्राथमिकता',
    aboutMe: 'उम्मीदवार के बारे में',

    // Horoscope & Kundali
    horoscopeDetails: 'कुंडली एवं ज्योतिष विवरण',
    rashi: 'राशि',
    nakshatra: 'नक्षत्र',
    gotra: 'गोत्र',
    manglik: 'मांगलिक स्थिति',
    nadi: 'नाड़ी',
    gan: 'गण',
    charan: 'चरण',

    // Education & Profession
    educationCareer: 'शिक्षा एवं व्यवसाय विवरण',
    highestEducation: 'उच्चतम शिक्षा',
    degreeDetails: 'डिग्री का विवरण',
    schoolCollege: 'कॉलेज / संस्थान का नाम',
    occupation: 'वर्तमान व्यवसाय / पद',
    companyName: 'कंपनी / संस्था का नाम',
    annualIncome: 'वार्षिक आय (वेतन)',
    workLocation: 'कार्य स्थल / शहर',

    // Family
    familyBackground: 'पारिवारिक पृष्ठभूमि',
    fatherName: 'पिता का नाम',
    fatherOccupation: 'पिता का व्यवसाय',
    motherName: 'माता का नाम',
    motherOccupation: 'माता का व्यवसाय',
    brothers: 'भाईयों का विवरण',
    sisters: 'बहनों का विवरण',
    familyType: 'परिवार का प्रकार (एकल / संयुक्त)',
    familyValues: 'पारिवारिक मूल्य',
    nativePlace: 'मूल निवास / पैतृक स्थान',
    kuldevata: 'कुलदेवता / इष्ट देव',

    // Contact
    contactDetails: 'संपर्क एवं पता',
    contactPerson: 'संपर्क व्यक्ति का नाम',
    relation: 'उम्मीदवार से संबंध',
    mobileNumber: 'मुख्य मोबाइल नंबर',
    alternateNumber: 'वैकल्पिक संपर्क नंबर',
    residentialAddress: 'निवास का पता',

    // Expectations
    partnerExpectations: 'जीवनसाथी से अपेक्षाएं',
    ageRange: 'वांछित आयु सीमा',
    heightRange: 'वांछित कद / ऊंचाई',
    educationPreference: 'वांछित शिक्षा',
    occupationPreference: 'वांछित पेशा / नौकरी',
    otherPreferences: 'अन्य अपेक्षाएं',

    // Gallery & Templates
    searchTemplates: 'टेम्पलेट खोजें (नाम, शैली या पद से)...',
    allCategories: 'सभी श्रेणियां',
    allLayouts: 'सभी लेआउट',
    popularBadge: 'लोकप्रिय',
    newBadge: 'नया 2026',
    atsScore: 'एटीएस स्कोर',
    jobTemplatesCount: '200 जॉब एवं रेज़्यूमे टेम्पलेट्स',
    marriageTemplatesCount: '200+ विवाह बायोडाटा टेम्पलेट्स',
    useTemplate: 'यह डिज़ाइन चुनें',
    activeTemplate: 'सक्रिय टेम्पलेट',

    // Design Settings
    fontFamily: 'फॉन्ट शैली',
    colorTheme: 'रंग थीम',
    spacing: 'पंक्ति अंतर (Spacing)',
    margins: 'मार्जिन',
    photoShape: 'फ़ोटो बॉर्डर आकार',
    showReligiousMotif: 'मांगलिक प्रतीक चिन्ह दिखाएं (ॐ / गणेश)',

    // Actions & Buttons
    saveDraft: 'स्वतः सहेजा गया',
    savingDraft: 'सहेज रहा है...',
    resetForm: 'फॉर्म रीसेट करें',
    confirmReset: 'क्या आप डिफ़ॉल्ट नमूना डेटा पर रीसेट करना चाहते हैं?',
    downloadFree: 'मुफ्त तुरंत पीडीएफ',
    upgradePaid: 'हाई-रेज़ोल्यूशन सशुल्क पीडीएफ (₹9 - ₹21)',
    generatingPdf: 'पीडीएफ तैयार हो रहा है...',
    copiedToClipboard: 'क्लिपबोर्ड पर कॉपी किया गया!',
    photoUploaded: 'फ़ोटो सफलतापूर्वक अपलोड हुई',
    photoRemoved: 'फ़ोटो हटा दी गई',

    // AI Tools
    aiEnhanceText: 'एआई संवर्धन',
    atsOptimizer: 'एटीएस के लिए अनुकूलित करें',
    fixGrammar: 'व्याकरण और शैली सुधार',
    translateHindi: 'हिंदी में अनुवाद करें',
    roleTune: 'विशेष नौकरी के लिए संवारें',
    biodataCheck: 'बायोडाटा पूर्णता की जांच'
  }
};

let currentLang: Language = 'en';

export function getLanguage(): Language {
  return currentLang;
}

export function setLanguage(lang: Language): void {
  currentLang = lang;
}

export function t(key: string, lang: Language = currentLang): string {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
}
