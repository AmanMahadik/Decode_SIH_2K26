import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query('SELECT * FROM schemes ORDER BY created_at DESC;');
    
    if (res.rows && res.rows.length > 0) {
      return NextResponse.json({ schemes: res.rows });
    }
  } catch (err: any) {
    console.warn('Azure DB query warning (using fallback catalog):', err);
  }

  // Pre-seeded verified schemes fallback catalog
  const fallbackSchemes = [
    {
      id: 'sukanya-samriddhi',
      title_en: 'Sukanya Samriddhi Yojana (SSY)',
      title_hi: 'सुकन्या समृद्धि योजना',
      title_mr: 'सुकन्या समृद्धी योजना',
      category: 'Girl Child & Education',
      eligibility_en: 'Parents or legal guardians of a girl child below 10 years of age. Maximum 2 accounts per family.',
      summary_en: 'High-interest tax-free government savings scheme for the education and marriage expenses of girl children with 8.2% annual compound interest.',
      official_link: 'https://indiapost.gov.in',
      benefit_amount: '8.2% Interest + Tax Savings'
    },
    {
      id: 'pm-kisan',
      title_en: 'PM-Kisan Samman Nidhi Yojana',
      title_hi: 'पीएम-किसान सम्मान निधि योजना',
      title_mr: 'पीएम-किसान सन्मान निधी योजना',
      category: 'Agriculture & Farming',
      eligibility_en: 'Small and marginal farmers holding cultivable land up to 2 hectares in their name.',
      summary_en: 'Provides ₹6,000 per year in three equal installments of ₹2,000 directly into the bank accounts of eligible farmer families.',
      official_link: 'https://pmkisan.gov.in',
      benefit_amount: '₹6,000 / year'
    },
    {
      id: 'ayushman-bharat',
      title_en: 'Ayushman Bharat - PM Jan Arogya Yojana (PM-JAY)',
      title_hi: 'आयुष्मान भारत - पीएम जन आरोग्य योजना',
      title_mr: 'आयुष्मान भारत - पीएम जन आरोग्य योजना',
      category: 'Health & Wellness',
      eligibility_en: 'Families listed in SECC 2011 database, kutcha house dwellers, SC/ST, informal workers.',
      summary_en: 'Offers cashless health coverage of up to ₹5 Lakh per family per year for hospitalization.',
      official_link: 'https://pmjay.gov.in',
      benefit_amount: '₹5,00,000 Cover'
    },
    {
      id: 'pmay-urban',
      title_en: 'Pradhan Mantri Awas Yojana (PMAY)',
      title_hi: 'प्रधानमंत्री आवास योजना (PMAY)',
      title_mr: 'प्रधानमंत्री आवास योजना (PMAY)',
      category: 'Housing & Shelter',
      eligibility_en: 'Families with annual income up to ₹6 Lakh without a pucca house in India.',
      summary_en: 'Provides financial assistance and interest subsidy up to ₹2.67 Lakh for building or buying a home.',
      official_link: 'https://pmaymis.gov.in',
      benefit_amount: 'Up to ₹2,67,000 Subsidy'
    },
    {
      id: 'pm-mudra',
      title_en: 'Pradhan Mantri MUDRA Yojana (PMMY)',
      title_hi: 'प्रधानमंत्री मुद्रा योजना',
      title_mr: 'प्रधानमंत्री मुद्रा योजना',
      category: 'Business & Microfinance',
      eligibility_en: 'Small business owners, shopkeepers, artisans, and micro-enterprises needing loans.',
      summary_en: 'Offers collateral-free business loans up to ₹10 Lakh in Shishu, Kishor, and Tarun categories.',
      official_link: 'https://mudra.org.in',
      benefit_amount: 'Up to ₹10,00,000 Loan'
    }
  ];

  return NextResponse.json({ schemes: fallbackSchemes });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, title_en, title_hi, title_mr, category, eligibility_en, summary_en, official_link, benefit_amount } = body;

    if (!title_en || !official_link || !eligibility_en) {
      return NextResponse.json({ error: 'Title, official link, and eligibility criteria are required' }, { status: 400 });
    }

    const schemeId = id || title_en.toLowerCase().replace(/[^a-z0-9]/g, '-');

    await query(
      `INSERT INTO schemes (id, title_en, title_hi, title_mr, category, eligibility_en, summary_en, official_link, benefit_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         title_en = EXCLUDED.title_en,
         title_hi = EXCLUDED.title_hi,
         title_mr = EXCLUDED.title_mr,
         category = EXCLUDED.category,
         eligibility_en = EXCLUDED.eligibility_en,
         summary_en = EXCLUDED.summary_en,
         official_link = EXCLUDED.official_link,
         benefit_amount = EXCLUDED.benefit_amount;`,
      [schemeId, title_en, title_hi || '', title_mr || '', category || 'General', eligibility_en, summary_en || '', official_link, benefit_amount || '']
    );

    return NextResponse.json({ success: true, schemeId, message: 'Yojana registered successfully in database' });
  } catch (err: any) {
    console.error('Scheme POST Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to register scheme in database' }, { status: 500 });
  }
}
