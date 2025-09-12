import { useTranslation } from "react-i18next";
import HeroNav from "../components/HomePage/publicnav";
import Footer from "../components/HomePage/publicfooter";

function Privacy() {
  const { t, i18n } = useTranslation();
  const langAttr = i18n.language === 'hi' ? 'hi' : i18n.language === 'pa' ? 'pa' : 'en';
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900" lang={langAttr}>
      {/* Animated glassy gradient background, like Login/Register */}
      <div className="pointer-events-none select-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120vw] h-96 bg-gradient-to-r from-blue-300/30 via-purple-300/20 to-pink-300/30 blur-3xl animate-gradient-wave rounded-full"></div>
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-40 animate-pulse"
            style={{
              width: `${12 + Math.random() * 16}px`,
              height: `${12 + Math.random() * 16}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle at 50% 50%, #fff7, #fff0 70%)`,
              filter: 'blur(1.5px)',
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      {/* Navbar */}
      <div className="absolute top-0 left-0 w-full z-50">
        <HeroNav />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <img
            src="/logo.png"
            alt="Smart Transit Logo"
            className="mx-auto mb-6 h-16 w-auto drop-shadow-lg"
          />

          <h1 className="text-5xl md:text-6xl font-extrabold text-blue-700 mb-4 drop-shadow-lg">
            {t("privacy_title", "Privacy Policy")}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed">
            {t("privacy_intro", { app: "YatraOne" })}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-24 flex justify-center">
        <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-10 border border-gray-100 space-y-8">
          {/* Introduction */}
          <div>
            <h2 className="text-2xl font-bold text-blue-700 mb-3">
              {t("privacy_intro_title", "Introduction")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("privacy_intro_content")}
            </p>
          </div>

          {/* Data Collection */}
          <div>
            <h2 className="text-2xl font-bold text-blue-700 mb-3">
              {t("privacy_what_we_collect_title", "What We Collect")}
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <span className="font-semibold text-blue-700">
                  {t("privacy_location", "Location Data")}
                </span>{" "}
                {t("privacy_location_desc")}
              </li>
              <li>
                <span className="font-semibold text-blue-700">
                  {t("privacy_personal_info", "Personal Information")}
                </span>{" "}
                {t("privacy_personal_info_desc")}
              </li>
              <li>
                <span className="font-semibold text-blue-700">
                  {t("privacy_analytics", "Analytics Data")}
                </span>{" "}
                {t("privacy_analytics_desc")}
              </li>
              <li>
                <span className="font-semibold text-blue-700">
                  {t("privacy_device_info", "Device Information")}
                </span>{" "}
                {t("privacy_device_info_desc")}
              </li>
            </ul>
          </div>

          {/* Data Usage */}
          <div>
            <h2 className="text-2xl font-bold text-blue-700 mb-3">
              {t("privacy_how_we_use_title", "How We Use Data")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("privacy_how_we_use_intro")}
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>{t("privacy_use_tracking")}</li>
              <li>{t("privacy_use_sos")}</li>
              <li>{t("privacy_use_personalize")}</li>
              <li>{t("privacy_use_improve")}</li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h2 className="text-2xl font-bold text-blue-700 mb-3">
              {t("privacy_security_title", "Security")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("privacy_security_content")}
            </p>
          </div>

          {/* User Rights */}
          <div>
            <h2 className="text-2xl font-bold text-blue-700 mb-3">
              {t("privacy_rights_title", "Your Rights")}
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>{t("privacy_rights_access")}</li>
              <li>{t("privacy_rights_correction")}</li>
              <li>{t("privacy_rights_deletion")}</li>
              <li>{t("privacy_rights_optout")}</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-2xl font-bold text-blue-700 mb-3">
              {t("contact_title", "Contact Us")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("privacy_contact", { email: "privacy@yatraone.com" })}
            </p>
          </div>
        </div>
      </section>

      {/* Back Button */}
      <div className="flex justify-center mb-16">
        <button
          onClick={() => window.history.back()}
          className="bg-white/90 border border-gray-200 rounded-full px-10 py-4 shadow hover:bg-blue-50 text-blue-700 font-extrabold text-xl flex items-center gap-3"
        >
          <span className="text-2xl">←</span> {t('Back', 'Back')}
        </button>
      </div>
      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default Privacy;
