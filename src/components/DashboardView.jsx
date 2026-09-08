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

  // 即時 3 碼 / 流水號 / 模糊過濾候選車輛
  const candidates = useMemo(() => {
    const q = quickPlate.trim();
    if (!q) return [];
    
    const qClean = cleanStr(q);
    const qDigits = extractDigits(q);

    return parkingList.filter(item => {
      const plateClean = cleanStr(item.plate);
      const plateDigits = extractDigits(item.plate);
      const passNo = item.passNo ? String(item.passNo) : '';

      // 若查詢流水號 (如輸入 1, 01, 7, 07, 14 等)
      if (passNo && (passNo === q || passNo === q.padStart(2, '0') || passNo.endsWith(q))) {
        return true;
      }
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
    }).slice(0, 10);
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
    <div className="space-y-4 animate-fadeIn">
      {/* 1. 【置頂核心】車牌進出快速核對區 (支援數字3碼及通行證流水號快速過濾) */}
      <div className="p-4 rounded-xl border space-y-4 shadow-md" 
           style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="flex flex-col gap-2 border-b pb-3" 
             style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Car className="w-5 h-5 text-emerald-400" />
              <span>車牌快速核對區</span>
            </h2>
            <div className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {parkingList.length} 輛 (01~16)
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            支援輸入車牌或「任意數字 3 碼」（例：898、132）
          </p>
        </div>

        {/* 搜尋輸入列 */}
        <form onSubmit={handleQuickSubmit} className="flex flex-col gap-2.5">
          <div className="relative w-full">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={quickPlate}
              onChange={(e) => {
                setQuickPlate(e.target.value);
                if (!e.target.value.trim()) setSelectedVehicle(null);
              }}
              placeholder="輸入車牌或數字 3 碼..."
              className="w-full pl-11 pr-3 py-3 rounded-xl border text-lg font-mono font-black tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
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
            className="w-full py-3 rounded-xl font-black text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
          >
            <span>即時驗證放行</span>
          </button>
        </form>

        {/* 即時候選推薦標籤區 (含通行證編號 No. 與車牌) */}
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
                  className="px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95"
                  style={{
                    backgroundColor: selectedVehicle?.id === item.id ? 'var(--primary)' : 'var(--card-bg)',
                    borderColor: selectedVehicle?.id === item.id ? 'var(--primary)' : 'var(--card-border)',
                    color: selectedVehicle?.id === item.id ? '#ffffff' : 'var(--text)'
                  }}
                >
                  {item.passNo && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[11px] font-black">
                      #{item.passNo}
                    </span>
                  )}
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
          <div className={`p-4 rounded-xl border transition-all ${
            selectedVehicle.status === 'pass' 
              ? 'border-emerald-500/60 bg-emerald-500/10 glow-emerald' 
              : (selectedVehicle.status === 'pending' ? 'border-amber-500/60 bg-amber-500/10' : 'border-rose-500/60 bg-rose-500/10 glow-rose')
          }`}>
            <div className="flex flex-col gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedVehicle.passNo && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-indigo-600 text-white font-mono shadow-sm">
                      通行證 #{selectedVehicle.passNo}
                    </span>
                  )}
                  <span className="font-mono text-2xl font-black tracking-wider" style={{ color: 'var(--text)' }}>
                    {selectedVehicle.plate}
                  </span>
                  {selectedVehicle.type === 'vip' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-md">
                      👑 VIP長官座車
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold flex flex-wrap items-center gap-2" style={{ color: 'var(--text)' }}>
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

              <div className="w-full">
                <span className={`w-full py-2.5 rounded-xl text-base font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md ${
                  selectedVehicle.status === 'pass'
                    ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                    : (selectedVehicle.status === 'pending' ? 'bg-amber-500 text-slate-900 shadow-amber-500/40' : 'bg-rose-500 text-white shadow-rose-500/40')
                }`}>
                  {selectedVehicle.status === 'pass' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>符合通過 OK!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
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
      <div className="p-4 rounded-xl border transition-all" style={{
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(14, 165, 233, 0.08) 100%)',
        borderColor: 'rgba(99, 102, 241, 0.25)'
      }}>
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-lg font-black tracking-tight" style={{ color: 'var(--text)' }}>
              天泰營造停車管理
            </h1>
            <p className="text-xs mt-0.5 flex flex-wrap items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <span>使用單位：天泰營造 & 飛龍保全</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('parking')}
              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Car className="w-3.5 h-3.5" />
              <span>車輛清單</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              <span>9 月班表</span>
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
