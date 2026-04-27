/**
 * 將 Date 物件格式化為 ISO 日期字串（YYYY-MM-DD）
 */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
