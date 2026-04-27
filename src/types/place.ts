/** 工作地點（背景資料庫） */
export interface Place {
  id: number;
  placeName: string;
  placeCode: string;
  transportFee: number;
}

/** 新增地點時使用（不含 id） */
export type PlaceInput = Omit<Place, 'id'>;
