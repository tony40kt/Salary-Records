import { getDatabase } from './index';
import type { Place, PlaceInput } from '../types/place';

/** 新增地點 */
export function createPlace(input: PlaceInput): Place {
  const db = getDatabase();
  const result = db.runSync(
    'INSERT INTO place (placeName, placeCode, transportFee) VALUES (?, ?, ?);',
    input.placeName,
    input.placeCode,
    input.transportFee,
  );
  return { id: result.lastInsertRowId, ...input };
}

/** 取得所有地點 */
export function getAllPlaces(): Place[] {
  const db = getDatabase();
  return db.getAllSync<Place>('SELECT * FROM place ORDER BY placeName ASC;');
}

/** 依 id 取得單一地點 */
export function getPlaceById(id: number): Place | null {
  const db = getDatabase();
  return db.getFirstSync<Place>('SELECT * FROM place WHERE id = ?;', id) ?? null;
}

/** 更新地點 */
export function updatePlace(id: number, input: PlaceInput): boolean {
  const db = getDatabase();
  const result = db.runSync(
    'UPDATE place SET placeName = ?, placeCode = ?, transportFee = ? WHERE id = ?;',
    input.placeName,
    input.placeCode,
    input.transportFee,
    id,
  );
  return result.changes > 0;
}

/** 刪除地點 */
export function deletePlace(id: number): boolean {
  const db = getDatabase();
  const result = db.runSync('DELETE FROM place WHERE id = ?;', id);
  return result.changes > 0;
}

/** 清除所有地點（設定頁重置用） */
export function deleteAllPlaces(): void {
  const db = getDatabase();
  db.runSync('DELETE FROM place;');
}

/** 檢查 placeCode 是否已存在（忽略大小寫；update 可排除自身 id） */
export function existsPlaceCode(placeCode: string, excludeId?: number): boolean {
  const db = getDatabase();
  const code = placeCode.trim().toUpperCase();
  if (!code) return false;

  if (excludeId != null) {
    const row = db.getFirstSync<{ count: number }>(
      'SELECT COUNT(1) as count FROM place WHERE UPPER(placeCode) = ? AND id != ?;',
      [code, excludeId],
    );
    return (row?.count ?? 0) > 0;
  }

  const row = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(1) as count FROM place WHERE UPPER(placeCode) = ?;',
    [code],
  );
  return (row?.count ?? 0) > 0;
}

/** 地點是否已被 record 使用（用於禁止刪除） */
export function isPlaceUsed(placeId: number): boolean {
  const db = getDatabase();
  const row = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(1) as count FROM record WHERE placeId = ?;',
    [placeId],
  );
  return (row?.count ?? 0) > 0;
}