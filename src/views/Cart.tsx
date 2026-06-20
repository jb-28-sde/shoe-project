import React from 'react';
import { motion } from 'motion/react';
import { Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { ViewState, CartItem } from '../types';

interface CartProps {
  key?: string | number;
  cart: CartItem[];
  setViewState: (view: ViewState) => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  removeFromCart: (id: string) => void;
}

export function Cart({ cart, setViewState, updateQuantity, removeFromCart }: CartProps) {
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 0 ? (subtotal > 200 ? 0 : 15) : 0;
  const total = subtotal + shipping;

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <div className="glass-panel p-12 rounded-3xl flex flex-col items-center max-w-md w-full text-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
             <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
          <h2 className="text-2xl font-display font-black italic uppercase text-white mb-2">Cart is Empty</h2>
          <p className="text-slate-400 text-sm font-light mb-8">Looks like you haven't added any products to your cart yet.</p>
          <button 
            onClick={() => setViewState({ name: 'home' })}
            className="bg-white/10 hover:bg-white text-white hover:text-black w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-md flex justify-center items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-display font-black uppercase italic text-white">Cart</h1>
        <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold font-mono border border-white/10 text-orange-400">
          {cart.length} Items
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 p-6 border-b border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white/5">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1"></div>
            </div>
            
            <div className="divide-y divide-white/5">
              {cart.map((item) => (
                <div key={item.id} className="p-6 grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-4 items-center">
                  <div className="col-span-1 sm:col-span-6 flex gap-4">
                    <div className="w-24 h-24 rounded-xl bg-slate-800/50 flex-shrink-0 cursor-pointer overflow-hidden border border-white/5 p-2" onClick={() => setViewState({ name: 'product', productId: item.productId })}>
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 
                        className="font-bold text-white text-sm cursor-pointer hover:text-orange-400 transition-colors line-clamp-1"
                        onClick={() => setViewState({ name: 'product', productId: item.productId })}
                      >
                        {item.product.name}
                      </h3>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Size US {item.size}</p>
                      <p className="text-orange-400 font-mono font-bold mt-2">₹{item.product.price}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-1 sm:col-span-3 flex justify-start sm:justify-center">
                    <div className="flex items-center border border-white/10 bg-white/5 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors font-mono"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-mono font-bold text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors font-mono"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-span-1 sm:col-span-2 text-left sm:text-right font-mono font-bold text-white">
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </div>

                  <div className="col-span-1 flex justify-end">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="glass-panel rounded-3xl p-8 sticky top-28">
            <h2 className="text-lg font-black uppercase italic text-white mb-6">Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-300 text-sm font-medium">
                <span>Subtotal</span>
                <span className="font-mono text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300 text-sm font-medium">
                <span>Shipping</span>
                <span className="font-mono text-white">
                  {shipping === 0 ? <span className="text-green-400 uppercase font-bold text-[10px]">Free</span> : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-[10px] uppercase font-bold tracking-widest text-orange-400 bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">Add <span className="font-mono">₹{(200 - subtotal).toFixed(2)}</span> more for free shipping!</p>
              )}
            </div>
            
            <div className="border-t border-white/10 pt-6 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-black italic text-lg text-white">Total</span>
                <span className="font-black font-mono text-xl text-orange-400">₹{total.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setViewState({ name: 'checkout' })}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white py-4 rounded-xl font-black uppercase tracking-widest italic text-sm flex items-center justify-center transition-all transform active:scale-[0.98] shadow-xl shadow-orange-900/20"
            >
              <span>Secure Checkout</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => setViewState({ name: 'home' })}
                className="text-xs uppercase font-bold tracking-widest text-slate-500 hover:text-white transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
