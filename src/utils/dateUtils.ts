/**
 * 將 Date 物件格式化為 ISO 日期字串（YYYY-MM-DD）
 */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * 驗證並解析車資輸入字串。
 * @returns 解析後的數字，或在無效時返回 null
 */
export function parseTransportFee(value: string): number | null {
  const fee = parseFloat(value);
  if (isNaN(fee) || fee < 0) return null;
  return fee;
}
