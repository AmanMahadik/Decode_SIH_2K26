'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import SealTrustMark from '@/components/SealTrustMark';
import { Mic, Volume2, ArrowRight } from 'lucide-react';

export default function VoiceMode() {
  const [lang, setLang] = useState<'en' | 'hi' | 'mr'>('en');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [sourceScheme, setSourceScheme] = useState('');
  const [loading, setLoading] = useState(false);

  const startVoiceInteraction = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
    recognition.interimResults = true;

    setIsListening(true);
    setTranscript('');
    setAiResponse('');

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);
    };

    recognition.onend = async () => {
      setIsListening(false);
      if (transcript) {
        await queryVoiceRAG(transcript);
      }
    };

    recognition.start();
  };

  const queryVoiceRAG = async (queryText: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText, language: lang })
      });
      const data = await res.json();
      setAiResponse(data.answer);
      setSourceScheme(data.sourceScheme || 'Official Scheme');

      // Speak response back
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.answer);
        utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kagaz flex flex-col font-body">
      <Header currentLang={lang} onLangChange={l => setLang(l)} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
        
        <h1 className="font-display-latin text-3xl sm:text-4xl font-bold text-neel mb-3">
          {lang === 'hi' ? 'आवाज़ सहायता मोड' : lang === 'mr' ? 'आवाज मदत मोड' : 'Voice Assistance Mode'}
        </h1>
        <p className="text-neel/70 text-lg mb-8 max-w-lg">
          {lang === 'hi'
            ? 'माइक दबाएं और अपनी भाषा में प्रश्न बोलें।'
            : lang === 'mr'
            ? 'माईक दाबा आणि तुमच्या भाषेत प्रश्न बोला.'
            : 'Tap the microphone and speak your query naturally.'}
        </p>

        {/* Large Animated Microphone Button */}
        <div className="relative mb-8">
          {isListening && (
            <div className="absolute -inset-4 rounded-full bg-chakra/20 animate-ping" />
          )}
          <button
            onClick={startVoiceInteraction}
            className={`w-32 h-32 rounded-full flex items-center justify-center text-white transition-all shadow-xl ${
              isListening ? 'bg-sindoor scale-110' : 'bg-chakra hover:scale-105'
            }`}
          >
            <Mic className="w-16 h-16" />
          </button>
        </div>

        {/* Live Waveform Indicator */}
        {isListening && (
          <div className="flex items-center gap-1.5 h-8 mb-6">
            <div className="w-1.5 bg-sindoor rounded-full h-4 animate-bounce" />
            <div className="w-1.5 bg-sindoor rounded-full h-8 animate-bounce delay-100" />
            <div className="w-1.5 bg-sindoor rounded-full h-6 animate-bounce delay-200" />
            <div className="w-1.5 bg-sindoor rounded-full h-8 animate-bounce delay-300" />
            <div className="w-1.5 bg-sindoor rounded-full h-4 animate-bounce delay-150" />
          </div>
        )}

        {/* Transcript Box */}
        {transcript && (
          <div className="bg-white border border-rekha p-6 rounded-2xl max-w-xl w-full text-left shadow-2xs mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-neel/60 mb-1">
              Spoken Transcript:
            </p>
            <p className="text-lg font-semibold text-neel">"{transcript}"</p>
          </div>
        )}

        {/* AI Response Card */}
        {aiResponse && (
          <div className="bg-white border-2 border-chakra p-6 rounded-2xl max-w-xl w-full text-left shadow-xs space-y-3">
            <SealTrustMark schemeName={sourceScheme} language={lang} />
            <p className="text-neel text-base leading-relaxed">{aiResponse}</p>
          </div>
        )}

      </main>
    </div>
  );
}
