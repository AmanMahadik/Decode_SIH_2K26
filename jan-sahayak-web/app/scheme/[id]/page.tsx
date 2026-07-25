'use client';

import React, { useState, useEffect, use } from 'react';
import Header from '@/components/Header';
import SealTrustMark from '@/components/SealTrustMark';
import { CheckCircle, ExternalLink, ArrowLeft, Calendar, FileText, CheckSquare, ListOrdered, Shield } from 'lucide-react';
import Link from 'next/link';

interface SchemeDetailProps {
  params: Promise<{ id: string }>;
}

export default function SchemeDetail({ params }: SchemeDetailProps) {
  const resolvedParams = use(params);
  const [lang, setLang] = useState<'en' | 'hi' | 'mr'>('en');
  const [scheme, setScheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchemeDetail();
  }, [resolvedParams.id]);

  const fetchSchemeDetail = async () => {
    try {
      const res = await fetch(`/api/schemes?id=${resolvedParams.id}`);
      const data = await res.json();
      if (data.scheme) {
        setScheme(data.scheme);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-kagaz flex flex-col font-body">
        <Header currentLang={lang} onLangChange={l => setLang(l)} />
        <main className="max-w-4xl mx-auto py-12 text-center text-neel font-bold animate-pulse">
          Loading scheme details...
        </main>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="min-h-screen bg-kagaz flex flex-col font-body">
        <Header currentLang={lang} onLangChange={l => setLang(l)} />
        <main className="max-w-4xl mx-auto py-12 text-center">
          <p className="text-xl font-bold text-neel mb-4">Scheme Not Found</p>
          <Link href="/explorer" className="bg-chakra text-white px-5 py-2.5 rounded-full font-bold">
            Back to Explorer
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kagaz flex flex-col font-body">
      <Header currentLang={lang} onLangChange={l => setLang(l)} />

      <main className="max-w-4xl w-full mx-auto px-4 py-8 flex-1">
        
        {/* Back Link */}
        <Link
          href="/explorer"
          className="inline-flex items-center gap-2 text-chakra font-bold text-sm mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? 'सभी योजनाओं पर वापस लौटें' : lang === 'mr' ? 'सर्व योजनांकडे परत जा' : 'Back to Scheme Directory'}</span>
        </Link>

        {/* Detail Card */}
        <div className="bg-white border border-rekha rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          
          {/* Header Seal & Category */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="bg-chakra/10 text-chakra font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              {scheme.category} • {scheme.state_central} Scheme
            </span>
            <div className="flex items-center gap-1 text-sindoor text-xs font-bold bg-sindoor/10 px-3 py-1 rounded-full border border-sindoor/20">
              <Calendar className="w-3.5 h-3.5" />
              <span>Deadline: {scheme.deadline_date || 'Ongoing'}</span>
            </div>
          </div>

          {/* Scheme Title */}
          <div>
            <h1 className="font-display-latin text-3xl sm:text-4xl font-bold text-neel mb-2">
              {lang === 'hi' ? scheme.title_hi || scheme.title_en : lang === 'mr' ? scheme.title_mr || scheme.title_en : scheme.title_en}
            </h1>

            {/* Signature Seal Trust-Mark */}
            <SealTrustMark schemeName={scheme.title_en} language={lang} />
          </div>

          {/* Financial Benefit Callout */}
          <div className="bg-tulsi/10 border border-tulsi/30 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-tulsi">Financial Benefit / Amount</p>
              <p className="text-2xl font-bold text-neel">{scheme.benefit_amount}</p>
            </div>
            <a
              href={scheme.official_link}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-chakra text-chakra font-bold px-5 py-2.5 rounded-full hover:bg-chakra hover:text-white transition-all shadow-2xs flex items-center gap-2"
            >
              <span>{lang === 'hi' ? 'आधिकारिक पोर्टल लिंक' : lang === 'mr' ? 'अधिकृत पोर्टल लिंक' : 'Official Portal Link'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Section 1: Plain Language Summary */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-neel font-bold text-lg">
              <FileText className="w-5 h-5 text-chakra" />
              <h2>{lang === 'hi' ? 'योजना का विवरण' : lang === 'mr' ? 'योजनेचा तपशील' : 'Scheme Summary'}</h2>
            </div>
            <p className="text-neel/85 leading-relaxed text-base">
              {lang === 'hi' ? scheme.summary_hi || scheme.summary_en : lang === 'mr' ? scheme.summary_mr || scheme.summary_en : scheme.summary_en}
            </p>
          </div>

          {/* Section 2: Eligibility Checklist */}
          <div className="space-y-3 pt-4 border-t border-rekha">
            <div className="flex items-center gap-2 text-neel font-bold text-lg">
              <CheckSquare className="w-5 h-5 text-tulsi" />
              <h2>{lang === 'hi' ? 'पात्रता मापदंड' : lang === 'mr' ? 'पात्रता निकष' : 'Eligibility Criteria Checklist'}</h2>
            </div>
            <div className="bg-kagaz border border-rekha rounded-2xl p-5 space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-tulsi shrink-0 mt-0.5" />
                <p className="text-neel font-medium text-base">
                  {lang === 'hi' ? scheme.eligibility_hi || scheme.eligibility_en : lang === 'mr' ? scheme.eligibility_mr || scheme.eligibility_en : scheme.eligibility_en}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Numbered How to Apply Steps */}
          <div className="space-y-4 pt-4 border-t border-rekha">
            <div className="flex items-center gap-2 text-neel font-bold text-lg">
              <ListOrdered className="w-5 h-5 text-haldi" />
              <h2>{lang === 'hi' ? 'आवेदन करने के चरण' : lang === 'mr' ? 'अर्ज करण्याचे टप्पे' : 'How to Apply (Step-by-Step)'}</h2>
            </div>

            <ol className="space-y-3">
              <li className="flex items-start gap-3 bg-white border border-rekha p-4 rounded-xl">
                <span className="w-7 h-7 rounded-full bg-chakra text-white font-bold flex items-center justify-center text-sm shrink-0">1</span>
                <div>
                  <p className="font-bold text-neel">Visit the Official Portal</p>
                  <p className="text-neel/70 text-sm">Navigate to {scheme.official_link} and click on New Registration.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-white border border-rekha p-4 rounded-xl">
                <span className="w-7 h-7 rounded-full bg-chakra text-white font-bold flex items-center justify-center text-sm shrink-0">2</span>
                <div>
                  <p className="font-bold text-neel">Submit Aadhaar & Land/Bank Details</p>
                  <p className="text-neel/70 text-sm">Fill in your identity details, bank account number, and land records (for farming schemes).</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-white border border-rekha p-4 rounded-xl">
                <span className="w-7 h-7 rounded-full bg-chakra text-white font-bold flex items-center justify-center text-sm shrink-0">3</span>
                <div>
                  <p className="font-bold text-neel">Verify & Receive Application Reference Number</p>
                  <p className="text-neel/70 text-sm">Save your registration acknowledgment number for installment tracking.</p>
                </div>
              </li>
            </ol>
          </div>

        </div>
      </main>
    </div>
  );
}
