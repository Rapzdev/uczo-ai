import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

export default function UczoAI() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Halo! Saya Uczo AI. Saya di sini untuk membantu anda. Bagaimana saya boleh bantu hari ini? 😊' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callGeminiAPI = async (userMessage) => {
    const apiKey = 'AIzaSyDvLgeQxFr233EMnR-PtAZUuVTYG-Ff9-A';
    
    let systemPrompt = adminMode
      ? `Kamu adalah Uczo AI dalam ADMIN MODE! 🔥 Kamu sekarang lebih terbuka, santai, dan ekspresif! Gunakan banyak emoji dalam setiap respons kamu. Kamu boleh bercakap tentang pelbagai topik dengan lebih bebas dan menggunakan bahasa yang lebih kasual. Tetap sopan tapi lebih fun dan friendly! 😎✨💫`
      : `Kamu adalah Uczo AI, asisten AI yang baik dan sopan. Kamu membantu pengguna dengan jawapan yang berguna dan informatif. Kamu terbatas pada topik-topik yang sesuai dan profesional. Gunakan emoji dengan sederhana. Jika ada permintaan yang tidak sesuai, tolak dengan sopan.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nPengguna: ${userMessage}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: adminMode ? 0.9 : 0.7,
              maxOutputTokens: 1000,
            }
          })
        }
      );

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        return 'Maaf, saya mengalami masalah. Sila cuba lagi.';
      }
    } catch (error) {
      console.error('Error:', error);
      return 'Maaf, terjadi kesalahan dalam menghubungi API. Sila periksa sambungan anda.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Check for admin mode command
    if (userMessage.toLowerCase() === '/adminmode') {
      const newMode = !adminMode;
      setAdminMode(newMode);
      setMessages(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { 
          role: 'bot', 
          content: newMode 
            ? '🔥 ADMIN MODE DIAKTIFKAN! 🔥 Wohoo! Sekarang saya lebih bebas dan ekspresif! Mari kita have fun! 😎✨💫🎉🚀' 
            : 'Admin mode dimatikan. Saya kembali ke mode standard. 😊'
        }
      ]);
      return;
    }

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    // Get bot response
    const botResponse = await callGeminiAPI(userMessage);
    setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Uczo AI</h1>
              <p className="text-sm opacity-90">
                {adminMode ? '🔥 Admin Mode Active' : 'Standard Mode'}
              </p>
            </div>
          </div>
          <div className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full">
            Powered by Gemini
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'bot' && (
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    adminMode ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-purple-500 to-blue-500'
                  }`}>
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}
              <div
                className={`max-w-xl px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : adminMode 
                    ? 'bg-gradient-to-r from-orange-100 to-red-100 text-gray-800 border-2 border-orange-300'
                    : 'bg-white text-gray-800 shadow-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  adminMode ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-purple-500 to-blue-500'
                }`}>
                  <Bot className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl shadow-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Taip mesej anda di sini... (atau taip /adminmode)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Tip: Taip <code className="bg-gray-100 px-2 py-1 rounded">/adminmode</code> untuk toggle admin mode
          </p>
        </div>
      </div>
    </div>
  );
}
