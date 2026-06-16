import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-4xl mx-auto text-center relative z-10 animate-fadeIn">
      
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[10px] uppercase tracking-widest shadow-inner mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        v1.0.0 Architecture Active
      </div>

      <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
        Privacy-First <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-500 bg-clip-text text-transparent">Business Intelligence</span> On the Edge.
      </h1>

      <p className="text-zinc-400 max-w-2xl mx-auto text-base md:text-lg mb-10 leading-relaxed font-sans">
        Extract predictive analytical metrics, compute system churn velocity, and interface with your dataset using standard English. Absolute zero-trust compilation—your raw database credentials never leave your infrastructure footprint.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
        <button 
          onClick={() => navigate('/onboarding')}
          className="w-full sm:w-auto bg-zinc-100 hover:bg-white text-zinc-950 px-8 py-4 rounded-xl text-sm font-bold tracking-tight shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
        >
          Deploy Local Node Instance
          <span className="transform group-hover:translate-x-1 transition-transform font-mono font-bold">→</span>
        </button>
        <button 
          onClick={() => alert("Loading technical whitepaper documentation protocol...")}
          className="w-full sm:w-auto border border-zinc-800 hover:bg-zinc-900/50 hover:text-zinc-200 text-zinc-400 px-8 py-4 rounded-xl text-sm font-medium tracking-tight font-sans transition-all duration-300 cursor-pointer"
        >
          Read Core Architecture Blueprint
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-t border-zinc-900 pt-12">
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">// SECURE ISOLATION</span>
          <h4 className="text-sm font-bold text-white tracking-tight">On-Premise Handshake</h4>
          <p className="text-xs text-zinc-500 font-sans leading-relaxed">
            Database strings are evaluated directly inside memory barriers. Raw schema metadata isolates automatically away from global log targets.
          </p>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 font-bold block">// EDGE PREDICTIONS</span>
          <h4 className="text-sm font-bold text-white tracking-tight">Local ML Processing</h4>
          <p className="text-xs text-zinc-500 font-sans leading-relaxed">
            Ecosystem decay analysis and monthly trajectory forecasts are written via an in-house algorithmic vector right inside your local machine layer.
          </p>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">// CHAT CHANNELS</span>
          <h4 className="text-sm font-bold text-white tracking-tight">Natural Text-To-SQL</h4>
          <p className="text-xs text-zinc-500 font-sans leading-relaxed">
            Query your production environment securely using structured conversational English without transferring user payloads to third-party providers.
          </p>
        </div>
      </div>

    </div>
  );
}