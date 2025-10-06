
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, DollarSign, Users, CreditCard, CheckCircle, Mail, Phone } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  preparing: "bg-blue-100 text-blue-800 border-blue-200", 
  ready: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200"
};

const paymentStatusColors = {
  unpaid: "bg-red-100 text-red-800 border-red-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  refunded: "bg-orange-100 text-orange-800 border-orange-200",
  cash_on_delivery: "bg-blue-100 text-blue-800 border-blue-200"
};

const nextStatus = {
  pending: "preparing",
  preparing: "ready", 
  ready: "completed"
};

export default function OrderDetails({ order, onOrderUpdate }) {
  if (!order) {
    return (
      <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Select an order</p>
          <p className="text-gray-400 text-sm">Click on an order to view details</p>
        </CardContent>
      </Card>
    );
  }

  const handleStatusUpdate = () => {
    const newStatus = nextStatus[order.status];
    if (newStatus) {
      onOrderUpdate(order.id, { status: newStatus });
    }
  };

  const handlePaymentComplete = () => {
    onOrderUpdate(order.id, { 
      payment_status: "paid",
      // If it was cash on delivery, also mark order as completed.
      ...(order.payment_method === 'cash' && { status: 'completed' })
    });
  };

  return (
    <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm sticky top-4">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="flex items-center justify-between">
          <span>Order Details</span>
          <div className="flex items-center gap-2">
            {order.payment_status && (
              <Badge className={paymentStatusColors[order.payment_status]}>
                {order.payment_status.replace('_', ' ')}
              </Badge>
            )}
            <Badge className={statusColors[order.status]}>
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Order Info */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-sm text-gray-500">Order Time</p>
            <p className="font-semibold">{format(new Date(order.created_date), "MMM d, HH:mm")}</p>
          </div>
        </div>

        <div>
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-semibold">{order.customer_name || 'Guest Order'}</p>
            <div className="space-y-1 mt-1">
              {order.customer_email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-3 h-3" />
                  <span>{order.customer_email}</span>
                </div>
              )}
              {order.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-3 h-3" />
                  <span>{order.phone}</span>
                </div>
              )}
              {order.is_guest && (
                <Badge variant="secondary" className="text-xs">Guest</Badge>
              )}
            </div>
        </div>

        <Separator />
        
        {/* Payment Info */}
        <div>
            <p className="text-sm text-gray-500">Payment Method</p>
            <p className="font-semibold capitalize">{order.payment_method ? order.payment_method.replace(/_/g, ' ') : 'N/A'}</p>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="font-semibold mb-3">Order Items</h3>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  {item.special_instructions && (
                    <p className="text-sm text-blue-600 italic">"{item.special_instructions}"</p>
                  )}
                </div>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Order Total */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>${order.tax?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>${order.total?.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-3">
          {order.status !== "completed" && nextStatus[order.status] && (
            <Button
              onClick={handleStatusUpdate}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Mark as {nextStatus[order.status].replace('_', ' ')}
            </Button>
          )}

          {order.payment_status === "unpaid" && order.status === "ready" && order.payment_method !== 'cash' && (
            <Button
              onClick={handlePaymentComplete}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Mark as Paid
            </Button>
          )}
          
          {order.payment_status === 'cash_on_delivery' && (
            <Button
              onClick={handlePaymentComplete}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Confirm Cash Payment & Complete
            </Button>
          )}

          {order.status === "completed" && order.payment_status === "paid" && (
            <div className="flex items-center justify-center text-green-600 font-medium">
              <CheckCircle className="w-5 h-5 mr-2" />
              Order Complete
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
