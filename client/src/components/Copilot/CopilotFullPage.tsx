import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import api from '../../lib/api';
import { Send, Bot, Loader2 } from 'lucide-react';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
}

const CopilotFullPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (messages.length === 0 && user) {
      loadHistory();
    }
  }, [user]);

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
        setMessages([{ role: 'assistant', content: `Hello! I am your FinSight AI Copilot. I have loaded context for the ${user?.role || ''} role. How can I assist you today?` }]);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200">
      
      {/* Header */}
      <div className="bg-[#0A2342] text-white p-6 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <Bot className="w-8 h-8 text-blue-300" />
          <div>
            <h1 className="text-xl font-bold">AI Copilot Dashboard</h1>
            <p className="text-sm text-blue-200 capitalize">{user.role.toLowerCase()} Access Configured</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex-col flex bg-white">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl p-4 text-[15px] flex space-x-3 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                  : 'bg-gray-50 border border-gray-100 text-gray-800 shadow-sm rounded-bl-none'
              }`}>
              {msg.role === 'assistant' && <Bot className="w-5 h-5 mt-1 flex-shrink-0 text-blue-500" />}
              <div className="leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-gray-50 border border-gray-100 text-gray-800 shadow-sm rounded-2xl rounded-bl-none p-4 text-[15px] flex space-x-3 items-center text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                <span className="font-medium">Synthesizing response...</span>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <form onSubmit={handleSend} className="flex space-x-4 max-w-5xl mx-auto items-end">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI Copilot... (Press Enter to send, Ctrl+Enter for new line)"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition resize-none min-h-[56px] max-h-48 scrollbar-hide"
              rows={Math.min(5, input.split('\n').length)}
            />
          </div>
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-[#0A2342] text-white p-3 md:px-6 rounded-xl hover:bg-blue-900 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shrink-0 mb-1"
          >
            <span className="hidden md:inline font-semibold">Send</span>
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CopilotFullPage;
