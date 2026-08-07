import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePlaces } from '../../src/hooks/usePlaces';
import { useRecords } from '../../src/hooks/useRecords';
import { useSettings } from '../../src/hooks/useSettings';
import {
  formatDate,
  formatDisplayDate,
  parseNonNegativeNumber,
} from '../../src/utils/dateUtils';
import type { Place } from '../../src/types/place';
import {
  calculateRecordSalary,
  formatMoney,
} from '../../src/utils/salaryUtils';

/** 新增工作記錄頁面 */
export default function NewRecordScreen() {
  const router = useRouter();
  const { places, load: loadPlaces } = usePlaces();
  const { add } = useRecords();
  const { loadDefaultHourlyWage } = useSettings();

  const [workDate, setWorkDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const [regularHours, setRegularHours] = useState('10');
  const [semiProcessedHours, setSemiProcessedHours] = useState('0');
  const [doubleShiftHours, setDoubleShiftHours] = useState('0');
  const [hourlyWage, setHourlyWage] = useState('');

  const [placeKeyword, setPlaceKeyword] = useState('');
  const [showPlaceResults, setShowPlaceResults] = useState(true);

  useEffect(() => {
    loadPlaces();

    const defaultWage = loadDefaultHourlyWage();
    if (defaultWage !== null) {
      setHourlyWage(String(defaultWage));
    }
  }, [loadPlaces, loadDefaultHourlyWage]);

  function handleDateChange(_: unknown, date?: Date) {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) setWorkDate(date);
  }

  const filteredPlaces = useMemo(() => {
    const keyword = placeKeyword.trim().toLowerCase();

    if (!keyword) {
      return places.slice(0, 5);
    }

    return places.filter((p) => {
      return (
        p.placeName.toLowerCase().includes(keyword) ||
        p.placeCode.toLowerCase().includes(keyword)
      );
    });
  }, [places, placeKeyword]);

  const previewSalary = useMemo(() => {
    if (!selectedPlace) return null;

    const parsedRegular = parseNonNegativeNumber(regularHours, {
      emptyAsZero: true,
    });
    const parsedSemi = parseNonNegativeNumber(semiProcessedHours, {
      emptyAsZero: true,
    });
    const parsedDouble = parseNonNegativeNumber(doubleShiftHours, {
      emptyAsZero: true,
    });
    const parsedWage = parseNonNegativeNumber(hourlyWage);

    if (
      parsedRegular === null ||
      parsedSemi === null ||
      parsedDouble === null ||
      parsedWage === null
    ) {
      return null;
    }

    return calculateRecordSalary({
      transportFee: selectedPlace.transportFee,
      regularHours: parsedRegular,
      semiProcessedHours: parsedSemi,
      doubleShiftHours: parsedDouble,
      hourlyWage: parsedWage,
    });
  }, [
    selectedPlace,
    regularHours,
    semiProcessedHours,
    doubleShiftHours,
    hourlyWage,
  ]);

  function handleSelectPlace(place: Place) {
    Keyboard.dismiss();
    setSelectedPlace(place);
    setShowPlaceResults(false);
    setPlaceKeyword(`${place.placeName} (${place.placeCode})`);
  }

  function handleSave() {
    Keyboard.dismiss();

    if (!selectedPlace) {
      Alert.alert('請選擇工作地點');
      return;
    }

    const parsedRegular = parseNonNegativeNumber(regularHours, {
      emptyAsZero: true,
    });
    const parsedSemi = parseNonNegativeNumber(semiProcessedHours, {
      emptyAsZero: true,
    });
    const parsedDouble = parseNonNegativeNumber(doubleShiftHours, {
      emptyAsZero: true,
    });
    const parsedWage = parseNonNegativeNumber(hourlyWage);

    if (
      parsedRegular === null ||
      parsedSemi === null ||
      parsedDouble === null
    ) {
      Alert.alert('鐘點必須為 0 或正數，可輸入小數');
      return;
    }

    if (parsedWage === null || parsedWage <= 0) {
      Alert.alert('請填寫有效的正常時薪');
      return;
    }

    const result = add({
      workDate: formatDate(workDate),
      placeId: selectedPlace.id,
      placeName: selectedPlace.placeName,
      placeCode: selectedPlace.placeCode,
      transportFee: selectedPlace.transportFee,
      regularHours: parsedRegular,
      semiProcessedHours: parsedSemi,
      doubleShiftHours: parsedDouble,
      hourlyWage: parsedWage,
    });

    if (result) {
      router.back();
    } else {
      Alert.alert('儲存失敗，請重試');
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>工作日期</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => {
              Keyboard.dismiss();
              setShowDatePicker(true);
            }}
          >
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

          <Text style={styles.label}>搜尋工作地點</Text>
          <TextInput
            style={styles.input}
            value={placeKeyword}
            onChangeText={(text) => {
              setPlaceKeyword(text);
              setShowPlaceResults(true);
              if (selectedPlace && text !== `${selectedPlace.placeName} (${selectedPlace.placeCode})`) {
                setSelectedPlace(null);
              }
            }}
            placeholder="輸入地點名稱或代碼"
            clearButtonMode="while-editing"
            onFocus={() => setShowPlaceResults(true)}
          />

          <Text style={styles.label}>選擇工作地點</Text>
          {places.length === 0 ? (
            <Text style={styles.hint}>
              尚無地點資料，請先至「地點管理」新增地點。
            </Text>
          ) : showPlaceResults ? (
            filteredPlaces.length === 0 ? (
              <Text style={styles.hint}>找不到符合的工作地點。</Text>
            ) : (
              <View style={styles.placeListBox}>
                <ScrollView nestedScrollEnabled style={styles.placeListScroll}>
                  {filteredPlaces.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.placeItem,
                        selectedPlace?.id === p.id && styles.placeItemSelected,
                      ]}
                      onPress={() => handleSelectPlace(p)}
                    >
                      <Text style={styles.placeName}>{p.placeName}</Text>
                      <Text style={styles.placeSub}>
                        代碼：{p.placeCode}　車資：${p.transportFee}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )
          ) : (
            <TouchableOpacity
              style={styles.reopenBtn}
              onPress={() => setShowPlaceResults(true)}
            >
              <Text style={styles.reopenBtnText}>重新選擇工作地點</Text>
            </TouchableOpacity>
          )}

          {!placeKeyword.trim() && places.length > 5 && showPlaceResults && (
            <Text style={styles.helperText}>
              目前僅顯示前 5 個工作地點，可輸入名稱或代碼進行搜尋。
            </Text>
          )}

          {selectedPlace && (
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>已選擇地點資訊</Text>
              <Text style={styles.summaryRow}>地點：{selectedPlace.placeName}</Text>
              <Text style={styles.summaryRow}>代碼：{selectedPlace.placeCode}</Text>
              <Text style={styles.summaryRow}>車資：${selectedPlace.transportFee}</Text>
            </View>
          )}

          <Text style={styles.label}>日常鐘點</Text>
          <TextInput
            style={styles.input}
            value={regularHours}
            onChangeText={setRegularHours}
            placeholder="例如：8 或 8.5"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>半加工鐘點</Text>
          <TextInput
            style={styles.input}
            value={semiProcessedHours}
            onChangeText={setSemiProcessedHours}
            placeholder="例如：1.5"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>雙工鐘點</Text>
          <TextInput
            style={styles.input}
            value={doubleShiftHours}
            onChangeText={setDoubleShiftHours}
            placeholder="例如：2"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>正常時薪 *</Text>
          <TextInput
            style={styles.input}
            value={hourlyWage}
            onChangeText={setHourlyWage}
            placeholder="例如：95 或 100.5"
            keyboardType="decimal-pad"
          />

          {selectedPlace && (
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>本筆記錄預覽</Text>
              <Text style={styles.summaryRow}>
                預估薪資：
                {previewSalary !== null ? formatMoney(previewSalary) : '請完成輸入'}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>儲存記錄</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, color: '#555', marginBottom: 6, marginTop: 14 },
  dateBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateBtnText: { fontSize: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  hint: { color: '#888', fontSize: 14, marginTop: 6 },
  helperText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
  placeListBox: {
    maxHeight: 240,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  placeListScroll: {
    maxHeight: 240,
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
  reopenBtn: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  reopenBtnText: {
    color: '#1d4ed8',
    fontSize: 14,
    fontWeight: '600',
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
    marginTop: 30,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});