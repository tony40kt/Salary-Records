import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRecords } from '../../src/hooks/useRecords';
import type { Record } from '../../src/types/record';
import {
  calculateRecordSalary,
  calculateTotalHours,
  formatMoney,
} from '../../src/utils/salaryUtils';

/** 記錄詳情頁面 */
export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getById, remove } = useRecords();
  const [record, setRecord] = useState<Record | null>(null);

  useEffect(() => {
    const recordId = parseInt(id ?? '0', 10);
    const data = getById(recordId);
    setRecord(data);
  }, [id, getById]);

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

  if (!record) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>找不到此記錄</Text>
      </View>
    );
  }

  const totalHours = calculateTotalHours(record);
  const totalSalary = calculateRecordSalary(record);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Row label="工作日期" value={record.workDate} />
        <Row label="工作地點" value={record.placeName} />
        <Row label="地點代碼" value={record.placeCode} />
        <Row label="地點車資" value={formatMoney(record.transportFee)} />
        <Row label="日常鐘點" value={record.regularHours.toFixed(2)} />
        <Row label="半加工鐘點" value={record.semiProcessedHours.toFixed(2)} />
        <Row label="雙工鐘點" value={record.doubleShiftHours.toFixed(2)} />
        <Row label="總鐘點" value={totalHours.toFixed(2)} />
        <Row label="正常時薪" value={formatMoney(record.hourlyWage)} />
        <Row label="本筆薪資" value={formatMoney(totalSalary)} highlight />
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>計算方式</Text>
        <Text style={styles.noteText}>日常 × 1 倍、半加工 × 1.5 倍、雙工 × 2 倍，再加上車資。</Text>
      </View>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteBtnText}>刪除此記錄</Text>
      </TouchableOpacity>
    </View>
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
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
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
  deleteBtn: {
    marginTop: 24,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  deleteBtnText: { color: '#dc2626', fontSize: 15, fontWeight: '600' },
});