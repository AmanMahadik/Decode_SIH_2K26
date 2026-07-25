'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SealTrustMark from '@/components/SealTrustMark';
import { Search, Bookmark, ExternalLink, Shield, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Scheme {
  id: string;
  title_en: string;
  title_hi?: string;
  title_mr?: string;
  category: string;
  state_central: string;
  eligibility_en: string;
  summary_en: string;
  summary_hi?: string;
  summary_mr?: string;
  benefit_amount: string;
  official_link: string;
  deadline_date: string;
}

export default function SchemeExplorer() {
  const [lang, setLang] = useState<'en' | 'hi' | 'mr'>('en');
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Agriculture & Farming',
    'Health & Wellness',
    'Housing & Shelter',
    'Women & Girl Child',
    'Business & Microfinance'
  ];

  useEffect(() => {
    fetchSchemes();
  }, [selectedCategory]);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const url = selectedCategory === 'All' ? '/api/schemes' : `/api/schemes?category=${encodeURIComponent(selectedCategory)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.schemes) {
        setSchemes(data.schemes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = (id: string) => {
    setSavedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredSchemes = schemes.filter(s =>
    s.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.summary_en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-kagaz flex flex-col font-body">
      <Header currentLang={lang} onLangChange={l => setLang(l)} />

      <main className="max-w-7xl w-full mx-auto px-4 py-8 flex-1">
        
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-display-latin text-3xl sm:text-4xl font-bold text-neel mb-2">
            {lang === 'hi' ? 'सरकारी योजनाएं निर्देशिका' : lang === 'mr' ? 'सरकारी योजना निर्देशिका' : 'Government Schemes Directory'}
          </h1>
          <p className="text-neel/70 font-medium">
            {lang === 'hi' ? 'अपनी पात्रता के अनुसार केंद्र एवं राज्य सरकार की योजनाएं खोजें।' : lang === 'mr' ? 'तुमच्या पात्रतेनुसार केंद्र आणि राज्य सरकारच्या योजना शोधा.' : 'Explore verified central and state schemes with direct application links.'}
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="bg-white border border-rekha p-4 rounded-2xl shadow-xs mb-8 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-neel/40 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search scheme by name (e.g. PM-Kisan, Ayushman, PMAY)..."
              className="w-full bg-kagaz/50 border border-rekha pl-12 pr-4 py-3 rounded-xl text-neel focus:outline-hidden focus:border-chakra font-medium"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-chakra text-white shadow-2xs'
                    : 'bg-kagaz text-neel border border-rekha hover:border-chakra'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Schemes Grid */}
        {loading ? (
          <div className="py-12 text-center text-neel font-bold animate-pulse">
            Loading schemes...
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-rekha p-8">
            <Shield className="w-12 h-12 text-rekha mx-auto mb-3" />
            <p className="text-lg font-bold text-neel">No schemes match your filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map(s => {
              const isSaved = savedIds.includes(s.id);
              return (
                <div
                  key={s.id}
                  className="bg-white border border-rekha rounded-2xl p-6 shadow-2xs flex flex-col justify-between hover:border-chakra/40 transition-all group"
                >
                  <div>
                    {/* Header: Category & Save */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-chakra/10 text-chakra font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                        {s.category}
                      </span>
                      <button
                        onClick={() => toggleSave(s.id)}
                        className={`touch-target p-2 rounded-full border transition-all ${
                          isSaved ? 'border-haldi bg-haldi text-white' : 'border-rekha text-neel hover:border-haldi'
                        }`}
                        title="Save Scheme"
                      >
                        <Bookmark className="w-5 h-5 fill-current" />
                      </button>
                    </div>

                    {/* Scheme Title */}
                    <h2 className="font-body text-xl font-bold text-neel group-hover:text-chakra transition-colors mb-2">
                      {lang === 'hi' ? s.title_hi || s.title_en : lang === 'mr' ? s.title_mr || s.title_en : s.title_en}
                    </h2>

                    {/* Grounded Seal */}
                    <SealTrustMark schemeName={s.title_en} language={lang} />

                    {/* Benefit Badge */}
                    <div className="bg-tulsi/10 border border-tulsi/30 text-tulsi font-bold text-sm px-3 py-1.5 rounded-lg my-3 w-fit flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-tulsi" />
                      <span>{s.benefit_amount}</span>
                    </div>

                    {/* Summary */}
                    <p className="text-neel/80 text-sm line-clamp-3 mb-4 font-normal">
                      {lang === 'hi' ? s.summary_hi || s.summary_en : lang === 'mr' ? s.summary_mr || s.summary_en : s.summary_en}
                    </p>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-4 border-t border-rekha flex items-center justify-between gap-2">
                    <a
                      href={s.official_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-chakra font-bold text-xs uppercase tracking-wider flex items-center gap-1 hover:underline"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <Link
                      href={`/scheme/${s.id}`}
                      className="bg-chakra text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-chakra/90 shadow-2xs"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
