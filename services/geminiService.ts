


import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

export const summarizeArticle = async (articleContent: string): Promise<string> => {
  // First, strip HTML tags from the content to send clean text to the API
  const cleanText = articleContent.replace(/<[^>]*>?/gm, '');

  if (!process.env.API_KEY) {
    return "API key is not configured. Please set the API_KEY environment variable.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following article in three concise sentences:\n\n---\n${cleanText}\n---`,
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing article:", error);
    return "Sorry, I couldn't summarize the article at this time. Please try again later.";
  }
};

export const generateArticleAudio = async (articleContent: string): Promise<string | null> => {
  // First, strip HTML tags from the content.
  const cleanText = articleContent.replace(/<[^>]*>?/gm, '');

  if (!process.env.API_KEY) {
    console.error("API key is not configured.");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: cleanText }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                  // Other voices: Puck, Charon, Zephyr, Fenrir
                  prebuiltVoiceConfig: { voiceName: 'Kore' }, 
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Error generating article audio:", error);
    return null;
  }
};
