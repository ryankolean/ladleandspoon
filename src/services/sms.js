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
