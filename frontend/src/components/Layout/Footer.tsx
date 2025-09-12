
import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.png" alt="YatraOne Logo" className="h-10 mb-1" />
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              {t('Revolutionizing public transportation with smart technology, real-time tracking, and user-centric features for a better commuting experience.')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('Quick Links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/tracking" className="text-gray-300 hover:text-white transition-colors">
                  {t('Bus Tracking')}
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-gray-300 hover:text-white transition-colors">
                  {t('Feedback')}
                </Link>
              </li>
              <li>
                <Link to="/lost-found" className="text-gray-300 hover:text-white transition-colors">
                  {t('Lost & Found')}
                </Link>
              </li>
              <li>
                <Link to="/rewards" className="text-gray-300 hover:text-white transition-colors">
                  {t('Rewards')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  {t('Contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('Contact Us')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">arya119000@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Invertis University , Bareilly</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 {t('Smart Bus Platform')}. {t('All rights reserved.')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
              {t('Privacy Policy')}
            </Link>
            <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
              {t('About Us')}
            </Link>
            <Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
              {t('FAQ')}
            </Link>
            <Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
              {t('Contact Us')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;