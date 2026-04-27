import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="places"
        options={{
          title: '地點管理',
          tabBarLabel: '地點管理',
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: '工作記錄',
          tabBarLabel: '工作記錄',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarLabel: '設定',
        }}
      />
    </Tabs>
  );
}
