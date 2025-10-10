import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { User } from '@/services';
import { ArrowLeft, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AddressAutocomplete from '@/components/customer/AddressAutocomplete';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [addressError, setAddressError] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('venmo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryDistance, setDeliveryDistance] = useState(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  const STORE_ADDRESS = "1247 Bielby Waterford, MI 48328";
  const MAX_DELIVERY_DISTANCE_MILES = 10;

  const calculateDistance = useCallback((destinationAddress) => {
    if (!destinationAddress || !destinationAddress.lat || !destinationAddress.lng) {
      setDeliveryDistance(null);
      return;
    }

    setIsCalculatingDistance(true);
    try {
      const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
        const R = 3959;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      const storeLat = 42.6725;
      const storeLng = -83.3799;

      const distance = calculateHaversineDistance(
        storeLat,
        storeLng,
        destinationAddress.lat,
        destinationAddress.lng
      );

      setDeliveryDistance(distance);
    } catch (error) {
      console.error("Error calculating distance:", error);
      setDeliveryDistance(null);
    } finally {
      setIsCalculatingDistance(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (deliveryAddress && deliveryAddress.lat && deliveryAddress.lng && !deliveryAddress.manual) {
      calculateDistance(deliveryAddress);
    } else {
      setDeliveryDistance(null);
    }
  }, [deliveryAddress, calculateDistance]);

  const checkAuth = async () => {
    try {
      const currentUser = await User.me();
      if (!currentUser) {
        navigate('/login?redirect=/checkout');
        return;
      }
      setUser(currentUser);

      const { data: addresses } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_default', true)
        .maybeSingle();

      if (addresses) {
        setDeliveryAddress({
          formatted_address: addresses.formatted_address || addresses.street_address,
          lat: addresses.latitude,
          lng: addresses.longitude,
          place_id: addresses.place_id
        });
      }
    } catch (error) {
      navigate('/login?redirect=/checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress || !deliveryAddress.formatted_address) {
      setAddressError('Please select a valid delivery address from the suggestions');
      return;
    }

    if (deliveryAddress.manual) {
      setAddressError('Please select an address from the dropdown suggestions');
      return;
    }

    setAddressError('');

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems = cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_time: item.variant ? item.variant.price : item.price,
        variant_name: item.variant?.name || null
      }));

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          total_amount: getCartTotal(),
          status: 'pending',
          payment_method: paymentMethod,
          delivery_address: deliveryAddress.formatted_address,
          delivery_notes: deliveryNotes
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItemsWithOrderId = orderItems.map(item => ({
        ...item,
        order_id: order.id
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsWithOrderId);

      if (itemsError) throw itemsError;

      clearCart();
      navigate('/order-success', { state: { orderId: order.id } });
    } catch (error) {
      console.error('Order error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F56949]" />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-8xl mb-6">🍜</div>
          <h2 className="text-3xl font-bold text-[#8B4513] mb-4">Your cart is empty</h2>
          <p className="text-[#654321] mb-8">Add some delicious items to get started!</p>
          <button
            onClick={() => navigate('/order')}
            className="btn-primary"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#8B4513] hover:text-[#F56949] mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <h1 className="text-4xl font-bold text-[#8B4513] mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-whimsy p-6">
              <h2 className="text-2xl font-bold text-[#8B4513] mb-4">Delivery Details</h2>

              <div className="space-y-4">
                <div>
                  <AddressAutocomplete
                    value={deliveryAddress}
                    onAddressChange={setDeliveryAddress}
                    error={addressError}
                  />

                  {isCalculatingDistance && (
                    <div className="mt-2 text-sm text-[#654321]">
                      Calculating distance...
                    </div>
                  )}

                  {deliveryDistance !== null && !isCalculatingDistance && (
                    <div className="mt-2">
                      <div className={`text-sm font-medium ${
                        deliveryDistance <= MAX_DELIVERY_DISTANCE_MILES ? 'text-green-600' : 'text-[#F56949]'
                      }`}>
                        Distance from {STORE_ADDRESS}: {deliveryDistance.toFixed(1)} miles
                      </div>
                      {deliveryDistance > MAX_DELIVERY_DISTANCE_MILES && (
                        <div className="mt-3 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-amber-900 mb-1">
                              Outside Standard Delivery Area
                            </p>
                            <p className="text-sm text-amber-800">
                              Your address is beyond our standard {MAX_DELIVERY_DISTANCE_MILES}-mile delivery radius.
                              Place your order and we will contact you to confirm delivery.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#8B4513] mb-2">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Gate code, special instructions, etc."
                    rows={2}
                    className="input-whimsy resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="card-whimsy p-6">
              <h2 className="text-2xl font-bold text-[#8B4513] mb-4">Payment Method</h2>

              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('venmo')}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                    paymentMethod === 'venmo'
                      ? 'border-[#F56949] bg-[#F56949]/5'
                      : 'border-[#DEB887] hover:border-[#F56949]/50'
                  }`}
                >
                  <Wallet className="w-6 h-6 text-[#F56949]" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-[#8B4513]">Venmo</div>
                    <div className="text-sm text-[#654321]">Pay on delivery</div>
                  </div>
                  {paymentMethod === 'venmo' && (
                    <div className="w-5 h-5 rounded-full bg-[#F56949] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                    paymentMethod === 'cash'
                      ? 'border-[#F56949] bg-[#F56949]/5'
                      : 'border-[#DEB887] hover:border-[#F56949]/50'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-[#F56949]" />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-[#8B4513]">Cash</div>
                    <div className="text-sm text-[#654321]">Pay on delivery</div>
                  </div>
                  {paymentMethod === 'cash' && (
                    <div className="w-5 h-5 rounded-full bg-[#F56949] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card-whimsy p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-[#8B4513] mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={item.cartItemId} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <div className="font-medium text-[#8B4513]">
                        {item.quantity}x {item.name}
                      </div>
                      {item.variant && (
                        <div className="text-xs text-[#654321]">{item.variant.name}</div>
                      )}
                    </div>
                    <div className="font-semibold text-[#8B4513]">
                      ${((item.variant ? item.variant.price : item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-[#DEB887] pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-[#8B4513]">Total</span>
                  <span className="text-3xl font-bold text-[#F56949]">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !deliveryAddress?.formatted_address}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Processing...
                  </div>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
