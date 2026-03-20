import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Utensils, 
  Leaf, 
  Beef, 
  Dumbbell, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Menu as MenuIcon,
  ShoppingBag,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  X,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { cn } from './lib/utils';
import { ChatBot } from './components/ChatBot';
import { MealPreviewer } from './components/MealPreviewer';
import { auth, db, signInWithPopup, googleProvider, signOut, onAuthStateChanged, User, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

const MEALS = [
  // VEG - 20 Items
  { id: 1, title: "Paneer Butter Masala", type: "veg", tags: ["Bestseller", "Rich", "Protein"], image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=400", price: 249 },
  { id: 2, title: "Dal Makhani Executive", type: "veg", tags: ["Classic", "Slow Cooked", "Protein"], image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400", price: 199 },
  { id: 3, title: "Palak Paneer Bowl", type: "veg", tags: ["Healthy", "Iron Rich"], image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=400", price: 229 },
  { id: 4, title: "Vegetable Jalfrezi", type: "veg", tags: ["Spicy", "Fiber"], image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=400", price: 189 },
  { id: 5, title: "Malai Kofta Deluxe", type: "veg", tags: ["Creamy", "Premium"], image: "https://images.unsplash.com/photo-1596797038530-2c39bb050ac5?auto=format&fit=crop&q=80&w=400", price: 259 },
  { id: 6, title: "Aloo Gobi Adraki", type: "veg", tags: ["Home Style"], image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=400", price: 169 },
  { id: 7, title: "Baingan Bharta", type: "veg", tags: ["Smoky"], image: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&q=80&w=400", price: 179 },
  { id: 8, title: "Chana Masala", type: "veg", tags: ["Protein", "Vegan"], image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=400", price: 179 },
  { id: 9, title: "Mushroom Matar", type: "veg", tags: ["Savory"], image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400", price: 219 },
  { id: 10, title: "Bhindi Do Pyaza", type: "veg", tags: ["Crunchy"], image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=400", price: 169 },
  { id: 11, title: "Mix Veg Handi", type: "veg", tags: ["Nutritious"], image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400", price: 199 },
  { id: 12, title: "Kadai Paneer", type: "veg", tags: ["Bold Flavors"], image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=400", price: 239 },
  { id: 13, title: "Jeera Aloo", type: "veg", tags: ["Light"], image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=400", price: 149 },
  { id: 14, title: "Methi Matar Malai", type: "veg", tags: ["Sweet & Savory"], image: "https://images.unsplash.com/photo-1596797038530-2c39bb050ac5?auto=format&fit=crop&q=80&w=400", price: 229 },
  { id: 15, title: "Shahi Paneer", type: "veg", tags: ["Royal"], image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=400", price: 249 },
  { id: 16, title: "Rajma Chawal Bowl", type: "veg", tags: ["Comfort Food"], image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=400", price: 189 },
  { id: 17, title: "Veg Pulao", type: "veg", tags: ["Aromatic"], image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=400", price: 179 },
  { id: 18, title: "Paneer Tikka Masala", type: "veg", tags: ["Grilled"], image: "https://images.unsplash.com/photo-1596797038530-2c39bb050ac5?auto=format&fit=crop&q=80&w=400", price: 249 },
  { id: 19, title: "Navratan Korma", type: "veg", tags: ["Mild"], image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=400", price: 239 },
  { id: 20, title: "Dum Aloo Kashmiri", type: "veg", tags: ["Spiced"], image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=400", price: 199 },

  // NON-VEG - 20 Items
  { id: 21, title: "Butter Chicken", type: "non-veg", tags: ["Bestseller", "Iconic", "Protein"], image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=400", price: 299 },
  { id: 22, title: "Chicken Tikka Masala", type: "non-veg", tags: ["Tandoori", "Protein"], image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=400", price: 289 },
  { id: 23, title: "Mutton Rogan Josh", type: "non-veg", tags: ["Kashmiri", "Rich", "Protein"], image: "https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80&w=400", price: 349 },
  { id: 24, title: "Chicken Biryani", type: "non-veg", tags: ["Hyderabadi"], image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&q=80&w=400", price: 269 },
  { id: 25, title: "Fish Curry", type: "non-veg", tags: ["Coastal", "Omega 3"], image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&q=80&w=400", price: 279 },
  { id: 26, title: "Chicken Korma", type: "non-veg", tags: ["Mughlai"], image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=400", price: 289 },
  { id: 27, title: "Egg Curry Deluxe", type: "non-veg", tags: ["Protein Rich"], image: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&q=80&w=400", price: 189 },
  { id: 28, title: "Chicken Saagwala", type: "non-veg", tags: ["Healthy"], image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=400", price: 279 },
  { id: 29, title: "Mutton Keema", type: "non-veg", tags: ["Minced", "Spicy"], image: "https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80&w=400", price: 329 },
  { id: 30, title: "Chicken Do Pyaza", type: "non-veg", tags: ["Onion Rich"], image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=400", price: 279 },
  { id: 31, title: "Kadai Chicken", type: "non-veg", tags: ["Bold"], image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=400", price: 289 },
  { id: 32, title: "Chicken Stew", type: "non-veg", tags: ["Mild"], image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=400", price: 259 },
  { id: 33, title: "Goan Prawn Curry", type: "non-veg", tags: ["Exotic"], image: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&q=80&w=400", price: 359 },
  { id: 34, title: "Chicken Chettinad", type: "non-veg", tags: ["South Indian"], image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=400", price: 289 },
  { id: 35, title: "Mutton Bhuna", type: "non-veg", tags: ["Dry Roasted"], image: "https://images.unsplash.com/photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80&w=400", price: 349 },
  { id: 36, title: "Chicken Handi", type: "non-veg", tags: ["Traditional"], image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=400", price: 279 },
  { id: 37, title: "Chicken Rezala", type: "non-veg", tags: ["White Gravy"], image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=400", price: 299 },
  { id: 38, title: "Mutton Biryani", type: "non-veg", tags: ["Premium"], image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&q=80&w=400", price: 369 },
  { id: 39, title: "Chicken Lababdar", type: "non-veg", tags: ["Creamy"], image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=400", price: 289 },
  { id: 40, title: "Chicken Afghani", type: "non-veg", tags: ["Mild & Nutty"], image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=400", price: 319 },
];

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [filter, setFilter] = useState('all');
  const [frequency, setFrequency] = useState(5);
  const [deliveryType, setDeliveryType] = useState({ lunch: true, dinner: false });
  const [selectedMeal, setSelectedMeal] = useState<typeof MEALS[0] | null>(null);
  const [planTier, setPlanTier] = useState<'essential' | 'elite'>('essential');

  const [hovered, setHovered] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'subscriptions'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      if (currentUser) {
        // Sync user profile
        const userRef = doc(db, 'users', currentUser.uid);
        setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          role: 'user', // Default role
          updatedAt: serverTimestamp()
        }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`));

        // Listen to subscription
        const subRef = doc(db, 'subscriptions', currentUser.uid);
        const unsubSub = onSnapshot(subRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setUserSubscription(data);
            // Sync local state with DB if needed
            setPlanTier(data.tier);
            setFrequency(data.frequency);
            setDeliveryType(data.deliveryType);
          }
        }, (err) => handleFirestoreError(err, OperationType.GET, `subscriptions/${currentUser.uid}`));

        return () => unsubSub();
      } else {
        setUserSubscription(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
      setShowLogin(false);
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Logout error", error);
    }
  };

  const handleConfirmSubscription = async () => {
    const effectiveUserId = user?.uid || 'guest_test';
    
    setIsSyncing(true);
    try {
      const subRef = doc(db, 'subscriptions', effectiveUserId);
      await setDoc(subRef, {
        userId: effectiveUserId,
        tier: planTier,
        frequency,
        deliveryType,
        totalPrice: calculatePrice(),
        updatedAt: serverTimestamp()
      });
      alert(user ? "Subscription confirmed and synced!" : "Guest Subscription synced! (Test Mode)");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `subscriptions/${effectiveUserId}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const getFilterColor = (id: string) => {
    switch (id) {
      case 'veg': return 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
      case 'non-veg': return 'bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]';
      case 'protein': return 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]';
      default: return 'bg-primary shadow-[0_0_20px_rgba(var(--primary),0.4)]';
    }
  };

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const calculatePrice = () => {
    let base = planTier === 'essential' ? 999 : 5000;
    if (frequency === 7) base += planTier === 'essential' ? 400 : 1500;
    if (deliveryType.lunch && deliveryType.dinner) base *= 1.8;
    return Math.round(base);
  };

  const filteredMeals = MEALS.filter(meal => {
    if (filter === 'all') return true;
    if (filter === 'protein') return meal.tags.includes('Protein') || meal.tags.includes('Protein Rich');
    return meal.type === filter;
  });

  const totalPrice = calculatePrice();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 glass-effect border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-headline font-black text-primary tracking-tighter">
            TiffinPro
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-headline font-semibold text-sm">
            <button 
              onClick={() => setActiveTab('home')}
              className={cn("transition-colors", activeTab === 'home' ? "text-primary border-b-2 border-primary pb-1" : "text-secondary hover:text-primary")}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab('menu')}
              className={cn("transition-colors", activeTab === 'menu' ? "text-primary border-b-2 border-primary pb-1" : "text-secondary hover:text-primary")}
            >
              Menu
            </button>
            <button 
              onClick={() => setActiveTab('subscriptions')}
              className={cn("transition-colors", activeTab === 'subscriptions' ? "text-primary border-b-2 border-primary pb-1" : "text-secondary hover:text-primary")}
            >
              Subscriptions
            </button>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-primary/20" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="hidden lg:block text-[10px] font-bold text-primary uppercase tracking-widest">{user.displayName}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-surface-container-low hover:bg-rose-500/10 hover:text-rose-500 transition-all text-secondary"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-headline font-bold text-xs hover:bg-primary-container transition-all active:scale-95"
              >
                Login
              </button>
            )}
            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors text-secondary"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40" size={16} />
              <input 
                type="text" 
                placeholder="Find a meal..." 
                className="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-xs w-48 lg:w-64 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-28 pb-20 px-6 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-20"
            >
              <section className="relative h-[60vh] rounded-[3rem] overflow-hidden flex items-center justify-center text-center p-12">
                <img 
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1920" 
                  alt="Hero" 
                  className="absolute inset-0 w-full h-full object-cover brightness-50"
                  referrerPolicy="no-referrer"
                />
                <div className="relative z-10 space-y-6 max-w-3xl">
                  <motion.h1 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-5xl md:text-7xl font-headline font-black text-white tracking-tighter leading-none"
                  >
                    Executive Dining, <br /> Delivered to Your Desk.
                  </motion.h1>
                  <p className="text-white/80 text-lg md:text-xl font-medium">
                    Experience the finest curated meals from TiffinPro. Tailored for the modern professional.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <button 
                      onClick={() => setActiveTab('menu')}
                      className="bg-primary text-on-primary px-8 py-4 rounded-2xl font-headline font-bold text-lg hover:shadow-2xl transition-all active:scale-95"
                    >
                      Explore Menu
                    </button>
                    <button 
                      onClick={() => setActiveTab('subscriptions')}
                      className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-headline font-bold text-lg hover:bg-white/20 transition-all active:scale-95"
                    >
                      View Plans
                    </button>
                  </div>
                </div>
              </section>

              <section className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Sparkles, title: "Curated Nutrition", desc: "Chef-crafted meals balanced for energy and focus throughout your workday." },
                  { icon: Clock, title: "Seamless Delivery", desc: "Punctual delivery to your office or home, exactly when you need it." },
                  { icon: Leaf, title: "Eco-Friendly", desc: "Sustainable packaging options that care for the planet as much as your palate." }
                ].map((feature, i) => (
                  <div key={i} className="bg-surface-container-low p-8 rounded-3xl space-y-4 border border-outline-variant/10">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <feature.icon size={24} />
                    </div>
                    <h3 className="text-xl font-headline font-bold text-primary">{feature.title}</h3>
                    <p className="text-secondary text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </section>
            </motion.div>
          )}

          {activeTab === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              {/* Sidebar / Filter Bar */}
              <aside className="mb-8">
                <div className="flex flex-col items-center space-y-8">
                  <div className="text-center space-y-2">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary uppercase tracking-[0.2em]"
                    >
                      <Sparkles size={12} />
                      iOS 26 Liquid Engine
                    </motion.div>
                    <h3 className="text-2xl font-headline font-black text-primary tracking-tight">Curated Selection</h3>
                  </div>
                  
                  <div className="relative p-1.5 bg-black/90 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center gap-1 border border-white/10">
                    {/* Liquid Background Layer */}
                    <div className="absolute inset-0 pointer-events-none" style={{ filter: 'url(#goo)' }}>
                      {/* Hover Ghost Pill */}
                      {hovered && hovered !== filter && (
                        <motion.div
                          layoutId="hover-pill"
                          className="absolute h-[calc(100%-12px)] bg-on-surface/10 rounded-full"
                          style={{
                            width: hovered === 'all' ? '68px' : hovered === 'veg' ? '74px' : hovered === 'non-veg' ? '110px' : '98px',
                            left: hovered === 'all' ? '6px' : hovered === 'veg' ? '76px' : hovered === 'non-veg' ? '152px' : '264px',
                            top: '6px'
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                      
                      {/* Active Pill */}
                      {[
                        { id: 'all' },
                        { id: 'veg' },
                        { id: 'non-veg' },
                        { id: 'protein' },
                      ].map((item) => (
                        filter === item.id && (
                          <motion.div
                            key="liquid-bg"
                            layoutId="liquid-pill"
                            className={cn(
                              "absolute h-[calc(100%-12px)] rounded-full transition-colors duration-500",
                              getFilterColor(filter)
                            )}
                            style={{
                              width: filter === 'all' ? '68px' : filter === 'veg' ? '74px' : filter === 'non-veg' ? '110px' : '98px',
                              left: filter === 'all' ? '6px' : filter === 'veg' ? '76px' : filter === 'non-veg' ? '152px' : '264px',
                              top: '6px'
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 250,
                              damping: 25,
                              mass: 0.6
                            }}
                          />
                        )
                      ))}
                    </div>

                    {/* Foreground Buttons */}
                    {[
                      { id: 'all', label: 'All', icon: Utensils },
                      { id: 'veg', label: 'Veg', icon: Leaf },
                      { id: 'non-veg', label: 'Non-Veg', icon: Beef },
                      { id: 'protein', label: 'Protein', icon: Dumbbell },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setFilter(item.id)}
                        onMouseEnter={() => setHovered(item.id)}
                        onMouseLeave={() => setHovered(null)}
                        className={cn(
                          "relative px-7 py-3.5 rounded-full font-headline font-bold text-xs transition-all duration-500 flex items-center gap-2.5 z-10",
                          filter === item.id ? "text-surface" : "text-white/50 hover:text-white"
                        )}
                      >
                        <motion.div
                          animate={filter === item.id ? { 
                            scale: [1, 1.3, 1],
                            rotate: [0, 10, -10, 0]
                          } : { scale: 1, rotate: 0 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                          <item.icon size={18} />
                        </motion.div>
                        <span className="whitespace-nowrap tracking-tight">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Full Menu Grid */}
              <section className="space-y-8">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="font-headline font-bold text-2xl text-primary">Explore Our Menu</h2>
                    <p className="text-sm text-secondary">Showing {filteredMeals.length} executive dishes based on your preference.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMeals.map((meal, i) => (
                    <motion.div
                      key={meal.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: (i % 6) * 0.05 }}
                      onClick={() => setSelectedMeal(meal)}
                      className={cn(
                        "group bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/10 hover:shadow-xl transition-all cursor-pointer",
                        selectedMeal?.id === meal.id ? "ring-2 ring-primary" : ""
                      )}
                    >
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={meal.image} 
                          alt={meal.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md",
                            meal.type === 'veg' ? "bg-emerald-500/20 text-emerald-100" : "bg-rose-500/20 text-rose-100"
                          )}>
                            {meal.type}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-headline font-bold text-primary group-hover:text-on-tertiary-container transition-colors">
                            {meal.title}
                          </h3>
                          <span className="font-headline font-black text-primary">₹{meal.price}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {meal.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest">
                              #{tag.replace(/\s+/g, '')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'subscriptions' && (
            <motion.div
              key="subscriptions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-12"
            >
              {/* Header */}
              <section className="space-y-3">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-6xl font-headline font-black text-primary tracking-tighter leading-none"
                >
                  Customize Your Plan
                </motion.h1>
                <p className="text-secondary max-w-2xl text-lg">
                  Tailor your culinary experience. Choose your schedule, frequency, and preview the executive menu curated for your workspace.
                </p>
              </section>

              {/* Plan Tiers */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-on-tertiary-container">
                  <ShoppingBag size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Select Your Tier</span>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { id: 'essential', title: 'Essential Plan', price: '999', desc: 'Standard professional meals with eco-friendly packaging.', color: 'border-primary' },
                    { id: 'elite', title: 'Elite Plan', price: '5000', desc: 'Premium glass-packaged meals with priority support and weekly desserts.', color: 'border-on-tertiary-container' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setPlanTier(tier.id as any)}
                      className={cn(
                        "p-8 rounded-[2rem] text-left transition-all border-2 flex flex-col justify-between h-full group",
                        planTier === tier.id 
                          ? `${tier.color} bg-surface-container-lowest shadow-2xl scale-[1.02]` 
                          : "border-transparent bg-surface-container-low hover:bg-surface-container"
                      )}
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className={cn("text-2xl font-headline font-black", planTier === tier.id ? "text-primary" : "text-secondary")}>
                            {tier.title}
                          </h3>
                          {planTier === tier.id && <CheckCircle2 className="text-primary" size={24} />}
                        </div>
                        <p className="text-sm text-secondary leading-relaxed">{tier.desc}</p>
                      </div>
                      <div className="mt-8">
                        <p className="text-[10px] uppercase tracking-widest text-secondary/60">Starts from</p>
                        <p className={cn("text-3xl font-headline font-black", planTier === tier.id ? "text-primary" : "text-secondary")}>
                          ₹{tier.price}<span className="text-sm font-normal opacity-60">/mo</span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Configuration Cards */}
              <section className="grid md:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest p-8 rounded-3xl food-card-shadow border border-outline-variant/10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-primary">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h2 className="font-headline font-bold text-lg">Meal Timing</h2>
                      <p className="text-xs text-secondary">Select your delivery windows</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { id: 'lunch', label: 'Lunch Delivery', time: '12:30 PM - 1:30 PM' },
                      { id: 'dinner', label: 'Dinner Delivery', time: '7:30 PM - 8:30 PM' },
                    ].map((slot) => (
                      <label 
                        key={slot.id}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border-2",
                          deliveryType[slot.id as keyof typeof deliveryType] 
                            ? "bg-primary-container/5 border-primary" 
                            : "bg-surface-container-low border-transparent hover:bg-surface-container"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={deliveryType[slot.id as keyof typeof deliveryType]}
                            onChange={() => setDeliveryType(prev => ({ ...prev, [slot.id]: !prev[slot.id as keyof typeof deliveryType] }))}
                            className="w-5 h-5 rounded border-outline text-primary focus:ring-primary"
                          />
                          <span className="font-bold text-on-surface">{slot.label}</span>
                        </div>
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-surface-container-low/50 px-2 py-1 rounded-lg">{slot.time}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-8 rounded-3xl food-card-shadow border border-outline-variant/10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h2 className="font-headline font-bold text-lg">Delivery Frequency</h2>
                      <p className="text-xs text-secondary">How often should we deliver?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { val: 5, label: 'Days / Week', sub: 'Mon - Fri' },
                      { val: 7, label: 'Days / Week', sub: 'Full Week' },
                    ].map((freq) => (
                      <button
                        key={freq.val}
                        onClick={() => setFrequency(freq.val)}
                        className={cn(
                          "flex flex-col items-center justify-center p-6 rounded-2xl transition-all border-2",
                          frequency === freq.val 
                            ? "bg-primary text-white border-primary shadow-lg scale-[1.02]" 
                            : "bg-surface-container-low border-transparent hover:bg-surface-container text-secondary"
                        )}
                      >
                        <span className="text-4xl font-headline font-black">{freq.val}</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{freq.label}</span>
                        <span className={cn("text-[10px] mt-1 opacity-60", frequency === freq.val ? "text-white" : "text-secondary")}>{freq.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* AI Previewer */}
              <MealPreviewer />

              {/* Checkout CTA */}
              <section className="tech-gradient p-10 rounded-[3rem] text-on-primary flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-on-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10 space-y-2">
                  <h2 className="text-3xl font-headline font-bold">Ready for the concierge treatment?</h2>
                  <p className="text-on-primary/60 text-sm max-w-md">
                    Your {frequency}-day {planTier === 'essential' ? 'Essential' : 'Elite'} Plan starts at ₹{planTier === 'essential' ? '999' : '5,000'}/month. 
                    Includes {planTier === 'essential' ? 'doorstep delivery' : 'priority support and premium packaging'}.
                  </p>
                </div>
                
                <div className="relative z-10 flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-on-primary/40">Total Estimate</p>
                    <p className="text-4xl font-headline font-black tracking-tighter">₹{totalPrice.toLocaleString()}<span className="text-sm font-normal text-on-primary/40">/mo</span></p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmSubscription}
                    disabled={isSyncing}
                    className={cn(
                      "bg-on-tertiary-container text-on-primary px-10 py-5 rounded-2xl font-headline font-extrabold text-lg hover:shadow-xl transition-all flex items-center gap-2",
                      isSyncing && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isSyncing ? "Syncing..." : "Confirm Subscription"} <CheckCircle2 size={24} />
                  </motion.button>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low py-16 border-t border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="text-2xl font-headline font-black text-primary tracking-tighter">TiffinPro</div>
            <p className="text-xs text-secondary leading-relaxed">Redefining the corporate lunch experience with curated nutrition and seamless delivery for the modern Indian professional.</p>
          </div>
          
          <div className="space-y-6">
            <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-primary">Company</h4>
            <ul className="space-y-3 text-xs text-secondary">
              <li><button onClick={() => setActiveTab('home')} className="hover:text-primary transition-colors">Home</button></li>
              <li><button onClick={() => setActiveTab('menu')} className="hover:text-primary transition-colors">Menu</button></li>
              <li><button onClick={() => setActiveTab('subscriptions')} className="hover:text-primary transition-colors">Subscriptions</button></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-primary">Legal</h4>
            <ul className="space-y-3 text-xs text-secondary">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-headline font-bold text-xs uppercase tracking-widest text-primary">Newsletter</h4>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Work email" 
                className="flex-grow bg-surface-container-lowest border-none rounded-xl text-xs p-3 focus:ring-2 focus:ring-primary/20"
              />
              <button className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary-container transition-all">
                Join
              </button>
            </div>
            <p className="text-[10px] text-secondary/60">© 2024 TiffinPro Digital Concierge. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <ChatBot />

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogin(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-surface rounded-[2.5rem] p-10 shadow-2xl border border-outline-variant/20 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 tech-gradient" />
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-headline font-black text-primary tracking-tight">Access TiffinPro</h2>
                  <p className="text-secondary text-sm">Join the elite corporate lunch concierge</p>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-4 bg-surface-container-low border border-outline-variant/20 py-4 rounded-2xl font-headline font-bold hover:bg-surface-container transition-all active:scale-[0.98]"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                    Sign in with Google
                  </button>
                  
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/20"></div></div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold text-secondary bg-surface px-4">Secure Authentication</div>
                  </div>

                  <p className="text-[10px] text-center text-secondary leading-relaxed px-4">
                    By signing in, you agree to our Terms of Service and Privacy Policy. Your data is secured with enterprise-grade encryption.
                  </p>
                </div>

                {authError && (
                  <p className="text-rose-500 text-xs font-bold text-center bg-rose-500/10 p-3 rounded-xl">{authError}</p>
                )}

                <div className="text-center">
                  <button 
                    onClick={() => setShowLogin(false)}
                    className="text-xs font-bold text-secondary hover:text-primary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
