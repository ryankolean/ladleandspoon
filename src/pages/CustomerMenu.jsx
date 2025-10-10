import React, { useState, useEffect } from 'react';
import { MenuItem } from '@/services';
import { useCart } from '@/contexts/CartContext';
import { Plus, Check } from 'lucide-react';
import CartDrawer from '@/components/customer/CartDrawer';

const categoryIcons = {
  soup: '🍲',
  baked_good: '🥖',
  specials: '✨',
  box: '🍱'
};

const categoryNames = {
  soup: 'Soups',
  baked_good: 'Baked Goods',
  specials: 'Specials',
  box: 'Box Meals'
};

export default function CustomerMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addedItems, setAddedItems] = useState({});
  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const items = await MenuItem.filter({ available: true });
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  const handleAddToCart = (item, variant = null) => {
    addToCart(item, variant);
    const key = variant ? `${item.id}-${variant.name}` : item.id;
    setAddedItems(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [key]: false }));
    }, 1000);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="bg-gradient-to-r from-[#F56949] to-[#FEC37D] py-12 px-4 mb-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-shadow-sm">
            Today's Menu
          </h1>
          <p className="text-xl text-white/90 font-medium">
            Order now for delivery tomorrow
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`pill-button ${
                selectedCategory === category
                  ? 'pill-button-active'
                  : 'pill-button-inactive'
              }`}
            >
              {category === 'all' ? (
                <span>All Items 🍽️</span>
              ) : (
                <span>
                  {categoryIcons[category]} {categoryNames[category]}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-whimsy h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🍜</div>
            <p className="text-2xl text-[#4A5568] font-medium">
              No items available in this category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="card-whimsy overflow-hidden hover-lift">
                <div className="h-56 bg-gradient-to-br from-[#FEC37D] to-[#E6B85C] flex items-center justify-center relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-8xl animate-float">
                      {categoryIcons[item.category]}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-[#8B4513] mb-2">
                    {item.name}
                  </h3>
                  <p className="text-[#654321] mb-4 line-clamp-2">
                    {item.description || 'A delicious homemade creation'}
                  </p>

                  {(item.category === 'soup' || item.category === 'box') && item.variants && item.variants.length > 0 ? (
                    <div className="space-y-2">
                      {item.variants.map((variant, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#FEC37D]/30 to-[#E6B85C]/30"
                        >
                          <div className="flex-1">
                            <span className="font-semibold text-[#8B4513]">{variant.name}</span>
                            <span className="text-[#F56949] font-bold ml-3">
                              ${variant.price.toFixed(2)}
                            </span>
                          </div>
                          {variant.units_available > 0 ? (
                            <button
                              onClick={() => handleAddToCart(item, variant)}
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                addedItems[`${item.id}-${variant.name}`]
                                  ? 'bg-[#808000] scale-110'
                                  : 'bg-[#F56949] hover:bg-[#BC5B22] hover:scale-110'
                              }`}
                            >
                              {addedItems[`${item.id}-${variant.name}`] ? (
                                <Check className="w-5 h-5 text-white animate-scale-in" />
                              ) : (
                                <Plus className="w-5 h-5 text-white" />
                              )}
                            </button>
                          ) : (
                            <span className="text-sm text-[#F56949] font-medium">Sold Out</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-[#F56949]">
                        ${item.price.toFixed(2)}
                      </span>
                      {item.units_available > 0 ? (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className={`px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all ${
                            addedItems[item.id]
                              ? 'bg-[#808000] scale-110'
                              : 'bg-[#F56949] hover:bg-[#BC5B22] hover:scale-110 text-white'
                          }`}
                        >
                          {addedItems[item.id] ? (
                            <>
                              <Check className="w-5 h-5 text-white animate-scale-in" />
                              <span className="text-white">Added!</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-5 h-5" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-lg text-[#F56949] font-semibold">Sold Out</span>
                      )}
                    </div>
                  )}

                  {item.units_available <= 5 && item.units_available > 0 && (
                    <p className="text-sm text-[#F56949] mt-3 font-medium">
                      Only {item.units_available} left!
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CartDrawer />
    </div>
  );
}
