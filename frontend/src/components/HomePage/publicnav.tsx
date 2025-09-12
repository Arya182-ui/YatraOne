import { Link } from 'react-router-dom';

import Logo from '/logo.png';
import LanguageSelector from '../Layout/LanguageSelector';
import { useTranslation } from 'react-i18next';

function HeroNav() {
    const { t } = useTranslation();
    return (
        <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-lg rounded-b-2xl mb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
                <div className="flex justify-between items-center h-20">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img src={Logo} alt="YatraOne Logo" className="h-14 w-auto mb-2 inline-block drop-shadow-xl rounded-xl" />
                    </Link>
                    {/* Hide LanguageSelector on mobile */}
                    <div className="hidden md:block">
                        <LanguageSelector />
                    </div>
                    {/* Responsive button layout */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link
                            to="/register"
                            className="px-4 py-2 sm:px-5 sm:py-2 rounded-xl text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 transition-all shadow-sm border border-blue-100 text-sm sm:text-base"
                        >
                            {t('publicnav.signup', 'Sign up')}
                        </Link>
                        <Link
                            to="/login"
                            className="px-4 py-2 sm:px-5 sm:py-2 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg hover:from-blue-700 hover:to-emerald-700 transition-all border-0 text-sm sm:text-base"
                        >
                            {t('publicnav.get_started', 'Get Started')}
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
export default HeroNav;