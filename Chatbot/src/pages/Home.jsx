import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('../src/assets/2996863.webp')" }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative max-w-6xl mx-auto p-6 text-white flex flex-col items-center justify-center min-h-screen animate-[fadeIn_0.7s_ease-out]">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-indigo-100 mb-6 drop-shadow-lg">
            Welcome to Ayurv-aid
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            Embark on a transformative wellness journey with Ayurv-aid, where
            ancient Ayurvedic wisdom meets cutting-edge artificial intelligence.
            Our platform offers personalized health insights, natural remedies,
            and daily guidance to help you achieve holistic well-being. Start
            exploring today and take the first step toward a healthier you!
          </p>
          <Link
            to="/chat"
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-8 rounded-full shadow-lg transition-all duration-300 font-semibold text-lg animate-pulse hover:animate-none"
          >
            Start Chatting
          </Link>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full px-4">
          {/* Welcome Section */}
          <div className="bg-white/90 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-gray-800">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" // Placeholder: Ayurveda symbol
              alt="Ayurvedic Wellness"
              className="w-full h-40 object-cover rounded-t-lg mb-4"
            />
            <h2 className="text-xl font-semibold mb-3">What is Ayurv-aid?</h2>
            <p className="text-sm">
              Ayurv-aid is your digital wellness companion, blending traditional
              Ayurvedic principles with AI technology. Designed to empower you
              with health insights, it supports symptom analysis, remedy
              suggestions, and lifestyle advice tailored to your needs.
            </p>
          </div>

          {/* Features Section */}
          <div className="bg-white/90 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-gray-800">
            <img
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" // Placeholder: AI technology
              alt="AI Integration"
              className="w-full h-40 object-cover rounded-t-lg mb-4"
            />
            <h2 className="text-xl font-semibold mb-3">Key Features</h2>
            <ul className="list-disc list-inside text-sm space-y-2">
              <li>AI-driven symptom analysis for accurate predictions.</li>
              <li>Custom Ayurvedic remedies based on your health profile.</li>
              <li>Daily wellness tips aligned with Ayurvedic doshas.</li>
              <li>Interactive chat for personalized guidance.</li>
            </ul>
          </div>

          {/* How It Works Section */}
          <div className="bg-white/90 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-gray-800">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" // Placeholder: Workflow
              alt="How It Works"
              className="w-full h-40 object-cover rounded-t-lg mb-4"
            />
            <h2 className="text-xl font-semibold mb-3">How It Works</h2>
            <ol className="list-decimal list-inside text-sm space-y-2">
              <li>Enter your symptoms and personal details.</li>
              <li>AI analyzes data and suggests potential conditions.</li>
              <li>Gemini AI provides Ayurvedic insights and remedies.</li>
              <li>Receive tailored health advice instantly.</li>
            </ol>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-md text-gray-300 mb-6">
            Join thousands of users improving their health with Ayurv-aid. Your
            wellness journey starts here!
          </p>
          <Link
            to="/chat"
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-8 rounded-full shadow-lg transition-all duration-300 font-semibold text-lg animate-pulse hover:animate-none"
          >
            Start Chatting
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
