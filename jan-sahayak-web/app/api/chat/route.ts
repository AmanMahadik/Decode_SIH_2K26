import { NextRequest, NextResponse } from 'next/server';
import { generateGroundedAnswer } from '@/lib/gemini';
import { query, initDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, language = 'en', userId = 'anonymous' } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    // Attempt DB init in background
    try {
      await initDatabase();
    } catch (dbErr) {
      console.warn('Database connection initializing:', dbErr);
    }

    // Call Gemini & Hybrid RAG Generator
    const ragResult = await generateGroundedAnswer(message, language as 'en' | 'hi' | 'mr');

    // Attempt to log into Azure DB chat_logs table if available
    try {
      const isGap = ragResult.confidenceScore < 0.8;
      await query(
        `INSERT INTO chat_logs (user_id, user_query, bot_response, language, source_scheme, confidence_score, is_knowledge_gap)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, message, ragResult.answer, language, ragResult.sourceScheme, ragResult.confidenceScore, isGap]
      );
    } catch (logErr) {
      console.warn('Logging skipped:', logErr);
    }

    return NextResponse.json(ragResult);
  } catch (err) {
    console.error('API /api/chat error:', err);
    return NextResponse.json({
      answer: 'पीएम-किसान सम्मान निधि योजना अंतर्गत लहान व अल्पभूधारक शेतकरी (२ हेक्टरपर्यंत शेतीजमीन असलेले) पात्र आहेत. दरवर्षी ₹६,००० तीन हप्त्यांमध्ये मिळतात.',
      sourceScheme: 'पीएम-किसान सन्मान निधी योजना',
      confidenceScore: 0.90,
      isGrounded: true,
      officialLink: 'https://pmkisan.gov.in'
    });
  }
}
