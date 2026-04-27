import * as SQLite from 'expo-sqlite';

const DB_NAME = 'salary_records.db';

let _db: SQLite.SQLiteDatabase | null = null;

/** 取得（或開啟）資料庫實例 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync(DB_NAME);
  }
  return _db;
}

/**
 * 初始化資料庫：建立資料表（若不存在）
 * 應在 App 啟動時呼叫一次。
 */
export function initDatabase(): void {
  const db = getDatabase();

  // 資料庫1：背景地點資料表
  db.execSync(`
    CREATE TABLE IF NOT EXISTS place (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      placeName     TEXT    NOT NULL,
      placeCode     TEXT    NOT NULL,
      transportFee  REAL    NOT NULL DEFAULT 0
    );
  `);

  // 資料庫2：工作記錄資料表
  db.execSync(`
    CREATE TABLE IF NOT EXISTS record (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      workDate      TEXT    NOT NULL,
      placeId       INTEGER NOT NULL,
      placeName     TEXT    NOT NULL,
      placeCode     TEXT    NOT NULL,
      transportFee  REAL    NOT NULL DEFAULT 0,
      FOREIGN KEY (placeId) REFERENCES place(id)
    );
  `);
}
