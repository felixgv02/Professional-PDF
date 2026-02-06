
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSplitPart = async (pdfName: string, pageRange: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a very short, professional description for a document fragment. 
      File Name: ${pdfName}
      Pages: ${pageRange}
      The context is a PDF splitter application. Just provide one sentence describing what this part likely contains based on the filename.`,
      config: {
        maxOutputTokens: 60,
      }
    });

    return response.text?.trim() || "Split document part.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Processed document section.";
  }
};
