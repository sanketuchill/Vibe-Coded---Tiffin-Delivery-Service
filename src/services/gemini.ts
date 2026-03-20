import { GoogleGenAI, Type, Modality } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";

export const ai = new GoogleGenAI({ apiKey });

export const models = {
  chat: "gemini-3.1-pro-preview",
  image: "gemini-3-pro-image-preview",
  tts: "gemini-2.5-flash-preview-tts",
};

export async function generateMealImage(prompt: string, size: "1K" | "2K" | "4K" = "1K") {
  try {
    const response = await ai.models.generateContent({
      model: models.image,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
}

export async function generateSpeech(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: models.tts,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/mp3;base64,${base64Audio}`;
    }
  } catch (error) {
    console.error("Speech generation failed:", error);
    return null;
  }
}
