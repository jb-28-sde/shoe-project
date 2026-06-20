import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { ViewState, CartItem } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface CheckoutProps {
  key?: string | number;
  cart: CartItem[];
  setViewState: (view: ViewState) => void;
  clearCart: () => void;
}

export function Checkout({ cart, setViewState, clearCart }: CheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 0 ? (subtotal > 200 ? 0 : 15) : 0;
  const total = subtotal + shipping;

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const orderData = {
        userId: auth.currentUser?.uid || '',
        customerEmail: email,
        customerName: `${firstName} ${lastName}`.trim(),
        total,
        status: 'pending',
        items: cart.map(item => ({
          productId: item.productId,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          size: item.size
        })),
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'orders'), orderData);
      
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      setIsProcessing(false);
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[70vh] flex flex-col items-center justify-center p-6"
      >
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
           <CheckCircle2 className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-3xl font-display font-black uppercase italic text-white mb-4 text-center">Payment Successful!</h2>
        <p className="text-slate-400 mb-8 max-w-md text-center text-sm font-light">
          Your order has been placed successfully. You will receive an email confirmation containing your receipt and tracking details.
        </p>
        <button 
          onClick={() => setViewState({ name: 'home' })}
          className="bg-white/10 hover:bg-white text-white hover:text-black px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all shadow-lg"
        >
          Back to Store
        </button>
      </motion.div>
    );
  }

  // Redirect if cart is empty and not on success
  if (cart.length === 0 && !isSuccess) {
    setViewState({ name: 'home' });
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          <form onSubmit={handlePayment}>
            <div className="glass-panel p-6 sm:p-8 mb-8 rounded-3xl">
              <h2 className="text-lg font-black italic uppercase text-white mb-6 border-b border-white/10 pb-4">1. Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1">Email Address *</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1">First Name *</label>
                  <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1">Last Name *</label>
                  <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-all font-mono" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1">Phone Number</label>
                  <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-all font-mono" />
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 sm:p-8 mb-8 rounded-3xl">
              <h2 className="text-lg font-black italic uppercase text-white mb-6 border-b border-white/10 pb-4">2. Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1">Street Address *</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-all font-mono" placeholder="123 Main St" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1">Apartment, suite, etc. (optional)</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1">City *</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1">State / Province *</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1">Postal Code *</label>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1">Country *</label>
                  <select required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-all font-mono appearance-none">
                    <option value="US" className="bg-slate-800 text-white">United States</option>
                    <option value="CA" className="bg-slate-800 text-white">Canada</option>
                    <option value="UK" className="bg-slate-800 text-white">United Kingdom</option>
                    <option value="AU" className="bg-slate-800 text-white">Australia</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-3xl">
              <h2 className="text-lg font-black italic uppercase text-white mb-6 border-b border-white/10 pb-4">3. Payment Method</h2>
              <div className="border border-orange-500/30 rounded-xl p-6 bg-orange-500/5 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute -right-4 -bottom-4 opacity-5">
                  <CreditCard className="w-32 h-32 text-orange-400" />
                </div>
                <h3 className="font-bold text-white mb-2 relative z-10 flex items-center text-sm uppercase tracking-widest">
                  <CreditCard className="w-4 h-4 mr-2 text-orange-400" /> Secure External Checkout
                </h3>
                <p className="text-slate-400 text-xs mb-6 relative z-10 font-light max-w-sm">
                  You will be securely redirected to our payment partner after confirming your order details above.
                </p>
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest italic text-sm transition-all shadow-xl shadow-orange-900/20 flex items-center justify-center relative z-10"
                >
                  {isProcessing ? 'Processing Transaction...' : `Pay ₹${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl sticky top-28">
            <h2 className="text-lg font-black uppercase italic text-white mb-6">In Your Cart</h2>
            
            <div className="divide-y divide-white/5 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="py-4 flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-800/50 overflow-hidden flex-shrink-0 border border-white/5 p-1">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-xs truncate">{item.product.name}</h4>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-1">Size {item.size} • Qty {item.quantity}</p>
                    <p className="text-orange-400 font-mono font-bold text-sm mt-1">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6 bg-white/5 border border-white/10 p-4 rounded-xl">
              <div className="flex justify-between text-slate-300 text-xs font-medium">
                <span>Subtotal</span>
                <span className="font-mono text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300 text-xs font-medium">
                <span>Shipping</span>
                <span className="font-mono text-white">
                  {shipping === 0 ? <span className="text-green-400 uppercase font-bold text-[10px]">Free</span> : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-black italic text-lg text-white">Total</span>
                <span className="font-black text-2xl font-mono text-orange-400">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
