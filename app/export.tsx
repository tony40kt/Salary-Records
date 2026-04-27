import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRecords } from '../src/hooks/useRecords';
import { exportRecordsToCsv } from '../src/services/exportService';

/** 匯出記錄頁面 */
export default function ExportScreen() {
  const { records, load, loading } = useRecords();
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  async function handleExport() {
    if (records.length === 0) {
      Alert.alert('沒有記錄', '目前沒有工作記錄可以匯出。');
      return;
    }
    try {
      setExporting(true);
      await exportRecordsToCsv(records);
      Alert.alert('已複製', 'CSV 已複製到剪貼簿，可貼到備忘錄或試算表。');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '匯出失敗，請重試';
      Alert.alert('匯出錯誤', message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>匯出工作記錄</Text>
      <Text style={styles.desc}>
        將目前所有工作記錄匯出為 CSV 檔案，可用 Excel 或 Google 試算表開啟。
      </Text>
      <Text style={styles.count}>
        目前記錄數量：{loading ? '載入中…' : `${records.length} 筆`}
      </Text>

      {exporting ? (
        <ActivityIndicator size="large" color="#2563eb" style={styles.spinner} />
      ) : (
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Text style={styles.exportBtnText}>匯出 CSV 並分享</Text>
        </TouchableOpacity>
      )}

      <View style={styles.note}>
        <Text style={styles.noteTitle}>注意事項</Text>
        <Text style={styles.noteText}>• CSV 檔案包含：日期、地點、代碼、車資</Text>
        <Text style={styles.noteText}>• 匯出後可選擇傳送至郵件、雲端或其他 App</Text>
        <Text style={styles.noteText}>• 匯出不會刪除手機內的記錄</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  desc: { fontSize: 15, color: '#555', lineHeight: 22, marginBottom: 16 },
  count: { fontSize: 15, color: '#333', marginBottom: 24 },
  spinner: { marginVertical: 24 },
  exportBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 30,
  },
  exportBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  note: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
  },
  noteTitle: { fontWeight: '700', marginBottom: 8, fontSize: 14 },
  noteText: { fontSize: 13, color: '#666', marginBottom: 4, lineHeight: 20 },
});
