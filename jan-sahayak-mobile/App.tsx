import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Linking,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import * as Speech from 'expo-speech';
import { ClerkProvider, SignedIn, SignedOut, useUser, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

// Token cache for Clerk Expo
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_c2luY2VyZS1yZWRiaXJkLTQ5LmNsZXJrLmFjY291bnRzLmRldiQ';

// Rajmudra Design System Color Tokens
const COLORS = {
  kagaz: '#FAF7F1',
  neel: '#1B2340',
  chakra: '#14539A',
  haldi: '#E8A33D',
  tulsi: '#3B7A57',
  sindoor: '#C1442D',
  rekha: '#D8D2C4',
  white: '#FFFFFF',
};

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  sourceScheme?: string;
  officialLink?: string;
}

function MainApp() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [lang, setLang] = useState<'en' | 'hi' | 'mr'>('en');
  const [activeTab, setActiveTab] = useState<'chat' | 'schemes' | 'saved'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const GROQ_KEY = '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';

  const initialWelcome = {
    en: 'Namaste! I am JAN-SAHAYAK, your AI Digital Citizen Assistant for ALL Indian Government Schemes.',
    hi: 'नमस्ते! मैं जन-सहायक हूँ, सभी भारतीय सरकारी योजनाओं के लिए आपका एआई नागरिक सहायक।',
    mr: 'नमस्ते! मी जन-सहायक आहे, सर्व भारतीय सरकारी योजनांसाठी तुमचा एआय नागरिक सहाय्यक.'
  };

  useEffect(() => {
    setMessages([
      {
        id: '1',
        sender: 'bot',
        text: initialWelcome[lang],
        sourceScheme: 'National Scheme Registry (All Schemes)'
      }
    ]);
  }, [lang]);

  // Verified Schemes Catalog
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
      summary_en: 'High-interest tax-free savings scheme for girl child education with 8.2% compound interest.',
      summary_hi: '8.2% वार्षिक ब्याज दर के साथ बालिकाओं की शिक्षा और विवाह के लिए सरकारी बचत योजना।',
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
      summary_en: 'Offers cashless health coverage of up to ₹5 Lakh per family per year for hospitalization.',
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
      summary_en: 'Provides financial assistance and interest subsidy up to ₹2.67 Lakh for building or buying a home.',
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
      summary_mr: 'शिशू, किशोर व तरुण श्रेणी अंतर्गत ₹१० लाखांपर्यंत विनातारण कर्ज.',
      official_link: 'https://mudra.org.in',
      benefit_amount: 'Up to ₹10,00,000 Loan'
    }
  ];

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || inputQuery;
    if (!queryText.trim()) return;

    const q = queryText.toLowerCase().trim();
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: queryText };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setLoading(true);

    // 1. Handle Greetings & General System Queries
    const isGeneral = ['hello', 'hi', 'hey', 'namaste', 'how are you', 'what do you do', 'who are you', 'नमस्ते', 'नमस्कार', 'हॅलो', 'काय करतेस', 'कोण आहेस'].some(g => q.startsWith(g) || q === g) ||
      ['scheme', 'schemes', 'all schemes', 'yojana', 'योजना', 'सरकारी योजना', 'माहिती'].some(s => q === s || q === 'what schemes are available' || q === 'list schemes');

    if (isGeneral) {
      const generalText = {
        en: 'Namaste! I am JAN-SAHAYAK, your AI Digital Citizen Assistant for ALL Indian Government Schemes.\n\nI can help you with verified eligibility criteria, benefits, documents, and application steps for:\n\n• PM-Kisan Samman Nidhi (₹6,000/yr for Farmers)\n• Ayushman Bharat PM-JAY (₹5 Lakh Free Health Cover)\n• Pradhan Mantri Awas Yojana (Housing Subsidy up to ₹2.67 Lakh)\n• Sukanya Samriddhi Yojana (8.2% Interest for Girl Child Education)\n• PM MUDRA Yojana (Collateral-Free Business Loans up to ₹10 Lakh)\n\nHow can I assist you today?',
        hi: 'नमस्ते! मैं जन-सहायक हूँ, सभी भारतीय सरकारी योजनाओं के लिए आपका एआई नागरिक सहायक।\n\nमैं निम्नलिखित योजनाओं के लिए पात्रता, लाभ, दस्तावेजों और आवेदन में आपकी सहायता कर सकता हूँ:\n\n• पीएम-किसान (₹6,000/वर्ष)\n• आयुष्मान भारत (₹5 लाख तक मुफ्त इलाज)\n• पीएम आवास योजना (₹2.67 लाख तक मकान सब्सिडी)\n• सुकन्या समृद्धि योजना (बालिकाओं के लिए 8.2% ब्याज योजना)\n• पीएम मुद्रा योजना (₹10 लाख तक बिजनेस लोन)\n\nआज मैं आपकी क्या सहायता कर सकता हूँ?',
        mr: 'नमस्ते! मी जन-सहायक आहे, सर्व भारतीय सरकारी योजनांसाठी तुमचा एआय नागरिक सहाय्यक.\n\nमी तुम्हाला खालील योजनांच्या पात्रतेबद्दल व अर्जाबद्दल अचूक माहिती देऊ शकतो:\n\n• पीएम-किसान (दरवर्षी ₹६,०००)\n• आयुष्मान भारत (₹५ लाखांपर्यंत मोफत आरोग्य संरक्षण)\n• पीएम आवास योजना (घर बांधणीसाठी ₹२.६७ लाखांपर्यंत सबसिडी)\n• सुकन्या समृद्धी योजना (मुलींच्या शिक्षणासाठी ८.२% व्याज योजना)\n• पीएम मुद्रा योजना (₹१० लाखांपर्यंत विनातारण कर्ज)\n\nमी तुम्हाला आज कशी मदत करू?'
      };

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: generalText[lang],
          sourceScheme: lang === 'hi' ? 'राष्ट्रीय योजना रजिस्ट्री (सभी योजनाएं)' : lang === 'mr' ? 'राष्ट्रीय योजना रजिस्ट्री (सर्व योजना)' : 'National Scheme Registry (All Schemes)'
        }
      ]);
      setLoading(false);
      return;
    }

    // 2. Select Specific Scheme Context
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
    }

    const schemeToUse = matchedScheme || fallbackSchemes[0];
    const sourceLabel = matchedScheme
      ? (lang === 'hi' ? matchedScheme.title_hi : lang === 'mr' ? matchedScheme.title_mr : matchedScheme.title_en)
      : (lang === 'hi' ? 'राष्ट्रीय योजना रजिस्ट्री (सभी योजनाएं)' : lang === 'mr' ? 'राष्ट्रीय योजना रजिस्ट्री (सर्व योजना)' : 'National Scheme Registry (All Schemes)');

    // 3. Call Groq Llama 3.3 70B API
    try {
      const systemPrompt = `You are JAN-SAHAYAK, an official AI Digital Citizen Assistant for Indian Government Schemes.
SCHEME CONTEXT:
Name: ${schemeToUse.title_en}
Benefit: ${schemeToUse.benefit_amount}
Eligibility: ${schemeToUse.eligibility_en}
Summary: ${schemeToUse.summary_en}

Respond strictly in language code "${lang}" (en = English, hi = Hindi, mr = Marathi).
User Question: "${queryText}"`;

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: systemPrompt }],
          temperature: 0.3
        })
      });

      const groqData = await groqRes.json();
      const llmAnswer = groqData.choices?.[0]?.message?.content;

      if (llmAnswer) {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: llmAnswer,
            sourceScheme: sourceLabel,
            officialLink: schemeToUse.official_link
          }
        ]);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Groq Mobile Call Error:', err);
    }

    // Fallback Output
    let formattedAnswer = '';
    if (lang === 'mr') {
      formattedAnswer = `${schemeToUse.title_mr} माहिती व पात्रता:\n\n• पात्रता: ${schemeToUse.eligibility_mr}\n• फायदा: ${schemeToUse.summary_mr}\n\nअधिकृत वेबसाइटद्वारे अर्ज करू शकता.`;
    } else if (lang === 'hi') {
      formattedAnswer = `${schemeToUse.title_hi} की जानकारी एवं पात्रता:\n\n• पात्रता: ${schemeToUse.eligibility_hi}\n• लाभ: ${schemeToUse.summary_hi}\n\nआप आधिकारिक पोर्टल के माध्यम से आवेदन कर सकते हैं।`;
    } else {
      formattedAnswer = `Information regarding ${schemeToUse.title_en}:\n\n• Eligibility: ${schemeToUse.eligibility_en}\n• Benefit: ${schemeToUse.summary_en}\n\nYou can apply online at the official government portal below.`;
    }

    setMessages(prev => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: formattedAnswer,
        sourceScheme: sourceLabel,
        officialLink: schemeToUse.official_link
      }
    ]);
    setLoading(false);
  };

  const handleTTS = (text: string) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(text, {
        language: lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN',
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.kagaz} translucent={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Top Header Bar with Clerk User & Notch Protection */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeIconText}>🏛️</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>JAN-SAHAYAK</Text>
              <Text style={styles.headerSubtitle}>
                {user ? `👤 ${user.primaryEmailAddress?.emailAddress.split('@')[0]}` : 'Digital Citizen Assistant'}
              </Text>
            </View>
          </View>

          {/* Language Selector Chips & Clerk Auth Logout */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={styles.langContainer}>
              {(['en', 'hi', 'mr'] as const).map(l => (
                <TouchableOpacity
                  key={l}
                  onPress={() => setLang(l)}
                  style={[styles.langBtn, lang === l && styles.langBtnActive]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.langText, lang === l && styles.langTextActive]}>
                    {l === 'en' ? 'EN' : l === 'hi' ? 'हिंदी' : 'मराठी'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <SignedIn>
              <TouchableOpacity onPress={() => signOut()} style={styles.logoutBtn}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </SignedIn>
          </View>
        </View>

        {/* Main Body View */}
        <View style={styles.body}>
          {activeTab === 'chat' ? (
            <View style={{ flex: 1 }}>
              <ScrollView
                style={styles.chatScroll}
                contentContainerStyle={{ paddingVertical: 16, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
              >
                {messages.map(msg => (
                  <View
                    key={msg.id}
                    style={[
                      styles.msgBubble,
                      msg.sender === 'user' ? styles.userBubble : styles.botBubble
                    ]}
                  >
                    {msg.sender === 'bot' && (
                      <View style={styles.sealBadge}>
                        <Text style={styles.sealText}>
                          🛡️ Grounded in: {msg.sourceScheme}
                        </Text>
                      </View>
                    )}
                    <Text style={msg.sender === 'user' ? styles.userMsgText : styles.botMsgText}>
                      {msg.text}
                    </Text>

                    {msg.sender === 'bot' && (
                      <TouchableOpacity
                        onPress={() => handleTTS(msg.text)}
                        style={styles.ttsButton}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.ttsText}>🔊 Listen Audio</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                {loading && (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator color={COLORS.chakra} size="small" />
                    <Text style={styles.loadingText}>Groq Llama 3.3 AI processing query...</Text>
                  </View>
                )}
              </ScrollView>

              {/* Chat Input Bar */}
              <View style={styles.inputContainer}>
                <TextInput
                  value={inputQuery}
                  onChangeText={setInputQuery}
                  placeholder="Ask about PM-Kisan, Sukanya, Ayushman..."
                  placeholderTextColor="#888"
                  style={styles.textInput}
                />
                <TouchableOpacity
                  onPress={() => handleSend()}
                  style={styles.sendButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sendText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : activeTab === 'schemes' ? (
            <ScrollView
              style={{ flex: 1, paddingHorizontal: 16 }}
              contentContainerStyle={{ paddingVertical: 16, paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionTitle}>Government Scheme Directory</Text>

              {/* Scheme Card 1 */}
              <View style={styles.schemeCard}>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>GIRL CHILD & EDUCATION</Text>
                </View>
                <Text style={styles.cardTitle}>Sukanya Samriddhi Yojana (SSY)</Text>
                <Text style={styles.cardSummary}>
                  High-interest tax-free government savings scheme for girl child education with 8.2% compound interest.
                </Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL('https://indiapost.gov.in')}
                  style={styles.applyBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyBtnText}>Apply at Post Office Portal ➔</Text>
                </TouchableOpacity>
              </View>

              {/* Scheme Card 2 */}
              <View style={styles.schemeCard}>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>AGRICULTURE & FARMING</Text>
                </View>
                <Text style={styles.cardTitle}>PM-Kisan Samman Nidhi Yojana</Text>
                <Text style={styles.cardSummary}>
                  Direct financial benefit of ₹6,000/year to small & marginal farmer families.
                </Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL('https://pmkisan.gov.in')}
                  style={styles.applyBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyBtnText}>Apply at Official Portal ➔</Text>
                </TouchableOpacity>
              </View>

              {/* Scheme Card 3 */}
              <View style={styles.schemeCard}>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>HEALTH & WELLNESS</Text>
                </View>
                <Text style={styles.cardTitle}>Ayushman Bharat (PM-JAY)</Text>
                <Text style={styles.cardSummary}>
                  Cashless health insurance cover of up to ₹5 Lakh per family per year.
                </Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL('https://pmjay.gov.in')}
                  style={styles.applyBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyBtnText}>Apply at Official Portal ➔</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <ScrollView
              style={{ flex: 1, paddingHorizontal: 16 }}
              contentContainerStyle={{ paddingVertical: 16, paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionTitle}>Saved Bookmarks & Deadlines</Text>
              <View style={styles.savedCard}>
                <Text style={styles.cardTitle}>Sukanya Samriddhi Yojana</Text>
                <Text style={{ color: COLORS.sindoor, fontWeight: 'bold', marginVertical: 4 }}>
                  ⚠️ Deadline in 10 days!
                </Text>
                <Text style={styles.cardSummary}>8.2% Interest • Girl Child Education</Text>
              </View>
            </ScrollView>
          )}
        </View>

        {/* Bottom Navigation Bar */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            onPress={() => setActiveTab('chat')}
            style={[styles.navItem, activeTab === 'chat' && styles.navItemActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.navText, activeTab === 'chat' && styles.navTextActive]}>
              💬 Chat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('schemes')}
            style={[styles.navItem, activeTab === 'schemes' && styles.navItemActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.navText, activeTab === 'schemes' && styles.navTextActive]}>
              🌐 Directory
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('saved')}
            style={[styles.navItem, activeTab === 'saved' && styles.navItemActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.navText, activeTab === 'saved' && styles.navTextActive]}>
              🔖 Saved
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Clerk Authentication Wrapper for Mobile
export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <MainApp />
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.kagaz,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rekha,
    backgroundColor: COLORS.kagaz,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.chakra,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIconText: { fontSize: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.neel },
  headerSubtitle: { fontSize: 11, color: COLORS.neel, opacity: 0.7 },
  langContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.rekha,
  },
  langBtn: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 16 },
  langBtnActive: { backgroundColor: COLORS.chakra },
  langText: { fontSize: 12, fontWeight: 'bold', color: COLORS.neel },
  langTextActive: { color: COLORS.white },
  logoutBtn: { backgroundColor: COLORS.sindoor, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  logoutText: { color: COLORS.white, fontSize: 11, fontWeight: 'bold' },

  body: { flex: 1, backgroundColor: COLORS.kagaz },
  chatScroll: { flex: 1, paddingHorizontal: 16 },
  msgBubble: { borderRadius: 18, padding: 14, marginVertical: 6, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.chakra },
  botBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.rekha },
  userMsgText: { color: COLORS.white, fontSize: 15, lineHeight: 22, fontWeight: '500' },
  botMsgText: { color: COLORS.neel, fontSize: 15, lineHeight: 22 },
  sealBadge: { backgroundColor: '#EBF3FB', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8, alignSelf: 'flex-start' },
  sealText: { fontSize: 11, fontWeight: 'bold', color: COLORS.chakra },
  ttsButton: { marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: COLORS.rekha },
  ttsText: { fontSize: 12, fontWeight: 'bold', color: COLORS.chakra },

  loadingBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  loadingText: { color: COLORS.neel, fontSize: 14, fontWeight: '500' },

  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.rekha,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.kagaz,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.neel,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.rekha,
  },
  sendButton: {
    backgroundColor: COLORS.chakra,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.neel, marginBottom: 16 },
  schemeCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: COLORS.rekha },
  categoryPill: { backgroundColor: '#EBF3FB', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 8 },
  categoryText: { fontSize: 10, fontWeight: 'bold', color: COLORS.chakra },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.neel, marginBottom: 4 },
  cardSummary: { fontSize: 14, color: COLORS.neel, opacity: 0.8, lineHeight: 20, marginBottom: 14 },
  applyBtn: { backgroundColor: COLORS.chakra, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  applyBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },

  savedCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: COLORS.rekha },

  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.rekha,
    backgroundColor: COLORS.white,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingHorizontal: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 16 },
  navItemActive: { backgroundColor: '#EBF3FB' },
  navText: { fontSize: 14, fontWeight: 'bold', color: COLORS.neel },
  navTextActive: { color: COLORS.chakra },
});
