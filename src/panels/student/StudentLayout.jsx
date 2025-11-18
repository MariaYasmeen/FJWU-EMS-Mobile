import { View, StyleSheet } from 'react-native';

export default function StudentLayout({ children }) {
  return (
    <View style={styles.container}>{children}</View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 }
});