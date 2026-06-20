import React from 'react';
import { motion } from 'motion/react';
import { ViewState } from '../types';

interface HeroProps {
  setViewState: (view: ViewState) => void;
}

export function Hero({ setViewState }: HeroProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 group">
      {/* Background Graphic */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-indigo-600 opacity-80 z-0"></div>
      <div className="absolute right-[-20px] top-[-40px] w-96 h-96 bg-white/20 rounded-full blur-3xl z-0 pointer-events-none fade-in"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-20 lg:py-32 flex flex-col lg:flex-row items-center justify-between">
        
        <div className="w-full lg:w-1/2 flex flex-col items-start text-left z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/70 mb-2 block">New Arrival</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl lg:text-7xl font-display font-black tracking-tighter uppercase italic text-white mb-6 leading-tight"
          >
            Neon <br/>Rush 2.0
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-white/80 max-w-md mt-2 font-light mb-10"
          >
            Explosive energy return with our proprietary Jute-Cushion technology. Redefine your sprint. Discover the latest drops, exclusive collaborations, and everyday essentials.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <button 
              onClick={() => {
                window.scrollTo({ top: 800, behavior: 'smooth' });
              }}
              className="bg-white text-orange-600 px-8 py-3 rounded-xl font-bold text-sm uppercase self-start shadow-xl hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </button>
            <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold uppercase text-sm backdrop-blur-md transition-all border border-white/10">
              View Lookbook
            </button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
          className="w-full lg:w-1/2 mt-16 lg:mt-0 relative z-10 flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-lg aspect-square">
            {/* Using a transparent PNG sneaker for the hero if possible, standard unsplash otherwise */}
            <img 
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" 
              alt="Hero Sneaker" 
              className="w-full h-full object-cover rounded-3xl shadow-2xl rotate-[-5deg]"
            />
            {/* Decorative elements */}
            <div className="absolute top-10 -left-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
              <p className="text-lg font-bold font-mono text-orange-400">₹150</p>
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest text-center mt-1">Live</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
