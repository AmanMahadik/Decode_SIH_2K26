import { NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initDatabase();

    // 1. Total queries count
    const totalRes = await query('SELECT COUNT(*) FROM chat_logs');
    const totalQueries = parseInt(totalRes.rows[0].count, 10);

    // 2. Knowledge Gaps (Low confidence queries)
    const gapRes = await query('SELECT user_query, language, created_at FROM chat_logs WHERE is_knowledge_gap = TRUE ORDER BY created_at DESC LIMIT 10');

    // 3. Most asked schemes / topics
    const topSchemesRes = await query(`
      SELECT source_scheme, COUNT(*) as count 
      FROM chat_logs 
      WHERE source_scheme IS NOT NULL 
      GROUP BY source_scheme 
      ORDER BY count DESC 
      LIMIT 5
    `);

    // 4. Language Breakdown
    const langRes = await query(`
      SELECT language, COUNT(*) as count 
      FROM chat_logs 
      GROUP BY language
    `);

    // 5. User Feedback Rating breakdown
    const feedbackRes = await query(`
      SELECT 
        SUM(CASE WHEN feedback_rating = 1 THEN 1 ELSE 0 END) as positive,
        SUM(CASE WHEN feedback_rating = -1 THEN 1 ELSE 0 END) as negative
      FROM chat_logs
    `);

    return NextResponse.json({
      metrics: {
        totalQueries,
        knowledgeGapsCount: gapRes.rows.length,
        positiveRatings: parseInt(feedbackRes.rows[0]?.positive || 0, 10),
        negativeRatings: parseInt(feedbackRes.rows[0]?.negative || 0, 10)
      },
      topSchemes: topSchemesRes.rows,
      knowledgeGaps: gapRes.rows,
      languageBreakdown: langRes.rows
    });
  } catch (err) {
    console.error('API /api/analytics error:', err);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
