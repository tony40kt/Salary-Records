import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useRecords } from '../../src/hooks/useRecords';
import { usePlaces } from '../../src/hooks/usePlaces';
import { useSettings } from '../../src/hooks/useSettings';
import { deleteAllPlaces } from '../../src/database/placeDb';
import { parseNonNegativeNumber } from '../../src/utils/dateUtils';

/** 設定頁 — 資料重置、版本資訊、預設時薪 */
export default function SettingsScreen() {
  const router = useRouter();
  const { removeAll: removeAllRecords } = useRecords();
  const { load: reloadPlaces } = usePlaces();
  const {
    defaultHourlyWage,
    loadDefaultHourlyWage,
    saveDefaultHourlyWage,
    removeDefaultHourlyWage,
  } = useSettings();

  const [defaultWageInput, setDefaultWageInput] = useState('');

  useEffect(() => {
    const value = loadDefaultHourlyWage();
    if (value !== null) {
      setDefaultWageInput(String(value));
    }
  }, [loadDefaultHourlyWage]);

  function handleSaveDefaultWage() {
    Keyboard.dismiss();

    const parsed = parseNonNegativeNumber(defaultWageInput);

    if (parsed === null || parsed <= 0) {
      Alert.alert('請輸入有效的預設正常時薪');
      return;
    }

    const ok = saveDefaultHourlyWage(parsed);
    if (ok) {
      Alert.alert('完成', '預設正常時薪已儲存。');
    } else {
      Alert.alert('失敗', '儲存預設正常時薪失敗，請重試。');
    }
  }

  function handleClearDefaultWage() {
    Keyboard.dismiss();

    Alert.alert('清除預設正常時薪', '確定要清除預設正常時薪嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清除',
        style: 'destructive',
        onPress: () => {
          const ok = removeDefaultHourlyWage();
          if (ok) {
            setDefaultWageInput('');
            Alert.alert('完成', '預設正常時薪已清除。');
          } else {
            Alert.alert('失敗', '清除失敗，請重試。');
          }
        },
      },
    ]);
  }

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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.section}>薪資設定</Text>
          <View style={styles.card}>
            <Text style={styles.label}>預設正常時薪</Text>
            <TextInput
              style={styles.input}
              value={defaultWageInput}
              onChangeText={setDefaultWageInput}
              placeholder="例如：95 或 100.5"
              keyboardType="decimal-pad"
            />
            <Text style={styles.helper}>
              新增記錄時，正常時薪會自動帶入這個數值。
            </Text>

            <TouchableOpacity style={styles.btn} onPress={handleSaveDefaultWage}>
              <Text style={styles.btnText}>儲存預設正常時薪</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.secondaryBtn]}
              onPress={handleClearDefaultWage}
            >
              <Text style={[styles.btnText, styles.secondaryBtnText]}>
                清除預設正常時薪
              </Text>
            </TouchableOpacity>

            <Text style={styles.currentValue}>
              目前預設值：
              {defaultHourlyWage !== null ? ` ${defaultHourlyWage}` : ' 尚未設定'}
            </Text>
          </View>

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
          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              Keyboard.dismiss();
              router.push('/export');
            }}
          >
            <Text style={styles.btnText}>匯出記錄 CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              Keyboard.dismiss();
              router.push('/help');
            }}
          >
            <Text style={styles.btnText}>說明與教學</Text>
          </TouchableOpacity>

          <Text style={styles.section}>版本資訊</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>版本：{appVersion || '未設定'}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  section: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 10,
    color: '#222',
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  helper: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    lineHeight: 18,
  },
  currentValue: {
    fontSize: 13,
    color: '#334155',
    marginTop: 10,
  },
  btn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  secondaryBtnText: {
    color: '#334155',
  },
  dangerBtn: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  dangerText: {
    color: '#be123c',
  },
  infoBox: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#444',
  },
});