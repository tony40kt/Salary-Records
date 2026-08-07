import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from 'expo-router';
import { useRecords } from '../../src/hooks/useRecords';
import {
  formatDate,
  formatDisplayDate,
  formatDisplayDateFromString,
} from '../../src/utils/dateUtils';
import { calculateRecordSalary, formatMoney } from '../../src/utils/salaryUtils';

type Mode = 'month' | 'range';

function getMonthRange(baseDate: Date) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

export default function SettlementScreen() {
  const { records, load } = useRecords();

  const [mode, setMode] = useState<Mode>('month');
  const [monthDate, setMonthDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filteredRecords = useMemo(() => {
    let start = '';
    let end = '';

    if (mode === 'month') {
      const range = getMonthRange(monthDate);
      start = range.start;
      end = range.end;
    } else {
      start = formatDate(startDate);
      end = formatDate(endDate);
    }

    return records.filter((record) => record.workDate >= start && record.workDate <= end);
  }, [records, mode, monthDate, startDate, endDate]);

  const summary = useMemo(() => {
    return filteredRecords.reduce(
      (acc, record) => {
        acc.count += 1;
        acc.regularHours += record.regularHours;
        acc.semiProcessedHours += record.semiProcessedHours;
        acc.doubleShiftHours += record.doubleShiftHours;
        acc.transportFee += record.transportFee;
        acc.totalSalary += calculateRecordSalary(record);
        return acc;
      },
      {
        count: 0,
        regularHours: 0,
        semiProcessedHours: 0,
        doubleShiftHours: 0,
        transportFee: 0,
        totalSalary: 0,
      },
    );
  }, [filteredRecords]);

  const currentMonthLabel = `${monthDate.getFullYear()}年${monthDate.getMonth() + 1}月`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>薪資結算</Text>
      <Text style={styles.subtitle}>支援月結算與日期區間結算</Text>

      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switchBtn, mode === 'month' && styles.switchBtnActive]}
          onPress={() => setMode('month')}
        >
          <Text style={[styles.switchText, mode === 'month' && styles.switchTextActive]}>
            月結算
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchBtn, mode === 'range' && styles.switchBtnActive]}
          onPress={() => setMode('range')}
        >
          <Text style={[styles.switchText, mode === 'range' && styles.switchTextActive]}>
            日期區間
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'month' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>選擇月份</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowMonthPicker(true)}
          >
            <Text style={styles.dateBtnText}>{currentMonthLabel}</Text>
          </TouchableOpacity>

          {showMonthPicker && (
            <DateTimePicker
              value={monthDate}
              mode="date"
              display="spinner"
              onChange={(_, date) => {
                setShowMonthPicker(Platform.OS === 'ios');
                if (date) setMonthDate(date);
              }}
              locale="zh-Hant"
            />
          )}
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>選擇日期區間</Text>

          <Text style={styles.label}>開始日期</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.dateBtnText}>{formatDisplayDate(startDate)}</Text>
          </TouchableOpacity>

          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="spinner"
              onChange={(_, date) => {
                setShowStartPicker(Platform.OS === 'ios');
                if (date) setStartDate(date);
              }}
              locale="zh-Hant"
            />
          )}

          <Text style={styles.label}>結束日期</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.dateBtnText}>{formatDisplayDate(endDate)}</Text>
          </TouchableOpacity>

          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="spinner"
              onChange={(_, date) => {
                setShowEndPicker(Platform.OS === 'ios');
                if (date) setEndDate(date);
              }}
              locale="zh-Hant"
            />
          )}
        </View>
      )}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>結算結果</Text>
        <SummaryRow label="記錄筆數" value={`${summary.count} 筆`} />
        <SummaryRow label="日常鐘點總和" value={summary.regularHours.toFixed(2)} />
        <SummaryRow label="半加工鐘點總和" value={summary.semiProcessedHours.toFixed(2)} />
        <SummaryRow label="雙工鐘點總和" value={summary.doubleShiftHours.toFixed(2)} />
        <SummaryRow label="車資總和" value={formatMoney(summary.transportFee)} />
        <SummaryRow
          label="應獲薪資總和"
          value={formatMoney(summary.totalSalary)}
          highlight
        />
      </View>

      <View style={styles.listCard}>
        <Text style={styles.listTitle}>本次結算明細</Text>
        {filteredRecords.length === 0 ? (
          <Text style={styles.empty}>此範圍內沒有記錄</Text>
        ) : (
          filteredRecords.map((record) => (
            <View key={record.id} style={styles.recordItem}>
              <Text style={styles.recordDate}>
                {formatDisplayDateFromString(record.workDate)}
              </Text>
              <Text style={styles.recordText}>
                {record.placeName}／薪資 {formatMoney(calculateRecordSalary(record))}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, highlight && styles.summaryValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 20 },
  switchRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  switchBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  switchBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  switchText: { color: '#334155', fontWeight: '600' },
  switchTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 14, color: '#555', marginBottom: 6, marginTop: 10 },
  dateBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateBtnText: { fontSize: 15 },
  summaryCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#86efac',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#166534',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: { fontSize: 14, color: '#374151' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  summaryValueHighlight: { color: '#0f766e', fontSize: 16 },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  listTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  empty: { color: '#888', fontSize: 14 },
  recordItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  recordDate: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  recordText: { fontSize: 13, color: '#475569' },
});