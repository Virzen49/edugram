import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  card: string;
  error: string;
  success: string;
  warning: string;
}

export const lightTheme: ThemeColors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  primary: '#22C55E',
  secondary: '#6B7280',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  card: '#FFFFFF',
  error: '#DC2626',
  success: '#10B981',
  warning: '#F59E0B',
};

export const darkTheme: ThemeColors = {
  background: '#1F2937',
  surface: '#374151',
  primary: '#22C55E',
  secondary: '#9CA3AF',
  text: '#FFFFFF',
  textSecondary: '#D1D5DB',
  border: '#4B5563',
  card: '#374151',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

export const translations = {
  en: {
    // Authentication
    welcome: 'Welcome Back',
    learnPlayAchieve: 'Learn · Play · Analyze',
    enterEmail: 'Enter Email Address',
    enterPassword: 'Enter Password',
    login: 'Login',
    loginWithGoogle: 'Login with Google',
    loginWithSchool: 'Login with School ID',
    forgotPassword: 'Forgot Password?',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account? Login',
    enterFullName: 'Enter your full name',
    confirmPassword: 'Confirm Password',
    
    // Navigation
    home: 'Home',
    courses: 'Courses',
    profile: 'Profile',
    leaderboard: 'Leaderboard',
    settings: 'Settings',
    notifications: 'Notifications',
    logout: 'Logout',
    
    // Home Screen
    welcomeBack: 'Welcome back,',
    activities: 'Activities',
    subjects: 'Subjects',
    xpLeaderboard: 'XP & Leaderboard',
    level: 'Level',
    rankInClass: 'Rank {rank} in Class',
    
    // Subjects
    chemistry: 'Chemistry',
    mathematics: 'Mathematics',
    physics: 'Physics',
    computerScience: 'Computer Science',
    generalScience: 'General Science',
    biology: 'Biology',
    generalMath: 'General Math',
    algebra: 'Algebra',
    geometry: 'Geometry',
    calculus: 'Calculus',
    programming: 'Programming',
    robotics: 'Robotics',
    generalEngineering: 'General Engineering',
    mechanicalEngineering: 'Mechanical Engineering',
    civilEngineering: 'Civil Engineering',
    
    // Categories
    science: 'Science',
    technology: 'Technology',
    engineering: 'Engineering',
    selectSubject: 'Select a Subject',
    
    // Profile & Settings
    badges: 'Badges',
    points: 'Points',
    completed: 'Completed',
    achievements: 'Achievements',
    weeklyProgress: 'Weekly Progress',
    weeklyGoalCompleted: '{percent}% of weekly goal completed',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    language: 'Language',
    account: 'Account',
    
    // Achievements
    mathWhiz: 'Math Whiz',
    mathWhizDesc: 'Solved 100 math problems',
    scienceExplorer: 'Science Explorer',
    scienceExplorerDesc: 'Completed 5 science experiments',
    codingChampion: 'Coding Champion',
    codingChampionDesc: 'Finished 3 coding challenges',
    
    // Leaderboard
    searchStudent: 'Search for a student',
    all: 'All',
    subject: 'Subject',
    grade: 'Grade',
    viewProfile: 'View Profile',
    youRank: 'You - Rank {rank}',
    
    // Common
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Logout
    logoutConfirm: 'Are you sure you want to logout?',
  },
  hi: {
    // Authentication
    welcome: 'वापस स्वागत है',
    learnPlayAchieve: 'सीखें.खेलें.हासिल करें',
    enterEmail: 'ईमेल पता दर्ज करें',
    enterPassword: 'पासवर्ड दर्ज करें',
    login: 'लॉगिन',
    loginWithGoogle: 'Google से लॉगिन करें',
    loginWithSchool: 'स्कूल ID से लॉगिन करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    createAccount: 'खाता बनाएं',
    alreadyHaveAccount: 'पहले से खाता है? लॉगिन करें',
    enterFullName: 'अपना पूरा नाम दर्ज करें',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    
    // Navigation
    home: 'होम',
    courses: 'कोर्स',
    profile: 'प्रोफाइल',
    leaderboard: 'लीडरबोर्ड',
    settings: 'सेटिंग्स',
    notifications: 'सूचनाएं',
    logout: 'लॉगआउट',
    
    // Home Screen
    welcomeBack: 'वापस स्वागत है,',
    activities: 'गतिविधियां',
    subjects: 'विषय',
    xpLeaderboard: 'XP और लीडरबोर्ड',
    level: 'स्तर',
    rankInClass: 'कक्षा में रैंक {rank}',
    
    // Subjects
    chemistry: 'रसायन विज्ञान',
    mathematics: 'गणित',
    physics: 'भौतिक विज्ञान',
    computerScience: 'कंप्यूटर विज्ञान',
    generalScience: 'सामान्य विज्ञान',
    biology: 'जीव विज्ञान',
    generalMath: 'सामान्य गणित',
    algebra: 'बीजगणित',
    geometry: 'ज्यामिति',
    calculus: 'कैलकुलस',
    programming: 'प्रोग्रामिंग',
    robotics: 'रोबोटिक्स',
    generalEngineering: 'सामान्य इंजीनियरिंग',
    mechanicalEngineering: 'मैकेनिकल इंजीनियरिंग',
    civilEngineering: 'सिविल इंजीनियरिंग',
    
    // Categories
    science: 'विज्ञान',
    technology: 'प्रौद्योगिकी',
    engineering: 'इंजीनियरिंग',
    selectSubject: 'एक विषय चुनें',
    
    // Profile & Settings
    badges: 'बैज',
    points: 'अंक',
    completed: 'पूर्ण',
    achievements: 'उपलब्धियां',
    weeklyProgress: 'साप्ताहिक प्रगति',
    weeklyGoalCompleted: 'साप्ताहिक लक्ष्य का {percent}% पूरा',
    appearance: 'दिखावट',
    darkMode: 'डार्क मोड',
    language: 'भाषा',
    account: 'खाता',
    
    // Achievements
    mathWhiz: 'गणित विशेषज्ञ',
    mathWhizDesc: '100 गणित समस्याएं हल कीं',
    scienceExplorer: 'विज्ञान खोजकर्ता',
    scienceExplorerDesc: '5 विज्ञान प्रयोग पूरे किए',
    codingChampion: 'कोडिंग चैंपियन',
    codingChampionDesc: '3 कोडिंग चुनौतियां पूरी कीं',
    
    // Leaderboard
    searchStudent: 'छात्र खोजें',
    all: 'सभी',
    subject: 'विषय',
    grade: 'ग्रेड',
    viewProfile: 'प्रोफाइल देखें',
    youRank: 'आप - रैंक {rank}',
    
    // Common
    cancel: 'रद्द करें',
    save: 'सहेजें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    confirm: 'पुष्टि करें',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    
    // Logout
    logoutConfirm: 'क्या आप वाकई लॉगआउट करना चाहते हैं?',
  },
  gu: {
    // Authentication
    welcome: 'પાછા સ્વાગત છે',
    learnPlayAchieve: 'શીખો.રમો.હાંસલ કરો',
    enterEmail: 'ઈમેઈલ સરનામું દાખલ કરો',
    enterPassword: 'પાસવર્ડ દાખલ કરો',
    login: 'લોગિન',
    loginWithGoogle: 'Google સાથે લોગિન કરો',
    loginWithSchool: 'સ્કૂલ ID સાથે લોગિન કરો',
    forgotPassword: 'પાસવર્ડ ભૂલી ગયા?',
    createAccount: 'ખાતું બનાવો',
    alreadyHaveAccount: 'પહેલેથી ખાતું છે? લોગિન કરો',
    enterFullName: 'તમારું પૂરું નામ દાખલ કરો',
    confirmPassword: 'પાસવર્ડની પુષ્ટિ કરો',
    
    // Navigation
    home: 'હોમ',
    courses: 'કોર્સ',
    profile: 'પ્રોફાઇલ',
    leaderboard: 'લીડરબોર્ડ',
    settings: 'સેટિંગ્સ',
    notifications: 'સૂચનાઓ',
    logout: 'લોગઆઉટ',
    
    // Home Screen
    welcomeBack: 'પાછા સ્વાગત છે,',
    activities: 'પ્રવૃત્તિઓ',
    subjects: 'વિષયો',
    xpLeaderboard: 'XP અને લીડરબોર્ડ',
    level: 'સ્તર',
    rankInClass: 'વર્ગમાં રેન્ક {rank}',
    
    // Subjects
    chemistry: 'રસાયણ શાસ્ત્ર',
    mathematics: 'ગણિત',
    physics: 'ભૌતિક શાસ્ત્ર',
    computerScience: 'કોમ્પ્યુટર સાયન્સ',
    generalScience: 'સામાન્ય વિજ્ઞાન',
    biology: 'જીવ વિજ્ઞાન',
    generalMath: 'સામાન્ય ગણિત',
    algebra: 'બીજગણિત',
    geometry: 'ભૂમિતિ',
    calculus: 'કેલ્ક્યુલસ',
    programming: 'પ્રોગ્રામિંગ',
    robotics: 'રોબોટિક્સ',
    generalEngineering: 'સામાન્ય એન્જિનિયરિંગ',
    mechanicalEngineering: 'મિકેનિકલ એન્જિનિયરિંગ',
    civilEngineering: 'સિવિલ એન્જિનિયરિંગ',
    
    // Categories
    science: 'વિજ્ઞાન',
    technology: 'ટેકનોલોજી',
    engineering: 'એન્જિનિયરિંગ',
    selectSubject: 'વિષય પસંદ કરો',
    
    // Profile & Settings
    badges: 'બેજ',
    points: 'પોઇન્ટ્સ',
    completed: 'પૂર્ણ',
    achievements: 'સિદ્ધિઓ',
    weeklyProgress: 'સાપ્તાહિક પ્રગતિ',
    weeklyGoalCompleted: 'સાપ્તાહિક લક્ષ્યનું {percent}% પૂર્ણ',
    appearance: 'દેખાવ',
    darkMode: 'ડાર્ક મોડ',
    language: 'ભાષા',
    account: 'ખાતું',
    
    // Achievements
    mathWhiz: 'ગણિત નિષ્ણાત',
    mathWhizDesc: '100 ગણિત સમસ્યાઓ હલ કરી',
    scienceExplorer: 'વિજ્ઞાન સંશોધક',
    scienceExplorerDesc: '5 વિજ્ઞાન પ્રયોગો પૂર્ણ કર્યા',
    codingChampion: 'કોડિંગ ચેમ્પિયન',
    codingChampionDesc: '3 કોડિંગ પડકારો પૂર્ણ કર્યા',
    
    // Leaderboard
    searchStudent: 'વિદ્યાર્થી શોધો',
    all: 'બધા',
    subject: 'વિષય',
    grade: 'ગ્રેડ',
    viewProfile: 'પ્રોફાઇલ જુઓ',
    youRank: 'તમે - રેન્ક {rank}',
    
    // Common
    cancel: 'રદ કરો',
    save: 'સાચવો',
    edit: 'સંપાદિત કરો',
    delete: 'કાઢી નાખો',
    confirm: 'પુષ્ટિ કરો',
    loading: 'લોડ થઈ રહ્યું છે...',
    error: 'ભૂલ',
    success: 'સફળતા',
    
    // Logout
    logoutConfirm: 'શું તમે ખરેખર લોગઆઉટ કરવા માંગો છો?',
  }
  // Add more languages as needed
  // Add more languages as needed
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

interface AppContextType {
  theme: ThemeColors;
  isDarkMode: boolean;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [darkMode, lang] = await Promise.all([
        AsyncStorage.getItem('darkMode'),
        AsyncStorage.getItem('language')
      ]);

      if (darkMode !== null) {
        setIsDarkMode(JSON.parse(darkMode));
      }
      if (lang !== null && translations[lang as Language]) {
        setLanguageState(lang as Language);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('darkMode', JSON.stringify(newTheme));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem('language', lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let translation = translations[language][key] || translations.en[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, String(value));
      });
    }
    
    return translation;
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <AppContext.Provider
      value={{
        theme,
        isDarkMode,
        language,
        toggleTheme,
        setLanguage,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};