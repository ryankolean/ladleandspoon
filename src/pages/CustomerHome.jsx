import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/services';
import { ShoppingCart, Sparkles, Heart, Facebook } from 'lucide-react';

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
                "Ladle & Spoon is a fantastic find! Their homemade soups are incredibly flavorful, taste genuinely fresh, and are the perfect comforting meal. The delivery is always prompt and friendly, making it super easy to get a wholesome, delicious dinner on the table. Highly recommend trying them out – a true local gem!"
              </p>
              <p className="font-semibold text-[#8B4513]">- Tony E.</p>
            </div>

            <div className="card-whimsy p-6 hover-lift">
              <div className="flex gap-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-[#654321] mb-4 italic">
                "This is one of the best chicken noodle soups I have had. Will be ordering more."
              </p>
              <p className="font-semibold text-[#8B4513]">- Linda K.</p>
            </div>

            <div className="card-whimsy p-6 hover-lift">
              <div className="flex gap-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-[#654321] mb-4 italic">
                "Excellent flavors with a personal touch. I absolutely love their soups and it's supporting a local business that cares about their customers."
              </p>
              <p className="font-semibold text-[#8B4513]">- Sean S.</p>
            </div>

            <div className="card-whimsy p-6 hover-lift">
              <div className="flex gap-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-[#654321] mb-4 italic">
                "Best homemade soups around! Found this gem on Facebook and have placed an order weekly since! Quick and tasty! We always look forward to the weekly menu posts :)"
              </p>
              <p className="font-semibold text-[#8B4513]">- Morgan R.</p>
            </div>

            <div className="card-whimsy p-6 hover-lift">
              <div className="flex gap-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-[#654321] mb-4 italic">
                "I absolutely LOVE the soups & cerviche that I've tried from Ladle & Spoon! I order every week. The variety & deliciousness of every soup that I try keeps me coming back for more. The latest soup that I tried was a spicy carrot ginger soup…I will be ordering that again every time that it's available!"
              </p>
              <p className="font-semibold text-[#8B4513]">- Melissa W.</p>
            </div>

            <div className="card-whimsy p-6 hover-lift">
              <div className="flex gap-1 mb-4 justify-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-[#654321] mb-4 italic">
                "Marry Me Chicken Soup: I've tried several different soup flavors from this company, and this one tops the list. It has a creamy and smooth texture, all with the perfect ingredients, seasoning and flavor. Whether it's a quick meal or something to warm you up, Ladle & Spoon hits the spot always. Highly recommend!"
              </p>
              <p className="font-semibold text-[#8B4513]">- Trisha P.</p>
            </div>
          </div>
        </section>

        <section className="py-12 text-center border-t border-[#E6B85C]/30">
          <h3 className="text-2xl font-bold text-[#8B4513] mb-6">
            Follow Us
          </h3>
          <div className="flex justify-center gap-4">
            <a
              href="https://www.facebook.com/p/Ladle-Spoon-61566931251705/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full bg-gradient-to-r from-[#FEC37D] to-[#E6B85C] hover:from-[#E6B85C] hover:to-[#FEC37D] flex items-center justify-center transition-all hover:scale-110 shadow-lg hover:shadow-xl"
              aria-label="Visit our Facebook page"
            >
              <Facebook className="w-7 h-7 text-[#8B4513]" />
            </a>
          </div>
          <p className="text-sm text-[#654321] mt-4">
            Stay updated with our latest soups and specials!
          </p>
        </section>

      </div>
    </div>
  );
}
