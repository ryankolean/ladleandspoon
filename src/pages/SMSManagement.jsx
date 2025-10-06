
import React, { useState, useEffect } from "react";
import { SMSSubscription, SMSCampaign } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users, Send, Settings } from "lucide-react";

import SMSCampaignCreator from "../components/sms/SMSCampaignCreator";
import SMSSubscribersList from "../components/sms/SMSSubscribersList";
import SMSCampaignsList from "../components/sms/SMSCampaignsList";
import SMSComplianceSettings from "../components/sms/SMSComplianceSettings";
import AdminOnly from "../components/auth/AdminOnly";

export default function SMSManagement() {
  const [subscribers, setSubscribers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("campaigns"); // Changed from showCampaignCreator

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true); // Set loading to true at the start
    try {
      const [subscribersData, campaignsData] = await Promise.all([
        SMSSubscription.filter({ is_subscribed: true }),
        SMSCampaign.list("-created_at")
      ]);
      
      setSubscribers(subscribersData);
      setCampaigns(campaignsData);
    } catch (error) {
      console.error("Error loading SMS data:", error);
    } finally {
      setIsLoading(false); // Ensure loading is set to false
    }
  };

  const handleCampaignCreate = async (campaignData) => {
    await SMSCampaign.create(campaignData);
    await loadData(); // Await loadData to ensure data is fresh before tab change
    setActiveTab("campaigns"); // Automatically switch to campaigns tab after creation
  };

  const activeSubscribers = subscribers.filter(sub => sub.is_subscribed).length;

  return (
    <AdminOnly>
      <div className="p-4 md:p-8 min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SMS Marketing</h1>
              <p className="text-gray-600 mt-1">Manage SMS campaigns and subscribers</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-white">
                {activeSubscribers} Active Subscribers
              </Badge>
              <Button 
                onClick={() => setActiveTab("create")} // Changed to set activeTab
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-5 h-5 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6"> {/* Control tabs with activeTab state */}
            <TabsList className="grid w-full grid-cols-4 bg-white">
              <TabsTrigger value="campaigns" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="subscribers" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Subscribers
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Create
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Compliance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns">
              <SMSCampaignsList 
                campaigns={campaigns} 
                isLoading={isLoading}
                onRefresh={loadData}
              />
            </TabsContent>

            <TabsContent value="subscribers">
              <SMSSubscribersList 
                subscribers={subscribers} 
                isLoading={isLoading}
                onRefresh={loadData}
              />
            </TabsContent>

            <TabsContent value="create">
              <SMSCampaignCreator 
                onSubmit={handleCampaignCreate}
                subscribersCount={activeSubscribers}
              />
            </TabsContent>

            <TabsContent value="settings">
              <SMSComplianceSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminOnly>
  );
}
