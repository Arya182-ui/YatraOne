import { useEffect } from "react";
import type { TFunction } from "i18next";
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import { MapPin, Shield, Clock, Award } from "lucide-react";
import { FittedBus } from "../3D/AnimatedBus";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { timetableAPI } from '../../lib/api';
import HeroNav from "./publicnav"

// Dummy images for slider
const sliderImages = [
  "/bus1.jpg",
  "/bus2.jpg",
  "/bus3.jpg",
  "/bus4.jpg",
];

interface ExperienceJourneySliderProps {
  t: TFunction;
  sliderImages: string[];
}
function ExperienceJourneySlider({ t, sliderImages }: ExperienceJourneySliderProps) {
  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sliderImages.length]);
  return (
    <section className="w-full max-w-5xl mx-auto px-4 mt-16 mb-8">
      <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-4 animate-fade-in">
        {t('hero.experience_journey_title', 'Experience the Journey')}
      </h2>
      <p className="text-center text-lg text-gray-700 mb-6 animate-fade-in delay-100">
        {t('hero.experience_journey_desc', 'See how YatraOne transforms your daily commute with real visuals from our platform.')}
      </p>
      <div className="relative w-full h-64 sm:h-80 rounded-3xl overflow-hidden shadow-2xl group">
        {/* Carousel with overlay captions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 pointer-events-none rounded-3xl" />
        <div className="w-full h-full flex transition-transform duration-700" style={{ transform: `translateX(-${activeTab * 100}%)` }}>
          {sliderImages.map((img, idx) => (
            <div
              key={idx}
              className="w-full h-full flex-shrink-0 relative"
              style={{ minWidth: '100%' }}
            >
              <img
                src={img}
                alt={t('hero.experience_journey_slide_alt', 'Transit showcase') + ` ${idx + 1}`}
                className="w-full h-full object-cover object-center rounded-3xl"
                draggable={false}
              />
              {/* Optional overlay caption */}
              <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-gray-900/80 rounded-xl px-4 py-2 shadow text-gray-800 dark:text-gray-100 text-base font-semibold max-w-xs animate-fade-in-up">
                {t(`hero.experience_journey_slide_${idx + 1}`, `Real-time bus tracking, safety, and comfort for all commuters.`)}
              </div>
            </div>
          ))}
        </div>
        {/* Carousel Controls */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {sliderImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`w-3 h-3 rounded-full border-2 ${activeTab === idx ? 'bg-blue-600 border-blue-600' : 'bg-white/70 border-gray-300'} transition-all`}
              aria-label={t('hero.experience_journey_slide', 'Go to slide') + ` ${idx + 1}`}
            />
          ))}
        </div>
        {/* Manual arrows */}
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-blue-200 text-blue-700 rounded-full p-2 shadow z-20"
          onClick={() => setActiveTab((activeTab - 1 + sliderImages.length) % sliderImages.length)}
          aria-label="Previous slide"
        >
          &#8592;
        </button>
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-blue-200 text-blue-700 rounded-full p-2 shadow z-20"
          onClick={() => setActiveTab((activeTab + 1) % sliderImages.length)}
          aria-label="Next slide"
        >
          &#8594;
        </button>
      </div>
    </section>
  );
}

