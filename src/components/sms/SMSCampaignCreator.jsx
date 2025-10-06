import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, MessageSquare, AlertTriangle } from "lucide-react";

export default function SMSCampaignCreator({ onSubmit, subscribersCount }) {
  const [campaign, setCampaign] = useState({
    name: "",
    message: "",
    target_audience: "all_subscribers",
    scheduled_time: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Add compliance footer to message
      const complianceMessage = campaign.message + "\n\nReply STOP to opt out. Ladle & Spoon";
      
      await onSubmit({
        ...campaign,
        message: complianceMessage,
        scheduled_time: campaign.scheduled_time || new Date().toISOString()
      });
      
      // Reset form
      setCampaign({
        name: "",
        message: "",
        target_audience: "all_subscribers",
        scheduled_time: ""
      });
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAudienceCount = () => {
    switch (campaign.target_audience) {
      case "all_subscribers":
        return subscribersCount;
      case "order_updates_only":
        return Math.floor(subscribersCount * 0.8); // Estimate
      case "promotions_only":
        return Math.floor(subscribersCount * 0.6); // Estimate
      default:
        return subscribersCount;
    }
  };

  const characterCount = campaign.message.length;
  const maxCharacters = 160;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Create SMS Campaign
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="text-amber-800">
            <strong>Compliance Notice:</strong> All SMS messages must comply with TCPA regulations. 
            Only send to customers who have opted in. "Reply STOP to opt out" will be automatically added.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Campaign Name</Label>
            <Input
              value={campaign.name}
              onChange={(e) => setCampaign({...campaign, name: e.target.value})}
              placeholder="e.g., Weekly Special Announcement"
              required
            />
          </div>

          <div>
            <Label>Target Audience</Label>
            <Select 
              value={campaign.target_audience} 
              onValueChange={(value) => setCampaign({...campaign, target_audience: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_subscribers">All Subscribers</SelectItem>
                <SelectItem value="order_updates_only">Order Updates Subscribers</SelectItem>
                <SelectItem value="promotions_only">Promotions Subscribers</SelectItem>
                <SelectItem value="recent_customers">Recent Customers</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              Estimated recipients: <Badge variant="outline">{getAudienceCount()}</Badge>
            </p>
          </div>

          <div>
            <Label className="flex items-center justify-between">
              Message
              <span className={`text-sm ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
                {characterCount}/{maxCharacters} characters
              </span>
            </Label>
            <Textarea
              value={campaign.message}
              onChange={(e) => setCampaign({...campaign, message: e.target.value})}
              placeholder="Your message here... Keep it short and clear!"
              className={`h-24 ${isOverLimit ? 'border-red-500' : ''}`}
              required
            />
            {isOverLimit && (
              <p className="text-sm text-red-600 mt-1">
                Message exceeds SMS character limit. Consider shortening your message.
              </p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Note: "Reply STOP to opt out. Ladle & Spoon" will be automatically added.
            </p>
          </div>

          <div>
            <Label>Schedule (Optional)</Label>
            <Input
              type="datetime-local"
              value={campaign.scheduled_time}
              onChange={(e) => setCampaign({...campaign, scheduled_time: e.target.value})}
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty to send immediately
            </p>
          </div>

          <div className="pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || isOverLimit || !campaign.name || !campaign.message}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                "Creating Campaign..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {campaign.scheduled_time ? 'Schedule Campaign' : 'Send Now'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}