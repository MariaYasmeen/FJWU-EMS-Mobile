import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Image } from 'react-native';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function ManagerSocieties() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'manager'));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(list);
      } catch (e) {
        setError(e?.message || 'Failed to load societies');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading societies…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Societies</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {items.map((s) => (
        <Pressable key={s.id} style={styles.card} onPress={() => router.push(`/society/${s.id}`)}>
          <View style={styles.logoWrap}>
            {s.logo ? (
              <Image source={{ uri: s.logo }} style={styles.logo} />
            ) : (
              <Text style={styles.emoji}>🏛️</Text>
            )}
          </View>
          <Text style={styles.name}>{s.societyName || s.organizerName || s.name || 'Unnamed Society'}</Text>
          <Text style={styles.desc}>{s.description || 'No description provided.'}</Text>
        </Pressable>
      ))}
      {!items.length && <Text style={styles.empty}>No societies found.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 8, color: '#6b7280' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  error: { color: '#dc2626', marginBottom: 8, fontSize: 12 },
  card: { backgroundColor: '#fff', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  logoWrap: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', overflow: 'hidden', alignSelf: 'center' },
  logo: { width: '100%', height: '100%' },
  emoji: { fontSize: 32 },
  name: { marginTop: 8, color: '#047857', fontWeight: '600', textAlign: 'center' },
  desc: { marginTop: 4, fontSize: 12, color: '#4b5563', textAlign: 'center' },
  empty: { fontSize: 12, color: '#6b7280' }
});