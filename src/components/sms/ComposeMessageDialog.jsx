import { useState, useEffect } from 'react';
import { Send, Users, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { getEligibleSMSUsers, sendBatchSMS } from '../../services/sms';

export function ComposeMessageDialog({ open, onOpenChange }) {
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [messageTemplate, setMessageTemplate] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      loadEligibleUsers();
      setMessageTemplate('');
      setSelectedUserIds([]);
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  const loadEligibleUsers = async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const result = await getEligibleSMSUsers();
      setEligibleUsers(result.eligibleUsers || []);
    } catch (err) {
      console.error('Error loading eligible users:', err);
      setError(err.message || 'Failed to load eligible users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === eligibleUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(eligibleUsers.map(user => user.id));
    }
  };

  const handleToggleUser = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSend = async () => {
    if (selectedUserIds.length === 0) {
      setError('Please select at least one recipient');
      return;
    }

    if (!messageTemplate.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await sendBatchSMS({
        userIds: selectedUserIds,
        messageTemplate: messageTemplate.trim(),
      });

      setSuccess(true);
      setMessageTemplate('');
      setSelectedUserIds([]);

      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    } catch (err) {
      console.error('Error sending batch SMS:', err);
      setError(err.message || 'Failed to send messages');
    } finally {
      setLoading(false);
    }
  };

  const charCount = messageTemplate.length;
  const maxChars = 160;
  const segmentCount = Math.ceil(charCount / maxChars) || 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Compose New Message</DialogTitle>
          <DialogDescription>
            Send SMS messages to eligible customers who have opted in
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Messages sent successfully! Batch is being processed.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              placeholder="Enter your message here..."
              className="min-h-[120px] resize-none"
              maxLength={maxChars * 3}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {charCount} / {maxChars * 3} characters
              </span>
              <span>
                {segmentCount} message segment{segmentCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Recipients</Label>
              {!loadingUsers && eligibleUsers.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedUserIds.length === eligibleUsers.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
              )}
            </div>

            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading eligible users...</span>
              </div>
            ) : eligibleUsers.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No eligible users found. Users must have a phone number and SMS consent enabled.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                <div className="divide-y">
                  {eligibleUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50"
                    >
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={() => handleToggleUser(user.id)}
                      />
                      <label
                        htmlFor={`user-${user.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.phone}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedUserIds.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
                <span>
                  <strong>{selectedUserIds.length}</strong> recipient{selectedUserIds.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading || selectedUserIds.length === 0 || !messageTemplate.trim()}
            className="bg-[#8B4513] hover:bg-[#654321]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to {selectedUserIds.length} recipient{selectedUserIds.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
