import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react';

export default function CashConfirmation({ order, onReset }) {
  if (!order) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-2xl">
        <CardHeader>
          <div className="flex justify-center text-green-500">
            <CheckCircle className="w-16 h-16" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 mt-4">Order Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold">Order #{order.id.substring(0, 8)}</h3>
            <p className="text-2xl font-bold my-2">${order.total.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Payment Method: Cash on Delivery</p>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800">
            <p><strong>Please have exact change ready for delivery.</strong></p>
            <p>Estimated delivery: 30-45 minutes</p>
          </div>
          
          <Button onClick={onReset} size="lg" className="w-full">
            Place Another Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}