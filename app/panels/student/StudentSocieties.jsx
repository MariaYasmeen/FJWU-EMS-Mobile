import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function StudentSocieties() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'manager'));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(list);
      } catch (e) {
        setError(e.message || 'Failed to load societies');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Societies</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {loading ? (
        <Text>Loading societies…</Text>
      ) : (
        <View style={styles.grid}>
          {items.map((s) => (
            <Pressable key={s.id} style={styles.card} onPress={() => router.push(`/society/${s.id}`)}>
              {s.logo ? (
                <Image source={{ uri: s.logo }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}><Text>🏛️</Text></View>
              )}
              <Text style={styles.name}>{s.societyName || s.organizerName || s.name || 'Unnamed Society'}</Text>
              <Text style={styles.desc}>{s.description || 'No description provided.'}</Text>
            </Pressable>
          ))}
          {!items.length && (
            <Text style={styles.muted}>No societies found.</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  error: { color: '#dc2626', marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  card: { width: '50%', padding: 6, alignItems: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  name: { color: '#0a7', fontWeight: '600', marginTop: 8 },
  desc: { color: '#6b7280', fontSize: 12, textAlign: 'center', marginTop: 4 },
  muted: { color: '#6b7280' }
});