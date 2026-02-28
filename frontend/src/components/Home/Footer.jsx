import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';
// import logo from '../../assets/logo.png'
export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t-4 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white">SC
                  {/* <img src={logo} alt="Logo" className="w-8 h-8 object-contain" /> */}

                </span>
              </div>
              <span className="text-white">Zosto EduCRM</span>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering education through intelligent and modern digital solutions.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-red-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-red-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-yellow-400 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="hover:text-red-400 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-red-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-yellow-400 transition-colors">System Status</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail size={20} className="mt-1 flex-shrink-0 text-red-400" />
                <span>info@zostoindia.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={20} className="mt-1 flex-shrink-0 text-yellow-400" />
                <span>
                  Helpdesk: 8564918918
                  <br />
                  Tollfree: 18005692770
                </span>

              </li>
              <li className="flex items-start gap-3">
                <MapPin size={20} className="mt-1 flex-shrink-0 text-red-400" />
                <span>Lucknow Branch: Near RTO office, Transport Nagar, Lucknow, U.P 226012</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">
              © 2024 Zosto EduCRM. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-red-400 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer