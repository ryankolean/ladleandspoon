import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="card-whimsy p-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#808000] to-[#808000]/70 rounded-full mb-6 animate-scale-in">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl font-bold text-[#8B4513] mb-4">
            Order Placed!
          </h1>

          <p className="text-lg text-[#654321] mb-2">
            Your order has been successfully placed.
          </p>

          {orderId && (
            <p className="text-sm text-[#654321] mb-8">
              Order #{orderId}
            </p>
          )}

          <div className="bg-[#FEC37D]/20 rounded-2xl p-6 mb-8">
            <p className="text-[#8B4513] font-medium mb-2">
              🍲 We'll start preparing your delicious order right away!
            </p>
            <p className="text-sm text-[#654321]">
              You'll receive your order by tomorrow. Thank you for choosing Ladle &amp; Spoon!
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/order')}
              className="btn-primary w-full"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary w-full"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
