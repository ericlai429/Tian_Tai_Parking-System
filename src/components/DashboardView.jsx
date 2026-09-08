import React, { useState, useMemo } from 'react';
import { 
  Car, Search, CheckCircle2, XCircle, 
  ExternalLink, Lock, Unlock, ArrowRight, Sparkles, Hash
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
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // 標準化車牌號碼 (去空白與破折號)
  const cleanStr = (str) => (str || '').replace(/[\s-]/g, '').toUpperCase();
  // 提取純數字
  const extractDigits = (str) => (str || '').replace(/\D/g, '');

  // 即時 3 碼 / 模糊過濾候選車輛
  const candidates = useMemo(() => {
    const q = quickPlate.trim();
    if (!q) return [];
    
    const qClean = cleanStr(q);
    const qDigits = extractDigits(q);

    return parkingList.filter(item => {
      const plateClean = cleanStr(item.plate);
      const plateDigits = extractDigits(item.plate);

      // 若使用者輸入的是純數字 (例如輸入 3 碼數字：898, 132, 079 等)
      if (qDigits && qDigits.length >= 2 && plateDigits.includes(qDigits)) {
        return true;
      }
      // 英文與數字混合或完整車牌比對
      if (plateClean.includes(qClean)) {
        return true;
      }
      // 車主姓名模糊搜尋
      if (item.name && item.name.includes(q)) {
        return true;
      }
      return false;
    }).slice(0, 8); // 取前 8 筆相符結果
  }, [parkingList, quickPlate]);

  // 選中或確認驗證
  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setQuickPlate(vehicle.plate);
    if (vehicle.status === 'pass') {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickPlate.trim()) return;

    if (candidates.length === 1) {
      handleSelectVehicle(candidates[0]);
      return;
    }

    const exact = parkingList.find(p => cleanStr(p.plate) === cleanStr(quickPlate));
    if (exact) {
      handleSelectVehicle(exact);
    } else {
      setSelectedVehicle({
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
      {/* 1. 【置頂核心】車牌進出快速核對站 (支援數字3碼快速過濾) */}
      <div className="p-6 sm:p-8 rounded-2xl border space-y-5 shadow-lg" 
           style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4" 
             style={{ borderColor: 'var(--card-border)' }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-white tracking-wider">
                置頂管制
              </span>
              <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <Car className="w-6 h-6 text-emerald-400" />
                <span>現場工區大門 － 車牌快速核對站</span>
              </h2>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              支援輸入車牌或<strong>「任意數字 3 碼」</strong>即時快搜放行（例如：輸入 <strong>132</strong>、<strong>079</strong>、<strong>898</strong>、<strong>113</strong>）
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 w-fit">
            資料庫載入 {parkingList.length} 輛車
          </div>
        </div>

        {/* 搜尋輸入列 */}
        <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-6 h-6 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={quickPlate}
              onChange={(e) => {
                setQuickPlate(e.target.value);
                if (!e.target.value.trim()) setSelectedVehicle(null);
              }}
              placeholder="請輸入車牌或數字 3 碼 (例：898 或 1079)..."
              className="w-full pl-14 pr-4 py-4 rounded-xl border text-xl font-mono font-black tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
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
            <span>即時驗證放行</span>
          </button>
        </form>

        {/* 數字 3 碼即時候選推薦標籤區 */}
        {candidates.length > 0 && (
          <div className="p-3.5 rounded-xl border space-y-2" style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)' }}>
            <div className="text-xs font-bold flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
              <span className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                <span>即時相符車輛 (點選直接放行)：</span>
              </span>
              <span className="text-[11px] text-slate-400">共 {candidates.length} 筆相符</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {candidates.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectVehicle(item)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95"
                  style={{
                    backgroundColor: selectedVehicle?.id === item.id ? 'var(--primary)' : 'var(--card-bg)',
                    borderColor: selectedVehicle?.id === item.id ? 'var(--primary)' : 'var(--card-border)',
                    color: selectedVehicle?.id === item.id ? '#ffffff' : 'var(--text)'
                  }}
                >
                  <span className="font-mono text-sm tracking-wider font-black text-emerald-400">
                    {item.plate}
                  </span>
                  <span>{item.name}</span>
                  <span className="text-[11px] opacity-75">({item.subItem || item.unit})</span>
                  {item.type === 'vip' && <span className="text-[10px] text-amber-300">👑VIP</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 查驗結果呈現卡 */}
        {selectedVehicle && (
          <div className={`p-6 rounded-2xl border transition-all ${
            selectedVehicle.status === 'pass' 
              ? 'border-emerald-500/60 bg-emerald-500/10 glow-emerald' 
              : (selectedVehicle.status === 'pending' ? 'border-amber-500/60 bg-amber-500/10' : 'border-rose-500/60 bg-rose-500/10 glow-rose')
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-3xl sm:text-4xl font-black tracking-wider" style={{ color: 'var(--text)' }}>
                    {selectedVehicle.plate}
                  </span>
                  {selectedVehicle.type === 'vip' && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-md">
                      👑 VIP長官座車
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold flex flex-wrap items-center gap-3" style={{ color: 'var(--text)' }}>
                  <span>人員：{selectedVehicle.name}</span>
                  <span>|</span>
                  <span>單位：{selectedVehicle.unit}</span>
                  {selectedVehicle.subItem && (
                    <>
                      <span>|</span>
                      <span>職稱：{selectedVehicle.subItem}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                <span className={`px-6 py-3 rounded-xl text-lg font-black uppercase tracking-wider flex items-center gap-2 shadow-lg ${
                  selectedVehicle.status === 'pass'
                    ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                    : (selectedVehicle.status === 'pending' ? 'bg-amber-500 text-slate-900 shadow-amber-500/40' : 'bg-rose-500 text-white shadow-rose-500/40')
                }`}>
                  {selectedVehicle.status === 'pass' ? (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      <span>符合通過 OK!</span>
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

      {/* 2. 案場資訊與管理控制橫幅 */}
      <div className="p-6 rounded-2xl border transition-all" style={{
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(14, 165, 233, 0.08) 100%)',
        borderColor: 'rgba(99, 102, 241, 0.25)'
      }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
              天泰營造勤務戰情中心
            </h1>
            <p className="text-sm mt-1 flex flex-wrap items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <span>使用單位：天泰營造</span>
              <span className="hidden sm:inline">|</span>
              <span>勤務主管：飛龍保全勤務指揮中心</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 管理員身分切換按鈕 (密碼: t1898) */}
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
              className="px-4 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all active:scale-95"
            >
              <Car className="w-4 h-4" />
              <span>車輛管制清單</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className="px-4 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-transform active:scale-95"
            >
              <span>檢視 9 月班表</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. 精簡最小化資料庫同步機制條 */}
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
    </div>
  );
}
