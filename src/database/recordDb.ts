import { getDatabase } from './index';
import type { Record, RecordInput } from '../types/record';

/** 新增工作記錄 */
export function createRecord(input: RecordInput): Record {
  const db = getDatabase();
  const result = db.runSync(
    `INSERT INTO record (workDate, placeId, placeName, placeCode, transportFee)
     VALUES (?, ?, ?, ?, ?);`,
    input.workDate,
    input.placeId,
    input.placeName,
    input.placeCode,
    input.transportFee,
  );
  return { id: result.lastInsertRowId, ...input };
}

/** 取得所有記錄（依工作日期降序） */
export function getAllRecords(): Record[] {
  const db = getDatabase();
  return db.getAllSync<Record>('SELECT * FROM record ORDER BY workDate DESC;');
}

/** 依 id 取得單一記錄 */
export function getRecordById(id: number): Record | null {
  const db = getDatabase();
  return db.getFirstSync<Record>('SELECT * FROM record WHERE id = ?;', id) ?? null;
}

/** 依地點名稱或日期搜尋記錄 */
export function searchRecords(keyword: string): Record[] {
  const db = getDatabase();
  const pattern = `%${keyword}%`;
  return db.getAllSync<Record>(
    `SELECT * FROM record
     WHERE placeName LIKE ? OR placeCode LIKE ? OR workDate LIKE ?
     ORDER BY workDate DESC;`,
    pattern,
    pattern,
    pattern,
  );
}

/** 依地點 id 查詢記錄 */
export function getRecordsByPlaceId(placeId: number): Record[] {
  const db = getDatabase();
  return db.getAllSync<Record>(
    'SELECT * FROM record WHERE placeId = ? ORDER BY workDate DESC;',
    placeId,
  );
}

/** 刪除記錄 */
export function deleteRecord(id: number): boolean {
  const db = getDatabase();
  const result = db.runSync('DELETE FROM record WHERE id = ?;', id);
  return result.changes > 0;
}

/** 清除所有記錄（設定頁重置用） */
export function deleteAllRecords(): void {
  const db = getDatabase();
  db.runSync('DELETE FROM record;');
}
