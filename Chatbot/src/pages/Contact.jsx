import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Contact = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      axios
        .get("http://127.0.0.1:8000/contact")
        .then((response) => setData(response.data))
        .catch((err) => {
          console.error("Error fetching contact data:", err);
          setError("Failed to load contact information.");
        });
    };
    fetchData();
  }, [retry]);

  const handleRetry = () => setRetry(!retry);

  if (error)
    return (
      <div
        className="min-h-screen bg-cover bg-center relative"
        style={{ backgroundImage: "url('../src/assets/2996863.webp')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-6xl mx-auto p-6 text-white min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-red-200 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-full shadow-md transition-all duration-300"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  if (!data)
    return (
      <div
        className="min-h-screen bg-cover bg-center relative"
        style={{ backgroundImage: "url('../src/assets/2996863.webp')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative max-w-6xl mx-auto p-6 text-white min-h-screen flex items-center justify-center">
          <div className="text-center animate-pulse">
            <p className="text-lg text-gray-200">Loading contact info...</p>
          </div>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('../src/assets/2996863.webp')" }}
    >
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative max-w-6xl mx-auto p-6 text-white flex flex-col items-center justify-center min-h-screen animate-[fadeIn_0.7s_ease-out]">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-indigo-100 mb-6 drop-shadow-lg">
            {data.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            {data.introduction}
          </p>
          {/* <Link
            to="/chat"
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-8 rounded-full shadow-lg transition-all duration-300 font-semibold text-lg animate-pulse hover:animate-none"
          >
            Start Chatting
          </Link> */}
        </div>
        <div className="bg-white/90 p-6 rounded-lg shadow-md w-full max-w-2xl text-gray-800">
          <img
            src="https://media.post.rvohealth.io/wp-content/uploads/2024/02/Ayurvedic-header.jpg"
            alt="Contact Us"
            className="w-full h-70 object-cover rounded-t-lg mb-4"
          />
          <p className="text-lg mb-4">
            <strong className="text-gray-700">Email:</strong>{" "}
            <a
              href={`mailto:${data.email}`}
              className="text-indigo-500 hover:underline"
            >
              {data.email}
            </a>
          </p>
          <p className="text-lg mb-4">
            <strong className="text-gray-700">Phone:</strong> {data.phone}
          </p>
          <p className="text-lg mb-4">
            <strong className="text-gray-700">Address:</strong> {data.address}
          </p>
          <p className="text-lg">
            <strong className="text-gray-700">Support Hours:</strong>{" "}
            {data.supportHours}
          </p>
          {data.socialMedia && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">
                Connect With Us
              </h2>
              <div className="flex gap-4">
                {data.socialMedia.map((platform, index) => (
                  <a
                    key={index}
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 hover:text-indigo-700 text-sm"
                  >
                    {platform.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
