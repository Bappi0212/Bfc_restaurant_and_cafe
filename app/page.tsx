"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

// রিয়েল ইমেজসহ মেনুর ডাটা
const menuItems = [
  { id: 1, name: "Crispy Fried Chicken (2pcs)", category: "Chicken", price: "$2.20", numericPrice: 2.20, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=600&auto=format&fit=crop", desc: "Golden, crunchy, and juicy inside." },
  { id: 2, name: "Spicy Zinger Burger", category: "Burger", price: "$3.50", numericPrice: 3.50, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop", desc: "Spicy crispy chicken with fresh lettuce." },
  { id: 3, name: "French Fries (Large)", category: "Snacks", price: "$1.70", numericPrice: 1.70, image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=600&auto=format&fit=crop", desc: "Perfectly salted crispy potato fries." },
  { id: 4, name: "Ice Cold Cola", category: "Drinks", price: "$1.00", numericPrice: 1.00, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop", desc: "Chilled refreshing beverage." },
  { id: 5, name: "Hot Wings (6pcs)", category: "Chicken", price: "$3.80", numericPrice: 3.80, image: "https://images.unsplash.com/photo-1569691899455-88464f6d3ab1?q=80&w=600&auto=format&fit=crop", desc: "Spicy and tangy buffalo wings." },
  { id: 6, name: "Beef Cheese Burger", category: "Burger", price: "$4.20", numericPrice: 4.20, image: "https://images.unsplash.com/photo-1586816001966-79b736744398?q=80&w=600&auto=format&fit=crop", desc: "Juicy beef patty with melted cheese." },
  { id: 7, name: "Chicken Nuggets (10pcs)", category: "Snacks", price: "$2.50", numericPrice: 2.50, image: "https://images.unsplash.com/photo-1562967914-01efa7e87832?q=80&w=600&auto=format&fit=crop", desc: "Bite-sized crispy chicken pieces." },
  { id: 8, name: "Strawberry Shake", category: "Drinks", price: "$2.00", numericPrice: 2.00, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600&auto=format&fit=crop", desc: "Thick and creamy strawberry delight." },
];

const sliderItems = [
  { id: 1, badge: "Hot Deal", title: "Signature Fried Chicken", subtitle: "20% Extra!", desc: "Perfectly marinated and 100% fresh.", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1200&auto=format&fit=crop" },
  { id: 2, badge: "New Arrival", title: "Spicy Double Zinger", subtitle: "Loaded with Cheese", desc: "Towering masterpiece of spicy chicken.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop" },
  { id: 3, badge: "Combo", title: "Fries & Drink", subtitle: "Only $2.50", desc: "Perfectly salted golden fries with drink.", image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=1200&auto=format&fit=crop" },
];

const categories = ["All", "Chicken", "Burger", "Snacks", "Drinks"];

type CartItem = { id: number; name: string; price: string; numericPrice: number; image: string; quantity: number };

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentSlide, setCurrentSlide] = useState(0);
  const directionRef = useRef(1);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev === sliderItems.length - 1) directionRef.current = -1;
        else if (prev === 0) directionRef.current = 1;
        return prev + directionRef.current;
      });
    }, 4500);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => { clearInterval(timer); window.removeEventListener("scroll", handleScroll); };
  }, []);

  const filteredItems = activeCategory === "All" ? menuItems : menuItems.filter(item => item.category === activeCategory);

  const addToCart = (item: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem);
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const buyNow = (item: any) => {
    addToCart(item);
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const updateCartQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = item.quantity + delta;
        return { ...item, quantity: nextQty > 0 ? nextQty : 1 };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => setCart(prev => prev.filter(item => item.id !== id));

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckoutModalOpen(false);
    setCart([]);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.numericPrice * item.quantity), 0);
  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    if (cart.length === 0 && isCheckoutModalOpen) setIsCheckoutModalOpen(false);
  }, [cart, isCheckoutModalOpen]);

  return (
    <main className="min-h-screen bg-gray-100 font-sans text-gray-800 relative overflow-x-hidden pb-20 md:pb-0">

      {/* 1. App-like Navbar */}
      <nav className={`fixed top-0 left-0 w-full z-[80] transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2 md:py-3' : 'bg-white/90 backdrop-blur-md shadow-sm py-3 md:py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex items-center justify-between">

          {/* Logo Section */}
          <Link href="/" className="flex items-center cursor-pointer">
            <div className="relative h-10 md:h-14 w-auto shrink-0 transition-transform duration-300 hover:scale-105">
              <Image
                src="/bfcLogo.png"
                alt="BFC Logo"
                width={200}
                height={60}
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>

          <div className="flex items-center">
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-800 hover:text-red-600 transition-colors">
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {totalCartItems > 0 && (
                <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-600 text-white text-[9px] md:text-[10px] font-black w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border border-white">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section - Mobile optimized */}
      <section className="relative w-full min-h-[40vh] md:min-h-[70vh] flex flex-col justify-center items-center overflow-hidden pt-16 md:pt-20 pb-6 md:pb-10">
        <div className="absolute inset-0 bg-black z-0"></div>
        {sliderItems.map((item, index) => (
          <div key={item.id} className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out z-0 ${index === currentSlide ? "opacity-60" : "opacity-0"}`} style={{ backgroundImage: `url(${item.image})` }}></div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-100 via-transparent to-transparent z-0"></div>

        <div className="relative z-10 w-full max-w-6xl px-4 md:px-8 mt-4 md:mt-10">
          <div className="relative h-[200px] md:h-[400px] w-full">
            {sliderItems.map((item, index) => (
              <div key={item.id} className={`absolute inset-0 w-full h-full flex flex-col justify-end p-4 md:p-10 transition-all duration-700 ease-in-out ${index === currentSlide ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-4 scale-95 pointer-events-none"}`}>
                <div className="bg-black/50 backdrop-blur-sm p-4 md:p-8 rounded-2xl w-full max-w-md border border-white/20">
                  <span className="bg-red-600 text-white px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-xs font-black uppercase tracking-widest inline-block mb-2 md:mb-3">{item.badge}</span>
                  <h3 className="text-lg md:text-4xl font-black text-white mb-1 md:mb-2 leading-tight">{item.title}</h3>
                  <p className="text-red-400 text-xs md:text-lg font-bold uppercase tracking-widest">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Menu Section - App Style Grid (2 cols on mobile) */}
      <section id="menu-section" className="py-6 md:py-16 px-3 md:px-12 max-w-7xl mx-auto">
        <div className="text-left md:text-center mb-6 md:mb-14 px-1">
          <h2 className="text-xl md:text-5xl font-black text-gray-900 tracking-tight uppercase">Featured Menu</h2>
        </div>

        {/* Scrollable Categories for Mobile App feel */}
        <div className="flex overflow-x-auto hide-scroll-bar gap-2 md:gap-4 mb-6 md:mb-12 pb-2 px-1">
          {categories.map((category) => (
            <button key={category} onClick={() => setActiveCategory(category)} className={`px-4 py-1.5 md:px-6 md:py-2.5 rounded-full font-bold transition-all duration-300 whitespace-nowrap text-[11px] md:text-sm uppercase tracking-wider ${activeCategory === category ? "bg-red-600 text-white shadow-md shadow-red-600/30" : "bg-white text-gray-600 border border-gray-200"}`}>
              {category}
            </button>
          ))}
        </div>

        {/* Responsive Grid: 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
          {filteredItems.map((item) => {
            return (
              <div key={item.id} className="bg-white rounded-2xl md:rounded-3xl p-2.5 md:p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-100">
                <div className="w-full h-28 md:h-48 rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-5 relative bg-gray-50">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex flex-col flex-grow px-1">
                  <h3 className="text-[12px] md:text-lg font-extrabold text-gray-900 mb-1 leading-tight line-clamp-2">{item.name}</h3>
                  <p className="text-[9px] md:text-sm text-gray-400 mb-2 md:mb-4 flex-grow line-clamp-1 md:line-clamp-2">{item.desc}</p>

                  <div className="flex items-center justify-between mb-3 md:mb-5">
                    <span className="text-sm md:text-2xl font-black text-red-600">{item.price}</span>
                  </div>

                  {/* App Style Buttons */}
                  <div className="flex flex-col sm:flex-row gap-1.5 md:gap-3 mt-auto">
                    <button onClick={() => addToCart(item)} className="w-full py-1.5 md:py-3 bg-gray-100 text-gray-800 text-[9px] md:text-xs font-bold uppercase rounded-lg md:rounded-xl hover:bg-gray-200 transition-colors">
                      Add
                    </button>
                    <button onClick={() => buyNow(item)} className="w-full py-1.5 md:py-3 bg-red-600 text-white text-[9px] md:text-xs font-bold uppercase rounded-lg md:rounded-xl hover:bg-red-700 transition-colors shadow-sm">
                      Order
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Floating Bottom Navigation / Cart Bar (Mobile App Style) */}
      {cart.length > 0 && !isCheckoutModalOpen && (
        <div className="fixed bottom-0 left-0 w-full md:hidden bg-white border-t border-gray-200 shadow-[0_-5px_10px_rgba(0,0,0,0.05)] z-50 p-3 px-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 font-bold uppercase">{totalCartItems} items</span>
            <span className="text-base font-black text-gray-900">${cartTotal.toFixed(2)}</span>
          </div>
          <button onClick={() => { setIsCartOpen(false); setIsCheckoutModalOpen(true); }} className="px-6 py-2.5 bg-red-600 text-white font-black text-sm uppercase rounded-xl shadow-md">
            View Cart
          </button>
        </div>
      )}

      {/* Modals & Drawers (Kept same as before, they are already responsive) */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-6 overflow-y-auto bg-gray-100 md:bg-black/70 md:backdrop-blur-sm">
          <div className="relative w-full h-full md:h-auto md:max-w-5xl bg-white md:rounded-[2rem] overflow-hidden md:shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row m-auto md:max-h-[90vh]">

            {/* Mobile Header for Checkout */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100">
              <h2 className="text-lg font-black uppercase tracking-wider">Checkout</h2>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <button onClick={() => setIsCheckoutModalOpen(false)} className="hidden md:block absolute top-4 right-4 z-10 bg-gray-100 p-2 rounded-full text-gray-600 hover:text-red-600 hover:bg-gray-200"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>

            <div className="w-full md:w-5/12 bg-gray-50 p-5 md:p-10 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto">
              <h2 className="hidden md:block text-2xl font-black text-gray-900 mb-6 uppercase tracking-widest">Order Summary</h2>
              <div className="flex-1 space-y-3 mb-6 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h4 className="text-xs md:text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-black text-sm md:text-base text-red-600">${(item.numericPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 mt-auto">
                <div className="flex justify-between items-center bg-gray-900 text-white p-3 md:p-4 rounded-xl shadow-md">
                  <span className="font-bold text-sm uppercase tracking-wider">Total</span>
                  <span className="text-lg md:text-2xl font-black">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-7/12 p-5 md:p-10 bg-white overflow-y-auto pb-24 md:pb-10">
              <h2 className="hidden md:block text-2xl font-black text-gray-900 mb-2 uppercase tracking-widest">Delivery Details</h2>
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-600 uppercase mb-1.5">Full Name</label>
                    <input required type="text" placeholder="John Doe" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-red-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-bold text-gray-600 uppercase mb-1.5">Phone</label>
                    <input required type="tel" placeholder="+855 123..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-red-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-bold text-gray-600 uppercase mb-1.5">Address / Table</label>
                  <textarea required rows={2} placeholder="Table 5 or address..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-1 focus:ring-red-500"></textarea>
                </div>
                <button type="submit" className="w-full py-3.5 md:py-4 mt-4 bg-red-600 text-white rounded-xl font-black text-sm md:text-lg tracking-widest uppercase shadow-lg shadow-red-600/30">
                  Confirm Order
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed top-10 md:top-auto md:bottom-5 left-1/2 transform -translate-x-1/2 z-[300] w-[90%] md:w-auto">
          <div className="bg-gray-900 text-white px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl shadow-2xl flex items-center space-x-3 md:space-x-4 border border-gray-800">
            <div className="bg-green-500 rounded-full p-1 md:p-1.5 shrink-0"><svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
            <div>
              <h4 className="font-bold text-xs md:text-sm tracking-wide">Order Successful!</h4>
              <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">Food is being prepared.</p>
            </div>
          </div>
        </div>
      )}

      {/* Global Style for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scroll-bar::-webkit-scrollbar { display: none; }
        .hide-scroll-bar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </main>
  );
}