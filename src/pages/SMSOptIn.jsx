import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Alert, AlertDescription } from '../components/ui/alert';
import { supabase } from '../lib/supabase';

export default function SMSOptIn() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const normalizePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    return null;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !lastName || !email || !phoneNumber) {
      setError('Please fill in all required fields');
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the SMS Terms of Service to opt in');
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    if (!normalizedPhone) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, sms_consent')
        .eq('phone', normalizedPhone)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingProfile) {
        if (existingProfile.sms_consent) {
          setError('This phone number is already opted in to SMS notifications');
          setLoading(false);
          return;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            sms_consent: true,
            sms_consent_date: new Date().toISOString(),
            sms_consent_method: 'web_form',
          })
          .eq('id', existingProfile.id);

        if (updateError) throw updateError;
      } else {
        const consentRecord = {
          phone_number: normalizedPhone,
          first_name: firstName,
          last_name: lastName,
          email: email,
          consent_given: true,
          consent_date: new Date().toISOString(),
          consent_method: 'web_form',
          consent_ip: 'web',
        };

        const { error: insertError } = await supabase
          .from('sms_consent_records')
          .insert(consentRecord);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('Error submitting opt-in:', err);
      setError(err.message || 'Failed to process your opt-in request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-white to-[#FFF8E1] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-[#E6B85C]/30 p-8 max-w-md w-full text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#8B4513] mb-2">Successfully Opted In!</h2>
          <p className="text-[#654321] mb-4">
            Thank you for subscribing to SMS notifications from Ladle and Spoon. You'll start receiving
            order updates and promotional offers at {phoneNumber}.
          </p>
          <p className="text-sm text-[#8B4513]/60">
            Redirecting you to the home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-white to-[#FFF8E1]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-6 text-[#8B4513] hover:bg-[#FFF8E1]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border-2 border-[#E6B85C]/30 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#8B4513] p-3 rounded-xl">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#8B4513]">SMS Opt-In</h1>
              <p className="text-[#8B4513]/60">Subscribe to receive order updates and offers</p>
            </div>
          </div>

          <div className="bg-[#FFF8E1] border border-[#E6B85C]/50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-[#8B4513] mb-2">What you'll receive:</h3>
            <ul className="space-y-1 text-sm text-[#654321]">
              <li>Order confirmations and updates</li>
              <li>Delivery notifications</li>
              <li>Exclusive promotional offers</li>
              <li>Special menu announcements</li>
            </ul>
            <p className="text-xs text-[#8B4513]/60 mt-3">
              Message frequency varies. Message and data rates may apply.
            </p>
          </div>

          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#8B4513] mb-1">
                  First Name <span className="text-red-600">*</span>
                </label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="input-whimsy"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8B4513] mb-1">
                  Last Name <span className="text-red-600">*</span>
                </label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="input-whimsy"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B4513] mb-1">
                Email Address <span className="text-red-600">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="input-whimsy"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8B4513] mb-1">
                Mobile Phone Number <span className="text-red-600">*</span>
              </label>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                className="input-whimsy"
                maxLength={14}
                required
              />
            </div>

            <div className="flex items-start gap-2 bg-[#FFF8E1] p-4 rounded-xl">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={setAgreeToTerms}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-[#654321] leading-relaxed">
                I agree to receive recurring automated marketing and transactional text messages from
                Ladle and Spoon at the phone number provided. Consent is not a condition of purchase.
                Message and data rates may apply. Reply STOP to unsubscribe. I have read and agree to the{' '}
                <Link to="/sms-terms" className="text-[#8B4513] underline hover:text-[#A0522D]">
                  SMS Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy-policy" className="text-[#8B4513] underline hover:text-[#A0522D]">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading || !agreeToTerms}
              className="btn-primary w-full text-lg py-6"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                'Subscribe to SMS Notifications'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E6B85C]/30">
            <p className="text-xs text-[#8B4513]/60 text-center">
              This form serves as proof of consent for SMS communications under the Telephone Consumer
              Protection Act (TCPA). Your information is securely stored and will not be shared with
              third parties for marketing purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
