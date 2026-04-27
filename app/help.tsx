import { ScrollView, View, Text, StyleSheet } from 'react-native';

const STEPS = [
  {
    title: '① 新增工作地點',
    content:
      '進入「地點管理」頁，點按「＋ 新增地點」，填寫地點名稱、代碼及車資，再按「儲存地點」。',
  },
  {
    title: '② 新增工作記錄',
    content:
      '進入「工作記錄」頁，點按「＋ 新增記錄」，選擇工作日期及地點，地點代碼與車資會自動填入，再按「儲存記錄」。',
  },
  {
    title: '③ 查看記錄詳情',
    content:
      '在「工作記錄」頁，點按任意一筆記錄，即可查看完整詳情（日期、地點、代碼、車資）。',
  },
  {
    title: '④ 搜尋記錄',
    content:
      '在「工作記錄」頁上方的搜尋框，輸入地點名稱、代碼或日期即可快速篩選。',
  },
  {
    title: '⑤ 匯出 CSV',
    content:
      '進入「設定」頁，點按「匯出記錄 CSV」，再點按「匯出 CSV 並分享」。系統會開啟分享選單，可傳送至郵件或雲端儲存。',
  },
  {
    title: '⑥ 刪除記錄或地點',
    content:
      '在清單頁按「刪除」按鈕，系統會再次確認，確定後才會刪除。刪除地點不會自動刪除相關記錄。',
  },
  {
    title: '⑦ 重置全部資料',
    content:
      '進入「設定」頁，點按「重置全部資料」，需確認兩次才會清除所有地點與記錄，此操作無法復原，請謹慎使用。',
  },
];

const FAQ = [
  {
    q: '資料會上傳到雲端嗎？',
    a: '不會。所有資料都存放在您的手機本機，完全離線。',
  },
  {
    q: '重新安裝 App 後資料還在嗎？',
    a: '重新安裝後手機本機資料庫會清除，建議定期匯出 CSV 備份。',
  },
  {
    q: 'CSV 亂碼怎麼辦？',
    a: '請用 Google 試算表開啟，或在 Excel 中選擇「UTF-8」編碼開啟。',
  },
];

/** 說明與教學頁面 */
export default function HelpScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>操作說明</Text>
      <Text style={styles.subtitle}>按照以下步驟即可快速上手：</Text>

      {STEPS.map((step) => (
        <View key={step.title} style={styles.card}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepContent}>{step.content}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>常見問題</Text>
      {FAQ.map((item) => (
        <View key={item.q} style={styles.faqCard}>
          <Text style={styles.faqQ}>Q：{item.q}</Text>
          <Text style={styles.faqA}>A：{item.a}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 20 },
  card: {
    backgroundColor: '#f8faff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  stepTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  stepContent: { fontSize: 14, color: '#444', lineHeight: 22 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  faqQ: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  faqA: { fontSize: 14, color: '#555', lineHeight: 20 },
});
