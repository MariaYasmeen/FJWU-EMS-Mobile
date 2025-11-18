import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import EventFeed from '../../components/EventFeed.jsx';

export default function StudentEvents() {
  const [tab, setTab] = useState('upcoming');
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable style={[styles.tab, tab==='upcoming' && styles.tabActive]} onPress={() => setTab('upcoming')}><Text style={[styles.tabText, tab==='upcoming' && styles.tabTextActive]}>Upcoming Events</Text></Pressable>
        <Pressable style={[styles.tab, tab==='past' && styles.tabActive]} onPress={() => setTab('past')}><Text style={[styles.tabText, tab==='past' && styles.tabTextActive]}>Past Events</Text></Pressable>
      </View>
      <EventFeed filter={tab==='upcoming' ? 'student_upcoming' : 'student_past'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: { borderWidth: 1, borderColor: '#ddd', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  tabActive: { backgroundColor: '#0a7', borderColor: '#0a7' },
  tabText: { color: '#222' },
  tabTextActive: { color: '#fff', fontWeight: '600' }
});