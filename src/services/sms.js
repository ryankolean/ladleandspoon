import { supabase } from '../lib/supabase';

export async function getConversations() {
  const { data, error } = await supabase
    .from('sms_conversations')
    .select(`
      *,
      customer:profiles!sms_conversations_customer_id_fkey(
        id,
        first_name,
        last_name,
        phone
      )
    `)
    .eq('status', 'active')
    .order('last_message_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getConversationMessages(conversationId) {
  const { data, error } = await supabase
    .from('sms_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getConversationByPhone(phoneNumber) {
  const { data, error } = await supabase
    .from('sms_conversations')
    .select('*')
    .eq('customer_phone', phoneNumber)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function sendSMS({ to, body, fromNumber }) {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication required');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ to, body, fromNumber }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to send SMS');
  }

  return result;
}

export async function markConversationAsRead(conversationId) {
  const { error } = await supabase.rpc('mark_messages_as_read', {
    p_conversation_id: conversationId
  });

  if (error) throw error;
}

export async function getAuthorizedPhoneNumbers() {
  const { data, error } = await supabase
    .from('authorized_phone_numbers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function addAuthorizedPhoneNumber({ phoneNumber, notes }) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, phone, sms_consent')
    .eq('phone', phoneNumber)
    .maybeSingle();

  if (!profile) {
    throw new Error('Phone number not found in customer database');
  }

  const { data: optOut } = await supabase
    .from('sms_opt_outs')
    .select('phone_number')
    .eq('phone_number', phoneNumber)
    .maybeSingle();

  if (optOut) {
    throw new Error('Customer has opted out of SMS communications');
  }

  if (!profile.sms_consent) {
    throw new Error('Customer has not consented to SMS communications');
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('authorized_phone_numbers')
    .insert({
      phone_number: phoneNumber,
      compliance_verified: true,
      verification_date: new Date().toISOString(),
      verification_notes: notes,
      added_by: user?.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Phone number already authorized');
    }
    throw error;
  }

  return data;
}

export async function removeAuthorizedPhoneNumber(id) {
  const { error } = await supabase
    .from('authorized_phone_numbers')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}

export async function getOptOuts() {
  const { data, error } = await supabase
    .from('sms_opt_outs')
    .select('*')
    .order('opted_out_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getEligibleSMSUsers() {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sms-eligible-users`;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication required');
  }

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to fetch eligible SMS users');
  }

  return result;
}

export async function sendBatchSMS({ userIds, messageTemplate }) {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-batch-sms`;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication required');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userIds, messageTemplate }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to send batch SMS');
  }

  return result;
}

export async function getBatchCampaignSummary(batchId) {
  const { data, error } = await supabase.rpc('get_batch_campaign_summary', {
    p_batch_id: batchId
  });

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

export async function getMessageAuditHistory(filters = {}) {
  let query = supabase
    .from('sms_message_audit')
    .select(`
      *,
      user:profiles!sms_message_audit_user_id_fkey(first_name, last_name, email),
      sender:profiles!sms_message_audit_sent_by_fkey(first_name, last_name)
    `)
    .order('sent_at', { ascending: false });

  if (filters.batchId) {
    query = query.eq('batch_id', filters.batchId);
  }

  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }

  if (filters.status) {
    query = query.eq('twilio_status', filters.status);
  }

  if (filters.dateFrom) {
    query = query.gte('sent_at', filters.dateFrom);
  }

  if (filters.dateTo) {
    query = query.lte('sent_at', filters.dateTo);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  } else {
    query = query.limit(100);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getBatchCampaigns(limit = 50) {
  const { data, error } = await supabase
    .from('sms_message_audit')
    .select('batch_id, sent_at, template_used, sent_by, profiles!sms_message_audit_sent_by_fkey(first_name, last_name)')
    .not('batch_id', 'is', null)
    .order('sent_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const uniqueBatches = [];
  const seenBatchIds = new Set();

  for (const record of data || []) {
    if (!seenBatchIds.has(record.batch_id)) {
      seenBatchIds.add(record.batch_id);
      uniqueBatches.push(record);
    }
  }

  return uniqueBatches;
}

export async function searchMessages(query, dateFrom, dateTo) {
  let queryBuilder = supabase
    .from('sms_messages')
    .select('*, conversation:sms_conversations(customer_phone)')
    .order('sent_at', { ascending: false });

  if (query) {
    queryBuilder = queryBuilder.ilike('body', `%${query}%`);
  }

  if (dateFrom) {
    queryBuilder = queryBuilder.gte('sent_at', dateFrom);
  }

  if (dateTo) {
    queryBuilder = queryBuilder.lte('sent_at', dateTo);
  }

  const { data, error } = await queryBuilder.limit(100);

  if (error) throw error;
  return data;
}

export function subscribeToConversations(callback) {
  const channel = supabase
    .channel('sms-conversations')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sms_conversations'
      },
      callback
    )
    .subscribe();

  return channel;
}

export function subscribeToMessages(conversationId, callback) {
  const channel = supabase
    .channel(`sms-messages-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'sms_messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      callback
    )
    .subscribe();

  return channel;
}
