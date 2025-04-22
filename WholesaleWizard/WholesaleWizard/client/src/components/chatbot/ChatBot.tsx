import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send } from "lucide-react";
import { askChatbot } from "@/lib/openai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Hi there! How can I help you with your wholesale ordering today?" 
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = { role: "user", content: inputValue };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      // Get response from chatbot
      const response = await askChatbot(inputValue, messages);
      
      // Add assistant response
      const assistantMessage: Message = { role: "assistant", content: response };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      
      // Add error message
      const errorMessage: Message = { 
        role: "assistant", 
        content: "I'm sorry, I'm having trouble connecting. Please try again later." 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg w-72 md:w-80 overflow-hidden">
          <div className="bg-[#0f766e] text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">GreenGrocer Assistant</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-[#0f766e]/80 h-6 w-6"
              onClick={toggleChat}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-3 h-80 overflow-y-auto bg-slate-50">
            {messages.map((message, index) => (
              <div key={index} className="mb-3">
                {message.role === "assistant" ? (
                  <div className="flex items-start">
                    <div className="h-8 w-8 bg-[#0f766e] rounded-full text-white flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="ml-2 bg-white p-3 rounded-lg shadow-sm max-w-[85%]">
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-end">
                    <div className="mr-2 bg-[#0f766e]/10 p-3 rounded-lg shadow-sm max-w-[85%]">
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="h-8 w-8 bg-slate-200 rounded-full text-slate-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">You</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start">
                <div className="h-8 w-8 bg-[#0f766e] rounded-full text-white flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="ml-2 bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-[#0f766e]/60 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-[#0f766e]/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 bg-[#0f766e]/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="p-3 border-t">
            <div className="flex">
              <Input
                type="text"
                placeholder="Type your message..."
                className="flex-1 rounded-r-none focus-visible:ring-[#0f766e]"
                value={inputValue}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                className="bg-[#0f766e] hover:bg-[#0f766e]/90 rounded-l-none"
                disabled={isLoading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <Button
          className="bg-[#0f766e] hover:bg-[#0f766e]/90 text-white rounded-full h-14 w-14 flex items-center justify-center shadow-lg"
          onClick={toggleChat}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};

export default ChatBot;
