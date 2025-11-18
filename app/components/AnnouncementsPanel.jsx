import { View, Text, StyleSheet } from 'react-native';

export default function AnnouncementsPanel() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Announcements</Text>
      <Text style={styles.text}>No announcements yet.</Text>
      <Text style={styles.muted}>(Coming soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, borderTopWidth: 1, borderColor: '#eee' },
  title: { fontSize: 16, fontWeight: '600' },
  text: { color: '#374151', marginTop: 8 },
  muted: { color: '#6b7280', marginTop: 4 }
});