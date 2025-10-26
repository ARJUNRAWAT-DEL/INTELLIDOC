import React from "react";

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

interface ModernSearchResultsProps {
  searchResponse: SearchResponse | null;
  loading: boolean;
  error: string | null;
}

const ModernSearchResults: React.FC<ModernSearchResultsProps> = ({
  searchResponse,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-500 animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-purple-500 animate-spin animation-delay-75"></div>
        </div>
        <div className="mt-6 text-center">
          <div className="text-lg font-semibold text-gray-800 mb-2">
            🧠 AI is thinking...
          </div>
          <div className="text-gray-600">
            Processing your query with advanced neural networks
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-red-100 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Oops! Something went wrong</h3>
            <p className="text-gray-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!searchResponse) {
    return (
      <div className="text-center py-20">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-3xl flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Ready to explore your documents?</h3>
          <p className="text-gray-600 max-w-md mx-auto">Ask any question about your uploaded documents and get instant, intelligent answers powered by AI.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: "🔍", title: "Semantic Search", desc: "Find information using natural language" },
            { icon: "🤖", title: "AI Analysis", desc: "Get insights and summaries instantly" },
            { icon: "📊", title: "Smart Results", desc: "Ranked and relevant answers" }
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h4 className="font-bold text-gray-800 mb-2">{feature.title}</h4>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
  {/* Query Display */}
  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-semibold text-gray-700">Your Question</span>
        </div>
        <p className="text-lg text-gray-800 font-medium italic">"{searchResponse.query}"</p>
        {searchResponse.processing_time && (
          <p className="text-sm text-gray-500 mt-2">
            ⚡ Processed in {searchResponse.processing_time.toFixed(2)}s
          </p>
        )}
      </div>

      {/* Main Answer */}
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">AI Answer</h3>
              <p className="text-gray-700">Generated from your document knowledge base</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">{searchResponse.answer}</p>
          </div>
        </div>
      </div>

      {/* Dual Answers Section */}
      {searchResponse.dual_answers && searchResponse.dual_answers.dual_answers_enabled && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Local Answer */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 flex items-center space-x-3 border-b border-gray-100">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-gray-900 font-bold text-lg">Local AI Model</h4>
            </div>
            <div className="p-6">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {searchResponse.dual_answers.local_answer}
              </p>
            </div>
          </div>

          {/* Groq Answer */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 flex items-center space-x-3 border-b border-gray-100">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-gray-900 font-bold text-lg">Groq Cloud AI</h4>
            </div>
            <div className="p-6">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                {searchResponse.dual_answers.groq_answer}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Selection Reasoning */}
      {searchResponse.dual_answers && searchResponse.dual_answers.selection_reason && (
        <div className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-gray-900">AI Decision Logic</h4>
              <p className="text-sm text-gray-600">Why this answer was selected</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-50">
            <p className="text-gray-800 leading-relaxed">
              <span className="font-semibold text-amber-700">Selected Source:</span> {searchResponse.dual_answers.selected_source}
            </p>
            <p className="text-gray-700 mt-2 leading-relaxed">
              {searchResponse.dual_answers.selection_reason}
            </p>
          </div>
        </div>
      )}

      {/* Sources Section */}
      {searchResponse.sources && searchResponse.sources.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Source Documents</h3>
                <p className="text-gray-700">{searchResponse.sources.length} relevant document{searchResponse.sources.length > 1 ? 's' : ''} found</p>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {searchResponse.sources.map((source, index) => (
                <div key={source.doc_id} className="group">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            #{index + 1}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {source.doc_title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Document ID: {source.doc_id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernSearchResults;