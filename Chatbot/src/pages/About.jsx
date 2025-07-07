import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const About = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      axios
        .get("http://127.0.0.1:8000/about")
        .then((response) => setData(response.data))
        .catch((err) => {
          console.error("Error fetching about data:", err);
          setError("Failed to load about content.");
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
            <p className="text-lg text-gray-200">Loading about content...</p>
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
            {data.purpose}
          </p>
          <Link
            to="/chat"
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-8 rounded-full shadow-lg transition-all duration-300 font-semibold text-lg animate-pulse hover:animate-none"
          >
            Start Chatting
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full px-4">
          <div className="bg-white/90 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-gray-800">
            <img
              src="https://media.post.rvohealth.io/wp-content/uploads/2024/02/Ayurvedic-header.jpg"
              alt="Ayurvedic Dataset"
              className="w-full h-40 object-cover rounded-t-lg mb-4"
            />
            <h2 className="text-xl font-semibold mb-3">Our Dataset</h2>
            <ul className="list-disc list-inside text-sm space-y-2">
              {data.dataset.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-white/90 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-gray-800">
            <img
              src="https://tse3.mm.bing.net/th/id/OIP.RQ2-RI8faNi0dBMRNB0HoAHaD3?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
              alt="AI Workflow"
              className="w-full h-40 object-cover rounded-t-lg mb-4"
            />
            <h2 className="text-xl font-semibold mb-3">How It Works</h2>
            <ol className="list-decimal list-inside text-sm space-y-2">
              {data.workflow.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="bg-white/90 p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-gray-800">
            <img
              src="https://tse2.mm.bing.net/th/id/OIP.MM0vcg2oubk2RabFf3FcYAHaEi?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
              // src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
              alt="Disclaimer"
              className="w-full h-40 object-cover rounded-t-lg mb-4"
            />
            <h2 className="text-xl font-semibold mb-3">Disclaimer</h2>
            <p className="text-sm">{data.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
