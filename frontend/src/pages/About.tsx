
import HeroNav from "../components/HomePage/publicnav";
import Footer from "../components/HomePage/publicfooter";
import { useTranslation } from "react-i18next";

function About() {
  const { t, i18n } = useTranslation();
  // Example: locale date formatting
  const today = new Date();
  const formattedDate = today.toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' });

  // Feature list with translation keys
  const features = [
    {
      icon: "🚌",
      title: t("about_features_liveTracking_title", "Live Tracking"),
      desc: t("about_features_liveTracking_desc", "Track buses in real-time and get accurate ETAs for every stop."),
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: "🛡️",
      title: t("about_features_sos_title", "SOS & Safety"),
      desc: t("about_features_sos_desc", "Emergency SOS system with instant location sharing and support."),
      color: "from-red-500 to-amber-500",
    },
    {
      icon: "📊",
      title: t("about_features_analytics_title", "Smart Analytics"),
      desc: t("about_features_analytics_desc", "Personalized trip insights, crowd prediction, and carbon footprint tracking."),
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: "🏆",
      title: t("about_features_rewards_title", "Rewards"),
      desc: t("about_features_rewards_desc", "Earn points and badges for sustainable travel choices."),
      color: "from-purple-500 to-pink-500",
    },
  ];

  // Set lang attribute for Unicode font support
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

          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent drop-shadow-lg mb-6">
            {t("about_title", "About YatraOne")}
          </h1>
          <p className="text-lg md:text-xl text-gray-700 font-medium leading-relaxed">
            <span className="font-semibold text-blue-700">YatraOne</span> {t("about_hero_desc1", "is a next-generation public transportation platform designed for")}
            <span className="text-emerald-700 font-semibold">{t("about_hero_safety", "safety")}</span>,
            <span className="text-purple-700 font-semibold">{t("about_hero_efficiency", "efficiency")}</span>,
            {t("about_hero_and", "and")}
            <span className="text-blue-700 font-semibold">{t("about_hero_sustainability", "sustainability")}</span>.
            <br />
            {t("about_hero_desc2", "With smart technology, we aim to transform everyday commutes into smoother, safer, and more rewarding journeys.")}
          </p>
          <div className="mt-4 text-sm text-gray-500">{t("about_today", "Today is")}: {formattedDate}</div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold text-blue-700 mb-4">
              {t("about_vision_title", "Our Vision")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("about_vision_desc", "To redefine public transport by making it accessible, safe, and eco-friendly for millions of daily travelers. We envision a future where smart transit solutions contribute to greener cities and happier communities.")}
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-emerald-700 mb-4">
              {t("about_mission_title", "Our Mission")}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t("about_mission_desc", "To empower commuters with real-time tracking, reliable safety systems, and personalized rewards. Every feature we build is focused on making your journey not just efficient4but rewarding.")}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-12">
            {t("about_features_title", "What We Offer")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div
                  className={`w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r ${f.color} text-white text-3xl shadow-md mb-4 group-hover:scale-110 transition-transform`}
                >
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-blue-700 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-blue-700 mb-6">
              {t("about_why_title", "Why Choose YatraOne?")}
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              {t("about_why_desc", "Unlike traditional transport apps, YatraOne combines safety, rewards, and analytics to create a truly holistic travel experience. From your first ride of the day to the last, our platform ensures peace of mind and a sense of contribution4towards both your personal journey and the planet.")}
            </p>
        </div>
      </section>

      {/* Back Button */}
      <div className="flex justify-center mb-16">
        <button
          onClick={() => window.history.back()}
          className="bg-white/90 border border-gray-200 rounded-full px-10 py-4 shadow hover:bg-blue-50 text-blue-700 font-extrabold text-xl flex items-center gap-3"
        >
          <span className="text-2xl">←</span> {t("Back", "Back")}
        </button>
      </div>
    </div>
  );
}

export default About;
