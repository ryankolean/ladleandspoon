import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SMSSubscription } from "@/services";
import { Users, Search, CheckCircle2 } from "lucide-react";

export default function SMSCampaignCreator({ onSubmit, subscribersCount }) {
  const [campaign, setCampaign] = useState({
    name: '',
    message: ''
  });
  const [subscribers, setSubscribers] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      const data = await SMSSubscription.filter({ is_subscribed: true });
      setSubscribers(data);
      const allPhones = data.map(sub => sub.phone_number);
      setSelectedRecipients(allPhones);
      setSelectAll(true);
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRecipient = (phoneNumber) => {
    setSelectedRecipients(prev => {
      if (prev.includes(phoneNumber)) {
        return prev.filter(p => p !== phoneNumber);
      } else {
        return [...prev, phoneNumber];
      }
    });
    setSelectAll(false);
  };

  const handleToggleAll = () => {
    if (selectAll) {
      setSelectedRecipients([]);
      setSelectAll(false);
    } else {
      const allPhones = filteredSubscribers.map(sub => sub.phone_number);
      setSelectedRecipients(allPhones);
      setSelectAll(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedRecipients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    onSubmit({
      ...campaign,
      status: 'draft',
      recipient_count: selectedRecipients.length,
      recipients: selectedRecipients
    });
    setCampaign({ name: '', message: '' });
    setSelectedRecipients([]);
    setSelectAll(false);
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const searchLower = searchTerm.toLowerCase();
    return (
      sub.phone_number?.toLowerCase().includes(searchLower) ||
      sub.customer_name?.toLowerCase().includes(searchLower) ||
      sub.customer_email?.toLowerCase().includes(searchLower)
    );
  });

  const characterCount = campaign.message.length;
  const messageCount = Math.ceil(characterCount / 160) || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                placeholder="e.g., Weekly Special - Oct 15"
                required
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                value={campaign.message}
                onChange={(e) => setCampaign({ ...campaign, message: e.target.value })}
                placeholder="Your message here..."
                rows={6}
                required
                maxLength={1600}
              />
              <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                <span>{characterCount} / 1600 characters</span>
                <span>{messageCount} SMS message{messageCount > 1 ? 's' : ''}</span>
              </div>
            </div>

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                This message will be sent to <strong>{selectedRecipients.length}</strong> recipient{selectedRecipients.length !== 1 ? 's' : ''}
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={selectedRecipients.length === 0}
            >
              Create Campaign
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Select Recipients
            </CardTitle>
            <Badge variant="outline">
              {selectedRecipients.length} / {filteredSubscribers.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="pl-10"
            />
          </div>

          <div className="flex items-center space-x-2 border-b pb-3">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={handleToggleAll}
            />
            <Label htmlFor="select-all" className="font-semibold cursor-pointer">
              Select All ({filteredSubscribers.length})
            </Label>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading subscribers...</div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No subscribers found' : 'No active subscribers'}
              </div>
            ) : (
              filteredSubscribers.map((subscriber) => (
                <div
                  key={subscriber.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer hover:bg-gray-50 ${
                    selectedRecipients.includes(subscriber.phone_number)
                      ? 'bg-green-50 border-green-300'
                      : 'bg-white border-gray-200'
                  }`}
                  onClick={() => handleToggleRecipient(subscriber.phone_number)}
                >
                  <Checkbox
                    checked={selectedRecipients.includes(subscriber.phone_number)}
                    onCheckedChange={() => handleToggleRecipient(subscriber.phone_number)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {subscriber.customer_name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">{subscriber.phone_number}</p>
                    {subscriber.customer_email && (
                      <p className="text-xs text-gray-500 truncate">{subscriber.customer_email}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
