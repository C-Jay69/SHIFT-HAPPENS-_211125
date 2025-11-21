import React, { useState } from 'react';
import { generateRestaurantAssistantResponse } from '../services/geminiService';
import { useAppStore } from '../store';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';

const AIAgent = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Hello! I'm ShiftBot. Ask me about recipes, inventory, or drafting replies to reviews." }
  ]);
  const [loading, setLoading] = useState(false);
  const { ingredients, MENU_ITEMS } = useAppStore();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    // Prepare context from current store state
    const contextSummary = `
      Current Low Stock Items: ${ingredients.filter(i => i.stock <= i.threshold).map(i => i.name).join(', ')}.
      Menu Categories: ${['FOOD', 'DRINK'].join(', ')}.
    `;

    const responseText = await generateRestaurantAssistantResponse(userMsg, contextSummary);
    
    setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-4rem)] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-shift-blue to-shift-cyan p-6 text-white flex items-center gap-4">
        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
          <Sparkles size={24} />
        </div>
        <div>
          <h2 className="font-bold text-xl">AI Manager Assistant</h2>
          <p className="text-sm opacity-90">Powered by Google Gemini 2.5</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-shift-dark text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
            }`}>
              {msg.role === 'ai' && <Bot size={16} className="mb-2 text-shift-blue" />}
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl border border-gray-200 rounded-tl-none flex items-center gap-2">
               <Loader2 className="animate-spin text-shift-blue" size={16} />
               <span className="text-xs font-bold text-gray-400">Thinking...</span>
             </div>
           </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about inventory, recipes, or reviews..."
            className="flex-1 bg-gray-100 border-0 rounded-xl px-4 focus:ring-2 focus:ring-shift-blue focus:outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="p-4 bg-shift-blue text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;