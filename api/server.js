import crypto from 'node:crypto';

export const config = { maxDuration: 60 };
import { db, FieldValue } from '../server/firebaseAdmin.js';
import { getUserFromRequest, requireAdmin } from '../server/auth.js';
import { DEFAULT_PRICING, TEMPLATES, cleanPrice, resolveProduct } from '../server/catalog.js';
import { getRazorpayKeyId, razorpay, verifyPaymentSignature } from '../server/razorpay.js';
import { deliverPaidResumeEmail } from '../server/emailDelivery.js';
import { getServerPdfSnapshot, sanitizeResumeSnapshot, verifyServerPdfToken } from '../server/serverPdf.js';

function jsonError(res, status, message) { return res.status(status).json({ error: message }); }


const DEFAULT_LAUNCH_CONFIG = { grandLaunchEnabled: false, animation: 'grand', durationMs: 5000, updatedAt: null };

async function getLaunchConfigDoc() {
  try {
    const snap = await db().collection('config').doc('launch').get();
    if (!snap.exists) return { ...DEFAULT_LAUNCH_CONFIG };
    const data = snap.data() || {};
    return { grandLaunchEnabled: Boolean(data.grandLaunchEnabled), animation: 'grand', durationMs: 5000, updatedAt: data.updatedAt || null };
  } catch (error) {
    console.error('getLaunchConfig fallback:', error);
    return { ...DEFAULT_LAUNCH_CONFIG, storageFallback: true };
  }
}

async function saveLaunchConfig(req, res) {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const enabled = Boolean(req.body?.grandLaunchEnabled);
  await db().collection('config').doc('launch').set({
    grandLaunchEnabled: enabled,
    animation: 'grand',
    durationMs: 5000,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: admin.uid,
  });
  return res.status(200).json({ grandLaunchEnabled: enabled, animation: 'grand', durationMs: 5000 });
}

async function getPricingDoc() {
  try {
    const snap = await db().collection('config').doc('pricing').get();
    if (!snap.exists) return { ...DEFAULT_PRICING };
    const data = snap.data() || {};
    const templates = data.templates && typeof data.templates === 'object' ? data.templates : {};
    return {
      basic: cleanPrice(data.basic, DEFAULT_PRICING.basic),
      professional: cleanPrice(data.professional, DEFAULT_PRICING.professional),
      customClone: cleanPrice(data.customClone, DEFAULT_PRICING.customClone),
      templates,
      updatedAt: data.updatedAt || null,
    };
  } catch (error) {
    console.error('getPricing fallback:', error);
    return { ...DEFAULT_PRICING, storageFallback: true };
  }
}

