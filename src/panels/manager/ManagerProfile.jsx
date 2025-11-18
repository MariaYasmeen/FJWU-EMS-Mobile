import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { db } from '../../firebase';
import { doc, updateDoc, getDoc, serverTimestamp, collection, getDocs, query, where, setDoc, deleteDoc, increment } from 'firebase/firestore';

export default function ManagerProfile() {
  const { user, profile } = useAuth();
  const [societyName, setSocietyName] = useState(profile?.societyName || profile?.organizerName || '');
  const [description, setDescription] = useState(profile?.description || profile?.bio || '');
  const [email, setEmail] = useState(profile?.contactEmail || profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [category, setCategory] = useState(profile?.category || 'Cultural');
  const [foundedYear, setFoundedYear] = useState(profile?.foundedYear || '');
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState(profile?.logo || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [eventCount, setEventCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [events, setEvents] = useState([]);
  const [liking, setLiking] = useState(null);

  const [existing, setExisting] = useState(!!profile?.profileComplete);
  useEffect(() => {
    const checkExisting = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setExisting(!!snap.data().profileComplete);
        }
      } catch {}
    };
    if (user) checkExisting();
  }, [user]);

  useEffect(() => {
    const loadEventCount = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'events'), where('createdBy', '==', user.uid));
        const snap = await getDocs(q);
        setEventCount(snap.size);
        setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch {}
    };
    loadEventCount();
  }, [user]);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        societyName,
        organizerName: societyName,
        description,
        logo: logoUrl || null,
        contactEmail: email,
        phone,
        category,
        foundedYear: foundedYear ? Number(foundedYear) : null,
        profileComplete: true,
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
      });
      router.replace('/manager');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.logo} />
        ) : (
          <View style={styles.logoPlaceholder}><Text>🏛️</Text></View>
        )}
        <Text style={styles.title}>{societyName || 'Your Society Name'}</Text>
        <Text style={styles.meta}>{description || 'Your description or tagline'}</Text>
        <Text style={styles.meta}>{email || user?.email || ''}</Text>
        <Text style={styles.meta}>{category || 'Category'} · {eventCount} events conducted</Text>
        <Pressable style={styles.secondary} onPress={() => setEditing(true)}><Text>Edit Profile</Text></Pressable>
      </View>

      {editing && (
        <View style={styles.card}>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <TextInput placeholder="Logo URL" value={logoUrl} onChangeText={setLogoUrl} style={styles.input} />
          <TextInput placeholder="Society Name" value={societyName} onChangeText={setSocietyName} style={styles.input} />
          <TextInput placeholder="Category" value={category} onChangeText={setCategory} style={styles.input} />
          <TextInput placeholder="Description / Mission" multiline value={description} onChangeText={setDescription} style={[styles.input, { height: 100 }]} />
          <TextInput placeholder="Official Email" value={email} onChangeText={setEmail} style={styles.input} />
          <TextInput placeholder="Phone (optional)" value={phone} onChangeText={setPhone} style={styles.input} />
          <TextInput placeholder="Founded Year (optional)" value={String(foundedYear)} onChangeText={setFoundedYear} style={styles.input} />
          <View style={styles.actions}>
            <Pressable style={styles.primary} disabled={loading} onPress={onSubmit}><Text style={styles.primaryText}>{loading ? 'Saving...' : 'Save Profile'}</Text></Pressable>
            <Pressable style={styles.secondary} onPress={() => setEditing(false)}><Text>Cancel</Text></Pressable>
          </View>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.subtitle}>Events by this society</Text>
        {!events.length && <Text style={styles.meta}>No events yet.</Text>}
        {events.map((ev) => (
          <Pressable key={ev.id} style={styles.eventItem} onPress={() => router.push(`/events/${ev.id}`)}>
            {ev.posterURL ? (
              <Image source={{ uri: ev.posterURL }} style={styles.eventImg} />
            ) : (
              <View style={[styles.eventImg, styles.eventPlaceholder]}><Text>No Image</Text></View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600' }}>{ev.title || 'Event'}</Text>
              <Text style={styles.meta}>{typeof ev.likesCount === 'number' ? ev.likesCount : 0} likes</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, backgroundColor: '#fff', marginBottom: 12 },
  logo: { width: 96, height: 96, borderRadius: 48, alignSelf: 'center' },
  logoPlaceholder: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  title: { fontSize: 20, fontWeight: '600', color: '#0a7', marginTop: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  meta: { color: '#555', marginTop: 4, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  primary: { backgroundColor: '#111', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  primaryText: { color: '#fff', fontWeight: '600' },
  secondary: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'center', marginTop: 8 },
  eventItem: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  eventImg: { width: 64, height: 64, borderRadius: 8 },
  eventPlaceholder: { backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  error: { color: '#dc2626' }
});