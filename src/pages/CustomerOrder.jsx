
import React, { useState, useEffect, useCallback } from "react";
import { Order, MenuItem, OrderingWindow, TaxSettings, UserAddress, SMSSubscription, User } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, ShoppingCart, User as UserIcon, Mail, Phone, Coffee, LogIn, Clock, Settings, BookMarked } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import NewCustomerOnboarding from "../components/customer/NewCustomerOnboarding";
import DeliveryAreaDialog from "../components/customer/DeliveryAreaDialog";
import AddressAutocomplete from "../components/customer/AddressAutocomplete";
import VenmoPayment from "../components/customer/VenmoPayment";
import CashConfirmation from "../components/customer/CashConfirmation";

export default function CustomerOrder() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "", phone: "", address: null });
  const [phone, setPhone] = useState("");
  
  // New address management state
  const [userAddresses, setUserAddresses] = useState([]);
  const [deliveryAddressSource, setDeliveryAddressSource] = useState('new'); // 'new' or 'saved'
  const [selectedAddressId, setSelectedAddressId] = useState(''); // ID of the currently selected saved address
  const [newAddress, setNewAddress] = useState(null); // Holds data for a newly entered address

  const [inDeliveryZone, setInDeliveryZone] = useState(false);
  const [deliveryDistance, setDeliveryDistance] = useState(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDeliveryArea, setShowDeliveryArea] = useState(false);
  const [orderingWindow, setOrderingWindow] = useState(null);
  const [taxSettings, setTaxSettings] = useState({ is_tax_enabled: true, tax_percentage: 0.08, tax_display_name: "Tax" });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [submissionState, setSubmissionState] = useState("form");
  const [lastOrder, setLastOrder] = useState(null);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [isSmsSubscribed, setIsSmsSubscribed] = useState(false); // New state for SMS subscription status

  const STORE_ADDRESS = "1247 Bielby Waterford, MI 48328";
  const MAX_DELIVERY_DISTANCE_MILES = 10;

  const calculateDistance = useCallback(async (destinationAddress) => {
    if (!destinationAddress) {
      setDeliveryDistance(null);
      setInDeliveryZone(false);
      return;
    }

    setIsCalculatingDistance(true);
    try {
      // Use the Haversine formula for straight-line distance as a fallback
      const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
        const R = 3959; // Earth's radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      // Store coordinates (1247 Bielby, Waterford, MI 48328)
      const storeLat = 42.6725;
      const storeLng = -83.3799;

      if (destinationAddress.lat && destinationAddress.lng) {
        const distance = calculateHaversineDistance(
          storeLat,
          storeLng,
          destinationAddress.lat,
          destinationAddress.lng
        );

        setDeliveryDistance(distance);
        setInDeliveryZone(distance <= MAX_DELIVERY_DISTANCE_MILES);
      } else {
        setDeliveryDistance(null);
        setInDeliveryZone(false);
      }
    } catch (error) {
      console.error("Error calculating distance:", error);
      setDeliveryDistance(null);
      setInDeliveryZone(false);
    } finally {
      setIsCalculatingDistance(false);
    }
  }, [MAX_DELIVERY_DISTANCE_MILES]);

  const validateDeliveryAddress = useCallback((addressData) => {
    if (!addressData || !addressData.lat || !addressData.lng) {
      setInDeliveryZone(false);
      setDeliveryDistance(null);
      return;
    }
    calculateDistance(addressData);
  }, [calculateDistance]);

  const loadData = useCallback(async () => {
    try {
      const [menuData, windowData, taxData] = await Promise.all([
        MenuItem.filter({ available: true }),
        OrderingWindow.list().then(windows => windows[0] || null),
        TaxSettings.list().then(settings => settings[0] || { is_tax_enabled: true, tax_percentage: 0.08, tax_display_name: "Tax" })
      ]);
      
      try {
        const user = await User.me();
        if (user) {
          setCurrentUser(user);
          setIsGuest(false);
          setPhone(user.phone || "");

          if (user.phone) {
            const subscriptions = await SMSSubscription.filter({ phone_number: user.phone });
            if (subscriptions.length > 0 && subscriptions[0].is_subscribed) {
              setIsSmsSubscribed(true);
            } else {
              setIsSmsSubscribed(false);
            }
          } else {
            setIsSmsSubscribed(false);
          }

          const savedAddresses = await UserAddress.list('-created_at');
          setUserAddresses(savedAddresses);
          
          if (savedAddresses.length > 0) {
            setDeliveryAddressSource('saved');
            setSelectedAddressId(savedAddresses[0].id); // Default to the most recent address
            validateDeliveryAddress(savedAddresses[0]);
          } else {
            setDeliveryAddressSource('new');
          }
        }
      } catch (error) {
        // User not logged in - this is fine for customer view
        setCurrentUser(null);
        setIsGuest(true);
        setIsSmsSubscribed(false); // Ensure this is false for guests
      }
      
      setMenuItems(menuData);
      setOrderingWindow(windowData);
      setTaxSettings(taxData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [validateDeliveryAddress]);

  useEffect(() => {
    loadData();
    const hasVisited = localStorage.getItem("hasVisitedLadleAndSpoon");
    if (!hasVisited) {
      setShowOnboarding(true);
      localStorage.setItem("hasVisitedLadleAndSpoon", "true");
    }
  }, [loadData]);

  const handleLogin = () => {
    User.loginWithRedirect(window.location.href);
  };

  const isOrderingOpen = () => {
    if (!orderingWindow) return false; // If no window data, assume closed or not configured
    if (!orderingWindow.is_open) return false; // If explicitly marked as not open

    const now = new Date();
    
    if (orderingWindow.use_recurring_schedule) {
      // Check recurring weekly schedule
      // Get current day name in full lowercase format, e.g., "monday", "tuesday"
      const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      // Check if today is in allowed days
      if (!orderingWindow.days_of_week.includes(today)) return false;

      // Check if current time is within operating hours
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;

      // This logic assumes open_time and close_time are always set for recurring schedules.
      // If not, additional checks for their existence might be needed.
      return currentTime >= orderingWindow.open_time && currentTime <= orderingWindow.close_time;
    } else {
      // Check specific date range
      const currentDateTime = now.getTime();
      
      // Ensure open_date, close_date, open_time, close_time are available
      if (!orderingWindow.open_date || !orderingWindow.open_time || !orderingWindow.close_date || !orderingWindow.close_time) {
          console.warn("Ordering window configured for specific dates but missing date/time values.");
          return false;
      }

      const openDateTime = new Date(`${orderingWindow.open_date}T${orderingWindow.open_time}`).getTime();
      const closeDateTime = new Date(`${orderingWindow.close_date}T${orderingWindow.close_time}`).getTime();
      
      return currentDateTime >= openDateTime && currentDateTime <= closeDateTime;
    }
  };

  const categories = ["all", "soup", "baked_good", "specials", "box"];

  const addToCart = (menuItem, variant = null) => {
    // Check inventory before adding
    if (variant) {
      if (variant.units_available <= 0) {
        alert(`Sorry, ${menuItem.name} (${variant.name}) is sold out.`);
        return;
      }
    } else {
      if (menuItem.units_available <= 0) {
        alert(`Sorry, ${menuItem.name} is sold out.`);
        return;
      }
    }

    const cartKey = variant ? `${menuItem.id}-${variant.name}` : menuItem.id;
    const existingItem = cart.find(item => item.cartKey === cartKey);
    
    if (existingItem) {
      // Check if adding one more would exceed available inventory
      const availableUnits = variant ? variant.units_available : menuItem.units_available;
      if (existingItem.quantity >= availableUnits) {
        alert(`Sorry, only ${availableUnits} units available.`);
        return;
      }
      
      setCart(prev => prev.map(item => 
        item.cartKey === cartKey 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem = {
        cartKey,
        menu_item_id: menuItem.id,
        name: variant ? `${menuItem.name} (${variant.name})` : menuItem.name,
        price: variant ? variant.price : menuItem.price,
        quantity: 1,
        special_instructions: ""
      };
      setCart(prev => [...prev, newItem]);
    }
  };

  const updateCartQuantity = (cartKey, change) => {
    setCart(prev => prev.map(item => {
      if (item.cartKey === cartKey) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = taxSettings.is_tax_enabled ? subtotal * taxSettings.tax_percentage : 0;
    return {
      subtotal,
      tax,
      total: subtotal + tax,
      taxDisplayName: taxSettings.tax_display_name
    };
  };

  const handleAddressChange = (addressData) => {
    setNewAddress(addressData); // Always update newAddress when autocomplete is used
    if (addressData && !addressData.manual) {
      validateDeliveryAddress(addressData);
    } else {
      setInDeliveryZone(false);
    }
  };


  const handleSubmitOrder = async () => {
    // Determine the final address object for validation and submission
    let finalAddress = null;
    if (!isGuest) { // Logged-in user
      if (deliveryAddressSource === 'saved' && selectedAddressId) {
        finalAddress = userAddresses.find(addr => addr.id === selectedAddressId);
      } else { // 'new'
        finalAddress = newAddress;
      }
    } else { // Guest
      finalAddress = guestInfo.address;
    }

    // Validation
    if (isGuest) {
      if (!guestInfo.name || !guestInfo.email || !guestInfo.phone || !finalAddress?.formatted_address) {
        alert("Please fill in all your information including delivery address.");
        return;
      }
    } else { // Logged-in user
      if ((!currentUser.phone && !phone) && !finalAddress?.formatted_address) { // Check if user has phone OR has typed one
        alert("Please provide a phone number and delivery address.");
        return;
      }
    }

    if (finalAddress?.manual) {
      alert("Please select a valid address from the Google suggestions.");
      return;
    }
    
    if (!inDeliveryZone) {
      if (deliveryDistance !== null && deliveryDistance > MAX_DELIVERY_DISTANCE_MILES) {
        alert(`Sorry, your delivery address is ${deliveryDistance.toFixed(1)} miles away. We only deliver within ${MAX_DELIVERY_DISTANCE_MILES} miles of ${STORE_ADDRESS}.`);
      } else {
        alert("Please confirm you are within the delivery area.");
      }
      return;
    }
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const finalPhoneNumber = isGuest ? guestInfo.phone : (currentUser?.phone || phone);

      // --- Auto-save profile data for signed-in users ---
      if (currentUser) {
        // 1. Save new phone number if it was provided and differs from saved
        if (phone && phone !== currentUser.phone) {
          await User.updateMyUserData({ phone });
          setCurrentUser(prev => ({ ...prev, phone })); // Update local state immediately
        }
        // 2. Save new address if one was entered and not manually typed
        if (deliveryAddressSource === 'new' && newAddress && !newAddress.manual) {
          await UserAddress.create({
            label: `Saved on ${new Date().toLocaleDateString()}`, // Auto-generated label
            full_address: newAddress.formatted_address,
            lat: newAddress.lat,
            lng: newAddress.lng,
            delivery_instructions: "" // Can be added in profile management
          });
        }
        // 3. Handle SMS opt-in
        if (smsOptIn && finalPhoneNumber && !isSmsSubscribed) { // Only attempt to subscribe if not already subscribed
            const existingSub = await SMSSubscription.filter({ phone_number: finalPhoneNumber }, '-created_at', 1);
            if(existingSub.length > 0) {
                if(!existingSub[0].is_subscribed) {
                    await SMSSubscription.update(existingSub[0].id, { is_subscribed: true });
                }
            } else {
                await SMSSubscription.create({
                    phone_number: finalPhoneNumber,
                    customer_name: currentUser.full_name,
                    customer_email: currentUser.email,
                    is_subscribed: true,
                    consent_method: "order_form"
                });
            }
        }
      }

      const { subtotal, tax, total } = calculateTotal();
      
      const createdOrder = await Order.create({
        customer_name: isGuest ? guestInfo.name : currentUser.full_name,
        customer_email: isGuest ? guestInfo.email : currentUser.email,
        phone: finalPhoneNumber,
        delivery_address: finalAddress.formatted_address,
        address_lat: finalAddress.lat,
        address_lng: finalAddress.lng,
        is_guest: isGuest,
        items: cart,
        subtotal,
        tax,
        total,
        status: "pending",
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cash' ? 'cash_on_delivery' : 'unpaid'
      });

      setLastOrder(createdOrder);
      setCart([]);
      
      if (paymentMethod === 'venmo') {
        setSubmissionState('venmo');
      } else { // Cash
        setSubmissionState('cash_confirmation');
      }

    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetOrderForm = () => {
    setSubmissionState('form');
    setLastOrder(null);
    setPaymentMethod('');
    setSmsOptIn(false); // Reset SMS opt-in
    setCart([]); // Ensure cart is clear for a new order

    if (!currentUser) { // If there's no current user (was a guest), reset guest fields
      setIsGuest(true);
      setGuestInfo({ name: "", email: "", phone: "", address: null });
    } else { // Logged-in user, reset new address inputs only
      setDeliveryAddressSource(userAddresses.length > 0 ? 'saved' : 'new');
      setSelectedAddressId(userAddresses.length > 0 ? userAddresses[0].id : '');
      setNewAddress(null);
      setPhone(currentUser.phone || "");
    }
    setInDeliveryZone(false); // Reset delivery zone status
  };

  const totals = calculateTotal();

  const filteredMenuItems = selectedCategory === "all" 
    ? menuItems.filter(item => {
        // Hide items that are completely sold out
        if (item.category === 'soup' || item.category === 'box') {
          return item.variants && item.variants.some(v => v.units_available > 0);
        }
        return item.units_available > 0;
      })
    : menuItems.filter(item => {
        const matchesCategory = item.category === selectedCategory;
        if (!matchesCategory) return false;
        
        // Hide items that are completely sold out
        if (item.category === 'soup' || item.category === 'box') {
          return item.variants && item.variants.some(v => v.units_available > 0);
        }
        return item.units_available > 0;
      });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Check if ordering is closed
  if (!isOrderingOpen()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Coffee className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
                Ladle & Spoon
              </h1>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">We're Currently Closed</h2>
              <p className="text-gray-600 mb-6">
                {orderingWindow?.message || "We're currently closed. Please check back during our ordering hours."}
              </p>
              {orderingWindow && orderingWindow.use_recurring_schedule && (
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    <strong>Hours:</strong> {orderingWindow.open_time} - {orderingWindow.close_time}
                  </p>
                  <p>
                    <strong>Days:</strong> {orderingWindow.days_of_week.map(day => 
                      day.charAt(0).toUpperCase() + day.slice(1)
                    ).join(', ')}
                  </p>
                </div>
              )}
              {orderingWindow && !orderingWindow.use_recurring_schedule && (
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    <strong>Available:</strong> {orderingWindow.open_date} {orderingWindow.open_time}
                     - {orderingWindow.close_date} {orderingWindow.close_time}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (submissionState === 'venmo') {
    return <VenmoPayment order={lastOrder} onReset={handleResetOrderForm} />;
  }

  if (submissionState === 'cash_confirmation') {
    return <CashConfirmation order={lastOrder} onReset={handleResetOrderForm} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <NewCustomerOnboarding open={showOnboarding} onClose={() => setShowOnboarding(false)} />
      <DeliveryAreaDialog open={showDeliveryArea} onClose={() => setShowDeliveryArea(false)} />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Ladle & Spoon Online Order
          </h1>
          <p className="text-lg text-gray-600">Freshly prepared, just for you!</p>
        </div>

        {currentUser && (
            <div className="text-right mb-4">
                <Button asChild variant="ghost">
                    <Link to={createPageUrl('Profile')} className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        My Account
                    </Link>
                </Button>
            </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-md bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!currentUser && (
                  <div className="flex items-center justify-center gap-4 border-b pb-6">
                     <Button onClick={handleLogin} className="w-full">
                       <LogIn className="w-4 h-4 mr-2" />
                       Sign In for Faster Checkout
                     </Button>
                     <span className="text-gray-500">OR</span>
                     <Label className="text-center font-semibold w-full border rounded-md p-2 bg-white">Continue as Guest</Label>
                  </div>
                )}
                
                {currentUser && <p className="text-center font-semibold">Welcome back, {currentUser.full_name}!</p>}

                {/* This form is now shown for both guests and logged-in users */}
                <div className="grid gap-4 pt-4">
                  {isGuest && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Your Name *</Label>
                        <Input value={guestInfo.name} onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})} placeholder="Enter your name" required />
                      </div>
                      <div>
                        <Label>Email Address *</Label>
                        <Input type="email" value={guestInfo.email} onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})} placeholder="your@email.com" required />
                      </div>
                    </div>
                  )}

                  {/* Phone Number Field: Show for guests OR signed-in users without a saved number (or if they want to change it) */}
                  {(isGuest || !currentUser?.phone || (currentUser && phone !== currentUser.phone)) && (
                    <div>
                      <Label>Phone Number *</Label>
                      <Input
                        type="tel"
                        value={isGuest ? guestInfo.phone : phone}
                        onChange={(e) => isGuest ? setGuestInfo({...guestInfo, phone: e.target.value}) : setPhone(e.target.value)}
                        placeholder="(555) 555-5555"
                        required
                      />
                    </div>
                  )}

                  {/* Address Section */}
                  <div>
                    <Label className="font-semibold block mb-2">Delivery Address *</Label>
                    {/* For logged-in users with saved addresses */}
                    {currentUser && userAddresses.length > 0 && (
                      <div className="space-y-4">
                        <RadioGroup value={deliveryAddressSource} onValueChange={setDeliveryAddressSource} className="flex gap-4">
                          <div className="flex items-center space-x-2"><RadioGroupItem value="saved" id="saved" /><Label htmlFor="saved">Use a saved address</Label></div>
                          <div className="flex items-center space-x-2"><RadioGroupItem value="new" id="new" /><Label htmlFor="new">Enter a new address</Label></div>
                        </RadioGroup>

                        {deliveryAddressSource === 'saved' && (
                          <Select value={selectedAddressId} onValueChange={id => {
                              setSelectedAddressId(id);
                              const selected = userAddresses.find(addr => addr.id === id);
                              if(selected) validateDeliveryAddress(selected);
                          }}>
                            <SelectTrigger><SelectValue placeholder="Select an address..." /></SelectTrigger>
                            <SelectContent>
                              {userAddresses.map(addr => (
                                <SelectItem key={addr.id} value={addr.id}>{addr.label}: {addr.full_address}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )}
                    
                    {/* Address Autocomplete: Show for guests, new users (no saved address), or when "Enter new" is selected */}
                    {
                      (isGuest || !currentUser || (currentUser && deliveryAddressSource === 'new')) && (
                        <AddressAutocomplete
                          onAddressChange={isGuest ? (addr) => {
                            setGuestInfo({...guestInfo, address: addr});
                            if (addr && !addr.manual) {
                              validateDeliveryAddress(addr);
                            } else {
                              setInDeliveryZone(false);
                              setDeliveryDistance(null);
                            }
                          } : handleAddressChange}
                          value={isGuest ? guestInfo.address : newAddress}
                        />
                      )
                    }
                  </div>
                  
                  {/* SMS Opt-in */}
                  {(isGuest || (currentUser && !isSmsSubscribed)) && (
                    <div className="flex items-start space-x-2 pt-4 border-t">
                      <Checkbox id="sms-opt-in" checked={smsOptIn} onCheckedChange={setSmsOptIn} />
                      <div className="grid gap-1.5 leading-none">
                        <Label htmlFor="sms-opt-in" className="text-sm font-medium">
                          Receive order updates and promotions via SMS.
                        </Label>
                        <p className="text-xs text-gray-500">
                          This is the only way to receive notifications for your orders.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category and Menu Items */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category === "all" ? "All Items" : 
                   category === "baked_good" ? "Baked Goods" : 
                   category === "box" ? "Box Meals" : 
                   category}
                </Button>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredMenuItems.map(item => {
                const isLimitedStock = (item.category === 'soup' || item.category === 'box') 
                  ? item.variants && item.variants.some(v => v.units_available <= 5 && v.units_available > 0)
                  : item.units_available <= 5 && item.units_available > 0;

                return (
                  <Card key={item.id} className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {item.name}
                            {isLimitedStock && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-600 text-xs">
                                Limited
                              </Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {(item.category === 'soup' || item.category === 'box') && item.variants && item.variants.length > 0 ? (
                        <div className="space-y-2">
                          {item.variants.filter(v => v.units_available > 0).map((variant, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{variant.name}</span>
                                <span className="text-gray-600 ml-2">${variant.price.toFixed(2)}</span>
                                {variant.units_available <= 5 && (
                                  <Badge variant="outline" className="ml-2 text-xs bg-orange-50 text-orange-600">
                                    Only {variant.units_available} left
                                  </Badge>
                                )}
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => addToCart(item, variant)}
                                disabled={variant.units_available <= 0}
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-lg">${item.price.toFixed(2)}</span>
                            {item.units_available <= 5 && (
                              <Badge variant="outline" className="ml-2 text-xs bg-orange-50 text-orange-600">
                                Only {item.units_available} left
                              </Badge>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => addToCart(item)}
                            disabled={item.units_available <= 0}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Your Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length > 0 && (
                  <>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {cart.map(item => (
                        <div key={item.cartKey} className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">${item.price.toFixed(2)} ea.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateCartQuantity(item.cartKey, -1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-semibold">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateCartQuantity(item.cartKey, 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${totals.subtotal.toFixed(2)}</span>
                      </div>
                      {taxSettings.is_tax_enabled && (
                        <div className="flex justify-between">
                          <span>{totals.taxDisplayName} ({(taxSettings.tax_percentage * 100).toFixed(1)}%):</span>
                          <span>${totals.tax.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${totals.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <Separator />

                    {/* Payment Method */}
                    <div className="space-y-3">
                      <Label className="font-semibold">Payment Method</Label>
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className="flex items-center space-x-2 border rounded-md p-3 has-[:checked]:bg-orange-50 has-[:checked]:border-orange-300">
                          <RadioGroupItem value="cash" id="cash" />
                          <Label htmlFor="cash" className="flex-1 cursor-pointer">Cash (Pay on Delivery)</Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-3 has-[:checked]:bg-orange-50 has-[:checked]:border-orange-300">
                          <RadioGroupItem value="venmo" id="venmo" />
                          <Label htmlFor="venmo" className="flex-1 cursor-pointer">Venmo</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-3">
                      {/* Distance Display */}
                      {isCalculatingDistance && (
                        <div className="text-sm text-gray-600">
                          Calculating distance...
                        </div>
                      )}
                      {!isCalculatingDistance && deliveryDistance !== null && (
                        <div className={`text-sm font-medium ${deliveryDistance <= MAX_DELIVERY_DISTANCE_MILES ? 'text-green-600' : 'text-red-600'}`}>
                          Distance from {STORE_ADDRESS}: {deliveryDistance.toFixed(1)} miles
                          {deliveryDistance > MAX_DELIVERY_DISTANCE_MILES && (
                            <span className="block text-xs mt-1">
                              (Maximum delivery distance is {MAX_DELIVERY_DISTANCE_MILES} miles)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Delivery Zone Checkbox */}
                      <div className="items-top flex space-x-2">
                        <Checkbox
                          id="delivery-zone"
                          checked={inDeliveryZone}
                          onCheckedChange={(checked) => {
                            if (checked && deliveryDistance !== null && deliveryDistance > MAX_DELIVERY_DISTANCE_MILES) {
                              alert(`Sorry, your delivery address is ${deliveryDistance.toFixed(1)} miles away. We only deliver within ${MAX_DELIVERY_DISTANCE_MILES} miles.`);
                              return;
                            }
                            setInDeliveryZone(checked);
                          }}
                          disabled={deliveryDistance !== null && deliveryDistance > MAX_DELIVERY_DISTANCE_MILES}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor="delivery-zone"
                            className={`font-medium ${deliveryDistance !== null && deliveryDistance > MAX_DELIVERY_DISTANCE_MILES ? 'text-gray-400' : ''}`}
                          >
                            I am within the delivery area.
                          </Label>
                          <Button variant="link" className="p-0 h-auto text-orange-600" onClick={() => setShowDeliveryArea(true)}>
                            View Delivery Map
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmitOrder}
                      disabled={cart.length === 0 || isSubmitting || !paymentMethod || !inDeliveryZone || 
                                (isGuest && (!guestInfo.name || !guestInfo.email || !guestInfo.phone || !guestInfo.address?.formatted_address || guestInfo.address?.manual)) ||
                                (!isGuest && ((!currentUser?.phone && !phone) || // No phone for logged-in user
                                              (deliveryAddressSource === 'saved' && !selectedAddressId) || // No saved address selected
                                              (deliveryAddressSource === 'new' && (!newAddress?.formatted_address || newAddress?.manual))))
                              }
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? 'Placing Order...' : `Place Order ($${totals.total.toFixed(2)})`}
                    </Button>
                  </>
                )}
                 {cart.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>Your cart is empty</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
