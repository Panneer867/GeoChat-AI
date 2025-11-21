import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, ModelType } from '../types';
import { Send, MapPin, Sparkles, Bot, User, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  setInput: (s: string) => void;
  isLoading: boolean;
  onSend: () => void;
  modelType: ModelType;
  onModelChange: (m: ModelType) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  input,
  setInput,
  isLoading,
  onSend,
  modelType,
  onModelChange,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${modelType === ModelType.FLASH_MAPS ? 'bg-blue-600' : 'bg-purple-600'}`}>
            {modelType === ModelType.FLASH_MAPS ? <MapPin className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">GeoChat AI</h1>
            <p className="text-xs text-gray-400">
              {modelType === ModelType.FLASH_MAPS ? 'Real-time Maps & Search' : 'Deep Reasoning Chat'}
            </p>
          </div>
        </div>

        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => onModelChange(ModelType.FLASH_MAPS)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              modelType === ModelType.FLASH_MAPS
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <MapPin className="w-3 h-3" />
            Maps & Search
          </button>
          <button
            onClick={() => onModelChange(ModelType.PRO_CHAT)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              modelType === ModelType.PRO_CHAT
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Chat Pro
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
            <MapPin className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Ask about locations nearby...</p>
            <p className="text-sm">"Find the best coffee shop near me"</p>
            <p className="text-sm">"How do I get to the nearest park?"</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.role === 'user' ? 'bg-gray-700' : modelType === ModelType.FLASH_MAPS ? 'bg-blue-600' : 'bg-purple-600'
              }`}
            >
              {msg.role === 'user' ? <User className="w-5 h-5 text-gray-300" /> : <Bot className="w-5 h-5 text-white" />}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gray-800 text-white rounded-tr-none'
                  : 'bg-gray-700/50 text-gray-100 rounded-tl-none'
              }`}
            >
              <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-700`}>
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
             </div>
             <div className="flex items-center">
                <span className="text-gray-500 text-sm animate-pulse">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="relative flex items-end gap-2 bg-gray-800 rounded-xl p-2 border border-gray-700 focus-within:border-blue-500 transition-colors">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={modelType === ModelType.FLASH_MAPS ? "Ask about places, routes, or searches..." : "Ask me anything..."}
            className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none py-3 px-2 max-h-32 min-h-[44px]"
            rows={1}
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 text-white"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-2">
           <p className="text-[10px] text-gray-500">
              {modelType === ModelType.FLASH_MAPS ? "Using gemini-2.5-flash with Google Maps & Search" : "Using gemini-3-pro-preview"}
           </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;