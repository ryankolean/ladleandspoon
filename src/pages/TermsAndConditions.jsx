import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function TermsAndConditions() {
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
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#8B4513]">Terms and Conditions</h1>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-[#654321]">
            <p className="text-sm text-[#8B4513]/60">
              Last Updated: {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">1. Agreement to Terms</h2>
              <p>
                Welcome to Ladle and Spoon. By accessing or using our website, mobile application,
                and services (collectively, the "Services"), you agree to be bound by these Terms
                and Conditions ("Terms"). If you do not agree to these Terms, please do not use
                our Services.
              </p>
              <p className="mt-2">
                These Terms constitute a legally binding agreement between you and Ladle and Spoon
                ("we," "us," or "our"). We reserve the right to modify these Terms at any time,
                and your continued use of the Services constitutes acceptance of any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">2. Use of Services</h2>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Eligibility</h3>
              <p>
                You must be at least 18 years old to use our Services. By using our Services, you
                represent and warrant that you are at least 18 years of age and have the legal
                capacity to enter into this agreement.
              </p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Account Registration</h3>
              <p>
                To access certain features, you may need to create an account. You agree to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Prohibited Activities</h3>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Use the Services for any illegal purpose or in violation of any laws</li>
                <li>Attempt to gain unauthorized access to our systems or networks</li>
                <li>Interfere with or disrupt the Services or servers</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Use automated systems to access the Services without permission</li>
                <li>Upload viruses, malware, or any harmful code</li>
                <li>Collect or harvest information about other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">3. Orders and Payment</h2>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Order Acceptance</h3>
              <p>
                All orders are subject to acceptance and availability. We reserve the right to refuse
                or cancel any order for any reason, including but not limited to product availability,
                errors in pricing or product information, or suspected fraud.
              </p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Pricing</h3>
              <p>
                All prices are listed in U.S. dollars and are subject to change without notice. We
                strive to provide accurate pricing information, but errors may occur. If we discover
                a pricing error, we will notify you and give you the option to proceed at the correct
                price or cancel your order.
              </p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Payment Methods</h3>
              <p>
                We accept various payment methods including Venmo and cash. By providing payment
                information, you represent that you are authorized to use the payment method and
                authorize us to charge your payment method for the total order amount.
              </p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Taxes and Fees</h3>
              <p>
                Applicable sales tax will be added to your order total. Delivery fees, if applicable,
                will be clearly displayed before you complete your order.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">4. Delivery</h2>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Delivery Areas</h3>
              <p>
                We deliver to specified areas only. Delivery availability and fees vary by location.
                You will be notified if your address is outside our delivery area.
              </p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Delivery Times</h3>
              <p>
                Delivery times are estimates only and are not guaranteed. We will make reasonable
                efforts to deliver orders within the estimated timeframe, but we are not liable for
                delays caused by factors beyond our control.
              </p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Failed Delivery</h3>
              <p>
                If delivery cannot be completed due to incorrect address information, unavailability
                of recipient, or other customer-related issues, you may be charged for the delivery
                attempt. Rescheduling may incur additional fees.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">5. Cancellations and Refunds</h2>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Order Cancellation</h3>
              <p>
                You may cancel your order before it enters preparation. Once preparation begins,
                cancellations may not be possible. Contact us immediately if you need to cancel
                an order.
              </p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Refund Policy</h3>
              <p>
                Refunds are provided at our discretion in cases of:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Incorrect or incomplete orders</li>
                <li>Quality issues with food items</li>
                <li>Failed delivery due to our error</li>
                <li>Order cancellation before preparation begins</li>
              </ul>
              <p className="mt-2">
                Refunds will be processed using the original payment method within 5-10 business days.
                We do not provide refunds for changes of mind after order preparation has begun.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">6. Food Safety and Allergies</h2>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Allergen Information</h3>
              <p>
                While we make efforts to accommodate dietary restrictions and allergies, our kitchen
                handles common allergens including nuts, dairy, eggs, wheat, soy, and shellfish.
                Cross-contamination may occur.
              </p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Customer Responsibility</h3>
              <p>
                It is your responsibility to inform us of any food allergies or dietary restrictions
                when placing your order. We cannot guarantee that any menu item is completely free
                from allergens. If you have severe allergies, please exercise caution and consult
                with us before ordering.
              </p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Food Handling</h3>
              <p>
                Once delivered, it is your responsibility to properly handle and store food items.
                Consume perishable items promptly and refrigerate as needed. We are not responsible
                for illness resulting from improper food handling after delivery.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">7. Intellectual Property</h2>
              <p>
                All content on our Services, including text, graphics, logos, images, recipes, and
                software, is the property of Ladle and Spoon or its licensors and is protected by
                copyright, trademark, and other intellectual property laws.
              </p>
              <p className="mt-2">
                You may not copy, reproduce, distribute, modify, or create derivative works from
                our content without express written permission. Our recipes and proprietary food
                preparation methods are trade secrets and confidential information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">8. User Content</h2>
              <p>
                You may be able to submit reviews, comments, or other content ("User Content").
                By submitting User Content, you grant us a non-exclusive, worldwide, royalty-free
                license to use, reproduce, modify, and display such content in connection with our
                Services.
              </p>
              <p className="mt-2">
                You represent that your User Content does not violate any laws or third-party rights.
                We reserve the right to remove any User Content that violates these Terms or is
                otherwise objectionable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">9. Disclaimers and Limitations of Liability</h2>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Service "As Is"</h3>
              <p>
                Our Services are provided "as is" and "as available" without warranties of any kind,
                either express or implied, including but not limited to warranties of merchantability,
                fitness for a particular purpose, or non-infringement.
              </p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, Ladle and Spoon shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages, or any loss of
                profits or revenues, whether incurred directly or indirectly.
              </p>
              <p className="mt-2">
                Our total liability for any claims arising from your use of the Services shall not
                exceed the amount you paid us in the six months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">10. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Ladle and Spoon, its officers,
                directors, employees, and agents from any claims, damages, losses, liabilities, and
                expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your use of the Services</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any laws or third-party rights</li>
                <li>Any User Content you submit</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">11. Dispute Resolution</h2>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Informal Resolution</h3>
              <p>
                If you have any concerns or disputes, please contact us first to attempt informal
                resolution. We value our customers and want to resolve issues amicably.
              </p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Governing Law</h3>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the
                state in which our business operates, without regard to conflict of law provisions.
              </p>

              <h3 className="text-xl font-semibold text-[#8B4513] mt-4 mb-2">Arbitration</h3>
              <p>
                Any dispute arising from these Terms or your use of the Services shall be resolved
                through binding arbitration in accordance with the rules of the American Arbitration
                Association. You waive any right to participate in a class action lawsuit or
                class-wide arbitration.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">12. Communications</h2>
              <p>
                By using our Services, you consent to receive electronic communications from us,
                including emails and SMS messages (if you have opted in). These communications may
                include notices about your account, orders, promotional offers, and other
                service-related information.
              </p>
              <p className="mt-2">
                You can opt out of promotional communications at any time by following the
                unsubscribe instructions or updating your account preferences. For SMS opt-out,
                see our{' '}
                <Link to="/sms-terms" className="text-[#8B4513] underline hover:text-[#A0522D]">
                  SMS Terms of Service
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">13. Privacy</h2>
              <p>
                Your use of our Services is also governed by our Privacy Policy, which describes
                how we collect, use, and protect your personal information. Please review our
                Privacy Policy to understand our practices.
              </p>
              <p className="mt-2">
                <Link to="/privacy-policy" className="text-[#8B4513] underline hover:text-[#A0522D]">
                  View our Privacy Policy
                </Link>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">14. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account and access to the Services
                at any time, with or without notice, for any reason, including but not limited to
                violation of these Terms, suspected fraud, or abusive behavior.
              </p>
              <p className="mt-2">
                Upon termination, your right to use the Services will immediately cease. Provisions
                of these Terms that by their nature should survive termination shall survive,
                including ownership provisions, warranty disclaimers, and limitations of liability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">15. Modifications to Services</h2>
              <p>
                We reserve the right to modify, suspend, or discontinue any part of the Services
                at any time without notice. We may also impose limits on certain features or
                restrict access to parts of the Services.
              </p>
              <p className="mt-2">
                We shall not be liable to you or any third party for any modification, suspension,
                or discontinuation of the Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">16. Severability</h2>
              <p>
                If any provision of these Terms is found to be unenforceable or invalid, that
                provision shall be limited or eliminated to the minimum extent necessary, and the
                remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">17. Entire Agreement</h2>
              <p>
                These Terms, together with our Privacy Policy and any other legal notices published
                by us, constitute the entire agreement between you and Ladle and Spoon concerning
                your use of the Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-[#8B4513] mb-3">18. Contact Information</h2>
              <p>
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-[#FFF8E1] p-4 rounded-lg mt-2">
                <p className="font-semibold mb-2">Ladle and Spoon</p>
                <p>Email: legal@ladleandspoon.com</p>
                <p>Phone: (555) 123-4567</p>
                <p>Mail: 123 Main Street, Suite 100, City, ST 12345</p>
                <p>Hours: Monday-Friday, 9am-5pm EST</p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E6B85C]/30">
            <p className="text-sm text-[#8B4513]/60 text-center">
              By using our Services, you acknowledge that you have read, understood, and agree
              to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
