/** 工作記錄（記錄資料庫） */
export interface Record {
  id: number;
  workDate: string; // ISO 格式，例如 "2025-01-15"
  placeId: number; // 對應 Place.id
  placeName: string; // 儲存時從地點複製，便於離線查詢
  placeCode: string;
  transportFee: number;
  regularHours: number; // 日常鐘點
  semiProcessedHours: number; // 半加工鐘點
  doubleShiftHours: number; // 雙工鐘點
  hourlyWage: number; // 正常時薪
}

/** 新增記錄時使用（不含 id） */
export type RecordInput = Omit<Record, 'id'>;