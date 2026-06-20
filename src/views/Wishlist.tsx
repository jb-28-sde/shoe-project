import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { ViewState } from '../types';
import { products } from '../data';
import { ProductCard } from '../components/ProductCard';

interface WishlistProps {
  key?: string | number;
  wishlist: string[];
  setViewState: (view: ViewState) => void;
  toggleWishlist: (productId: string) => void;
}

export function Wishlist({ wishlist, setViewState, toggleWishlist }: WishlistProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32"
    >
      <div className="flex items-center space-x-4 mb-12">
        <button 
          onClick={() => setViewState({ name: 'home' })}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl sm:text-4xl font-display font-black uppercase italic text-white tracking-tight">
          My Wishlist
        </h1>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-sm">
          <ShoppingBag className="w-16 h-16 text-slate-500 mb-6" />
          <h2 className="text-2xl font-black uppercase italic text-white tracking-widest mb-2">Your wishlist is empty</h2>
          <p className="text-slate-400 mb-8 text-center max-w-md">Looks like you haven't saved any favorites yet. Start exploring our collection!</p>
          <button 
            onClick={() => setViewState({ name: 'home' })}
            className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-orange-900/20"
          >
            Explore Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 gap-y-12">
          {wishlistedProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              setViewState={setViewState} 
              isWishlisted={true}
              toggleWishlist={toggleWishlist}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
