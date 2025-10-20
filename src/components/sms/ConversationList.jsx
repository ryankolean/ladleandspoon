import { useState, useEffect } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';

export function ConversationList({ conversations, selectedConversation, onSelectConversation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState(conversations);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredConversations(conversations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = conversations.filter(conv => {
      const phone = conv.customer_phone?.toLowerCase() || '';
      const name = conv.customer
        ? `${conv.customer.first_name} ${conv.customer.last_name}`.toLowerCase()
        : '';
      return phone.includes(query) || name.includes(query);
    });

    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);

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

  return (
    <div className="flex flex-col h-full border-r border-[#E6B85C]/30">
      <div className="p-4 border-b border-[#E6B85C]/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B4513]/50" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 input-whimsy"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="w-12 h-12 text-[#8B4513]/30 mb-3" />
            <p className="text-[#8B4513]/60 text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E6B85C]/20">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`w-full p-4 text-left hover:bg-[#FFF8E1] transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-[#FFF8E1]' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    {conv.customer ? (
                      <div className="font-semibold text-[#8B4513] truncate">
                        {conv.customer.first_name} {conv.customer.last_name}
                      </div>
                    ) : (
                      <div className="font-semibold text-[#8B4513] truncate">
                        Unknown Customer
                      </div>
                    )}
                    <div className="text-xs text-[#8B4513]/60">
                      {formatPhoneNumber(conv.customer_phone)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    {conv.unread_count > 0 && (
                      <Badge className="bg-[#F56949] text-white">
                        {conv.unread_count}
                      </Badge>
                    )}
                    <span className="text-xs text-[#8B4513]/50 whitespace-nowrap">
                      {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
