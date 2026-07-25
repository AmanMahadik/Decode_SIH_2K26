import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'JAN-SAHAYAK — AI Digital Citizen Assistant',
  description: 'Multilingual conversational access to Indian government schemes (PM-Kisan, Ayushman Bharat, PMAY) powered by grounded RAG AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en">
        <head>
          {/* Google Fonts: Fraunces, Tiro Devanagari Hindi, Hind, IBM Plex Mono */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Hind:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;600;700&family=Tiro+Devanagari+Hindi&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="bg-kagaz text-neel font-body antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
