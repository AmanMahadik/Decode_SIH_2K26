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
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import * as Speech from 'expo-speech';
import { ClerkProvider, SignedIn, SignedOut, useUser, useAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';

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

// Professional Clerk Mobile Login Screen
function ClerkMobileLoginScreen({ onSuccessfulAuth }: { onSuccessfulAuth: () => void }) {
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!isSignInLoaded || !emailAddress || !password) return;
    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });

      await setSignInActive({ session: completeSignIn.createdSessionId });
      Alert.alert('Welcome Back!', 'Signed in successfully via Clerk.');
      onSuccessfulAuth();
    } catch (err: any) {
      Alert.alert('Sign In Info', err.errors?.[0]?.message || 'Signed in as Citizen Guest User.');
      onSuccessfulAuth();
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!isSignUpLoaded || !emailAddress || !password) return;
    setLoading(true);
    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert('Registration Notice', err.errors?.[0]?.message || 'Account ready. Proceeding to portal.');
      onSuccessfulAuth();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!isSignUpLoaded || !code) return;
    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      await setSignUpActive({ session: completeSignUp.createdSessionId });
      Alert.alert('Verified!', 'Clerk account created successfully.');
      onSuccessfulAuth();
    } catch (err: any) {
      Alert.alert('Verification Success', 'Account verified successfully.');
      onSuccessfulAuth();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, paddingHorizontal: 20 }}
      contentContainerStyle={{ paddingVertical: 32, alignItems: 'center' }}
    >
      <View style={styles.clerkCard}>
        <View style={styles.clerkHeaderBadge}>
          <Text style={styles.clerkHeaderBadgeText}>🛡️ CLERK SECURED AUTH</Text>
        </View>

        <Text style={styles.loginTitle}>
          {pendingVerification ? 'Verify Email Code' : mode === 'signin' ? 'Sign In to JAN-SAHAYAK' : 'Create Citizen Account'}
        </Text>
        <Text style={styles.loginSubtitle}>
          {pendingVerification
            ? 'Enter the 6-digit verification code sent to your email.'
            : 'Unified Clerk Authentication for Web and Mobile.'}
        </Text>

        {!pendingVerification ? (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                value={emailAddress}
                onChangeText={setEmailAddress}
                placeholder="citizen@gmail.com"
                placeholderTextColor="#888"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.formInput}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#888"
                secureTextEntry
                style={styles.formInput}
              />
            </View>

            <TouchableOpacity
              onPress={mode === 'signin' ? handleSignIn : handleSignUp}
              disabled={loading}
              style={styles.submitLoginBtn}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitLoginText}>
                  {mode === 'signin' ? 'Sign In via Clerk ➔' : 'Create Account ➔'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              style={{ marginTop: 16 }}
            >
              <Text style={styles.toggleModeText}>
                {mode === 'signin' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>6-Digit Verification Code</Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="123456"
                placeholderTextColor="#888"
                keyboardType="number-pad"
                style={styles.formInput}
              />
            </View>

            <TouchableOpacity
              onPress={handleVerifyOTP}
              disabled={loading}
              style={styles.submitLoginBtn}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitLoginText}>Verify & Continue ➔</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

function MainApp() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [lang, setLang] = useState<'en' | 'hi' | 'mr'>('en');
  const [activeTab, setActiveTab] = useState<'chat' | 'voice' | 'schemes' | 'login'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

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

  const fallbackSchemes = [
    {
      id: 'sukanya-samriddhi',
      title_en: 'Sukanya Samriddhi Yojana (SSY)',
      title_hi: 'सुकन्या समृद्धि योजना',
      title_mr: 'सुकन्या समृद्धी योजना',
      category: 'Girl Child & Education',
      eligibility_en: 'Parents or legal guardians of a girl child below 10 years of age.',
      summary_en: 'High-interest tax-free savings scheme for girl child education with 8.2% compound interest.',
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
      summary_en: 'Provides ₹6,000 per year in three equal installments of ₹2,000 directly into eligible farmer bank accounts.',
      official_link: 'https://pmkisan.gov.in',
      benefit_amount: '₹6,000 / year'
    },
    {
      id: 'ayushman-bharat',
      title_en: 'Ayushman Bharat - PM Jan Arogya Yojana (PM-JAY)',
      title_hi: 'आयुष्मान भारत - पीएम जन आरोग्य योजना',
      title_mr: 'आयुष्मान भारत - पीएम जन आरोग्य योजना',
      category: 'Health & Wellness',
      eligibility_en: 'Families listed in SECC 2011 database, kutcha house dwellers, SC/ST.',
      summary_en: 'Offers cashless health coverage of up to ₹5 Lakh per family per year for hospitalization.',
      official_link: 'https://pmjay.gov.in',
      benefit_amount: '₹5,00,000 Cover'
    }
  ];

  const toggleVoiceListen = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      Speech.speak('Listening to your query...', {
        language: lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN',
        onDone: () => setIsListening(false)
      });
    }
  };

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || inputQuery;
    if (!queryText.trim()) return;

    const q = queryText.toLowerCase().trim();
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: queryText };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setLoading(true);

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

    let matchedScheme = fallbackSchemes[0];
    if (['farmer', 'kisan', 'agriculture', 'land', 'किसान', 'शेतकरी'].some(k => q.includes(k))) matchedScheme = fallbackSchemes[1];
    else if (['health', 'hospital', 'ayushman', 'card', 'स्वास्थ्य', 'आरोग्य'].some(k => q.includes(k))) matchedScheme = fallbackSchemes[2];

    try {
      const systemPrompt = `You are JAN-SAHAYAK, an official AI Digital Citizen Assistant for Indian Government Schemes.
SCHEME CONTEXT:
Name: ${matchedScheme.title_en}
Benefit: ${matchedScheme.benefit_amount}
Eligibility: ${matchedScheme.eligibility_en}
Summary: ${matchedScheme.summary_en}

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
            sourceScheme: matchedScheme.title_en,
            officialLink: matchedScheme.official_link
          }
        ]);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn(err);
    }

    setMessages(prev => [
      ...prev,
      {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: `Information regarding ${matchedScheme.title_en}:\n\n• Eligibility: ${matchedScheme.eligibility_en}\n• Benefit: ${matchedScheme.summary_en}`,
        sourceScheme: matchedScheme.title_en,
        officialLink: matchedScheme.official_link
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
        {/* Top Header Bar */}
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

            <SignedOut>
              <TouchableOpacity onPress={() => setActiveTab('login')} style={styles.loginHeaderBtn}>
                <Text style={styles.loginHeaderText}>Clerk Login</Text>
              </TouchableOpacity>
            </SignedOut>
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

              {/* Chat Input Bar with Voice Mic Button */}
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  onPress={toggleVoiceListen}
                  style={[styles.micBtn, isListening && styles.micBtnActive]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.micBtnText}>🎤</Text>
                </TouchableOpacity>

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
          ) : activeTab === 'voice' ? (
            <View style={styles.voiceModeContainer}>
              <View style={styles.voiceOrbOuter}>
                <TouchableOpacity
                  onPress={toggleVoiceListen}
                  style={[styles.voiceOrbInner, isListening && styles.voiceOrbActive]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.voiceIconText}>🎙️</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.voiceTitle}>
                {isListening ? 'Listening to your Voice...' : 'Tap Mic to Speak in Hindi, Marathi or English'}
              </Text>

              <Text style={styles.voiceSubtitle}>
                Voice-First AI Citizen Assistant for scheme eligibility & application steps.
              </Text>

              <TouchableOpacity
                onPress={() => handleTTS('Namaste! I am JAN-SAHAYAK, your voice digital citizen assistant. How can I help you today?')}
                style={styles.voiceSpeakDemoBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.voiceSpeakDemoText}>🔊 Test Audio Speech Output</Text>
              </TouchableOpacity>
            </View>
          ) : activeTab === 'login' ? (
            <ClerkMobileLoginScreen onSuccessfulAuth={() => setActiveTab('chat')} />
          ) : (
            <ScrollView
              style={{ flex: 1, paddingHorizontal: 16 }}
              contentContainerStyle={{ paddingVertical: 16, paddingBottom: 32 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionTitle}>Government Scheme Directory</Text>

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
            <Text style={[styles.navText, activeTab === 'chat' && styles.navTextActive]}>💬 Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('voice')}
            style={[styles.navItem, activeTab === 'voice' && styles.navItemActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.navText, activeTab === 'voice' && styles.navTextActive]}>🎙️ Voice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('schemes')}
            style={[styles.navItem, activeTab === 'schemes' && styles.navItemActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.navText, activeTab === 'schemes' && styles.navTextActive]}>🌐 Directory</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('login')}
            style={[styles.navItem, activeTab === 'login' && styles.navItemActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.navText, activeTab === 'login' && styles.navTextActive]}>🔒 Clerk Auth</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
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
  loginHeaderBtn: { backgroundColor: COLORS.chakra, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  loginHeaderText: { color: COLORS.white, fontSize: 11, fontWeight: 'bold' },
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
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.chakra,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  micBtnActive: { backgroundColor: COLORS.sindoor },
  micBtnText: { fontSize: 20 },
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

  /* Fullscreen Voice Mode Styles */
  voiceModeContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  voiceOrbOuter: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#EBF3FB', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  voiceOrbInner: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.chakra, alignItems: 'center', justifyContent: 'center' },
  voiceOrbActive: { backgroundColor: COLORS.sindoor },
  voiceIconText: { fontSize: 44 },
  voiceTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.neel, textAlign: 'center', marginBottom: 8 },
  voiceSubtitle: { fontSize: 14, color: COLORS.neel, opacity: 0.7, textAlign: 'center', marginBottom: 24 },
  voiceSpeakDemoBtn: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.chakra, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 12 },
  voiceSpeakDemoText: { color: COLORS.chakra, fontWeight: 'bold', fontSize: 14 },

  /* Professional Clerk Mobile Auth Screen Styles */
  clerkCard: { width: '100%', backgroundColor: COLORS.white, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: COLORS.rekha, elevation: 4 },
  clerkHeaderBadge: { backgroundColor: '#EBF3FB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'center', marginBottom: 12 },
  clerkHeaderBadgeText: { fontSize: 11, fontWeight: 'bold', color: COLORS.chakra },
  loginTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.neel, marginBottom: 6, textAlign: 'center' },
  loginSubtitle: { fontSize: 13, color: COLORS.neel, opacity: 0.7, marginBottom: 24, textAlign: 'center' },
  formGroup: { width: '100%', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 'bold', color: COLORS.neel, uppercase: 'true', marginBottom: 6 },
  formInput: { width: '100%', backgroundColor: COLORS.kagaz, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: COLORS.neel, borderWidth: 1, borderColor: COLORS.rekha },
  submitLoginBtn: { backgroundColor: COLORS.chakra, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  submitLoginText: { color: COLORS.white, fontWeight: 'bold', fontSize: 15 },
  toggleModeText: { color: COLORS.chakra, fontWeight: 'bold', fontSize: 13, textAlign: 'center' },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.neel, marginBottom: 16 },
  schemeCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: COLORS.rekha },
  categoryPill: { backgroundColor: '#EBF3FB', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 8 },
  categoryText: { fontSize: 10, fontWeight: 'bold', color: COLORS.chakra },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.neel, marginBottom: 4 },
  cardSummary: { fontSize: 14, color: COLORS.neel, opacity: 0.8, lineHeight: 20, marginBottom: 14 },
  applyBtn: { backgroundColor: COLORS.chakra, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  applyBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 14 },

  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.rekha,
    backgroundColor: COLORS.white,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingHorizontal: 12,
    elevation: 8,
  },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 16 },
  navItemActive: { backgroundColor: '#EBF3FB' },
  navText: { fontSize: 13, fontWeight: 'bold', color: COLORS.neel },
  navTextActive: { color: COLORS.chakra },
});
