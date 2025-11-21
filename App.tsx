import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import GroundingPanel from './components/GroundingPanel';
import { Message, ModelType, Coordinates, GroundingMetadata } from './types';
import { streamChatResponse } from './services/geminiService';
import { AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelType, setModelType] = useState<ModelType>(ModelType.FLASH_MAPS);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Store the active grounding metadata to show in the side panel
  const [activeGrounding, setActiveGrounding] = useState<GroundingMetadata | undefined>(undefined);

  // Initial geolocation request
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          setLocationError("Location access denied. Local results may be less accurate.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Create a placeholder for the bot message
    const botMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: botMessageId,
        role: 'model',
        text: '',
        timestamp: Date.now(),
        isStreaming: true,
      },
    ]);

    // Prepare history for the API (excluding the last user message we just added locally for display)
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    let accumulatedText = "";
    let finalGroundingMetadata: GroundingMetadata | undefined = undefined;

    try {
      const stream = streamChatResponse({
        message: userMessage.text,
        history,
        modelType,
        coordinates
      });

      for await (const chunk of stream) {
        const textChunk = chunk.text || "";
        accumulatedText += textChunk;

        // Check for grounding metadata in the chunk
        if (chunk.candidates?.[0]?.groundingMetadata) {
          const metadata = chunk.candidates[0].groundingMetadata;
          // Merge or update grounding metadata
          if (metadata.groundingChunks && metadata.groundingChunks.length > 0) {
             finalGroundingMetadata = metadata as GroundingMetadata;
             setActiveGrounding(finalGroundingMetadata);
          }
        }

        // Update the streaming message
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, text: accumulatedText, groundingMetadata: finalGroundingMetadata } 
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: "**Error:** Failed to get response. Please try again." } 
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-100 font-sans overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {locationError && (
           <div className="bg-amber-900/50 border-b border-amber-700/50 text-amber-200 px-4 py-2 text-xs flex items-center justify-center gap-2">
             <AlertTriangle className="w-3 h-3" />
             {locationError}
           </div>
        )}
        <ChatInterface
          messages={messages}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onSend={handleSend}
          modelType={modelType}
          onModelChange={setModelType}
        />
      </div>

      {/* Side Panel for Grounding (Desktop only, or toggle on mobile - keeping simple split for now) */}
      <div className="hidden md:block w-[350px] flex-shrink-0">
        <GroundingPanel metadata={activeGrounding} />
      </div>
    </div>
  );
};

export default App;