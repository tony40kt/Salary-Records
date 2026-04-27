import { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePlaces } from '../../src/hooks/usePlaces';
import { parseTransportFee } from '../../src/utils/dateUtils';

export default function NewPlaceScreen() {
  const router = useRouter();
  const { add } = usePlaces();

  const [placeName, setPlaceName] = useState('');
  const [placeCode, setPlaceCode] = useState('');
  const [transportFee, setTransportFee] = useState('');

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

    try {
      add({
        placeName: placeName.trim(),
        placeCode: placeCode.trim(),
        transportFee: fee,
      });
      router.back();
    } catch (e) {
      const message = e instanceof Error ? e.message : '儲存失敗，請重試';
      Alert.alert('儲存失敗', message);
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
          placeholder="例如：總公司"
          value={placeName}
          onChangeText={setPlaceName}
        />

        <Text style={styles.label}>地點代碼 *</Text>
        <TextInput
          style={styles.input}
          placeholder="例如：20251189"
          value={placeCode}
          onChangeText={setPlaceCode}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>地點車資（$）</Text>
        <TextInput
          style={styles.input}
          placeholder="例如：50"
          value={transportFee}
          onChangeText={setTransportFee}
          keyboardType="decimal-pad"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>儲存地點</Text>
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
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  saveBtn: {
    marginTop: 30,
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});