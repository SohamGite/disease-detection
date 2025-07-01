import React, { useState, useRef, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import { FaMicrophone } from "react-icons/fa";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const ChatBot = () => {
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationName, setConversationName] = useState("New Conversation");
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const location = useLocation();
  const [conversationId, setConversationId] = useState(() => {
    const urlParam = new URLSearchParams(location.search).get(
      "conversation_id"
    );
    return (
      urlParam ||
      new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, 18)
    );
  });

  // Update conversationId if URL changes
  useEffect(() => {
    const urlParam = new URLSearchParams(location.search).get(
      "conversation_id"
    );
    if (urlParam && urlParam !== conversationId) {
      setConversationId(urlParam);
    }
  }, [location.search]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Fetch existing conversation
  useEffect(() => {
    if (!token) {
      toast.error("Please log in to use the chatbot");
      setMessages([
        {
          sender: "bot",
          text: "Please log in to start chatting.",
          timestamp: new Date().toISOString(),
        },
      ]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    axios
      .get(`http://127.0.0.1:8000/chats?conversation_id=${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (isMounted) {
          const { chats, conversation_name } = response.data;
          setConversationName(conversation_name || "New Conversation");

          if (chats.length === 0) {
            setMessages([
              {
                sender: "bot",
                text: "👋 Welcome to Ayurv-aid! How can I assist you today?",
                timestamp: new Date().toISOString(),
              },
            ]);
          } else {
            const formattedChats = chats.map((chat) => ({
              sender: chat.sender,
              text:
                chat.sender === "bot" ? formatText(chat.message) : chat.message,
              timestamp: chat.timestamp,
            }));
            setMessages(formattedChats);
          }
        }
      })
      .catch((err) => {
        console.error("Error loading conversation:", err);
        if (isMounted) {
          toast.error("Failed to load conversation");
          setConversationName("New Conversation");
          setMessages([
            {
              sender: "bot",
              text: "👋 Welcome to Ayurv-aid! How can I assist you today?",
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token, conversationId]);

  const startListening = () => {
    recognitionRef.current?.start();
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setTimeout(() => sendMessage(transcript), 300);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setListening(false);
        toast.error("Speech recognition failed");
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const formatText = (text) => {
    let formattedText = text
      .replace(
        /\*\*(.*?)\*\*/g,
        '<span class="font-semibold text-gray-900">$1</span>'
      )
      .replace(/\*(.*?)\*/g, '<span class="italic text-gray-800">$1</span>')
      .replace(/\n/g, "<br />");
    return formattedText;
  };

  const sendMessage = async (customInput) => {
    const text = String(customInput || input).trim();
    if (!text) return;

    const userMessage = {
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/predict",
        { user_input: text, conversation_id: conversationId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const botReply = {
        sender: "bot",
        text: formatText(response.data.response.trim()),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botReply]);

      // Update conversation name after first user message in new conversation
      if (!new URLSearchParams(location.search).get("conversation_id")) {
        axios
          .get(
            `http://127.0.0.1:8000/chats?conversation_id=${conversationId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          .then((response) => {
            setConversationName(
              response.data.conversation_name || "New Conversation"
            );
          });
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      toast.error("Failed to get response");
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "❌ Sorry, something went wrong.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <div className="relative max-w-3xl w-full mx-auto bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden flex flex-col h-[80vh] max-h-[800px] border border-gray-200/50 animate-[fadeInUp_0.5s_ease-out]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-blue-600 p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl">🌿</span>
            </div>
            <h2
              className="text-xl font-semibold text-white truncate"
              title={conversationName}
            >
              {conversationName}
            </h2>
          </div>
          <Link
            to="/history"
            className="text-white text-sm hover:underline"
            aria-label="View chat history"
          >
            View History
          </Link>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/90">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              } items-end gap-3 animate-[fadeInUp_0.3s_ease-out]`}
              role="region"
              aria-label={
                msg.sender === "user" ? "User message" : "Bot message"
              }
            >
              {msg.sender === "bot" && (
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-lg shrink-0">
                  🌿
                </div>
              )}
              <div
                className={`relative px-4 py-3 max-w-[80%] rounded-xl shadow-md transition-all duration-200 ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-gray-50 text-gray-900 rounded-bl-none border border-gray-200"
                }`}
              >
                <div
                  className="leading-relaxed text-sm"
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />
                <div
                  className={`text-xs mt-1 ${
                    msg.sender === "user" ? "text-indigo-200" : "text-gray-500"
                  }`}
                >
                  {formatTimestamp(msg.timestamp)}
                </div>
                <div
                  className={`absolute w-3 h-3 ${
                    msg.sender === "user"
                      ? "bottom-0 right-0 rounded-br-xl bg-indigo-600"
                      : "bottom-0 left-0 rounded-bl-xl bg-gray-50 border-b border-l border-gray-200"
                  }`}
                />
              </div>
              {msg.sender === "user" && (
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-lg shrink-0">
                  😊
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div
              className="flex justify-start items-end gap-3 animate-[fadeIn_0.3s_ease-out]"
              role="region"
              aria-label="Bot typing"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-lg shrink-0">
                🌿
              </div>
              <div className="rounded-xl px-4 py-3 bg-gray-50 shadow-md border border-gray-200 rounded-bl-none">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-[pulse_1s_infinite]"></div>
                  <div
                    className="w-2 h-2 bg-indigo-500 rounded-full animate-[pulse_1s_infinite]"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-indigo-500 rounded-full animate-[pulse_1s_infinite]"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4 flex items-center gap-3">
          <input
            type="text"
            className="flex-1 px-5 py-3 rounded-full bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 shadow-sm disabled:opacity-50"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isLoading) sendMessage();
            }}
            disabled={isLoading}
            aria-label="Chat input"
          />
          <button
            onClick={() => sendMessage()}
            className={`p-3 rounded-full shadow-md transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
            disabled={isLoading}
            aria-label="Send message"
          >
            <PaperPlaneIcon className="h-5 w-5" />
          </button>
          <button
            onClick={startListening}
            className={`p-3 rounded-full shadow-md transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-offset-2 ${
              listening
                ? "bg-red-500 hover:bg-red-600 focus:ring-red-400"
                : "bg-green-500 hover:bg-green-600 focus:ring-green-400"
            } text-white ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            title={listening ? "Stop listening" : "Start listening"}
            disabled={isLoading}
            aria-label={
              listening ? "Stop speech recognition" : "Start speech recognition"
            }
          >
            <FaMicrophone className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
