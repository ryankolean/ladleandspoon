import React, { useState, useEffect } from 'react';
import { User } from '@/services';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PersonalInfo() {
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    sms_consent: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await User.me();
        setUserData({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          date_of_birth: user.date_of_birth || '',
          sms_consent: user.sms_consent || false
        });
      } catch (error) {
        console.error("Failed to load user data", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await User.updateMyUserData({
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        date_of_birth: userData.date_of_birth,
        sms_consent: userData.sms_consent,
        sms_consent_method: 'profile_update',
        sms_consent_date: userData.sms_consent ? new Date().toISOString() : null
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-1/4" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="first_name">First Name *</Label>
        <Input id="first_name" name="first_name" value={userData.first_name} onChange={handleInputChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last_name">Last Name *</Label>
        <Input id="last_name" name="last_name" value={userData.last_name} onChange={handleInputChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" value={userData.email} disabled />
        <p className="text-xs text-gray-500">Email cannot be changed.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" name="phone" type="tel" value={userData.phone} onChange={handleInputChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="date_of_birth">Date of Birth</Label>
        <Input id="date_of_birth" name="date_of_birth" type="date" value={userData.date_of_birth} onChange={handleInputChange} />
      </div>

      <div className="border-t pt-6 mt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#8B4513]" />
              <Label className="text-base font-semibold">SMS Notifications</Label>
            </div>
          </div>

          <div className="bg-[#FFF8E1] border border-[#E6B85C]/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="sms_consent"
                checked={userData.sms_consent}
                onCheckedChange={(checked) => setUserData(prev => ({ ...prev, sms_consent: checked }))}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="sms_consent" className="text-sm font-medium text-[#654321] cursor-pointer">
                  I agree to receive SMS notifications for order updates and promotional offers
                </label>
                <p className="text-xs text-[#8B4513]/60 mt-1">
                  Message frequency varies. Message and data rates may apply. Reply STOP to opt out.
                  View our{' '}
                  <Link to="/sms-terms" className="underline hover:text-[#8B4513]" target="_blank">
                    SMS Terms
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy-policy" className="underline hover:text-[#8B4513]" target="_blank">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSaving}>
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}