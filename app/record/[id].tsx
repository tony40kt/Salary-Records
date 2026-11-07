import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRecords } from '../../src/hooks/useRecords';
import { usePlaces } from '../../src/hooks/usePlaces';
import type { Record } from '../../src/types/record';
import type { Place } from '../../src/types/place';
import {
  calculateRecordSalary,
  calculateTotalHours,
  formatMoney,
} from '../../src/utils/salaryUtils';
import {
  formatDate,
  formatDisplayDate,
  parseNonNegativeNumber,
} from '../../src/utils/dateUtils';

/** 記錄詳情頁面（可編輯） */
export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getById, remove, update } = useRecords();
  const { places, load: loadPlaces } = usePlaces();

  const [record, setRecord] = useState<Record | null>(null);
  const [editing, setEditing] = useState(false);

  const [workDate, setWorkDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [regularHours, setRegularHours] = useState('0');
  const [semiProcessedHours, setSemiProcessedHours] = useState('0');
  const [doubleShiftHours, setDoubleShiftHours] = useState('0');
  const [hourlyWage, setHourlyWage] = useState('0');
  const [extraTransportFee, setExtraTransportFee] = useState('0');

  useEffect(() => {
    loadPlaces();
  }, [loadPlaces]);

  useEffect(() => {
    const recordId = parseInt(id ?? '0', 10);
    const data = getById(recordId);
    setRecord(data);

    if (data) {
      setWorkDate(new Date(data.workDate));
      setRegularHours(String(data.regularHours));
      setSemiProcessedHours(String(data.semiProcessedHours));
      setDoubleShiftHours(String(data.doubleShiftHours));
      setHourlyWage(String(data.hourlyWage));
      setExtraTransportFee(String(data.extraTransportFee ?? 0));
    }
  }, [id, getById]);

  useEffect(() => {
    if (!record || places.length === 0) return;
    const matched = places.find((p) => p.id === record.placeId) ?? null;
    setSelectedPlace(matched);
  }, [record, places]);

  function handleDateChange(_: unknown, date?: Date) {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) setWorkDate(date);
  }

  function handleDelete() {
    if (!record) return;

    Alert.alert('刪除記錄', `確定要刪除「${record.workDate}」的記錄嗎？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => {
          remove(record.id);
          router.back();
        },
      },
    ]);
  }

  const previewRecord = useMemo(() => {
    if (!selectedPlace) return null;

    const parsedRegular = parseNonNegativeNumber(regularHours, { emptyAsZero: true });
    const parsedSemi = parseNonNegativeNumber(semiProcessedHours, { emptyAsZero: true });
    const parsedDouble = parseNonNegativeNumber(doubleShiftHours, { emptyAsZero: true });
    const parsedWage = parseNonNegativeNumber(hourlyWage);
    const parsedExtra = parseNonNegativeNumber(extraTransportFee, { emptyAsZero: true });

    if (
      parsedRegular === null ||
      parsedSemi === null ||
      parsedDouble === null ||
      parsedWage === null ||
      parsedExtra === null
    ) {
      return null;
    }

    const totalTransportFee = selectedPlace.transportFee + parsedExtra;

    return {
      workDate: formatDate(workDate),
      placeId: selectedPlace.id,
      placeName: selectedPlace.placeName,
      placeCode: selectedPlace.placeCode,
      transportFee: totalTransportFee,
      extraTransportFee: parsedExtra,
      regularHours: parsedRegular,
      semiProcessedHours: parsedSemi,
      doubleShiftHours: parsedDouble,
      hourlyWage: parsedWage,
    };
  }, [
    selectedPlace,
    workDate,
    regularHours,
    semiProcessedHours,
    doubleShiftHours,
    hourlyWage,
    extraTransportFee,
  ]);

  function handleSaveEdit() {
    if (!record) return;
    if (!selectedPlace) {
      Alert.alert('請選擇工作地點');
      return;
    }
    if (!previewRecord) {
      Alert.alert('請確認輸入資料正確（數值需為 0 或正數，時薪需有效）');
      return;
    }
    if (previewRecord.hourlyWage <= 0) {
      Alert.alert('請填寫有效的正常時薪');
      return;
    }

    const ok = update(record.id, previewRecord);
    if (ok) {
      const refreshed = getById(record.id);
      setRecord(refreshed);
      setEditing(false);
      Alert.alert('更新成功');
    } else {
      Alert.alert('更新失敗，請重試');
    }
  }

  if (!record) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>找不到此記錄</Text>
      </View>
    );
  }

  const displayRecord = previewRecord ?? record;
  const totalHours = calculateTotalHours(displayRecord);
  const totalSalary = calculateRecordSalary(displayRecord);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!editing ? (
        <>
          <View style={styles.card}>
            <Row label="工作日期" value={record.workDate} />
            <Row label="工作地點" value={record.placeName} />
            <Row label="地點代碼" value={record.placeCode} />
            <Row label="地點車資" value={formatMoney(record.transportFee)} />
            <Row label="額外車資" value={formatMoney(record.extraTransportFee ?? 0)} />
            <Row label="日常鐘點" value={record.regularHours.toFixed(2)} />
            <Row label="半加工鐘點" value={record.semiProcessedHours.toFixed(2)} />
            <Row label="雙工鐘點" value={record.doubleShiftHours.toFixed(2)} />
            <Row label="總鐘點" value={totalHours.toFixed(2)} />
            <Row label="正常時薪" value={formatMoney(record.hourlyWage)} />
            <Row label="本筆薪資" value={formatMoney(totalSalary)} highlight />
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>計算方式</Text>
            <Text style={styles.noteText}>
              日常 × 1 倍、半加工 × 1.5 倍、雙工 × 2 倍，再加上車資。
            </Text>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Text style={styles.editBtnText}>編輯此記錄</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>刪除此記錄</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.label}>工作日期</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateBtnText}>{formatDisplayDate(workDate)}</Text>
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
          <View style={styles.placeListBox}>
            {places.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.placeItem,
                  selectedPlace?.id === p.id && styles.placeItemSelected,
                ]}
                onPress={() => setSelectedPlace(p)}
              >
                <Text style={styles.placeName}>{p.placeName}</Text>
                <Text style={styles.placeSub}>代碼：{p.placeCode}　車資：{formatMoney(p.transportFee)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>額外車資</Text>
          <TextInput
            style={styles.input}
            value={extraTransportFee}
            onChangeText={setExtraTransportFee}
            keyboardType="decimal-pad"
            placeholder="例如：0 或 10.5"
          />

          <Text style={styles.label}>日常鐘點</Text>
          <TextInput
            style={styles.input}
            value={regularHours}
            onChangeText={setRegularHours}
            keyboardType="decimal-pad"
            placeholder="例如：8 或 8.5"
          />

          <Text style={styles.label}>半加工鐘點</Text>
          <TextInput
            style={styles.input}
            value={semiProcessedHours}
            onChangeText={setSemiProcessedHours}
            keyboardType="decimal-pad"
            placeholder="例如：1.5"
          />

          <Text style={styles.label}>雙工鐘點</Text>
          <TextInput
            style={styles.input}
            value={doubleShiftHours}
            onChangeText={setDoubleShiftHours}
            keyboardType="decimal-pad"
            placeholder="例如：2"
          />

          <Text style={styles.label}>正常時薪 *</Text>
          <TextInput
            style={styles.input}
            value={hourlyWage}
            onChangeText={setHourlyWage}
            keyboardType="decimal-pad"
            placeholder="例如：95 或 100.5"
          />

          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>編輯預覽</Text>
            <Text style={styles.summaryRow}>車資：{formatMoney(displayRecord.transportFee)}</Text>
            <Text style={styles.summaryRow}>總鐘點：{totalHours.toFixed(2)}</Text>
            <Text style={styles.summaryRow}>預估薪資：{formatMoney(totalSalary)}</Text>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit}>
            <Text style={styles.saveBtnText}>儲存修改</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
            <Text style={styles.cancelBtnText}>取消編輯</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.highlightValue]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  content: { padding: 16, paddingBottom: 32 },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowLabel: { fontSize: 15, color: '#888', flex: 1 },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    flex: 1,
    textAlign: 'right',
  },
  highlightValue: {
    color: '#0f766e',
    fontWeight: '700',
  },

  noteBox: {
    marginTop: 16,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 14,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    color: '#1d4ed8',
  },
  noteText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },

  editBtn: {
    marginTop: 16,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7dd3fc',
  },
  editBtnText: {
    color: '#0369a1',
    fontSize: 15,
    fontWeight: '600',
  },

  deleteBtn: {
    marginTop: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  deleteBtnText: { color: '#dc2626', fontSize: 15, fontWeight: '600' },

  label: { fontSize: 14, color: '#555', marginBottom: 6, marginTop: 14 },
  dateBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateBtnText: { fontSize: 15 },

  placeListBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  placeItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 12,
  },
  placeItemSelected: {
    backgroundColor: '#eff6ff',
  },
  placeName: { fontSize: 15, fontWeight: '600' },
  placeSub: { fontSize: 13, color: '#666', marginTop: 2 },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
  },

  summary: {
    marginTop: 16,
    padding: 14,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  summaryTitle: { fontWeight: '700', fontSize: 14, marginBottom: 6 },
  summaryRow: { fontSize: 14, color: '#333', marginBottom: 4 },

  saveBtn: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  cancelBtn: {
    marginTop: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  cancelBtnText: { color: '#334155', fontSize: 15, fontWeight: '600' },
});