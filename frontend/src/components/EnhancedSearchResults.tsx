import React from "react";

// Local type definitions to avoid import issues
interface Source {
  doc_id: number;
  doc_title: string;
}

interface DualAnswerInfo {
  local_answer: string;
  groq_answer: string;
  selected_source: string;
  selection_reason: string;
  dual_answers_enabled: boolean;
}

interface SearchResponse {
  query: string;
  answer: string;
  sources: Source[];
  processing_time?: number;
  dual_answers?: DualAnswerInfo;
}

interface EnhancedSearchResultsProps {
  searchResponse: SearchResponse | null;
  loading: boolean;
  error: string | null;
}

const EnhancedSearchResults: React.FC<EnhancedSearchResultsProps> = ({
  searchResponse,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mb-6"></div>
        <h3 className="text-lg font-medium text-black mb-2">Processing...</h3>
        <p className="text-gray-600 text-sm">Analyzing documents with dual AI models</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-red-900">Search Error</h3>
            <p className="text-red-700 mt-1 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!searchResponse) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-black mb-2">Ready to Search</h3>
        <p className="text-gray-600 text-sm mb-8">Enter your query above to discover insights from your documents</p>
        <div className="flex justify-center space-x-4">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Dual AI Models</span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Semantic Search</span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Precise Results</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Final Answer Section */}
      <div className="border-l-4 border-black pl-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-medium text-black">
            Answer
            {searchResponse.dual_answers && (
              <span className="ml-3 text-sm font-normal text-gray-600">
                • from {searchResponse.dual_answers.selected_source}
              </span>
            )}
          </h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-900 text-lg leading-relaxed">{searchResponse.answer}</p>
        </div>
        
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {/* Selection Reason */}
          {searchResponse.dual_answers && (
            <span>{searchResponse.dual_answers.selection_reason}</span>
          )}
          
          {/* Processing Time */}
          {searchResponse.processing_time && (
            <span>• {searchResponse.processing_time.toFixed(2)}s</span>
          )}
        </div>
      </div>

      {/* Dual Answers Comparison Section */}
      {searchResponse.dual_answers && searchResponse.dual_answers.dual_answers_enabled && (
        <div className="pt-8 border-t border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-black mb-2">
              Model Comparison
            </h3>
            <p className="text-gray-600 text-sm">See how different AI models approached your question</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Local Model Answer */}
            <div className={`border rounded-lg p-6 ${
              searchResponse.dual_answers.selected_source === 'local' 
                ? 'border-black bg-gray-50' 
                : 'border-gray-200 bg-white'
            }`}>
              {/* Winner indicator */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-black">
                  Local Model
                </h4>
                {searchResponse.dual_answers.selected_source === 'local' && (
                  <span className="text-xs bg-black text-white px-2 py-1 rounded-full">SELECTED</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-4">Phi-3 / FLAN-T5 • Running locally</p>
              
              <div className="text-gray-900 leading-relaxed text-sm">
                {searchResponse.dual_answers.local_answer}
              </div>
            </div>

            {/* GROQ Model Answer */}
            <div className={`border rounded-lg p-6 ${
              searchResponse.dual_answers.selected_source === 'groq' 
                ? 'border-black bg-gray-50' 
                : 'border-gray-200 bg-white'
            }`}>
              {/* Winner indicator */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-black">
                  GROQ Model
                </h4>
                {searchResponse.dual_answers.selected_source === 'groq' && (
                  <span className="text-xs bg-black text-white px-2 py-1 rounded-full">SELECTED</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-4">Llama-3-70B • Cloud-powered • 70B parameters</p>
              
              <div className="text-gray-900 leading-relaxed text-sm">
                {searchResponse.dual_answers.groq_answer}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sources Section */}
      {searchResponse.sources.length > 0 && (
        <div className="pt-8 border-t border-gray-200">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-black mb-2">
              Sources
            </h3>
            <p className="text-gray-600 text-sm">Information gathered from these documents</p>
          </div>
          
          <div className="space-y-3">
            {searchResponse.sources.map((source, index) => (
              <div
                key={`${source.doc_id}-${index}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-black">
                      {source.doc_title}
                    </h4>
                    <p className="text-gray-500 text-sm">ID: {source.doc_id}</p>
                  </div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Query Info */}
      <div className="pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Query: <span className="text-black font-medium">"{searchResponse.query}"</span>
        </p>
      </div>
    </div>
  );
};

export default EnhancedSearchResults;