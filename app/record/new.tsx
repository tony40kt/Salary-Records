import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePlaces } from '../../src/hooks/usePlaces';
import { useRecords } from '../../src/hooks/useRecords';
import { formatDate } from '../../src/utils/dateUtils';
import type { Place } from '../../src/types/place';

/** 新增工作記錄頁面 */
export default function NewRecordScreen() {
  const router = useRouter();
  const { places, load: loadPlaces } = usePlaces();
  const { add } = useRecords();

  const [workDate, setWorkDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  function handleDateChange(_: unknown, date?: Date) {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) setWorkDate(date);
  }

  function handleSave() {
    if (!selectedPlace) {
      Alert.alert('請選擇工作地點');
      return;
    }
    const result = add({
      workDate: formatDate(workDate),
      placeId: selectedPlace.id,
      placeName: selectedPlace.placeName,
      placeCode: selectedPlace.placeCode,
      transportFee: selectedPlace.transportFee,
    });
    if (result) {
      router.back();
    } else {
      Alert.alert('儲存失敗，請重試');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>工作日期</Text>
      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateBtnText}>{formatDate(workDate)}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={workDate}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
          locale="zh-Hant"
        />
      )}

      <Text style={styles.label}>選擇工作地點</Text>
      {places.length === 0 ? (
        <Text style={styles.hint}>
          尚無地點資料，請先至「地點管理」新增地點。
        </Text>
      ) : (
        places.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.placeItem,
              selectedPlace?.id === p.id && styles.placeItemSelected,
            ]}
            onPress={() => setSelectedPlace(p)}
          >
            <Text style={styles.placeName}>{p.placeName}</Text>
            <Text style={styles.placeSub}>
              代碼：{p.placeCode}　車資：${p.transportFee}
            </Text>
          </TouchableOpacity>
        ))
      )}

      {selectedPlace && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>已選擇地點資訊</Text>
          <Text style={styles.summaryRow}>地點：{selectedPlace.placeName}</Text>
          <Text style={styles.summaryRow}>代碼：{selectedPlace.placeCode}</Text>
          <Text style={styles.summaryRow}>車資：${selectedPlace.transportFee}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>儲存記錄</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  label: { fontSize: 14, color: '#555', marginBottom: 6, marginTop: 14 },
  dateBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateBtnText: { fontSize: 15 },
  hint: { color: '#888', fontSize: 14, marginTop: 6 },
  placeItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  placeItemSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  placeName: { fontSize: 15, fontWeight: '600' },
  placeSub: { fontSize: 13, color: '#666', marginTop: 2 },
  summary: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  summaryTitle: { fontWeight: '700', fontSize: 14, marginBottom: 6 },
  summaryRow: { fontSize: 14, color: '#333', marginBottom: 2 },
  saveBtn: {
    marginTop: 30,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
