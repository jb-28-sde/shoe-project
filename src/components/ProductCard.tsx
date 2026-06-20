import React from 'react';
import { motion } from 'motion/react';
import { Product, ViewState } from '../types';
import { Star, ArrowRight, Heart } from 'lucide-react';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  setViewState: (view: ViewState) => void;
  isWishlisted?: boolean;
  toggleWishlist?: (productId: string) => void;
}

export function ProductCard({ product, setViewState, isWishlisted, toggleWishlist }: ProductCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-panel rounded-2xl p-4 flex flex-col group cursor-pointer hover:bg-white/10 transition-all border border-white/10 hover:border-white/20"
      onClick={() => setViewState({ name: 'product', productId: product.id })}
    >
      <div className="relative aspect-[4/3] bg-slate-800/50 rounded-xl mb-4 overflow-hidden flex items-center justify-center p-4">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <span className="bg-white/10 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-sm uppercase border border-white/10">
            {product.category}
          </span>
          {toggleWishlist && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className="p-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-orange-500 text-orange-500' : 'text-white'}`} />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <span className="font-mono font-bold text-sm text-orange-400 ml-2">
            ₹{product.price}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mb-4 line-clamp-1">
          {product.category}
        </p>
        
        <div className="mt-auto">
          <button className="w-full py-2.5 bg-white/10 hover:bg-white text-[10px] sm:text-xs font-bold uppercase rounded-lg group-hover:text-black transition-all text-white border border-white/5 group-hover:border-white">
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}
