'use client';

import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

interface SealTrustMarkProps {
  schemeName: string;
  isHighConfidence?: boolean;
  officialLink?: string;
  language?: 'en' | 'hi' | 'mr';
}

export default function SealTrustMark({
  schemeName,
  isHighConfidence = true,
  officialLink,
  language = 'en'
}: SealTrustMarkProps) {
  const getGroundedLabel = () => {
    if (language === 'hi') return 'आधिकारिक दस्तावेज़ द्वारा सत्यापित:';
    if (language === 'mr') return 'अधिकृत कागदपत्राद्वारे सत्यापित:';
    return 'Grounded in:';
  };

  const getUncertainLabel = () => {
    if (language === 'hi') return 'संदेह है — आधिकारिक पोर्टल पर जांचें';
    if (language === 'mr') return 'खात्री नाही — अधिकृत पोर्टलवर तपासा';
    return 'Not certain — verify at official portal';
  };

  if (!isHighConfidence) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed border-sindoor text-sindoor bg-sindoor/5 text-sm font-medium my-2">
        <AlertCircle className="w-4 h-4 text-sindoor shrink-0" />
        <span>{getUncertainLabel()}</span>
        {officialLink && (
          <a
            href={officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-bold hover:opacity-80"
          >
            [Portal]
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-chakra/30 bg-chakra/5 text-neel text-sm font-medium my-2 shadow-xs">
      {/* Stamp Icon */}
      <div className="w-5 h-5 rounded-full border-2 border-chakra flex items-center justify-center bg-white shadow-2xs shrink-0">
        <ShieldCheck className="w-3.5 h-3.5 text-chakra" />
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-chakra font-semibold text-xs uppercase tracking-wider">
          {getGroundedLabel()}
        </span>
        <span className="font-bold text-neel">{schemeName}</span>
      </div>
    </div>
  );
}
