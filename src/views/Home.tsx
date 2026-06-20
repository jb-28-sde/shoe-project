import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { products as staticProducts, categories } from '../data';
import { ProductCard } from '../components/ProductCard';
import { Hero3D } from '../components/Hero3D';
import { ViewState, Product } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

// Added generic React types for key
interface HomeProps {
  key?: string | number;
  setViewState: (view: ViewState) => void;
  initialCategory?: string;
  wishlist?: string[];
  toggleWishlist?: (productId: string) => void;
}

export function Home({ setViewState, initialCategory, wishlist, toggleWishlist }: HomeProps) {
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'All');
  const [dbProducts, setDbProducts] = useState<Product[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        sizes: [7, 8, 9, 10, 11], // default sizes for custom products
        ...doc.data() 
      } as Product));
      setDbProducts(prods);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    });
    return unsubscribe;
  }, []);

  const allProducts = [...dbProducts, ...staticProducts];

  const filteredProducts = activeCategory === 'All' 
    ? allProducts 
    : allProducts.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen"
    >
      <Hero3D />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-white/10 pb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-black uppercase italic tracking-tight text-white mb-2">
              Trending Kicks
            </h2>
            <p className="text-slate-400 max-w-2xl text-sm font-medium">
              From retro classics to futuristic runners, find the perfect pair to complete your fit.
            </p>
          </div>

          {/* Categories */}
          <div className="flex overflow-x-auto pb-4 md:pb-0 mt-6 md:mt-0 hide-scrollbar space-x-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-none px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  activeCategory === category
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 border border-orange-400'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                setViewState={setViewState} 
                isWishlisted={wishlist?.includes(product.id)}
                toggleWishlist={toggleWishlist}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredProducts.length === 0 && (
          <div className="py-20 text-center glass-panel rounded-2xl">
            <p className="text-slate-400 text-lg uppercase font-bold tracking-widest">No products found.</p>
          </div>
        )}
      </main>
    </motion.div>
  );
}
