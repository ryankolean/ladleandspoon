import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coffee, ShoppingCart, UserCheck, PackageCheck } from 'lucide-react';

export default function NewCustomerOnboarding({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Coffee className="w-6 h-6 text-orange-500" />
            Welcome to Ladle & Spoon!
          </DialogTitle>
          <DialogDescription>
            Ready to order? Here’s a quick guide to get you started.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold">1. Browse & Add to Cart</h4>
              <p className="text-sm text-gray-600">Explore our menu and add your favorite items to your order.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold">2. Checkout</h4>
              <p className="text-sm text-gray-600">Log in for a faster experience or check out as a guest with your name, email, and phone number.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <PackageCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold">3. Confirm & Place Order</h4>
              <p className="text-sm text-gray-600">Confirm you're in our delivery zone, then place your order. We'll handle the rest!</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="w-full bg-orange-600 hover:bg-orange-700">
            Start Ordering
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}