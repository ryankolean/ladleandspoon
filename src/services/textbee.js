import { supabase } from '@/lib/supabase';

const TEXTBEE_API_KEY = '2ff91cc0-7d25-4f34-b8d3-75e16274d959';
const TEXTBEE_BASE_URL = 'https://api.textbee.dev/api/v1/gateway';

export const TextBee = {
  async getDevices() {
    try {
      const response = await fetch(`${TEXTBEE_BASE_URL}/devices`, {
        method: 'GET',
        headers: {
          'x-api-key': TEXTBEE_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch devices: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching TextBee devices:', error);
      throw error;
    }
  },

  async sendSMS(deviceId, recipients, message) {
    try {
      const response = await fetch(`${TEXTBEE_BASE_URL}/devices/${deviceId}/send-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TEXTBEE_API_KEY,
        },
        body: JSON.stringify({
          recipients,
          message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to send SMS: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending SMS via TextBee:', error);
      throw error;
    }
  },

  async sendCampaign(campaignId, deviceId) {
    try {
      const { data: campaign, error: campaignError } = await supabase
        .from('sms_campaigns')
        .select('*')
        .eq('id', campaignId)
        .maybeSingle();

      if (campaignError) throw campaignError;
      if (!campaign) throw new Error('Campaign not found');

      const recipients = campaign.recipients || [];

      if (recipients.length === 0) {
        throw new Error('No recipients selected for this campaign');
      }

      const result = await this.sendSMS(deviceId, recipients, campaign.message);

      await supabase
        .from('sms_campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_count: recipients.length,
          textbee_response: result,
        })
        .eq('id', campaignId);

      return result;
    } catch (error) {
      await supabase
        .from('sms_campaigns')
        .update({
          status: 'failed',
          error_message: error.message,
          failed_count: 1,
        })
        .eq('id', campaignId);

      throw error;
    }
  },
};
