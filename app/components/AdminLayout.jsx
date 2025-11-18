import { View, StyleSheet } from 'react-native';
import Navbar from './Navbar.jsx';

export default function AdminLayout({ children }) {
  return (
    <View style={styles.container}>
      <Navbar />
      <View style={styles.main}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  main: { flex: 1, padding: 16 }
});