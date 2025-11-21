export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
  groundingMetadata?: GroundingMetadata;
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  searchEntryPoint?: {
    renderedContent?: string;
  };
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    sourceConfig?: {
      googleMapsSourceConfig?: {
        placeId?: string;
      };
    };
    placeId?: string; // flattened for convenience
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content: string;
        author: string;
        sourceUri: string;
      }[];
    };
  };
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export enum ModelType {
  FLASH_MAPS = 'gemini-2.5-flash',
  PRO_CHAT = 'gemini-3-pro-preview'
}