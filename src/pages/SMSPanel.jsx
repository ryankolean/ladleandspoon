import { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ConversationList } from '../components/sms/ConversationList';
import { MessageThread } from '../components/sms/MessageThread';
import { PhoneNumberManager } from '../components/sms/PhoneNumberManager';
import {
  getConversations,
  getAuthorizedPhoneNumbers,
  subscribeToConversations,
} from '../services/sms';

export default function SMSPanel() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [authorizedNumbers, setAuthorizedNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPhoneManager, setShowPhoneManager] = useState(true);

  useEffect(() => {
    loadData();

    const channel = subscribeToConversations((payload) => {
      if (payload.eventType === 'INSERT') {
        setConversations((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === payload.new.id ? payload.new : conv
          )
        );
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      const [convData, phoneData] = await Promise.all([
        getConversations(),
        getAuthorizedPhoneNumbers(),
      ]);

      setConversations(convData || []);
      setAuthorizedNumbers(phoneData || []);
    } catch (err) {
      console.error('Error loading SMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);

    if (conversation.unread_count > 0) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversation.id
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    }
  };

  const handlePhoneNumberUpdate = async () => {
    try {
      const phoneData = await getAuthorizedPhoneNumbers();
      setAuthorizedNumbers(phoneData || []);
    } catch (err) {
      console.error('Error reloading phone numbers:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SMS Messaging Center</h1>
              <p className="text-white/80 text-sm">
                Manage customer communications with compliance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={loadData}
              variant="ghost"
              className="text-white hover:bg-white/20"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setShowPhoneManager(!showPhoneManager)}
              variant="ghost"
              className="text-white hover:bg-white/20"
              title="Toggle Phone Manager"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="text-white/70 text-xs mb-1">Active Conversations</div>
            <div className="text-2xl font-bold">{conversations.length}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="text-white/70 text-xs mb-1">Unread Messages</div>
            <div className="text-2xl font-bold">
              {conversations.reduce((sum, conv) => sum + conv.unread_count, 0)}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="text-white/70 text-xs mb-1">Authorized Numbers</div>
            <div className="text-2xl font-bold">{authorizedNumbers.length}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 flex-shrink-0">
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        <MessageThread
          conversation={selectedConversation}
          authorizedNumbers={authorizedNumbers}
        />

        {showPhoneManager && (
          <PhoneNumberManager
            authorizedNumbers={authorizedNumbers}
            onUpdate={handlePhoneNumberUpdate}
          />
        )}
      </div>
    </div>
  );
}
