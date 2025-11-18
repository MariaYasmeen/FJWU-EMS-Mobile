import { Slot } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { AuthProvider } from '../src/context/AuthContext.jsx';
import Navbar from '../src/components/Navbar.jsx';

export default function RootLayout() {
  return (
    <AuthProvider>
      <View style={styles.container}>
        <Navbar />
        <View style={styles.main}>
          <Slot />
        </View>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  main: { flex: 1 }
});