'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import SealTrustMark from '@/components/SealTrustMark';
import { Send, Mic, Sparkles, ArrowRight, Volume2, ThumbsUp, ThumbsDown, Check } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  sourceScheme?: string;
  officialLink?: string;
  suggestedFollowups?: string[];
  isHighConfidence?: boolean;
  userRating?: 'up' | 'down';
  userQueryForFeedback?: string;
}

export default function ChatHome() {
  const [lang, setLang] = useState<'en' | 'hi' | 'mr'>('en');
  const [textSize, setTextSize] = useState<number>(18);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = {
    en: [
      'Am I eligible for PM-Kisan ₹6,000 yearly benefit?',
      'How to get Ayushman Bharat ₹5 Lakh health card?',
      'What are the housing subsidy steps under PMAY?',
      'Best government schemes for girl child education?'
    ],
    hi: [
      'क्या मैं पीएम-किसान ₹6,000 योजना के लिए पात्र हूं?',
      'आयुष्मान भारत ₹5 लाख स्वास्थ्य कार्ड कैसे बनवाएं?',
      'PMAY के तहत घर की सब्सिडी के नियम क्या हैं?',
      'बालिकाओं की शिक्षा के लिए सरकारी योजनाएं?'
    ],
    mr: [
      'मी पीएम-किसान ₹६,००० योजनेसाठी पात्र आहे का?',
      'आयुष्मान भारत ₹५ लाख आरोग्य कार्ड कसे मिळवायचे?',
      'PMAY अंतर्गत घर सबसिडी कशी मिळवावी?',
      'मुलींच्या शिक्षणासाठी सर्वोत्तम सरकारी योजना?'
    ]
  };

  useEffect(() => {
    const welcomeTexts = {
      en: 'Namaste! I am JAN-SAHAYAK, your AI Digital Citizen Assistant. Ask me anything about Indian government schemes, eligibility, and application steps in your language.',
      hi: 'नमस्ते! मैं जन-सहायक हूँ, आपका एआई डिजिटल नागरिक सहायक। मुझसे भारतीय सरकारी योजनाओं, पात्रता और आवेदन के बारे में किसी भी भाषा में पूछें।',
      mr: 'नमस्ते! मी जन-सहायक आहे, तुमचा एआय डिजिटल नागरिक सहाय्यक. मला भारतीय सरकारी योजनांबद्दल तुमच्या भाषेत प्रश्न विचारा.'
    };

    setMessages([
      {
        id: '1',
        sender: 'bot',
        text: welcomeTexts[lang],
        sourceScheme: 'National Scheme Registry (All Schemes)',
        isHighConfidence: true
      }
    ]);
  }, [lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || inputQuery;
    if (!queryText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText, language: lang })
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.answer || 'I am happy to assist you with government schemes.',
        sourceScheme: data.sourceScheme || 'National Scheme Registry',
        officialLink: data.officialLink,
        suggestedFollowups: data.suggestedFollowups,
        isHighConfidence: data.confidenceScore >= 0.8,
        userQueryForFeedback: queryText
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Unable to connect to government knowledge database. Please check your internet connection.',
          sourceScheme: 'System Warning',
          isHighConfidence: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (msgId: string, rating: 'up' | 'down') => {
    setMessages(prev =>
      prev.map(m => (m.id === msgId ? { ...m, userRating: rating } : m))
    );

    const targetMsg = messages.find(m => m.id === msgId);
    if (!targetMsg) return;

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: targetMsg.userQueryForFeedback || 'General Inquiry',
          answer: targetMsg.text,
          sourceScheme: targetMsg.sourceScheme || 'General',
          rating: rating
        })
      });
    } catch (e) {
      console.error('Feedback rating submit error:', e);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
    recognition.interimResults = false;

    if (!isListening) {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      setIsListening(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-kagaz flex flex-col font-body relative"
      style={{ fontSize: `${textSize}px` }}
    >
      <Header
        currentLang={lang}
        onLangChange={newLang => setLang(newLang)}
        onTextSizeToggle={() => setTextSize(prev => (prev > 18 ? 18 : 20))}
        textSizeLevel={textSize}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col justify-between pb-36">
        
        {/* Messages Thread */}
        <div className="space-y-6">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.sender === 'user' ? (
                <div className="bg-chakra text-white px-5 py-3.5 rounded-2xl rounded-tr-xs max-w-[85%] shadow-xs font-medium">
                  {msg.text}
                </div>
              ) : (
                <div className="bg-white border border-rekha p-5 rounded-2xl rounded-tl-xs max-w-[95%] sm:max-w-[90%] shadow-xs text-neel space-y-3">
                  
                  {msg.sourceScheme && (
                    <SealTrustMark
                      schemeName={msg.sourceScheme}
                      isHighConfidence={msg.isHighConfidence}
                      officialLink={msg.officialLink}
                      language={lang}
                    />
                  )}

                  <div className="whitespace-pre-line leading-relaxed text-neel font-normal">
                    {msg.text}
                  </div>

                  {/* Actions Bar: Official Link, Audio TTS, Thumbs Up / Down */}
                  <div className="pt-3 border-t border-rekha/50 flex items-center justify-between flex-wrap gap-2">
                    {msg.officialLink ? (
                      <a
                        href={msg.officialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-chakra font-bold hover:underline text-sm"
                      >
                        <span>
                          {lang === 'hi'
                            ? 'आधिकारिक पोर्टल पर आवेदन करें'
                            : lang === 'mr'
                            ? 'अधिकृत पोर्टलवर अर्ज करा'
                            : 'Apply at Official Portal'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-neel/50">Verified Citizen Guidance</span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => speakText(msg.text)}
                        className="p-1.5 rounded-lg hover:bg-rekha/30 text-chakra flex items-center gap-1 text-xs font-bold"
                        title="Listen Audio Response"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Listen</span>
                      </button>

                      {/* Thumbs Up / Down Feedback Rating */}
                      <div className="flex items-center gap-1 border-l border-rekha pl-2">
                        <button
                          onClick={() => handleRating(msg.id, 'up')}
                          className={`p-1.5 rounded-lg transition-colors ${
                            msg.userRating === 'up'
                              ? 'bg-tulsi text-white'
                              : 'hover:bg-rekha/30 text-neel/60 hover:text-tulsi'
                          }`}
                          title="Helpful Response (Thumbs Up)"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRating(msg.id, 'down')}
                          className={`p-1.5 rounded-lg transition-colors ${
                            msg.userRating === 'down'
                              ? 'bg-sindoor text-white'
                              : 'hover:bg-rekha/30 text-neel/60 hover:text-sindoor'
                          }`}
                          title="Needs Improvement (Thumbs Down)"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {msg.userRating && (
                    <p className="text-[11px] font-bold text-tulsi flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Thank you for your rating feedback!</span>
                    </p>
                  )}

                  {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {msg.suggestedFollowups.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(chip)}
                          className="text-xs font-bold text-neel bg-haldi/10 border border-haldi/40 px-3 py-1.5 rounded-full hover:bg-haldi/20 transition-colors"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 bg-white border border-rekha px-4 py-3 rounded-2xl w-fit shadow-2xs text-chakra font-bold animate-pulse">
              <Sparkles className="w-5 h-5 text-haldi animate-spin" />
              <span>
                {lang === 'hi'
                  ? 'सरकारी दस्तावेज़ों में खोज की जा रही है...'
                  : lang === 'mr'
                  ? 'सरकारी कागदपत्रांमध्ये शोधत आहे...'
                  : 'Searching official scheme documents...'}
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions (Chips) */}
        {messages.length <= 2 && (
          <div className="my-4">
            <p className="text-xs font-bold uppercase tracking-wider text-neel/60 mb-2">
              {lang === 'hi' ? 'सुझाए गए प्रश्न (टैप करें):' : lang === 'mr' ? 'सुचवलेले प्रश्न (टॅप करा):' : 'Suggested Questions (Tap to ask):'}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions[lang].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="bg-white border border-haldi/60 text-neel font-medium text-sm px-4 py-2 rounded-full hover:bg-haldi/10 hover:border-haldi transition-all shadow-2xs text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Floating Bottom Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-kagaz/95 backdrop-blur-xs border-t border-rekha py-3 px-4 z-40">
        <div className="max-w-4xl mx-auto bg-white border border-rekha rounded-2xl p-2.5 shadow-md flex items-center gap-2">
          <button
            onClick={toggleVoiceInput}
            className={`touch-target rounded-xl p-3 text-white transition-all shadow-xs ${
              isListening ? 'bg-sindoor animate-bounce' : 'bg-chakra hover:bg-chakra/90'
            }`}
            title="Speak your question (Voice Input)"
          >
            <Mic className="w-6 h-6" />
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={
              lang === 'hi'
                ? 'सरकारी योजना के बारे में पूछें...'
                : lang === 'mr'
                ? 'सरकारी योजनेबद्दल विचारा...'
                : 'Ask about any government scheme...'
            }
            className="flex-1 bg-transparent px-3 py-2 text-neel placeholder:text-neel/40 focus:outline-hidden text-base font-medium"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="touch-target bg-chakra text-white rounded-xl px-5 py-3 font-bold hover:bg-chakra/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-1"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
