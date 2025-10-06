import React, { useState, useEffect } from 'react';
import { Order } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrderHistory = async () => {
      try {
        const currentUser = await User.me();
        // The RLS on Order entity automatically filters by created_by
        const userOrders = await Order.list("-created_date");
        setOrders(userOrders);
      } catch (error) {
        console.error("Failed to load order history", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderHistory();
  }, []);

  if (isLoading) {
    return <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
    </div>;
  }

  if (orders.length === 0) {
    return <p className="text-gray-500">You have no past orders.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Order #{order.id.substring(0, 8)}...</CardTitle>
              <span className="text-sm text-gray-500">{format(new Date(order.created_date), 'MMM d, yyyy')}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-xl">${order.total.toFixed(2)}</span>
              <Badge>{order.status}</Badge>
            </div>
            <div className="text-sm text-gray-600">
                {order.items.map(item => item.name).join(', ')}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}