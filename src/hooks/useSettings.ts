import { useCallback, useState } from 'react';
import {
  getDefaultHourlyWage,
  setDefaultHourlyWage,
  clearDefaultHourlyWage,
} from '../database/settingsDb';

export function useSettings() {
  const [defaultHourlyWage, setDefaultHourlyWageState] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDefaultHourlyWage = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      const value = getDefaultHourlyWage();
      setDefaultHourlyWageState(value);
      return value;
    } catch (e) {
      setError('載入預設正常時薪失敗');
      console.error(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveDefaultHourlyWage = useCallback((value: number) => {
    try {
      setError(null);
      setDefaultHourlyWage(value);
      setDefaultHourlyWageState(value);
      return true;
    } catch (e) {
      setError('儲存預設正常時薪失敗');
      console.error(e);
      return false;
    }
  }, []);

  const removeDefaultHourlyWage = useCallback(() => {
    try {
      setError(null);
      clearDefaultHourlyWage();
      setDefaultHourlyWageState(null);
      return true;
    } catch (e) {
      setError('清除預設正常時薪失敗');
      console.error(e);
      return false;
    }
  }, []);

  return {
    defaultHourlyWage,
    loading,
    error,
    loadDefaultHourlyWage,
    saveDefaultHourlyWage,
    removeDefaultHourlyWage,
  };
}