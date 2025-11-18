import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext.jsx';
import { db } from '../../firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import EventCard from '../../components/EventCard.jsx';

export default function Favourites() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const base = collection(db, 'favourites', user.uid, 'savedPosts');
      const q = query(base);
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Map saved post snapshot to EventCard-friendly shape
      const events = docs.map((d) => ({
        id: d.eventId || d.id,
        title: d.eventTitle,
        posterURL: d.eventImage,
        venue: d.venue,
        campus: d.campus,
        dateTime: d.dateTime,
        startTime: d.startTime,
        endTime: d.endTime,
        organizerName: d.organizerName,
      }));
      setItems(events);
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Posts</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <View style={{ gap: 8 }}>
          {items.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
          {!items.length && (
            <Text style={styles.muted}>No saved posts yet.</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  muted: { color: '#6b7280' }
});