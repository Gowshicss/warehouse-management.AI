import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bot, Send, User, Sparkles, ShieldAlert } from 'lucide-react';

const AIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your Smart Warehouse Intelligence Assistant. I am connected directly to your SQLite database. Ask me anything about stock reserves, vehicle telemetry, worker safety, or warehouse priorities!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sampleQuestions = [
    "Which products may run out soon?",
    "Which vehicle has the lowest health?",
    "How many workers are absent today?",
    "How many PPE violations occurred today?",
    "What is the current stock of Industrial Fasteners?",
    "How much energy was consumed today?"
  ];

  const handleSend = async (textToSend) => {
    const q = textToSend || input;
    if (!q.trim()) return;

    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/ai/chat', { message: q });
      setMessages((prev) => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Error connecting to database intent engine.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          <span>AI Warehouse Assistant</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Natural Language Database Analytics & Intent Processing.
        </p>
      </div>

      {/* Suggested Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold shrink-0">Try asking:</span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-full text-slate-700 text-[11px] font-medium shrink-0 shadow-2xs transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat History Window */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs min-h-[420px] flex flex-col justify-between space-y-4">
        <div className="space-y-4 overflow-y-auto max-h-[450px] pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`p-3.5 rounded-2xl text-xs font-medium max-w-xl whitespace-pre-wrap leading-relaxed shadow-2xs ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-11">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Querying database tables...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 pt-2 border-t border-slate-100"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Assistant about stock, vehicles, safety, or attendance..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