// PDF Timetable Section as a reusable component
interface TimetableSectionProps {
  t: TFunction;
  timetablePdfUrl: string;
}
function TimetableSection({ t, timetablePdfUrl }: TimetableSectionProps) {
  return (
    <section className="w-full max-w-5xl mx-auto px-4 mt-20 mb-12">
      <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-white/30 dark:border-gray-800/40 animate-fade-in-up">
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent mb-3">
          {t('hero.timetable_title', 'Bus Timetable')}
        </h2>
        <p className="text-center text-lg text-gray-700 mb-6">
          {t('hero.timetable_desc', 'Download or preview the latest bus schedule for your route. Stay on time, every time!')}
        </p>
        <div className="w-full flex flex-col sm:flex-row items-center gap-6">
          {/* PDF Preview (thumbnail or icon) */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="w-32 h-40 bg-gradient-to-br from-blue-100 via-cyan-100 to-emerald-100 rounded-xl flex items-center justify-center shadow-inner border border-blue-200 mb-2">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs text-gray-500">PDF</span>
          </div>
          {/* Download/View Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <a
              href={timetablePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-semibold shadow hover:from-blue-700 hover:to-cyan-500 transition-colors text-center"
              download
            >
              {t('hero.download_timetable', 'Download Timetable')}
            </a>
            <a
              href={timetablePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-400 text-white font-semibold shadow hover:from-emerald-600 hover:to-cyan-500 transition-colors text-center"
            >
              {t('hero.view_timetable', 'View Timetable')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Hero() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [modalOpen, setModalOpen] = useState<number | null>(null);
  // const sliderRef = useRef<HTMLDivElement>(null); // unused
  // Use backend endpoint for timetable PDF
  const timetablePdfUrl = timetableAPI.getTimetableUrl();

  const features = [
    {
      icon: MapPin,
      title: t('hero.feature_live_tracking', 'Live Bus Tracking'),
      description: t('hero.feature_live_tracking_desc', 'Track buses in real-time, view routes, and get accurate ETAs. Built on top of smart transit APIs.'),
      color: "from-blue-600 to-cyan-400",
      modal: {
        heading: t('hero.feature_live_tracking_modal_title', 'Live Bus Tracking'),
        content: t('hero.feature_live_tracking_modal_content', 'See your bus move in real-time on the map, get accurate ETAs, and never miss your ride. Our system uses live GPS and smart algorithms to keep you updated every second.'),
      },
    },
    {
      icon: Shield,
      title: t('hero.feature_sos', 'SOS & Safety'),
      description: t('hero.feature_sos_desc', 'Emergency alerts, live sharing with authorities, and in-app support for passenger security.'),
      color: "from-red-500 to-amber-400",
      modal: {
        heading: t('hero.feature_sos_modal_title', 'SOS & Safety'),
        content: t('hero.feature_sos_modal_content', 'Instantly alert authorities and share your live location in emergencies. Our safety features are built for peace of mind, with 24/7 support and rapid response.'),
      },
    },
    {
      icon: Clock,
      title: t('hero.feature_eta', 'ETA & Timetable'),
      description: t('hero.feature_eta_desc', 'Get precise Estimated Time of Arrival, live timetable updates, and plan your journey with confidence.'),
      color: "from-emerald-500 to-teal-400",
      modal: {
        heading: t('hero.feature_eta_modal_title', 'ETA & Timetable'),
        content: t('hero.feature_eta_modal_content', 'Our AI-powered ETA engine predicts arrival times based on live traffic, bus speed, and route analytics. Access PDF timetables and real-time updates anytime.'),
      },
    },
    {
      icon: Award,
      title: t('hero.feature_rewards', 'Rewards & Community'),
      description: t('hero.feature_rewards_desc', 'Earn points for eco-friendly travel, redeem benefits, and join a safe commuter community.'),
      color: "from-purple-600 to-pink-400",
      modal: {
        heading: t('hero.feature_rewards_modal_title', 'Rewards & Community'),
        content: t('hero.feature_rewards_modal_content', 'Collect points for every ride, unlock exclusive rewards, and connect with fellow commuters. Our community is built on trust, safety, and shared journeys.'),
      },
    },
  ];
  {/* Features Section */ }
  <section className="w-full max-w-5xl mx-auto mt-20 mb-12 px-2">
    <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent mb-4 animate-fade-in">
      {t('hero.features_title', 'Features')}
    </h2>
    <p className="text-center text-lg text-gray-700 mb-8 animate-fade-in delay-100">
      {t('hero.features_desc', 'Discover what makes YatraOne the smartest way to travel.')}
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {features.map((feature, idx) => (
        <div
          key={idx}
          className={`relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 flex flex-col items-center text-center border border-white/30 dark:border-gray-800/40 hover:scale-105 transition-transform duration-300 animate-fade-in-up`}
        >
          <span className={`mb-3 p-3 rounded-full bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
            <feature.icon size={32} />
          </span>
          <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-blue-700 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
            {feature.title}
          </h3>
          <p className="text-gray-700 dark:text-gray-200 mb-4 text-sm">
            {feature.description}
          </p>
          <button
            className="mt-auto px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-semibold shadow hover:from-blue-700 hover:to-cyan-500 transition-colors"
            onClick={() => setModalOpen(idx)}
          >
            {t('hero.learn_more', 'Learn More')}
          </button>
        </div>
      ))}
    </div>

    {/* Feature Modals */}
    {features.map((feature, idx) => (
      <Dialog
        key={idx}
        open={modalOpen === idx}
        onClose={() => setModalOpen(null)}
        className="fixed z-50 inset-0 flex items-center justify-center"
      >
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => setModalOpen(null)} />
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-auto p-8 z-10 animate-fade-in-up">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-blue-600"
            onClick={() => setModalOpen(null)}
            aria-label={t('hero.close', 'Close')}
          >
            <X size={24} />
          </button>
          <h3 className="text-2xl font-extrabold mb-3 bg-gradient-to-r from-blue-700 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
            {feature.modal.heading}
          </h3>
          <p className="text-gray-700 dark:text-gray-200 text-base">
            {feature.modal.content}
          </p>
        </div>
      </Dialog>
    ))}
  </section>

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-purple-100 to-pink-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
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

      {/* Mobile Hero Section */}
      <div className="block lg:hidden min-h-screen flex flex-col justify-center items-center relative pt-20 pb-8 px-0">
        {/* Glassy overlay for extra pop */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/60 via-purple-100/40 to-emerald-100/40 dark:from-blue-900/40 dark:via-purple-900/30 dark:to-emerald-900/30" />
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-900/80" />
        </div>
        {/* Main Hero Card */}
        <div className="mx-3 mt-8 rounded-3xl shadow-2xl border border-white/40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-7 relative z-10 animate-fade-in-up flex flex-col items-center w-full max-w-lg">
          <h1 className="text-5xl font-extrabold leading-tight bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent drop-shadow-lg animate-fade-in">YatraOne</h1>
          <span className="text-xl font-bold text-blue-700 block animate-fade-in delay-100">Smart, Safe & Rewarding Bus Journeys</span>
          <p className="text-base text-gray-700 leading-relaxed max-w-md mx-auto animate-fade-in delay-200">
            Experience India’s next-gen transit platform:
            <span className="font-bold text-blue-700"> Live Tracking</span>,
            <span className="font-bold text-red-500"> SOS Safety</span>,
            <span className="font-bold text-emerald-600"> Smart Analytics</span>,
            and <span className="font-bold text-purple-600"> Rewards</span>.
          </p>
          <div className="flex flex-col gap-4 mt-8 w-full items-center">
            {user ? (
              <Link
                to={user.role === "admin" ? "/admin" : "/dashboard"}
                className="w-full max-w-xs mx-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-2xl shadow-xl hover:scale-105 transition-all text-center animate-fade-in delay-300 ring-2 ring-blue-200 dark:ring-blue-700 animate-bounce"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full max-w-xs mx-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-2xl shadow-xl hover:scale-105 transition-all text-center animate-fade-in delay-300 ring-2 ring-blue-200 dark:ring-blue-700 animate-bounce"
              >
                Get Started Free
              </Link>
            )}
          </div>
        </div>
        {/* Features - Stacked Vertically, more card-like and spaced */}
        <div className="mt-10 flex flex-col gap-6 w-full max-w-lg">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-blue-100 dark:border-blue-900 p-5 flex flex-col items-center text-center backdrop-blur-xl"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-2 shadow-lg`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <span className="font-semibold text-gray-800 dark:text-blue-100 mb-1 text-base">{feature.title}</span>
              <span className="text-xs text-gray-500 dark:text-gray-300">{feature.description}</span>
            </div>
          ))}
        </div>
        {/* Experience the Journey Section - Modern Carousel (auto + manual) */}
        <ExperienceJourneySlider t={t} sliderImages={sliderImages} />
        {/* PDF Timetable Section (after journey slider, visible everywhere) */}
        {/* Timetable for mobile only */}
        <div className="block lg:hidden">
          <TimetableSection t={t} timetablePdfUrl={timetablePdfUrl} />
        </div>

        <section className="hidden lg:block w-full max-w-3xl mx-auto mt-20 mb-12 px-2">
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-white/30 dark:border-gray-800/40 animate-fade-in-up">
            <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent mb-3">
              {t('timetable_title', 'Bus Timetable')}
            </h2>
            <p className="text-center text-lg text-gray-700 mb-6">
              {t('timetable_desc', 'Download or preview the latest bus schedule for your route. Stay on time, every time!')}
            </p>
            <div className="w-full flex flex-col sm:flex-row items-center gap-6">
              {/* PDF Preview (thumbnail or icon) */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-32 h-40 bg-gradient-to-br from-blue-100 via-cyan-100 to-emerald-100 rounded-xl flex items-center justify-center shadow-inner border border-blue-200 mb-2">
                  <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">PDF</span>
              </div>
              {/* Download/View Buttons */}
              <div className="flex flex-col gap-3 w-full">
                <a
                  href={timetablePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-semibold shadow hover:from-blue-700 hover:to-cyan-500 transition-colors text-center"
                  download
                >
                  {t('download_timetable', 'Download Timetable')}
                </a>
                <a
                  href={timetablePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-400 text-white font-semibold shadow hover:from-emerald-600 hover:to-cyan-500 transition-colors text-center"
                >
                  {t('view_timetable', 'View Timetable')}
                </a>
              </div>
            </div>
          </div>
        </section>



        {/* Floating CTA Button */}
        <div className="fixed bottom-6 left-0 w-full flex justify-center z-50 lg:hidden pointer-events-none">
          <div className="pointer-events-auto">
            <Link
              to={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login"}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold rounded-full shadow-2xl hover:scale-105 transition-all text-center text-lg"
            >
              {user ? "Go to Dashboard" : "Get Started Free"}
            </Link>
          </div>
        </div>
        {/* Custom Animations */}
        <style>{`
        .animate-fade-in { animation: fadeIn 0.8s both; }
        .animate-fade-in-up { animation: fadeInUp 0.8s both; }
        .animate-fade-in.delay-100 { animation-delay: 0.1s; }
        .animate-fade-in.delay-200 { animation-delay: 0.2s; }
        .animate-fade-in.delay-300 { animation-delay: 0.3s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: none; } }
      `}</style>
      </div>

      {/* Desktop Hero Section */}
      <div className="hidden lg:block relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="space-y-6 bg-white rounded-3xl shadow-2xl p-10 border border-gray-100"
            >
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                YatraOne
              </h1>
              <span className="text-2xl font-bold text-blue-700">
                Smart, Safe & Rewarding Bus Journeys
              </span>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Experience India’s next-gen transit platform:
                <span className="font-bold text-blue-700"> Live Tracking</span>,
                <span className="font-bold text-red-500"> SOS Safety</span>,
                <span className="font-bold text-emerald-600"> Smart Analytics</span>,
                and <span className="font-bold text-purple-600"> Rewards</span>.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 mt-8"
            >
              {user ? (
                <Link
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started Free
                </Link>
              )}
            </motion.div>
          </div>

          {/* Right 3D Bus */}
          <motion.div className="hidden sm:flex flex-1 w-full h-full items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="w-full h-[400px] flex items-center justify-center"
            >
              <Canvas camera={{ position: [28, 28, 28], fov: 75 }}>
                <Suspense fallback={null}>
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <FittedBus />
                  <Environment preset="city" />
                </Suspense>
              </Canvas>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
        >
          <div className="grid md:grid-cols-5">
            {/* Tabs List */}
            <div className="col-span-2 flex flex-col border-r border-gray-200">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`flex items-center gap-3 p-6 text-left transition-all ${activeTab === index
                    ? "bg-gradient-to-r from-blue-50 to-emerald-50 border-l-4 border-blue-600"
                    : "hover:bg-gray-50"
                    }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-semibold text-gray-800">
                    {feature.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="col-span-3 p-10">
              <h3 className="text-2xl font-bold text-blue-700 mb-4">
                {features[activeTab].title}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {features[activeTab].description}
              </p>
              <ul className="mt-6 list-disc list-inside space-y-2 text-gray-700">
                <li>Cloud-synced and real-time updates</li>
                <li>Seamless integration with smart city systems</li>
                <li>Scalable, secure, and commuter-friendly</li>
              </ul>
              <div className="mt-6">
                <Link
                  to="/about"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-semibold rounded-xl shadow hover:shadow-lg transition"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Desktop: Timetable and Image Slider stacked, no white bg or shadow */}
      <section className="hidden lg:flex w-full max-w-5xl mx-auto mt-20 mb-12 px-4 flex-col gap-10">
        {/* Timetable Section */}
        <div className="w-full">
          <TimetableSection t={t} timetablePdfUrl={timetablePdfUrl} />
        </div>
        {/* Image Slider */}
        <div className="w-full">
          <ExperienceJourneySlider t={t} sliderImages={sliderImages} />
        </div>
      </section>


      <footer className="w-full bg-gray-900 text-gray-300 pt-10 sm:pt-16 pb-6 sm:pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo + Brand Info */}
          <div className="flex flex-col items-start">
            <img src="/logo.png" alt="YatraOne Logo" className="h-10 mb-1" />
            <h3 className="text-xl font-bold text-white mb-2">YatraOne</h3>
            <p className="text-sm">
              Smart, safe & rewarding bus journeys for the future of public transit.
              We connect cities and communities efficiently.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-blue-400 transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-400 transition">Privacy Policy</Link></li>
              <li><Link to="/faq" className="hover:text-blue-400 transition">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Email: <a href="mailto:support@yatraone.com" className="hover:text-blue-400 transition">arya119000@gmail.com</a></li>
              <li>Phone: <a href="tel:+1234567890" className="hover:text-blue-400 transition">+91 9258728706</a></li>
              <li>Address: Invertis University , Bareilly</li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
                {/* Twitter Icon */}
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557a9.93 9.93 0 01-2.828.775 4.932 4.932 0 002.165-2.724c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.691 8.094 4.066 6.13 1.64 3.161c-.542.929-.855 2.01-.855 3.17 0 2.188 1.115 4.118 2.813 5.254a4.904 4.904 0 01-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 01-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 010 21.543a13.94 13.94 0 007.548 2.212c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.025 10.025 0 0024 4.557z" />
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                {/* Facebook Icon */}
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35C.595 0 0 .594 0 1.326v21.348C0 23.406.595 24 1.326 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.797.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.762v2.31h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.674V1.326C24 .594 23.406 0 22.675 0z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">
                {/* Instagram Icon */}
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.33 3.608 1.304.975.975 1.242 2.242 1.304 3.608.058 1.266.07 1.645.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.33 2.633-1.304 3.608-.975.975-2.242 1.242-3.608 1.304-1.266.058-1.645.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.33-3.608-1.304-.975-.975-1.242-2.242-1.304-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.33-2.633 1.304-3.608C4.512 2.495 5.779 2.228 7.145 2.166 8.411 2.108 8.791 2.096 12 2.096m0-2.163C8.736-.067 8.332-.075 7.052.008 5.778.092 4.678.387 3.708 1.357c-.97.97-1.265 2.07-1.35 3.344C2.075 5.668 2.067 6.072 2.067 9.336v5.328c0 3.264.008 3.668.291 4.952.085 1.274.38 2.374 1.35 3.344.97.97 2.07 1.265 3.344 1.35C8.332 23.075 8.736 23.083 12 23.083s3.668-.008 4.952-.291c1.274-.085 2.374-.38 3.344-1.35.97-.97 1.265-2.07 1.35-3.344.283-1.284.291-1.688.291-4.952V9.336c0-3.264-.008-3.668-.291-4.952-.085-1.274-.38-2.374-1.35-3.344-.97-.97-2.07-1.265-3.344-1.35C15.668-.075 15.264-.067 12 0z" />
                  <circle cx="12" cy="12" r="3.2" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="text-center text-xs text-gray-500 mt-8 sm:mt-12">
          © {new Date().getFullYear()} Smart Transit. All rights reserved.
        </div>
      </footer>

    </div>
  );
}

export default Hero;
