import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, Users, Send } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  scheduled: "bg-blue-100 text-blue-800", 
  sent: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800"
};

export default function SMSCampaignsList({ campaigns, isLoading, onRefresh }) {
  return (
    <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          SMS Campaigns
          <Button onClick={onRefresh} variant="outline" size="sm">
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No campaigns created yet</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{campaign.name}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                      {campaign.message.length > 100 ? 
                        campaign.message.substring(0, 100) + "..." : 
                        campaign.message
                      }
                    </p>
                  </div>
                  <Badge className={statusColors[campaign.status]}>
                    {campaign.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    {campaign.recipients_count && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {campaign.recipients_count} recipients
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {campaign.sent_time ? 
                        `Sent ${format(new Date(campaign.sent_time), "MMM d, HH:mm")}` :
                        campaign.scheduled_time ?
                        `Scheduled ${format(new Date(campaign.scheduled_time), "MMM d, HH:mm")}` :
                        `Created ${format(new Date(campaign.created_date), "MMM d, HH:mm")}`
                      }
                    </span>
                  </div>
                  
                  {campaign.delivery_status && (
                    <div className="text-xs text-green-600">
                      ✓ {campaign.delivery_status.delivered} delivered
                      {campaign.delivery_status.failed > 0 && (
                        <span className="text-red-600 ml-2">
                          ✗ {campaign.delivery_status.failed} failed
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}