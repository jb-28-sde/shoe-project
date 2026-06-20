import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { Package, Truck, CheckCircle2, XCircle } from 'lucide-react';

export function Orders() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const oUnsub = onSnapshot(q, (snapshot) => {
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      });

      return () => {
        oUnsub();
      };
    } else {
      setOrders([]);
    }
  }, [user]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) return <div className="text-white text-center py-20 font-mono tracking-widest uppercase">Checking auth...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8">
        <h2 className="text-2xl font-mono uppercase tracking-widest text-white mb-6">Your Orders</h2>
        <button 
          onClick={handleLogin}
          className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white uppercase text-xs tracking-widest transition-colors rounded-full font-mono"
        >
          Sign In to View Orders
        </button>
      </div>
    );
  }

  const filteredOrders = orderFilter === 'all'
    ? orders
    : orders.filter(order => order.status === orderFilter || (orderFilter === 'pending' && !order.status));

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-white">
      <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-6 text-white text-xs font-mono tracking-widest uppercase">
         <h1 className="text-2xl font-black font-display italic group"><span className="text-orange-500">YOUR</span> ORDERS</h1>
         <div className="flex items-center space-x-6">
            <span>{user.email}</span>
            <button onClick={handleLogout} className="text-orange-500 hover:text-orange-400 p-2 border border-orange-500/30 rounded-full transition-all flex items-center pr-4"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 ml-2"></span>Sign Out</button>
         </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="font-mono text-sm uppercase tracking-widest flex items-center">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
            Recent Orders
            {filteredOrders.length > 0 && <span className="ml-3 text-white/40 text-xs">({filteredOrders.length})</span>}
        </h2>
        <select
          value={orderFilter}
          onChange={(e) => setOrderFilter(e.target.value)}
          className="bg-black/40 border border-white/10 rounded px-3 py-1.5 text-white text-[10px] uppercase tracking-widest outline-none focus:border-orange-500 font-mono"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          <p className="text-white/50 text-sm font-light text-center py-12">No orders found.</p>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="p-6 bg-slate-800/20 backdrop-blur-md border border-white/5 rounded-2xl font-mono flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-white/10 pb-4">
                <div>
                  <div className="text-xs text-white/40 mb-1">Order #{order.id}</div>
                  <div className="text-[10px] text-white/30 uppercase">{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                </div>
                <div className="text-left sm:text-right mt-2 sm:mt-0 flex flex-col items-start sm:items-end">
                  <div className="text-orange-500 font-bold mb-1">${order.total?.toFixed(2)}</div>
                  <div className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-white/5 text-white/70">
                    STATUS: <span className={order.status === 'delivered' ? 'text-green-400' : order.status === 'shipped' ? 'text-blue-400' : order.status === 'cancelled' ? 'text-red-400' : 'text-yellow-400'}>{order.status || 'pending'}</span>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="mb-8 mt-2 px-2 sm:px-8">
                {order.status === 'cancelled' ? (
                  <div className="flex items-center justify-center space-x-2 text-red-400">
                    <XCircle className="w-5 h-5" />
                    <span className="uppercase text-xs font-bold tracking-widest">Order Cancelled</span>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-white/10 rounded-full"></div>
                    <div 
                      className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-1 rounded-full transition-all duration-700 ${
                        order.status === 'delivered' ? 'w-full bg-green-400' :
                        order.status === 'shipped' ? 'w-1/2 bg-blue-400' :
                        'w-0 bg-yellow-400'
                      }`}
                    ></div>
                    
                    <div className="relative flex justify-between">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${!order.status || order.status === 'pending' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-yellow-400 text-black' : 'bg-slate-800 text-white/30'}`}>
                          <Package className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-widest mt-2 ${!order.status || order.status === 'pending' || order.status === 'shipped' || order.status === 'delivered' ? 'text-yellow-400' : 'text-white/30'}`}>Pending</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-blue-400 text-white' : 'bg-slate-800 text-white/30 border border-white/10'}`}>
                          <Truck className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-widest mt-2 ${order.status === 'shipped' || order.status === 'delivered' ? 'text-blue-400' : 'text-white/30'}`}>Shipped</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${order.status === 'delivered' ? 'bg-green-400 text-black' : 'bg-slate-800 text-white/30 border border-white/10'}`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-widest mt-2 ${order.status === 'delivered' ? 'text-green-400' : 'text-white/30'}`}>Delivered</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs items-center p-3 bg-black/20 rounded-lg">
                    <span className="text-white/80 font-medium">{item.quantity}x {item.name}</span>
                    <span className="text-white/50 ml-4">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
