// server/serverPdf.js ya server.js

import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

async function callGeminiApi(prompt, isJson = false) {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY Missing in server environment!");
  }

  // Gemini 2.5 Flash / 1.5 Flash models
  const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash"];

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      if (isJson) {
        const cleanText = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanText);
      }
      return text;
    } catch (err) {
      console.warn(`[Model ${modelName} failed]:`, err.message);
    }
  }

  throw new Error("AI Server High Demand - Please retry after a few seconds.");
}

router.post("/api/ai/enhance", async (req, res) => {
  try {
    const { type, ...payload } = req.body;
    let prompt = "";
    let isJson = false;

    switch (type) {
      case "roleTune":
        isJson = true;
        prompt = `Act as an expert career recruiter. Tune this candidate details specifically for the job role: "${payload.targetRole}".
        
        Summary: ${payload.summary || ""}
        Experience: ${payload.workExperience || ""}
        Skills: ${payload.skills || payload.officeAutomation || ""}

        Return ONLY a JSON object with keys:
        {
          "summary": "rewritten professional summary tailored to ${payload.targetRole}",
          "workExperience": "optimized work experience bullets tailored to ${payload.targetRole}",
          "skills": "relevant skills tailored to ${payload.targetRole}"
        }`;
        break;

      case "designSuggest":
        isJson = true;
        prompt = `Suggest resume design scheme for job role "${payload.targetRole || "Professional"}".
        
        Return ONLY a valid JSON object with keys:
        {
          "paletteId": "navy",
          "primaryColor": "#1e3a5f",
          "accentColor": "#3b82f6",
          "fontStyle": "sans-serif",
          "sectionOrder": ["Summary", "Experience", "Skills", "Education"],
          "profile": "Experienced",
          "reason": "Professional layout suitable for executive & technical roles."
        }`;
        break;

      case "rewrite":
      case "grammar":
        prompt = `Improve tone and fix all grammar issues for:\n\n"${payload.rawText || payload.text}"`;
        break;

      default:
        return res.status(400).json({ success: false, message: "Invalid enhance type provided." });
    }

    const aiResponse = await callGeminiApi(prompt, isJson);

    if (isJson) {
      return res.json({ success: true, ...aiResponse });
    }
    return res.json({ success: true, enhancedText: aiResponse, summary: aiResponse, text: aiResponse });

  } catch (err) {
    console.error("AI Enhance Error:", err);
    return res.status(500).json({ success: false, message: err.message || "Server request failed." });
  }
});

export default router;
