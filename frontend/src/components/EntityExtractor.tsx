import React from "react";

export interface ExtractedEntity {
  label: string;
  value: string;
}

interface EntityExtractorProps {
  docId: number;
  docTitle: string;
  onExtract?: (entities: ExtractedEntity[]) => void;
}

export default function EntityExtractor({
  docTitle,
  onExtract,
}: EntityExtractorProps) {
  const sampleEntities: ExtractedEntity[] = [];

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-lg font-bold text-gray-900">{docTitle}</h4>
          <p className="text-sm text-gray-600">
            Entity extraction is ready for this document.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onExtract?.(sampleEntities)}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Extract
        </button>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        This panel can be extended to show names, dates, amounts, organizations,
        and other document entities.
      </div>
    </div>
  );
}
