"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import ThemeToggle from "./components/ThemeToggle";

const fallbackMenuItems = [
  { id: 1, name: "Crispy Fried Chicken (2pcs)", category: "Chicken", price: "$2.20", numericPrice: 2.20, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600&auto=format&fit=crop", desc: "Golden, crunchy, and juicy inside." },
  { id: 2, name: "Spicy Zinger Burger", category: "Burger", price: "$3.50", numericPrice: 3.50, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop", desc: "Spicy crispy chicken with fresh lettuce." },
  { id: 3, name: "French Fries (Large)", category: "Snacks", price: "$1.70", numericPrice: 1.70, image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=600&auto=format&fit=crop", desc: "Perfectly salted crispy potato fries." },
  { id: 4, name: "Ice Cold Cola", category: "Drinks", price: "$1.00", numericPrice: 1.00, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop", desc: "Chilled refreshing beverage." },
  { id: 5, name: "Hot Wings (6pcs)", category: "Chicken", price: "$3.80", numericPrice: 3.80, image: "https://images.unsplash.com/photo-1569691899455-88464f6d3ab1?q=80&w=600&auto=format&fit=crop", desc: "Spicy and tangy buffalo wings." },
  { id: 6, name: "Beef Cheese Burger", category: "Burger", price: "$4.20", numericPrice: 4.20, image: "https://images.unsplash.com/photo-1586816001966-79b736744398?q=80&w=600&auto=format&fit=crop", desc: "Juicy beef patty with melted cheese." },
  { id: 7, name: "Chicken Nuggets (10pcs)", category: "Snacks", price: "$2.50", numericPrice: 2.50, image: "https://images.unsplash.com/photo-1562967914-01efa7e87832?q=80&w=600&auto=format&fit=crop", desc: "Bite-sized crispy chicken pieces." },
  { id: 8, name: "Strawberry Shake", category: "Drinks", price: "$2.00", numericPrice: 2.00, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop", desc: "Thick and creamy strawberry delight." },
];

type Slide = { id: number; badge: string; title: string; subtitle: string; description: string; cta_text: string; image_url: string; gradient: string };
const fallbackSlides: Slide[] = [
  { id: 1, badge: "Hot Deal", title: "Signature\nFried Chicken", subtitle: "20% Extra Pieces Today Only", description: "Perfectly marinated, golden crispy and 100% fresh.", cta_text: "Order Now", image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1920&auto=format&fit=crop", gradient: "from-red-950/90 via-red-900/50" },
  { id: 2, badge: "New Arrival", title: "Spicy Double\nZinger Burger", subtitle: "Loaded with Cheese & Secret Sauce", description: "A towering masterpiece of spicy, crunchy chicken and melted cheese.", cta_text: "Try Now", image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1920&auto=format&fit=crop", gradient: "from-amber-950/90 via-amber-900/50" },
  { id: 3, badge: "Best Combo", title: "Fries & Drink\nCombo", subtitle: "Only $2.50 — Limited Time Offer", description: "Perfectly salted golden fries paired with a chilled refreshing drink.", cta_text: "Grab Deal", image_url: "https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=1920&auto=format&fit=crop", gradient: "from-orange-950/90 via-orange-900/50" },
];

const categories = ["All", "Chicken", "Burger", "Snacks", "Drinks"];

const testimonials = [
  { name: "Rashed K.", rating: 5, text: "The crispy chicken here is absolutely incredible. Best I've had in Sihanoukville! Service is always fast and staff are so friendly.", avatar: "R", color: "bg-red-600" },
  { name: "Sofia M.", rating: 5, text: "BFC is my go-to place every week. The zinger burger is out of this world and the fries are always perfectly crispy and hot.", avatar: "S", color: "bg-orange-500" },
  { name: "David T.", rating: 5, text: "Amazing food, great service, and unbeatable prices. I order from here at least twice a week — always reliable and delicious.", avatar: "D", color: "bg-blue-600" },
  { name: "Mina L.", rating: 5, text: "Best fried chicken in town, no contest! The portions are huge and prices are so affordable. I bring my family here every weekend.", avatar: "M", color: "bg-violet-600" },
  { name: "Kevin P.", rating: 5, text: "Honestly the nuggets here are better than any fast food chain. Crispy outside, juicy inside — perfectly seasoned every single time.", avatar: "K", color: "bg-emerald-600" },
  { name: "Anya R.", rating: 5, text: "The delivery is super fast and the food always arrives hot. The spicy zinger is my favourite — so much flavour in every bite!", avatar: "A", color: "bg-pink-600" },
  { name: "James W.", rating: 5, text: "Came in for a quick lunch and ended up ordering twice. The combo meal is insane value for money. Will definitely be back!", avatar: "J", color: "bg-amber-600" },
  { name: "Priya S.", rating: 5, text: "I was craving fried chicken at midnight and BFC was still open. Fresh food, kind staff — this place never disappoints me.", avatar: "P", color: "bg-cyan-600" },
  { name: "Tom H.", rating: 5, text: "The shake here is thick, creamy and absolutely delicious. My kids refuse to eat anywhere else now. BFC has ruined us!", avatar: "T", color: "bg-rose-600" },
];

type Deal = { id: number; title: string; description: string; price: string; badge: string; gradient: string };
const fallbackDeals: Deal[] = [
  { id: 1, title: "Family Feast", description: "4 pcs chicken + 2 burgers + 4 drinks", price: "$14.99", badge: "Save 30%", gradient: "from-red-600 to-red-800" },
  { id: 2, title: "Lunch Special", description: "1 burger + large fries + cold drink", price: "$5.50", badge: "11am–3pm", gradient: "from-orange-500 to-orange-700" },
  { id: 3, title: "Party Pack", description: "10 pcs chicken + 5 fries + 5 drinks", price: "$24.99", badge: "Best Value", gradient: "from-zinc-800 to-zinc-950" },
];

type MenuItem = { id: number; name: string; category: string; price: string; numericPrice: number; image: string; desc: string; discount?: number | null };
const effectivePrice = (item: { numericPrice: number; discount?: number | null }) =>
  item.discount ? item.numericPrice * (1 - item.discount / 100) : item.numericPrice;
type CartItem = MenuItem & { quantity: number };
type CheckoutForm = { name: string; phone: string; address: string; note: string };

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(fallbackMenuItems);
  const [deals, setDeals] = useState<Deal[]>(fallbackDeals);
  const [slides, setSlides] = useState<Slide[]>(fallbackSlides);
  const [menuLoading, setMenuLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({ title: "", sub: "", success: true });
  const [scrolled, setScrolled] = useState(false);
  const [reviewSet, setReviewSet] = useState(0);
  const [reviewVisible, setReviewVisible] = useState(true);
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [promoBanner, setPromoBanner] = useState(true);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({ name: "", phone: "", address: "", note: "" });

  useEffect(() => {
    async function fetchMenu() {
      try {
        const { data, error } = await supabase.from("products").select("*").order("id", { ascending: true });
        if (!error && data && data.length > 0) setMenuItems(data);
      } catch (_) { }
      setMenuLoading(false);
    }
    async function fetchDeals() {
      try {
        const { data, error } = await supabase.from("special_deals").select("*").eq("is_active", true).order("sort_order", { ascending: true });
        if (!error && data && data.length > 0) setDeals(data);
      } catch (_) { }
    }
    async function fetchSlides() {
      try {
        const { data, error } = await supabase.from("hero_slides").select("*").eq("is_active", true).order("sort_order", { ascending: true });
        if (!error && data && data.length > 0) setSlides(data);
      } catch (_) { }
    }
    fetchMenu();
    fetchDeals();
    fetchSlides();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 5500);
    const totalSets = Math.ceil(testimonials.length / 3);
    const r = setInterval(() => {
      setReviewVisible(false);
      setTimeout(() => {
        setReviewSet(p => (p + 1) % totalSets);
        setReviewVisible(true);
      }, 400);
    }, 4000);
    return () => { clearInterval(t); clearInterval(r); };
  }, [slides.length]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const filteredItems = menuItems.filter(item => {
    const catOk = activeCategory === "All" || item.category === activeCategory;
    const searchOk = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return catOk && searchOk;
  });

  const toast = useCallback((title: string, sub: string, success = true) => {
    setToastData({ title, sub, success });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
    toast("Added to cart!", item.name);
  }, [toast]);

  const buyNow = (item: MenuItem) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id);
      if (ex) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item;
      const qty = item.quantity + delta;
      return qty > 0 ? { ...item, quantity: qty } : item;
    }));
  };

  const removeItem = (id: number) => setCart(prev => prev.filter(i => i.id !== id));

  const cartTotal = cart.reduce((s, i) => s + effectivePrice(i) * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOrderPlacing(true);
    try {
      const { error } = await supabase.from("orders").insert([{
        customer_name: checkoutForm.name,
        customer_phone: checkoutForm.phone,
        delivery_address: checkoutForm.address,
        note: checkoutForm.note,
        payment_method: "Cash on Delivery (COD)",
        items: cart,
        total_amount: cartTotal,
        status: "Pending",
      }]);
      if (error) throw error;
      setIsCheckoutOpen(false);
      setCart([]);
      setCheckoutForm({ name: "", phone: "", address: "", note: "" });
      toast("Order Placed Successfully!", "Your food is being prepared now.", true);
    } catch {
      toast("Order Failed", "Please try again or call us.", false);
    } finally {
      setOrderPlacing(false);
    }
  };

  const scrollTo = (id: string) => {
    setIsMobileNavOpen(false);
    if (id === "") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const bannerOffset = promoBanner ? "top-8" : "top-0";

  return (
    <main className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 overflow-x-hidden">

      {/* Promo Banner */}
      {promoBanner && (
        <div className="relative bg-zinc-900 text-white text-center py-2 px-10 text-xs font-semibold z-[90] tracking-wide">
          <span>Free delivery on orders over <strong>$10</strong> — Today Only!</span>
          <button onClick={() => setPromoBanner(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-base leading-none transition-colors">✕</button>
        </div>
      )}

      {/* Navbar */}
      <nav className={`fixed ${bannerOffset} left-0 w-full z-[80] transition-all duration-500 ${scrolled ? "bg-white/90 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-lg shadow-black/5 dark:shadow-black/30 border-b border-gray-100/80 dark:border-zinc-800 py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-3">
          <button onClick={() => setIsMobileNavOpen(true)} className="p-2 bg-white/80 backdrop-blur-md rounded-xl border border-gray-200/60 text-gray-700 md:hidden active:scale-95 transition-transform shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-red-600 text-white px-3 py-1.5 rounded-xl font-black text-lg md:text-2xl tracking-tighter shadow-md shadow-red-600/30 group-hover:shadow-red-600/50 transition-shadow">BFC</div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Restaurant</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">& Cafe</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
            <button onClick={() => scrollTo("about")} className="hover:text-red-600 transition-colors">About</button>
            <button onClick={() => scrollTo("menu-section")} className="hover:text-red-600 transition-colors">Menu</button>
            <button onClick={() => scrollTo("contact")} className="hover:text-red-600 transition-colors">Contact</button>
          </div>

          <ThemeToggle className="text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700" />

          <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 bg-white rounded-full border border-gray-100 text-gray-700 hover:text-red-600 hover:border-red-100 transition-all shadow-sm active:scale-95 group">
            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-black rounded-full shadow-sm flex items-center justify-center" style={{ minWidth: "18px", minHeight: "18px", padding: "0 3px" }}>{cartCount}</span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Drawer */}
      <div className={`fixed inset-0 z-[150] md:hidden transition-all duration-500 ${isMobileNavOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)} />
        <div className={`absolute inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col transition-transform duration-500 ease-out ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 text-white px-2.5 py-1 rounded-lg font-black text-lg tracking-tighter">BFC</div>
              <span className="font-black text-sm uppercase tracking-widest text-gray-800">Navigation</span>
            </div>
            <button onClick={() => setIsMobileNavOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-500 active:scale-95">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <nav className="flex-1 p-5 space-y-1">
            {[["Home", ""], ["About Us", "about"], ["Our Menu", "menu-section"], ["Contact Us", "contact"]].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="w-full text-left px-4 py-3.5 text-sm font-bold text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">{label}</button>
            ))}
          </nav>
          <div className="p-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium">© 2026 BFC Restaurant & Cafe</p>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative w-full min-h-screen flex items-center overflow-hidden">
        {slides.map((slide, i) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === currentSlide ? "opacity-100" : "opacity-0"}`}>
            <div
              className={`absolute inset-0 bg-cover bg-center ${i === currentSlide ? "animate-[kenburns_22s_linear_infinite]" : ""}`}
              style={{ backgroundImage: `url(${slide.image_url})` }}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} to-transparent`} />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent" />
          </div>
        ))}

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 pt-36 pb-24">
          {slides.map((slide, i) => (
            <div key={slide.id} className={`max-w-xl transition-all duration-1000 ease-out ${i === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 absolute pointer-events-none"}`}>
              {slide.badge && (
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[11px] font-bold tracking-widest uppercase mb-6 animate-[float_3s_ease-in-out_infinite]">
                  {slide.badge}
                </span>
              )}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.92] tracking-tight drop-shadow-2xl mb-4 whitespace-pre-line">
                {slide.title}
              </h1>
              {slide.subtitle && <p className="text-base md:text-lg font-bold text-red-400 mb-2">{slide.subtitle}</p>}
              {slide.description && <p className="text-sm text-gray-300 mb-9 leading-relaxed max-w-sm">{slide.description}</p>}
              <div className="flex flex-wrap gap-3">
                <button onClick={() => scrollTo("menu-section")} className="px-7 py-3.5 bg-red-600 text-white font-bold text-sm rounded-full hover:bg-red-500 shadow-[0_8px_30px_rgba(220,38,38,0.5)] hover:shadow-[0_12px_40px_rgba(220,38,38,0.65)] hover:-translate-y-0.5 active:scale-95 transition-all">
                  {slide.cta_text || "Order Now"}
                </button>
                <button onClick={() => scrollTo("about")} className="px-7 py-3.5 bg-white/10 backdrop-blur-md text-white font-bold text-sm rounded-full border border-white/25 hover:bg-white/20 transition-all active:scale-95">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? "w-8 bg-red-500" : "w-2 bg-white/30 hover:bg-white/60"}`} />
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-zinc-900 py-7">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-white/10">
          {[{ val: "50K+", label: "Orders Served" }, { val: "100%", label: "Fresh Ingredients" }, { val: "4.9 ★", label: "Customer Rating" }, { val: "24/7", label: "Always Open" }].map(s => (
            <div key={s.label} className="text-center px-4">
              <div className="text-2xl md:text-3xl font-black text-red-500">{s.val}</div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu-section" className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest block mb-2">Fresh & Delicious</span>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">Our Menu</h2>
          <p className="text-gray-500 mt-3 text-sm md:text-base max-w-md mx-auto">Every dish crafted with love and the finest fresh ingredients.</p>
        </div>

        {/* Search + Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" /></svg>
            <input type="text" placeholder="Search menu items..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all shadow-sm" />
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 border ${activeCategory === cat ? "bg-zinc-900 text-white border-zinc-900 shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {menuLoading
            ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-3 animate-pulse border border-gray-100">
                <div className="h-36 md:h-48 bg-gray-200 rounded-2xl mb-3" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded mb-4 w-3/4" />
                <div className="h-9 bg-gray-100 rounded-xl" />
              </div>
            ))
            : filteredItems.length === 0
              ? (
                <div className="col-span-full flex flex-col items-center py-20 text-gray-400">
                  <div className="text-6xl mb-4">🍽️</div>
                  <p className="font-bold text-lg">No items found</p>
                  <p className="text-sm mt-1">Try a different category or clear your search.</p>
                </div>
              )
              : filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100/80 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group flex flex-col">
                  <div className="relative h-36 md:h-48 rounded-2xl overflow-hidden bg-gray-100 mb-3 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[9px] font-black uppercase px-2 py-0.5 rounded-lg text-gray-700 shadow-sm border border-gray-100">{item.category}</div>
                    {item.discount ? (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-md shadow-red-600/30 leading-none">{item.discount}% OFF</div>
                    ) : null}
                  </div>
                  <div className="flex flex-col flex-1 px-1">
                    <h3 className="text-sm md:text-base font-black text-gray-900 leading-snug line-clamp-2 mb-1 group-hover:text-red-600 transition-colors">{item.name}</h3>
                    <p className="text-[10px] md:text-xs text-gray-400 line-clamp-2 mb-3 flex-1 leading-relaxed">{item.desc}</p>
                    <div className="flex items-center justify-between mb-3">
                      {item.discount ? (
                        <div className="flex flex-col leading-none gap-0.5">
                          <span className="text-[11px] text-gray-400 line-through font-semibold">{item.price}</span>
                          <span className="text-lg md:text-xl font-black text-red-600">${effectivePrice(item).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-lg md:text-xl font-black text-gray-900 group-hover:text-red-600 transition-colors">{item.price}</span>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => addToCart(item)} className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 text-[10px] md:text-xs font-bold rounded-xl border border-gray-200 transition-all active:scale-95">
                        + Add
                      </button>
                      <button onClick={() => buyNow(item)} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] md:text-xs font-bold rounded-xl transition-all active:scale-95 shadow-sm shadow-red-600/25">
                        Order
                      </button>
                    </div>
                  </div>
                </div>
              ))
          }
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-14 px-4 md:px-8 bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-7">
            <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tight">Special Deals</h3>
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Limited Time</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deals.map(deal => (
              <button key={deal.id} onClick={() => scrollTo("menu-section")} className={`bg-gradient-to-br ${deal.gradient} rounded-2xl p-6 text-white text-left relative overflow-hidden group active:scale-[0.98] transition-transform w-full`}>
                {deal.badge && <span className="absolute top-4 right-4 text-[10px] font-black uppercase bg-white/15 px-2.5 py-1 rounded-full border border-white/20">{deal.badge}</span>}
                <h4 className="text-xl font-black mb-1">{deal.title}</h4>
                <p className="text-white/60 text-xs mb-4 leading-relaxed">{deal.description}</p>
                <p className="text-3xl font-black">{deal.price}</p>
                <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 md:py-28 bg-[#F8F9FA] dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-80 md:h-[500px]">
              <img src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop" alt="BFC Restaurant interior" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div className="absolute -bottom-5 -right-3 md:right-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center text-xl">🏆</div>
                <div>
                  <p className="font-black text-gray-900 text-sm leading-tight">Best Restaurant</p>
                  <p className="text-gray-400 text-xs">Sihanoukville 2025</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest block mb-3">Our Story</span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">About BFC Restaurant & Cafe</h2>
            <p className="text-gray-600 leading-relaxed mb-4 text-sm md:text-base">
              At BFC Restaurant, we believe food is not just about satisfying hunger — it is about creating a memorable experience. Our world-class chefs combine perfect cooking techniques with 100% fresh, locally sourced ingredients to deliver the crispiest fried chicken and juiciest burgers in Sihanoukville.
            </p>
            <p className="text-gray-600 leading-relaxed mb-9 text-sm md:text-base">
              Every recipe is crafted with care in a hygienic, state-of-the-art kitchen. Premium quality service and exceptional hospitality are at the heart of everything we do — from your first visit to your hundredth.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              {[{ val: "100%", label: "Fresh Food" }, { val: "Top", label: "Rated Chefs" }, { val: "24/7", label: "Service" }].map(s => (
                <div key={s.label}>
                  <p className="text-2xl md:text-4xl font-black text-red-600">{s.val}</p>
                  <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest block mb-2">Reviews</span>
            <h2 className="text-4xl font-black text-white">What Customers Say</h2>
            <p className="text-zinc-500 text-sm mt-2">{testimonials.length} happy customers</p>
          </div>

          {/* Rotating cards */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-5 transition-all duration-400"
            style={{ opacity: reviewVisible ? 1 : 0, transform: reviewVisible ? "translateY(0)" : "translateY(12px)" }}
          >
            {testimonials.slice(reviewSet * 3, reviewSet * 3 + 3).map(t => (
              <div key={t.name} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 hover:border-red-600/40 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => <span key={i} className="text-red-500 text-base">★</span>)}
                  </div>
                  <svg className="w-6 h-6 text-zinc-700 group-hover:text-red-900/50 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed mb-5 min-h-[72px]">{t.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                  <div className={`w-9 h-9 ${t.color} rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg`}>{t.avatar}</div>
                  <div>
                    <span className="font-bold text-white text-sm block">{t.name}</span>
                    <span className="text-zinc-600 text-[10px] font-semibold uppercase tracking-wider">Verified Customer</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators + manual nav */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, i) => (
              <button
                key={i}
                onClick={() => { setReviewVisible(false); setTimeout(() => { setReviewSet(i); setReviewVisible(true); }, 400); }}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === reviewSet ? "w-8 bg-red-500" : "w-2 bg-zinc-700 hover:bg-zinc-500"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0a0a0a 0%,#111111 50%,#1a0505 100%)" }}>
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #dc2626, transparent 70%)" }} />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #dc2626, transparent 70%)" }} />

        {/* Top quick-info bar */}
        <div className="border-b border-white/5 px-4 md:px-8 py-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {[
              { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", text: "Sihanoukville, Cambodia" },
              { icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", text: "+855 123 456 789" },
              { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", text: "Open 24 Hours · 7 Days" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-600/20 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                </div>
                <span className="text-zinc-400 text-xs font-semibold">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-block text-[10px] font-black text-red-500 uppercase tracking-[3px] bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full mb-4">Get In Touch</span>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-none mb-4">Contact <span className="text-red-600">Us</span></h2>
            <p className="text-zinc-500 text-sm md:text-base max-w-md mx-auto leading-relaxed">We love hearing from you. Reach out for orders, reservations, or just to say hello.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* LEFT — Info panel */}
            <div className="lg:col-span-2 flex flex-col gap-4">

              {/* Address */}
              <div className="rounded-2xl border border-white/8 p-6 flex items-start gap-4" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-600/20 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Our Location</p>
                  <p className="text-white font-bold text-sm leading-relaxed">BFC Restaurant & Cafe</p>
                  <p className="text-zinc-400 text-xs mt-0.5">Main Road, Sihanoukville, Cambodia</p>
                </div>
              </div>

              {/* Phone */}
              <div className="rounded-2xl border border-white/8 p-6 flex items-start gap-4" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-600/20 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Hotline & Booking</p>
                  <p className="text-white font-black text-lg leading-none">+855 123 456 789</p>
                  <p className="text-zinc-500 text-xs mt-1">Call or WhatsApp anytime</p>
                </div>
              </div>

              {/* Hours */}
              <div className="rounded-2xl border border-emerald-500/20 p-6 flex items-start gap-4" style={{ background: "rgba(16,185,129,0.06)" }}>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Opening Hours</p>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" /></span>
                    <span className="text-emerald-400 font-black text-sm">Open 24 Hours · 7 Days a Week</span>
                  </div>
                  <p className="text-zinc-600 text-xs mt-1">We never close. Come anytime.</p>
                </div>
              </div>

              {/* Social */}
              <div className="rounded-2xl border border-white/8 p-6" style={{ background: "rgba(255,255,255,0.04)" }}>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Follow Us</p>
                <div className="flex gap-3">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="group w-10 h-10 bg-blue-600/20 border border-blue-600/30 hover:bg-blue-600 rounded-xl flex items-center justify-center text-blue-400 hover:text-white transition-all active:scale-90">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="group w-10 h-10 bg-pink-600/20 border border-pink-600/30 hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400 rounded-xl flex items-center justify-center text-pink-400 hover:text-white transition-all active:scale-90">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                  </a>
                  <a href="https://t.me/bfc360restaurant" target="_blank" rel="noopener noreferrer" className="group w-10 h-10 bg-sky-500/20 border border-sky-500/30 hover:bg-sky-500 rounded-xl flex items-center justify-center text-sky-400 hover:text-white transition-all active:scale-90">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                  </a>
                  <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="group w-10 h-10 bg-white/10 border border-white/15 hover:bg-white rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all active:scale-90">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.264 5.638 5.9-5.638zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT — Message form */}
            <div className="lg:col-span-3 rounded-2xl border border-white/8 p-8 md:p-10 flex flex-col" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="mb-8">
                <h3 className="text-xl font-black text-white uppercase tracking-wide mb-1.5">Send a Message</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">Have questions, special requests, or want to book a table? We will get back to you within 24 hours.</p>
              </div>
              <form
                onSubmit={e => { e.preventDefault(); toast("Message Sent!", "We'll get back to you soon."); (e.target as HTMLFormElement).reset(); }}
                className="flex flex-col gap-5 flex-1"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Your Name</label>
                    <input required type="text" placeholder="e.g. John Smith" className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/60 focus:bg-white/8 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Email Address</label>
                    <input required type="email" placeholder="you@example.com" className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/60 focus:bg-white/8 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Phone Number</label>
                  <input type="tel" placeholder="+855 ..." className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/60 focus:bg-white/8 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Subject</label>
                  <select className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-red-500/60 transition-all appearance-none cursor-pointer">
                    <option value="" className="bg-zinc-900">General Inquiry</option>
                    <option value="reservation" className="bg-zinc-900">Table Reservation</option>
                    <option value="catering" className="bg-zinc-900">Catering Request</option>
                    <option value="order" className="bg-zinc-900">Order Question</option>
                    <option value="feedback" className="bg-zinc-900">Feedback</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Your Message</label>
                  <textarea required rows={4} placeholder="Tell us how we can help you..." className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/60 focus:bg-white/8 transition-all resize-none" />
                </div>
                <button type="submit" className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98] flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  Send Message
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-white py-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="bg-red-600 text-white px-2.5 py-1 rounded-lg font-black text-xl tracking-tighter">BFC</div>
                <span className="font-black uppercase tracking-widest text-sm">Restaurant & Cafe</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">The best fried chicken experience in Sihanoukville, Cambodia. Fresh, crispy, and always delicious.</p>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-widest text-[10px] text-zinc-600 mb-4">Quick Links</h4>
              <div className="space-y-2">
                {[["Home", ""], ["About Us", "about"], ["Our Menu", "menu-section"], ["Contact", "contact"]].map(([label, id]) => (
                  <button key={id} onClick={() => scrollTo(id)} className="block text-zinc-500 hover:text-white text-sm transition-colors text-left">{label}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-widest text-[10px] text-zinc-600 mb-4">Contact</h4>
              <div className="space-y-2.5 text-zinc-500 text-sm">
                <p>Main Road, Sihanoukville, Cambodia</p>
                <p>+855 123 456 789</p>
                <p>Open 24 Hours · 7 Days a Week</p>
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-900 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-zinc-700 text-xs">© 2026 BFC Restaurant & Cafe. All rights reserved.</p>
            <Link href="/admin" className="text-zinc-700 hover:text-zinc-400 text-xs transition-colors">Admin Panel →</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Cart FAB */}
      {cartCount > 0 && !isCheckoutOpen && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-50 animate-[slideUp_0.4s_ease-out]">
          <button onClick={() => setIsCartOpen(true)} className="w-full bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/80 text-white rounded-2xl p-4 flex items-center justify-between shadow-2xl active:scale-[0.98] transition-transform">
            <div className="text-left">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{cartCount} item{cartCount !== 1 ? "s" : ""} in cart</p>
              <p className="text-lg font-black">${cartTotal.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors">
              Checkout
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white flex flex-col shadow-2xl rounded-l-3xl overflow-hidden animate-[slideLeft_0.4s_cubic-bezier(0.25,1,0.5,1)]">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-black text-gray-900">Your Cart</h2>
                <p className="text-xs text-gray-400 mt-0.5">{cartCount} item{cartCount !== 1 ? "s" : ""} selected</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:text-red-600 transition-colors active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50">
              {cart.length === 0
                ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
                    <div className="text-5xl mb-3">🛒</div>
                    <p className="font-bold">Your cart is empty</p>
                    <p className="text-sm mt-1">Add items from the menu to get started.</p>
                  </div>
                )
                : cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{item.name}</h4>
                      <p className="text-red-600 font-black text-sm mt-0.5">${(effectivePrice(item) * item.quantity).toFixed(2)}</p>
                      <div className="flex items-center gap-1 mt-2 bg-gray-50 border border-gray-100 rounded-lg p-0.5 w-max">
                        <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 bg-white rounded-md font-bold text-gray-600 shadow-sm flex items-center justify-center text-sm border border-gray-100">-</button>
                        <span className="w-7 text-center text-xs font-black text-gray-800">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 bg-zinc-900 text-white rounded-md font-bold shadow-sm flex items-center justify-center text-sm">+</button>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-300 hover:text-red-600 transition-colors shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))
              }
            </div>

            {cart.length > 0 && (
              <div className="p-5 bg-white border-t border-gray-100 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 font-semibold text-sm">Total Amount</span>
                  <span className="text-2xl font-black text-gray-900">${cartTotal.toFixed(2)}</span>
                </div>
                <button onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }} className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm rounded-2xl transition-all shadow-lg active:scale-[0.98] uppercase tracking-widest">
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full h-full md:h-auto md:max-w-5xl bg-white md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row m-auto md:max-h-[90vh] animate-[scaleUp_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">

            {/* Mobile topbar */}
            <div className="md:hidden sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 shrink-0">
              <h2 className="font-black text-gray-900 text-base">Checkout</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-500 active:scale-95">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <button onClick={() => setIsCheckoutOpen(false)} className="hidden md:flex absolute top-5 right-5 z-10 p-2 bg-gray-50 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 transition-colors items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Order Summary Pane */}
            <div className="w-full md:w-[44%] bg-gray-50 p-6 md:p-8 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto" style={{ maxHeight: "45vh" }}>
              <h3 className="hidden md:block font-black text-xl text-gray-900 mb-5 uppercase tracking-wider">Order Summary</h3>
              <div className="flex-1 space-y-2 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-gray-900 truncate pr-2">{item.name}</p>
                      <p className="text-red-600 font-black text-xs mt-0.5">${(effectivePrice(item) * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-0.5 bg-gray-50 border border-gray-100 rounded-lg p-0.5 shrink-0">
                      <button type="button" onClick={() => updateQty(item.id, -1)} className="w-5 h-5 bg-white rounded text-xs font-bold text-gray-600 flex items-center justify-center border border-gray-100">-</button>
                      <span className="w-5 text-center text-[11px] font-black">{item.quantity}</span>
                      <button type="button" onClick={() => updateQty(item.id, 1)} className="w-5 h-5 bg-zinc-900 text-white rounded text-xs font-bold flex items-center justify-center">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 shrink-0">
                <div className="bg-zinc-900 text-white px-4 py-3.5 rounded-xl flex justify-between items-center">
                  <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Total Pay</span>
                  <span className="text-xl font-black">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Form Pane */}
            <div className="w-full md:w-[56%] p-6 md:p-8 bg-white overflow-y-auto" style={{ paddingBottom: "5rem" }}>
              <h3 className="hidden md:block font-black text-xl text-gray-900 mb-1 uppercase tracking-wider">Delivery Details</h3>
              <p className="hidden md:block text-gray-400 text-xs mb-6">Fill in your details to place the order.</p>
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Full Name *</label>
                    <input required type="text" placeholder="John Doe" value={checkoutForm.name} onChange={e => setCheckoutForm({ ...checkoutForm, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Phone Number *</label>
                    <input required type="tel" placeholder="+855 12 345 678" value={checkoutForm.phone} onChange={e => setCheckoutForm({ ...checkoutForm, phone: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Delivery Address / Table No. *</label>
                  <textarea required rows={2} placeholder="Table 5, or your full delivery address..." value={checkoutForm.address} onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Special Instructions</label>
                  <input type="text" placeholder="Extra sauce, no onions, allergens..." value={checkoutForm.note} onChange={e => setCheckoutForm({ ...checkoutForm, note: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Payment Method</label>
                  <div className="flex items-center gap-3 p-4 border-2 border-red-500 bg-red-50/30 rounded-xl">
                    <div className="w-4 h-4 rounded-full bg-red-600 border-4 border-red-100 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Cash on Delivery (COD)</p>
                      <p className="text-gray-400 text-xs mt-0.5">Pay when your order arrives</p>
                    </div>
                  </div>
                </div>
                <button type="submit" disabled={orderPlacing} className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/25 hover:-translate-y-0.5 active:scale-[0.98] transition-all uppercase tracking-wider">
                  {orderPlacing ? "Placing Order..." : `Confirm Order • $${cartTotal.toFixed(2)}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[300] animate-[toastIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
          <div className="bg-zinc-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-zinc-800" style={{ minWidth: "260px" }}>
            <div className={`w-8 h-8 ${toastData.success ? "bg-green-500" : "bg-red-600"} rounded-full flex items-center justify-center shrink-0`}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {toastData.success
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                }
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm">{toastData.title}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{toastData.sub}</p>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          @keyframes kenburns { 0% { transform: scale(1); } 100% { transform: scale(1.08); } }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes scaleUp { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes slideUp { from { transform: translate(-50%, 30px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
          @keyframes toastIn { from { transform: translate(-50%, 30px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        `
      }} />
      {/* Telegram Support Button */}
      <a
        href="https://t.me/bfc360restaurant"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-0 hover:gap-3 bg-sky-500 hover:bg-sky-400 text-white rounded-full shadow-xl shadow-sky-500/30 overflow-hidden transition-all duration-300 ease-out"
        style={{ padding: "12px" }}
      >
        {/* Telegram icon */}
        <svg className="w-6 h-6 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
        {/* Label — expands on hover */}
        <span className="max-w-0 group-hover:max-w-[120px] overflow-hidden whitespace-nowrap text-sm font-black transition-all duration-300 ease-out">
          Support
        </span>
      </a>

    </main>
  );
}
