# Salary-Records（薪資/工作地點記錄）

一個**繁體中文、離線可用、iOS 專用**的小型記錄 App，讓個人團隊可以在手機上管理「工作地點背景資料」與「工作記錄」，並支援匯出 CSV。

> 本專案以 Expo SDK 54.0.2（React Native）為基礎規劃與開發，適合非工程背景使用者。

---

## ✨ 特色

- ✅ 繁體中文介面
- ✅ 完全離線、本機儲存
- ✅ iOS Expo Go 可直接測試
- ✅ 工作地點背景資料與記錄分離
- ✅ 一鍵匯出 CSV / 分享檔案

---

## 📱 使用情境

- 管理多個工作地點的代碼與車資
- 每日記錄工作日期與對應地點
- 匯出記錄作為薪資/報表用途

---

## 🧩 功能清單

### 1) 背景資料庫（資料庫1）
- 新增/修改/刪除工作地點
- 地點欄位：**工作地點、地點編號、地點車資**
- 提供給「記錄填寫頁」自動帶入

### 2) 記錄資料庫（資料庫2）
- 手動選擇工作地點
- 自動帶入地點編號與車資
- 填寫工作日期並儲存
- 查詢、刪除、查看明細

### 3) 其他功能
- 記錄清單頁（搜尋/刪除）
- 記錄詳情頁（完整顯示）
- 匯出頁（CSV / 分享）
- 設定頁（資料重置 / 版本資訊）
- 說明/教學頁（新手操作指引）

---

## 🖼️ 主要畫面

- 背景資料管理頁
- 記錄填寫頁
- 記錄清單頁
- 記錄詳情頁
- 匯出頁
- 設定頁
- 說明/教學頁

---

## 🗂️ 資料結構（概念）

### 資料庫1：背景資料（地點）
| 欄位 | 說明 |
|------|------|
| id | 唯一識別 |
| placeName | 工作地點 |
| placeCode | 地點編號 |
| transportFee | 地點車資 |

### 資料庫2：記錄
| 欄位 | 說明 |
|------|------|
| id | 唯一識別 |
| workDate | 工作日期 |
| placeId | 對應背景地點 |
| placeName | 地點名稱 |
| placeCode | 地點編號 |
| transportFee | 地點車資 |

---

## 🛠️ 技術規劃

- **框架**：React Native + Expo SDK 54.0.2
- **語言**：TypeScript
- **資料儲存**：Expo SQLite / MMKV（本機）
- **匯出**：expo-file-system + expo-sharing
- **導航**：React Navigation
- **介面語言**：繁體中文

---

## 📂 專案結構

```
salary-records/
├── app/                    # Expo Router 頁面
│   ├── _layout.tsx         # 根 Layout（初始化資料庫）
│   ├── (tabs)/             # 底部分頁
│   │   ├── places.tsx      # 地點管理頁
│   │   ├── records.tsx     # 工作記錄清單頁
│   │   └── settings.tsx    # 設定頁
│   ├── place/
│   │   ├── new.tsx         # 新增地點
│   │   └── [id].tsx        # 編輯地點
│   ├── record/
│   │   ├── new.tsx         # 新增記錄
│   │   └── [id].tsx        # 記錄詳情
│   ├── export.tsx          # 匯出 CSV 頁
│   └── help.tsx            # 說明教學頁
├── src/
│   ├── types/              # TypeScript 型別定義
│   │   ├── place.ts
│   │   └── record.ts
│   ├── database/           # SQLite 資料庫層
│   │   ├── index.ts        # 初始化 & 連線
│   │   ├── placeDb.ts      # 地點 CRUD
│   │   └── recordDb.ts     # 記錄 CRUD & 搜尋
│   ├── hooks/              # React Hooks
│   │   ├── usePlaces.ts
│   │   └── useRecords.ts
│   └── services/
│       └── exportService.ts # CSV 匯出服務
├── assets/                 # 圖示與啟動畫面
├── app.json                # Expo 設定
├── package.json
└── tsconfig.json
```

---

## ▶️ 開始使用（Expo Go）

> 環境需求：Node.js 18+、npm 或 yarn

```bash
# 1. 安裝依賴
npm install

# 2. 啟動開發伺服器
npx expo start
```

在 iOS 上用 **Expo Go** 掃描 QR Code 即可。

---

## 🧪 測試建議

- 新增至少 10 筆背景地點資料
- 用不同地點建立多筆記錄
- 測試離線狀態仍可新增/查詢
- 匯出 CSV 並用 Excel/Google Sheets 打開確認

---

## 📌 注意事項

- 所有資料皆儲存在手機本機（不會上傳雲端）
- 重新安裝 App 會清除本機資料
- 本專案為個人用途，採用免費資源與工具

---

## ✅ 待辦（GitHub Issues）

已在 GitHub 建立完整 **Epic + 子功能 issues**，包含：
- 每個畫面與功能模組
- 程式碼任務與 DoD
- iOS / Expo 測試需求

---

## 📖 教學與說明

本專案會提供繁體中文的說明/教學頁，協助非工程背景使用者快速上手。

---

## 📄 License

本專案為個人用途，可自行修改與使用。
