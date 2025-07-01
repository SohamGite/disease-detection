import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Services = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      axios
        .get("http://127.0.0.1:8000/services")
        .then((response) => setData(response.data))
        .catch((err) => {
          console.error("Error fetching services data:", err);
          setError("Failed to load services.");
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
            <p className="text-lg text-gray-200">Loading services...</p>
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
            {data.description}
          </p>
          <Link
            to="/chat"
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-8 rounded-full shadow-lg transition-all duration-300 font-semibold text-lg animate-pulse hover:animate-none"
          >
            Explore Services
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full px-4">
          {data.services.map((service, index) => (
            <div
              key={index}
              className="bg-white/90 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-gray-800"
            >
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                alt={`${service.name} Icon`}
                className="w-full h-40 object-cover rounded-t-lg mb-4"
              />
              <h2 className="text-xl font-semibold mb-3">{service.name}</h2>
              <p className="text-sm mb-2">{service.description}</p>
              {service.details && (
                <ul className="list-disc list-inside text-sm space-y-1">
                  {service.details.map((detail, i) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              )}
              {service.note && (
                <p className="text-xs text-gray-500 mt-2 italic">
                  {service.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
