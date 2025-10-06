
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingCart, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from '@/components/ui/switch';

// Mock TaxSettings API for demonstration purposes.
// In a real application, this would be an actual API call to your backend.
const TaxSettings = {
  list: async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    // Return mock data for tax settings
    // This could come from a database, configuration file, etc.
    return [
      {
        id: "default_tax_settings",
        is_tax_enabled: true,
        tax_percentage: 0.08, // Example: 8%
        tax_display_name: "Sales Tax",
      }
    ];
  }
};


export default function NewOrderDialog({ open, onClose, menuItems, onSubmit }) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isGuest, setIsGuest] = useState(true);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  // New state for tax settings
  const [taxSettings, setTaxSettings] = useState({ is_tax_enabled: true, tax_percentage: 0.08, tax_display_name: "Tax" });

  const categories = ["all", "soup", "baked_good", "specials"];

  useEffect(() => {
    if (open) {
      loadTaxSettings();
    }
  }, [open]);

  const loadTaxSettings = async () => {
    try {
      const settings = await TaxSettings.list();
      if (settings.length > 0) {
        setTaxSettings(settings[0]);
      }
    } catch (error) {
      console.error("Error loading tax settings:", error);
      // Optionally set a default or show an error to the user
    }
  };

  const filteredMenuItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addItemToOrder = (menuItem) => {
    // Check inventory before adding
    if (menuItem.category === 'soup') {
      const hasAvailableVariants = menuItem.variants && menuItem.variants.some(v => v.units_available > 0);
      if (!hasAvailableVariants) {
        alert(`${menuItem.name} is sold out in all sizes.`);
        return;
      }
    } else if (menuItem.units_available <= 0) {
      alert(`${menuItem.name} is sold out.`);
      return;
    }

    const existingItem = orderItems.find(item => item.menu_item_id === menuItem.id);
    
    if (existingItem) {
      // Check inventory limits
      const availableUnits = menuItem.category === 'soup' 
        ? Math.max(...(menuItem.variants?.map(v => v.units_available) || [0]))
        : menuItem.units_available;
        
      if (existingItem.quantity >= availableUnits) {
        alert(`Only ${availableUnits} units available for ${menuItem.name}.`);
        return;
      }

      setOrderItems(prev => prev.map(item => 
        item.menu_item_id === menuItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems(prev => [...prev, {
        menu_item_id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        special_instructions: ""
      }]);
    }
  };

  const updateItemQuantity = (menuItemId, change) => {
    setOrderItems(prev => prev.map(item => {
      if (item.menu_item_id === menuItemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const updateSpecialInstructions = (menuItemId, instructions) => {
    setOrderItems(prev => prev.map(item => 
      item.menu_item_id === menuItemId 
        ? { ...item, special_instructions: instructions }
        : item
    ));
  };

  const calculateTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Use configurable tax settings
    const tax = taxSettings.is_tax_enabled ? subtotal * taxSettings.tax_percentage : 0;
    return {
      subtotal: subtotal,
      tax: tax,
      total: subtotal + tax
    };
  };

  const handleSubmit = () => {
    const { subtotal, tax, total } = calculateTotal();
    
    onSubmit({
      customer_name: customerName,
      customer_email: customerEmail,
      phone: customerPhone,
      is_guest: isGuest,
      items: orderItems,
      subtotal,
      tax,
      total,
      status: "pending",
      payment_status: "unpaid"
    });

    // Reset form
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setIsGuest(true);
    setOrderItems([]);
  };

  const totals = calculateTotal();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            New Order
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Setup */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 rounded-lg border p-4">
                <User className="w-5 h-5 text-gray-600"/>
                <Label htmlFor="guest-mode" className="flex-grow font-semibold">Checkout as Guest</Label>
                <Switch
                    id="guest-mode"
                    checked={isGuest}
                    onCheckedChange={setIsGuest}
                />
            </div>
            
            <div className="grid gap-4">
              <div>
                <Label>Customer Name</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@email.com"
                  required
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                  required
                />
              </div>
            </div>

            {/* Menu Categories */}
            <div>
              <Label>Menu Categories</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category === "all" ? "All Items" : category === 'baked_good' ? 'Baked Goods' : category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredMenuItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addItemToOrder(item)}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Order Summary</h3>
            
            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No items added yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {orderItems.map((item) => (
                  <div key={item.menu_item_id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="w-8 h-8"
                          onClick={() => updateItemQuantity(item.menu_item_id, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-semibold w-8 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="w-8 h-8"
                          onClick={() => updateItemQuantity(item.menu_item_id, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Special instructions..."
                      value={item.special_instructions}
                      onChange={(e) => updateSpecialInstructions(item.menu_item_id, e.target.value)}
                      className="h-16 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {orderItems.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  {taxSettings.is_tax_enabled && (
                    <div className="flex justify-between">
                      <span>{taxSettings.tax_display_name} ({(taxSettings.tax_percentage * 100).toFixed(1)}%):</span>
                      <span>${totals.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={orderItems.length === 0 || !customerName || !customerEmail || !customerPhone}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Create Order
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
