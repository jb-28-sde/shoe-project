import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, ChevronRight, Camera, X, Heart, Star } from 'lucide-react';
import { products } from '../data';
import { ViewState, CartItem, Product, Review } from '../types';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, PresentationControls, Image as DreiImage, useGLTF, Bounds, useBounds, Html } from '@react-three/drei';
import * as THREE from 'three';

function ZoomHandler({ children }: { children: React.ReactNode }) {
  const api = useBounds();
  return (
    <group
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (e.delta <= 10) {
          e.object.name === 'product_image' ? api.refresh().fit() : api.refresh(e.object).fit();
        }
      }}
      onPointerMissed={(e) => {
        if (e.button === 0) {
          api.refresh().fit();
        }
      }}
    >
      {children}
    </group>
  );
}

const InteractiveShoeParts = () => {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);

  const Part = ({ name, position, args }: { name: string, position: [number, number, number], args: [number, number, number] }) => (
    <mesh 
      position={position}
      name={name}
      onPointerOver={(e) => { e.stopPropagation(); setHoveredPart(name); document.body.style.cursor = 'zoom-in'; }}
      onPointerOut={(e) => { setHoveredPart(null); document.body.style.cursor = 'grab'; }}
    >
      <boxGeometry args={args} />
      <meshBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={hoveredPart === name ? 0.3 : 0} 
        wireframe={hoveredPart === name} 
      />
    </mesh>
  );

  return (
    <group position={[0, -0.2, 0.15]}>
      {/* Front / Toe */}
      <Part name="Front" position={[-1.2, -0.2, 0]} args={[1.2, 1, 0.2]} />
      {/* Back / Heel */}
      <Part name="Back" position={[1.4, 0.1, 0]} args={[1.2, 1.4, 0.2]} />
      {/* Sole */}
      <Part name="Sole" position={[0.2, -1.1, 0]} args={[3.2, 0.6, 0.2]} />
      {/* Top / Laces */}
      <Part name="Top" position={[0, 0.6, 0]} args={[1.4, 1, 0.2]} />
    </group>
  );
};

const FloatingProduct = ({ imageUrl }: { imageUrl: string }) => {
  const mesh = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, (state.mouse.x * Math.PI) / 6, 0.05);
      mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, (state.mouse.y * Math.PI) / 6, 0.05);
      
      const t = state.clock.getElapsedTime();
      mesh.current.position.y = Math.sin(t * 2) * 0.1;
    }
  });

  return (
    <group ref={mesh}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Bounds fit clip observe margin={1.2}>
          <ZoomHandler>
            {/* Holographic glowing backplate */}
            <mesh position={[0, 0, -0.15]} name="product_image">
              <boxGeometry args={[4.5, 3.5, 0.05]} />
              <meshPhysicalMaterial 
                color="#ea580c" 
                emissive="#ea580c"
                emissiveIntensity={0.5}
                transparent
                opacity={0.3}
                wireframe
              />
            </mesh>
            
            {/* Premium glass frame */}
            <mesh position={[0, 0, -0.05]} name="product_image">
              <boxGeometry args={[4.3, 3.3, 0.1]} />
              <meshPhysicalMaterial 
                color="#000000" 
                metalness={0.9} 
                roughness={0.1} 
                clearcoat={1} 
                clearcoatRoughness={0.1}
                transmission={0.5}
                thickness={0.5} 
              />
            </mesh>

            {/* Product Image */}
            <DreiImage 
              url={imageUrl} 
              scale={[4, 3]} 
              position={[0, 0, 0.05]}
              radius={0.05}
              name="product_image"
            />
            
            {/* Front glass reflection */}
            <mesh position={[0, 0, 0.06]} name="product_image">
              <planeGeometry args={[4, 3]} />
              <meshPhysicalMaterial 
                color="#ffffff" 
                transparent 
                opacity={0.05} 
                roughness={0} 
                transmission={0.9} 
                clearcoat={1}
              />
            </mesh>

            <InteractiveShoeParts />
          </ZoomHandler>
        </Bounds>
      </Float>
    </group>
  );
};



interface ProductDetailProps {
  key?: string | number;
  productId: string;
  setViewState: (view: ViewState) => void;
  addToCart: (product: Product, size: number, quantity: number) => void;
  wishlist?: string[];
  toggleWishlist?: (productId: string) => void;
}

