import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Placeholder for newsletter subscription logic
    alert("Thank you for subscribing! (Implement backend logic here)");
  };

  return (
    <footer className="bg-blue-500 text-white py-12 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Navigation Links */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-semibold text-blue-100 mb-5">
              Explore
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="hover:scale-105 hover:shadow-md hover:text-blue-200 block transition-all duration-300 ease-in-out"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:scale-105 hover:shadow-md hover:text-blue-200 block transition-all duration-300 ease-in-out"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:scale-105 hover:shadow-md hover:text-blue-200 block transition-all duration-300 ease-in-out"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-blue-100 mb-5">
              Connect With Us
            </h3>
            <div className="flex justify-center space-x-6">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:scale-105 hover:shadow-md hover:text-blue-200 transition-all duration-300 ease-in-out"
                aria-label="Follow us on Twitter"
              >
                <svg
                  className="h-7 w-7"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:scale-105 hover:shadow-md hover:text-blue-200 transition-all duration-300 ease-in-out"
                aria-label="Follow us on Facebook"
              >
                <svg
                  className="h-7 w-7"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:scale-105 hover:shadow-md hover:text-blue-200 transition-all duration-300 ease-in-out"
                aria-label="Follow us on Instagram"
              >
                <svg
                  className="h-7 w-7"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.379.06 3.808 0 2.43-.012 2.784-.06 3.808-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.379.06-3.808.06-2.43 0-2.784-.012-3.808-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.379-.06-3.808 0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C9.901 2.013 10.256 2 12.685 2h-.37zm-.367 1.5c-2.321 0-2.652.01-3.589.053-.873.04-1.468.179-1.991.382-.54.213-.998.497-1.459.958-.46.46-.744.918-.958 1.458-.203.523-.342 1.119-.382 1.992-.043.936-.053 1.268-.053 3.589 0 2.321.01 2.652.053 3.589.04.873.179 1.468.382 1.991.213.54.497.998.958 1.459.46.46.918.744 1.458.958.523.203 1.119.342 1.992.382.936.043 1.268.053 3.589.053 2.321 0 2.652-.01 3.589-.053.873-.04 1.468-.179 1.991-.382.54-.213.998-.497 1.459-.958.46-.46.744-.918.958-1.458.203-.523.342-1.119.382-1.992.043-.936.053-1.268.053-3.589 0-2.321-.01-2.652-.053-3.589-.04-.873-.179-1.468-.382-1.991-.213-.54-.497-.998-.958-1.459-.46-.46-.918-.744-1.458-.958-.523-.203-1.119-.342-1.992-.382-.936-.043-1.268-.053-3.589-.053zm0 2.932a6.568 6.568 0 100 13.136 6.568 6.568 0 000-13.136zm0 10.818a4.25 4.25 0 110-8.5 4.25 4.25 0 010 8.5zm6.648-10.837a1.531 1.531 0 11-3.062 0 1.531 1.531 0 013.062 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:scale-105 hover:shadow-md hover:text-blue-200 transition-all duration-300 ease-in-out"
                aria-label="Follow us on LinkedIn"
              >
                <svg
                  className="h-7 w-7"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.024-3.037-1.85-3.037-1.85 0-2.132 1.444-2.132 2.936v5.67H9.357V9h3.414v1.561h.048c.476-.9 1.637-1.85 3.368-1.85 3.6 0 4.26 2.369 4.26 5.457v6.284zM5.337 7.433c-1.144 0-2.063-.928-2.063-2.064 0-1.135.92-2.063 2.063-2.063 1.136 0 2.064.928 2.064 2.063 0 1.136-.928 2.064-2.064 2.064zm1.78 13.019H3.558V9h3.559v11.452zM22.225 0H1.771C.792 0 0 .792 0 1.771v20.458C0 23.208.792 24 1.771 24h20.454c.979 0 1.771-.792 1.771-1.771V1.771C24 .792 23.208 0 22.225 0z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-semibold text-blue-100 mb-5">
              Stay Updated
            </h3>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-5 py-3 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:scale-105 hover:shadow-md hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition-all duration-300 ease-in-out"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center border-t border-blue-600 pt-6">
          <p className="text-sm text-blue-200">
            © {new Date().getFullYear()} Ayurv-aid. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
