import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext.jsx';
import { db } from '../../firebase';
import { addDoc, collection, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { uploadFile } from '../../utils/storage';
import ManagerLayout from './ManagerLayout.jsx';

export default function CreateEvent() {
  const { user, profile } = useAuth();
  const { id } = useLocalSearchParams();
  const isEdit = !!id;
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [eventType, setEventType] = useState('Offline');
  // New schedule fields
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(''); // minutes
  // Backward compat fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [venue, setVenue] = useState('');
  const [locationLink, setLocationLink] = useState('');
  const [organizerName, setOrganizerName] = useState(profile?.organizerName || '');
  const [organizerDepartment, setOrganizerDepartment] = useState(profile?.department || '');
  const [organizerContact, setOrganizerContact] = useState(profile?.contactEmail || profile?.email || '');
  const [isRegistrationRequired, setIsRegistrationRequired] = useState(false);
  const [isOpenEvent, setIsOpenEvent] = useState(false);
  const [registrationLink, setRegistrationLink] = useState('');
  const [registrationFee, setRegistrationFee] = useState(0);
  const [maxParticipants, setMaxParticipants] = useState('');
  const [status, setStatus] = useState('Published');
  const [bannerFile, setBannerFile] = useState(null);
  const [eventImageUrl, setEventImageUrl] = useState('');
  const [brochureLink, setBrochureLink] = useState('');
  const [campus, setCampus] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Auto-calculate duration when start/end provided
  useEffect(() => {
    if (startTime && endTime) {
      // Compute minutes difference
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;
      const diff = end - start;
      if (!Number.isNaN(diff) && diff > 0) setDuration(String(diff));
    }
  }, [startTime, endTime]);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      let uploadedUrl = '';
      if (bannerFile) {
        const { url } = await uploadFile({
          file: bannerFile,
          pathPrefix: 'event_banners',
          uid: user.uid,
        });
        uploadedUrl = url;
      }
      // Choose poster URL: prefer pasted URL over uploaded
      const posterURL = (eventImageUrl && eventImageUrl.trim()) ? eventImageUrl.trim() : (uploadedUrl || '');
      // Compose combined dateTime string for convenience
      let dateTime = '';
      if (eventDate) {
        const base = new Date(eventDate);
        if (startTime) {
          const [hh, mm] = startTime.split(':').map(Number);
          base.setHours(hh || 0, mm || 0, 0, 0);
        }
        dateTime = base.toISOString();
      } else if (startDate) {
        dateTime = startDate;
      }
      if (isEdit) {
        // Update existing event
        const ref = doc(db, 'events', String(id));
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error('Event not found');
        const data = snap.data();
        if (data.createdBy !== user.uid) throw new Error('You can only edit your own event');
        const finalIsRegistrationRequired = isOpenEvent ? false : isRegistrationRequired;
        const finalRegistrationFee = isOpenEvent ? 0 : Number(registrationFee || 0);
        const finalRegistrationLink = isOpenEvent ? '' : registrationLink;
        await updateDoc(ref, {
          title,
          description,
          eventCategory,
          eventType,
          eventDate: eventDate ? new Date(eventDate) : null,
          startTime: startTime || '',
          endTime: endTime || '',
          duration: duration ? Number(duration) : null,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
          venue,
          locationLink,
          organizerId: user.uid,
          organizerName,
          organizerDepartment,
          organizerEmail: organizerContact,
          organizerContact,
          campus,
          isRegistrationRequired: finalIsRegistrationRequired,
          registrationLink: finalRegistrationLink,
          registrationFee: finalRegistrationFee,
          isOpenEvent,
          maxParticipants: maxParticipants ? Number(maxParticipants) : null,
          status,
          bannerImage: posterURL,
          posterURL,
          brochureLink: brochureLink || '',
          tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          visibility,
          dateTime,
          updatedAt: serverTimestamp(),
        });
        router.replace(`/events/${id}`);
      } else {
        const finalIsRegistrationRequired = isOpenEvent ? false : isRegistrationRequired;
        const finalRegistrationFee = isOpenEvent ? 0 : Number(registrationFee || 0);
        const finalRegistrationLink = isOpenEvent ? '' : registrationLink;
        const docRef = await addDoc(collection(db, 'events'), {
          title,
          description,
          eventCategory,
          eventType,
          // New schedule fields
          eventDate: eventDate ? new Date(eventDate) : null,
          startTime: startTime || '',
          endTime: endTime || '',
          duration: duration ? Number(duration) : null,
          // Backward compat
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
          venue,
          locationLink,
          organizerId: user.uid,
          organizerName,
          organizerDepartment,
          organizerEmail: organizerContact,
          organizerContact,
          campus,
          isRegistrationRequired: finalIsRegistrationRequired,
          registrationLink: finalRegistrationLink,
          registrationFee: finalRegistrationFee,
          isOpenEvent,
          maxParticipants: maxParticipants ? Number(maxParticipants) : null,
          status,
          bannerImage: posterURL,
          posterURL,
          brochureLink: brochureLink || '',
          tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          visibility,
          attendeesCount: 0,
          likesCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: user.uid,
          dateTime,
          approvalStatus: 'pending',
        });
        router.replace(`/events/${docRef.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadForEdit = async () => {
      if (!isEdit) return;
      setLoading(true);
      try {
        const ref = doc(db, 'events', id);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error('Event not found');
        const data = snap.data();
        if (data.createdBy !== user.uid) throw new Error('You can only edit your own event');
        setTitle(data.title || '');
        setDescription(data.description || '');
        setEventCategory(data.eventCategory || '');
        setEventType(data.eventType || 'Offline');
        const d = data.eventDate?.seconds ? new Date(data.eventDate.seconds * 1000) : (data.eventDate ? new Date(data.eventDate) : (data.dateTime ? new Date(data.dateTime) : null));
        setEventDate(d ? d.toISOString().slice(0, 10) : '');
        setStartTime(data.startTime || '');
        setEndTime(data.endTime || '');
        setDuration(data.duration ? String(data.duration) : '');
        setStartDate(data.startDate?.seconds ? new Date(data.startDate.seconds * 1000).toISOString() : '');
        setEndDate(data.endDate?.seconds ? new Date(data.endDate.seconds * 1000).toISOString() : '');
        setRegistrationDeadline(data.registrationDeadline?.seconds ? new Date(data.registrationDeadline.seconds * 1000).toISOString().slice(0,10) : '');
        setVenue(data.venue || '');
        setLocationLink(data.locationLink || '');
        setOrganizerName(data.organizerName || '');
        setOrganizerDepartment(data.organizerDepartment || '');
        setOrganizerContact(data.organizerEmail || data.organizerContact || '');
        setIsRegistrationRequired(!!data.isRegistrationRequired);
        setIsOpenEvent(!!data.isOpenEvent);
        setRegistrationLink(data.registrationLink || '');
        setRegistrationFee(typeof data.registrationFee === 'number' ? data.registrationFee : 0);
        setMaxParticipants(data.maxParticipants ? String(data.maxParticipants) : '');
        setStatus(data.status || 'Published');
        setEventImageUrl(data.posterURL || '');
        setBrochureLink(data.brochureLink || '');
        setCampus(data.campus || '');
        setTags(Array.isArray(data.tags) ? data.tags.join(', ') : '');
        setVisibility(data.visibility || 'public');
      } catch (err) {
        setError(err.message || 'Failed to load event for edit');
      } finally {
        setLoading(false);
      }
    };
    if (user) loadForEdit();
  }, [isEdit, id, user]);

  return (
    <View style={styles.container}>
      {!profile?.profileComplete && profile?.role === 'manager' ? (
        <View style={styles.card}>
          <Text style={styles.title}>{isEdit ? 'Edit Event' : 'Create Event'}</Text>
          <Text style={{ marginTop: 8 }}>Please create your society profile before creating events.</Text>
          <Pressable style={[styles.primary, { marginTop: 12 }]} onPress={() => router.push('/manager/profile')}><Text style={styles.primaryText}>Go to Society Profile</Text></Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.title}>{isEdit ? 'Edit Event' : 'Create Event'}</Text>
            {isEdit && step === 3 && (
              <Pressable style={styles.primary} onPress={onSubmit} disabled={loading}><Text style={styles.primaryText}>{loading ? 'Saving...' : 'Save Changes'}</Text></Pressable>
            )}
          </View>
          <View style={styles.rowCenter}>
            {[1,2,3].map((s) => (
              <Pressable key={s} style={[styles.step, step===s && styles.stepActive]} onPress={() => setStep(s)}><Text style={[styles.stepText, step===s && styles.stepTextActive]}>Step {s}</Text></Pressable>
            ))}
          </View>
          {!!error && <Text style={styles.error}>{error}</Text>}

          {step === 1 && (
            <View>
              {eventImageUrl ? (
                <Image source={{ uri: eventImageUrl }} style={{ width: '100%', height: 200, borderRadius: 8 }} />
              ) : (
                <View style={{ width: '100%', height: 160, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}><Text>Image preview</Text></View>
              )}
              <TextInput placeholder="Event Image URL" value={eventImageUrl} onChangeText={setEventImageUrl} style={styles.input} />
              <View style={{ alignItems: 'flex-end' }}>
                <Pressable style={styles.primary} onPress={() => setStep(2)}><Text style={styles.primaryText}>Next →</Text></Pressable>
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <TextInput placeholder="Event Title" value={title} onChangeText={setTitle} style={styles.input} />
              <TextInput placeholder="Description" multiline value={description} onChangeText={setDescription} style={[styles.input, { height: 100 }]} />
              <TextInput placeholder="Event Category" value={eventCategory} onChangeText={setEventCategory} style={styles.input} />
              <TextInput placeholder="Event Type (Online/Offline/Hybrid)" value={eventType} onChangeText={setEventType} style={styles.input} />
              <TextInput placeholder="Organizer Name" value={organizerName} onChangeText={setOrganizerName} style={styles.input} />
              <TextInput placeholder="Organizer Department" value={organizerDepartment} onChangeText={setOrganizerDepartment} style={styles.input} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Pressable style={styles.secondary} onPress={() => setStep(1)}><Text>← Back</Text></Pressable>
                <Pressable style={styles.primary} onPress={() => setStep(3)}><Text style={styles.primaryText}>Next →</Text></Pressable>
              </View>
            </View>
          )}

          {step === 3 && (
            <View>
              <TextInput placeholder="Event Date (YYYY-MM-DD)" value={eventDate} onChangeText={setEventDate} style={styles.input} />
              <TextInput placeholder="Start Time (HH:mm)" value={startTime} onChangeText={setStartTime} style={styles.input} />
              <TextInput placeholder="End Time (HH:mm)" value={endTime} onChangeText={setEndTime} style={styles.input} />
              <TextInput placeholder="Duration (minutes)" value={duration} onChangeText={setDuration} style={styles.input} />
              <TextInput placeholder="Venue / Location" value={venue} onChangeText={setVenue} style={styles.input} />
              <TextInput placeholder="Campus (optional)" value={campus} onChangeText={setCampus} style={styles.input} />
              <TextInput placeholder="Location Link (optional)" value={locationLink} onChangeText={setLocationLink} style={styles.input} />
              <TextInput placeholder="Registration Deadline (YYYY-MM-DD)" value={registrationDeadline} onChangeText={setRegistrationDeadline} style={styles.input} />
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 8 }}>
                <Pressable style={[styles.radio, isRegistrationRequired && !isOpenEvent && styles.radioActive]} onPress={() => { setIsRegistrationRequired(true); setIsOpenEvent(false); }}><Text>Registration Required</Text></Pressable>
                <Pressable style={[styles.radio, isOpenEvent && styles.radioActive]} onPress={() => { setIsOpenEvent(true); setIsRegistrationRequired(false); setRegistrationFee(0); setRegistrationLink(''); }}><Text>Open Event</Text></Pressable>
              </View>
              {isRegistrationRequired && !isOpenEvent && (
                <View>
                  <TextInput placeholder="Registration Link" value={registrationLink} onChangeText={setRegistrationLink} style={styles.input} />
                  <TextInput placeholder="Registration Fee" value={String(registrationFee)} onChangeText={setRegistrationFee} style={styles.input} />
                </View>
              )}
              <TextInput placeholder="Brochure or PDF Link (optional)" value={brochureLink} onChangeText={setBrochureLink} style={styles.input} />
              <TextInput placeholder="Organizer Contact Email" value={organizerContact} onChangeText={setOrganizerContact} style={styles.input} />
              <TextInput placeholder="Visibility (public/private)" value={visibility} onChangeText={setVisibility} style={styles.input} />
              <TextInput placeholder="Status" value={status} onChangeText={setStatus} style={styles.input} />
              <TextInput placeholder="Tags (comma-separated)" value={tags} onChangeText={setTags} style={styles.input} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Pressable style={styles.secondary} onPress={() => setStep(2)}><Text>← Back</Text></Pressable>
                <Pressable style={styles.primary} disabled={loading} onPress={onSubmit}><Text style={styles.primaryText}>{isEdit ? (loading ? 'Saving...' : 'Save Changes') : (loading ? 'Publishing...' : 'Confirm / Publish Event')}</Text></Pressable>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600', color: '#0a7' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginTop: 8 },
  primary: { backgroundColor: '#111', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8 },
  primaryText: { color: '#fff', fontWeight: '600' },
  secondary: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  rowCenter: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 8 },
  step: { borderWidth: 1, borderColor: '#ddd', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  stepActive: { backgroundColor: '#0a7', borderColor: '#0a7' },
  stepText: { color: '#222' },
  stepTextActive: { color: '#fff' },
  radio: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  radioActive: { backgroundColor: '#e5e7eb' }
});
