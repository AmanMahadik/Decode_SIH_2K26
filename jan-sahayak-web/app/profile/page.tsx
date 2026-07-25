'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SealTrustMark from '@/components/SealTrustMark';
import { UserCheck, Shield, CheckCircle, AlertCircle, ArrowRight, Sparkles, Sliders, CheckSquare, Save } from 'lucide-react';
import Link from 'next/link';

interface CitizenProfile {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  annualIncome: string;
  landHolding: string;
  category: string;
  state: string;
  hasPuccaHouse: string;
}

export default function ProfileEligibilityForm() {
  const [lang, setLang] = useState<'en' | 'hi' | 'mr'>('en');
  const [profile, setProfile] = useState<CitizenProfile>({
    name: 'Aman Mahadik',
    age: '28',
    gender: 'Male',
    occupation: 'Farmer',
    annualIncome: '1.5_lakh',
    landHolding: 'less_2_ha',
    category: 'OBC',
    state: 'Maharashtra',
    hasPuccaHouse: 'no'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [eligibleSchemes, setEligibleSchemes] = useState<any[]>([]);

  useEffect(() => {
    evaluateEligibility();
  }, [profile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('jan_citizen_profile', JSON.stringify(profile));
    setSavedSuccess(true);
    evaluateEligibility();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const evaluateEligibility = () => {
    const incomeNum = profile.annualIncome === 'less_1_lakh' ? 90000 : profile.annualIncome === '1.5_lakh' ? 150000 : profile.annualIncome === '3_lakh' ? 300000 : 700000;
    const isFarmer = profile.occupation === 'Farmer';
    const hasSmallLand = profile.landHolding === 'less_2_ha';
    const noHouse = profile.hasPuccaHouse === 'no';

    const matches = [];

    // PM-Kisan check
    if (isFarmer && hasSmallLand && incomeNum <= 600000) {
      matches.push({
        id: 'pm-kisan',
        title: 'PM-Kisan Samman Nidhi Yojana',
        benefit: '₹6,000 / year',
        reason: 'Matched: You are a farmer holding less than 2 hectares land.',
        matchPercentage: 100
      });
    }

    // Ayushman Bharat check
    if (incomeNum <= 300000 || profile.category === 'SC' || profile.category === 'ST') {
      matches.push({
        id: 'ayushman-bharat',
        title: 'Ayushman Bharat (PM-JAY)',
        benefit: '₹5,00,000 Health Cover',
        reason: 'Matched: Annual income is within SECC economic limits.',
        matchPercentage: 100
      });
    }

    // PMAY check
    if (noHouse && incomeNum <= 600000) {
      matches.push({
        id: 'pmay-urban',
        title: 'Pradhan Mantri Awas Yojana (PMAY)',
        benefit: 'Up to ₹2,67,000 Subsidy',
        reason: 'Matched: You do not own a pucca house and income is below ₹6 Lakh.',
        matchPercentage: 100
      });
    }

    // MUDRA check
    if (profile.occupation === 'Shopkeeper' || profile.occupation === 'Micro-business') {
      matches.push({
        id: 'pm-mudra',
        title: 'Pradhan Mantri MUDRA Yojana (PMMY)',
        benefit: 'Up to ₹10,00,000 Loan',
        reason: 'Matched: Micro-enterprise entrepreneur collateral-free loan.',
        matchPercentage: 100
      });
    }

    setEligibleSchemes(matches);
  };

  return (
    <div className="min-h-screen bg-kagaz flex flex-col font-body">
      <Header currentLang={lang} onLangChange={l => setLang(l)} />

      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-1">
        
        {/* Title */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-6 h-6 text-chakra" />
              <span className="text-xs font-bold uppercase tracking-wider text-chakra bg-chakra/10 px-3 py-1 rounded-full">
                Citizen Eligibility Qualifier
              </span>
            </div>
            <h1 className="font-display-latin text-3xl sm:text-4xl font-bold text-neel">
              {lang === 'hi' ? 'नागरिक प्रोफाइल एवं पात्रता फ़ॉर्म' : lang === 'mr' ? 'नागरिक प्रोफाइल आणि पात्रता फॉर्म' : 'Citizen Profile & Scheme Eligibility Qualifier'}
            </h1>
            <p className="text-neel/70 font-medium text-base">
              Fill out your details once to instantly discover 100% verified government schemes tailored for you.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Form: Profile Creation */}
          <div className="lg:col-span-7 bg-white border border-rekha p-6 sm:p-8 rounded-3xl shadow-2xs space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-rekha">
              <h2 className="font-body text-xl font-bold text-neel flex items-center gap-2">
                <Sliders className="w-5 h-5 text-chakra" />
                <span>Personal Eligibility Questionnaire</span>
              </h2>
              <span className="text-xs text-neel/60 font-semibold">100% Confidential</span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neel/80 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="w-full border border-rekha rounded-xl p-3 text-neel focus:border-chakra focus:outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neel/80 mb-1">
                    State of Residence
                  </label>
                  <select
                    value={profile.state}
                    onChange={e => setProfile({ ...profile, state: e.target.value })}
                    className="w-full border border-rekha rounded-xl p-3 text-neel focus:border-chakra focus:outline-hidden font-medium bg-white"
                  >
                    <option>Maharashtra</option>
                    <option>Uttar Pradesh</option>
                    <option>Bihar</option>
                    <option>Madhya Pradesh</option>
                    <option>Gujarat</option>
                    <option>Rajasthan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neel/80 mb-1">
                    Occupation / Profession
                  </label>
                  <select
                    value={profile.occupation}
                    onChange={e => setProfile({ ...profile, occupation: e.target.value })}
                    className="w-full border border-rekha rounded-xl p-3 text-neel focus:border-chakra focus:outline-hidden font-medium bg-white"
                  >
                    <option value="Farmer">Farmer (किसान / शेतकरी)</option>
                    <option value="Micro-business">Micro-business / Shopkeeper</option>
                    <option value="Student">Student (छात्र / विद्यार्थी)</option>
                    <option value="Unemployed">Unemployed / Worker</option>
                    <option value="Salaried">Salaried Employee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neel/80 mb-1">
                    Annual Household Income
                  </label>
                  <select
                    value={profile.annualIncome}
                    onChange={e => setProfile({ ...profile, annualIncome: e.target.value })}
                    className="w-full border border-rekha rounded-xl p-3 text-neel focus:border-chakra focus:outline-hidden font-medium bg-white"
                  >
                    <option value="less_1_lakh">Below ₹1 Lakh / Year</option>
                    <option value="1.5_lakh">₹1 Lakh - ₹2.5 Lakhs</option>
                    <option value="3_lakh">₹2.5 Lakhs - ₹6 Lakhs (EWS/LIG)</option>
                    <option value="above_6_lakh">Above ₹6 Lakhs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neel/80 mb-1">
                    Agricultural Land Holding
                  </label>
                  <select
                    value={profile.landHolding}
                    onChange={e => setProfile({ ...profile, landHolding: e.target.value })}
                    className="w-full border border-rekha rounded-xl p-3 text-neel focus:border-chakra focus:outline-hidden font-medium bg-white"
                  >
                    <option value="less_2_ha">Up to 2 Hectares (Small/Marginal)</option>
                    <option value="more_2_ha">More than 2 Hectares</option>
                    <option value="no_land">No Agricultural Land</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neel/80 mb-1">
                    Own Pucca House in India?
                  </label>
                  <select
                    value={profile.hasPuccaHouse}
                    onChange={e => setProfile({ ...profile, hasPuccaHouse: e.target.value })}
                    className="w-full border border-rekha rounded-xl p-3 text-neel focus:border-chakra focus:outline-hidden font-medium bg-white"
                  >
                    <option value="no">No (Kutcha house / Rented)</option>
                    <option value="yes">Yes (Already owns a pucca home)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="bg-chakra text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-chakra/90 shadow-xs w-full flex items-center justify-center gap-2 text-base"
              >
                <Save className="w-5 h-5" />
                <span>Save Profile & Evaluate Eligibility</span>
              </button>

              {savedSuccess && (
                <div className="bg-tulsi/10 border border-tulsi/40 text-tulsi font-bold p-3 rounded-xl text-center text-sm flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Profile Saved Successfully! Matching Schemes Updated Below.</span>
                </div>
              )}
            </form>

          </div>

          {/* Right Column: Instant Matched Schemes Results */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-chakra text-white p-6 rounded-3xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-white/20 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  Automated Reasoner
                </span>
                <Sparkles className="w-5 h-5 text-haldi" />
              </div>
              <h2 className="font-display-latin text-2xl font-bold">
                {eligibleSchemes.length} Schemes Matched 100%
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Based on your saved profile ({profile.occupation}, {profile.state}).
              </p>
            </div>

            {/* Matched Schemes Cards List */}
            <div className="space-y-4">
              {eligibleSchemes.map(scheme => (
                <div
                  key={scheme.id}
                  className="bg-white border-2 border-tulsi/40 p-5 rounded-2xl shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-tulsi/10 text-tulsi font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>100% ELIGIBLE</span>
                    </span>
                    <span className="font-mono-data text-xs font-bold text-neel/60">
                      Benefit: {scheme.benefit}
                    </span>
                  </div>

                  <h3 className="font-body text-lg font-bold text-neel">
                    {scheme.title}
                  </h3>

                  <SealTrustMark schemeName={scheme.title} language={lang} />

                  <p className="text-xs text-neel/80 font-medium bg-kagaz p-2.5 rounded-xl border border-rekha">
                    💡 {scheme.reason}
                  </p>

                  <Link
                    href={`/scheme/${scheme.id}`}
                    className="inline-flex items-center gap-1.5 text-chakra font-bold text-sm hover:underline"
                  >
                    <span>View Eligibility Details & Apply</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
