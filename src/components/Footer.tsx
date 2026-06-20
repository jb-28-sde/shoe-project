import React from 'react';
import { Github, Twitter, Instagram, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto px-4 sm:px-6 lg:px-8 py-8 w-full border-t border-white/10 text-[10px] text-slate-500 font-sans tracking-widest">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="font-mono">© {new Date().getFullYear()} JUTE LE LO GLOBAL</div>
        <div className="flex gap-6 uppercase font-bold">
          <span className="hover:text-slate-300 transition-colors cursor-pointer">TERMS OF SERVICE</span>
          <span className="hover:text-slate-300 transition-colors cursor-pointer">PRIVACY POLICY</span>
          <span className="text-slate-300 hover:text-white transition-colors cursor-pointer">TRACK MY ORDER</span>
        </div>
      </div>
    </footer>
  );
}
