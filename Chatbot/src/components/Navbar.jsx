import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-blue-500 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-extrabold text-blue-100"
          >
            <span className="text-3xl">🌿</span> Ayurv-aid
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-white hover:scale-105 hover:shadow-md hover:bg-blue-600 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-white hover:scale-105 hover:shadow-md hover:bg-blue-600 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
            >
              About
            </Link>
            <Link
              to="/services"
              className="text-white hover:scale-105 hover:shadow-md hover:bg-blue-600 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
            >
              Services
            </Link>
            <Link
              to="/contact"
              className="text-white hover:scale-105 hover:shadow-md hover:bg-blue-600 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
            >
              Contact
            </Link>
            {user ? (
              <>
                <Link
                  to="/chat"
                  className="text-white hover:scale-105 hover:shadow-md hover:bg-blue-600 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
                >
                  Chat
                </Link>
                <Link
                  to="/history"
                  className="text-white hover:scale-105 hover:shadow-md hover:bg-blue-600 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
                >
                  History
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white hover:scale-105 hover:shadow-md hover:bg-red-600 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:scale-105 hover:shadow-md hover:bg-blue-600 px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-white bg-blue-600 hover:bg-blue-700 hover:scale-105 hover:shadow-md px-4 py-2 rounded-lg transition-all duration-300 ease-in-out"
                >
                  Signup
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md p-2"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden ${
            isOpen ? "block animate-slideIn" : "hidden"
          } bg-blue-500 rounded-b-lg shadow-lg`}
        >
          <div className="px-4 pt-3 pb-4 space-y-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-600 hover:scale-105 block px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-600 hover:scale-105 block px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
            >
              About
            </Link>
            <Link
              to="/services"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-600 hover:scale-105 block px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
            >
              Services
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-600 hover:scale-105 block px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
            >
              Contact
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-white hover:bg-blue-600 w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-all duration-300 ease-in-out"
                >
                  Account
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isOpen && (
                  <div className="pl-4 space-y-2">
                    <Link
                      to="/chat"
                      onClick={() => setIsOpen(false)}
                      className="text-white hover:bg-blue-600 hover:scale-105 block px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
                    >
                      Chat
                    </Link>
                    <Link
                      to="/history"
                      onClick={() => setIsOpen(false)}
                      className="text-white hover:bg-blue-600 hover:scale-105 block px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
                    >
                      History
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-white hover:bg-red-600 hover:scale-105 w-full text-left block px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-blue-600 hover:scale-105 block px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="text-white bg-blue-600 hover:bg-blue-700 hover:scale-105 block px-3 py-2 rounded-lg transition-all duration-300 ease-in-out"
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
