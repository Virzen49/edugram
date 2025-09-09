import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useState } from 'react';
import { colors } from '@/constants/colors';

export default function QuickQuizScreen() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState<number | null>(null);
  const [summary, setSummary] = useState<string>('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Quiz</Text>
      <TextInput style={styles.input} value={question} onChangeText={setQuestion} placeholder="Enter question" placeholderTextColor={colors.textMuted} />
      {options.map((opt, idx) => (
        <TextInput key={idx} style={styles.input} value={opt} onChangeText={(t)=>{
          const copy = [...options]; copy[idx]=t; setOptions(copy);
        }} placeholder={`Option ${idx+1}`} placeholderTextColor={colors.textMuted} />
      ))}
      <View style={{ height: 6 }} />
      <View style={styles.answerRow}>
        <Text style={{ color: colors.text }}>Correct option (1-4):</Text>
        <TextInput style={[styles.inputSmall]} keyboardType="numeric" maxLength={1} onChangeText={(t)=> setAnswer(Number(t)||null)} />
      </View>
      <Pressable style={styles.primaryBtn} onPress={() => setSummary(`Saved! Q: ${question.slice(0,30)}… Answer: ${answer}`)}><Text style={styles.primaryText}>Save</Text></Pressable>
      {summary ? <Text style={styles.summary}>{summary}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, color: colors.text, marginBottom: 8 },
  answerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  inputSmall: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 8, width: 60, color: colors.text },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  primaryText: { color: '#FFFFFF', fontWeight: '700' },
  summary: { color: colors.textMuted, marginTop: 10 },
});


