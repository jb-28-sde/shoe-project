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
  const [priceSort, setPriceSort] = useState<'default' | 'low' | 'high'>('default');

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

  let filteredProducts = activeCategory === 'All' 
    ? allProducts 
    : allProducts.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  if (priceSort === 'low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (priceSort === 'high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

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
        <div className="mb-8 border-b border-white/10 pb-6">
          <h2 className="text-3xl md:text-4xl font-display font-black uppercase italic tracking-tight text-white mb-2">
            Trending Kicks
          </h2>
          <p className="text-slate-400 max-w-2xl text-sm font-medium">
            From retro classics to futuristic runners, find the perfect pair to complete your fit.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Categories
              </h3>
              <div className="flex flex-col space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`text-left px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
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

            {/* Sort & Filters */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Sort By
              </h3>
               <select 
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white text-xs uppercase tracking-widest outline-none focus:border-orange-500 font-mono"
              >
                 <option value="default">Featured</option>
                 <option value="low">Price: Low to High</option>
                 <option value="high">Price: High to Low</option>
              </select>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
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
              <div className="py-20 text-center glass-panel rounded-2xl w-full">
                <p className="text-slate-400 text-lg uppercase font-bold tracking-widest">No products found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </motion.div>
  );
}
