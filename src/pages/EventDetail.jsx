import { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ActivityIndicator, Alert, Share, Linking, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { db } from '../firebase.js';
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc, increment, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext.jsx';


 


export default function EventDetail() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user, profile } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const isManager = profile?.role === 'manager';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'events', String(id)));
        if (!snap.exists()) {
          setError('Event not found');
          setEvent(null);
        } else {
          setEvent({ id: String(id), ...snap.data() });
        }
        const cQuery = query(collection(db, 'events', String(id), 'comments'), orderBy('createdAt', 'desc'));
        const cSnap = await getDocs(cQuery);
        setComments(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        setError(e.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const addToCalendarUrl = useMemo(() => {
    let startSource = event?.dateTime;
    if (!startSource && event?.eventDate) {
      const base = new Date(event.eventDate?.seconds ? event.eventDate.seconds * 1000 : event.eventDate);
      if (event?.startTime) {
        const [hh, mm] = String(event.startTime).split(':').map(Number);
        base.setHours(hh || 0, mm || 0, 0, 0);
      }
      startSource = base.toISOString();
    }
    if (!startSource) return '#';

    const start = new Date(startSource);
    const pad = (n) => String(n).padStart(2, '0');
    const y = start.getFullYear();
    const m = pad(start.getMonth() + 1);
    const d = pad(start.getDate());
    const hh = pad(start.getHours());
    const mm = pad(start.getMinutes());
    const ss = '00';
    const startStr = `${y}${m}${d}T${hh}${mm}${ss}`;
    const endObj = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const ye = endObj.getFullYear();
    const me = pad(endObj.getMonth() + 1);
    const de = pad(endObj.getDate());
    const hhe = pad(endObj.getHours());
    const mme = pad(endObj.getMinutes());
    const endStr = `${ye}${me}${de}T${hhe}${mme}${ss}`;
    const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const params = new URLSearchParams({
      text: event?.title || 'Event',
      details: event?.description || '',
      location: event?.venue || '',
      dates: `${startStr}/${endStr}`,
    });
    return `${base}&${params.toString()}`;
  }, [event]);

  const rsvp = async () => {
    try {
      await addDoc(collection(db, 'events', String(id), 'attendees'), {
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'events', String(id)), {
        attendeesCount: increment(1),
      });
      await setDoc(doc(db, 'registrations', user.uid, 'events', String(id)), {
        eventId: String(id),
        eventTitle: event?.title || '',
        eventImage: event?.posterURL || null,
        venue: event?.venue || null,
        campus: event?.campus || null,
        dateTime: event?.dateTime || (event?.eventDate?.seconds ? new Date(event.eventDate.seconds * 1000).toISOString() : (event?.eventDate || null)),
        startTime: event?.startTime || null,
        endTime: event?.endTime || null,
        organizerName: event?.organizerName || null,
        createdAt: serverTimestamp(),
      });
      Alert.alert('RSVP confirmed!');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to RSVP');
    }
  };

  const submitComment = async () => {
    if (!comment.trim()) return;
    try {
      await addDoc(collection(db, 'events', String(id), 'comments'), {
        uid: user.uid,
        text: comment.trim(),
        createdAt: serverTimestamp(),
      });
      try { await updateDoc(doc(db, 'events', String(id)), { commentsCount: increment(1) }); } catch {}
      setComment('');
      const cQuery = query(collection(db, 'events', String(id), 'comments'), orderBy('createdAt', 'desc'));
      const cSnap = await getDocs(cQuery);
      setComments(cSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to comment');
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (error) return <View style={styles.center}><Text style={{ color: 'red' }}>{error}</Text></View>;
  if (!event) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {event.posterURL ? (
        <Image source={{ uri: event.posterURL }} style={styles.poster} />
      ) : null}

      <Text style={styles.title}>{event?.title || 'Event'}</Text>
      {event?.description ? <Text style={styles.description}>{event.description}</Text> : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={rsvp}>
          <Text style={styles.btnText}>RSVP / Register</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => Linking.openURL(addToCalendarUrl)}>
          <Text style={styles.btnText}>Add to Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={async () => {
            try {
              await Share.share({ message: event?.title || 'Event' });
            } finally {
              try { await updateDoc(doc(db, 'events', String(id)), { sharesCount: increment(1) }); } catch {}
            }
          }}
        >
          <Text style={styles.btnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => Linking.openURL(`mailto:${event.organizerEmail || ''}`)}>
          <Text style={styles.btnText}>Contact Organizer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Comments</Text>
        <View style={styles.commentRow}>
          <TextInput
            style={styles.input}
            placeholder="Write a comment..."
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={submitComment}>
            <Text style={styles.btnText}>Post</Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 8 }}>
          {comments.length ? (
            comments.map((c) => (
              <View key={c.id} style={styles.commentItem}>
                <Text style={styles.commentText}>{c.text}</Text>
                <Text style={styles.commentMeta}>by {c.uid}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.commentEmpty}>No comments yet.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = {
  container: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  poster: { width: '100%', height: 200, resizeMode: 'cover', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  description: { fontSize: 14, color: '#333' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  primaryBtn: { backgroundColor: '#2563eb', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginRight: 8, marginBottom: 8 },
  secondaryBtn: { backgroundColor: '#64748b', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginRight: 8, marginBottom: 8 },
  btnText: { color: '#fff' },
  card: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#0b5e30', marginBottom: 8 },
  commentRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, marginRight: 8 },
  commentItem: { borderWidth: 1, borderColor: '#e5e7eb', padding: 8, marginBottom: 8 },
  commentText: { fontSize: 14 },
  commentMeta: { fontSize: 12, color: '#6b7280' },
  commentEmpty: { fontSize: 14, color: '#6b7280' },
};
