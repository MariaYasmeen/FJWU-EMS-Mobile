import { Slot } from 'expo-router';
import { View, StyleSheet, ScrollView } from 'react-native';
import { AuthProvider } from '../src/context/AuthContext.jsx';
import Navbar from '../src/components/Navbar.jsx';

export default function RootLayout() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <Navbar />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.main}>
            <Slot />
          </View>
        </ScrollView>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  main: { flex: 1 },
  scrollContent: { flexGrow: 1 }
});