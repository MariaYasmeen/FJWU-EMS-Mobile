import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ onSearch }) {
  const { profile, logout } = useAuth();
  const [query, setQuery] = useState('');
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(true);
  };

  return (
    <View style={styles.nav}>
      <Text style={styles.brand}>FJWU Event Hub</Text>
      <TextInput
        style={styles.input}
        placeholder="Search events..."
        value={query}
        onChangeText={(t) => { setQuery(t); onSearch?.(t); }}
      />
      <View style={styles.actions}>
        <Pressable style={styles.btn} onPress={() => router.push('/student/search')}><Text>Search</Text></Pressable>
        <Pressable style={styles.btn} onPress={() => setShowNotif((s) => !s)}><Text>Notif</Text></Pressable>
        <Pressable style={styles.btn} onPress={() => router.push(profile?.role === 'manager' ? '/manager/favourites' : '/student/favourites')}><Text>Bookmarks</Text></Pressable>
        {profile?.role === 'manager' && (
          <Pressable style={styles.btn} onPress={() => router.push('/manager/create-event')}><Text>＋</Text></Pressable>
        )}
        <Pressable style={styles.btn} onPress={() => router.push(profile?.role === 'manager' ? '/manager/profile' : '/student/profile')}><Text>Profile</Text></Pressable>
        <Pressable style={styles.btn} onPress={handleLogout}><Text>Logout</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  brand: { fontWeight: '600', color: '#0a7', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  btn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }
});
