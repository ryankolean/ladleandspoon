import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VenetianMask } from 'lucide-react'; // Using a placeholder icon

export default function VenmoPayment({ order, onReset }) {
  if (!order) return null;

  const venmoUsername = 'Lia-Merritt2282';
  const amount = order.total.toFixed(2);
  const note = `Ladle & Spoon Order #${order.id.substring(0, 8)}`;
  
  const venmoUrl = `https://venmo.com/${venmoUsername}?txn=pay&amount=${amount}&note=${encodeURIComponent(note)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Complete Your Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-lg font-semibold">Order #{order.id.substring(0, 8)}</h3>
            <p className="text-2xl font-bold my-2">${amount}</p>
            <p className="text-sm text-gray-600">Payment Method: Venmo</p>
          </div>
          
          <p className="text-gray-700">Click the button below to pay via Venmo:</p>
          
          <Button asChild size="lg" className="w-full bg-[#3d95ce] hover:bg-[#3484b9] text-white text-lg">
            <a href={venmoUrl} target="_blank" rel="noopener noreferrer">
              Pay ${amount} via Venmo
            </a>
          </Button>
          
          <p className="text-xs text-gray-500">
            You will be redirected to Venmo to complete your payment.
            Your order will be prepared once payment is confirmed by our staff.
          </p>
          
          <Button variant="outline" onClick={onReset} className="w-full">
            Back to Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}