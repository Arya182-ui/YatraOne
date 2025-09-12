import React from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-sm">
          © {new Date().getFullYear()} {t('publicfooter.copyright_brand', 'Smart Transit')}. {t('publicfooter.copyright', 'All rights reserved.')}
        </span>
        <div className="flex gap-6 text-sm">
          <Link to="/about" className="hover:text-blue-400 transition-colors">
            {t('publicfooter.about', 'About')}
          </Link>
          <Link to="/contact" className="hover:text-blue-400 transition-colors">
            {t('publicfooter.contact', 'Contact')}
          </Link>
          <Link to="/privacy" className="hover:text-blue-400 transition-colors">
            {t('publicfooter.privacy', 'Privacy')}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
