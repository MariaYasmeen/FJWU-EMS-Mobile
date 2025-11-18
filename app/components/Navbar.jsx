import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ onSearch }) {
  const { profile, logout } = useAuth();
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(true);
  };

  const width = Math.min(300, Math.floor(Dimensions.get('window').width * 0.8));

  return (
    <View style={styles.nav}>
      <View style={styles.leftWrap}>
        <Pressable accessibilityLabel="Open menu" onPress={() => setDrawerOpen(true)} style={styles.iconBtn}>
          <Ionicons name="menu" size={24} color="#111" />
        </Pressable>
        <Text style={styles.brand}>FJWU Event Hub</Text>
      </View>

      <View style={styles.actions}>
        <Pressable accessibilityLabel="Search" onPress={() => router.push('/student/search')} style={styles.iconBtn}>
          <Ionicons name="search" size={22} color="#111" />
        </Pressable>
        <Pressable accessibilityLabel="Notifications" onPress={() => setShowNotif((s) => !s)} style={styles.iconBtn}>
          <Ionicons name="notifications-outline" size={22} color="#111" />
        </Pressable>
        {profile?.role === 'manager' && (
          <Pressable accessibilityLabel="Create event" onPress={() => router.push('/manager/create-event')} style={styles.iconBtn}>
            <Ionicons name="add-circle-outline" size={22} color="#0a7" />
          </Pressable>
        )}
      </View>

      <Modal visible={drawerOpen} transparent animationType="slide" onRequestClose={() => setDrawerOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={styles.dismissArea} onPress={() => setDrawerOpen(false)} />
          <View style={[styles.drawer, { width }]}> 
            <Text style={styles.drawerTitle}>Menu</Text>
            <Pressable style={styles.drawerItem} onPress={() => { setDrawerOpen(false); router.push(profile?.role === 'manager' ? '/manager' : '/student'); }}>
              <Ionicons name="home-outline" size={20} color="#111" />
              <Text style={styles.drawerText}>Home</Text>
            </Pressable>
            <Pressable style={styles.drawerItem} onPress={() => { setDrawerOpen(false); router.push('/student/search'); }}>
              <Ionicons name="search" size={20} color="#111" />
              <Text style={styles.drawerText}>Search</Text>
            </Pressable>
            <Pressable style={styles.drawerItem} onPress={() => { setDrawerOpen(false); router.push(profile?.role === 'manager' ? '/manager/favourites' : '/student/favourites'); }}>
              <Ionicons name="bookmark-outline" size={20} color="#111" />
              <Text style={styles.drawerText}>Bookmarks</Text>
            </Pressable>
            <Pressable style={styles.drawerItem} onPress={() => { setDrawerOpen(false); router.push(profile?.role === 'manager' ? '/manager/profile' : '/student/profile'); }}>
              <Ionicons name="person-circle-outline" size={20} color="#111" />
              <Text style={styles.drawerText}>Profile</Text>
            </Pressable>
            {profile?.role === 'manager' && (
              <Pressable style={styles.drawerItem} onPress={() => { setDrawerOpen(false); router.push('/manager/create-event'); }}>
                <Ionicons name="add-circle-outline" size={20} color="#0a7" />
                <Text style={styles.drawerText}>Create Event</Text>
              </Pressable>
            )}
            <Pressable style={[styles.drawerItem, styles.logout]} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#b00" />
              <Text style={[styles.drawerText, styles.logoutText]}>Logout</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  leftWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { fontWeight: '600', color: '#0a7', fontSize: 16 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 6, borderRadius: 8 },
  overlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.25)' },
  dismissArea: { flex: 1 },
  drawer: { backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 12, elevation: 4 },
  drawerTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  drawerText: { fontSize: 16 },
  logout: { marginTop: 8 },
  logoutText: { color: '#b00' }
});
