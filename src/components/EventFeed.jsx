import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import EventCard from './EventCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function EventFeed({ filter = 'all', search = '' }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      const allSnap = await getDocs(q);
      let rows = allSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (search) {
        const term = search.toLowerCase();
        rows = rows.filter(
          (e) => (e.title || '').toLowerCase().includes(term) || (e.description || '').toLowerCase().includes(term)
        );
      }

      const now = Date.now();
      const getDateMs = (e) => {
        if (e.eventDate?.seconds) return e.eventDate.seconds * 1000;
        if (e.eventDate) return Date.parse(e.eventDate);
        if (e.dateTime) return Date.parse(e.dateTime);
        if (e.startDate) return Date.parse(e.startDate);
        return 0;
      };
      const canStillRegister = (e) => {
        if (e.isOpenEvent) return true;
        if (!e.isRegistrationRequired) return true;
        const d = e.registrationDeadline;
        const deadlineMs = d?.seconds ? d.seconds * 1000 : d ? Date.parse(d) : undefined;
        if (!deadlineMs) return true;
        return deadlineMs >= now;
      };

      if (filter === 'manager_events' && user) {
        rows = rows.filter((e) => e.createdBy === user.uid);
      } else if (filter === 'attended') {
        rows = rows.filter((e) => e.attendeesCount && e.attendeesCount > 0);
      } else if (filter === 'favorites' && user) {
        // optionally, could fetch favorites subcollection; keeping simple for initial build
      } else if (filter === 'societies') {
        // placeholder for societies listing
      } else if (filter === 'student_all') {
        rows = rows.filter((e) => {
          const dateMs = getDateMs(e);
          const upcoming = dateMs ? dateMs >= now : true;
          const statusOk = (e.status || 'Published').toLowerCase() === 'published';
          const approvalOk = (e.approvalStatus || 'approved') !== 'rejected';
          return upcoming && statusOk && approvalOk;
        });
      } else if (filter === 'student_upcoming' || filter === 'manager_upcoming') {
        rows = rows.filter((e) => {
          const dateMs = getDateMs(e);
          const statusOk = (e.status || 'Published').toLowerCase() === 'published';
          const approvalOk = (e.approvalStatus || 'approved') !== 'rejected';
          return dateMs >= now && canStillRegister(e) && statusOk && approvalOk;
        });
      } else if (filter === 'student_past' || filter === 'manager_past') {
        rows = rows.filter((e) => {
          const dateMs = getDateMs(e);
          return dateMs && dateMs < now;
        });
      }

      setEvents(rows);
      setLoading(false);
    };

    load();
  }, [filter, search, user]);

  if (loading) return <Text style={styles.pad}>Loading events...</Text>;
  if (!events.length) return <Text style={styles.pad}>No events found.</Text>;

  return (
    <View style={styles.list}>
      {events.map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 16 },
  list: { gap: 12 },
});