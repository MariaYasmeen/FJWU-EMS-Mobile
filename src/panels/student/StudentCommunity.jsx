import { View, Text, StyleSheet } from 'react-native';

export default function StudentCommunity() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community / Discussions</Text>
      <Text style={styles.text}>This section will host discussions and feedback on events.</Text>
      <Text style={styles.muted}>(Optional feature — coming soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  text: { color: '#374151' },
  muted: { color: '#6b7280', marginTop: 8 }
});