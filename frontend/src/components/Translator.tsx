import React, { useState } from "react";

interface TranslatorProps {
  text: string;
  onTranslate?: (result: {
    target_language: string;
    translated_text: string;
  }) => void;
}

const LANGUAGES = ["English", "Spanish", "French", "German", "Hindi", "Arabic"];

export default function Translator({ text, onTranslate }: TranslatorProps) {
  const [language, setLanguage] = useState("English");

  const handleTranslate = () => {
    onTranslate?.({
      target_language: language,
      translated_text: text,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-800 outline-none"
        >
          {LANGUAGES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleTranslate}
          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Translate
        </button>
      </div>
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 whitespace-pre-line">
        {text}
      </div>
    </div>
  );
}
