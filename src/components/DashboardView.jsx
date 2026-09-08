import React, { useState } from 'react';
import { 
  Car, Search, CheckCircle2, XCircle, 
  ExternalLink, Lock, Unlock, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DashboardView({ 
  scheduleData, 
  parkingList, 
  setActiveTab,
  cloudConfig,
  isAdmin,
  onAdminLoginClick
}) {
  const [quickPlate, setQuickPlate] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  // 標準化車牌號碼 (去除空格與破折號)
  const normalizePlate = (str) => (str || '').replace(/[\s-]/g, '').toUpperCase();

  // 快速搜尋車牌
  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!quickPlate.trim()) return;
    const clean = normalizePlate(quickPlate);
    const found = parkingList.find(p => normalizePlate(p.plate) === clean);
    
    if (found) {
      setSearchResult(found);
      if (found.status === 'pass') {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      setSearchResult({
        plate: quickPlate.trim().toUpperCase(),
        status: 'not_found',
        name: '未註冊車輛',
        unit: '外部訪客',
        notes: '此車輛未在名冊中，警衛請依標準訪客程序登記換證。'
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 頂部歡迎橫幅 */}
      <div className="p-6 rounded-2xl border transition-all" style={{
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(14, 165, 233, 0.1) 100%)',
        borderColor: 'rgba(99, 102, 241, 0.25)'
      }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500 text-white tracking-wider">
                系統運行中
              </span>
              <span className="text-xs font-semibold text-indigo-400">
                {scheduleData.projectTitle}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
              天泰營造勤務戰情中心
            </h1>
            <p className="text-sm mt-1.5 flex flex-wrap items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <span>使用單位：天泰營造</span>
              <span className="hidden sm:inline">|</span>
              <span>勤務主管：飛龍保全勤務指揮中心</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 管理員身分切換按鈕 */}
            <button
              onClick={onAdminLoginClick}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                isAdmin 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'hover:bg-slate-800/20'
              }`}
              style={{
                borderColor: isAdmin ? 'rgba(245, 158, 11, 0.4)' : 'var(--card-border)',
                color: isAdmin ? '#fbbf24' : 'var(--text-muted)'
              }}
            >
              {isAdmin ? <Unlock className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isAdmin ? 'Admin 已解鎖 (t1898)' : '管理員登入'}</span>
            </button>

            <button
              onClick={() => setActiveTab('parking')}
              className="px-4 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all active:scale-95"
            >
              <Car className="w-4 h-4" />
              <span>車輛管制清單</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className="px-4 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95"
            >
              <span>檢視 9 月班表</span>
            </button>
          </div>
        </div>
      </div>

      {/* 精簡最小化資料庫同步機制條 (極簡一行化配置) */}
      <div className="p-3.5 px-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
           style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold" style={{ color: 'var(--text)' }}>
            資料庫同步狀態：
          </span>
          <span className="text-emerald-400 font-medium">
            Google 雲端試算表直連正常 (名冊 {parkingList.length} 輛車)
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('cloud')}
            className="text-indigo-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>同步設定</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          {isAdmin && (
            <a
              href={cloudConfig?.parkingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>線上編輯 (Admin)</span>
            </a>
          )}
        </div>
      </div>

      {/* 核心主區塊：車牌秒查核對站 (全寬擴展、清晰聚焦) */}
      <div className="p-8 rounded-2xl border space-y-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4" style={{ borderColor: 'var(--card-border)' }}>
          <div>
            <h2 className="text-xl font-black flex items-center gap-2.5" style={{ color: 'var(--text)' }}>
              <Car className="w-6 h-6 text-emerald-400" />
              <span>現場工區大門 － 車輛進出即時核驗站</span>
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              支援模糊車牌即時比對，自動判定常駐長官、包商與施工車輛通行權限。
            </p>
          </div>
          <div className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 w-fit">
            資料庫已載入 {parkingList.length} 輛車
          </div>
        </div>

        {/* 搜尋輸入列 */}
        <form onSubmit={handleQuickSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={quickPlate}
              onChange={(e) => setQuickPlate(e.target.value)}
              placeholder="輸入車牌號碼快速驗證 (例：1079-KS 或 BVU-3132)..."
              className="w-full pl-14 pr-4 py-4 rounded-xl border text-xl font-mono font-black tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{ 
                backgroundColor: 'var(--card-hover)', 
                borderColor: 'var(--card-border)',
                color: 'var(--text)' 
              }}
              autoFocus
            />
          </div>
          <button 
            type="submit"
            className="px-8 py-4 rounded-xl font-black text-base bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
          >
            <span>即時核對放行</span>
          </button>
        </form>

        {/* 查驗結果呈現卡 */}
        {searchResult && (
          <div className={`p-6 rounded-2xl border transition-all ${
            searchResult.status === 'pass' 
              ? 'border-emerald-500/50 bg-emerald-500/10 glow-emerald' 
              : (searchResult.status === 'pending' ? 'border-amber-500/50 bg-amber-500/10' : 'border-rose-500/50 bg-rose-500/10 glow-rose')
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-3xl sm:text-4xl font-black tracking-wider" style={{ color: 'var(--text)' }}>
                    {searchResult.plate}
                  </span>
                  {searchResult.type === 'vip' && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-md">
                      👑 VIP長官座車
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold flex flex-wrap items-center gap-3" style={{ color: 'var(--text)' }}>
                  <span>人員：{searchResult.name}</span>
                  <span>|</span>
                  <span>單位：{searchResult.unit}</span>
                  {searchResult.subItem && (
                    <>
                      <span>|</span>
                      <span>職稱：{searchResult.subItem}</span>
                    </>
                  )}
                </div>
                {searchResult.notes && (
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    備註：{searchResult.notes}
                  </div>
                )}
              </div>

              <div className="shrink-0">
                <span className={`px-6 py-3 rounded-xl text-lg font-black uppercase tracking-wider flex items-center gap-2 shadow-lg ${
                  searchResult.status === 'pass'
                    ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                    : (searchResult.status === 'pending' ? 'bg-amber-500 text-slate-900 shadow-amber-500/40' : 'bg-rose-500 text-white shadow-rose-500/40')
                }`}>
                  {searchResult.status === 'pass' ? (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      <span>准予放行 PASS</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6" />
                      <span>未通過 DENIED</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
