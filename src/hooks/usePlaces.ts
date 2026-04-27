import { useState, useCallback } from 'react';
import type { Place, PlaceInput } from '../types/place';
import {
  getAllPlaces,
  createPlace,
  updatePlace,
  deletePlace,
  getPlaceById,
} from '../database/placeDb';

/**
 * 背景地點資料 Hook
 * 封裝地點的 CRUD 操作，提供 React 元件使用。
 */
export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 載入所有地點 */
  const load = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      const data = getAllPlaces();
      setPlaces(data);
    } catch (e) {
      setError('載入地點資料失敗');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  /** 新增地點 */
  const add = useCallback((input: PlaceInput): Place | null => {
    try {
      const newPlace = createPlace(input);
      setPlaces((prev) => [...prev, newPlace].sort((a, b) =>
        a.placeName.localeCompare(b.placeName, 'zh-Hant'),
      ));
      return newPlace;
    } catch (e) {
      setError('新增地點失敗');
      console.error(e);
      return null;
    }
  }, []);

  /** 更新地點 */
  const update = useCallback((id: number, input: PlaceInput): boolean => {
    try {
      const ok = updatePlace(id, input);
      if (ok) {
        setPlaces((prev) =>
          prev.map((p) => (p.id === id ? { id, ...input } : p)),
        );
      }
      return ok;
    } catch (e) {
      setError('更新地點失敗');
      console.error(e);
      return false;
    }
  }, []);

  /** 刪除地點 */
  const remove = useCallback((id: number): boolean => {
    try {
      const ok = deletePlace(id);
      if (ok) {
        setPlaces((prev) => prev.filter((p) => p.id !== id));
      }
      return ok;
    } catch (e) {
      setError('刪除地點失敗');
      console.error(e);
      return false;
    }
  }, []);

  /** 依 id 取得單一地點（不影響列表狀態） */
  const getById = useCallback((id: number): Place | null => {
    return getPlaceById(id);
  }, []);

  return { places, loading, error, load, add, update, remove, getById };
}
