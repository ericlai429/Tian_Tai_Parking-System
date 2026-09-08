import React, { useState } from 'react';
import { 
  Cloud, RefreshCw, CheckCircle2, AlertCircle, 
  ExternalLink, Save, Database, Shield, Lock, FileSpreadsheet 
} from 'lucide-react';
import { fetchCloudParkingData } from '../utils/cloudSheetHelper';
import confetti from 'canvas-confetti';

export default function CloudSyncModal({ 
  cloudConfig, 
  setCloudConfig, 
  onSyncParking, 
  onSyncSchedule, 
  cloudStatus, 
  setCloudStatus 
}) {
  const [parkingUrl, setParkingUrl] = useState(cloudConfig.parkingUrl);
  const [scheduleFolderUrl, setScheduleFolderUrl] = useState(cloudConfig.scheduleFolderUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testMessage, setTestMessage] = useState(null);

  // 測試並儲存雲端停車試算表連線
  const handleTestAndSave = async (e) => {
    e.preventDefault();
    setIsTesting(true);
    setTestMessage(null);

    try {
      const vehicles = await fetchCloudParkingData(parkingUrl);
      setTestMessage({
        type: 'success',
        text: `連線成功！成功探測到「工地工區大門－車輛管制」，讀取到 ${vehicles.length} 筆有效車牌資料。`
      });
      // 儲存配置
      const newCfg = { ...cloudConfig, parkingUrl, scheduleFolderUrl };
      setCloudConfig(newCfg);
      localStorage.setItem('tian_tai_cloud_config', JSON.stringify(newCfg));
      setCloudStatus({ connected: true, lastSync: new Date().toLocaleTimeString() });

      // 同步更新名冊
      onSyncParking(vehicles);
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      setTestMessage({
        type: 'error',
        text: `連線測試失敗：${err.message}`
      });
      setCloudStatus({ connected: false, lastSync: null });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 頂部標頭卡片 */}
      <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-black bg-indigo-500 text-white flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5" />
                Google 雲端試算表整合中心
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                cloudStatus.connected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'
              }`}>
                {cloudStatus.connected ? '🟢 雲端連線正常' : '⚪ 尚未連線'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight" style={{ color: 'var(--text)' }}>
              雲端資料庫與試算表雙向對接
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              管理員 (Admin) 可於線上 Google 試算表直接編輯車牌或班表，現場系統將隨時自動同步放行。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={parkingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>以 Admin 身分線上編輯名冊</span>
            </a>
          </div>
        </div>
      </div>

      {/* 設定表單 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 停車場雲端名冊設定卡片 */}
        <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Database className="w-5 h-5 text-emerald-400" />
              <span>停車場雲端名冊設定 (車牌管制)</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              指定 Google Sheet
            </span>
          </div>

          <div className="p-4 rounded-xl border text-xs space-y-2" style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)' }}>
            <div className="font-bold flex items-center justify-between" style={{ color: 'var(--text)' }}>
              <span>目前綁定之線上試算表：</span>
              <span className="text-emerald-400 font-mono">天泰工區大門車輛管制</span>
            </div>
            <div className="text-[11px] break-all font-mono p-2 rounded border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-dim)' }}>
              {parkingUrl}
            </div>
          </div>

          <form onSubmit={handleTestAndSave} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                Google 試算表連結 (含 gid)：
              </label>
              <input
                type="text"
                value={parkingUrl}
                onChange={(e) => setParkingUrl(e.target.value)}
                placeholder="貼上 Google 試算表網址..."
                className="w-full px-3 py-2.5 rounded-xl border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isTesting}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? '連線同步中...' : '測試連線並同步車牌名冊'}</span>
              </button>

              <a
                href={parkingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl font-bold text-xs border hover:bg-slate-800/20 flex items-center gap-1.5 transition-all"
                style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>開啟試算表</span>
              </a>
            </div>
          </form>

          {/* 測試結果訊息 */}
          {testMessage && (
            <div className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
              testMessage.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
            }`}>
              {testMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              )}
              <div>{testMessage.text}</div>
            </div>
          )}
        </div>

        {/* 班表雲端資料夾對接預留卡片 */}
        <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
              <span>公司班表雲端試算表資料夾設定</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              全自動同步介面
            </span>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            此介面專為公司雲端資料夾中的「三總現場執勤排班表」打造。您可以貼上公司 Google Drive 班表資料夾或最新班表試算表網址，系統將自動解析人員排班與代班標籤。
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold mb-1" style={{ color: 'var(--text-muted)' }}>
                公司雲端試算表資料夾 / 檔案網址：
              </label>
              <input
                type="text"
                value={scheduleFolderUrl}
                onChange={(e) => setScheduleFolderUrl(e.target.value)}
                placeholder="貼上公司 Google Drive 班表資料夾或試算表網址..."
                className="w-full px-3 py-2.5 rounded-xl border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
              />
            </div>

            <div className="p-3.5 rounded-xl border text-xs" style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)' }}>
              <div className="font-bold mb-1" style={{ color: 'var(--text)' }}>
                ✨ 支援格式與機制說明：
              </div>
              <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--text-muted)' }}>
                <li>支援 Google Sheets 公開共享連結（自動抓取最新工作表）。</li>
                <li>自動對齊 115 年各月份現場執勤表（日班 A、機動班、代班桃色標記）。</li>
                <li>支援本機離線緩存：斷網時自動維持最新班表，恢復連線自動重載。</li>
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  const newCfg = { ...cloudConfig, scheduleFolderUrl };
                  setCloudConfig(newCfg);
                  localStorage.setItem('tian_tai_cloud_config', JSON.stringify(newCfg));
                  alert('公司班表雲端設定已儲存！');
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>儲存班表雲端設定</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
