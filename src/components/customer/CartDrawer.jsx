import React, { useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, updateQuantity, removeFromCart, getCartTotal, getCartCount, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isCartOpen, setIsCartOpen]);

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className="modal-backdrop fixed inset-0 z-40"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 animate-slide-in-right flex flex-col">
        <div className="bg-gradient-to-r from-[#65DBFF] to-[#8EFFE4] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Your Cart</h2>
              <p className="text-white/90 text-sm">{getCartCount()} items</p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🍜</div>
              <p className="text-xl text-[#4A5568] font-medium mb-2">Your cart is empty</p>
              <p className="text-[#4A5568]">Add some delicious items to get started!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartItemId} className="card-whimsy p-4 flex gap-4 hover-lift">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D2F3F8] to-[#B6FFE0] flex items-center justify-center text-4xl flex-shrink-0">
                  {item.category === 'soup' ? '🍲' : item.category === 'baked_good' ? '🥖' : '🍱'}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#2D3748] truncate">{item.name}</h3>
                  {item.variant && (
                    <p className="text-sm text-[#4A5568]">{item.variant.name}</p>
                  )}
                  <p className="text-[#FF6B6B] font-bold mt-1">
                    ${(item.variant ? item.variant.price : item.price).toFixed(2)}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-[#B6FFE0] hover:bg-[#8EFFE4] flex items-center justify-center transition-all"
                    >
                      <Minus className="w-4 h-4 text-[#2D3748]" />
                    </button>
                    <span className="font-bold text-[#2D3748] min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-[#B6FFE0] hover:bg-[#8EFFE4] flex items-center justify-center transition-all"
                    >
                      <Plus className="w-4 h-4 text-[#2D3748]" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="ml-auto text-[#FF6B6B] hover:text-[#ff5252] font-medium text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t-2 border-[#B6FFE0] p-6 bg-white">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold text-[#2D3748]">Total</span>
              <span className="text-3xl font-bold text-[#FF6B6B]">
                ${getCartTotal().toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="btn-primary w-full text-xl flex items-center justify-center gap-3"
            >
              Checkout
              <ArrowRight className="w-6 h-6" />
            </button>
            <p className="text-center text-sm text-[#4A5568] mt-3">
              Free delivery on orders over $30
            </p>
          </div>
        )}
      </div>
    </>
  );
}
