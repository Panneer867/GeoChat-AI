import { GoogleGenAI, type GenerateContentResponse } from "@google/genai";
import { Coordinates, ModelType } from '../types';

// Initialize the client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ChatParams {
  message: string;
  history: { role: string; parts: { text: string }[] }[];
  modelType: ModelType;
  coordinates?: Coordinates | null;
}

export async function* streamChatResponse({ message, history, modelType, coordinates }: ChatParams) {
  try {
    const isMapsMode = modelType === ModelType.FLASH_MAPS;
    
    // Configure tools based on the selected model mode
    let tools: any[] = [];
    let toolConfig: any = undefined;

    if (isMapsMode) {
      // For Maps/Search mode, we enable both googleMaps and googleSearch
      tools = [
        { googleMaps: {} }, 
        { googleSearch: {} }
      ];
      
      // If we have coordinates, we pass them to the retrieval config for better local results
      if (coordinates) {
        toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude
            }
          }
        };
      }
    }

    const chat = ai.chats.create({
      model: modelType,
      history: history,
      config: {
        systemInstruction: isMapsMode 
          ? "You are a helpful location expert and navigator. Use Google Maps and Search to provide accurate, real-time information about places, routes, and local businesses. Always double-check opening hours and ratings if available. Format your response clearly with markdown."
          : "You are a helpful, intelligent AI assistant. You can discuss complex topics, reason through problems, and provide creative assistance.",
        tools: tools.length > 0 ? tools : undefined,
        toolConfig: toolConfig,
      }
    });

    const resultStream = await chat.sendMessageStream({ message });

    for await (const chunk of resultStream) {
      yield chunk as GenerateContentResponse;
    }

  } catch (error) {
    console.error("Error in Gemini stream:", error);
    throw error;
  }
}