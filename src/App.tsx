/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './views/Home';
import { ProductDetail } from './views/ProductDetail';
import { Cart } from './views/Cart';
import { Checkout } from './views/Checkout';
import { Wishlist } from './views/Wishlist';
import { Admin } from './views/Admin';
import { Orders } from './views/Orders';
import { ChatBot } from './components/ChatBot';
import { ParticleBackground } from './components/ParticleBackground';
import { ViewState, CartItem, Product } from './types';

export default function App() {
  const [viewState, setViewState] = useState<ViewState>({ name: 'home' });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Load state from local storage if available
  useEffect(() => {
    const savedCart = localStorage.getItem('jutelelo_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart');
      }
    }
    
    const savedWishlist = localStorage.getItem('jutelelo_wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Failed to parse wishlist');
      }
    }
  }, []);

  // Save state to local storage
  useEffect(() => {
    localStorage.setItem('jutelelo_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('jutelelo_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (product: Product, size: number, quantity: number) => {
    setCart(prevCart => {
      const id = `${product.id}-${size}`;
      const existingItem = prevCart.find(item => item.id === id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.id === id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevCart, { id, productId: product.id, product, size, quantity }];
    });
    setViewState({ name: 'cart' });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand selection:text-white text-slate-100 bg-transparent">
      <ParticleBackground />
      <Header 
        cartItemCount={totalCartItems} 
        setViewState={setViewState} 
        currentView={viewState}
      />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {viewState.name === 'home' && (
            <Home key={`home-${viewState.category || 'all'}`} setViewState={setViewState} initialCategory={viewState.category} wishlist={wishlist} toggleWishlist={toggleWishlist} />
          )}
          {viewState.name === 'product' && (
            <ProductDetail 
              key={`product-${viewState.productId}`} 
              productId={viewState.productId} 
              setViewState={setViewState} 
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          )}
          {viewState.name === 'wishlist' && (
            <Wishlist
              key="wishlist"
              wishlist={wishlist}
              setViewState={setViewState}
              toggleWishlist={toggleWishlist}
            />
          )}
          {viewState.name === 'cart' && (
            <Cart 
              key="cart" 
              cart={cart} 
              setViewState={setViewState} 
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
            />
          )}
          {viewState.name === 'checkout' && (
            <Checkout 
              key="checkout" 
              cart={cart} 
              setViewState={setViewState}
              clearCart={clearCart}
            />
          )}
          {viewState.name === 'admin' && (
            <Admin key="admin" />
          )}
          {viewState.name === 'orders' && (
            <Orders key="orders" />
          )}
        </AnimatePresence>
      </main>

      <ChatBot />
      <Footer />
    </div>
  );
}
