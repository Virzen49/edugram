import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Switch, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useApp, Language } from '@/contexts/AppContext';
import { Globe, Moon, Sun, LogOut, GraduationCap, Users } from 'lucide-react-native';

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

interface TeacherProfile {
	name: string;
	photoUrl?: string;
	university?: string;
	department?: string;
	email?: string;
	phone?: string;
	classes: string[];
}

export default function TeacherSettingsScreen() {
	const router = useRouter();
	const { theme, isDarkMode, toggleTheme, language, setLanguage, t } = useApp();
	const [showLanguageSelector, setShowLanguageSelector] = useState(false);
	const [profile, setProfile] = useState<TeacherProfile>({
		name: 'Your Name',
		photoUrl: undefined,
		university: 'University / Institute',
		department: 'Department',
		email: 'teacher@example.com',
		phone: '+91-00000-00000',
		classes: ['10A', '11B', '9C'],
	});

	useEffect(() => {
		// Try to load cached user profile if present
		(async () => {
			try {
				const raw = await AsyncStorage.getItem('user');
				if (raw) {
					const u = JSON.parse(raw);
					setProfile((p) => ({
						...p,
						name: u?.name || u?.fullName || p.name,
						email: u?.email || p.email,
						photoUrl: u?.avatar || u?.photoUrl || p.photoUrl,
						university: u?.university || p.university,
						department: u?.department || p.department,
						classes: Array.isArray(u?.classes) ? u.classes : p.classes,
					}));
				}
			} catch {}
		})();
	}, []);

	const handleLogout = () => {
		Alert.alert(
			t('logout'),
			t('logoutConfirm'),
			[
				{ text: t('cancel'), style: 'cancel' },
				{
					text: t('logout'),
					style: 'destructive',
					onPress: async () => {
						try {
							await AsyncStorage.removeItem('token');
							await AsyncStorage.removeItem('user');
							router.replace('/(auth)/login');
						} catch (e) {}
					},
				},
			]
		);
	};

	const selectedLang = LANGUAGES.find((l) => l.code === language);

	return (
		<ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={{ paddingBottom: 32 }}>
			{/* Profile Header */}
			<View style={[styles.card, { backgroundColor: theme.surface }]}>
				<View style={styles.profileHeader}>
					{profile.photoUrl ? (
						<Image source={{ uri: profile.photoUrl }} style={styles.avatar} />
					) : (
						<View style={[styles.avatar, { backgroundColor: theme.primary + '33' }]}> 
							<Text style={[styles.avatarInitial, { color: theme.primary }]}>{profile.name?.charAt(0) || '?'}</Text>
						</View>
					)}
					<View style={{ flex: 1 }}>
						<Text style={[styles.name, { color: theme.text }]}>{profile.name}</Text>
						<View style={styles.row}>
							<GraduationCap size={16} color={theme.textSecondary} />
							<Text style={[styles.subtle, { color: theme.textSecondary }]}>{profile.university}</Text>
						</View>
						<Text style={[styles.subtle, { color: theme.textSecondary }]}>{profile.department}</Text>
						<Text style={[styles.subtle, { color: theme.textSecondary, marginTop: 6 }]}>{profile.email}</Text>
						<Text style={[styles.subtle, { color: theme.textSecondary }]}>{profile.phone}</Text>
					</View>
				</View>

				{/* Classes */}
				<View style={styles.classesBlock}>
					<View style={styles.classesHeader}>
						<Users size={16} color={theme.textSecondary} />
						<Text style={[styles.classesTitle, { color: theme.text }]}>{t('classes') || 'Classes'}</Text>
					</View>
					<View style={styles.chipsRow}>
						{profile.classes.map((c) => (
							<View key={c} style={[styles.chip, { borderColor: theme.border }]}> 
								<Text style={[styles.chipText, { color: theme.text }]}>{c}</Text>
							</View>
						))}
					</View>
				</View>
			</View>

			{/* Language Section */}
			<View style={styles.section}>
				<Text style={[styles.sectionTitle, { color: theme.text }]}>{t('language')}</Text>
				<View style={[styles.card, { backgroundColor: theme.surface }]}> 
					<TouchableOpacity style={styles.settingItem} onPress={() => setShowLanguageSelector(!showLanguageSelector)}>
						<View style={styles.settingLeft}>
							<Globe size={20} color={theme.text} />
							<View>
								<Text style={[styles.text, { color: theme.text }]}>{t('language')}</Text>
								<Text style={[styles.languageSubtext, { color: theme.textSecondary }]}>
									{selectedLang?.nativeName} ({selectedLang?.name})
								</Text>
							</View>
						</View>
					</TouchableOpacity>

					{showLanguageSelector && (
						<View style={[styles.languageList, { borderTopColor: theme.border }]}> 
							{LANGUAGES.map((lang) => (
								<TouchableOpacity
									key={lang.code}
									style={[
										styles.languageItem,
										language === lang.code && [styles.selectedLanguageItem, { backgroundColor: theme.primary + '20' }],
									]}
									onPress={() => setLanguage(lang.code as Language)}
								>
									<Text
										style={[
											{ color: theme.text },
											language === lang.code && { color: theme.primary, fontWeight: '600' },
										]}
									>
										{lang.nativeName} ({lang.name})
									</Text>
								</TouchableOpacity>
							))}
						</View>
					)}
				</View>
			</View>

			{/* Appearance Section */}
			<View style={styles.section}>
				<Text style={[styles.sectionTitle, { color: theme.text }]}>{t('appearance')}</Text>
				<View style={[styles.card, { backgroundColor: theme.surface }]}> 
					<View style={styles.settingItem}>
						<View style={styles.settingLeft}>
							{isDarkMode ? <Moon size={20} color={theme.text} /> : <Sun size={20} color={theme.text} />}
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

			{/* Logout Section */}
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
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	card: {
		borderRadius: 16,
		padding: 16,
		margin: 20,
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowRadius: 6,
		elevation: 2,
	},
	profileHeader: { flexDirection: 'row', gap: 16, alignItems: 'center' },
	avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#EEE' },
	avatarInitial: { fontSize: 36, fontWeight: '800' },
	name: { fontSize: 22, fontWeight: '700' },
	row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
	subtle: { fontSize: 14 },
	classesBlock: { marginTop: 16 },
	classesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
	classesTitle: { fontSize: 16, fontWeight: '700' },
	chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
	chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
	chipText: { fontSize: 12, fontWeight: '600' },
	section: { marginTop: 8 },
	sectionTitle: { fontSize: 18, fontWeight: '700', marginHorizontal: 20, marginBottom: 12 },
	settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 14 },
	settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
	text: { fontSize: 16, fontWeight: '500' },
	languageSubtext: { fontSize: 13, marginTop: 2 },
	languageList: { borderTopWidth: 1, paddingTop: 8 },
	languageItem: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, marginHorizontal: 8, marginBottom: 4 },
	selectedLanguageItem: { borderRadius: 8 },
	logoutItem: { borderTopWidth: 0 },
	logoutText: { fontSize: 16, color: '#DC2626', fontWeight: '600' },
});


