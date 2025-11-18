import { View, Text, StyleSheet } from 'react-native';
import EventFeed from '../../components/EventFeed.jsx';

export default function StudentHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Events</Text>
      <EventFeed filter={'student_all'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8 }
});