import { useState, useCallback } from 'react';
import type { Place, PlaceInput } from '../types/place';
import {
  getAllPlaces,
  createPlace,
  updatePlace,
  deletePlace,
  getPlaceById,
  existsPlaceCode,
  isPlaceUsed,
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

  /** 新增地點（placeCode 不可重複） */
  const add = useCallback((input: PlaceInput): Place => {
    try {
      setError(null);

      if (existsPlaceCode(input.placeCode)) {
        throw new Error('地點代碼已存在，請更換代碼');
      }

      const normalized: PlaceInput = {
        ...input,
        placeName: input.placeName.trim(),
        placeCode: input.placeCode.trim().toUpperCase(),
      };

      const newPlace = createPlace(normalized);
      setPlaces(getAllPlaces());
      return newPlace;
    } catch (e) {
      const message = e instanceof Error ? e.message : '新增地點失敗';
      setError(message);
      console.error(e);
      throw new Error(message);
    }
  }, []);

  /** 更新地點（placeCode 不可重複，排除自身 id） */
  const update = useCallback((id: number, input: PlaceInput): boolean => {
    try {
      setError(null);

      if (existsPlaceCode(input.placeCode, id)) {
        throw new Error('地點代碼已存在，請更換代碼');
      }

      const normalized: PlaceInput = {
        ...input,
        placeName: input.placeName.trim(),
        placeCode: input.placeCode.trim().toUpperCase(),
      };

      const ok = updatePlace(id, normalized);
      if (ok) {
        setPlaces((prev) =>
          prev.map((p) => (p.id === id ? { id, ...normalized } : p)),
        );
      }
      return ok;
    } catch (e) {
      const message = e instanceof Error ? e.message : '更新地點失敗';
      setError(message);
      console.error(e);
      throw new Error(message);
    }
  }, []);

  /** 刪除地點（若已被工作記錄使用則禁止刪除） */
  const remove = useCallback((id: number): boolean => {
    try {
      setError(null);

      if (isPlaceUsed(id)) {
        throw new Error('此地點已被工作記錄使用，無法刪除');
      }

      const ok = deletePlace(id);
      if (ok) {
        setPlaces((prev) => prev.filter((p) => p.id !== id));
      }
      return ok;
    } catch (e) {
      const message = e instanceof Error ? e.message : '刪除地點失敗';
      setError(message);
      console.error(e);
      throw new Error(message);
    }
  }, []);

  /** 依 id 取得單一地點（不影響列表狀態） */
  const getById = useCallback((id: number): Place | null => {
    return getPlaceById(id);
  }, []);

  return { places, loading, error, load, add, update, remove, getById };
}