export function ProductDetail({ productId, setViewState, addToCart, wishlist, toggleWishlist }: ProductDetailProps) {
  const product = products.find(p => p.id === productId);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedWarning, setAddedWarning] = useState('');
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [cameraError, setCameraError] = useState('');
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const allReviews = JSON.parse(localStorage.getItem('jutelelo_reviews') || '[]') as Review[];
    setReviews(allReviews.filter(r => r.productId === productId));
  }, [productId]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    const review: Review = {
      id: crypto.randomUUID(),
      productId,
      rating: newRating,
      text: newReviewText.trim(),
      date: new Date().toLocaleDateString(),
    };

    const updatedReviews = [...reviews, review];
    setReviews(updatedReviews);

    const allReviews = JSON.parse(localStorage.getItem('jutelelo_reviews') || '[]') as Review[];
    localStorage.setItem('jutelelo_reviews', JSON.stringify([...allReviews, review]));

    setNewReviewText('');
    setNewRating(5);
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isTryOnOpen && videoRef.current) {
      setCameraError('');
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => {
          console.error("Camera access denied or unavailable", err);
          setCameraError("Camera access is required for Virtual Try-On. If you are in the preview, please open the app in a new tab.");
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isTryOnOpen]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-panel p-12 rounded-3xl">
          <h2 className="text-2xl font-black italic uppercase text-white mb-6">Product Not Found</h2>
          <button onClick={() => setViewState({ name: 'home' })} className="bg-white/10 hover:bg-white text-white hover:text-black transition-colors flex items-center justify-center font-bold uppercase text-xs px-6 py-3 rounded-xl mx-auto">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (selectedSize === null) {
      setAddedWarning('Please select a size first.');
      return;
    }
    setAddedWarning('');
    addToCart(product, selectedSize, quantity);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Breadcrumbs */}
      <nav className="flex text-xs uppercase font-bold tracking-widest text-slate-400 mb-8 items-center space-x-3">
        <button onClick={() => setViewState({ name: 'home' })} className="hover:text-orange-400 transition-colors">Home</button>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <span className="hover:text-orange-400 cursor-pointer transition-colors">{product.category}</span>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <span className="text-white bg-white/10 px-3 py-1 rounded-full">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Images */}
         <div className="space-y-4">
          <div className="aspect-[4/3] lg:aspect-square bg-slate-800/50 rounded-3xl overflow-hidden glass-panel flex items-center justify-center relative cursor-grab active:cursor-grabbing">
            
            {!isLoaded && (
              <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                  <div className="text-white font-mono text-[10px] tracking-widest uppercase animate-pulse">Loading Hologram</div>
                </div>
              </div>
            )}

            <div className={`absolute inset-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <Canvas 
                camera={{ position: [0, 0, 6], fov: 45 }}
                onCreated={() => setIsLoaded(true)}
              >
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <PresentationControls
                    global
                    snap={true}
                    rotation={[0, 0, 0]}
                    polar={[-Math.PI / 4, Math.PI / 4]}
                    azimuth={[-Math.PI / 4, Math.PI / 4]}
                >
                  <React.Suspense fallback={null}>
                    <Environment preset="city" />
                    <FloatingProduct imageUrl={product.image} />
                  </React.Suspense>
                </PresentationControls>
                <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
              </Canvas>
            </div>
             <div className={`absolute top-4 left-4 pointer-events-none px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white/50 text-[10px] font-mono uppercase tracking-widest flex items-center transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
               <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
               Drag to rotate • Double-click parts to focus
             </div>
          </div>
          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map((_, i) => (
              <div key={i} className={`aspect-square rounded-xl bg-slate-800/50 overflow-hidden cursor-pointer glass-panel ${i === 0 ? 'border-orange-500 scale-100' : 'opacity-60 hover:opacity-100 hover:scale-95'} transition-transform`}>
                <img src={product.image} alt="" className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Virtual Try-On Button */}
          <button 
            onClick={() => setIsTryOnOpen(true)}
            className="w-full mt-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center space-x-2 transition-all shadow-xl backdrop-blur-sm"
          >
            <Camera className="w-5 h-5 text-orange-400" />
            <span>Virtual Try-On</span>
          </button>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <div className="mb-8 relative">
            <h1 className="text-4xl sm:text-5xl font-display font-black uppercase italic text-white tracking-tight mb-4 pr-12">
              {product.name}
            </h1>
            {toggleWishlist && (
              <button 
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-0 right-0 p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                <Heart className={`w-6 h-6 ${wishlist?.includes(product.id) ? 'fill-orange-500 text-orange-500' : 'text-slate-300'}`} />
              </button>
            )}
            <p className="text-3xl font-mono font-bold text-orange-400 mb-6">₹{product.price}</p>
            <p className="text-slate-300 leading-relaxed font-light">
              {product.description}
            </p>
          </div>

          <div className="mb-8 space-y-6 glass-panel p-6 rounded-3xl">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Select Size (US)</h3>
                <button className="text-[10px] uppercase font-bold text-orange-400 hover:text-white transition-colors">Size Guide</button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setAddedWarning(''); }}
                    className={`py-3 rounded-xl border text-sm font-mono font-bold transition-all flex items-center justify-center
                      ${selectedSize === size 
                        ? 'border-orange-500 bg-orange-500/20 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:bg-white/10'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {addedWarning && (
                <p className="text-red-400 text-xs uppercase font-bold tracking-widest mt-4 animate-pulse">{addedWarning}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4 border-t border-white/10">
              <div className="sm:w-32 border border-white/10 rounded-xl flex items-center bg-white/5 overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-orange-400 hover:bg-white/5 transition-colors font-mono"
                >
                  -
                </button>
                <span className="flex-1 text-center font-mono font-bold text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-orange-400 hover:bg-white/5 transition-colors font-mono"
                >
                  +
                </button>
              </div>
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-xl font-black uppercase italic tracking-widest text-sm flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98] py-4 shadow-xl shadow-orange-900/20"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center text-slate-300 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
              <Truck className="w-5 h-5 mr-4 text-orange-400" />
              <div>
                <p className="font-bold uppercase text-xs tracking-widest text-white mb-1">Free Express Delivery</p>
                <p className="text-[10px] text-slate-400">Enter postal code for Delivery Availability</p>
              </div>
            </div>
            <div className="flex items-center text-slate-300 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 mr-4 text-orange-400" />
              <div>
                <p className="font-bold uppercase text-xs tracking-widest text-white mb-1">Return Delivery</p>
                <p className="text-[10px] text-slate-400">Free 30 Days Delivery Returns.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 sm:mt-24">
        <h2 className="text-2xl font-black uppercase italic text-white tracking-widest mb-8 text-center sm:text-left">Reviews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Add Review Form */}
          <div className="lg:col-span-1 glass-panel p-6 sm:p-8 rounded-3xl h-fit">
            <h3 className="text-lg font-bold text-white mb-6">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className={`p-1 transition-transform hover:scale-110 ${newRating >= star ? 'text-orange-400' : 'text-slate-600'}`}
                    >
                      <Star className={`w-6 h-6 ${newRating >= star ? 'fill-orange-400' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">Review</label>
                <textarea
                  required
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 transition-all font-mono resize-none h-32"
                  placeholder="What do you think about this product?"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-400 text-white rounded-xl py-4 font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-orange-900/20"
              >
                Submit Review
              </button>
            </form>
          </div>

          {/* Review List */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12 glass-panel rounded-3xl border-dashed">
                <p className="text-slate-400">No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="glass-panel p-6 rounded-3xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex space-x-1 text-orange-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-orange-400' : 'text-slate-600'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{review.date}</span>
                  </div>
                  <p className="text-slate-300 font-light text-sm">{review.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Virtual Try-On Overlay */}
      {isTryOnOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="relative w-full h-full sm:w-[500px] sm:h-[800px] max-w-full max-h-full sm:rounded-[3rem] overflow-hidden bg-slate-900 border border-white/10 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="absolute top-0 inset-x-0 z-10 flex justify-between items-center p-6 bg-gradient-to-b from-black/80 to-transparent">
              <h3 className="text-white font-black italic uppercase tracking-widest text-sm flex items-center shadow-black drop-shadow-md">
                <Camera className="w-4 h-4 mr-2 text-orange-400" />
                AR Try-On
              </h3>
              <button 
                onClick={() => setIsTryOnOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors"
               >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Camera Feed */}
            <div className="flex-1 relative bg-black overflow-hidden flex items-center justify-center">
              {cameraError ? (
                <div className="text-center p-8 z-20">
                  <p className="text-red-400 font-bold mb-4">{cameraError}</p>
                  <button 
                    onClick={() => setIsTryOnOpen(false)}
                    className="bg-white/10 hover:bg-white text-white hover:text-black transition-colors px-6 py-3 rounded-xl mx-auto uppercase text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              
              {/* Simulated Foot Area Indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-64 border-2 border-dashed border-orange-500/50 rounded-full flex items-center justify-center relative">
                   <p className="absolute -bottom-8 text-orange-400/80 font-mono text-xs uppercase tracking-widest text-center">Point at your foot</p>
                </div>
              </div>

              {/* Superimposed Shoe (Simulated AR) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none mt-10 mix-blend-normal"
              >
                <img 
                  src={product.image} 
                  alt="Virtual Try On" 
                  className="w-64 drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] filter brightness-90 contrast-125 saturate-110 hue-rotate-15 -rotate-12"
                   style={{ maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%)' }}
                />
              </motion.div>
            </div>

            {/* Footer Controls */}
            <div className="bg-black/90 p-6 sm:p-8 backdrop-blur-md space-y-4 rounded-b-[3rem]">
               <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Trying on</p>
                    <p className="text-white font-bold text-sm truncate max-w-[200px]">{product.name}</p>
                  </div>
                  <p className="text-orange-400 font-mono font-bold">₹{product.price}</p>
               </div>
               
               <button 
                  onClick={() => {
                    setIsTryOnOpen(false);
                    // Open size selector or auto-select if selectedSize is present
                    if (selectedSize) {
                      addToCart(product, selectedSize, 1);
                    } else {
                      window.scrollTo(0, document.body.scrollHeight / 2);
                    }
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-400 text-white rounded-xl py-4 font-black uppercase italic tracking-widest text-sm transition-all shadow-xl shadow-orange-900/20"
                >
                 {selectedSize ? `Add Size ${selectedSize} to Cart` : 'Select Size to Buy'}
               </button>
            </div>

          </div>
        </div>
      )}
    </motion.div>
  );
}
