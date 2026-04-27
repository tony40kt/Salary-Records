import { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { usePlaces } from '../../src/hooks/usePlaces';

export default function PlacesScreen() {
  const router = useRouter();
  const { places, load, remove } = usePlaces();
  const [keyword, setKeyword] = useState('');

  // ✅ 每次回到此頁（新增/編輯返回、切 tab 回來）就重新載入
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return places;
    return places.filter(
      (p) =>
        p.placeName.toLowerCase().includes(k) ||
        p.placeCode.toLowerCase().includes(k),
    );
  }, [places, keyword]);

  function handleDelete(id: number, name: string) {
    Alert.alert('刪除地點', `確定要刪除「${name}」嗎？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => {
          try {
            remove(id);
          } catch (e) {
            const message = e instanceof Error ? e.message : '刪除失敗，請重試';
            Alert.alert('無法刪除', message);
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="搜尋地點名稱或代碼…"
        value={keyword}
        onChangeText={setKeyword}
        clearButtonMode="while-editing"
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={filtered.length === 0 ? styles.listEmpty : undefined}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>尚無地點資料</Text>
            <Text style={styles.emptyDesc}>點下方按鈕新增第一個地點。</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardMain}
              onPress={() => router.push(`/place/${item.id}`)}
              activeOpacity={0.85}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.placeName}</Text>
                <Text style={styles.sub}>
                  代碼：{item.placeCode}　車資：${item.transportFee}
                </Text>
              </View>
              <View style={styles.chevronWrap}>
                <Text style={styles.chevron}>{'>'}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.editBtn]}
                onPress={() => router.push(`/place/${item.id}`)}
              >
                <Text style={styles.editText}>編輯</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => handleDelete(item.id, item.placeName)}
              >
                <Text style={styles.deleteText}>刪除</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push('/place/new')}
        activeOpacity={0.9}
      >
        <Text style={styles.addBtnText}>＋ 新增地點</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb' },
  searchInput: {
    margin: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e8ef',
    backgroundColor: '#fff',
    fontSize: 15,
  },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  emptyWrap: { paddingHorizontal: 24, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  emptyDesc: { marginTop: 8, color: '#666', textAlign: 'center' },
  card: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6e8ef',
    overflow: 'hidden',
  },
  cardMain: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  name: { fontSize: 16, fontWeight: '700', color: '#111' },
  sub: { marginTop: 4, fontSize: 13, color: '#667085' },
  chevronWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f1f3f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  chevron: { color: '#667085', fontSize: 14, fontWeight: '800' },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  editBtn: { backgroundColor: '#f6f7ff', borderColor: '#dfe3ff' },
  editText: { color: '#2f3cff', fontWeight: '700' },
  deleteBtn: { backgroundColor: '#fff5f5', borderColor: '#ffd5d5' },
  deleteText: { color: '#d92d20', fontWeight: '700' },
  addBtn: {
    margin: 16,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});