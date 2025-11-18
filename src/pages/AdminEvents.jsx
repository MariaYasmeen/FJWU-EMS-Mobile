import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import EventFeed from '../components/EventFeed';

export default function AdminEvents() {
  const [search, setSearch] = useState('');
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>All Events</Text>
        <TextInput style={styles.input} placeholder="Search by title" value={search} onChangeText={setSearch} />
      </View>
      <EventFeed filter={'student_all'} search={search} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, width: 200 }
});