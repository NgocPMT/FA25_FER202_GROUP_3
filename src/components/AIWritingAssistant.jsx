import { useState, useRef, useEffect } from "react";
import { RiRobot2Line, RiSendPlane2Fill } from "react-icons/ri";
import { IoClose, IoExpand, IoContract } from "react-icons/io5";
import { FiUser } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsStars } from "react-icons/bs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AIWritingAssistant = ({ title, getEditorContent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [userPrompt]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userPrompt.trim() || isLoading) return;

    const content = getEditorContent();

    if (!content) {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content:
            "Please add some content to your post before asking for assistance.",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const userMessage = {
      role: "user",
      content: userPrompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setUserPrompt("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/writing-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title || "Untitled",
            content: JSON.stringify(content),
            userPrompt: userPrompt,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get AI response");
      }

      const aiMessage = {
        role: "assistant",
        content: data.generatedText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("AI Assistant Error:", err);
      const errorMessage = {
        role: "system",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-amber-300 to bg-amber-100 text-black rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group"
          title="AI Writing Assistant"
        >
          <BsStars className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Chatbox */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white rounded-lg shadow-2xl flex flex-col transition-all duration-300 ${
            isExpanded
              ? "inset-4 md:inset-8"
              : "bottom-6 right-6 w-[90vw] h-[70vh] md:w-96 md:h-[600px]"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-300 to bg-amber-100 text-black p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <RiRobot2Line className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Writing Assistant</h3>
                <p className="text-xs text-gray-700">
                  {isLoading ? "Thinking..." : "Ready to help"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleExpanded}
                className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition"
                title={isExpanded ? "Minimize" : "Expand"}
              >
                {isExpanded ? (
                  <IoContract className="w-5 h-5" />
                ) : (
                  <IoExpand className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition"
                title="Close"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <BsStars className="w-10 h-10 text-amber-200" />
                </div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">
                  Welcome to AI Writing Assistant!
                </h4>
                <p className="text-sm text-gray-600 max-w-xs">
                  Ask me to help improve your writing, expand ideas, fix
                  grammar, or answer questions about your content.
                </p>
                <div className="mt-6 space-y-2 w-full max-w-xs">
                  <button
                    onClick={() =>
                      setUserPrompt("Can you help me improve this paragraph?")
                    }
                    className="w-full text-left px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition text-sm text-gray-700 border border-gray-200"
                  >
                    💡 Improve this paragraph
                  </button>
                  <button
                    onClick={() =>
                      setUserPrompt("Expand on this idea with more details")
                    }
                    className="w-full text-left px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition text-sm text-gray-700 border border-gray-200"
                  >
                    ✨ Expand this idea
                  </button>
                  <button
                    onClick={() =>
                      setUserPrompt("Check grammar and fix errors")
                    }
                    className="w-full text-left px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition text-sm text-gray-700 border border-gray-200"
                  >
                    ✅ Check grammar
                  </button>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user"
                      ? "bg-yellow-300 text-gray-700"
                      : message.role === "assistant"
                      ? "bg-gradient-to-br from-amber-300 to bg-amber-100 text-black"
                      : "bg-gray-400 text-white"
                  }`}
                >
                  {message.role === "user" ? (
                    <FiUser className="w-5 h-5" />
                  ) : message.role === "assistant" ? (
                    <RiRobot2Line className="w-5 h-5" />
                  ) : (
                    "!"
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-yellow-300 text-gray-700"
                      : message.role === "assistant"
                      ? "bg-white border border-gray-200 text-gray-800"
                      : "bg-yellow-50 border border-yellow-200 text-gray-800"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                  <p
                    className={`text-xs mt-2 ${
                      message.role === "user"
                        ? "text-gray-500"
                        : "text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to bg-amber-100 text-black flex items-center justify-center flex-shrink-0">
                  <RiRobot2Line className="w-5 h-5" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <AiOutlineLoading3Quarters className="w-5 h-5 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-xs text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
              >
                🗑️ Clear chat
              </button>
            )}
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your writing..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent resize-none text-sm"
                rows="1"
                disabled={isLoading}
              />
              <button
                onClick={handleSubmit}
                disabled={!userPrompt.trim() || isLoading}
                className="w-12 h-12 bg-gradient-to-br from-amber-300 to bg-amber-100 text-black rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                title="Send message"
              >
                <RiSendPlane2Fill className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIWritingAssistant;
