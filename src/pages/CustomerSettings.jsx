import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserIcon, Save } from "lucide-react";

import SMSPreferences from "../components/customer/SMSPreferences";

export default function CustomerSettings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userInfo, setUserInfo] = useState({ phone: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      setUserInfo({ phone: user.phone || "" });
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData(userInfo);
      alert("Profile updated successfully!");
      loadUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Please log in to access your settings.</p>
            <Button onClick={() => User.login()} className="mt-4">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Account Settings
          </h1>
          <p className="text-gray-600 mt-2">Manage your preferences and notifications</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={currentUser.full_name} disabled className="bg-gray-50" />
                <p className="text-sm text-gray-500 mt-1">Name cannot be changed here. Contact support if needed.</p>
              </div>
              
              <div>
                <Label>Email Address</Label>
                <Input value={currentUser.email} disabled className="bg-gray-50" />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed here. Contact support if needed.</p>
              </div>

              <div>
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                  placeholder="(555) 555-5555"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* SMS Preferences */}
          <SMSPreferences currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}