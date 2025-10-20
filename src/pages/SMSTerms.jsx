import { Link } from 'react-router-dom';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function SMSTerms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] via-white to-[#FFF8E1]">
      <div className="max-w-4xl mx-auto px-4 py-12">
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
            <h1 className="text-3xl font-bold text-[#8B4513]">SMS Terms of Service</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-[#654321]">
            <p className="text-sm text-[#8B4513]/60">
              Last Updated: {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">1. Program Description</h2>
              <p>
                Ladle and Spoon offers SMS text messaging services to provide you with order updates,
                delivery notifications, promotional offers, and customer service communications. By
                opting in to our SMS program, you agree to receive recurring automated marketing and
                transactional text messages from Ladle and Spoon.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">2. Opt-In Requirement</h2>
              <p>
                You must affirmatively consent to receive SMS messages from Ladle and Spoon. Consent
                is not a condition of purchase. You may still place orders and use our services without
                subscribing to SMS notifications.
              </p>
              <p className="mt-2">
                By providing your mobile phone number and checking the SMS consent box, you explicitly
                agree to receive text messages from Ladle and Spoon at the number provided.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">3. Message Frequency</h2>
              <p>
                Message frequency varies based on your order activity and promotional campaigns. You may
                receive approximately 2-4 messages per week, though frequency may vary during peak seasons
                or special promotions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">4. Message and Data Rates</h2>
              <p>
                Message and data rates may apply based on your mobile carrier's plan. Please consult your
                carrier for details on your specific plan. Ladle and Spoon is not responsible for any
                charges incurred from your mobile carrier.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">5. How to Opt Out</h2>
              <p>
                You may opt out of receiving SMS messages at any time by using any of the following methods:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Reply <strong>STOP</strong>, <strong>UNSUBSCRIBE</strong>, or <strong>CANCEL</strong> to any message</li>
                <li>Update your preferences in your account settings</li>
                <li>Contact our customer service team</li>
              </ul>
              <p className="mt-2">
                After opting out, you will receive one final confirmation message. You may continue to
                receive transactional messages necessary to complete pending orders.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">6. Help and Support</h2>
              <p>
                For help or more information, reply <strong>HELP</strong> to any message or contact us at:
              </p>
              <div className="bg-[#FFF8E1] p-4 rounded-lg mt-2">
                <p className="font-semibold">Ladle and Spoon</p>
                <p>Email: support@ladleandspoon.com</p>
                <p>Phone: (866) 660-1976</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">7. Supported Carriers</h2>
              <p>
                Our SMS service is available on all major U.S. carriers including AT&T, T-Mobile, Verizon,
                Sprint, and most regional carriers. Service may not be available on all carriers or in all
                areas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">8. Privacy</h2>
              <p>
                We respect your privacy. Your mobile phone number and SMS preferences are governed by our
                Privacy Policy. We will never share your phone number with third parties for their marketing
                purposes without your explicit consent.
              </p>
              <p className="mt-2">
                <Link to="/privacy-policy" className="text-[#8B4513] underline hover:text-[#A0522D]">
                  View our full Privacy Policy
                </Link>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these SMS Terms of Service at any time. We will notify
                subscribers of material changes via SMS or email. Your continued participation after
                changes are posted constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">10. Program Termination</h2>
              <p>
                We reserve the right to terminate our SMS program at any time without notice. In the
                event of termination, you will receive a final notification message.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">11. Contact Information</h2>
              <div className="bg-[#FFF8E1] p-4 rounded-lg">
                <p className="font-semibold mb-2">For questions about SMS services:</p>
                <p>Ladle and Spoon</p>
                <p>Email: sms@ladleandspoon.com</p>
                <p>Phone: (866) 660-1976</p>
                <p>Hours: Monday-Friday, 9am-5pm EST</p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E6B85C]/30">
            <p className="text-sm text-[#8B4513]/60 text-center">
              By participating in our SMS program, you acknowledge that you have read, understood,
              and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
