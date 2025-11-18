import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { db } from '../../firebase';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import EventCard from '../../components/EventCard.jsx';

export default function StudentSearch() {
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [status, setStatus] = useState('Upcoming');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [location, setLocation] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggle = (arr, setter, val) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const getDateMs = (e) => {
    if (e?.eventDate?.seconds) return e.eventDate.seconds * 1000;
    if (e?.eventDate) return Date.parse(e.eventDate);
    if (e?.dateTime) return Date.parse(e.dateTime);
    if (e?.startDate) return Date.parse(e.startDate);
    return null;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      // Firestore-side filters only for single-selects (optional)
      if (selectedTypes.length === 1) {
        q = query(q, where('eventType', '==', selectedTypes[0]));
      }
      if (selectedCategories.length === 1) {
        q = query(q, where('eventCategory', '==', selectedCategories[0]));
      }
      const snap = await getDocs(q);
      let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Client-side filters: status/approval/published
      rows = rows.filter((e) => {
        const statusOk = (e.status || 'Published').toLowerCase() === 'published';
        const approvalOk = (e.approvalStatus || 'approved') !== 'rejected';
        return statusOk && approvalOk;
      });

      // Department multi-select
      if (selectedDepartments.length) {
        rows = rows.filter((e) => selectedDepartments.includes(e.organizerDepartment));
      }
      // Type multi-select
      if (selectedTypes.length > 1) {
        rows = rows.filter((e) => selectedTypes.includes(e.eventType));
      }
      // Category multi-select
      if (selectedCategories.length > 1) {
        rows = rows.filter((e) => selectedCategories.includes(e.eventCategory));
      }
      // Location contains (venue or campus)
      if (location) {
        const term = location.toLowerCase();
        rows = rows.filter(
          (e) =>
            (e.venue || '').toLowerCase().includes(term) ||
            (e.campus || '').toLowerCase().includes(term)
        );
      }

      // Date range
      const toMs = toDate ? Date.parse(toDate) : null;
      const fromMs = fromDate ? Date.parse(fromDate) : null;
      rows = rows.filter((e) => {
        const dateMs = getDateMs(e);
        if (fromMs && dateMs && dateMs < fromMs) return false;
        if (toMs && dateMs && dateMs > toMs) return false;
        return true;
      });

      // Status filter
      const now = Date.now();
      const isSameDay = (ms) => {
        if (!ms) return false;
        const a = new Date(ms);
        const b = new Date();
        return (
          a.getFullYear() === b.getFullYear() &&
          a.getMonth() === b.getMonth() &&
          a.getDate() === b.getDate()
        );
      };
      rows = rows.filter((e) => {
        const ms = getDateMs(e);
        const upcoming = ms ? ms >= now : true;
        const past = ms ? ms < now : false;
        const ongoing = isSameDay(ms);
        if (status === 'Upcoming') return upcoming;
        if (status === 'Past') return past;
        if (status === 'Ongoing') return ongoing;
        return true; // All
      });

      setEvents(rows);
      setLoading(false);
    };
    load();
  }, [selectedDepartments, selectedTypes, selectedCategories, status, fromDate, toDate, location]);

  const cats = ['Seminar', 'Workshop', 'Sports', 'Cultural', 'Academic', 'Competition'];
  const types = ['Online', 'Offline', 'Hybrid'];
  const depts = ['Computer Science', 'Economics', 'Literature', 'Business', 'Mathematics'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search & Filter</Text>
      <Text style={styles.sectionTitle}>Department</Text>
      <View style={styles.chipRow}>
        {depts.map((d) => (
          <Pressable key={d} style={[styles.chip, selectedDepartments.includes(d) && styles.chipActive]} onPress={() => toggle(selectedDepartments, setSelectedDepartments, d)}><Text style={[styles.chipText, selectedDepartments.includes(d) && styles.chipTextActive]}>{d}</Text></Pressable>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Event Type</Text>
      <View style={styles.chipRow}>
        {types.map((t) => (
          <Pressable key={t} style={[styles.chip, selectedTypes.includes(t) && styles.chipActive]} onPress={() => toggle(selectedTypes, setSelectedTypes, t)}><Text style={[styles.chipText, selectedTypes.includes(t) && styles.chipTextActive]}>{t}</Text></Pressable>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.chipRow}>
        {cats.map((c) => (
          <Pressable key={c} style={[styles.chip, selectedCategories.includes(c) && styles.chipActive]} onPress={() => toggle(selectedCategories, setSelectedCategories, c)}><Text style={[styles.chipText, selectedCategories.includes(c) && styles.chipTextActive]}>{c}</Text></Pressable>
        ))}
      </View>
      <Text style={styles.sectionTitle}>Date Range</Text>
      <View style={styles.row}>
        <TextInput placeholder="From (YYYY-MM-DD)" value={fromDate} onChangeText={setFromDate} style={styles.input} />
        <Text style={{ marginHorizontal: 6 }}>to</Text>
        <TextInput placeholder="To (YYYY-MM-DD)" value={toDate} onChangeText={setToDate} style={styles.input} />
      </View>
      <Text style={styles.sectionTitle}>Location</Text>
      <TextInput placeholder="Campus or Venue" value={location} onChangeText={setLocation} style={styles.input} />
      <Text style={styles.sectionTitle}>Status</Text>
      <View style={styles.chipRow}>
        {['Upcoming','Ongoing','Past','All'].map((s) => (
          <Pressable key={s} style={[styles.chip, status===s && styles.chipActive]} onPress={() => setStatus(s)}><Text style={[styles.chipText, status===s && styles.chipTextActive]}>{s}</Text></Pressable>
        ))}
      </View>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <View style={{ gap: 8, marginTop: 12 }}>
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
          {!events.length && <Text>No events match your filters.</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  sectionTitle: { marginTop: 8, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  chipActive: { backgroundColor: '#0a7', borderColor: '#0a7' },
  chipText: { color: '#111' },
  chipTextActive: { color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginTop: 8 }
});