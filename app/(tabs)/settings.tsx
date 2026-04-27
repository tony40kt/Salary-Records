import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useRecords } from '../../src/hooks/useRecords';
import { usePlaces } from '../../src/hooks/usePlaces';
import { deleteAllPlaces } from '../../src/database/placeDb';

/** 設定頁 — 資料重置、版本資訊 */
export default function SettingsScreen() {
  const router = useRouter();
  const { removeAll: removeAllRecords } = useRecords();
  const { load: reloadPlaces } = usePlaces();

  function handleResetRecords() {
    Alert.alert('重置工作記錄', '確定要清除所有工作記錄嗎？此操作無法復原。', [
      { text: '取消', style: 'cancel' },
      {
        text: '繼續',
        style: 'destructive',
        onPress: () =>
          Alert.alert('最後確認', '即將清除所有記錄，確定嗎？', [
            { text: '取消', style: 'cancel' },
            {
              text: '確定清除',
              style: 'destructive',
              onPress: () => {
                removeAllRecords();
                Alert.alert('完成', '所有工作記錄已清除。');
              },
            },
          ]),
      },
    ]);
  }

  function handleResetAll() {
    Alert.alert(
      '重置全部資料',
      '確定要清除所有地點資料與記錄嗎？此操作無法復原。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '繼續',
          style: 'destructive',
          onPress: () =>
            Alert.alert('最後確認', '即將清除全部資料，確定嗎？', [
              { text: '取消', style: 'cancel' },
              {
                text: '確定全部清除',
                style: 'destructive',
                onPress: () => {
                  deleteAllPlaces();
                  removeAllRecords();
                  reloadPlaces();
                  Alert.alert('完成', '所有資料已清除。');
                },
              },
            ]),
        },
      ],
    );
  }

  const appVersion =
    Constants.expoConfig?.version ?? Constants.manifest?.version ?? '';

  return (
    <View style={styles.container}>
      <Text style={styles.section}>資料管理</Text>
      <TouchableOpacity style={styles.btn} onPress={handleResetRecords}>
        <Text style={styles.btnText}>清除所有工作記錄</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btn, styles.dangerBtn]}
        onPress={handleResetAll}
      >
        <Text style={[styles.btnText, styles.dangerText]}>
          重置全部資料（含地點）
        </Text>
      </TouchableOpacity>

      <Text style={styles.section}>功能</Text>
      <TouchableOpacity style={styles.btn} onPress={() => router.push('/export')}>
        <Text style={styles.btnText}>匯出記錄 CSV</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => router.push('/help')}>
        <Text style={styles.btnText}>說明與教學</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>版本：{appVersion}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  section: {
    fontSize: 13,
    color: '#888',
    marginTop: 20,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  btn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  btnText: { fontSize: 15, color: '#222' },
  dangerBtn: { borderColor: '#e44' },
  dangerText: { color: '#e44' },
  versionText: {
    textAlign: 'center',
    color: '#bbb',
    marginTop: 40,
    fontSize: 13,
  },
});
