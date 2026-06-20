import React from 'react';
import { ShoppingCart, Menu, Search, X, Heart, Shield } from 'lucide-react';
import { ViewState } from '../types';

interface HeaderProps {
  cartItemCount: number;
  setViewState: (view: ViewState) => void;
  currentView: ViewState;
}

export function Header({ cartItemCount, setViewState, currentView }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-4 z-50 mx-4 sm:mx-6 lg:mx-8 mb-4">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex-shrink-0 flex items-center gap-3 cursor-pointer"
            onClick={() => setViewState({ name: 'home' })}
          >
            <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center font-black text-white text-xl">J</div>
            <span className="font-display font-black text-2xl tracking-tighter uppercase italic text-white">
              Jute Le Lo
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => setViewState({ name: 'home' })}
              className={`text-sm font-semibold uppercase tracking-widest transition-colors ${currentView.name === 'home' && (!('category' in currentView) || !currentView.category) ? 'text-orange-400 border-b-2 border-orange-400 pb-1' : 'text-slate-300 hover:text-orange-400'}`}
            >
              Shop
            </button>
            <button 
              onClick={() => setViewState({ name: 'home', category: 'Men' })}
              className={`text-sm font-semibold uppercase tracking-widest transition-colors ${currentView.name === 'home' && 'category' in currentView && currentView.category === 'Men' ? 'text-orange-400 border-b-2 border-orange-400 pb-1' : 'text-slate-300 hover:text-orange-400'}`}
            >
              Men
            </button>
            <button 
              onClick={() => setViewState({ name: 'home', category: 'Women' })}
              className={`text-sm font-semibold uppercase tracking-widest transition-colors ${currentView.name === 'home' && 'category' in currentView && currentView.category === 'Women' ? 'text-orange-400 border-b-2 border-orange-400 pb-1' : 'text-slate-300 hover:text-orange-400'}`}
            >
              Women
            </button>
            <button 
              onClick={() => setViewState({ name: 'home', category: 'Exclusive' })}
              className={`text-sm font-semibold uppercase tracking-widest transition-colors ${currentView.name === 'home' && 'category' in currentView && currentView.category === 'Exclusive' ? 'text-orange-400 border-b-2 border-orange-400 pb-1' : 'text-slate-300 hover:text-orange-400'}`}
            >
              Exclusive
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-5">
            <div className="hidden lg:flex bg-white/10 px-4 py-2 rounded-full border border-white/10 items-center gap-2 mr-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs uppercase font-bold tracking-tighter text-white">Live Drops</span>
            </div>
            <button className="text-white hover:text-brand transition-colors p-2 hidden sm:block">
              <Search className="w-5 h-5" />
            </button>
            <button 
              className={`transition-colors p-2 ${currentView.name === 'wishlist' ? 'text-orange-400' : 'text-white hover:text-brand'}`}
              onClick={() => setViewState({ name: 'wishlist' })}
            >
              <Heart className="w-5 h-5" />
            </button>
            <button 
              className={`transition-colors p-2 ${currentView.name === 'admin' ? 'text-orange-400' : 'text-white hover:text-brand'}`}
              onClick={() => setViewState({ name: 'admin' })}
            >
              <Shield className="w-5 h-5" />
            </button>
            <button 
              className={`transition-colors p-2 relative group ${currentView.name === 'cart' ? 'text-orange-400' : 'text-white hover:text-brand'}`}
              onClick={() => setViewState({ name: 'cart' })}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-brand rounded-full transform scale-100 group-hover:scale-110 transition-transform">
                  {cartItemCount}
                </span>
              )}
            </button>
            <button 
              className="md:hidden text-white hover:text-brand p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-panel mx-4 mt-2 px-4 pt-2 pb-4 space-y-1 rounded-2xl">
          <button 
            onClick={() => { setViewState({ name: 'home' }); setIsMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-3 text-sm tracking-widest uppercase font-bold text-white hover:bg-white/10 rounded-md"
          >
            Shop
          </button>
          <button 
            onClick={() => { setViewState({ name: 'home', category: 'Men' }); setIsMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-3 text-sm tracking-widest uppercase font-bold text-slate-300 hover:bg-white/10 hover:text-white rounded-md"
          >
            Men
          </button>
          <button 
            onClick={() => { setViewState({ name: 'home', category: 'Women' }); setIsMobileMenuOpen(false); }}
             className="block w-full text-left px-3 py-3 text-sm tracking-widest uppercase font-bold text-slate-300 hover:bg-white/10 hover:text-white rounded-md"
          >
            Women
          </button>
          <button 
            onClick={() => { setViewState({ name: 'home', category: 'Exclusive' }); setIsMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-3 text-sm tracking-widest uppercase font-bold text-slate-300 hover:bg-white/10 hover:text-white rounded-md"
          >
            Exclusive
          </button>
        </div>
      )}
    </header>
  );
}
