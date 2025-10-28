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

export async function replyToConversation({ conversationId, body }) {
  const { data: conversation, error: convError } = await supabase
    .from('sms_conversations')
    .select('customer_phone, customer_id')
    .eq('id', conversationId)
    .single();

  if (convError) throw convError;
  if (!conversation) throw new Error('Conversation not found');

  const result = await sendSMS({
    to: conversation.customer_phone,
    body: body
  });

  return result;
}

export async function getConversationWithMessages(conversationId) {
  const { data: conversation, error: convError } = await supabase
    .from('sms_conversations')
    .select(`
      *,
      customer:profiles!sms_conversations_customer_id_fkey(
        id,
        first_name,
        last_name,
        phone,
        email
      )
    `)
    .eq('id', conversationId)
    .single();

  if (convError) throw convError;

  const { data: messages, error: msgError } = await supabase
    .from('sms_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true });

  if (msgError) throw msgError;

  return {
    ...conversation,
    messages: messages || []
  };
}

export async function archiveConversation(conversationId) {
  const { error } = await supabase
    .from('sms_conversations')
    .update({ status: 'archived' })
    .eq('id', conversationId);

  if (error) throw error;
}

export async function unarchiveConversation(conversationId) {
  const { error } = await supabase
    .from('sms_conversations')
    .update({ status: 'active' })
    .eq('id', conversationId);

  if (error) throw error;
}

export async function getArchivedConversations() {
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
    .eq('status', 'archived')
    .order('last_message_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getConversationStats() {
  const { data: activeCount, error: activeError } = await supabase
    .from('sms_conversations')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');

  const { data: unreadCount, error: unreadError } = await supabase
    .from('sms_conversations')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
    .gt('unread_count', 0);

  if (activeError || unreadError) {
    throw activeError || unreadError;
  }

  return {
    totalActive: activeCount || 0,
    totalUnread: unreadCount || 0
  };
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

export async function pollMessageStatus(limit = 100) {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/poll-message-status?limit=${limit}`;

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
    throw new Error(result.error || 'Failed to poll message status');
  }

  return result;
}

export async function checkMessageStatus({ sid, messageId, batchId }) {
  if (!sid && !messageId && !batchId) {
    throw new Error('One of sid, messageId, or batchId is required');
  }

  const params = new URLSearchParams();
  if (sid) params.append('sid', sid);
  if (messageId) params.append('messageId', messageId);
  if (batchId) params.append('batchId', batchId);

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-message-status?${params.toString()}`;

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
    throw new Error(result.error || 'Failed to check message status');
  }

  return result;
}

export async function getBatchStatusBreakdown(batchId) {
  const { data, error } = await supabase.rpc('get_batch_status_breakdown', {
    p_batch_id: batchId
  });

  if (error) throw error;
  return data || [];
}

export async function getAuditLogs({
  page = 1,
  limit = 50,
  search = '',
  status = 'all',
  direction = 'all',
  dateFrom = null,
  dateTo = null
}) {
  let auditQuery = supabase
    .from('sms_message_audit')
    .select(`
      *,
      user:profiles!sms_message_audit_user_id_fkey(
        id,
        first_name,
        last_name,
        email,
        phone
      ),
      sender:profiles!sms_message_audit_sent_by_fkey(
        id,
        first_name,
        last_name,
        email
      )
    `, { count: 'exact' });

  let messagesQuery = supabase
    .from('sms_messages')
    .select(`
      *,
      conversation:sms_conversations!inner(
        customer_phone,
        customer:profiles(
          id,
          first_name,
          last_name,
          email,
          phone
        )
      )
    `, { count: 'exact' });

  if (search) {
    const searchPattern = `%${search}%`;
    auditQuery = auditQuery.or(`phone_number.ilike.${searchPattern},message_body.ilike.${searchPattern}`);
    messagesQuery = messagesQuery.or(`body.ilike.${searchPattern},from_number.ilike.${searchPattern},to_number.ilike.${searchPattern}`);
  }

  if (status !== 'all') {
    auditQuery = auditQuery.eq('twilio_status', status);
    messagesQuery = messagesQuery.eq('status', status);
  }

  if (direction !== 'all') {
    messagesQuery = messagesQuery.eq('direction', direction);
  }

  if (dateFrom) {
    auditQuery = auditQuery.gte('sent_at', dateFrom);
    messagesQuery = messagesQuery.gte('sent_at', dateFrom);
  }

  if (dateTo) {
    auditQuery = auditQuery.lte('sent_at', dateTo);
    messagesQuery = messagesQuery.lte('sent_at', dateTo);
  }

  const offset = (page - 1) * limit;

  const [auditResult, messagesResult] = await Promise.all([
    auditQuery.order('sent_at', { ascending: false }).range(offset, offset + limit - 1),
    messagesQuery.order('sent_at', { ascending: false }).range(offset, offset + limit - 1)
  ]);

  if (auditResult.error) throw auditResult.error;
  if (messagesResult.error) throw messagesResult.error;

  const auditRecords = (auditResult.data || []).map(record => ({
    id: record.id,
    type: 'campaign',
    recipient: record.user ? `${record.user.first_name} ${record.user.last_name}` : 'Unknown',
    recipientPhone: record.phone_number,
    recipientEmail: record.user?.email,
    sentBy: record.sender ? `${record.sender.first_name} ${record.sender.last_name}` : 'System',
    sentAt: record.sent_at,
    messageBody: record.message_body,
    template: record.template_used,
    status: record.twilio_status,
    twilioSid: record.twilio_message_sid,
    errorCode: record.error_code,
    errorMessage: record.error_message,
    batchId: record.batch_id,
    direction: 'outbound'
  }));

  const messageRecords = (messagesResult.data || []).map(record => ({
    id: record.id,
    type: 'conversation',
    recipient: record.conversation?.customer
      ? `${record.conversation.customer.first_name} ${record.conversation.customer.last_name}`
      : 'Unknown',
    recipientPhone: record.direction === 'outbound' ? record.to_number : record.from_number,
    recipientEmail: record.conversation?.customer?.email,
    sentBy: record.direction === 'outbound' ? 'Admin' : 'Customer',
    sentAt: record.sent_at,
    messageBody: record.body,
    template: null,
    status: record.status,
    twilioSid: record.twilio_message_sid,
    errorCode: record.error_code,
    errorMessage: record.error_message,
    batchId: null,
    direction: record.direction
  }));

  const allRecords = [...auditRecords, ...messageRecords]
    .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
    .slice(0, limit);

  const totalCount = (auditResult.count || 0) + (messagesResult.count || 0);

  return {
    records: allRecords,
    total: totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit)
  };
}

export async function getOptOutHistory() {
  const { data, error } = await supabase
    .from('sms_opt_outs')
    .select('*')
    .order('opted_out_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAuditStatistics() {
  const { data: totalSent, error: sentError } = await supabase
    .from('sms_message_audit')
    .select('id', { count: 'exact', head: true });

  const { data: totalDelivered, error: deliveredError } = await supabase
    .from('sms_message_audit')
    .select('id', { count: 'exact', head: true })
    .eq('twilio_status', 'delivered');

  const { data: totalFailed, error: failedError } = await supabase
    .from('sms_message_audit')
    .select('id', { count: 'exact', head: true })
    .eq('twilio_status', 'failed');

  const { data: totalOptedOut, error: optedOutError } = await supabase
    .from('sms_opt_outs')
    .select('id', { count: 'exact', head: true });

  const { data: conversations } = await supabase
    .from('sms_messages')
    .select('id', { count: 'exact', head: true });

  if (sentError || deliveredError || failedError || optedOutError) {
    throw sentError || deliveredError || failedError || optedOutError;
  }

  return {
    totalSent: totalSent || 0,
    totalDelivered: totalDelivered || 0,
    totalFailed: totalFailed || 0,
    totalOptedOut: totalOptedOut || 0,
    totalConversations: conversations || 0,
    deliveryRate: totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0
  };
}

export function exportAuditToCSV(records) {
  const headers = [
    'Date/Time',
    'Type',
    'Direction',
    'Recipient Name',
    'Phone Number',
    'Email',
    'Message Body',
    'Status',
    'Sent By',
    'Twilio SID',
    'Error Code',
    'Error Message',
    'Batch ID'
  ];

  const rows = records.map(record => [
    new Date(record.sentAt).toLocaleString(),
    record.type,
    record.direction,
    record.recipient,
    record.recipientPhone,
    record.recipientEmail || 'N/A',
    record.messageBody,
    record.status,
    record.sentBy,
    record.twilioSid || 'N/A',
    record.errorCode || 'N/A',
    record.errorMessage || 'N/A',
    record.batchId || 'N/A'
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `sms-audit-log-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
