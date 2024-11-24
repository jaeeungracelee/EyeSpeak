import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FilmGrain } from '../components/FilmGrain';
import { useEffect, useState } from 'react';

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
          <h1 className="font-serif text-7xl mb-6 text-white drop-shadow-lg">
            Deyealog
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto font-medium drop-shadow">
            Communicate effortlessly through the power of eye tracking. Type and express yourself just by looking at the screen.
          </p>
          <Link 
        to={setupComplete ? "/text" : "/setup"}
        className="inline-block bg-white/10 backdrop-blur-md text-white font-semibold px-8 py-4 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 border border-white/20 hover:border-white/30 hover:bg-white/20"
      >
        {setupComplete ? "Continue to Text Input" : "Get Started"}
      </Link>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
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
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 group border border-white/20 hover:border-white/30 hover:bg-white/20">
              <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-200">{feature.icon}</div>
              <h3 className="font-serif text-xl mb-2 text-white">{feature.title}</h3>
              <p className="text-white/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
