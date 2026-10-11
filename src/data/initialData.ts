/**
 * CVMaker AI - Initial Sample Data
 * Authentic Indian Professional & Matrimonial sample data
 */

export interface JobExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  description: string;
  highlights: string[];
}

export interface JobEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  grade: string;
  location: string;
}

export interface JobProject {
  id: string;
  name: string;
  techStack: string;
  description: string;
  link?: string;
}

export interface JobResumeData {
  personal: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    photo?: string;
    summary: string;
  };
  experience: JobExperience[];
  education: JobEducation[];
  skills: {
    technical: string[];
    tools: string[];
    soft: string[];
  };
  projects: JobProject[];
  certifications: string[];
  languages: string[];
  declaration?: string;
}

export interface MarriageBiodataData {
  header: {
    shloka: string;
    subHeading: string;
  };
  personal: {
    fullName: string;
    gender: string;
    dob: string;
    timeOfBirth: string;
    placeOfBirth: string;
    height: string;
    complexion: string;
    bloodGroup: string;
    motherTongue: string;
    maritalStatus: string;
    diet: string;
    photo?: string;
    aboutMe: string;
  };
  horoscope: {
    rashi: string;
    nakshatra: string;
    gotra: string;
    manglik: string;
    nadi?: string;
    gan?: string;
    charan?: string;
  };
  educationCareer: {
    highestEducation: string;
    degreeDetails: string;
    schoolCollege: string;
    occupation: string;
    company: string;
    annualIncome: string;
    workLocation: string;
  };
  family: {
    fatherName: string;
    fatherOccupation: string;
    motherName: string;
    motherOccupation: string;
    brothers: string;
    sisters: string;
    familyType: string;
    familyValues: string;
    nativePlace: string;
    kuldevata?: string;
  };
  contact: {
    contactPerson: string;
    relation: string;
    phone: string;
    altPhone: string;
    email: string;
    address: string;
  };
  expectations: {
    ageRange: string;
    heightRange: string;
    education: string;
    profession: string;
    preferences: string;
  };
}

export interface DesignSettingsState {
  fontFamily: string;
  primaryColor?: string;
  accentColor?: string;
  spacing: 'compact' | 'normal' | 'relaxed';
  margins: 'tight' | 'normal' | 'wide';
  photoShape: 'circle' | 'square' | 'rounded' | 'arch' | 'none';
  pageSize: 'A4' | 'Letter';
  showWatermark: boolean;
  showMotif: boolean;
}

export const INITIAL_JOB_RESUME: JobResumeData = {
  personal: {
    fullName: 'Rahul Sharma',
    jobTitle: 'Senior Full Stack Engineer',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    location: 'Bengaluru, Karnataka, India',
    linkedin: 'linkedin.com/in/rahulsharma-dev',
    github: 'github.com/rahulsharma-tech',
    portfolio: 'rahulsharma.dev',
    photo: '',
    summary: 'High-performing Full Stack Engineer with 6+ years of experience architecting scalable distributed cloud applications and high-throughput microservices. Proven expertise in React, Node.js, TypeScript, and AWS cloud solutions, leading cross-functional engineering pods to deliver 40% performance gains.'
  },
  experience: [
    {
      id: 'exp-1',
      company: 'TechMatrix Global Pvt Ltd',
      position: 'Senior Software Engineer',
      startDate: '2022',
      endDate: 'Present',
      current: true,
      location: 'Bengaluru, India',
      description: 'Lead engineer for payment gateway modernization handling 1.5M daily transactions.',
      highlights: [
        'Redesigned transaction processing engine, slashing latency by 35% and reducing infrastructure costs by ₹1.2M annually.',
        'Mentored 6 junior engineers and spearheaded TypeScript migration across 14 enterprise frontend micro-apps.',
        'Implemented robust automated CI/CD deployment pipelines using Docker and Kubernetes.'
      ]
    },
    {
      id: 'exp-2',
      company: 'InnovateX Solutions',
      position: 'Full Stack Developer',
      startDate: '2019',
      endDate: '2022',
      current: false,
      location: 'Hyderabad, India',
      description: 'Developed responsive customer portals and RESTful backend APIs.',
      highlights: [
        'Architected real-time analytics dashboard utilized by 120,000 active monthly corporate users.',
        'Optimized PostgreSQL queries and database indices, improving 95th percentile query times by 50%.'
      ]
    }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'National Institute of Technology (NIT), Surathkal',
      degree: 'B.Tech in Computer Science & Engineering',
      field: 'Computer Science',
      startDate: '2015',
      endDate: '2019',
      grade: '8.8 CGPA (First Class with Distinction)',
      location: 'Karnataka, India'
    }
  ],
  skills: {
    technical: ['React.js', 'TypeScript', 'Node.js', 'Next.js', 'Python', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS'],
    tools: ['Git', 'Redis', 'Kubernetes', 'GraphQL', 'Tailwind CSS', 'Jira', 'Figma'],
    soft: ['Team Leadership', 'Agile / Scrum', 'System Design', 'Technical Mentorship', 'Problem Solving']
  },
  projects: [
    {
      id: 'proj-1',
      name: 'OmniCloud Micro-Services Framework',
      techStack: 'Node.js, TypeScript, Redis, Docker',
      description: 'Open-source distributed event-driven pub-sub framework with sub-millisecond dispatching.',
      link: 'github.com/rahulsharma-tech/omnicloud'
    },
    {
      id: 'proj-2',
      name: 'SmartHire AI Resume Parser',
      techStack: 'React, Python FastAPI, Gemini API',
      description: 'Intelligent resume matching scoring engine for tech recruiters with ATS compliance checking.',
      link: 'smarthire-demo.app'
    }
  ],
  certifications: [
    'AWS Certified Solutions Architect – Associate (2023)',
    'Certified Kubernetes Application Developer (CKAD) (2022)'
  ],
  languages: [
    'English (Professional Fluent)',
    'Hindi (Native Fluent)',
    'Kannada (Conversational)'
  ],
  declaration: 'I hereby declare that all the information provided above is true and authentic to the best of my knowledge and belief.'
};

