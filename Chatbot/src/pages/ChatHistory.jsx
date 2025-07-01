import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ChatHistory = () => {
  const { token } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setError("Please log in to view chat history");
      toast.error("Please log in to view chat history");
      return;
    }

    const fetchData = async () => {
      try {
        if (searchQuery.trim()) {
          // Fetch search results
          const response = await axios.get(
            `http://127.0.0.1:8000/search_chats?keyword=${encodeURIComponent(
              searchQuery
            )}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // Group messages by conversation_id
          const grouped = response.data.reduce((acc, msg) => {
            if (!acc[msg.conversation_id]) {
              acc[msg.conversation_id] = {
                conversation_id: msg.conversation_id,
                messages: [],
                timestamp: msg.timestamp,
                name: "", // Will fetch name later
              };
            }
            acc[msg.conversation_id].messages.push(msg);
            // Update timestamp to latest
            if (
              new Date(msg.timestamp) >
              new Date(acc[msg.conversation_id].timestamp)
            ) {
              acc[msg.conversation_id].timestamp = msg.timestamp;
            }
            return acc;
          }, {});

          // Fetch conversation names
          const conversationsWithNames = await Promise.all(
            Object.values(grouped).map(async (conv) => {
              const convResponse = await axios.get(
                `http://127.0.0.1:8000/conversations`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              const convData = convResponse.data.find(
                (c) => c.conversation_id === conv.conversation_id
              );
              return {
                ...conv,
                name: convData
                  ? convData.name
                  : `Conversation ${conv.conversation_id.slice(-6)}`,
              };
            })
          );

          // Sort by latest timestamp
          setConversations(
            conversationsWithNames.sort(
              (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            )
          );
        } else {
          // Fetch all conversations
          const response = await axios.get(
            "http://127.0.0.1:8000/conversations",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const conversationPromises = response.data.map((conv) =>
            axios
              .get(
                `http://127.0.0.1:8000/chats?conversation_id=${conv.conversation_id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              )
              .then((res) => ({
                conversation_id: conv.conversation_id,
                messages: res.data.chats,
                timestamp: conv.latest_timestamp,
                name: conv.name,
              }))
          );

          const results = await Promise.all(conversationPromises);
          setConversations(
            results.sort(
              (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            )
          );
        }
      } catch (err) {
        setError("Failed to load chat history");
        toast.error("Failed to load chat history");
      }
    };

    fetchData();
  }, [token, searchQuery]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleConversationClick = (conversationId) => {
    navigate(`/chat?conversation_id=${conversationId}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-8 text-center">
          Chat History
        </h1>
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search conversations..."
            className="w-full bg-white p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Search conversations"
          />
        </div>
        {conversations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center text-gray-600">
            {searchQuery
              ? "No conversations match your search."
              : "No conversations yet. Start a new chat to see your history!"}
          </div>
        ) : (
          <div className="grid gap-6">
            {conversations.map((conv, index) => {
              // Get first user message and latest bot message for preview
              const userMessage = conv.messages.find(
                (msg) => msg.sender === "user"
              );
              const latestBotMessage = conv.messages
                .filter((msg) => msg.sender === "bot")
                .sort(
                  (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                )[0];

              return (
                <div
                  key={conv.conversation_id}
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer animate-[fadeInUp_0.3s_ease-out]"
                  onClick={() => handleConversationClick(conv.conversation_id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View conversation ${conv.name}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleConversationClick(conv.conversation_id);
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl shrink-0">
                      🌿
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {conv.name}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(conv.timestamp)}
                        </span>
                      </div>
                      {userMessage && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600 font-medium">
                            You:
                          </p>
                          <p className="text-sm text-gray-800 line-clamp-2">
                            {userMessage.message}
                          </p>
                        </div>
                      )}
                      {latestBotMessage && (
                        <div>
                          <p className="text-sm text-gray-600 font-medium">
                            Ayurvaid:
                          </p>
                          <p className="text-sm text-gray-800 line-clamp-2">
                            {latestBotMessage.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
