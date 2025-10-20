import { Link } from 'react-router-dom';

export function ComplianceFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <h3 className="font-bold text-lg mb-3">Ladle and Spoon</h3>
            <p className="text-white/80 text-sm">
              Serving delicious homemade meals with love and care. Fresh ingredients,
              authentic recipes, and exceptional service.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">Contact Us</h3>
            <div className="space-y-1 text-sm text-white/80">
              <p>Phone: (866) 660-1976</p>
              <p>Email: ladleandspoon1024@gmail.com</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-3">Quick Links</h3>
            <div className="space-y-2">
              <Link
                to="/sms-opt-in"
                className="block text-sm text-white/80 hover:text-white transition-colors"
              >
                Subscribe to SMS Updates
              </Link>
              <Link
                to="/order"
                className="block text-sm text-white/80 hover:text-white transition-colors"
              >
                Order Online
              </Link>
              <Link
                to="/my-orders"
                className="block text-sm text-white/80 hover:text-white transition-colors"
              >
                Track My Orders
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-white/70">
              &copy; {currentYear} Ladle and Spoon. All rights reserved.
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                to="/terms"
                className="text-white/80 hover:text-white transition-colors"
              >
                Terms & Conditions
              </Link>
              <span className="text-white/40">|</span>
              <Link
                to="/privacy-policy"
                className="text-white/80 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-white/40">|</span>
              <Link
                to="/sms-terms"
                className="text-white/80 hover:text-white transition-colors"
              >
                SMS Terms
              </Link>
              <span className="text-white/40">|</span>
              <Link
                to="/sms-opt-in"
                className="text-white/80 hover:text-white transition-colors"
              >
                SMS Opt-In
              </Link>
            </div>
          </div>

          <div className="mt-4 text-xs text-white/60 text-center">
            <p>
              By using our SMS service, you agree to receive recurring automated marketing and
              transactional text messages. Message and data rates may apply. Reply STOP to opt out.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
