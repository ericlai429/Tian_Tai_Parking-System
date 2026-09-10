import React, { useState } from 'react';
import { 
  Cloud, RefreshCw, CheckCircle2, AlertCircle, 
  ExternalLink, Save, Database, Shield, Lock, FileSpreadsheet, LogOut 
} from 'lucide-react';
import { fetchCloudParkingData, fetchCloudScheduleData } from '../utils/cloudSheetHelper';
import confetti from 'canvas-confetti';

export default function CloudSyncModal({ 
  cloudConfig, 
  setCloudConfig, 
  onSyncParking, 
  onSyncSchedule, 
  cloudStatus, 
  setCloudStatus,
  isAdmin,
  onRequireAdmin,
  onLogout
}) {
  const [parkingUrl, setParkingUrl] = useState(cloudConfig.parkingUrl);
  const [scheduleUrl, setScheduleUrl] = useState(cloudConfig.scheduleUrl || cloudConfig.scheduleFolderUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testMessage, setTestMessage] = useState(null);
  const [isTestingSchedule, setIsTestingSchedule] = useState(false);
  const [scheduleTestMessage, setScheduleTestMessage] = useState(null);

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

  // 測試並同步雲端執勤班表
  const handleSyncSchedule = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    setIsTestingSchedule(true);
    setScheduleTestMessage(null);

    try {
      const newSchedule = await fetchCloudScheduleData(scheduleUrl);
      setScheduleTestMessage({
        type: 'success',
        text: `班表同步成功！已讀取「${newSchedule.projectTitle}」，共 ${newSchedule.guards.length} 位保全人員排班（應勤 ${newSchedule.totalTargetHours} 小時）。`
      });

      const newCfg = { ...cloudConfig, scheduleUrl, scheduleFolderUrl: scheduleUrl };
      setCloudConfig(newCfg);
      localStorage.setItem('tian_tai_cloud_config', JSON.stringify(newCfg));

      if (onSyncSchedule) {
        onSyncSchedule(newSchedule);
      }
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.7 } });
    } catch (err) {
      setScheduleTestMessage({
        type: 'error',
        text: `班表同步失敗：${err.message}`
      });
    } finally {
      setIsTestingSchedule(false);
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

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={parkingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>開表 (Admin)</span>
            </a>

            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('確定要登出管理員身分嗎？')) {
                    onLogout();
                  }
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                title="登出管理者身分，切換回一般訪客"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>登出</span>
              </button>
            )}
          </div>
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
              <span>現場執勤班表 (Google 雲端試算表)</span>
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-300">
              即時同步通道
            </span>
          </div>

          <form onSubmit={handleSyncSchedule} className="space-y-2.5 text-xs">
            <div>
              <label className="block font-bold mb-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                班表試算表連結（URL）：
              </label>
              <input
                type="text"
                value={scheduleUrl}
                onChange={(e) => setScheduleUrl(e.target.value)}
                placeholder="貼上 Google 試算表班表網址..."
                className="w-full px-3 py-2 rounded-xl border font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isTestingSchedule}
                className="flex-1 py-2 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingSchedule ? 'animate-spin' : ''}`} />
                <span>{isTestingSchedule ? '同步班表中...' : '測試合驗並同步班表'}</span>
              </button>

              <a
                href={scheduleUrl}
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

          {/* 班表測試結果訊息 */}
          {scheduleTestMessage && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              scheduleTestMessage.type === 'success' 
                ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' 
                : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
            }`}>
              {scheduleTestMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <div className="text-[11px]">{scheduleTestMessage.text}</div>
            </div>
          )}
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
