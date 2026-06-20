import React, { useState, useEffect } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

export function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    category: 'sneakers',
    color: 'black'
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u?.email === 'manjubangre24@gmail.com') { // Hardcoded admin email
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isAdmin) {
      // Fetch Products
      const pUnsub = onSnapshot(collection(db, 'products'), (snapshot) => {
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'products');
      });

      // Fetch Orders
      const oUnsub = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snapshot) => {
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      });

      return () => {
        pUnsub();
        oUnsub();
      };
    }
  }, [isAdmin]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newProduct.name || !newProduct.price || !newProduct.image || !newProduct.description) return;
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        price: parseFloat(newProduct.price),
        createdAt: serverTimestamp()
      });
      setNewProduct({ name: '', price: '', image: '', description: '', category: 'sneakers', color: 'black' });
      alert('Product added correctly');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
      alert('Error adding product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'products');
        alert('Error deleting product');
      }
    }
  };

  if (loading) return <div className="text-white text-center py-20 font-mono tracking-widest uppercase">Checking auth...</div>;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8">
        <h2 className="text-2xl font-mono uppercase tracking-widest text-white mb-6">Admin Access Required</h2>
        {user ? (
          <div className="space-y-4 text-white/50">
            <p>Logged in as {user.email}</p>
            <p>You do not have administrative privileges.</p>
            <button onClick={handleLogout} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white uppercase text-xs tracking-widest transition-colors rounded-full font-mono mt-4">
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white uppercase text-xs tracking-widest transition-colors rounded-full font-mono"
          >
            Admin Sign In
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-white">
      <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-6 text-white text-xs font-mono tracking-widest uppercase">
         <h1 className="text-2xl font-black font-display italic group"><span className="text-orange-500">ADMIN</span> DASHBOARD</h1>
         <div className="flex items-center space-x-6">
            <span>{user?.email}</span>
            <button onClick={handleLogout} className="text-orange-500 hover:text-orange-400 p-2 border border-orange-500/30 rounded-full transition-all flex items-center pr-4"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 ml-2"></span>Sign Out</button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* ADD PRODUCT */}
        <section className="bg-slate-800/20 backdrop-blur-md rounded-3xl p-8 border border-white/5">
          <h2 className="font-mono text-sm uppercase tracking-widest mb-6 flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>Add Product</h2>
          <form onSubmit={handleAddProduct} className="space-y-4 font-mono text-sm">
            <div>
              <label className="block text-white/50 mb-2 text-xs">Name</label>
              <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/20 focus:border-orange-500 outline-none transition-colors" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/50 mb-2 text-xs">Price ($)</label>
                <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/20 focus:border-orange-500 outline-none transition-colors" required />
              </div>
              <div>
                <label className="block text-white/50 mb-2 text-xs">Category</label>
                 <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-orange-500 outline-none transition-colors">
                  <option value="sneakers">Sneakers</option>
                  <option value="apparel">Apparel</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-white/50 mb-2 text-xs">Image URL (Unsplash/Raw)</label>
              <input type="url" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/20 focus:border-orange-500 outline-none transition-colors" required />
            </div>
            <div>
              <label className="block text-white/50 mb-2 text-xs">Description</label>
              <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} rows={3} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/20 focus:border-orange-500 outline-none transition-colors" required />
            </div>
            <button type="submit" className="w-full py-3 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-colors rounded-lg mt-4">
              Publish Product
            </button>
          </form>
        </section>

        {/* ORDER HISTORY */}
        <section className="bg-slate-800/20 backdrop-blur-md rounded-3xl p-8 border border-white/5 flex flex-col h-[600px]">
          <h2 className="font-mono text-sm uppercase tracking-widest mb-6 flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>Recent Orders {orders.length > 0 && <span className="ml-3 text-white/40 text-xs">({orders.length})</span>}</h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {orders.length === 0 ? (
              <p className="text-white/50 text-sm font-light">No orders yet.</p>
            ) : (
              orders.map(order => (
                <div key={order.id} className="p-4 bg-black/30 border border-white/5 rounded-xl font-mono flex flex-col">
                  <div className="flex justify-between items-start mb-3 border-b border-white/10 pb-3">
                    <div>
                      <div className="text-xs text-white/40">Order #{order.id.slice(0, 8)}...</div>
                      <div className="text-sm font-medium mt-1">{order.customerEmail || order.customerName || 'Guest'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-orange-500">${order.total?.toFixed(2)}</div>
                      <div className="text-[10px] text-white/30 uppercase mt-1">{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs items-center">
                        <span className="text-white/70 line-clamp-1 flex-1 pr-4">{item.quantity}x {item.name}</span>
                        <span className="text-white/40">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* MANAGE PRODUCTS */}
        <section className="bg-slate-800/20 backdrop-blur-md rounded-3xl p-8 border border-white/5 lg:col-span-2">
          <h2 className="font-mono text-sm uppercase tracking-widest mb-6 flex items-center"><span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>Manage Products {products.length > 0 && <span className="ml-3 text-white/40 text-xs">({products.length})</span>}</h2>
          <div className="overflow-x-auto">
             <table className="w-full text-left font-mono text-xs border-collapse">
               <thead>
                 <tr className="text-white/40 border-b border-white/10">
                   <th className="font-normal pb-4 pr-6 w-12">Image</th>
                   <th className="font-normal pb-4 pr-6">Name</th>
                   <th className="font-normal pb-4 pr-6">Price</th>
                   <th className="font-normal pb-4 pr-6">Category</th>
                   <th className="font-normal pb-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5 text-white/80">
                 {products.map(product => (
                   <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                     <td className="py-4 pr-6">
                       <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-md bg-white/5" />
                     </td>
                     <td className="py-4 pr-6">{product.name}</td>
                     <td className="py-4 pr-6">${product.price?.toFixed(2)}</td>
                     <td className="py-4 pr-6 capitalize">{product.category}</td>
                     <td className="py-4 text-right">
                       <button onClick={() => handleDeleteProduct(product.id)} className="text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest text-[10px] bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded">Delete</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {products.length === 0 && (
               <div className="text-center py-12 text-white/50 text-sm font-light">No products in database.</div>
             )}
          </div>
        </section>
      </div>
    </div>
  );
}