function issueEntitlement(paymentId) {
  const secret = process.env.ENTITLEMENT_SECRET;
  if (!secret) throw new Error('ENTITLEMENT_SECRET is not configured.');
  const payload = Buffer.from(JSON.stringify({ paymentId, exp: Date.now() + 10 * 60 * 1000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyEntitlement(token, paymentId) {
  const secret = process.env.ENTITLEMENT_SECRET;
  if (!secret || !token) return false;
  const [payload, sig] = String(token).split('.');
  if (!payload || !sig) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (expected.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.paymentId === paymentId && Number(data.exp) > Date.now();
  } catch { return false; }
}

async function createOrder(req, res) {
  const templateId = String(req.body?.templateId || '');
  const product = String(req.body?.product || 'template');
  const customerEmail = String(req.body?.customerEmail || '').trim().toLowerCase();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);
  const pricing = await getPricingDoc();
  let resolved;
  try { resolved = resolveProduct(templateId, pricing, product); } catch (e) { return jsonError(res, 400, e.message); }
  if (resolved.free) return res.status(200).json({ free: true, ...resolved });
  if (!emailOk) return jsonError(res, 400, 'Valid email ID required for paid PDF delivery.');

  let resumeSnapshot = null;
  if (resolved.product === 'template') {
    try {
      resumeSnapshot = sanitizeResumeSnapshot({
        ...(req.body?.resumeData || {}),
        designSettings: req.body?.designSettings || {},
        selectedTemplateId: resolved.templateId,
        colorPaletteId: req.body?.colorPaletteId || '',
      });
    } catch (e) {
      return jsonError(res, 400, e.message || 'Resume data could not be saved for automatic PDF delivery.');
    }
  }

  const order = await razorpay('orders', {
    method: 'POST',
    body: JSON.stringify({ amount: Math.round(resolved.price * 100), currency: 'INR', receipt: `cvm_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`.slice(0, 40), notes: { product: resolved.product, templateId: resolved.templateId, category: resolved.category } }),
  });
  const user = await getUserFromRequest(req);
  await db().collection('orders').doc(order.id).set({
    orderId: order.id, templateId: resolved.templateId, templateName: resolved.templateName, category: resolved.category,
    product: resolved.product, amountPaise: order.amount, currency: order.currency, status: 'created',
    uid: user?.uid || null, customerEmail, customerName: String(req.body?.customerName || '').slice(0, 120),
    resumeSnapshot, createdAt: FieldValue.serverTimestamp(),
  });
  return res.status(200).json({ success: true, orderId: order.id, amount: order.amount, currency: order.currency, keyId: getRazorpayKeyId(), ...resolved });
}

async function verifyPayment(req, res) {
  const orderId = String(req.body?.razorpay_order_id || '');
  const paymentId = String(req.body?.razorpay_payment_id || '');
  const signature = String(req.body?.razorpay_signature || '');
  if (!orderId || !paymentId || !signature) return jsonError(res, 400, 'Incomplete payment data.');
  const orderSnap = await db().collection('orders').doc(orderId).get();
  if (!orderSnap.exists) return jsonError(res, 404, 'Order not found.');
  const order = orderSnap.data();
  const user = await getUserFromRequest(req);
  if (order.uid && (!user || order.uid !== user.uid)) return jsonError(res, 403, 'Order ownership mismatch.');
  if (!verifyPaymentSignature(orderId, paymentId, signature)) return jsonError(res, 400, 'Payment signature verification failed.');
  let payment = await razorpay(`payments/${encodeURIComponent(paymentId)}`);
  if (payment.order_id !== orderId || payment.currency !== 'INR' || payment.amount !== order.amountPaise) return jsonError(res, 409, 'Payment amount/order could not be verified.');
  if (payment.status === 'authorized') {
    await razorpay(`payments/${encodeURIComponent(paymentId)}/capture`, { method: 'POST', body: JSON.stringify({ amount: order.amountPaise, currency: 'INR' }) });
    payment = await razorpay(`payments/${encodeURIComponent(paymentId)}`);
  }
  if (payment.status !== 'captured') return jsonError(res, 409, 'Payment is not captured yet.');

  await db().collection('purchases').doc(paymentId).set({
    purchaseId: paymentId, orderId, paymentId, uid: user?.uid || order.uid || null,
    templateId: order.templateId, templateName: order.templateName, category: order.category, product: order.product,
    amountPaise: order.amountPaise, currency: order.currency, status: 'paid', customerEmail: order.customerEmail || null, customerName: order.customerName || null, createdAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  await orderSnap.ref.set({ status: 'paid', paymentId, paidAt: FieldValue.serverTimestamp() }, { merge: true });

  // ============================================================
  // FIX: Email delivery is now fire-and-forget so the browser gets
  // the PDF immediately. Chromium PDF generation takes 15-25s and
  // would otherwise block the verification response (30-40s wait).
  // The Razorpay webhook also retries email delivery as a backup.
  // ============================================================
  let emailDelivery = { success: false, pending: false, skipped: order.product !== 'template' };
  if (order.product === 'template') {
    emailDelivery = { success: false, pending: true };
    // Fire-and-forget: do NOT await.
    deliverPaidResumeEmail(paymentId).catch((emailError) => {
      console.error('Background paid PDF email delivery pending:', emailError);
    });
  }
  return res.status(200).json({ success: true, verified: true, paymentId, orderId, templateId: order.templateId, product: order.product, emailDelivery, entitlementToken: issueEntitlement(paymentId) });
}

async function cloneCustom(req, res) {
  const paymentId = String(req.body?.paymentId || '');
  const imageData = String(req.body?.imageData || '');
  const mimeType = String(req.body?.mimeType || '');
  const entitlementToken = String(req.body?.entitlementToken || '');
  if (!paymentId || !imageData || !verifyEntitlement(entitlementToken, paymentId)) return jsonError(res, 403, 'A valid verified payment entitlement is required.');
  const purchase = await db().collection('purchases').doc(paymentId).get();
  if (!purchase.exists || purchase.data()?.product !== 'custom' || purchase.data()?.status !== 'paid') return jsonError(res, 403, 'A verified custom-clone payment is required.');
  const user = await getUserFromRequest(req);
  if (purchase.data()?.uid && (!user || purchase.data().uid !== user.uid)) return jsonError(res, 403, 'Payment ownership mismatch.');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) return jsonError(res, 400, 'Only JPG, PNG or WebP images are supported.');
  const comma = imageData.indexOf(',');
  const base64 = comma >= 0 ? imageData.slice(comma + 1) : imageData;
  if (!base64 || base64.length > 4_000_000) return jsonError(res, 400, 'Image is too large. Maximum 4.5 MB request payload is supported.');

  let text;
  try {
    text = await callGeminiRaw(
      [
        { text: 'Analyze this resume template image. Return JSON only with primaryColor (hex), backgroundColor (hex), layout (single-column or two-column-left), fontStyle (serif or sans-serif). Do not include any other keys.' },
        { inlineData: { mimeType, data: base64 } },
      ],
      { json: true, maxOutputTokens: 1024 }
    );
  } catch (e) {
    return jsonError(res, e.status || 502, e.message || 'AI layout extraction failed.');
  }
  if (!text) return jsonError(res, 502, 'AI returned no layout data.');
  let layoutConfig;
  try { layoutConfig = JSON.parse(text.replace(/```json|```/g, '').trim()); } catch { return jsonError(res, 502, 'AI returned invalid JSON.'); }
  const safe = {
    primaryColor: /^#[0-9a-fA-F]{6}$/.test(String(layoutConfig.primaryColor)) ? String(layoutConfig.primaryColor) : '#1e3a5f',
    backgroundColor: /^#[0-9a-fA-F]{6}$/.test(String(layoutConfig.backgroundColor)) ? String(layoutConfig.backgroundColor) : '#ffffff',
    layout: ['single-column', 'two-column-left'].includes(layoutConfig.layout) ? layoutConfig.layout : 'single-column',
    fontStyle: ['serif', 'sans-serif'].includes(layoutConfig.fontStyle) ? layoutConfig.fontStyle : 'sans-serif',
  };
  await purchase.ref.set({ customCloneGeneratedAt: FieldValue.serverTimestamp() }, { merge: true });
  return res.status(200).json({ success: true, layoutConfig: safe });
}

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.Gemini_API_Key || '';
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientGeminiError(status, message = '') {
  const msg = String(message).toLowerCase();
  return (
    status === 429 ||
    status === 503 ||
    status === 500 ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('unavailable') ||
    msg.includes('resource_exhausted') ||
    msg.includes('try again') ||
    msg.includes('rate limit') ||
    msg.includes('quota')
  );
}

/** Primary + fallbacks. New API keys often cannot use gemini-2.5-flash. */
function getGeminiModelChain() {
  const primary = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const fallbacks = String(process.env.GEMINI_FALLBACK_MODELS || 'gemini-3.5-flash-lite,gemini-3.5-flash,gemini-3.1-flash-lite')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const chain = [primary, ...fallbacks];
  return [...new Set(chain)];
}

/**
 * Low-level generateContent with model fallback + retry on high demand / 503 / 429.
 * parts: Gemini content parts array, e.g. [{ text: '...' }] or text + inlineData.
 */
async function callGeminiRaw(parts, { json = false, maxOutputTokens = 2048, retriesPerModel = 3 } = {}) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    const err = new Error('GEMINI_API_KEY is not configured. Set GEMINI_API_KEY in Vercel environment variables.');
    err.status = 500;
    throw err;
  }

  const bodyBase = {
    generationConfig: {
      maxOutputTokens,
      temperature: 0.7,
      ...(json ? { responseMimeType: 'application/json' } : {}),
    },
    contents: [{ parts }],
  };

  const models = getGeminiModelChain();
  let lastError = null;

  for (const model of models) {
    for (let attempt = 0; attempt < retriesPerModel; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bodyBase) }
        );
        const data = await response.json().catch(() => ({}));
        const errMsg = data?.error?.message || '';

        if (!response.ok) {
          if (isTransientGeminiError(response.status, errMsg) && attempt < retriesPerModel - 1) {
            const waitMs = 800 * (attempt + 1) + Math.floor(Math.random() * 400);
            console.warn(`Gemini ${model} transient (${response.status}). Retry ${attempt + 1}/${retriesPerModel} in ${waitMs}ms`);
            await sleep(waitMs);
            continue;
          }
          if (isTransientGeminiError(response.status, errMsg)) {
            lastError = new Error(errMsg || `Model ${model} busy`);
            lastError.status = response.status;
            break; // try next model
          }
          const err = new Error(errMsg || 'Gemini API request failed.');
          err.status = response.status >= 400 && response.status < 500 ? response.status : 502;
          throw err;
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          if (attempt < retriesPerModel - 1) {
            await sleep(600 * (attempt + 1));
            continue;
          }
          lastError = new Error('AI returned empty response.');
          lastError.status = 502;
          break;
        }
        return text.trim();
      } catch (e) {
        if (e.status && e.status !== 502 && e.status !== 503 && e.status !== 429 && e.status !== 500) throw e;
        lastError = e;
        if (attempt < retriesPerModel - 1 && isTransientGeminiError(e.status || 503, e.message)) {
          await sleep(800 * (attempt + 1));
          continue;
        }
        break; // next model
      }
    }
  }

  const err = new Error(
    lastError?.message?.includes('high demand') || lastError?.message?.includes('overloaded')
      ? 'AI server abhi busy hai (high demand). 5–10 seconds baad dubara try karein.'
      : lastError?.message || 'AI server busy hai. Thodi der baad try karein.'
  );
  err.status = 503;
  throw err;
}

