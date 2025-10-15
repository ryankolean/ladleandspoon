import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';
import { Send, CheckCircle2, XCircle, Clock, Smartphone } from 'lucide-react';
import { TextBee } from '@/services/textbee';

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

export default function SMSCampaignsList({ campaigns, isLoading, onRefresh }) {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [sendingCampaignId, setSendingCampaignId] = useState(null);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [deviceError, setDeviceError] = useState(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoadingDevices(true);
      setDeviceError(null);
      const response = await TextBee.getDevices();
      if (response && response.data) {
        setDevices(response.data);
        if (response.data.length > 0) {
          setSelectedDevice(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading devices:', error);
      setDeviceError(error.message || 'Failed to load devices');
    } finally {
      setLoadingDevices(false);
    }
  };

  const handleSendCampaign = async (campaignId) => {
    if (!selectedDevice) {
      alert('Please select a device to send from');
      return;
    }

    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) {
      return;
    }

    try {
      setSendingCampaignId(campaignId);
      await TextBee.sendCampaign(campaignId, selectedDevice);
      alert('Campaign sent successfully!');
      onRefresh();
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert(`Failed to send campaign: ${error.message}`);
      onRefresh();
    } finally {
      setSendingCampaignId(null);
    }
  };

  if (isLoading) {
    return <Card><CardContent className="p-8 text-center">Loading campaigns...</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            TextBee Device
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingDevices ? (
            <p className="text-gray-500">Loading devices...</p>
          ) : deviceError ? (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{deviceError}</AlertDescription>
            </Alert>
          ) : devices.length === 0 ? (
            <Alert>
              <AlertDescription>
                No devices found. Please connect a device in your TextBee dashboard.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <Label>Select Device to Send From</Label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a device..." />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name || device.phone_number || `Device ${device.id.substring(0, 8)}`}
                      {device.is_online && ' (Online)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {devices.find(d => d.id === selectedDevice)?.is_online === false && (
                <p className="text-sm text-amber-600">⚠️ Selected device is offline</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
                <div key={campaign.id} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{campaign.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={statusColors[campaign.status] || statusColors.draft}>
                          {campaign.status}
                        </Badge>
                        {campaign.sent_count > 0 && (
                          <span className="text-sm text-gray-600">
                            {campaign.sent_count} sent
                          </span>
                        )}
                        {campaign.failed_count > 0 && (
                          <span className="text-sm text-red-600">
                            {campaign.failed_count} failed
                          </span>
                        )}
                      </div>
                    </div>
                    {campaign.status === 'draft' && (
                      <Button
                        onClick={() => handleSendCampaign(campaign.id)}
                        disabled={sendingCampaignId === campaign.id || !selectedDevice || devices.length === 0}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        {sendingCampaignId === campaign.id ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Now
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{campaign.message}</p>

                  <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3">
                    <span>{campaign.recipient_count} recipient{campaign.recipient_count !== 1 ? 's' : ''}</span>
                    {campaign.sent_at ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Sent {format(new Date(campaign.sent_at), "MMM d, HH:mm")}
                      </span>
                    ) : campaign.created_at ? (
                      <span>Created {format(new Date(campaign.created_at), "MMM d, HH:mm")}</span>
                    ) : null}
                  </div>

                  {campaign.error_message && (
                    <Alert variant="destructive" className="mt-3">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{campaign.error_message}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
