import React, { useState, useEffect } from 'react';
import { User } from '@/services';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { UserIcon, Save, Phone, Mail, MessageSquare, AlertCircle } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    sms_consent: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();

      if (!user) {
        navigate('/login');
        return;
      }

      setUserData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        sms_consent: user.sms_consent || false
      });
    } catch (error) {
      console.error("Error loading user data:", error);
      setMessage({ type: 'error', text: 'Failed to load profile data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await User.updateMyUserData({
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        sms_consent: userData.sms_consent,
        sms_consent_method: 'profile_update',
        sms_consent_date: userData.sms_consent ? new Date().toISOString() : null
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFEAA7] to-[#FEC37D] p-4">
        <div className="max-w-3xl mx-auto pt-8">
          <Skeleton className="h-12 w-64 mx-auto mb-8" />
          <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-[#FFEAA7] to-[#FEC37D] p-4 pb-24">
      <div className="max-w-3xl mx-auto pt-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-[#F56949] to-[#FEC37D] mb-4 shadow-lg">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#8B4513] mb-2">
            My Profile
          </h1>
          <p className="text-[#654321]/70 text-lg">
            Manage your account settings and preferences
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl ${
            message.type === 'success'
              ? 'bg-green-100 border-2 border-green-300 text-green-800'
              : 'bg-red-100 border-2 border-red-300 text-red-800'
          } flex items-center gap-3 animate-fade-in`}>
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#F56949] to-[#FEC37D] text-white">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <UserIcon className="w-6 h-6" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-[#8B4513] font-semibold flex items-center gap-2">
                    First Name *
                  </Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={userData.first_name}
                    onChange={handleInputChange}
                    required
                    className="border-2 border-[#E6B85C]/30 focus:border-[#F56949] rounded-xl h-12 text-lg"
                    placeholder="John"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-[#8B4513] font-semibold flex items-center gap-2">
                    Last Name *
                  </Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={userData.last_name}
                    onChange={handleInputChange}
                    required
                    className="border-2 border-[#E6B85C]/30 focus:border-[#F56949] rounded-xl h-12 text-lg"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#8B4513] font-semibold flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  value={userData.email}
                  disabled
                  className="bg-[#FFF8E1]/50 border-2 border-[#E6B85C]/30 rounded-xl h-12 text-lg"
                />
                <p className="text-sm text-[#654321]/60 mt-1">
                  Email cannot be changed. Contact support if you need to update it.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#8B4513] font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={userData.phone}
                  onChange={handleInputChange}
                  className="border-2 border-[#E6B85C]/30 focus:border-[#F56949] rounded-xl h-12 text-lg"
                  placeholder="(555) 555-5555"
                />
                <p className="text-sm text-[#654321]/60 mt-1">
                  Used for order updates and delivery coordination
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#E6B85C] to-[#FEC37D] text-white">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <MessageSquare className="w-6 h-6" />
                Communication Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="bg-[#FFF8E1] border-2 border-[#E6B85C]/30 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    id="sms_consent"
                    checked={userData.sms_consent}
                    onCheckedChange={(checked) => setUserData(prev => ({ ...prev, sms_consent: checked }))}
                    className="mt-1 h-6 w-6 border-2 border-[#8B4513]"
                  />
                  <div className="flex-1">
                    <label htmlFor="sms_consent" className="text-base font-semibold text-[#654321] cursor-pointer block mb-2">
                      Receive SMS notifications for order updates and special offers
                    </label>
                    <p className="text-sm text-[#8B4513]/70 mb-3">
                      Stay informed about your orders, delivery updates, and exclusive promotions sent directly to your phone.
                    </p>
                    <p className="text-xs text-[#8B4513]/60">
                      Message frequency varies. Message and data rates may apply. Reply STOP to opt out at any time.
                      View our{' '}
                      <Link to="/sms-terms" className="underline hover:text-[#F56949] font-medium" target="_blank">
                        SMS Terms
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy-policy" className="underline hover:text-[#F56949] font-medium" target="_blank">
                        Privacy Policy
                      </Link>.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-[#F56949] to-[#FEC37D] hover:from-[#E5583A] hover:to-[#E6B85C] text-white font-bold py-6 px-12 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Saving Changes...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <Save className="w-5 h-5" />
                  Save Changes
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
