import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { Record } from '../types/record';

const CSV_HEADER = '工作日期,工作地點,地點代碼,地點車資\n';

/** 將記錄陣列轉換為 CSV 字串 */
function recordsToCsv(records: Record[]): string {
  const rows = records.map((r) =>
    [r.workDate, r.placeName, r.placeCode, r.transportFee].join(','),
  );
  return CSV_HEADER + rows.join('\n');
}

/**
 * 匯出記錄為 CSV 並開啟系統分享對話框。
 * @param records 要匯出的記錄清單
 */
export async function exportRecordsToCsv(records: Record[]): Promise<void> {
  if (records.length === 0) {
    throw new Error('沒有記錄可以匯出');
  }

  const csv = recordsToCsv(records);
  const fileName = `工作記錄_${new Date().toISOString().slice(0, 10)}.csv`;
  const fileUri = FileSystem.cacheDirectory + fileName;

  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('此裝置不支援分享功能');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/csv',
    dialogTitle: '匯出工作記錄 CSV',
    UTI: 'public.comma-separated-values-text',
  });
}
