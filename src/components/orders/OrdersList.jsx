import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Eye } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const statusColors = {
  pending_payment: "bg-orange-100 text-orange-800 border-orange-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  preparing: "bg-blue-100 text-blue-800 border-blue-200",
  ready: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function OrdersList({ orders, isLoading, onOrderSelect, onOrderUpdate }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Loading Orders...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Orders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-gray-400 text-sm">Orders will appear here when created</p>
          </div>
        ) : (
          orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white rounded-lg border hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => onOrderSelect(order)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-orange-700">#</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {order.customer_name || 'Guest Order'}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {format(new Date(order.created_at), "HH:mm")}
                      <span>•</span>
                      <DollarSign className="w-3 h-3" />
                      ${order.total_amount?.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusColors[order.status]}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {order.items?.length || 0} items • {order.items?.map(item => item.name).join(", ").substring(0, 50)}...
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
}