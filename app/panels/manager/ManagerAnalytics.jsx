import { View, Text, StyleSheet } from 'react-native';

export default function ManagerAnalytics() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics</Text>
      <Text style={styles.text}>Event performance insights (coming soon).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  text: { color: '#374151' }
});