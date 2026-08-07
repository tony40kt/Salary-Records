/**
 * 將 Date 物件格式化為本地日期字串（YYYY-MM-DD）
 * 注意：不可用 toISOString()，否則在時區轉換下可能出現日期錯位。
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 顯示用中文日期，例如：2026年6月10日 */
export function formatDisplayDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

/** 將 ISO 日期字串轉成中文顯示，例如：2026-06-10 -> 2026年6月10日 */
export function formatDisplayDateFromString(value: string): string {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;
  return `${year}年${month}月${day}日`;
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

/**
 * 驗證並解析非負數字（可含小數）。
 * 空字串可依需求回傳 0。
 */
export function parseNonNegativeNumber(
  value: string,
  options?: { emptyAsZero?: boolean },
): number | null {
  const trimmed = value.trim();

  if (trimmed === '') {
    return options?.emptyAsZero ? 0 : null;
  }

  const num = parseFloat(trimmed);
  if (isNaN(num) || num < 0) return null;
  return num;
}