import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import api from '../../lib/api';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

const CopilotChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isOpen && messages.length === 0 && user) {
      loadHistory();
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const { data } = await api.get('/copilot/history');
      if (data && data.length > 0) {
        setMessages(data);
      } else {
        setMessages([{ role: 'assistant', content: `Hello! I am your FinSight AI Copilot. How can I assist you today?` }]);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data } = await api.post('/copilot/chat', { message: userMessage });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null; // Only show if logged in

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 h-[500px] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden border border-gray-100 animate-in slide-in-from-bottom flex-shrink-0">
          
          {/* Header */}
          <div className="bg-[#0A2342] text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-300" />
              <div>
                <h3 className="font-semibold text-sm">FinSight AI Copilot</h3>
                <p className="text-xs text-blue-200 capitalize">{user.role.toLowerCase()} Access</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 flex-col flex">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm flex space-x-2 ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-none'
                  }`}>
                  {msg.role === 'assistant' && <Bot className="w-4 h-4 mt-1 flex-shrink-0 text-blue-500" />}
                  <div className="leading-relaxed whitespace-pre-wrap">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-3 mb-1" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold mt-3 mb-1" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-extrabold" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white border border-gray-100 text-gray-800 shadow-sm rounded-2xl rounded-bl-none p-3 text-sm flex space-x-2 items-center text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    <span>Thinking...</span>
                 </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            <form onSubmit={handleSend} className="flex space-x-2">
              <div className="relative flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your AI Copilot..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition resize-none min-h-[40px] max-h-32 scrollbar-hide"
                  rows={Math.min(3, input.split('\n').length)}
                />
              </div>
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'scale-0' : 'scale-100'} transition-transform duration-200 bg-[#0A2342] hover:bg-blue-900 text-white p-4 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
};

export default CopilotChat;
