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
  setCloudStatus,
  isAdmin,
  onRequireAdmin
}) {
  const [parkingUrl, setParkingUrl] = useState(cloudConfig.parkingUrl);
  const [scheduleFolderUrl, setScheduleFolderUrl] = useState(cloudConfig.scheduleFolderUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testMessage, setTestMessage] = useState(null);

  // 測試並儲存雲端停車試算表連線
  const handleTestAndSave = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
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
    <div className="space-y-4 animate-fadeIn">
      {/* 頂部標頭卡片 (極簡) */}
      <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black" style={{ color: 'var(--text)' }}>雲端對接</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                cloudStatus.connected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-300'
              }`}>
                {cloudStatus.connected ? '連線正常' : '離線'}
              </span>
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              雲端修輯，現場同步；斷網無礙，離線放行。
            </div>
          </div>

          <a
            href={parkingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1.5 transition-all shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>開表 (Admin)</span>
          </a>
        </div>
      </div>

      {/* 設定表單 */}
      {/* 設定表單 */}
      <div className="space-y-4">
        {/* 車牌雲端試算表 */}
        <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Database className="w-4 h-4 text-emerald-400" />
              <span>車冊雲端試算表</span>
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">
              {cloudStatus.connected ? '直連運作中' : '離線模式'}
            </span>
          </div>

          <form onSubmit={handleTestAndSave} className="space-y-2.5 text-xs">
            <div>
              <label className="block font-bold mb-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                試算表連結（URL）：
              </label>
              <input
                type="text"
                value={parkingUrl}
                onChange={(e) => setParkingUrl(e.target.value)}
                placeholder="貼上 Google 試算表網址..."
                className="w-full px-3 py-2 rounded-xl border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isTesting}
                className="flex-1 py-2 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? '同步中...' : '測試合驗並同步'}</span>
              </button>

              <a
                href={parkingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl font-bold text-xs border hover:bg-slate-800/20 flex items-center gap-1 transition-all"
                style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>開表</span>
              </a>
            </div>
          </form>

          {/* 測試結果訊息 */}
          {testMessage && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testMessage.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
            }`}>
              {testMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <div className="text-[11px]">{testMessage.text}</div>
            </div>
          )}
        </div>

        {/* 班表雲端試算表 */}
        <div className="p-4 rounded-xl border space-y-3" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
              <span>執勤班表雲端資料夾</span>
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-300">
              備用通道
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="block font-bold mb-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                雲端資料夾 / 試算表連結：
              </label>
              <input
                type="text"
                value={scheduleFolderUrl}
                onChange={(e) => setScheduleFolderUrl(e.target.value)}
                placeholder="貼上公司 Google Drive 班表連結..."
                className="w-full px-3 py-2 rounded-xl border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
              />
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => {
                  const newCfg = { ...cloudConfig, scheduleFolderUrl };
                  setCloudConfig(newCfg);
                  localStorage.setItem('tian_tai_cloud_config', JSON.stringify(newCfg));
                  alert('設定已存。');
                }}
                className="w-full py-2 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>存檔</span>
              </button>
            </div>
          </div>
        </div>

        {/* 極簡文言要義說明 */}
        <div className="p-3 rounded-xl border text-[11px] space-y-1" style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}>
          <div className="font-bold text-indigo-400">【對接要義】</div>
          <div>一、雲端為宗：主管於 Google 表格增刪車籍，現場即時同步。</div>
          <div>二、斷網無虞：本機自動快取名冊，離線照常驗證放行。</div>
        </div>
      </div>
    </div>
  );
}