export const INITIAL_MARRIAGE_BIODATA: MarriageBiodataData = {
  header: {
    shloka: '|| श्री गणेशाय नमः ||',
    subHeading: 'शुभ विवाह बायोडाटा / Matrimonial Biodata'
  },
  personal: {
    fullName: 'Pooja Kashyap',
    gender: 'Female',
    dob: '18 October 1998',
    timeOfBirth: '07:45 AM',
    placeOfBirth: 'Jaipur, Rajasthan',
    height: "5' 5\" (165 cm)",
    complexion: 'Fair',
    bloodGroup: 'B+',
    motherTongue: 'Hindi',
    maritalStatus: 'Never Married',
    diet: 'Vegetarian',
    photo: '',
    aboutMe: 'A well-educated, cultured, and family-oriented girl with a modern outlook and deep respect for traditional Indian values. Passionate about classical music, travelling, and reading.'
  },
  horoscope: {
    rashi: 'Tula (Libra)',
    nakshatra: 'Swati',
    gotra: 'Kashyap',
    manglik: 'No (Non-Manglik)',
    nadi: 'Antya',
    gan: 'Dev',
    charan: '3'
  },
  educationCareer: {
    highestEducation: 'M.Com & MBA (Finance)',
    degreeDetails: 'Master of Commerce & MBA from Delhi University',
    schoolCollege: 'Shri Ram College of Commerce (SRCC), Delhi University',
    occupation: 'Senior Financial Analyst',
    company: 'Deloitte India',
    annualIncome: '₹ 18,50,000 per annum',
    workLocation: 'Gurugram / NCR'
  },
  family: {
    fatherName: 'Shri Rameshwar Dayal Kashyap',
    fatherOccupation: 'Executive Engineer (Retd. PWD, Govt. of Rajasthan)',
    motherName: 'Smt. Sunita Kashyap',
    motherOccupation: 'Homemaker',
    brothers: '1 Elder Brother (B.Tech, Software Architect at Amazon, Married)',
    sisters: 'None',
    familyType: 'Nuclear Family (Close-knit)',
    familyValues: 'Moderate & Traditional',
    nativePlace: 'Jaipur, Rajasthan',
    kuldevata: 'Shri Khatu Shyam Ji'
  },
  contact: {
    contactPerson: 'Shri Rameshwar Kashyap (Father)',
    relation: 'Father',
    phone: '+91 98290 12345',
    altPhone: '+91 94140 67890',
    email: 'kashyap.family.jaipur@example.com',
    address: 'B-42, Shyam Nagar, Ajmer Road, Jaipur, Rajasthan - 302019'
  },
  expectations: {
    ageRange: '27 - 31 Years',
    heightRange: "5' 8\" to 6' 1\"",
    education: 'Post Graduate / B.Tech / MBA / CA / Civil Services',
    profession: 'Well-settled professional in MNC, Corporate or Class-1 Govt Officer',
    preferences: 'Teetotaler, cultured, non-smoking, values-driven family from respectful background.'
  }
};

export const INITIAL_DESIGN_SETTINGS: DesignSettingsState = {
  fontFamily: 'Inter',
  spacing: 'normal',
  margins: 'normal',
  photoShape: 'circle',
  pageSize: 'A4',
  showWatermark: false,
  showMotif: true
};
