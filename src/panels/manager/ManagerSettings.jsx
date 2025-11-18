import { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ManagerSettings() {
  const { user } = useAuth();
  const router = useRouter();
  const [emailNotif, setEmailNotif] = useState(true);
  const [announcementsNotif, setAnnouncementsNotif] = useState(true);
  const [theme, setTheme] = useState('light');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPasswordChanged, setShowPasswordChanged] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const data = snap.data() || {};
        setEmailNotif(!!data.emailNotif);
        setAnnouncementsNotif(!!data.announcementsNotif);
        const storedTheme = (await AsyncStorage.getItem('theme')) || 'light';
        setTheme(data.theme || storedTheme);
      } catch {}
    };
    load();
  }, [user]);

  const handleSavePrefs = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        emailNotif,
        announcementsNotif,
        theme,
      });
      await AsyncStorage.setItem('theme', theme);
      setMessage('Settings saved');
    } catch (e) {
      setError(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPrefs = async () => {
    setMessage('');
    setError('');
    const t = (await AsyncStorage.getItem('theme')) || 'light';
    setTheme(t);
  };

  const handleChangePassword = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setMessage('Password updated');
      setShowPasswordChanged(true);
      setCurrentPassword('');
      setNewPassword('');
    } catch (e) {
      setError(e.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await updateDoc(doc(db, 'users', user.uid), { deleted: true });
      await deleteUser(auth.currentUser);
      router.replace('/login');
    } catch (e) {
      setError(e.message || 'Failed to delete account');
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!message && <Text style={styles.success}>{message}</Text>}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notification Preferences</Text>
        <Pressable style={styles.row} onPress={() => setEmailNotif((v) => !v)}>
          <Text>Email notifications</Text>
          <Text>{emailNotif ? 'On' : 'Off'}</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => setAnnouncementsNotif((v) => !v)}>
          <Text>Announcements alerts</Text>
          <Text>{announcementsNotif ? 'On' : 'Off'}</Text>
        </Pressable>
        <View style={styles.actions}>
          <Pressable style={styles.primary} disabled={saving} onPress={handleSavePrefs}><Text style={styles.primaryText}>Save</Text></Pressable>
          <Pressable style={styles.secondary} onPress={handleCancelPrefs}><Text>Cancel</Text></Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Theme</Text>
        <View style={styles.row}>
          <Pressable style={[styles.radio, theme==='light' && styles.radioActive]} onPress={() => setTheme('light')}><Text>Light</Text></Pressable>
          <Pressable style={[styles.radio, theme==='dark' && styles.radioActive]} onPress={() => setTheme('dark')}><Text>Dark</Text></Pressable>
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.primary} disabled={saving} onPress={handleSavePrefs}><Text style={styles.primaryText}>Save</Text></Pressable>
          <Pressable style={styles.secondary} onPress={handleCancelPrefs}><Text>Cancel</Text></Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Change Password</Text>
        <TextInput secureTextEntry placeholder="Current password" value={currentPassword} onChangeText={setCurrentPassword} style={styles.input} />
        <TextInput secureTextEntry placeholder="New password" value={newPassword} onChangeText={setNewPassword} style={styles.input} />
        <View style={styles.actions}>
          <Pressable style={styles.primary} disabled={saving || !currentPassword || !newPassword} onPress={handleChangePassword}><Text style={styles.primaryText}>Update Password</Text></Pressable>
          <Pressable style={styles.secondary} onPress={() => { setCurrentPassword(''); setNewPassword(''); }}><Text>Cancel</Text></Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delete Account</Text>
        <Text>This action is permanent and cannot be undone.</Text>
        <Pressable style={styles.secondary} onPress={() => setShowConfirm(true)}><Text>Delete Account</Text></Pressable>
      </View>

      {showConfirm && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.cardTitle}>Delete Account</Text>
            <Text style={{ marginTop: 8 }}>This action is permanent and cannot be undone. Are you sure?</Text>
            <View style={styles.actions}>
              <Pressable style={styles.secondary} onPress={() => setShowConfirm(false)}><Text>Cancel</Text></Pressable>
              <Pressable style={styles.primary} disabled={saving} onPress={confirmDelete}><Text style={styles.primaryText}>Yes, Delete</Text></Pressable>
            </View>
          </View>
        </View>
      )}

      {showPasswordChanged && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modal}>
            <Text style={styles.cardTitle}>Password changed successfully</Text>
            <View style={styles.actions}>
              <Pressable style={styles.primary} onPress={() => setShowPasswordChanged(false)}><Text style={styles.primaryText}>OK</Text></Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  error: { color: '#dc2626', marginBottom: 8 },
  success: { color: '#0a7', marginBottom: 8 },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: '#fff' },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  primary: { backgroundColor: '#111', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  primaryText: { color: '#fff' },
  secondary: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start', marginTop: 8 },
  radio: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  radioActive: { backgroundColor: '#e5e7eb' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginTop: 8 },
  modalBackdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 16, width: '80%' }
});