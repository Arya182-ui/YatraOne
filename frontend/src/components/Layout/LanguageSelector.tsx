import React from 'react';
import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
];

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const setLang = (code: string) => {
    i18n.changeLanguage(code);
    // Save with 1 month expiry
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem('language', JSON.stringify({ value: code, expiry }));
  };

  return (
    <div className="flex items-center gap-2">
      {LANGS.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLang(lang.code)}
          className={`px-2 py-1 rounded text-xs font-semibold border transition-colors ${current === lang.code ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
          aria-label={`Switch to ${lang.label}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
