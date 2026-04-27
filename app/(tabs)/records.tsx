import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useRecords } from '../../src/hooks/useRecords';

/** 工作記錄清單頁 — 列表、搜尋、刪除 */
export default function RecordsScreen() {
  const router = useRouter();
  const { records, load, remove, search } = useRecords();
  const [keyword, setKeyword] = useState('');

  // 每次畫面獲得焦點（從新增/編輯頁返回、切 tab 回來）就 reload
  useFocusEffect(
    useCallback(() => {
      load();
      // 可選：return () => {} 做清理
    }, [load]),
  );

  function handleDelete(id: number, date: string) {
    Alert.alert('刪除記錄', `確定要刪除「${date}」的記錄嗎？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => remove(id),
      },
    ]);
  }

  function handleSearch(text: string) {
    setKeyword(text);
    search(text);
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="搜尋地點或日期…"
        value={keyword}
        onChangeText={handleSearch}
        clearButtonMode="while-editing"
      />
      <FlatList
        data={records}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.empty}>尚無記錄，請點下方「＋」新增</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.info}
              onPress={() => router.push(`/record/${item.id}`)}
            >
              <Text style={styles.date}>{item.workDate}</Text>
              <Text style={styles.sub}>
                {item.placeName}　代碼：{item.placeCode}　車資：${item.transportFee}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id, item.workDate)}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteText}>刪除</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push('/record/new')}
      >
        <Text style={styles.addBtnText}>＋ 新增記錄</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchInput: {
    margin: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 15,
  },
  empty: { textAlign: 'center', marginTop: 40, color: '#888', fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  info: { flex: 1 },
  date: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 13, color: '#666', marginTop: 2 },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  deleteText: { color: '#e44', fontSize: 14 },
  addBtn: {
    margin: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});