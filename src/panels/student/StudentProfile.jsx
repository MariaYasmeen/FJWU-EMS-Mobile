import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext.jsx';
import { db } from '../../firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function StudentProfile() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [status, setStatus] = useState('Active');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || '');
          setDepartment(data.department || '');
          setEmail(data.email || user.email || '');
          setPhone(data.phone || '');
          setRollNumber(data.rollNumber || '');
          setStatus(data.status || 'Active');
          setPhotoURL(data.photoURL || '');
        }
      } catch (e) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const onSubmit = async () => {
    setSaved(false);
    setError('');
    try {
      const refDoc = doc(db, 'users', user.uid);
      await updateDoc(refDoc, { name, department, email, phone, rollNumber, status, photoURL: photoURL || null, updatedAt: serverTimestamp() });
      setSaved(true);
      setEditing(false);
    } catch (e) {
      setError(e.message || 'Failed to update profile');
    }
  };

  

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}><Text>👤</Text></View>
        )}
        <Text style={styles.name}>{name || 'Your Name'}</Text>
        <Text style={styles.meta}>{department || 'Department'}</Text>
        <Text style={styles.meta}>{rollNumber || 'Roll Number / Student ID'}</Text>
        <Text style={styles.meta}>{email || user?.email || ''}</Text>
        <Text style={styles.meta}>Status: {status}</Text>
        <Pressable style={styles.editBtn} onPress={() => setEditing(true)}><Text style={styles.editText}>Edit</Text></Pressable>
      </View>

      {editing && (
        <View style={styles.form}>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <TextInput placeholder="Photo URL" value={photoURL} onChangeText={setPhotoURL} style={styles.input} />
          <TextInput placeholder="Full Name" value={name} onChangeText={setName} style={styles.input} />
          <TextInput placeholder="Department" value={department} onChangeText={setDepartment} style={styles.input} />
          <TextInput placeholder="Roll Number / Student ID" value={rollNumber} onChangeText={setRollNumber} style={styles.input} />
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
          <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={styles.input} />
          <TextInput placeholder="Status (Active/Alumni/Suspended)" value={status} onChangeText={setStatus} style={styles.input} />
          <View style={styles.actions}>
            <Pressable style={styles.primary} onPress={onSubmit}><Text style={styles.primaryText}>Save</Text></Pressable>
            {saved && <Text style={styles.saved}>Saved</Text>}
            <Pressable style={styles.secondary} onPress={() => setEditing(false)}><Text>Cancel</Text></Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 12 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: '600', color: '#0a7', marginTop: 8 },
  meta: { color: '#555', marginTop: 2 },
  editBtn: { marginTop: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  editText: { color: '#222' },
  form: { marginTop: 12 },
  error: { color: '#dc2626', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 10 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primary: { backgroundColor: '#111', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  primaryText: { color: '#fff' },
  secondary: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  saved: { color: '#0a7', marginLeft: 8 }
});