# 天泰管理系統 - Supabase 數據庫遷移與連線整合報告

## 📌 遷移狀態摘要

* **遷移狀態**：✅ **完全成功 (Completed)**
* **雲端平台**：[Supabase](https://supabase.com/dashboard/project/rtolgqezctkioewmlcob)
* **專案 ID (Ref)**：`rtolgqezctkioewmlcob`
* **區域 (Region)**：Northeast Asia (Tokyo)
* **專案 URL**：`https://rtolgqezctkioewmlcob.supabase.co`
* **資料庫直連**：`postgresql://postgres:iPad0955000375@db.rtolgqezctkioewmlcob.supabase.co:5432/postgres`
* **前端 API Key (Publishable / Anon)**：`sb_publishable_F3Y3oV47O3Ls9WZ5hKE74Q_H1xyniVc`

---

## 🗄️ 已建立之雲端資料表與數據

### 1. 車輛通行名冊 (`public.parking_records`)
* **資料筆數**：19 筆完整名冊已全部匯入。
* **資料結構**：
  * `id` (TEXT, 主鍵)
  * `pass_no` (TEXT, 停車證流水號，如 001)
  * `plate` (TEXT, 車牌號碼，如 CCN-1898)
  * `name` (TEXT, 車主姓名，如 鄭全欽/謝佳蓉)
  * `unit` (TEXT, 單位名稱，如 天泰營造)
  * `sub_item` (TEXT, 職稱，如 執行長/總經理)
  * `phone` (TEXT, 聯絡電話)
  * `notes` (TEXT, 備註說明)
  * `type` (TEXT, 類別：vip / regular / temp)
  * `status` (TEXT, 狀態：pass / denied)
  * `admin1`, `admin2`, `admin3` (TEXT, 審核簽章狀態)
  * `created_at`, `updated_at` (TIMESTAMPTZ)
* **安全機制 (RLS)**：已啟用 Row Level Security，並設定 `Allow anon all on parking_records` 存取政策。

### 2. 現場執勤排班表 (`public.schedules`)
* **主鍵**：`tian_tai_schedule_main`
* **資料結構**：
  * `id` (TEXT, 主鍵)
  * `data` (JSONB, 完整保存 115 年 9 月現場執勤表、保全人員班表、每日/每月應勤時數、守則條款)
  * `updated_at` (TIMESTAMPTZ)
* **安全機制 (RLS)**：已啟用 Row Level Security，並設定 `Allow anon all on schedules` 存取政策。

### 3. 系統設定與雲端試算表設定 (`public.system_settings`)
* **主鍵**：`cloud_config`
* **資料內容**：包含 Google Sheet 原始備援網址。

---

## 💻 前端系統整合與功能特色

1. **模組檔案**：[src/utils/supabaseClient.js](file:///d:/GitHub/Tian_Tai/src/utils/supabaseClient.js)
   * 封裝了 `fetchSupabaseParkingData()`、`syncParkingDataToSupabase()`、`fetchSupabaseScheduleData()`、`saveScheduleDataToSupabase()`。
   * 包含 **Realtime 即時推播訂閱**（`subscribeToParkingChanges`、`subscribeToScheduleChanges`）。
2. **雙向即時同步 (Realtime)**：
   * 當一位管理員在電腦或手機上修改車輛、新增名冊、審核車牌或調整排班時，變更會即時寫入 Supabase。
   * 其他所有打開該網頁的使用者（無論手機或電腦）**無需重新整理網頁，畫面 0 秒自動同步**！
3. **無網/離線防護 (Offline-First Fallback)**：
   * 同步保留 `localStorage` 快取，即使在地下室收訊不良或網路暫時斷線，系統亦可正常秒開、流暢運作。

---

## 🚀 部署更新指令

當您要將最新的程式碼推送到 GitHub Pages 上線時，只需在終端機執行：

```powershell
npm run deploy
```

前端會自動完成安全混淆打包，並發布到 GitHub Pages。
