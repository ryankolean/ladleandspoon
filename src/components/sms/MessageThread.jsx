import { useState, useEffect, useRef } from 'react';
import { Send, Phone, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { format } from 'date-fns';
import { getConversationMessages, sendSMS, markConversationAsRead, subscribeToMessages } from '../../services/sms';

export function MessageThread({ conversation, authorizedNumbers }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      return;
    }

    loadMessages();
    markAsRead();

    const channel = subscribeToMessages(conversation.id, (payload) => {
      if (payload.new) {
        setMessages(prev => [...prev, payload.new]);
        scrollToBottom();
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!conversation) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getConversationMessages(conversation.id);
      setMessages(data);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!conversation || conversation.unread_count === 0) return;

    try {
      await markConversationAsRead(conversation.id);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !conversation || sending) return;

    setSending(true);
    setError(null);

    try {
      await sendSMS({
        to: conversation.customer_phone,
        body: newMessage.trim(),
      });

      setNewMessage('');
      textareaRef.current?.focus();
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStatusIcon = (message) => {
    if (message.direction === 'inbound') return null;

    switch (message.status) {
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-green-600" />;
      case 'sent':
        return <CheckCheck className="w-3 h-3 text-[#8B4513]/50" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-600" />;
      default:
        return <Clock className="w-3 h-3 text-[#8B4513]/30" />;
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const area = cleaned.substring(1, 4);
      const prefix = cleaned.substring(4, 7);
      const line = cleaned.substring(7);
      return `(${area}) ${prefix}-${line}`;
    }
    return phone;
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#FFF8E1]/30">
        <div className="text-center">
          <Phone className="w-16 h-16 text-[#8B4513]/20 mx-auto mb-4" />
          <p className="text-[#8B4513]/60">Select a conversation to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="p-4 border-b border-[#E6B85C]/30 bg-[#FFF8E1]">
        <div className="font-semibold text-[#8B4513]">
          {conversation.customer
            ? `${conversation.customer.first_name} ${conversation.customer.last_name}`
            : 'Unknown Customer'}
        </div>
        <div className="text-sm text-[#8B4513]/60">
          {formatPhoneNumber(conversation.customer_phone)}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#8B4513]/60">No messages yet</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  message.direction === 'outbound'
                    ? 'bg-[#8B4513] text-white'
                    : 'bg-[#FFF8E1] text-[#654321] border border-[#E6B85C]/30'
                }`}
              >
                <div className="break-words whitespace-pre-wrap">{message.body}</div>
                <div
                  className={`flex items-center gap-1 mt-1 text-xs ${
                    message.direction === 'outbound' ? 'text-white/70' : 'text-[#8B4513]/50'
                  }`}
                >
                  <span>{format(new Date(message.sent_at), 'h:mm a')}</span>
                  {getStatusIcon(message)}
                </div>
                {message.error_message && (
                  <div className="mt-1 text-xs text-red-600">
                    {message.error_message}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="p-4 border-t border-[#E6B85C]/30 bg-[#FFF8E1]/50">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            rows={2}
            className="resize-none input-whimsy"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="btn-primary self-end"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-[#8B4513]/50 mt-2">
          Character count: {newMessage.length} {newMessage.length > 160 && '(Multiple SMS)'}
        </p>
      </div>
    </div>
  );
}
