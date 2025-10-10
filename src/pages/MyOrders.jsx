import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/services';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Package, MapPin, CreditCard, Phone } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  pending_payment: {
    label: "Pending Payment",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: CreditCard
  },
  pending: {
    label: "Order Received",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock
  },
  preparing: {
    label: "Preparing",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Package
  },
  ready: {
    label: "Ready for Delivery",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Package
  },
  completed: {
    label: "Completed",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Package
  }
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const currentUser = await User.me();
      if (!currentUser) {
        navigate('/login?redirect=/my-orders');
        return;
      }
      setUser(currentUser);

      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      navigate('/login?redirect=/my-orders');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8F0] to-[#FFE4CC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F56949]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#FFE4CC] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#8B4513] mb-2">My Orders</h1>
          <p className="text-[#654321]">Track your order history and status</p>
        </div>

        {orders.length === 0 ? (
          <Card className="card-whimsy">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-[#8B4513] mb-2">No Orders Yet</h2>
              <p className="text-[#654321] mb-6">
                You haven't placed any orders yet. Start browsing our delicious menu!
              </p>
              <button
                onClick={() => navigate('/order')}
                className="btn-primary"
              >
                Browse Menu
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#8B4513]">Order History</h2>
              {orders.map((order) => {
                const statusInfo = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = statusInfo.icon;

                return (
                  <Card
                    key={order.id}
                    className={`cursor-pointer transition-all hover:shadow-xl ${
                      selectedOrder?.id === order.id
                        ? 'ring-2 ring-[#F56949] shadow-xl'
                        : 'hover:ring-2 hover:ring-[#DEB887]'
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#F56949] to-[#FEC37D] rounded-2xl flex items-center justify-center">
                            <StatusIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-[#8B4513]">
                              Order #{order.id.substring(0, 8).toUpperCase()}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-[#654321]">
                              <Clock className="w-3 h-3" />
                              {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </div>
                          </div>
                        </div>
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#654321]">Items:</span>
                          <span className="font-semibold text-[#8B4513]">
                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#654321]">Total:</span>
                          <span className="font-bold text-[#F56949] text-lg">
                            ${order.total_amount?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              {selectedOrder ? (
                <Card className="card-whimsy">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Order Details</span>
                      <Badge className={statusConfig[selectedOrder.status]?.color}>
                        {statusConfig[selectedOrder.status]?.label}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-sm text-[#654321] mb-1">Order ID</p>
                      <p className="font-mono text-[#8B4513] font-semibold">
                        {selectedOrder.id}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-[#654321] mb-1">Order Date</p>
                      <p className="font-semibold text-[#8B4513]">
                        {format(new Date(selectedOrder.created_at), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>

                    {selectedOrder.status === 'pending_payment' && (
                      <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-2xl">
                        <p className="text-sm font-semibold text-orange-900 mb-1">
                          Payment Required
                        </p>
                        <p className="text-sm text-orange-800">
                          Please complete your payment to proceed with your order.
                        </p>
                      </div>
                    )}

                    <div className="border-t-2 border-[#DEB887] pt-6">
                      <h3 className="font-bold text-[#8B4513] mb-4">Order Items</h3>
                      <div className="space-y-3">
                        {selectedOrder.items?.map((item, index) => (
                          <div key={index} className="flex justify-between items-start p-3 bg-[#FFF8F0] rounded-xl">
                            <div className="flex-1">
                              <p className="font-semibold text-[#8B4513]">{item.name}</p>
                              {item.variant && (
                                <p className="text-sm text-[#654321]">{item.variant}</p>
                              )}
                              <p className="text-sm text-[#654321]">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-[#F56949]">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t-2 border-[#DEB887] pt-6">
                      <div className="flex items-start gap-3 mb-4">
                        <MapPin className="w-5 h-5 text-[#F56949] flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-sm text-[#654321] mb-1">Delivery Address</p>
                          <p className="font-semibold text-[#8B4513]">
                            {selectedOrder.customer_address}
                          </p>
                        </div>
                      </div>

                      {selectedOrder.notes && (
                        <div className="flex items-start gap-3">
                          <Package className="w-5 h-5 text-[#F56949] flex-shrink-0 mt-1" />
                          <div>
                            <p className="text-sm text-[#654321] mb-1">Delivery Notes</p>
                            <p className="text-[#8B4513]">{selectedOrder.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t-2 border-[#DEB887] pt-6">
                      <div className="space-y-2">
                        {selectedOrder.tax_amount > 0 && (
                          <div className="flex justify-between text-[#654321]">
                            <span>Tax:</span>
                            <span>${selectedOrder.tax_amount?.toFixed(2)}</span>
                          </div>
                        )}
                        {selectedOrder.delivery_fee > 0 && (
                          <div className="flex justify-between text-[#654321]">
                            <span>Delivery Fee:</span>
                            <span>${selectedOrder.delivery_fee?.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-[#DEB887]">
                          <span className="text-xl font-bold text-[#8B4513]">Total</span>
                          <span className="text-3xl font-bold text-[#F56949]">
                            ${selectedOrder.total_amount?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t-2 border-[#DEB887] pt-6">
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-[#654321]" />
                        <span className="text-[#654321]">Payment Method:</span>
                        <span className="font-semibold text-[#8B4513] capitalize">
                          {selectedOrder.payment_method}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="card-whimsy">
                  <CardContent className="p-12 text-center">
                    <div className="text-6xl mb-4">👈</div>
                    <p className="text-[#654321]">
                      Select an order to view details
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
