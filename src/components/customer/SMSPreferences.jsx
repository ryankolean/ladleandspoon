
import React, { useState, useEffect, useCallback } from 'react';
import { SMSSubscription } from '@/services';
import { User } from '@/services';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Shield, Info } from "lucide-react";

export default function SMSPreferences({ currentUser }) {
  const [subscription, setSubscription] = useState(null);
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [preferences, setPreferences] = useState({
    order_updates: true,
    promotions: false,
    all_notifications: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSubscription = useCallback(async () => {
    if (!currentUser?.phone) {
      setIsLoading(false);
      return;
    }

    try {
      const subscriptions = await SMSSubscription.filter({ phone_number: currentUser.phone });
      if (subscriptions.length > 0) {
        const sub = subscriptions[0];
        setSubscription(sub);
        setPreferences({
          order_updates: sub.subscription_type === 'order_updates' || sub.subscription_type === 'all',
          promotions: sub.subscription_type === 'promotions' || sub.subscription_type === 'all',
          all_notifications: sub.subscription_type === 'all'
        });
      }
    } catch (error) {
      console.error("Error loading SMS subscription:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.phone]); // Added currentUser?.phone as a dependency for useCallback

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]); // Now loadSubscription is a stable dependency

  const handleSubscribe = async () => {
    if (!phone) {
      alert("Please enter a phone number");
      return;
    }

    setIsSaving(true);
    try {
      const subscriptionType = preferences.all_notifications ? 'all' : 
                              preferences.order_updates && preferences.promotions ? 'all' :
                              preferences.order_updates ? 'order_updates' : 'promotions';

      if (subscription) {
        await SMSSubscription.update(subscription.id, {
          is_subscribed: true,
          subscription_type: subscriptionType,
          phone_number: phone
        });
      } else {
        await SMSSubscription.create({
          phone_number: phone,
          customer_name: currentUser.full_name,
          customer_email: currentUser.email,
          is_subscribed: true,
          subscription_type: subscriptionType,
          opted_in_date: new Date().toISOString(),
          consent_method: 'website'
        });
      }

      // Update user phone if needed
      if (phone !== currentUser.phone) {
        await User.updateMyUserData({ phone });
      }

      alert("SMS preferences updated successfully!");
      loadSubscription();
    } catch (error) {
      console.error("Error updating SMS preferences:", error);
      alert("Error updating preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!subscription) return;

    setIsSaving(true);
    try {
      await SMSSubscription.update(subscription.id, {
        is_subscribed: false,
        opted_out_date: new Date().toISOString()
      });
      
      alert("Successfully unsubscribed from SMS notifications.");
      loadSubscription();
    } catch (error) {
      console.error("Error unsubscribing:", error);
      alert("Error unsubscribing. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          SMS Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="w-4 h-4" />
          <AlertDescription className="text-blue-800">
            Stay updated on your orders and special offers via SMS. You can unsubscribe at any time by replying STOP.
          </AlertDescription>
        </Alert>

        <div>
          <Label>Phone Number</Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 555-5555"
            disabled={!!subscription?.is_subscribed}
          />
          {subscription?.is_subscribed && (
            <p className="text-sm text-gray-500 mt-1">
              To change your phone number, please unsubscribe and re-register.
            </p>
          )}
        </div>

        {phone && (
          <div className="space-y-4">
            <h4 className="font-semibold">Notification Preferences</h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="order-updates"
                  checked={preferences.order_updates}
                  onCheckedChange={(checked) => setPreferences(prev => ({...prev, order_updates: checked}))}
                  disabled={subscription?.is_subscribed}
                />
                <Label htmlFor="order-updates" className="text-sm">
                  Order status updates (recommended)
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="promotions"
                  checked={preferences.promotions}
                  onCheckedChange={(checked) => setPreferences(prev => ({...prev, promotions: checked}))}
                  disabled={subscription?.is_subscribed}
                />
                <Label htmlFor="promotions" className="text-sm">
                  Weekly specials and promotions
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="all-notifications"
                  checked={preferences.all_notifications}
                  onCheckedChange={(checked) => setPreferences(prev => ({...prev, all_notifications: checked}))}
                  disabled={subscription?.is_subscribed}
                />
                <Label htmlFor="all-notifications" className="text-sm font-medium">
                  All notifications (orders + promotions)
                </Label>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          {subscription?.is_subscribed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">You're subscribed to SMS notifications</span>
              </div>
              <Button
                onClick={handleUnsubscribe}
                disabled={isSaving}
                variant="outline"
                className="w-full"
              >
                {isSaving ? "Unsubscribing..." : "Unsubscribe from SMS"}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                You can also text STOP to {phone} to unsubscribe instantly
              </p>
            </div>
          ) : (
            <Button
              onClick={handleSubscribe}
              disabled={isSaving || !phone || (!preferences.order_updates && !preferences.promotions && !preferences.all_notifications)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isSaving ? "Subscribing..." : "Subscribe to SMS Notifications"}
            </Button>
          )}
        </div>

        <Alert className="border-gray-200 bg-gray-50">
          <Shield className="w-4 h-4" />
          <AlertDescription className="text-gray-700">
            <strong>Privacy:</strong> We'll never share your phone number. Standard message and data rates may apply. 
            You can opt out anytime by texting STOP.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
