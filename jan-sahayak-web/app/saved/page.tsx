'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import SealTrustMark from '@/components/SealTrustMark';
import { Bookmark, Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function SavedSchemes() {
  const [lang, setLang] = useState<'en' | 'hi' | 'mr'>('en');

  // Sample Saved Schemes
  const savedSchemes = [
    {
      id: 'pm-kisan',
      title_en: 'PM-Kisan Samman Nidhi Yojana',
      category: 'Agriculture & Farming',
      benefit_amount: '₹6,000 / year',
      official_link: 'https://pmkisan.gov.in',
      deadline_days: 10 // Within 14 days -> Sindoor Red alert badge!
    },
    {
      id: 'ayushman-bharat',
      title_en: 'Ayushman Bharat - PM Jan Arogya Yojana (PM-JAY)',
      category: 'Health & Wellness',
      benefit_amount: '₹5,00,000 Cover',
      official_link: 'https://pmjay.gov.in',
      deadline_days: 45 // Neutral badge
    }
  ];

  return (
    <div className="min-h-screen bg-kagaz flex flex-col font-body">
      <Header currentLang={lang} onLangChange={l => setLang(l)} />

      <main className="max-w-5xl w-full mx-auto px-4 py-8 flex-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-haldi text-white flex items-center justify-center shadow-xs">
            <Bookmark className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="font-display-latin text-3xl font-bold text-neel">
              {lang === 'hi' ? 'सहेजे गए आवेदन एवं योजनाएं' : lang === 'mr' ? 'जतन केलेल्या योजना' : 'Saved Schemes & Bookmarks'}
            </h1>
            <p className="text-neel/70 text-sm font-medium">
              Keep track of your saved government schemes and deadline alerts.
            </p>
          </div>
        </div>

        {savedSchemes.length === 0 ? (
          <div className="bg-white border border-rekha rounded-2xl p-8 text-center">
            <p className="text-neel font-bold text-lg mb-2">No saved schemes yet</p>
            <Link href="/explorer" className="text-chakra font-bold underline">
              Browse Scheme Directory
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {savedSchemes.map(s => {
              const isUrgent = s.deadline_days <= 14;
              return (
                <div
                  key={s.id}
                  className="bg-white border border-rekha rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-chakra/10 text-chakra font-bold text-xs px-2.5 py-0.5 rounded-full">
                        {s.category}
                      </span>

                      {/* Deadline Sindoor Red Badge if within 14 days */}
                      {isUrgent ? (
                        <span className="bg-sindoor/10 text-sindoor border border-sindoor/30 font-bold text-xs px-3 py-0.5 rounded-full flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Deadline in {s.deadline_days} days!</span>
                        </span>
                      ) : (
                        <span className="bg-rekha/40 text-neel font-medium text-xs px-3 py-0.5 rounded-full flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Deadline in {s.deadline_days} days</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-body text-xl font-bold text-neel">{s.title_en}</h3>
                    <SealTrustMark schemeName={s.title_en} language={lang} />
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={s.official_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-rekha text-neel font-bold px-4 py-2 rounded-xl text-sm hover:border-chakra flex items-center gap-1"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <Link
                      href={`/scheme/${s.id}`}
                      className="bg-chakra text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-chakra/90 shadow-2xs flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-4 h-4" />
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
