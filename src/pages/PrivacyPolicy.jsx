import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function PrivacyPolicy() {
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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#8B4513]">Privacy Policy</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-[#654321]">
            <p className="text-sm text-[#8B4513]/60">
              Last Updated: {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">1. Introduction</h2>
              <p>
                Ladle and Spoon ("we," "our," or "us") respects your privacy and is committed to protecting
                your personal information. This Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our services, including our website and SMS messaging
                program.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Personal Information</h3>
              <p>We collect information that you provide directly to us, including:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Name and contact information (email address, phone number, delivery address)</li>
                <li>Account credentials (username and password)</li>
                <li>Payment information (processed securely through third-party payment processors)</li>
                <li>Order history and preferences</li>
                <li>Communication preferences, including SMS opt-in status</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Automatically Collected Information</h3>
              <p>When you access our services, we may automatically collect:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, time spent, features used)</li>
                <li>Location data (with your permission)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">3. How We Use Your Information</h2>
              <p>We use your information for the following purposes:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations, delivery updates, and transactional communications</li>
                <li>Provide customer support and respond to your inquiries</li>
                <li>Send promotional messages (only with your explicit consent)</li>
                <li>Improve our services and develop new features</li>
                <li>Detect and prevent fraud and security incidents</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">4. SMS Messaging Privacy</h2>
              <p>
                When you opt in to receive SMS messages from us:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your mobile phone number is stored securely in our database</li>
                <li>We will only send messages you have consented to receive</li>
                <li>We do not share your phone number with third parties for their marketing purposes</li>
                <li>You can opt out at any time by texting STOP to any message</li>
                <li>Message and data rates may apply based on your carrier plan</li>
              </ul>
              <p className="mt-2">
                <Link to="/sms-terms" className="text-[#8B4513] underline hover:text-[#A0522D]">
                  View our SMS Terms of Service
                </Link>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">5. Information Sharing</h2>
              <p>We may share your information with:</p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Service Providers</h3>
              <p>
                Third-party vendors who perform services on our behalf, such as payment processing,
                SMS delivery (Twilio), email delivery, analytics, and customer support. These providers
                are bound by contractual obligations to keep your information confidential.
              </p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Legal Requirements</h3>
              <p>
                We may disclose your information if required by law, court order, or governmental
                regulation, or to protect our rights, property, or safety.
              </p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Business Transfers</h3>
              <p>
                In connection with any merger, sale of company assets, financing, or acquisition of
                all or a portion of our business.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">6. Data Security</h2>
              <p>
                We implement reasonable security measures to protect your information from unauthorized
                access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Employee training on data protection practices</li>
              </ul>
              <p className="mt-2">
                However, no method of transmission over the internet is 100% secure. We cannot guarantee
                absolute security of your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">7. Your Rights and Choices</h2>
              <p>You have the following rights regarding your personal information:</p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Access and Portability</h3>
              <p>Request a copy of the personal information we hold about you.</p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Correction</h3>
              <p>Update or correct your personal information through your account settings.</p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Deletion</h3>
              <p>Request deletion of your personal information, subject to legal obligations.</p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Opt-Out</h3>
              <p>
                Unsubscribe from marketing emails or SMS messages at any time. You will continue to
                receive transactional messages necessary for order fulfillment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">8. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage patterns,
                and deliver personalized content. You can control cookies through your browser settings,
                though disabling cookies may limit some functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">9. Children's Privacy</h2>
              <p>
                Our services are not directed to individuals under 13 years of age. We do not knowingly
                collect personal information from children. If we learn that we have collected information
                from a child under 13, we will delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">10. Changes to Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material
                changes by posting the new policy on our website and updating the "Last Updated" date.
                Your continued use of our services after changes are posted constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">11. Contact Us</h2>
              <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
              <div className="bg-[#FFF8E1] p-4 rounded-lg mt-2">
                <p className="font-semibold mb-2">Ladle and Spoon</p>
                <p>Email: privacy@ladleandspoon.com</p>
                <p>Phone: (866) 660-1976</p>
                <p>Mail: 123 Main Street, Suite 100, City, ST 12345</p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E6B85C]/30">
            <p className="text-sm text-[#8B4513]/60 text-center">
              By using our services, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
