import React, { useState } from "react";

interface SearchOptions {
  query: string;
  answerLength: "short" | "balanced" | "detailed";
  answerMode:
    | "summary"
    | "qa"
    | "keypoints"
    | "pageexplanation"
    | "actionitems";
  pageRange: "entire" | "specific" | "range";
  specificPage?: number;
  startPage?: number;
  endPage?: number;
}

interface SearchBarProps {
  onSearch: (options: SearchOptions) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [answerLength, setAnswerLength] = useState<
    "short" | "balanced" | "detailed"
  >("balanced");
  const [answerMode, setAnswerMode] = useState<
    "summary" | "qa" | "keypoints" | "pageexplanation" | "actionitems"
  >("summary");
  const [pageRange, setPageRange] = useState<"entire" | "specific" | "range">(
    "entire",
  );
  const [specificPage, setSpecificPage] = useState<number>(1);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(10);
  const [showAdvanced, setShowAdvanced] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const options: SearchOptions = {
        query,
        answerLength,
        answerMode,
        pageRange,
        specificPage: pageRange === "specific" ? specificPage : undefined,
        startPage: pageRange === "range" ? startPage : undefined,
        endPage: pageRange === "range" ? endPage : undefined,
      };
      onSearch(options);
    }
  };

  return (
    <div className="relative space-y-4">
      {/* AI Control Panel */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Ask IntelliDoc</h3>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            {showAdvanced ? "Hide" : "Show"} Advanced Options
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
            {/* Answer Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Answer Type
              </label>
              <select
                value={answerMode}
                onChange={(e) => setAnswerMode(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="summary">Summary</option>
                <option value="qa">Question Answering</option>
                <option value="keypoints">Key Points</option>
                <option value="pageexplanation">Page Explanation</option>
                <option value="actionitems">Action Items</option>
              </select>
            </div>

            {/* Answer Length */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Answer Length
              </label>
              <select
                value={answerLength}
                onChange={(e) => setAnswerLength(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="short">Short</option>
                <option value="balanced">Balanced</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>

            {/* Page Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pages
              </label>
              <select
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="entire">Entire Document</option>
                <option value="specific">Specific Page</option>
                <option value="range">Page Range</option>
              </select>
            </div>

            {/* Page Inputs */}
            {pageRange === "specific" && (
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Page Number
                </label>
                <input
                  type="number"
                  value={specificPage}
                  onChange={(e) =>
                    setSpecificPage(parseInt(e.target.value) || 1)
                  }
                  min="1"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            {pageRange === "range" && (
              <div className="md:col-span-3 flex gap-4 items-center">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Page
                  </label>
                  <input
                    type="number"
                    value={startPage}
                    onChange={(e) =>
                      setStartPage(parseInt(e.target.value) || 1)
                    }
                    min="1"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="mt-6 text-gray-500">to</div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Page
                  </label>
                  <input
                    type="number"
                    value={endPage}
                    onChange={(e) => setEndPage(parseInt(e.target.value) || 1)}
                    min={startPage}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Search Input */}
        <form
          onSubmit={handleSubmit}
          className="relative flex w-full gap-4 bg-gray-50 rounded-2xl p-2 border border-gray-200"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me anything about your documents..."
              aria-label="Search documents"
              className="w-full pl-12 pr-4 py-4 bg-transparent text-gray-800 placeholder-gray-600 focus:outline-none text-lg font-medium"
            />
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <button
            type="submit"
            className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-md transition-all duration-200 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <span>Generate Answer</span>
          </button>
        </form>

        {/* Quick Settings Display */}
        {!showAdvanced && (
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
            <span className="bg-gray-100 px-2 py-1 rounded">
              Mode:{" "}
              {answerMode === "qa"
                ? "Question Answering"
                : answerMode.charAt(0).toUpperCase() + answerMode.slice(1)}
            </span>
            <span className="bg-gray-100 px-2 py-1 rounded">
              Length:{" "}
              {answerLength.charAt(0).toUpperCase() + answerLength.slice(1)}
            </span>
            <span className="bg-gray-100 px-2 py-1 rounded">
              Pages:{" "}
              {pageRange === "entire"
                ? "All"
                : pageRange === "specific"
                  ? `Page ${specificPage}`
                  : `${startPage}-${endPage}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
