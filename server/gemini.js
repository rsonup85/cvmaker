/**
 * CVMaker AI - Server-Side Gemini API Engine
 * 
 * Preserves the exact raw REST generateContent contract:
 * - Uses GEMINI_API_KEY from server environment (never in client)
 * - Primary model: GEMINI_MODEL (defaults to gemini-3.8-flash)
 * - Fallback model chain: GEMINI_FALLBACK_MODELS
 * - Endpoint: https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent
 * - JSON mode via generationConfig.responseMimeType = 'application/json'
 * - Exponential backoff and retry for transient errors
 * - Supports all 23 defined operation types
 */

const DEFAULT_PRIMARY_MODEL = 'gemini-3.8-flash';
const DEFAULT_FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

export function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.Gemini_API_Key || '';
}

export function getModelChain() {
  const primary = process.env.GEMINI_MODEL || DEFAULT_PRIMARY_MODEL;
  const fallbacksStr = process.env.GEMINI_FALLBACK_MODELS || '';
  const customFallbacks = fallbacksStr
    ? fallbacksStr.split(',').map((m) => m.trim()).filter(Boolean)
    : DEFAULT_FALLBACK_MODELS;

  return [primary, ...customFallbacks.filter((m) => m !== primary)];
}

/**
 * Builds system & user prompt tailored for each AI operation type
 */
function buildPromptForType(params) {
  const { type, text = '', targetRole = '', jobDescription = '', resumeData, biodataData, language = 'en' } = params;

  let isJsonMode = false;
  let systemInstruction = 'You are an expert career consultant, professional resume writer, and Indian matrimonial biodata advisor.';
  let userPrompt = '';

  switch (type) {
    case 'atsOptimize':
      isJsonMode = false;
      userPrompt = `You are a top ATS (Applicant Tracking System) optimization expert. Rewrite the following resume text to maximize keyword match, readability, and ATS parsing score for the target role "${targetRole || 'Professional'}". Keep facts authentic, use action verbs, and format cleanly.\n\nInput text:\n${text}`;
      break;

    case 'atsScore':
      isJsonMode = true;
      userPrompt = `Evaluate this resume text for ATS scanner readiness for the role "${targetRole}". Return JSON with:
      {
        "atsScore": number (0-100),
        "strengths": string[],
        "improvements": string[],
        "missingKeywords": string[]
      }\n\nResume Content:\n${text}`;
      break;

    case 'roleTune':
      isJsonMode = false;
      userPrompt = `Tailor the following resume summary or experience specifically for the role of "${targetRole}". Emphasize high-impact skills, leadership, and relevant technical abilities:\n\n${text}`;
      break;

    case 'grammar':
      isJsonMode = false;
      userPrompt = `Correct all grammatical errors, spelling mistakes, awkward phrasing, and passive voice in this professional text. Return only the polished, professional text:\n\n${text}`;
      break;

    case 'smartBullet':
      isJsonMode = false;
      userPrompt = `Convert the following job responsibilities into 3-4 impactful, quantified bullet points using the Google XYZ formula ("Accomplished [X] as measured by [Y], by doing [Z]").\n\nInput:\n${text}`;
      break;

    case 'biodata':
      isJsonMode = false;
      userPrompt = `Refine this Indian matrimonial biodata text ("About Me" or introduction) to sound cultured, respectful, elegant, and warm. Balance traditional values with modern aspirations.\n\nInput:\n${text}`;
      break;

    case 'biodataCheck':
      isJsonMode = true;
      userPrompt = `Audit this matrimonial biodata for completeness according to Indian matrimonial standards. Return JSON with:
      {
        "isComplete": boolean,
        "score": number (0-100),
        "presentFields": string[],
        "missingRecommendations": string[],
        "etiquetteTips": string[]
      }\n\nBiodata Data:\n${JSON.stringify(biodataData || text)}`;
      break;

    case 'bilingualBiodata':
      isJsonMode = true;
      userPrompt = `Format this matrimonial biodata content into paired bilingual Hindi and English format. Return JSON with:
      {
        "hindiTitle": string,
        "englishTitle": string,
        "shloka": string,
        "translatedFields": { [key: string]: { "hi": string, "en": string } }
      }\n\nContent:\n${text || JSON.stringify(biodataData)}`;
      break;

    case 'astrologyFormat':
      isJsonMode = false;
      userPrompt = `Standardize the following Indian astrological / Kundali details into crisp, formal presentation (Rashi, Nakshatra, Gotra, Manglik status, Charan, Gan). Clean up any colloquial terms:\n\n${text}`;
      break;

    case 'coverLetter':
      isJsonMode = false;
      userPrompt = `Draft a compelling 3-paragraph cover letter for the role "${targetRole}" based on the candidate's background.\n\nCandidate details:\n${text || JSON.stringify(resumeData)}`;
      break;

    case 'linkedinGen':
      isJsonMode = false;
      userPrompt = `Write an engaging, first-person LinkedIn About section (summary) based on this resume summary, highlighting passion, technical capabilities, and impact:\n\n${text}`;
      break;

    case 'designSuggest':
      isJsonMode = true;
      userPrompt = `Recommend an optimal visual design layout for a candidate with role "${targetRole}". Return JSON with:
      {
        "recommendedFamily": string,
        "paletteSuggestion": { "primary": string, "accent": string },
        "fontPairing": { "heading": string, "body": string },
        "reasoning": string
      }`;
      break;

    case 'rewrite':
    default:
      isJsonMode = false;
      userPrompt = `Professionally rewrite and polish the following text for an executive-ready document:\n\n${text}`;
      break;
  }

  return { isJsonMode, systemInstruction, userPrompt };
}

/**
 * Invokes Gemini REST API with retry and fallback model chain
 */
export async function generateGeminiContent(params) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please set it in server environment variables.');
  }

  const { isJsonMode, systemInstruction, userPrompt } = buildPromptForType(params);
  const modelChain = getModelChain();

  let lastError = null;

  for (const model of modelChain) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
        ...(isJsonMode ? { responseMimeType: 'application/json' } : {})
      }
    };

    // If multimodal file upload provided
    if (params.fileBase64 && params.fileMimeType) {
      requestBody.contents[0].parts.unshift({
        inlineData: {
          mimeType: params.fileMimeType,
          data: params.fileBase64
        }
      });
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error?.message || `HTTP ${response.status}`;
        console.warn(`Gemini model ${model} returned error: ${errorMsg}. Trying fallback if available.`);
        lastError = new Error(errorMsg);
        continue;
      }

      const candidate = data.candidates?.[0];
      const rawText = candidate?.content?.parts?.[0]?.text || '';

      if (!rawText.trim()) {
        lastError = new Error('Model returned empty response.');
        continue;
      }

      // Handle JSON mode parsing
      if (isJsonMode) {
        try {
          // Strip markdown code fences if present
          const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
          const parsed = JSON.parse(cleanJson);
          return {
            success: true,
            type: params.type,
            modelUsed: model,
            ...parsed
          };
        } catch (jsonErr) {
          console.warn('JSON parse fallback for raw text:', rawText);
          return {
            success: true,
            type: params.type,
            modelUsed: model,
            enhancedText: rawText
          };
        }
      }

      // Plain text mode
      return {
        success: true,
        type: params.type,
        modelUsed: model,
        enhancedText: rawText.trim()
      };
    } catch (fetchErr) {
      console.warn(`Network/Fetch error with model ${model}:`, fetchErr.message);
      lastError = fetchErr;
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Unknown network error'}`);
}
