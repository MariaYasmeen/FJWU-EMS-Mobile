import { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext.jsx';
import { db } from '../firebase.js';
import { doc, getDoc, collection, getDocs, query, where, updateDoc, increment, setDoc, deleteDoc } from 'firebase/firestore';
import { Feather } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#dc2626' },
  header: { alignItems: 'center', paddingVertical: 16 },
  avatar: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarEmoji: { fontSize: 40 },
  title: { fontSize: 22, fontWeight: '600', color: '#0c7d56', marginTop: 12 },
  description: { fontSize: 14, color: '#111827', marginTop: 6, textAlign: 'center' },
  meta: { fontSize: 12, color: '#374151', marginTop: 2 },
  section: { paddingVertical: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  empty: { fontSize: 14, color: '#6b7280', paddingHorizontal: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  card: { width: '33.333%', padding: 4, position: 'relative' },
  poster: { width: '100%', aspectRatio: 1, borderRadius: 6, backgroundColor: '#e5e7eb' },
  noImage: { width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e7eb', borderRadius: 6 },
  noImageText: { color: '#9ca3af' },
  overlay: { position: 'absolute', left: 4, right: 4, bottom: 8, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', paddingVertical: 6, borderRadius: 6 },
  stat: { flexDirection: 'row', alignItems: 'center' },
  statText: { color: '#fff', fontSize: 12, marginLeft: 4 }
});

export default function SocietyProfile() {
  const { uid } = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [society, setSociety] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liking, setLiking] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const sSnap = await getDoc(doc(db, 'users', String(uid)));
        if (!sSnap.exists()) {
          setError('Society not found');
        } else {
          setSociety(sSnap.data());
        }
        const eQ = query(collection(db, 'events'), where('createdBy', '==', String(uid)));
        const eSnap = await getDocs(eQ);
        const base = eSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const withCounts = await Promise.all(base.map(async (ev) => {
          try {
            const cSnap = await getDocs(collection(db, 'events', ev.id, 'comments'));
            return { ...ev, commentsCount: cSnap.size };
          } catch {
            return { ...ev, commentsCount: typeof ev.commentsCount === 'number' ? ev.commentsCount : 0 };
          }
        }));
        setEvents(withCounts);
      } catch (e) {
        setError(e.message || 'Failed to load society');
      } finally {
        setLoading(false);
      }
    };
    if (uid) load();
  }, [uid]);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (error) return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;

  const toggleLike = async (ev) => {
    if (!profile?.uid) return;
    setLiking(ev.id);
    try {
      const likeDocRef = doc(db, 'events', ev.id, 'likes', profile.uid);
      const snap = await getDoc(likeDocRef);
      if (snap.exists()) {
        await deleteDoc(likeDocRef);
        await updateDoc(doc(db, 'events', ev.id), { likesCount: increment(-1) });
        setEvents((rows) => rows.map((row) => row.id === ev.id ? { ...row, likesCount: Math.max(0, (row.likesCount || 0) - 1) } : row));
      } else {
        await setDoc(likeDocRef, { uid: profile.uid });
        await updateDoc(doc(db, 'events', ev.id), { likesCount: increment(1) });
        setEvents((rows) => rows.map((row) => row.id === ev.id ? { ...row, likesCount: (row.likesCount || 0) + 1 } : row));
      }
    } catch {}
    setLiking(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {society?.logo || society?.photoURL ? (
            <Image source={{ uri: society.logo || society.photoURL }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarEmoji}>🏛️</Text>
          )}
        </View>
        <Text style={styles.title}>{society?.societyName || society?.organizerName || 'Society'}</Text>
        <Text style={styles.description}>{society?.description || 'No description'}</Text>
        <Text style={styles.meta}>{society?.category || 'Category'} · {events.length} events conducted</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Events</Text>
        {!events.length ? (
          <Text style={styles.empty}>No events yet.</Text>
        ) : (
          <View style={styles.grid}>
            {events.map((ev) => (
              <TouchableOpacity
                key={ev.id}
                style={styles.card}
                onPress={() => router.push(`/events/${ev.id}`)}
              >
                {ev.posterURL ? (
                  <Image source={{ uri: ev.posterURL }} style={styles.poster} />
                ) : (
                  <View style={styles.noImage}><Text style={styles.noImageText}>No image</Text></View>
                )}
                <View style={styles.overlay}>
                  <TouchableOpacity style={styles.stat} onPress={() => toggleLike(ev)} disabled={liking === ev.id}>
                    <Feather name="heart" size={18} color="#fff" />
                    <Text style={styles.statText}>{typeof ev.likesCount === 'number' ? ev.likesCount : 0}</Text>
                  </TouchableOpacity>
                  <View style={styles.stat}>
                    <Feather name="message-circle" size={18} color="#fff" />
                    <Text style={styles.statText}>{typeof ev.commentsCount === 'number' ? ev.commentsCount : 0}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Feather name="share-2" size={18} color="#fff" />
                    <Text style={styles.statText}>{typeof ev.sharesCount === 'number' ? ev.sharesCount : 0}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}