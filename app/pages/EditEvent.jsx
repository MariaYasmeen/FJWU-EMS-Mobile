import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function EditEvent() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventCategory: '',
    eventType: 'Offline',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    venue: '',
    locationLink: '',
    organizerName: '',
    organizerContact: '',
    isRegistrationRequired: false,
    registrationLink: '',
    registrationFee: 0,
    maxParticipants: '',
    status: 'Published',
    bannerImage: '',
    tags: '',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'events', String(id)));
        if (!snap.exists()) {
          setError('Event not found');
        } else {
          const e = snap.data();
          setForm({
            title: e.title || '',
            description: e.description || '',
            eventCategory: e.eventCategory || '',
            eventType: e.eventType || 'Offline',
            startDate: e.startDate?.seconds ? new Date(e.startDate.seconds * 1000).toISOString().slice(0,16) : (e.dateTime ? new Date(e.dateTime).toISOString().slice(0,16) : ''),
            endDate: e.endDate?.seconds ? new Date(e.endDate.seconds * 1000).toISOString().slice(0,16) : '',
            registrationDeadline: e.registrationDeadline?.seconds ? new Date(e.registrationDeadline.seconds * 1000).toISOString().slice(0,16) : '',
            venue: e.venue || '',
            locationLink: e.locationLink || '',
            organizerName: e.organizerName || '',
            organizerContact: e.organizerContact || '',
            isRegistrationRequired: !!e.isRegistrationRequired,
            registrationLink: e.registrationLink || '',
            registrationFee: e.registrationFee || 0,
            maxParticipants: e.maxParticipants || '',
            status: e.status || 'Published',
            bannerImage: e.bannerImage || e.posterURL || '',
            tags: (e.tags || []).join(', '),
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const updateField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async () => {
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        eventCategory: form.eventCategory,
        eventType: form.eventType,
        startDate: form.startDate ? new Date(form.startDate) : null,
        endDate: form.endDate ? new Date(form.endDate) : null,
        registrationDeadline: form.registrationDeadline ? new Date(form.registrationDeadline) : null,
        venue: form.venue,
        locationLink: form.locationLink,
        organizerName: form.organizerName,
        organizerContact: form.organizerContact,
        isRegistrationRequired: !!form.isRegistrationRequired,
        registrationLink: form.registrationLink,
        registrationFee: Number(form.registrationFee || 0),
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
        status: form.status,
        bannerImage: form.bannerImage,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        updatedAt: serverTimestamp(),
      };
      await updateDoc(doc(db, 'events', String(id)), payload);
      router.replace('/manager/events');
    } catch (err) {
      setError(err.message || 'Failed to update');
    }
  };

  if (loading) return <View style={styles.container}><Text>Loading...</Text></View>;
  if (error) return <View style={styles.container}><Text style={{ color: '#dc2626' }}>{error}</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Event</Text>
      <TextInput placeholder="Event Title" value={form.title} onChangeText={(t) => updateField('title', t)} style={styles.input} />
      <TextInput placeholder="Description" multiline value={form.description} onChangeText={(t) => updateField('description', t)} style={[styles.input, { height: 100 }]} />
      <TextInput placeholder="Category" value={form.eventCategory} onChangeText={(t) => updateField('eventCategory', t)} style={styles.input} />
      <TextInput placeholder="Type (Online/Offline/Hybrid)" value={form.eventType} onChangeText={(t) => updateField('eventType', t)} style={styles.input} />
      <TextInput placeholder="Start ISO (YYYY-MM-DDTHH:mm)" value={form.startDate} onChangeText={(t) => updateField('startDate', t)} style={styles.input} />
      <TextInput placeholder="End ISO" value={form.endDate} onChangeText={(t) => updateField('endDate', t)} style={styles.input} />
      <TextInput placeholder="Registration Deadline ISO" value={form.registrationDeadline} onChangeText={(t) => updateField('registrationDeadline', t)} style={styles.input} />
      <TextInput placeholder="Venue" value={form.venue} onChangeText={(t) => updateField('venue', t)} style={styles.input} />
      <TextInput placeholder="Location / Meet Link" value={form.locationLink} onChangeText={(t) => updateField('locationLink', t)} style={styles.input} />
      <TextInput placeholder="Organizer Name" value={form.organizerName} onChangeText={(t) => updateField('organizerName', t)} style={styles.input} />
      <TextInput placeholder="Organizer Contact" value={form.organizerContact} onChangeText={(t) => updateField('organizerContact', t)} style={styles.input} />
      <TextInput placeholder="Require Registration (true/false)" value={String(form.isRegistrationRequired)} onChangeText={(t) => updateField('isRegistrationRequired', t==='true')} style={styles.input} />
      <TextInput placeholder="Registration Link" value={form.registrationLink} onChangeText={(t) => updateField('registrationLink', t)} style={styles.input} />
      <TextInput placeholder="Registration Fee" value={String(form.registrationFee)} onChangeText={(t) => updateField('registrationFee', t)} style={styles.input} />
      <TextInput placeholder="Max Participants" value={String(form.maxParticipants)} onChangeText={(t) => updateField('maxParticipants', t)} style={styles.input} />
      <TextInput placeholder="Status" value={form.status} onChangeText={(t) => updateField('status', t)} style={styles.input} />
      <TextInput placeholder="Tags (comma-separated)" value={form.tags} onChangeText={(t) => updateField('tags', t)} style={styles.input} />
      <Pressable style={styles.primary} onPress={onSubmit}><Text style={styles.primaryText}>Save Changes</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 10 },
  primary: { backgroundColor: '#111', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '600' }
});