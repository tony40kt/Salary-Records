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

function ensureColumn(
  db: SQLite.SQLiteDatabase,
  tableName: string,
  columnName: string,
  definition: string,
): void {
  const columns = db.getAllSync<{ name: string }>(
    `PRAGMA table_info(${tableName});`,
  );
  const exists = columns.some((col) => col.name === columnName);

  if (!exists) {
    db.execSync(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`,
    );
  }
}

/**
 * 初始化資料庫：建立資料表（若不存在）
 * 應在 App 啟動時呼叫一次。
 */
export function initDatabase(): void {
  const db = getDatabase();

  // 地點資料表
  db.execSync(`
    CREATE TABLE IF NOT EXISTS place (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      placeName     TEXT    NOT NULL,
      placeCode     TEXT    NOT NULL,
      transportFee  REAL    NOT NULL DEFAULT 0
    );
  `);

  // 工作記錄資料表
  db.execSync(`
    CREATE TABLE IF NOT EXISTS record (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      workDate            TEXT    NOT NULL,
      placeId             INTEGER NOT NULL,
      placeName           TEXT    NOT NULL,
      placeCode           TEXT    NOT NULL,
      transportFee        REAL    NOT NULL DEFAULT 0,
      regularHours        REAL    NOT NULL DEFAULT 0,
      semiProcessedHours  REAL    NOT NULL DEFAULT 0,
      doubleShiftHours    REAL    NOT NULL DEFAULT 0,
      hourlyWage          REAL    NOT NULL DEFAULT 0,
      FOREIGN KEY (placeId) REFERENCES place(id) ON DELETE RESTRICT
    );
  `);

  // 相容舊版 record 資料表
  ensureColumn(db, 'record', 'regularHours', 'REAL NOT NULL DEFAULT 0');
  ensureColumn(
    db,
    'record',
    'semiProcessedHours',
    'REAL NOT NULL DEFAULT 0',
  );
  ensureColumn(db, 'record', 'doubleShiftHours', 'REAL NOT NULL DEFAULT 0');
  ensureColumn(db, 'record', 'hourlyWage', 'REAL NOT NULL DEFAULT 0');

  // App 設定資料表
  db.execSync(`
    CREATE TABLE IF NOT EXISTS app_setting (
      key   TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
}