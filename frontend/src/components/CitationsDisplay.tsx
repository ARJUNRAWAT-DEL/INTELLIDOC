import React from "react";

type Citation = {
  quote: string;
  chunk_id: number;
  doc_id: number;
  doc_title: string;
  confidence?: number;
  page_number?: number;
  paragraph_number?: number;
};

interface CitationsDisplayProps {
  citations: Citation[];
  answer?: string;
}

export default function CitationsDisplay({ citations }: CitationsDisplayProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-lg font-bold text-gray-900">Citations</h4>
        <span className="text-sm text-gray-500">
          {citations.length} reference{citations.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="space-y-3">
        {citations.map((citation, index) => (
          <div
            key={`${citation.doc_id}-${citation.chunk_id}-${index}`}
            className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-gray-900">
              <span className="rounded-full bg-white px-2 py-1 text-xs text-gray-600">
                #{index + 1}
              </span>
              <span>{citation.doc_title}</span>
              <span className="text-gray-400">Chunk {citation.chunk_id}</span>
              {typeof citation.page_number === "number" && (
                <span className="text-gray-400">
                  Page {citation.page_number}
                </span>
              )}
              {typeof citation.paragraph_number === "number" && (
                <span className="text-gray-400">
                  Paragraph {citation.paragraph_number}
                </span>
              )}
              {typeof citation.confidence === "number" && (
                <span className="text-gray-400">
                  Confidence {Math.round(citation.confidence * 100)}%
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
              {citation.quote}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
