import React from "react";

interface DocumentComparatorProps {
  docIds: number[];
  docTitles: string[];
  onCompare?: (comparison: {
    docIds: number[];
    docTitles: string[];
    summary: string;
  }) => void;
}

export default function DocumentComparator({
  docIds,
  docTitles,
  onCompare,
}: DocumentComparatorProps) {
  const handleCompare = () => {
    onCompare?.({
      docIds,
      docTitles,
      summary: `Compared ${docTitles.length} document${docTitles.length === 1 ? "" : "s"}.`,
    });
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="text-lg font-bold text-gray-900">
            Document Comparison
          </h4>
          <p className="text-sm text-gray-600">
            Quick comparison view for selected source documents.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCompare}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Compare
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-700">
        {docTitles.map((title, index) => (
          <span
            key={`${title}-${index}`}
            className="rounded-full bg-white px-3 py-1 border border-gray-200"
          >
            {title}
          </span>
        ))}
      </div>
    </div>
  );
}
