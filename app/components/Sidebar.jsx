import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Sidebar({ role = 'student', managerProfileComplete = true }) {
  const studentLinks = [
    { to: '/student', label: 'Dashboard' },
    { to: '/student/events', label: 'Events' },
    { to: '/student/societies', label: 'All Societies' },
    { to: '/student/favourites', label: 'Favourites' },
    { to: '/student/registrations', label: 'My Registrations' },
    { to: '/student/community', label: 'Community' },
    { to: '/student/profile', label: 'Profile' },
    { to: '/student/settings', label: 'Settings' },
  ];

  const managerLinks = [
    { to: '/manager', label: 'Dashboard' },
    { to: '/manager/events', label: 'All Events' },
    { to: '/manager/societies', label: 'All Societies' },
    { to: '/manager/your-events', label: 'Your Events' },
    { to: '/manager/create-event', label: 'Create Event' },
    { to: '/manager/favourites', label: 'Favourites' },
    { to: '/manager/analytics', label: 'Analytics' },
    { to: '/manager/announcements', label: 'Announcements' },
    { to: '/manager/settings', label: 'Settings' },
    { to: '/manager/profile', label: 'Your Profile' },
  ];

  const links = role === 'manager' ? managerLinks : studentLinks;

  const router = useRouter();
  return (
    <View style={styles.container}>
      {links.map((l) => (
        <Pressable key={l.to} style={styles.item} onPress={() => router.push(l.to)}>
          <Text style={styles.itemText}>{l.label}</Text>
          {l.to === '/manager/profile' && role === 'manager' && !managerProfileComplete && (
            <Text style={styles.warn}>(complete)</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 240, borderRightWidth: 1, borderColor: '#eee', backgroundColor: '#fff', padding: 12 },
  item: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  itemText: { color: '#111' },
  warn: { color: '#dc2626', fontSize: 12, marginLeft: 6 }
});