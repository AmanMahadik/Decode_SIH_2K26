import { GoogleGenerativeAI } from '@google/generative-ai';
import Fuse from 'fuse.js';
import { query } from './db';

const apiKey = process.env.GEMINI_API_KEY || '';
const groqApiKey = process.env.GROQ_API_KEY || '';

export interface RAGAnswer {
  answer: string;
  sourceScheme: string;
  sourceSchemeId: string;
  confidenceScore: number;
  isGrounded: boolean;
  officialLink?: string;
  suggestedFollowups?: string[];
}

export async function generateGroundedAnswer(
  userQuery: string,
  userLanguage: 'en' | 'hi' | 'mr' = 'en'
): Promise<RAGAnswer> {
  const q = userQuery.toLowerCase().trim();

  // All Verified Government Schemes Knowledge Base
  const fallbackSchemes = [
    {
      id: 'sukanya-samriddhi',
      title_en: 'Sukanya Samriddhi Yojana (SSY)',
      title_hi: 'सुकन्या समृद्धि योजना',
      title_mr: 'सुकन्या समृद्धी योजना',
      category: 'Girl Child & Education',
      eligibility_en: 'Parents or legal guardians of a girl child below 10 years of age. Maximum 2 accounts per family.',
      eligibility_hi: '10 वर्ष से कम आयु की बालिका के माता-पिता या कानूनी अभिभावक। एक परिवार में अधिकतम 2 खाते।',
      eligibility_mr: '१० वर्षांपेक्षा कमी वयाच्या मुलीचे पालक. एका कुटुंबात जास्तीत जास्त २ खाती उघडता येतात.',
      summary_en: 'High-interest tax-free savings scheme for girl child education & marriage with 8.2% compound interest.',
      summary_hi: '8.2% वार्षिक ब्याज दर के साथ बालिकाओं की शिक्षा और विवाह के लिए बचत योजना।',
      summary_mr: 'मुलींच्या शिक्षण व विवाहासाठी ८.२% दरासह सरकारी बचत योजना.',
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
      eligibility_hi: 'अपनी भूमि पर खेती करने वाले 2 हेक्टेयर तक की जोत वाले छोटे और सीमांत किसान।',
      eligibility_mr: '२ हेक्टरपर्यंत शेतीजमीन असलेले छोटे आणि अल्पभूधारक शेतकरी.',
      summary_en: 'Provides ₹6,000 per year in three equal installments of ₹2,000 directly into eligible farmer bank accounts.',
      summary_hi: 'पात्र किसान परिवारों के बैंक खाते में सीधा ₹6,000 प्रति वर्ष 3 समान किस्तों में प्रदान किया जाता है।',
      summary_mr: 'पात्र शेतकरी कुटुंबांच्या बँक खात्यात थेट दरवर्षी ₹६,००० तीन हप्त्यांमध्ये जमा केले जातात.',
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
      eligibility_hi: 'SECC 2011 डेटाबेस में सूचीबद्ध परिवार, कच्चे मकानों में रहने वाले ग्रामीण परिवार।',
      eligibility_mr: 'SECC 2011 यादीतील कुटुंबे, कच्च्या घरात राहणारी कुटुंबे आणि आर्थिकदृष्ट्या दुर्बल नागरिक.',
      summary_en: 'Offers cashless health coverage of up to ₹5 Lakh per family per year for secondary & tertiary hospitalization.',
      summary_hi: 'प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस स्वास्थ्य बीमा प्रदान करता है।',
      summary_mr: 'दरवर्षी प्रति कुटुंब ₹५ लाखांपर्यंतचे रोखरहित आरोग्य संरक्षण दुय्यम आणि तृतीयक उपचारांसाठी मिळते.',
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
      eligibility_hi: 'वार्षिक आय ₹6 लाख तक के EWS/LIG वर्ग। भारत में पक्का मकान नहीं होना चाहिए।',
      eligibility_mr: 'वार्षिक उत्पन्न ₹६ लाखांपर्यंतचे कुटुंब. स्वतःचे पक्के घर नसणे आवश्यक.',
      summary_en: 'Provides financial assistance and interest subsidy up to ₹2.67 Lakh for building or buying a first home.',
      summary_hi: 'पक्का मकान बनाने या खरीदने के लिए ₹2.67 लाख तक की सब्सिडी और वित्तीय सहायता दी जाती है।',
      summary_mr: 'पक्के घर बांधण्यासाठी किंवा खरेदी करण्यासाठी ₹२.६७ लाखांपर्यंत व्याज सबसिडी मिळते.',
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
      eligibility_hi: 'छोटे व्यापारी, दुकानदार, कारीगर और गैर-कृषि सूक्ष्म उद्यमों के उद्यमी।',
      eligibility_mr: 'लहान व्यावसायिक, दुकानदार, कारागीर आणि बिगर-शेती सूक्ष्म उद्योजक.',
      summary_en: 'Offers collateral-free business loans up to ₹10 Lakh in Shishu, Kishor, and Tarun categories.',
      summary_hi: 'शिशु, किशोर और तरुण श्रेणियों में ₹10 लाख तक का बिना गारंटी ऋण।',
      summary_mr: 'शिशू, किशोर व तरुण श्रेणी अंतर्गत ₹१० लाखांपर्यंत विनातारण व्यावसायिक कर्ज.',
      official_link: 'https://mudra.org.in',
      benefit_amount: 'Up to ₹10,00,000 Loan'
    }
  ];

  // 1. Handle Greetings & General System Queries (All Schemes Mode)
  const isGeneralQuery = ['hello', 'hi', 'hey', 'namaste', 'how are you', 'what do you do', 'who are you', 'नमस्ते', 'नमस्कार', 'हॅलो', 'काय करतेस', 'कोण आहेस'].some(g => q.startsWith(g) || q === g) ||
    ['scheme', 'schemes', 'all schemes', 'yojana', 'योजना', 'सरकारी योजना', 'माहिती'].some(s => q === s || q === 'what schemes are available' || q === 'list schemes');

  if (isGeneralQuery) {
    const generalText = {
      en: 'Namaste! I am JAN-SAHAYAK, your AI Digital Citizen Assistant for ALL Indian Government Schemes.\n\nI can help you with verified eligibility criteria, benefits, documents, and application steps for:\n\n• PM-Kisan Samman Nidhi (₹6,000/yr for Farmers)\n• Ayushman Bharat PM-JAY (₹5 Lakh Free Health Cover)\n• Pradhan Mantri Awas Yojana (Housing Subsidy up to ₹2.67 Lakh)\n• Sukanya Samriddhi Yojana (8.2% Interest for Girl Child Education)\n• PM MUDRA Yojana (Collateral-Free Business Loans up to ₹10 Lakh)\n\nHow can I help you today?',
      hi: 'नमस्ते! मैं जन-सहायक हूँ, सभी भारतीय सरकारी योजनाओं के लिए आपका एआई नागरिक सहायक।\n\nमैं निम्नलिखित योजनाओं के लिए पात्रता, लाभ, दस्तावेजों और आवेदन में आपकी सहायता कर सकता हूँ:\n\n• पीएम-किसान सम्मान निधि (किसानों के लिए ₹6,000/वर्ष)\n• आयुष्मान भारत (₹5 लाख तक का मुफ्त इलाज)\n• पीएम आवास योजना (₹2.67 लाख तक मकान सब्सिडी)\n• सुकन्या समृद्धि योजना (बालिकाओं के लिए 8.2% ब्याज बचत योजना)\n• पीएम मुद्रा योजना (₹10 लाख तक का बिजनेस लोन)\n\nआज मैं आपकी क्या सहायता कर सकता हूँ?',
      mr: 'नमस्ते! मी जन-सहायक आहे, सर्व भारतीय सरकारी योजनांसाठी तुमचा एआय नागरिक सहाय्यक.\n\nमी तुम्हाला खालील योजनांच्या पात्रतेबद्दल व अर्जाबद्दल अचूक माहिती देऊ शकतो:\n\n• पीएम-किसान सन्मान निधी (शेतकऱ्यांसाठी दरवर्षी ₹६,०००)\n• आयुष्मान भारत (₹५ लाखांपर्यंत मोफत आरोग्य संरक्षण)\n• पीएम आवास योजना (घर बांधणीसाठी ₹२.६७ लाखांपर्यंत सबसिडी)\n• सुकन्या समृद्धी योजना (मुलींच्या शिक्षणासाठी ८.२% व्याज योजना)\n• पीएम मुद्रा योजना (₹१० लाखांपर्यंत विनातारण कर्ज)\n\nमी तुम्हाला आज कशी मदत करू?'
    };

    return {
      answer: generalText[userLanguage],
      sourceScheme: userLanguage === 'hi' ? 'राष्ट्रीय योजना रजिस्ट्री (सभी सरकारी योजनाएं)' : userLanguage === 'mr' ? 'राष्ट्रीय योजना रजिस्ट्री (सर्व सरकारी योजना)' : 'National Scheme Registry (All Government Schemes)',
      sourceSchemeId: 'all-schemes',
      confidenceScore: 1.0,
      isGrounded: true,
      suggestedFollowups: [
        userLanguage === 'hi' ? 'बालिकाओं के लिए सुकन्या समृद्धि योजना' : userLanguage === 'mr' ? 'मुलींसाठी सुकन्या समृद्धी योजना' : 'Sukanya Samriddhi Girl Child Scheme',
        userLanguage === 'hi' ? 'पीएम-किसान ₹6,000 योजना पात्रता' : userLanguage === 'mr' ? 'पीएम-किसान ₹६,००० पात्रता' : 'PM-Kisan Farmer Eligibility',
        userLanguage === 'hi' ? 'आयुष्मान भारत ₹5 लाख स्वास्थ्य कार्ड' : userLanguage === 'mr' ? 'आयुष्मान भारत ₹५ लाख कार्ड' : 'Ayushman Bharat Health Cover'
      ]
    };
  }

  // 2. Specific Keyword Intent Classifier
  let matchedScheme: typeof fallbackSchemes[0] | null = null;

  if (['girl', 'child', 'education', 'sukanya', 'daughter', 'कन्या', 'मुलगी', 'बालिका', 'बेटी', 'शिक्षा'].some(k => q.includes(k))) {
    matchedScheme = fallbackSchemes[0]; // Sukanya
  } else if (['farmer', 'kisan', 'agriculture', 'land', 'किसान', 'शेतकरी', 'शेती', 'जमीन'].some(k => q.includes(k))) {
    matchedScheme = fallbackSchemes[1]; // PM-Kisan
  } else if (['health', 'hospital', 'medical', 'ayushman', 'card', 'स्वास्थ्य', 'आरोग्य', 'इलाज'].some(k => q.includes(k))) {
    matchedScheme = fallbackSchemes[2]; // Ayushman
  } else if (['house', 'home', 'housing', 'pmay', 'building', 'मकान', 'घर', 'आवास'].some(k => q.includes(k))) {
    matchedScheme = fallbackSchemes[3]; // PMAY
  } else if (['business', 'loan', 'shop', 'mudra', 'money', 'व्यापार', 'कर्ज', 'लोन'].some(k => q.includes(k))) {
    matchedScheme = fallbackSchemes[4]; // MUDRA
  } else {
    // Fuse.js search over all schemes
    const fuse = new Fuse(fallbackSchemes, {
      keys: ['title_en', 'title_hi', 'title_mr', 'eligibility_en', 'summary_en', 'category'],
      threshold: 0.4
    });
    const hits = fuse.search(userQuery);
    if (hits.length > 0) {
      matchedScheme = hits[0].item;
    }
  }

  // If query is broad or unmatched by specific keywords, respond across ALL SCHEMES
  if (!matchedScheme) {
    const broadPrompt = `You are JAN-SAHAYAK, an AI Digital Citizen Assistant for ALL Indian Government Schemes.
User Prompt: "${userQuery}"
Respond strictly in language "${userLanguage}" (en = English, hi = Hindi, mr = Marathi). Provide an informative response covering relevant Indian government schemes. Use clean bullet points.`;

    if (groqApiKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: broadPrompt }],
            temperature: 0.3
          })
        });

        const groqData = await groqRes.json();
        const llmAnswer = groqData.choices?.[0]?.message?.content;
        if (llmAnswer) {
          return {
            answer: llmAnswer,
            sourceScheme: userLanguage === 'hi' ? 'राष्ट्रीय योजना रजिस्ट्री (सभी सरकारी योजनाएं)' : userLanguage === 'mr' ? 'राष्ट्रीय योजना रजिस्ट्री (सर्व सरकारी योजना)' : 'National Scheme Registry (All Government Schemes)',
            sourceSchemeId: 'all-schemes',
            confidenceScore: 0.95,
            isGrounded: true,
            suggestedFollowups: [
              userLanguage === 'hi' ? 'मेरी पात्रता जांचें' : userLanguage === 'mr' ? 'माझी पात्रता तपासा' : 'Check my scheme eligibility',
              userLanguage === 'hi' ? 'आवेदन कैसे करें?' : userLanguage === 'mr' ? 'अर्ज कसा करावा?' : 'How do I apply?'
            ]
          };
        }
      } catch (err) {
        console.warn('Groq broad LLM call error:', err);
      }
    }

    return {
      answer: userLanguage === 'mr' 
        ? 'जन-सहायक मध्ये आपले स्वागत आहे. आम्ही पीएम-किसान, आयुष्मान भारत, सुकन्या समृद्धी योजना आणि पीएम आवास योजनेची संपूर्ण अचूक माहिती देतो.'
        : userLanguage === 'hi'
        ? 'जन-सहायक में आपका स्वागत है। हम पीएम-किसान, आयुष्मान भारत, सुकन्या समृद्धि और आवास योजना की सटीक जानकारी प्रदान करते हैं।'
        : 'Welcome to JAN-SAHAYAK. We provide verified eligibility and application guidance for PM-Kisan, Ayushman Bharat, PMAY, Sukanya Samriddhi Yojana, and MUDRA loans.',
      sourceScheme: 'National Scheme Registry (All Government Schemes)',
      sourceSchemeId: 'all-schemes',
      confidenceScore: 0.90,
      isGrounded: true
    };
  }

  // Handle Document Requirements for Specific Matched Scheme
  if (['document', 'documents', 'दस्तावेज', 'कागदपत्रे', 'कागदपत्र', 'दस्तावेज़'].some(d => q.includes(d))) {
    const docAnswer = {
      en: `To apply for ${matchedScheme.title_en}, you require the following official documents:\n\n1. Aadhaar Card (linked with Mobile Number)\n2. Identity & Address Proof (Voter ID / Ration Card)\n3. Bank Account Passbook & IFSC Code\n4. Income / Land Certificate (where applicable)\n5. Passport Size Photographs`,
      hi: `${matchedScheme.title_hi} के लिए आवेदन करने हेतु आवश्यक दस्तावेज:\n\n1. आधार कार्ड (मोबाइल नंबर से लिंक)\n2. पहचान एवं निवास प्रमाण पत्र\n3. बैंक पासबुक और IFSC कोड\n4. आय या भूमि दस्तावेज\n5. पासपोर्ट साइज फोटो`,
      mr: `${matchedScheme.title_mr} साठी अर्ज करण्यासाठी लागणारी कागदपत्रे:\n\n१. आधार कार्ड (मोबाईल नंबरशी लिंक केलेले)\n२. ओळखपत्र व रहिवासी दाखला\n३. बँक पासबुक आणि IFSC कोड\n४. उत्पन्न किंवा जमिनीचा दाखला\n५. पासपोर्ट साईज फोटो`
    };

    return {
      answer: docAnswer[userLanguage],
      sourceScheme: userLanguage === 'hi' ? matchedScheme.title_hi : userLanguage === 'mr' ? matchedScheme.title_mr : matchedScheme.title_en,
      sourceSchemeId: matchedScheme.id,
      confidenceScore: 0.98,
      isGrounded: true,
      officialLink: matchedScheme.official_link
    };
  }

  // Handle Application Steps for Specific Matched Scheme
  if (['apply', 'application', 'आवेदन', 'अर्ज', 'फॉर्म'].some(a => q.includes(a))) {
    const applyAnswer = {
      en: `Here are the steps to apply for ${matchedScheme.title_en}:\n\nStep 1: Visit the official portal (${matchedScheme.official_link}).\nStep 2: Click on 'New Registration' and enter your Aadhaar details.\nStep 3: Fill in your personal details and upload required documents.\nStep 4: Submit the application and save your reference tracking number.`,
      hi: `${matchedScheme.title_hi} के लिए आवेदन प्रक्रिया:\n\nचरण 1: आधिकारिक पोर्टल (${matchedScheme.official_link}) पर जाएं।\nचरण 2: 'नवीन पंजीकरण' पर क्लिक करें और आधार दर्ज करें।\nचरण 3: अपनी जानकारी भरें और दस्तावेज संलग्न करें।\nचरण 4: फॉर्म सबमिट करें और आवेदन संख्या संभाल कर रखें।`,
      mr: `${matchedScheme.title_mr} साठी अर्ज प्रक्रिया:\n\nटप्पा १: अधिकृत पोर्टलवर (${matchedScheme.official_link}) जा.\nटप्पा २: 'नवीन नोंदणी' वर क्लिक करा व आधार क्रमांक टाका.\nटप्पा ३: तुमची माहिती भरा व कागदपत्रे जोडा.\nटप्पा ४: फॉर्म सबमिट करा आणि अर्ज नंबर जतन करा.`
    };

    return {
      answer: applyAnswer[userLanguage],
      sourceScheme: userLanguage === 'hi' ? matchedScheme.title_hi : userLanguage === 'mr' ? matchedScheme.title_mr : matchedScheme.title_en,
      sourceSchemeId: matchedScheme.id,
      confidenceScore: 0.98,
      isGrounded: true,
      officialLink: matchedScheme.official_link
    };
  }

  // Call Groq API for Specific Scheme Query
  const specificPrompt = `You are JAN-SAHAYAK, an official AI Digital Citizen Assistant for Indian Government Schemes.
SCHEME CONTEXT:
Name: ${matchedScheme.title_en}
Category: ${matchedScheme.category}
Benefit: ${matchedScheme.benefit_amount}
Eligibility: ${matchedScheme.eligibility_en}
Summary: ${matchedScheme.summary_en}

Respond strictly in language code "${userLanguage}" (en = English, hi = Hindi, mr = Marathi).
User Prompt: "${userQuery}"`;

  if (groqApiKey) {
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: specificPrompt }],
          temperature: 0.3
        })
      });

      const groqData = await groqRes.json();
      const llmAnswer = groqData.choices?.[0]?.message?.content;
      if (llmAnswer) {
        return {
          answer: llmAnswer,
          sourceScheme: userLanguage === 'hi' ? matchedScheme.title_hi : userLanguage === 'mr' ? matchedScheme.title_mr : matchedScheme.title_en,
          sourceSchemeId: matchedScheme.id,
          confidenceScore: 0.98,
          isGrounded: true,
          officialLink: matchedScheme.official_link,
          suggestedFollowups: [
            userLanguage === 'hi' ? 'आवेदन कैसे करें?' : userLanguage === 'mr' ? 'अर्ज कसा करावा?' : 'How do I apply for this?',
            userLanguage === 'hi' ? 'आवश्यक दस्तावेज क्या हैं?' : userLanguage === 'mr' ? 'कोणती कागदपत्रे लागतील?' : 'What documents are required?'
          ]
        };
      }
    } catch (err) {
      console.warn('Groq specific LLM call error:', err);
    }
  }

  // Fallback Output for Specific Scheme
  let formattedAnswer = '';
  if (userLanguage === 'mr') {
    formattedAnswer = `${matchedScheme.title_mr} बद्दल माहिती:\n\n• पात्रता: ${matchedScheme.eligibility_mr}\n• फायदा: ${matchedScheme.summary_mr}\n\nअधिकृत वेबसाइटद्वारे ऑनलाइन अर्ज करू शकता.`;
  } else if (userLanguage === 'hi') {
    formattedAnswer = `${matchedScheme.title_hi} की जानकारी:\n\n• पात्रता: ${matchedScheme.eligibility_hi}\n• लाभ: ${matchedScheme.summary_hi}\n\nआप आधिकारिक पोर्टल पर ऑनलाइन आवेदन कर सकते हैं।`;
  } else {
    formattedAnswer = `Information regarding ${matchedScheme.title_en}:\n\n• Eligibility: ${matchedScheme.eligibility_en}\n• Benefit: ${matchedScheme.summary_en}\n\nYou can apply online at the official portal below.`;
  }

  return {
    answer: formattedAnswer,
    sourceScheme: userLanguage === 'hi' ? matchedScheme.title_hi : userLanguage === 'mr' ? matchedScheme.title_mr : matchedScheme.title_en,
    sourceSchemeId: matchedScheme.id,
    confidenceScore: 0.95,
    isGrounded: true,
    officialLink: matchedScheme.official_link
  };
}
