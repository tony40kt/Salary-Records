import { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePlaces } from '../../src/hooks/usePlaces';

/** 背景資料管理頁 — 地點列表、新增、編輯、刪除 */
export default function PlacesScreen() {
  const router = useRouter();
  const { places, load, remove } = usePlaces();

  useEffect(() => {
    load();
  }, [load]);

  function handleDelete(id: number, name: string) {
    Alert.alert('刪除地點', `確定要刪除「${name}」嗎？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => remove(id),
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={places}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.empty}>尚無地點資料，請點右上角「＋」新增</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.info}
              onPress={() => router.push(`/place/${item.id}`)}
            >
              <Text style={styles.name}>{item.placeName}</Text>
              <Text style={styles.sub}>
                代碼：{item.placeCode}　車資：${item.transportFee}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id, item.placeName)}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteText}>刪除</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push('/place/new')}
      >
        <Text style={styles.addBtnText}>＋ 新增地點</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  empty: { textAlign: 'center', marginTop: 40, color: '#888', fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
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
