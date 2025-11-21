import React from 'react';
import { GroundingMetadata, GroundingChunk } from '../types';
import { MapPin, ExternalLink, Star, Navigation, Globe } from 'lucide-react';

interface GroundingPanelProps {
  metadata?: GroundingMetadata;
}

const GroundingPanel: React.FC<GroundingPanelProps> = ({ metadata }) => {
  if (!metadata?.groundingChunks || metadata.groundingChunks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-gray-900 border-l border-gray-800">
        <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <Globe className="w-10 h-10 text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Discovery Panel</h3>
        <p className="text-gray-500 text-sm max-w-xs">
          Grounding sources from Google Maps and Google Search will appear here to verify your AI responses.
        </p>
      </div>
    );
  }

  const mapChunks = metadata.groundingChunks.filter(c => c.maps);
  const webChunks = metadata.groundingChunks.filter(c => c.web);

  return (
    <div className="h-full overflow-y-auto bg-gray-900 border-l border-gray-800 p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-400" />
          Sources
        </h2>
        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
          {metadata.groundingChunks.length} results
        </span>
      </div>

      {/* Google Maps Results */}
      {mapChunks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Google Maps</h3>
          {mapChunks.map((chunk, idx) => (
            <MapCard key={idx} chunk={chunk} />
          ))}
        </div>
      )}

      {/* Web Search Results */}
      {webChunks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Web Search</h3>
          {webChunks.map((chunk, idx) => (
            <WebCard key={idx} chunk={chunk} />
          ))}
        </div>
      )}
    </div>
  );
};

const MapCard: React.FC<{ chunk: GroundingChunk }> = ({ chunk }) => {
  const maps = chunk.maps!;
  
  // Extract title safely
  const title = maps.title || "Location Result";
  const uri = maps.uri || "#";
  const reviews = maps.placeAnswerSources?.reviewSnippets;

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-blue-500/50 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-900/30 rounded-lg">
            <MapPin className="w-4 h-4 text-blue-400" />
          </div>
          <h4 className="font-semibold text-gray-200 text-sm line-clamp-1">{title}</h4>
        </div>
        <a 
          href={uri} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-blue-400 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {reviews && reviews.length > 0 && (
        <div className="mt-3 space-y-2">
           {reviews.slice(0, 1).map((review, i) => (
             <div key={i} className="text-xs text-gray-400 bg-gray-900/50 p-2 rounded border border-gray-700/50 italic">
               "{review.content.slice(0, 80)}{review.content.length > 80 ? '...' : ''}"
             </div>
           ))}
        </div>
      )}
      
      <div className="mt-3 pt-2 border-t border-gray-700/50 flex justify-between items-center">
        <span className="text-[10px] text-gray-500">Google Maps Data</span>
        <a 
          href={uri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:underline font-medium"
        >
          Open Map
        </a>
      </div>
    </div>
  );
};

const WebCard: React.FC<{ chunk: GroundingChunk }> = ({ chunk }) => {
  const web = chunk.web!;
  
  return (
    <a 
      href={web.uri} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 transition-colors group"
    >
      <h4 className="font-medium text-blue-300 text-sm mb-1 line-clamp-2 group-hover:underline">
        {web.title}
      </h4>
      <div className="text-xs text-gray-500 truncate mb-2">
        {new URL(web.uri).hostname}
      </div>
    </a>
  );
};

export default GroundingPanel;