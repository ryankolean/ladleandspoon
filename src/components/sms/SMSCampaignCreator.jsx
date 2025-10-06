import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SMSCampaignCreator({ onSubmit, subscribersCount }) {
  const [campaign, setCampaign] = useState({
    name: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...campaign,
      status: 'draft',
      recipient_count: subscribersCount
    });
    setCampaign({ name: '', message: '' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New SMS Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Campaign Name</Label>
            <Input
              value={campaign.name}
              onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
              placeholder="e.g., Weekly Special"
              required
            />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea
              value={campaign.message}
              onChange={(e) => setCampaign({ ...campaign, message: e.target.value })}
              placeholder="Your message here..."
              rows={4}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Will be sent to {subscribersCount} subscribers
            </p>
          </div>
          <Button type="submit" className="w-full">Create Campaign</Button>
        </form>
      </CardContent>
    </Card>
  );
}
