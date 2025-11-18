import { View, Text, StyleSheet } from 'react-native';

export default function ManagerAnnouncements() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Announcements</Text>
      <Text style={styles.text}>The announcements panel is fixed on the right.</Text>
      <Text style={styles.muted}>Add and manage announcements here (coming soon).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  text: { color: '#374151' },
  muted: { color: '#6b7280', marginTop: 8 }
});