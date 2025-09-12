import HeroNav from "../components/HomePage/publicnav";
import Footer from "../components/HomePage/publicfooter";
import { useTranslation } from "react-i18next";

const FAQS = [
  {
    q: "faq_q1",
    a: "faq_a1"
  },
  {
    q: "faq_q2",
    a: "faq_a2"
  },
  {
    q: "faq_q3",
    a: "faq_a3"
  },
  {
    q: "faq_q4",
    a: "faq_a4"
  },
  {
    q: "faq_q5",
    a: "faq_a5"
  }
];

function FAQ() {
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
      <section className="relative pt-32 pb-10 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <img
            src="/logo.png"
            alt="Smart Transit Logo"
            className="mx-auto mb-6 h-16 w-auto drop-shadow-lg"
          />
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent drop-shadow-lg mb-6">
            {t("faq_title", "Frequently Asked Questions")}
          </h1>
          <p className="text-lg md:text-xl text-gray-700 font-medium leading-relaxed">
            {t("faq_intro", "Find answers to common questions about YatraOne, our features, and how to get the most out of your smart transit experience.")}
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
          <div className="space-y-8">
            {FAQS.map((faq, i) => (
              <div key={i} className="">
                <h2 className="text-xl md:text-2xl font-bold text-blue-700 mb-2 flex items-center gap-2">
                  <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-base font-semibold mr-2">Q{i+1}</span>
                  {t(faq.q)}
                </h2>
                <p className="text-gray-700 text-base md:text-lg leading-relaxed pl-10">
                  {t(faq.a)}
                </p>
              </div>
            ))}
          </div>
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
      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

export default FAQ;
