import { useState, useCallback } from 'react';
import type { Record, RecordInput } from '../types/record';
import {
  getAllRecords,
  createRecord,
  deleteRecord,
  deleteAllRecords,
  searchRecords,
  getRecordById,
  getRecordsByPlaceId,
} from '../database/recordDb';

/**
 * 工作記錄 Hook
 * 封裝記錄的 CRUD 與搜尋操作，提供 React 元件使用。
 */
export function useRecords() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 載入所有記錄 */
  const load = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      const data = getAllRecords();
      setRecords(data);
    } catch (e) {
      setError('載入記錄失敗');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  /** 新增記錄 */
  const add = useCallback((input: RecordInput): Record | null => {
    try {
      const newRecord = createRecord(input);
      setRecords((prev) => [newRecord, ...prev]);
      return newRecord;
    } catch (e) {
      setError('新增記錄失敗');
      console.error(e);
      return null;
    }
  }, []);

  /** 刪除記錄 */
  const remove = useCallback((id: number): boolean => {
    try {
      const ok = deleteRecord(id);
      if (ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
      }
      return ok;
    } catch (e) {
      setError('刪除記錄失敗');
      console.error(e);
      return false;
    }
  }, []);

  /** 清除所有記錄（重置用） */
  const removeAll = useCallback(() => {
    try {
      deleteAllRecords();
      setRecords([]);
    } catch (e) {
      setError('清除記錄失敗');
      console.error(e);
    }
  }, []);

  /** 搜尋記錄（依地點名稱、地點代碼或日期） */
  const search = useCallback((keyword: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = keyword.trim() ? searchRecords(keyword) : getAllRecords();
      setRecords(data);
    } catch (e) {
      setError('搜尋記錄失敗');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  /** 依 id 取得單一記錄 */
  const getById = useCallback((id: number): Record | null => {
    return getRecordById(id);
  }, []);

  /** 依地點 id 篩選記錄 */
  const getByPlaceId = useCallback((placeId: number): Record[] => {
    return getRecordsByPlaceId(placeId);
  }, []);

  return {
    records,
    loading,
    error,
    load,
    add,
    remove,
    removeAll,
    search,
    getById,
    getByPlaceId,
  };
}
