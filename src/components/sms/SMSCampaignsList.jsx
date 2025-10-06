import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

export default function SMSCampaignsList({ campaigns, isLoading }) {
  if (isLoading) {
    return <Card><CardContent className="p-8 text-center">Loading...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS Campaigns</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {campaigns.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No campaigns yet</p>
          ) : (
            campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{campaign.name}</h3>
                  <Badge variant={campaign.status === 'sent' ? 'default' : 'secondary'}>
                    {campaign.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{campaign.message}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{campaign.recipient_count} recipients</span>
                  {campaign.created_at && (
                    <span>Created {format(new Date(campaign.created_at), "MMM d, HH:mm")}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
