import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FilmGrain } from '../components/FilmGrain';
import { useEffect, useState } from 'react';
import { H1, H2, H3, P } from '../components/Typography'; // Importing ShadCN Typography components

export const LandingPage = () => {
  const [setupComplete, setSetupComplete] = useState(false);

  useEffect(() => {
    const isSetupComplete = localStorage.getItem('setupComplete') === 'true';
    setSetupComplete(isSetupComplete);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-purple-300 to-pink-200 opacity-70" />

      {/* Floating gradient orbs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-30" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000 opacity-30" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 opacity-30" />

      <FilmGrain />

      <div className="relative max-w-6xl mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-full shadow-xl border border-white/20 hover:border-white/30 transition-colors duration-200">
              <Eye className="h-16 w-16 text-white" />
            </div>
          </div>
          <H1 className="mb-8 drop-shadow-lg text-white">
            Deyealog
          </H1>
          <P className="text-2xl text-white mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Communicate effortlessly through the power of eye tracking. Type and express yourself just by looking at the screen.
          </P>
          <Link 
            to={setupComplete ? "/text" : "/setup"}
            className="inline-block bg-white/10 backdrop-blur-md text-white font-bold px-10 py-5 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 border border-white/20 hover:border-white/30 hover:bg-white/20"
          >
            {setupComplete ? "Continue to Text Input" : "Get Started"}
          </Link>
        </header>

        <div className="grid md:grid-cols-3 gap-12 mb-16">
          {[
            {
              title: "Intuitive Design",
              description: "Natural and comfortable typing experience using eye movements",
              icon: "🎯"
            },
            {
              title: "Easy Setup",
              description: "Quick calibration process to get you started in minutes",
              icon: "⚡"
            },
            {
              title: "Accessible",
              description: "Designed for users with various mobility needs",
              icon: "♿"
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-200 group border border-white/20 hover:border-white/30 hover:bg-white/20">
              <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-200">{feature.icon}</div>
              <H3 className="text-white mb-4">{feature.title}</H3>
              <P className="text-white/80">{feature.description}</P>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
