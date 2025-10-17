import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/services';
import { ShoppingCart, Sparkles, Heart } from 'lucide-react';

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
              <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-[#E6B85C]" fill="#E6B85C" />
            </div>
            <div className="absolute -bottom-2 -left-4 animate-bounce-soft" style={{ animationDelay: '0.5s' }}>
              <Heart className="w-6 h-6 md:w-10 md:h-10 text-[#F56949]" fill="#F56949" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[#8B4513] text-shadow-sm">
            Welcome to <span className="gradient-text">Ladle &amp; Spoon</span>
          </h1>

          <p className="text-xl md:text-2xl text-[#654321] mb-4 font-medium max-w-2xl mx-auto">
            Homemade soups &amp; baked goods delivered fresh to your door
          </p>

          <p className="text-lg md:text-xl text-[#654321] mb-12 max-w-xl mx-auto">
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

        <section className="py-12 text-center">
          <div className="card-whimsy p-12 md:p-16 bg-gradient-to-r from-[#FEC37D] via-[#E6B85C] to-[#FEC37D]">
            <h2 className="text-4xl md:text-5xl font-bold text-[#8B4513] mb-6">
              Today's Specials
            </h2>
            <p className="text-xl text-[#654321] mb-8 max-w-2xl mx-auto">
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
          <h2 className="text-3xl md:text-4xl font-bold text-[#8B4513] mb-12">
            What Our Customers Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card-whimsy p-6 hover-lift">
              <div className="flex gap-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-[#654321] mb-4 italic">
                "The French Onion soup is absolutely incredible! Rich, flavorful, and the cheese is perfectly melted. Best soup in Waterford!"
              </p>
              <p className="font-semibold text-[#8B4513]">- Jennifer L.</p>
            </div>

            <div className="card-whimsy p-6 hover-lift">
              <div className="flex gap-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-[#654321] mb-4 italic">
                "Love ordering from Ladle & Spoon! The soups are homemade quality and the delivery is always right on time. My family's new favorite!"
              </p>
              <p className="font-semibold text-[#8B4513]">- Mike T.</p>
            </div>

            <div className="card-whimsy p-6 hover-lift">
              <div className="flex gap-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-[#654321] mb-4 italic">
                "Amazing food and wonderful service! The baked goods are fresh and delicious. So happy to have this in our community!"
              </p>
              <p className="font-semibold text-[#8B4513]">- Sarah M.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
