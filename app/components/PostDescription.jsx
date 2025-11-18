import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';

export default function PostDescription({ event }) {
  const dateStr = event?.dateTime
    ? new Date(event.dateTime).toLocaleString()
    : (event?.eventDate?.seconds
      ? new Date(event.eventDate.seconds * 1000).toLocaleString()
      : (event?.eventDate ? new Date(event.eventDate).toLocaleString() : ''));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event?.title}</Text>
      <Text style={styles.text}>{event?.description}</Text>
      <View style={styles.grid}>
        <Text style={styles.item}><Text style={styles.label}>Category: </Text>{event?.eventCategory}</Text>
        <Text style={styles.item}><Text style={styles.label}>Type: </Text>{event?.eventType}</Text>
        <Text style={styles.item}><Text style={styles.label}>Venue: </Text>{event?.venue}</Text>
        <Text style={styles.item}><Text style={styles.label}>Campus: </Text>{event?.campus}</Text>
        <Text style={styles.item}><Text style={styles.label}>Date & Time: </Text>{dateStr}</Text>
        {!!event?.brochureLink && (
          <Pressable onPress={() => Linking.openURL(event.brochureLink)}><Text style={styles.link}>Open Brochure</Text></Pressable>
        )}
      </View>
      <View style={{ marginTop: 12 }}>
        {event?.isOpenEvent ? (
          <Text style={styles.text}>This event is free and open to everyone. No registration required.</Text>
        ) : (
          <View>
            {event?.isRegistrationRequired ? (
              <View>
                <Text style={styles.text}>Registration Required</Text>
                {!!event?.registrationLink && (
                  <Pressable onPress={() => Linking.openURL(event.registrationLink)}><Text style={styles.link}>Open Registration Link</Text></Pressable>
                )}
                {Number(event?.registrationFee || 0) > 0 ? (
                  <Text style={styles.text}><Text style={styles.label}>Registration Fee: </Text>{Number(event.registrationFee)}</Text>
                ) : (
                  <Text style={styles.text}>This event is free.</Text>
                )}
              </View>
            ) : (
              <View>
                <Text style={styles.text}>No registration required.</Text>
                {Number(event?.registrationFee || 0) > 0 ? (
                  <Text style={styles.text}><Text style={styles.label}>Event Fee: </Text>{Number(event.registrationFee)}</Text>
                ) : (
                  <Text style={styles.text}>This event is free.</Text>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '600', color: '#0a7' },
  text: { color: '#374151', marginTop: 6 },
  grid: { marginTop: 12, gap: 6 },
  item: { color: '#374151' },
  label: { fontWeight: '600' },
  link: { color: '#0a7', textDecorationLine: 'underline' }
});