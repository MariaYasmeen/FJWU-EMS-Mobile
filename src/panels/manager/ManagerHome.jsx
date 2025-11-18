import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import EventFeed from '../../components/EventFeed.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ManagerHome() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { user, profile } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalEvents: 0, upcomingEvents: 0, totalRsvps: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (profile && profile.role === 'manager' && !profile.profileComplete) {
      // Prompt to create profile
    }
  }, [profile]);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((e) => e.createdBy === user.uid);

      const totalEvents = rows.length;
      const now = Date.now();
      const upcomingEvents = rows.filter((e) => {
        if (e.startDate?.seconds) return e.startDate.seconds * 1000 > now && e.status !== 'Cancelled';
        if (e.dateTime) return Date.parse(e.dateTime) > now && e.status !== 'Cancelled';
        return false;
      }).length;
      const totalRsvps = rows.reduce((sum, e) => sum + (e.attendeesCount || 0), 0);
      setStats({ totalEvents, upcomingEvents, totalRsvps });

      setRecent(rows.slice(0, 5));
    };
    loadStats();
  }, [user]);

  const handleSidebarChange = (key) => {
    if (key === 'manager_profile') return router.push('/manager/profile');
    if (key === 'create_event') {
      if (!profile?.profileComplete) {
        Alert.alert('Profile Required', 'Please create your society profile before creating events.');
        return;
      }
      return router.push('/manager/create-event');
    }
    if (key === 'manager_events') return setFilter('manager_events');
    if (key === 'analytics') return router.push('/manager/analytics');
    if (key === 'announcements') return router.push('/manager/announcements');
    if (key === 'settings') return router.push('/manager/settings');
    setFilter(key);
  };

  return (
    <View style={styles.container}>
      {!profile?.profileComplete ? (
        <Pressable style={styles.primary} onPress={() => router.push('/manager/profile')}><Text style={styles.primaryText}>Start Creating Your Society Profile</Text></Pressable>
      ) : null}
      <View style={styles.row}>
        <Pressable style={styles.primary} disabled={!profile?.profileComplete} onPress={() => router.push('/manager/create-event')}>
          <Text style={styles.primaryText}>Create New Event</Text>
        </Pressable>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.card}><Text>Total Events</Text><Text style={styles.stat}>{stats.totalEvents}</Text></View>
        <View style={styles.card}><Text>Upcoming</Text><Text style={styles.stat}>{stats.upcomingEvents}</Text></View>
        <View style={styles.card}><Text>Total RSVPs</Text><Text style={styles.stat}>{stats.totalRsvps}</Text></View>
      </View>
      <Text style={styles.sectionTitle}>Your Events</Text>
      <EventFeed filter={'manager_events'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', marginVertical: 8 },
  primary: { backgroundColor: '#0a7', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  primaryText: { color: '#fff', fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  card: { flex: 1, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fff', borderRadius: 12, padding: 12 },
  stat: { fontSize: 22, fontWeight: '700', color: '#0a7' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginVertical: 8 }
});
