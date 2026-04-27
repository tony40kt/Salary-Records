import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlaces } from '../../src/hooks/usePlaces';
import { parseTransportFee } from '../../src/utils/dateUtils';

/** 編輯地點頁面（依 id 載入現有資料） */
export default function EditPlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getById, update } = usePlaces();

  const [placeName, setPlaceName] = useState('');
  const [placeCode, setPlaceCode] = useState('');
  const [transportFee, setTransportFee] = useState('');

  useEffect(() => {
    const placeId = parseInt(id ?? '0', 10);
    const place = getById(placeId);
    if (place) {
      setPlaceName(place.placeName);
      setPlaceCode(place.placeCode);
      setTransportFee(String(place.transportFee));
    }
  }, [id, getById]);

  function handleSave() {
    if (!placeName.trim()) {
      Alert.alert('請填寫地點名稱');
      return;
    }
    if (!placeCode.trim()) {
      Alert.alert('請填寫地點代碼');
      return;
    }
    const fee = parseTransportFee(transportFee);
    if (fee === null) {
      Alert.alert('車資必須為有效的非負數字');
      return;
    }
    const placeId = parseInt(id ?? '0', 10);
    const ok = update(placeId, {
      placeName: placeName.trim(),
      placeCode: placeCode.trim(),
      transportFee: fee,
    });
    if (ok) {
      router.back();
    } else {
      Alert.alert('更新失敗，請重試');
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.label}>地點名稱 *</Text>
        <TextInput
          style={styles.input}
          value={placeName}
          onChangeText={setPlaceName}
        />
        <Text style={styles.label}>地點代碼 *</Text>
        <TextInput
          style={styles.input}
          value={placeCode}
          onChangeText={setPlaceCode}
          autoCapitalize="characters"
        />
        <Text style={styles.label}>地點車資（$）</Text>
        <TextInput
          style={styles.input}
          value={transportFee}
          onChangeText={setTransportFee}
          keyboardType="decimal-pad"
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>儲存變更</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  label: { fontSize: 14, color: '#555', marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  saveBtn: {
    marginTop: 30,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
