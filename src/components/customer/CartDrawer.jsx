import React, { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DeliverySettings } from '@/services';

export default function CartDrawer() {
  const { cart, updateQuantity, removeFromCart, getCartTotal, getCartCount, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [deliveryFee, setDeliveryFee] = useState(0);

  useEffect(() => {
    loadDeliveryFee();
  }, []);

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

  const loadDeliveryFee = async () => {
    try {
      const settings = await DeliverySettings.getSettings();
      const fee = DeliverySettings.calculateDeliveryFee(settings);
      setDeliveryFee(fee);
    } catch (error) {
      console.error('Error loading delivery fee:', error);
      setDeliveryFee(5.00);
    }
  };

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

      <div className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-[#F8F3F0] shadow-2xl z-50 animate-slide-in-right flex flex-col">
        <div className="bg-gradient-to-r from-[#F56949] to-[#FEC37D] p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Your Cart</h2>
              <p className="text-white/90 text-sm">{getCartCount()} items</p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-10 h-10 rounded-full bg-[#F8F3F0]/30 hover:bg-[#F8F3F0]/50 flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🍜</div>
              <p className="text-xl text-[#654321] font-medium mb-2">Your cart is empty</p>
              <p className="text-[#654321]">Add some delicious items to get started!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartItemId} className="card-whimsy p-4 flex gap-4 hover-lift">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FEC37D] to-[#E6B85C] flex items-center justify-center text-4xl flex-shrink-0">
                  {item.category === 'soup' ? '🍲' : item.category === 'baked_good' ? '🥖' : '🍱'}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#8B4513] truncate">{item.name}</h3>
                  {item.variant && (
                    <p className="text-sm text-[#654321]">{item.variant.name}</p>
                  )}
                  <p className="text-[#F56949] font-bold mt-1">
                    ${(item.variant ? item.variant.price : item.price).toFixed(2)}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-[#E6B85C] hover:bg-[#FEC37D] flex items-center justify-center transition-all"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="font-bold text-[#8B4513] min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-[#E6B85C] hover:bg-[#FEC37D] flex items-center justify-center transition-all"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="ml-auto text-[#F56949] hover:text-[#BC5B22] font-medium text-sm"
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
          <div className="border-t-2 border-[#DEB887] p-6 bg-[#F8F3F0]">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#654321]">Subtotal</span>
                <span className="font-medium text-[#8B4513]">${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#654321] flex items-center gap-1">
                  <Truck className="w-4 h-4" />
                  Delivery Fee
                </span>
                <span className="font-medium text-[#8B4513]">${deliveryFee.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6 pt-3 border-t border-[#DEB887]">
              <span className="text-xl font-bold text-[#8B4513]">Total</span>
              <span className="text-3xl font-bold text-[#F56949]">
                ${(getCartTotal() + deliveryFee).toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="btn-primary w-full text-xl flex items-center justify-center gap-3"
            >
              Checkout
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
