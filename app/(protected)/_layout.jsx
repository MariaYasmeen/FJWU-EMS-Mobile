import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext.jsx';
import Navbar from '../../src/components/Navbar.jsx';

export default function ProtectedLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) return <View style={styles.center}><Text>Loading...</Text></View>;
  if (!user) return <View style={styles.center}><Text>Redirecting…</Text></View>;

  return (
    <View style={styles.container}>
      <Navbar />
      <View style={styles.main}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  main: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});