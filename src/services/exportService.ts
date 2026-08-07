import * as Clipboard from 'expo-clipboard';
import type { Record } from '../types/record';
import { calculateRecordSalary } from '../utils/salaryUtils';

const CSV_HEADER =
  '工作日期,工作地點,地點代碼,地點車資,日常鐘點,半加工鐘點,雙工鐘點,正常時薪,本筆薪資\n';

function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (
    str.includes(',') ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r')
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function recordsToCsv(records: Record[]): string {
  const rows = records.map((r) =>
    [
      r.workDate,
      r.placeName,
      r.placeCode,
      r.transportFee.toFixed(2),
      r.regularHours.toFixed(2),
      r.semiProcessedHours.toFixed(2),
      r.doubleShiftHours.toFixed(2),
      r.hourlyWage.toFixed(2),
      calculateRecordSalary(r).toFixed(2),
    ]
      .map(escapeCsvField)
      .join(','),
  );

  return CSV_HEADER + rows.join('\n');
}

/**
 * 匯出（Expo Go 兼容版）：將 CSV 複製到剪貼簿
 */
export async function exportRecordsToCsv(records: Record[]): Promise<void> {
  if (records.length === 0) {
    throw new Error('沒有記錄可以匯出');
  }

  const csv = recordsToCsv(records);
  await Clipboard.setStringAsync(csv);
}