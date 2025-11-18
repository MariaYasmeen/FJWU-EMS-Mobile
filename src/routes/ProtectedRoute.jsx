import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  if (loading) return <View><Text>Loading...</Text></View>;
  if (!user) {
    router.replace('/login');
    return <View><Text>Redirecting…</Text></View>;
  }
  return children;
}