async function callGemini(prompt, { json = false, maxOutputTokens = 2048 } = {}) {
  return callGeminiRaw([{ text: prompt }], { json, maxOutputTokens });
}

function stripHtml(html = '') {
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildAiPrompt(type, body) {
  const rawText = stripHtml(body.rawText || body.text || '');
  const targetRole = String(body.targetRole || body.role || '').trim();
  const tone = String(body.tone || 'third-person').toLowerCase();
  const mode = String(body.mode || 'fit').toLowerCase();
  const lang = String(body.lang || 'en').toLowerCase();
  const isHindi = lang === 'hi';

  if (type === 'rewrite') {
    return `You are an expert resume writer. Rewrite the following raw text into professional, ATS-friendly resume content.
Rules:
- Use strong action verbs and quantifiable achievements where possible.
- Keep bullet points concise (1–2 lines each).
- Output plain text only (use • for bullets if needed). No markdown, no explanations.
- Preserve facts; do not invent companies, dates, or numbers that are not implied.
- Tone: ${tone === 'first-person' ? 'first person (I/my)' : 'third person implied (no I/my)'}.
${targetRole ? `- Tailor slightly toward the role: ${targetRole}` : ''}
${isHindi ? '- Prefer clear English suitable for Indian job market; keep any Hindi names/places as-is.' : ''}

Raw input:
${rawText || '(empty — invent a short professional placeholder based on role if given)'}`;
  }

  if (type === 'roleTune') {
    return `You are an expert resume writer and career coach. Given the candidate's current resume content and a target job role, produce a tailored version.

Return ONLY valid JSON with these keys:
{
  "summary": "2-4 sentence professional summary/objective tailored to the target role",
  "skills": "comma-separated list of relevant skills and tools for the role",
  "workExperience": "rewritten experience section as plain text with • bullets, aligned to the target role"
}

Rules:
- Do not invent fake jobs or companies. Only rephrase and emphasize existing content.
- Make summary ATS-friendly and role-specific.
- Skills should be realistic given the input.
- Tone: professional, ${tone === 'first-person' ? 'first person' : 'implied third person'}.
- Output JSON only, no markdown fences.

Target role: ${targetRole || 'General professional role'}

Current content:
Summary: ${stripHtml(body.summary || '')}
Experience: ${stripHtml(body.workExperience || rawText)}
Skills: ${stripHtml(body.skills || body.officeAutomation || '')}
Education hints: ${[body.gradCourse, body.gradCollege].filter(Boolean).join(', ')}`;
  }

  if (type === 'biodata') {
    return `You are an expert Indian marriage biodata writer. Generate elegant, culturally appropriate formal English (and lightly traditional) phrasing for a marriage biodata.

Return ONLY valid JSON:
{
  "aboutMe": "3-5 sentences elegant About Me / personal introduction",
  "familyDetails": "2-4 sentences formal family background summary",
  "expectations": "1-3 sentences about partner expectations if inputs allow, else empty string"
}

Rules:
- Respectful, formal, positive tone suitable for Indian marriage biodata.
- Do not invent facts not present in the inputs.
- Keep names, places, occupations accurate.
- Output JSON only.

Inputs:
Name: ${body.fullName || ''}
DOB: ${body.dob || ''}
Birth place: ${body.birthPlace || ''}
Education/Occupation: ${body.occupation || body.education || body.gradCourse || ''}
Father: ${body.fatherName || body.father || ''}
Mother: ${body.motherName || body.mother || ''}
Family: ${body.familyBackground || body.brother || ''} ${body.sister || ''}
Religion/Caste/Gotra: ${[body.religion, body.caste, body.gotra].filter(Boolean).join(', ')}
Extra notes: ${rawText}`;
  }

  if (type === 'grammar') {
    return `You are a professional editor. Fix grammar, spelling, punctuation, and enforce consistent tone on the following resume/biodata text.

Rules:
- Enforce ${tone === 'first-person' ? 'first-person (I/my)' : 'implied third-person (no I/my)'} tone throughout.
- Prefer active voice.
- Keep meaning identical; do not add new facts.
- Output plain text only (preserve • bullets and line breaks). No explanations.

Text:
${rawText}`;
  }

  if (type === 'a4Fit') {
    const direction = mode === 'expand' ? 'EXPAND' : mode === 'summarize' ? 'SUMMARIZE' : 'AUTO';
    return `You are an expert resume editor specializing in single-page A4 resumes.

Task: ${direction === 'EXPAND' ? 'Expand and enrich' : direction === 'SUMMARIZE' ? 'Condense and summarize' : 'Automatically expand if short or condense if long'} the content so it fits a professional single-page A4 resume.

Target length guide:
- Summary/objective: about 40–70 words
- Experience section: about 80–160 words total
- Keep skills as a compact comma-separated or short bullet list

Return ONLY valid JSON:
{
  "summary": "fitted summary text",
  "workExperience": "fitted experience text with • bullets",
  "skills": "fitted skills text (optional, may be empty if not provided)"
}

Rules:
- Never invent employers, degrees, or metrics that are not in the source.
- Prefer strong action verbs.
- Output JSON only.

Current summary:
${stripHtml(body.summary || '')}

Current experience:
${stripHtml(body.workExperience || rawText)}

Current skills:
${stripHtml(body.skills || body.officeAutomation || body.techKnowledge || '')}

Target role (optional): ${targetRole}`;
  }

  if (type === 'atsScore') {
    const jd = String(body.jobDescription || body.jd || '').trim();
    return `You are an ATS (Applicant Tracking System) expert for the Indian and global job market.

Analyze how well this resume matches the target role${jd ? ' and job description' : ''}.

Return ONLY valid JSON:
{
  "score": 0-100,
  "level": "Poor|Fair|Good|Excellent",
  "missingKeywords": ["keyword1", "keyword2"],
  "presentKeywords": ["keyword1"],
  "suggestions": ["short actionable tip 1", "tip 2", "tip 3"],
  "actionVerbsMissing": ["Led", "Optimized"]
}

Rules:
- score is integer 0-100 based on keyword overlap, action verbs, quantifiable results, and role relevance.
- missingKeywords: important terms from the role/JD not found in the resume (max 12).
- presentKeywords: strong matches already present (max 10).
- suggestions: concrete, short (max 5).
- Do not invent that the candidate has skills they never mentioned; only suggest keywords to consider adding.
- Output JSON only.

Target role: ${targetRole || 'General'}
Job description (optional):
${jd || '(none provided)'}

Resume content:
Summary: ${stripHtml(body.summary || '')}
Experience: ${stripHtml(body.workExperience || rawText)}
Skills: ${stripHtml(body.skills || body.officeAutomation || body.techKnowledge || '')}
Education: ${[body.gradCourse, body.gradCollege, body.gradUniv].filter(Boolean).join(', ')}`;
  }

  if (type === 'atsOptimize') {
    const missing = Array.isArray(body.missingKeywords) ? body.missingKeywords.slice(0, 15).join(', ') : String(body.missingKeywords || '');
    return `You are an ATS optimization expert. Naturally weave relevant missing keywords and stronger action verbs into the resume text WITHOUT inventing fake jobs, companies, or metrics.

Return ONLY valid JSON:
{
  "summary": "optimized summary",
  "workExperience": "optimized experience with • bullets",
  "skills": "optimized comma-separated or short skills list",
  "addedKeywords": ["keywords you naturally inserted"]
}

Rules:
- Insert missing keywords only where they fit honestly from context.
- Prefer stronger action verbs (Led, Delivered, Optimized, Coordinated, etc.).
- Keep length similar; do not double the text.
- Output JSON only.

Target role: ${targetRole || 'General'}
Missing keywords to consider: ${missing || '(none)'}
Job description hints: ${String(body.jobDescription || body.jd || '').slice(0, 1500)}

Current summary:
${stripHtml(body.summary || '')}

Current experience:
${stripHtml(body.workExperience || rawText)}

Current skills:
${stripHtml(body.skills || body.officeAutomation || body.techKnowledge || '')}`;
  }

  if (type === 'translate') {
    const targetLang = String(body.targetLang || 'en').toLowerCase();
    const fromHint = String(body.sourceLang || 'auto');
    return `You are a professional translator and resume editor for the Indian job market.

Translate and rewrite the following text into ${targetLang === 'hi' ? 'formal, traditional Hindi suitable for marriage biodata (use respectful language)' : 'clear, high-standard professional English suitable for corporate resumes'}.

Rules:
- If input is Hinglish/Hindi, convert meaning accurately; do not drop facts.
- For English output: corporate, ATS-friendly, active voice.
- For Hindi output: formal biodata tone (not slang).
- Output plain text only. No explanations, no markdown.
- Preserve names, places, numbers, degrees as appropriate.
- Source language hint: ${fromHint}

Text:
${rawText}`;
  }

  if (type === 'skillsBreak') {
    return `You are a resume skills architect. Split the following unorganized skills text into clear categories.

Return ONLY valid JSON:
{
  "coreCompetencies": ["skill1", "skill2"],
  "technicalTools": ["tool1", "tool2"],
  "softSkills": ["soft1", "soft2"],
  "officeAutomation": "comma-separated office tools if any",
  "formatted": "ready-to-paste short block with category headers"
}

Rules:
- Do not invent skills not implied by the input.
- Max 8 items per list.
- "formatted" should be plain text with lines like "Core: ...", "Technical: ...", "Soft: ...".
- Output JSON only.

Target role (optional): ${targetRole}

Raw skills text:
${rawText || [body.officeAutomation, body.techKnowledge, body.skills].filter(Boolean).join(', ')}`;
  }

  if (type === 'designSuggest') {
    const role = targetRole.toLowerCase();
    const skills = stripHtml(body.skills || body.officeAutomation || '').toLowerCase();
    const experience = stripHtml(body.workExperience || '');
    const fresher = experience.length <= 40;
    let paletteId = 'slate', primaryColor = '#334155', accentColor = '#0f766e', fontStyle = 'sans-serif', themeLabel = 'Modern Slate';
    if (/finance|bank|banking|account|audit|tax|government|govt|civil|law|legal/.test(role)) {
      paletteId = /government|govt|civil/.test(role) ? 'charcoal' : 'navy';
      primaryColor = paletteId === 'navy' ? '#173b63' : '#374151';
      accentColor = '#64748b';
      themeLabel = paletteId === 'navy' ? 'Professional Navy' : 'Formal Charcoal';
    } else if (/design|creative|ui|ux|artist|media|marketing|content/.test(role) || /figma|photoshop|illustrator/.test(skills)) {
      paletteId = 'teal'; primaryColor = '#0f766e'; accentColor = '#14b8a6'; themeLabel = 'Creative Teal';
    } else if (/health|medical|doctor|nurse|pharma|clinical/.test(role)) {
      paletteId = 'emerald'; primaryColor = '#047857'; accentColor = '#10b981'; themeLabel = 'Healthcare Emerald';
    } else if (/marriage|biodata|traditional/.test(role)) {
      paletteId = 'maroon'; primaryColor = '#7f1d1d'; accentColor = '#b45309'; fontStyle = 'serif'; themeLabel = 'Traditional Maroon';
    }
    const sectionOrder = fresher
      ? ['personal', 'summary', 'education', 'experience', 'skills']
      : ['personal', 'summary', 'experience', 'skills', 'education'];
    return {
      __localDesignSuggestion: true, profile: fresher ? 'fresher' : 'experienced', sectionOrder,
      reason: fresher ? 'Education is highlighted before experience for an early-career profile.' : 'Relevant experience is highlighted before education for an experienced profile.',
      paletteId, primaryColor, accentColor, fontStyle, themeLabel,
    };
  }

  if (type === 'bilingualBiodata') {
    return `You are an expert Indian marriage biodata writer. Produce BOTH formal English and traditional Hindi versions.

Return ONLY valid JSON:
{
  "aboutMeEn": "3-5 sentences formal English About Me",
  "aboutMeHi": "3-5 sentences formal Hindi About Me",
  "familyDetailsEn": "2-4 sentences English family summary",
  "familyDetailsHi": "2-4 sentences Hindi family summary",
  "astrologyLineEn": "one line with Rashi/Nakshatra/Gotra if provided, else empty",
  "astrologyLineHi": "same in Hindi if provided, else empty"
}

Rules:
- Respectful, modest, culturally appropriate.
- Do not invent facts.
- Output JSON only.

Inputs:
Name: ${body.fullName || ''}
DOB: ${body.dob || ''}
Birth place: ${body.birthPlace || ''}
Rashi: ${body.rashi || ''}
Nakshatra: ${body.nakshatra || ''}
Gotra: ${body.gotra || ''}
Occupation/Education: ${body.occupation || body.gradCourse || ''}
Father: ${body.fatherName || body.father || ''} (${body.fatherOccupation || ''})
Mother: ${body.motherName || body.mother || ''} (${body.motherOccupation || ''})
Brother: ${body.brother || ''}
Sister: ${body.sister || ''}
Extra: ${rawText}`;
  }

  if (type === 'astrologyFormat') {
    return `You are an Indian marriage biodata formatter specializing in kundli/astrology and family details.

Return ONLY valid JSON:
{
  "astrologyBlockEn": "neat single block: Date of Birth, Time, Place, Rashi, Nakshatra, Gotra (skip empty fields)",
  "astrologyBlockHi": "same in formal Hindi",
  "familyBlockEn": "neat family block (father, mother, siblings)",
  "familyBlockHi": "same in formal Hindi"
}

Rules:
- Clean labels, consistent order, no invented data.
- Output JSON only.

DOB: ${body.dob || ''}
Birth time: ${body.birthTime || ''}
Birth place: ${body.birthPlace || ''}
Rashi: ${body.rashi || ''}
Nakshatra: ${body.nakshatra || ''}
Gotra: ${body.gotra || ''}
Father: ${body.fatherName || ''} / ${body.fatherOccupation || ''}
Mother: ${body.motherName || ''} / ${body.motherOccupation || ''}
Brother: ${body.brother || ''}
Sister: ${body.sister || ''}`;
  }

  // ─── AI Resume Copilot (full analysis) ───
  if (type === 'resumeCopilot') {
    const jd = String(body.jobDescription || body.jd || '').slice(0, 2500);
    return `You are an expert resume coach for the Indian job market. Analyze this resume thoroughly.

Return ONLY valid JSON:
{
  "profile": "Fresher|Experienced|Career Switcher",
  "targetRole": "detected or given target role",
  "completeness": 0-100,
  "jobMatchScore": 0-100,
  "jobMatchNote": "Estimated keyword/content match based on the provided JD (not a real ATS guarantee).",
  "majorIssues": ["short issue 1", "short issue 2"],
  "strengths": ["strength 1", "strength 2"],
  "missingKeywords": ["kw1", "kw2"],
  "presentKeywords": ["kw1"],
  "suggestions": [
    {"id": "s1", "section": "summary|experience|skills|education|overall", "severity": "high|medium|low", "issue": "what is wrong", "fix": "concrete fix", "suggestedText": "optional improved text for that section"}
  ],
  "improvedSummary": "optional full improved summary if summary is weak",
  "improvedSkills": "optional improved skills list",
  "safeExperienceRewrite": "optional improved experience bullets using ONLY existing facts"
}

Rules:
- Be honest and specific. Do not invent companies, dates, or metrics.
- If JD is provided, score jobMatchScore on keyword/content overlap only; label it as estimate.
- Max 8 suggestions, max 6 majorIssues.
- suggestedText must only rephrase existing facts.
- Output JSON only.

Target role: ${targetRole || 'General'}
Job description:
${jd || '(none)'}

Resume:
Name: ${body.fullName || ''}
Summary: ${stripHtml(body.summary || '')}
Experience: ${stripHtml(body.workExperience || rawText)}
Skills: ${stripHtml(body.skills || body.officeAutomation || body.techKnowledge || '')}
Education: ${[body.gradCourse, body.gradCollege, body.gradUniv, body.gradDiv].filter(Boolean).join(', ')}
Inter: ${[body.interSchool, body.interBoard].filter(Boolean).join(', ')}
SSC: ${[body.sscSchool, body.sscBoard].filter(Boolean).join(', ')}`;
  }

  // ─── JD Matcher ───
  if (type === 'jdMatch') {
    const jd = String(body.jobDescription || body.jd || '').slice(0, 3500);
    if (!jd.trim()) {
      const e = new Error('jobDescription is required for JD match.');
      e.status = 400;
      throw e;
    }
    return `You are a job-description matching expert for resumes (Indian market).

Return ONLY valid JSON:
{
  "jobMatchScore": 0-100,
  "jobMatchNote": "Estimated keyword/content match based on the provided JD — not an official ATS score.",
  "strongMatch": ["skill or theme already well evidenced"],
  "missing": ["important JD requirements missing from resume"],
  "weakEvidence": ["mentioned but weakly supported"],
  "relevantExperienceSections": 0,
  "keywordsDetected": 0,
  "presentKeywords": ["..."],
  "missingKeywords": ["..."],
  "tailoredSummary": "summary rewritten for this JD using only existing facts",
  "tailoredSkills": "skills list optimized for this JD (no fake skills)",
  "tailoredExperience": "experience bullets tailored for this JD using only existing facts"
}

Rules:
- Never invent jobs, metrics, or skills the candidate did not mention.
- Keep tailored text concise and ATS-friendly.
- Output JSON only.

Target role: ${targetRole || 'from JD'}
Job description:
${jd}

Resume:
Summary: ${stripHtml(body.summary || '')}
Experience: ${stripHtml(body.workExperience || rawText)}
Skills: ${stripHtml(body.skills || body.officeAutomation || body.techKnowledge || '')}
Education: ${[body.gradCourse, body.gradCollege, body.gradUniv].filter(Boolean).join(', ')}`;
  }

  // ─── Smart Bullet Generator ───
  if (type === 'smartBullet') {
    return `You are an expert resume bullet writer for Indian job seekers.

User's rough experience text:
${rawText || '(empty)'}

Return ONLY valid JSON:
{
  "bullets": ["• professional bullet 1", "• professional bullet 2"],
  "needsMetrics": true,
  "metricPrompts": ["customers/day?", "team size?", "monthly sales?", "documents processed?", "projects completed?"],
  "note": "short note if metrics would help"
}

Rules:
- Convert rough text into strong action-verb bullets.
- Do NOT invent numbers, percentages, or fake achievements.
- If no quantifiable metric is in the input, set needsMetrics true and suggest 2-4 metricPrompts.
- Max 5 bullets. Plain text with • prefix.
- Output JSON only.
${targetRole ? `Target role: ${targetRole}` : ''}`;
  }

  // ─── Weakness Detector ───
  if (type === 'weaknessDetect') {
    return `You are a strict resume critic. Find weak writing and suggest better versions without inventing facts.

Return ONLY valid JSON:
{
  "items": [
    {
      "section": "summary|experience|skills|education",
      "original": "exact weak phrase or bullet",
      "verdict": "Weak|OK|Strong",
      "problems": ["generic wording", "no achievement"],
      "better": "improved version using same facts only"
    }
  ],
  "overallTips": ["tip1", "tip2"]
}

Rules:
- Focus on generic phrases like "responsible for", vague scope, missing evidence.
- better text must not invent metrics.
- Max 8 items.
- Output JSON only.

Summary: ${stripHtml(body.summary || '')}
Experience: ${stripHtml(body.workExperience || rawText)}
Skills: ${stripHtml(body.skills || body.officeAutomation || body.techKnowledge || '')}`;
  }

  // ─── Parse / extract resume fields from pasted text ───
  if (type === 'parseResume') {
    return `You extract structured resume fields from a resume. The user may paste text and/or attach a PDF/image of the resume. Read the attachment carefully if present.

Return ONLY valid JSON:
{
  "fullName": "",
  "email": "",
  "phone": "",
  "address": "",
  "role": "",
  "summary": "",
  "workExperience": "plain text with • bullets if possible",
  "officeAutomation": "skills comma-separated",
  "techKnowledge": "",
  "gradCourse": "",
  "gradCollege": "",
  "gradUniv": "",
  "gradDiv": "",
  "interSchool": "",
  "interBoard": "",
  "interDiv": "",
  "sscSchool": "",
  "sscBoard": "",
  "sscDiv": "",
  "hobbies": "",
  "confidence": "high|medium|low",
  "notes": "what was unclear"
}

Rules:
- Extract only what is present; leave empty string if unknown.
- Do not invent data.
- If a PDF/image is attached, read all visible text from it.
- Output JSON only.

Raw resume text (may be empty if only file uploaded):
${rawText || '(none — use attached file if any)'}`;
  }

  // ─── Career Target suggestions ───
  if (type === 'careerTarget') {
    return `You are a career coach for Indian job seekers. Given a target job title, suggest structure and skills.

Return ONLY valid JSON:
{
  "targetRole": "${targetRole || 'General'}",
  "recommendedSections": ["Summary", "Skills", "Experience", "Education"],
  "relevantSkills": ["skill1", "skill2"],
  "summaryTemplate": "2-3 sentence template the user can fill",
  "experienceTips": ["tip1", "tip2"],
  "keywords": ["keyword1", "keyword2"]
}

Rules:
- Practical for Indian market (fresher-friendly when role is entry-level).
- Max 10 skills, max 12 keywords.
- Output JSON only.

Target job: ${targetRole || rawText || 'General'}`;
  }

  // ─── Fact & consistency check ───
  if (type === 'factCheck') {
    return `You are a resume QA checker. Find inconsistencies and formatting issues. Do not rewrite the whole resume.

Return ONLY valid JSON:
{
  "warnings": [
    {"severity": "high|medium|low", "message": "clear warning", "field": "optional field name"}
  ],
  "duplicates": ["duplicate skill or repeated achievement"],
  "formatIssues": ["date format", "phone format", etc.],
  "toneIssues": ["first-person mixed with third-person"],
  "ok": true
}

Rules:
- Flag date conflicts, duplicate skills, inconsistent titles, spelling variants, phone/email format, repeated achievements.
- If nothing serious, warnings can be empty and ok true.
- Output JSON only.

Name: ${body.fullName || ''}
Email: ${body.email || ''}
Phone: ${body.phone || ''}
Summary: ${stripHtml(body.summary || '')}
Experience: ${stripHtml(body.workExperience || rawText)}
Skills: ${stripHtml(body.skills || body.officeAutomation || body.techKnowledge || '')}
Education: ${[body.gradCourse, body.gradCollege, body.gradUniv, body.gradDiv].filter(Boolean).join(' | ')}
Inter: ${[body.interSchool, body.interBoard, body.interDiv].filter(Boolean).join(' | ')}
SSC: ${[body.sscSchool, body.sscBoard, body.sscDiv].filter(Boolean).join(' | ')}`;
  }

  // ─── Cover letter + application email ───
  if (type === 'coverLetter') {
    const jd = String(body.jobDescription || body.jd || '').slice(0, 2000);
    const length = String(body.length || 'standard').toLowerCase();
    return `You write professional cover letters and job application emails for the Indian job market.

Return ONLY valid JSON:
{
  "coverLetter": "full cover letter body",
  "emailSubject": "Application for ...",
  "emailBody": "polite application email body"
}

Rules:
- Length mode: ${length} (short ≈ 120 words, standard ≈ 200, detailed ≈ 320).
- Use only facts from the resume; do not invent experience.
- Formal, confident, specific to role/JD when given.
- Output JSON only.

Candidate name: ${body.fullName || 'Candidate'}
Target role: ${targetRole || 'the position'}
Job description:
${jd || '(none)'}
Summary: ${stripHtml(body.summary || '')}
Experience: ${stripHtml(body.workExperience || rawText)}
Skills: ${stripHtml(body.skills || body.officeAutomation || body.techKnowledge || '')}
Education: ${[body.gradCourse, body.gradCollege].filter(Boolean).join(', ')}`;
  }

  // ─── LinkedIn profile generator ───
  if (type === 'linkedinGen') {
    return `You generate LinkedIn profile content from a resume for the Indian professional market.

Return ONLY valid JSON:
{
  "headline": "max ~220 characters, role + value",
  "about": "LinkedIn About section, first person, 3-6 short paragraphs or tight block",
  "experienceLines": ["company/role focused one-liners or short bullets"],
  "skills": ["skill1", "skill2"]
}

Rules:
- First person for About.
- No invented employers or metrics.
- Output JSON only.

Name: ${body.fullName || ''}
Role: ${targetRole || body.role || ''}
Summary: ${stripHtml(body.summary || '')}
Experience: ${stripHtml(body.workExperience || rawText)}
Skills: ${stripHtml(body.skills || body.officeAutomation || body.techKnowledge || '')}
Education: ${[body.gradCourse, body.gradCollege].filter(Boolean).join(', ')}`;
  }

  // ─── Interview prep ───
  if (type === 'interviewPrep') {
    const jd = String(body.jobDescription || body.jd || '').slice(0, 2000);
    return `You prepare interview questions and sample answers based on the candidate's resume and target role.

Return ONLY valid JSON:
{
  "questions": [
    {
      "q": "question text",
      "sampleAnswer": "answer grounded in resume facts only",
      "tip": "short tip"
    }
  ]
}

Rules:
- Exactly 10 to 15 questions mixing behavioral, role, and resume-specific.
- Sample answers must not invent experience.
- Output JSON only.

Target role: ${targetRole || body.role || 'General'}
Job description:
${jd || '(none)'}
Name: ${body.fullName || ''}
Summary: ${stripHtml(body.summary || '')}
Experience: ${stripHtml(body.workExperience || rawText)}
Skills: ${stripHtml(body.skills || body.officeAutomation || body.techKnowledge || '')}
Education: ${[body.gradCourse, body.gradCollege].filter(Boolean).join(', ')}`;
  }

  // ─── Biodata completeness (marriage) ───
  if (type === 'biodataCheck') {
    return `You check completeness of an Indian marriage biodata.

Return ONLY valid JSON:
{
  "completeness": 0-100,
  "missing": ["Photo missing", "Occupation missing"],
  "complete": ["Contact section complete"],
  "toneAdvice": "short advice for Modern|Simple|Traditional|Elegant tone",
  "languageConsistency": "OK or note about Hindi/English mix"
}

Rules:
- Be practical. Output JSON only.

Name: ${body.fullName || ''}
Photo: ${body.photo ? 'yes' : 'no'}
DOB: ${body.dob || ''}
Occupation: ${body.occupation || body.gradCourse || ''}
Education: ${body.gradCourse || ''}
Father: ${body.fatherName || ''}
Mother: ${body.motherName || ''}
Contact phone: ${body.phone || ''}
Email: ${body.email || ''}
Address: ${body.address || ''}
Religion/Caste: ${body.religion || ''} ${body.caste || ''}
Rashi: ${body.rashi || ''}
Expectations: ${stripHtml(body.expectations || '')}
Family details: ${stripHtml(body.familyDetails || '')}
Summary: ${stripHtml(body.summary || '')}`;
  }

  const err = new Error('Unknown AI enhance type.');
  err.status = 400;
  throw err;
}

const AI_TYPES_JSON = new Set([
  'roleTune', 'biodata', 'a4Fit', 'atsScore', 'atsOptimize',
  'skillsBreak', 'designSuggest', 'bilingualBiodata', 'astrologyFormat',
  'resumeCopilot', 'jdMatch', 'smartBullet', 'weaknessDetect', 'parseResume',
  'careerTarget', 'factCheck', 'coverLetter', 'linkedinGen', 'interviewPrep',
  'biodataCheck',
]);
const AI_TYPES_ALL = new Set([
  'rewrite', 'roleTune', 'biodata', 'grammar', 'a4Fit',
  'atsScore', 'atsOptimize', 'translate', 'skillsBreak',
  'designSuggest', 'bilingualBiodata', 'astrologyFormat',
  'resumeCopilot', 'jdMatch', 'smartBullet', 'weaknessDetect', 'parseResume',
  'careerTarget', 'factCheck', 'coverLetter', 'linkedinGen', 'interviewPrep',
  'biodataCheck',
]);
const AI_TYPES_OPTIONAL_TEXT = new Set([
  'roleTune', 'biodata', 'a4Fit', 'atsScore', 'atsOptimize',
  'skillsBreak', 'designSuggest', 'bilingualBiodata', 'astrologyFormat',
  'resumeCopilot', 'jdMatch', 'weaknessDetect', 'careerTarget', 'factCheck',
  'coverLetter', 'linkedinGen', 'interviewPrep', 'biodataCheck',
]);

async function aiEnhance(req, res) {
  const type = String(req.body?.type || '').trim();
  if (!AI_TYPES_ALL.has(type)) {
    return jsonError(res, 400, 'Invalid AI type.');
  }

  const rawText = String(req.body?.rawText || req.body?.text || '');
  if (!rawText && !AI_TYPES_OPTIONAL_TEXT.has(type)) {
    return jsonError(res, 400, 'rawText is required for this operation.');
  }
  if (type === 'roleTune' && !String(req.body?.targetRole || req.body?.role || '').trim()) {
    return jsonError(res, 400, 'targetRole is required for role tuning.');
  }
  if ((type === 'atsScore' || type === 'atsOptimize') && !String(req.body?.targetRole || req.body?.role || req.body?.jobDescription || '').trim()) {
    return jsonError(res, 400, 'targetRole or jobDescription is required for ATS analysis.');
  }
  if (type === 'jdMatch' && !String(req.body?.jobDescription || req.body?.jd || '').trim()) {
    return jsonError(res, 400, 'jobDescription is required for JD match.');
  }
  if (type === 'careerTarget' && !String(req.body?.targetRole || req.body?.role || req.body?.rawText || '').trim()) {
    return jsonError(res, 400, 'targetRole is required for career target.');
  }
  if (type === 'smartBullet' && !String(req.body?.rawText || req.body?.text || '').trim()) {
    return jsonError(res, 400, 'rawText is required for this operation.');
  }
  if (type === 'parseResume') {
    const hasText = Boolean(String(req.body?.rawText || req.body?.text || '').trim());
    const hasFile = Boolean(String(req.body?.fileBase64 || '').trim());
    if (!hasText && !hasFile) {
      return jsonError(res, 400, 'Paste resume text or upload a PDF/image file.');
    }
  }

  try {
    if (type === 'designSuggest') {
      return res.status(200).json({ success: true, type, ...buildAiPrompt(type, req.body || {}) });
    }
    const needsJson = AI_TYPES_JSON.has(type);
    const prompt = buildAiPrompt(type, req.body || {});

    // Multimodal: PDF / image resume upload for parseResume
    const fileBase64 = String(req.body?.fileBase64 || '').replace(/^data:[^;]+;base64,/, '').trim();
    const mimeType = String(req.body?.mimeType || req.body?.fileMime || '').trim() || 'application/pdf';
    const allowedMime = new Set([
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/gif',
    ]);
    let geminiText;
    if (type === 'parseResume' && fileBase64) {
      if (!allowedMime.has(mimeType) && !mimeType.startsWith('image/')) {
        return jsonError(res, 400, 'Only PDF or image files are supported for upload.');
      }
      // Cap ~12MB base64 (~9MB binary) to avoid huge payloads
      if (fileBase64.length > 12 * 1024 * 1024) {
        return jsonError(res, 400, 'File too large. Use under ~8MB or paste text instead.');
      }
      const parts = [
        { text: prompt },
        { inlineData: { mimeType: mimeType === 'image/jpg' ? 'image/jpeg' : mimeType, data: fileBase64 } },
      ];
      geminiText = await callGeminiRaw(parts, { json: needsJson, maxOutputTokens: 4096 });
    } else {
      geminiText = await callGemini(prompt, { json: needsJson, maxOutputTokens: 3072 });
    }

    if (!needsJson) {
      return res.status(200).json({ success: true, type, enhancedText: geminiText.replace(/^```[\w]*\n?|\n?```$/g, '').trim() });
    }

    let parsed;
    try {
      parsed = JSON.parse(geminiText.replace(/```json|```/g, '').trim());
    } catch {
      return jsonError(res, 502, 'AI returned invalid JSON.');
    }
    return res.status(200).json({ success: true, type, ...parsed });
  } catch (e) {
    return jsonError(res, e.status || 500, e.message || 'AI enhance failed.');
  }
}

async function savePricing(req, res) {
  const admin = await requireAdmin(req, res); if (!admin) return;
  const pricing = await getPricingDoc();
  const basic = cleanPrice(req.body?.basic, pricing.basic);
  const professional = cleanPrice(req.body?.professional, pricing.professional);
  const customClone = cleanPrice(req.body?.customClone, pricing.customClone);
  const input = req.body?.templates && typeof req.body.templates === 'object' ? req.body.templates : {};
  const templates = {};
  for (const id of Object.keys(input)) {
    if (!TEMPLATES[id]) continue;
    const value = input[id] || {};
    const free = Boolean(value.free);
    templates[id] = { free, price: free ? 0 : cleanPrice(value.price, TEMPLATES[id].category === 'Basic' ? basic : professional, true) };
  }
  await db().collection('config').doc('pricing').set({ basic, professional, customClone, templates, updatedAt: FieldValue.serverTimestamp(), updatedBy: admin.uid });
  return res.status(200).json({ basic, professional, customClone, templates });
}

async function resetPricing(req, res) {
  const admin = await requireAdmin(req, res); if (!admin) return;
  await db().collection('config').doc('pricing').set({ ...DEFAULT_PRICING, updatedAt: FieldValue.serverTimestamp(), updatedBy: admin.uid });
  return res.status(200).json({ ...DEFAULT_PRICING });
}

export default async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).json({ ok: true, service: 'cvmaker-server', version: '2026-09-27' });
  if (req.method === 'OPTIONS') { res.setHeader('Allow', 'GET, POST, OPTIONS'); return res.status(204).end(); }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    if (typeof req.body === 'string') {
      try { req.body = JSON.parse(req.body); } catch { return jsonError(res, 400, 'Invalid JSON request body.'); }
    }
    const action = String(req.body?.action || '');
    if (action === 'getPricing') return res.status(200).json(await getPricingDoc());
    if (action === 'getLaunchConfig') return res.status(200).json(await getLaunchConfigDoc());
    if (action === 'saveLaunchConfig') return saveLaunchConfig(req, res);
    if (action === 'getAdminStatus') { const user = await getUserFromRequest(req); return res.status(200).json({ admin: Boolean(user?.admin), email: user?.email || null }); }
    if (action === 'createRazorpayOrder') return createOrder(req, res);
    if (action === 'verifyRazorpayPayment') return verifyPayment(req, res);
    if (action === 'getServerPdfData') {
      const paymentId = String(req.body?.paymentId || '');
      const token = String(req.body?.token || '');
      if (!verifyServerPdfToken(token, paymentId)) return jsonError(res, 403, 'Invalid server PDF token.');
      const snapshot = await getServerPdfSnapshot(paymentId);
      if (!snapshot?.snapshot) return jsonError(res, 404, 'Paid resume snapshot not found.');
      return res.status(200).json(snapshot);
    }
    if (action === 'cloneCustomTemplate') return cloneCustom(req, res);
    if (action === 'aiEnhance') return aiEnhance(req, res);
    if (action === 'savePricing') return savePricing(req, res);
    if (action === 'resetPricing') return resetPricing(req, res);
    return jsonError(res, 400, 'Unknown action.');
  } catch (err) {
    console.error(err);
    return jsonError(res, 500, err?.message || 'Server error.');
  }
}