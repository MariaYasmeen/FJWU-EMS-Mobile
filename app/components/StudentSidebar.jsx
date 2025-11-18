import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function StudentSidebar() {
  const { logout } = useAuth();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  return (
    <View style={styles.container}>
      <Pressable style={styles.item} onPress={() => router.push('/student')}><Text>🏠 Dashboard / Home</Text></Pressable>
      <Pressable style={styles.item} onPress={() => router.push('/student/events')}><Text>🎉 All Events</Text></Pressable>
      <Pressable style={styles.item} onPress={() => router.push('/student/favourites')}><Text>⭐ Saved Events</Text></Pressable>
      <Pressable style={styles.item} onPress={() => router.push('/student/registrations')}><Text>🗓️ My Registrations</Text></Pressable>
      <Pressable style={styles.item} onPress={() => router.push('/student/community')}><Text>💬 Community</Text></Pressable>
      <Pressable style={styles.item} onPress={() => router.push('/student/profile')}><Text>👤 Profile</Text></Pressable>
      <Pressable style={styles.item} onPress={() => router.push('/student/settings')}><Text>⚙️ Settings</Text></Pressable>

      <View style={{ borderTopWidth: 1, borderColor: '#eee', marginTop: 8 }} />
      <Pressable style={[styles.item, styles.logout]} onPress={() => setShowLogoutConfirm(true)}><Text>🚪 Logout</Text></Pressable>

      {showLogoutConfirm && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={{ fontWeight: '600', fontSize: 16 }}>Do you want to logout?</Text>
            <View style={styles.actions}>
              <Pressable style={styles.secondary} onPress={() => setShowLogoutConfirm(false)}><Text>Cancel</Text></Pressable>
              <Pressable style={styles.primary} onPress={async () => { await logout(); router.replace('/login'); }}><Text style={styles.primaryText}>Logout</Text></Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 240, borderRightWidth: 1, borderColor: '#eee', backgroundColor: '#fff', padding: 12 },
  item: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  logout: { marginTop: 8 },
  modalBackdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '80%' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12, alignSelf: 'center' },
  primary: { backgroundColor: '#111', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  primaryText: { color: '#fff' },
  secondary: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 }
});