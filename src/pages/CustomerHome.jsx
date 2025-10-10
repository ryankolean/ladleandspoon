import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/services';
import { ShoppingCart, Soup, Sparkles, Heart, Clock, Truck } from 'lucide-react';

export default function CustomerHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.log('Not authenticated');
    }
  };

  const handleStartOrder = () => {
    if (user) {
      navigate('/order');
    } else {
      navigate('/login?redirect=/order');
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <section className="text-center py-12 md:py-20">
          <div className="relative inline-block mb-8">
            <div className="soup-bowl-icon animate-float steam-effect text-8xl md:text-9xl">
              🍲
            </div>
            <div className="absolute -top-4 -right-4 animate-bounce-soft">
              <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-[#FFE66D]" fill="#FFE66D" />
            </div>
            <div className="absolute -bottom-2 -left-4 animate-bounce-soft" style={{ animationDelay: '0.5s' }}>
              <Heart className="w-6 h-6 md:w-10 md:h-10 text-[#FF6B6B]" fill="#FF6B6B" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[#2D3748] text-shadow-sm">
            Welcome to <span className="gradient-text">Ladle & Spoon</span>
          </h1>

          <p className="text-xl md:text-2xl text-[#4A5568] mb-4 font-medium max-w-2xl mx-auto">
            Homemade soups & baked goods delivered fresh to your door
          </p>

          <p className="text-lg md:text-xl text-[#4A5568] mb-12 max-w-xl mx-auto">
            Order today, enjoy tomorrow. Made with love, delivered with care.
          </p>

          <button
            onClick={handleStartOrder}
            className="btn-primary text-xl md:text-2xl inline-flex items-center gap-3 animate-pulse-glow"
          >
            <ShoppingCart className="w-6 h-6 md:w-8 md:h-8" />
            Start Your Order
          </button>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 py-12">
          <div className="card-whimsy p-8 text-center hover-lift">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#65DBFF] to-[#8EFFE4] rounded-full mb-6 shadow-lg">
              <Soup className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#2D3748] mb-3">Fresh Daily</h3>
            <p className="text-[#4A5568] text-lg">
              Made fresh every morning with locally sourced ingredients and family recipes
            </p>
          </div>

          <div className="card-whimsy p-8 text-center hover-lift">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FFE66D] to-[#FF6B6B] rounded-full mb-6 shadow-lg">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#2D3748] mb-3">Order Ahead</h3>
            <p className="text-[#4A5568] text-lg">
              Place your order today for next-day delivery. Perfect for busy schedules
            </p>
          </div>

          <div className="card-whimsy p-8 text-center hover-lift">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FF6B6B] to-[#FFE66D] rounded-full mb-6 shadow-lg">
              <Truck className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#2D3748] mb-3">We Deliver</h3>
            <p className="text-[#4A5568] text-lg">
              Fast, reliable delivery right to your doorstep. Free for orders over $30
            </p>
          </div>
        </section>

        <section className="py-12 text-center">
          <div className="card-whimsy p-12 md:p-16 bg-gradient-to-r from-[#D2F3F8] via-[#B6FFE0] to-[#D2F3F8]">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2D3748] mb-6">
              Today's Specials
            </h2>
            <p className="text-xl text-[#4A5568] mb-8 max-w-2xl mx-auto">
              Check out our rotating menu of seasonal soups and fresh-baked treats
            </p>
            <button
              onClick={handleStartOrder}
              className="btn-secondary text-lg inline-flex items-center gap-2"
            >
              View Menu
              <span className="text-2xl">🍜</span>
            </button>
          </div>
        </section>

        <section className="py-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2D3748] mb-12">
            What Our Customers Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card-whimsy p-6 hover-lift">
              <div className="flex gap-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-[#4A5568] mb-4 italic">
                "Best soup I've ever had! The delivery is always on time and the portions are generous."
              </p>
              <p className="font-semibold text-[#2D3748]">- Sarah M.</p>
            </div>

            <div className="card-whimsy p-6 hover-lift">
              <div className="flex gap-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-[#4A5568] mb-4 italic">
                "The baked goods are amazing! Feels like grandma's cooking delivered right to my door."
              </p>
              <p className="font-semibold text-[#2D3748]">- Michael R.</p>
            </div>

            <div className="card-whimsy p-6 hover-lift">
              <div className="flex gap-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-[#4A5568] mb-4 italic">
                "Perfect for busy weeknights. Delicious, healthy, and so convenient!"
              </p>
              <p className="font-semibold text-[#2D3748]">- Emily K.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
