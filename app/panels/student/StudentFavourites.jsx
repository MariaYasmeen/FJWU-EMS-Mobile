import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext.jsx';
import { db } from '../../firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import EventCard from '../../components/EventCard.jsx';

export default function StudentFavourites() {
  const { user } = useAuth();
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
      const events = docs.map((d) => ({ id: d.eventId || d.id, title: d.eventTitle, posterURL: d.eventImage, venue: d.venue, campus: d.campus, dateTime: d.dateTime, startTime: d.startTime, endTime: d.endTime, organizerName: d.organizerName }));
      setItems(events);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Events</Text>
      {items.length ? items.map((e) => <EventCard key={e.id} event={e} />) : <Text>No saved events yet.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});