import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [roleTab, setRoleTab] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login, message } = useAuth();
  const router = useRouter();

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login({ email, password, role: roleTab });
      router.replace('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {(error || message) && <Text style={styles.error}>{error || message}</Text>}
      <View style={styles.roleRow}>
        <Pressable onPress={() => setRoleTab('student')} style={[styles.roleBtn, roleTab==='student' && styles.roleActive]}><Text style={[styles.roleText, roleTab==='student' && styles.roleTextActive]}>Student</Text></Pressable>
        <Pressable onPress={() => setRoleTab('manager')} style={[styles.roleBtn, roleTab==='manager' && styles.roleActive]}><Text style={[styles.roleText, roleTab==='manager' && styles.roleTextActive]}>Event Manager</Text></Pressable>
      </View>
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <Pressable onPress={onSubmit} style={styles.button} disabled={loading}><Text style={styles.buttonText}>{loading ? 'Signing in…' : 'Sign in'}</Text></Pressable>
      <Pressable onPress={() => router.push('/signup')} style={styles.link}><Text style={styles.linkText}>Create an account</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 12 },
  error: { color: '#dc2626', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 10 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  roleBtn: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  roleActive: { borderColor: '#111' },
  roleText: { color: '#555' },
  roleTextActive: { color: '#111', fontWeight: '600' },
  button: { backgroundColor: '#111', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
  link: { marginTop: 12, alignItems: 'center' },
  linkText: { color: '#2563eb' }
});
