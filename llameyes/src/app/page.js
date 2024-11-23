'use client'
// File: app/page.jsx
import Link from 'next/link';
import { Eye } from 'lucide-react';
import FrostedGlassCard from './components/FrostedGlassCard';

const FilmGrain = () => (
  <div
    className="fixed inset-0 pointer-events-none opacity-[0.15]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
);

const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-300 to-pink-200 opacity-70" />

      {/* Floating gradient orbs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-30" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 opacity-30" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 opacity-30" />

      {/* Film grain overlay */}
      <FilmGrain />

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <header className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <FrostedGlassCard
              className="p-4 rounded-full shadow-xl border border-white/20 hover:border-white/30 transition-colors duration-200"
            >
              <Eye className="h-16 w-16 text-white" />
            </FrostedGlassCard>
          </div>
          <h1 className="font-serif text-7xl mb-6 text-white drop-shadow-lg">
            Deyealogue
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto font-medium drop-shadow">
            Communicate effortlessly through the power of eye tracking. Type and
            express yourself just by looking at the screen.
          </p>
          <Link
            href="/setup"
            className="inline-block bg-white/10 backdrop-blur-md text-white font-semibold px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 border border-white/20 hover:border-white/30 hover:bg-white/20"
          >
            Get Started
          </Link>
        </header>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: 'Intuitive Design',
              description:
                'Natural and comfortable typing experience using eye movements',
              icon: '🎯',
            },
            {
              title: 'Easy Setup',
              description:
                'Quick calibration process to get you started in minutes',
              icon: '⚡',
            },
            {
              title: 'Accessible',
              description: 'Designed for users with various mobility needs',
              icon: '♿',
            },
          ].map((feature, i) => (
            <FrostedGlassCard
              key={i}
              className="rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 group border border-white/20 hover:border-white/30"
            >
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-200">
                {feature.icon}
              </div>
              <h3 className="font-serif text-xl mb-2 text-white">
                {feature.title}
              </h3>
              <p className="text-white/80">{feature.description}</p>
            </FrostedGlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
