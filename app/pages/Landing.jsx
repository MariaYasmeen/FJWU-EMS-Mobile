import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext.jsx';

export default function Landing() {
  const { profile } = useAuth();
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(profile?.role === 'manager' ? '/manager' : '/student');
    }, 1200);
    return () => clearTimeout(timer);
  }, [profile]);

  return (
    <View style={styles.center}>
      <View style={styles.card}>
        <Text style={styles.title}>You are logged in</Text>
        <Text style={styles.subtitle}>Redirecting to your home...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '600', color: '#0a7' },
  subtitle: { color: '#555', marginTop: 8 }
});