import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { db } from '../../firebase';
import { collection, getDocs, orderBy, query, doc, deleteDoc } from 'firebase/firestore';

export default function YourEvents() {
  const { user } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('all'); // all | upcoming | past | drafts
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((e) => e.createdBy === user.uid);
      const now = Date.now();
      let filtered = all;
      if (filter === 'upcoming') filtered = all.filter((e) => (e.startDate?.seconds ? e.startDate.seconds * 1000 : Date.parse(e.dateTime || 0)) > now);
      if (filter === 'past') filtered = all.filter((e) => (e.startDate?.seconds ? e.startDate.seconds * 1000 : Date.parse(e.dateTime || 0)) <= now);
      if (filter === 'drafts') filtered = all.filter((e) => (e.status || '').toLowerCase() === 'draft');
      setRows(filtered);
      setLoading(false);
    };
    load();
  }, [user, filter]);

  const onDelete = async (id) => {
    await deleteDoc(doc(db, 'events', id));
    setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.rowBetween}>
        <Text style={styles.title}>Your Events</Text>
        <Pressable style={styles.primary} onPress={() => router.push('/manager/create-event')}><Text style={styles.primaryText}>Create Event</Text></Pressable>
      </View>
      <View style={styles.row}>
        {['all','upcoming','past','drafts'].map((k) => (
          <Pressable key={k} style={[styles.chip, filter===k && styles.chipActive]} onPress={() => setFilter(k)}><Text style={[styles.chipText, filter===k && styles.chipTextActive]}>{k[0].toUpperCase()+k.slice(1)}</Text></Pressable>
        ))}
      </View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <View style={styles.list}>
          {rows.map((e) => (
            <View key={e.id} style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600' }}>{e.title}</Text>
                <Text style={styles.meta}>{e.startDate?.seconds ? new Date(e.startDate.seconds*1000).toLocaleString() : e.dateTime}</Text>
                <Text style={styles.meta}>{e.status || 'Published'}</Text>
              </View>
              <KebabMenu
                onView={() => router.push(`/events/${e.id}`)}
                onEdit={() => router.push(`/manager/events/${e.id}/edit`)}
                onDelete={() => onDelete(e.id)}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function KebabMenu({ onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable style={styles.kebab} onPress={() => setOpen((v) => !v)} accessibilityLabel="Actions"><Text>⋮</Text></Pressable>
      {open && (
        <View style={styles.menu}>
          <Pressable style={styles.menuItem} onPress={() => { setOpen(false); onView(); }}><Text>View</Text></Pressable>
          <Pressable style={styles.menuItem} onPress={() => { setOpen(false); onEdit(); }}><Text>Edit</Text></Pressable>
          <Pressable style={styles.menuItem} onPress={() => { setOpen(false); onDelete(); }}><Text style={{ color: '#dc2626' }}>Delete</Text></Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '600' },
  primary: { backgroundColor: '#111', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  primaryText: { color: '#fff' },
  chip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: '#0a7', borderColor: '#0a7' },
  chipText: { color: '#111' },
  chipTextActive: { color: '#fff' },
  list: { gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10 },
  meta: { color: '#555' },
  kebab: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#eee' },
  menu: { position: 'absolute', right: 0, top: 36, width: 160, borderWidth: 1, borderColor: '#eee', borderRadius: 12, backgroundColor: '#fff', paddingVertical: 8 },
  menuItem: { paddingVertical: 8, paddingHorizontal: 12 }
});