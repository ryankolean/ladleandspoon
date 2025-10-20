import { useState } from 'react';
import { Phone, Plus, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { addAuthorizedPhoneNumber, removeAuthorizedPhoneNumber } from '../../services/sms';

export function PhoneNumberManager({ authorizedNumbers, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const formatPhoneForDisplay = (phone) => {
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

  const normalizePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    } else if (phone.startsWith('+')) {
      return phone;
    }

    return null;
  };

  const validatePhoneNumber = (phone) => {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
  };

  const handleAddNumber = async () => {
    setFeedback(null);

    if (!newPhone.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a phone number' });
      return;
    }

    const normalized = normalizePhoneNumber(newPhone);
    if (!normalized || !validatePhoneNumber(normalized)) {
      setFeedback({
        type: 'error',
        message: 'Invalid phone number format. Use (866) 660-1976 or +18666601976',
      });
      return;
    }

    setLoading(true);

    try {
      await addAuthorizedPhoneNumber({
        phoneNumber: normalized,
        notes: notes.trim(),
      });

      setFeedback({
        type: 'success',
        message: 'Phone number verified and authorized',
      });

      setNewPhone('');
      setNotes('');
      setShowAddForm(false);

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error adding phone number:', err);
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to add phone number',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveNumber = async (id) => {
    if (!confirm('Are you sure you want to deactivate this phone number?')) {
      return;
    }

    try {
      await removeAuthorizedPhoneNumber(id);
      setFeedback({
        type: 'success',
        message: 'Phone number deactivated',
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error removing phone number:', err);
      setFeedback({
        type: 'error',
        message: 'Failed to deactivate phone number',
      });
    }
  };

  return (
    <div className="w-80 border-l border-[#E6B85C]/30 bg-[#FFF8E1]/30 flex flex-col">
      <div className="p-4 border-b border-[#E6B85C]/30">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-[#8B4513]">Authorized Numbers</h3>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            size="sm"
            variant="outline"
            className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-[#8B4513]/60">
          Only customers in the database who have consented to SMS can be authorized
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {feedback && (
          <Alert className={`mb-4 ${
            feedback.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <AlertDescription className={
              feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
            }>
              {feedback.message}
            </AlertDescription>
          </Alert>
        )}

        {showAddForm && (
          <div className="mb-4 p-4 bg-white rounded-xl border-2 border-[#E6B85C]/30">
            <h4 className="font-semibold text-[#8B4513] mb-3">Add New Number</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[#8B4513] mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="(866) 660-1976"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="input-whimsy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8B4513] mb-1">
                  Notes (Optional)
                </label>
                <Textarea
                  placeholder="Reason for authorization..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="input-whimsy resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddNumber}
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Verifying...' : 'Add & Verify'}
                </Button>
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewPhone('');
                    setNotes('');
                    setFeedback(null);
                  }}
                  variant="outline"
                  className="border-[#8B4513] text-[#8B4513]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {authorizedNumbers.length === 0 ? (
            <div className="text-center py-8">
              <Phone className="w-12 h-12 text-[#8B4513]/20 mx-auto mb-2" />
              <p className="text-sm text-[#8B4513]/60">No authorized numbers yet</p>
            </div>
          ) : (
            authorizedNumbers.map((num) => (
              <div
                key={num.id}
                className="p-3 bg-white rounded-xl border border-[#E6B85C]/30 hover:border-[#E6B85C] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#8B4513] text-sm">
                      {formatPhoneForDisplay(num.phone_number)}
                    </div>
                    {num.verification_notes && (
                      <div className="text-xs text-[#8B4513]/60 mt-1">
                        {num.verification_notes}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {num.compliance_verified ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <AlertTriangle className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                      {num.verification_date && (
                        <span className="text-xs text-[#8B4513]/40">
                          {new Date(num.verification_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveNumber(num.id)}
                    className="ml-2 text-[#F56949] hover:text-[#E5432D] transition-colors"
                    title="Deactivate"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-[#E6B85C]/30 bg-[#FFF8E1]">
        <div className="text-xs text-[#8B4513]/70">
          <p className="font-semibold mb-1">Compliance Requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Customer must exist in database</li>
            <li>Customer must have SMS consent</li>
            <li>Customer must not have opted out</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
