import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, updateDoc, increment, addDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function EventCard({ event }) {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [toast, setToast] = useState('');
  const [organizerLogo, setOrganizerLogo] = useState('');
  const [showManagerMenu, setShowManagerMenu] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const organizerId = event.organizerId || event.createdBy || null;
  const organizerName = event.organizerName || '';

  useEffect(() => {
    const loadCounts = async () => {
      // Prefer persisted likesCount on event doc; fallback to counting subcollection
      let initialLikes = typeof event.likesCount === 'number' ? event.likesCount : null;
      if (initialLikes == null) {
        const likesCol = collection(db, 'events', event.id, 'likes');
        const likesSnap = await getDocs(likesCol);
        initialLikes = likesSnap.size;
      }
      setLikesCount(initialLikes || 0);

      const myLike = await getDoc(doc(db, 'events', event.id, 'likes', user.uid));
      setLiked(myLike.exists());

      const myFav = await getDoc(doc(db, 'favourites', user.uid, 'savedPosts', event.id));
      setSaved(myFav.exists());
    };
    if (user) loadCounts();
  }, [user, event.id, event.likesCount]);

  useEffect(() => {
    const loadOrganizer = async () => {
      if (!organizerId) return;
      try {
        const snap = await getDoc(doc(db, 'users', organizerId));
        if (snap.exists()) {
          const data = snap.data();
          setOrganizerLogo(data.logo || data.photoURL || '');
        }
      } catch {}
    };
    loadOrganizer();
  }, [organizerId]);

  const toggleLike = async (e) => {
    e?.stopPropagation?.();
    if (!user) return;
    const likeRef = doc(db, 'events', event.id, 'likes', user.uid);
    const snap = await getDoc(likeRef);
    if (snap.exists()) {
      await deleteDoc(likeRef);
      setLiked(false);
      setLikesCount((c) => Math.max(0, c - 1));
      try { await updateDoc(doc(db, 'events', event.id), { likesCount: increment(-1) }); } catch {}
    } else {
      await setDoc(likeRef, { uid: user.uid });
      setLiked(true);
      setLikesCount((c) => c + 1);
      try { await updateDoc(doc(db, 'events', event.id), { likesCount: increment(1) }); } catch {}
    }
    // Ensure sync with Firestore after toggle
    try {
      const evSnap = await getDoc(doc(db, 'events', event.id));
      if (evSnap.exists()) {
        const val = evSnap.data().likesCount;
        if (typeof val === 'number') setLikesCount(val);
      }
    } catch {}
  };

  const toggleSave = async (e) => {
    e?.stopPropagation?.();
    const favRef = doc(db, 'favourites', user.uid, 'savedPosts', event.id);
    const snap = await getDoc(favRef);
    if (snap.exists()) {
      await deleteDoc(favRef);
      setSaved(false);
    } else {
      const dateIso = event.dateTime || (event.eventDate?.seconds ? new Date(event.eventDate.seconds*1000).toISOString() : (event.eventDate || null));
      await setDoc(favRef, {
        eventId: event.id,
        eventTitle: event.title,
        eventImage: event.posterURL || null,
        venue: event.venue || null,
        campus: event.campus || null,
        dateTime: dateIso,
        startTime: event.startTime || null,
        endTime: event.endTime || null,
        organizerName: event.organizerName || null,
        createdAt: serverTimestamp(),
      });
      setSaved(true);
    }
  };

  const register = async () => {
    if (!user) return;
    setRegistering(true);
    setToast('');
    try {
      await addDoc(collection(db, 'events', event.id, 'attendees'), { uid: user.uid, createdAt: serverTimestamp() });
      await updateDoc(doc(db, 'events', event.id), { attendeesCount: increment(1) });
      const dateIso = event.dateTime || (event.eventDate?.seconds ? new Date(event.eventDate.seconds*1000).toISOString() : (event.eventDate || null));
      await setDoc(doc(db, 'registrations', user.uid, 'events', event.id), {
        eventId: event.id,
        eventTitle: event.title || '',
        eventImage: event.posterURL || null,
        venue: event.venue || null,
        campus: event.campus || null,
        dateTime: dateIso,
        startTime: event.startTime || null,
        endTime: event.endTime || null,
        organizerName: event.organizerName || null,
        createdAt: serverTimestamp(),
      });
      setToast('Registered successfully');
      setTimeout(() => setToast(''), 2000);
    } catch (e) {
      setToast(e.message || 'Failed to register');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setRegistering(false);
    }
  };

  const dateStr = event.dateTime
    ? new Date(event.dateTime).toLocaleString()
    : (event.eventDate?.seconds
      ? new Date(event.eventDate.seconds * 1000).toLocaleString()
      : (event.eventDate ? new Date(event.eventDate).toLocaleString() : ''));

  const createdMs = (event.createdAt?.seconds ? event.createdAt.seconds * 1000 : (event.createdAt ? Date.parse(event.createdAt) : null))
    || (event.dateTime ? Date.parse(event.dateTime) : null)
    || (event.eventDate?.seconds ? event.eventDate.seconds * 1000 : (event.eventDate ? Date.parse(event.eventDate) : null));
  const postedAgo = (() => {
    if (!createdMs) return '';
    const diff = Date.now() - createdMs;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  })();

  const canManage = profile?.role === 'manager' && user?.uid && (event.createdBy === user.uid);

  const handleDelete = async () => {
    if (!canManage) return;
    Alert.alert('Delete', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(db, 'events', event.id));
            setDeleted(true);
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to delete');
          }
        }
      }
    ]);
  };

  const handleEdit = () => {
    if (!canManage) return;
    router.push(`/manager/events/${event.id}/edit`);
  };

  return (
    deleted ? null : (
      <Pressable onPress={() => router.push(`/events/${event.id}`)} style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title}>{event.title || 'Event'}</Text>
          <Pressable onPress={() => toggleSave()} style={styles.saveBtn}>
            <Text style={styles.saveText}>{saved ? 'Saved' : 'Save'}</Text>
          </Pressable>
        </View>
        {!!event.posterURL && <View style={{ height: 8 }} />}
        {!!event.venue && <Text style={styles.meta}>{event.venue}</Text>}
        {!!event.dateTime && <Text style={styles.meta}>{dateStr}</Text>}
        {!!toast && <Text style={styles.toast}>{toast}</Text>}
      </Pressable>
    )
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff', borderRadius: 12, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#555', marginTop: 4 },
  saveBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#111' },
  saveText: { color: '#fff' },
  toast: { color: '#0a7', marginTop: 6 }
});