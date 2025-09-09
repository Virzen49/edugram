import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { ArrowLeft, Moon, Sun, Globe, LogOut, ChevronRight } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp, Language, translations } from '@/contexts/AppContext';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

export default function SettingsScreen() {
  const { theme, isDarkMode, language, toggleTheme, setLanguage, t } = useApp();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const router = useRouter();



  const selectLanguage = async (languageCode: Language) => {
    try {
      await setLanguage(languageCode);
      setShowLanguageSelector(false);
    } catch (error) {
      console.error('Error saving language setting:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logoutConfirm'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove token from storage
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              // Navigate to login page
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const selectedLang = LANGUAGES.find(lang => lang.code === language);



  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('settings')}</Text>
      </View>

      <View style={styles.content}>
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('appearance')}</Text>
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                {isDarkMode ? (
                  <Moon size={20} color={theme.text} />
                ) : (
                  <Sun size={20} color={theme.text} />
                )}
                <Text style={[styles.text, { color: theme.text }]}>{t('darkMode')}</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#E5E7EB', true: '#22C55E' }}
                thumbColor={isDarkMode ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('language')}</Text>
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setShowLanguageSelector(!showLanguageSelector)}
            >
              <View style={styles.settingLeft}>
                <Globe size={20} color={theme.text} />
                <View>
                  <Text style={[styles.text, { color: theme.text }]}>{t('language')}</Text>
                  <Text style={[styles.languageSubtext, { color: theme.textSecondary }]}>
                    {selectedLang?.nativeName} ({selectedLang?.name})
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            {showLanguageSelector && (
              <View style={[styles.languageList, { borderTopColor: theme.border }]}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageItem,
                      language === lang.code && [styles.selectedLanguageItem, { backgroundColor: theme.primary + '20' }]
                    ]}
                    onPress={() => selectLanguage(lang.code as Language)}
                  >
                    <Text style={[
                      { color: theme.text },
                      language === lang.code && { color: theme.primary, fontWeight: '600' }
                    ]}>
                      {lang.nativeName} ({lang.name})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('account')}</Text>
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
              <View style={styles.settingLeft}>
                <LogOut size={20} color="#DC2626" />
                <Text style={styles.logoutText}>{t('logout')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#E5E7EB',
  },
  card: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
  textDark: {
    color: '#FFFFFF',
  },
  languageSubtext: {
    fontSize: 14,
    marginTop: 2,
  },
  languageList: {
    borderTopWidth: 1,
    paddingTop: 8,
  },
  languageItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 4,
  },
  selectedLanguageItem: {
    borderRadius: 8,
  },
  selectedLanguageText: {
    fontWeight: '600',
  },
  logoutItem: {
    borderTopWidth: 0,
  },
  logoutText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
  },
});