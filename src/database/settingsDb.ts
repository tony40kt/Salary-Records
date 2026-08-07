import { getDatabase } from './index';

const DEFAULT_HOURLY_WAGE_KEY = 'defaultHourlyWage';

/** 取得預設正常時薪 */
export function getDefaultHourlyWage(): number | null {
  const db = getDatabase();
  const row = db.getFirstSync<{ value: string }>(
    'SELECT value FROM app_setting WHERE key = ?;',
    DEFAULT_HOURLY_WAGE_KEY,
  );

  if (!row) return null;

  const num = parseFloat(row.value);
  return isNaN(num) ? null : num;
}

/** 儲存預設正常時薪 */
export function setDefaultHourlyWage(value: number): void {
  const db = getDatabase();
  db.runSync(
    `
    INSERT INTO app_setting (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value;
    `,
    DEFAULT_HOURLY_WAGE_KEY,
    String(value),
  );
}

/** 清除預設正常時薪 */
export function clearDefaultHourlyWage(): void {
  const db = getDatabase();
  db.runSync('DELETE FROM app_setting WHERE key = ?;', DEFAULT_HOURLY_WAGE_KEY);
}