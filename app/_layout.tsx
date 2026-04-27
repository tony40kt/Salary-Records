import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { initDatabase } from '../src/database';

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="place/new" options={{ title: '新增地點' }} />
      <Stack.Screen name="place/[id]" options={{ title: '編輯地點' }} />
      <Stack.Screen name="record/new" options={{ title: '新增記錄' }} />
      <Stack.Screen name="record/[id]" options={{ title: '記錄詳情' }} />
      <Stack.Screen name="export" options={{ title: '匯出記錄' }} />
      <Stack.Screen name="help" options={{ title: '說明與教學' }} />
    </Stack>
  );
}
