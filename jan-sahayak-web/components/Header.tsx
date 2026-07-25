'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, MessageSquare, Compass, Bookmark, Mic, LayoutDashboard, FileText } from 'lucide-react';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';

interface HeaderProps {
  currentLang?: 'en' | 'hi' | 'mr';
  onLangChange?: (lang: 'en' | 'hi' | 'mr') => void;
  onTextSizeToggle?: () => void;
  textSizeLevel?: number;
}

export default function Header({
  currentLang = 'en',
  onLangChange,
  onTextSizeToggle,
  textSizeLevel = 18,
}: HeaderProps) {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

  const userEmail = user?.primaryEmailAddress?.emailAddress || '';
  const isAdmin = userEmail.toLowerCase() === 'amanmahadik8@gmail.com';

  const navItems = [
    { label: currentLang === 'hi' ? 'चैट' : currentLang === 'mr' ? 'चॅट' : 'Chat', href: '/', icon: MessageSquare },
    { label: currentLang === 'hi' ? 'पात्रता फॉर्म' : currentLang === 'mr' ? 'पात्रता फॉर्म' : 'Eligibility Form', href: '/profile', icon: FileText },
    { label: currentLang === 'hi' ? 'योजनाएं' : currentLang === 'mr' ? 'योजना' : 'Schemes', href: '/explorer', icon: Compass },
    { label: currentLang === 'hi' ? 'सेव्ड' : currentLang === 'mr' ? 'जतन केलेले' : 'Saved', href: '/saved', icon: Bookmark },
    { label: currentLang === 'hi' ? 'वॉइस मोड़' : currentLang === 'mr' ? 'व्हॉइस मोड' : 'Voice', href: '/voice', icon: Mic },
  ];

  if (isAdmin) {
    navItems.push({
      label: currentLang === 'hi' ? 'एडमिन' : currentLang === 'mr' ? 'एडमिन' : 'Admin',
      href: '/admin',
      icon: LayoutDashboard,
    });
  }

  return (
    <header className="sticky top-0 z-50 bg-kagaz border-b border-rekha shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Seal Mark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-chakra flex items-center justify-center text-white shadow-xs group-hover:bg-neel transition-colors">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-2xl font-bold tracking-tight text-neel">
                JAN-SAHAYAK
              </span>
              <span className="bg-haldi/20 text-neel font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-haldi/40">
                GOVT AI
              </span>
            </div>
            <p className="text-xs text-neel/70 font-medium tracking-wide">
              Digital Citizen Assistant
            </p>
          </div>
        </Link>

        {/* Center Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-rekha shadow-2xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? 'bg-chakra text-white shadow-xs'
                    : 'text-neel hover:bg-kagaz hover:text-chakra'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neel/70'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Tools & Clerk Auth */}
        <div className="flex items-center gap-3">
          
          {/* Language Switcher */}
          {onLangChange && (
            <div className="flex bg-white rounded-xl p-1 border border-rekha shadow-2xs">
              {(['en', 'hi', 'mr'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => onLangChange(l)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    currentLang === l
                      ? 'bg-chakra text-white shadow-2xs'
                      : 'text-neel hover:bg-kagaz'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हिंदी' : 'मराठी'}
                </button>
              ))}
            </div>
          )}

          {/* Text Size Accessibility Toggle */}
          {onTextSizeToggle && (
            <button
              onClick={onTextSizeToggle}
              className="p-2.5 rounded-xl border border-rekha bg-white text-neel font-bold text-xs hover:bg-kagaz transition-colors flex items-center gap-1"
              title="Toggle Accessibility Text Size"
            >
              <span>T</span>
              <span className="text-[10px] text-chakra">
                {textSizeLevel > 18 ? 'A+' : 'A'}
              </span>
            </button>
          )}

          {/* Clerk Auth Integration */}
          <div className="pl-2 border-l border-rekha">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <button className="bg-chakra text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-neel transition-colors shadow-2xs">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
