import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext.jsx';

export default function Index() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!profile) {
      router.replace('/login');
    } else {
      router.replace(profile.role === 'manager' ? '/manager' : '/student');
    }
  }, [loading, profile, router]);

  return <View><Text>{loading ? 'Loading...' : 'Redirecting…'}</Text></View>;
}