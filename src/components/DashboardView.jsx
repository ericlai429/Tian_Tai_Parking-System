import React, { useState, useMemo, useEffect } from 'react';
import { 
  Car, Search, CheckCircle2, XCircle, 
  ExternalLink, Lock, Unlock, ArrowRight, Sparkles, Hash,
  Camera, Download, Trash2, Clock, Building2
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

  // 本日車輛進場紀錄 (自 localStorage 讀取或初始化)
  const [entryLogs, setEntryLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('tian_tai_entry_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 標準化車牌號碼 (去空白與破折號)
  const cleanStr = (str) => (str || '').replace(/[\s-]/g, '').toUpperCase();
  // 提取純數字
  const extractDigits = (str) => (str || '').replace(/\D/g, '');

  // 取得當前時間字串 (格式：YYYY/MM/DD HH:mm，不顯示秒)
  const getEntryTimeString = () => {
    const now = new Date();
    const Y = now.getFullYear();
    const M = String(now.getMonth() + 1).padStart(2, '0');
    const D = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${Y}/${M}/${D} ${hh}:${mm}`;
  };

  // 新增進場紀錄 (單位, 車牌, 時間[無秒])
  const recordEntry = (vehicle) => {
    const timeStr = getEntryTimeString();
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      plate: vehicle.plate,
      name: vehicle.name || '車主',
      unit: vehicle.unit || '外部單位',
      subItem: vehicle.subItem || '',
      passNo: vehicle.passNo || '',
      type: vehicle.type || 'regular',
      time: timeStr
    };

    setEntryLogs(prev => {
      // 避免 1 分鐘內重複點擊同一台車刷入多筆
      if (prev.length > 0 && prev[0].plate === newLog.plate && prev[0].time === newLog.time) {
        return prev;
      }
      const updated = [newLog, ...prev];
      localStorage.setItem('tian_tai_entry_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // 清除進場紀錄 (限 Admin 或換班歸零)
  const handleClearLogs = () => {
    if (confirm('確定要清空本日進場紀錄嗎？')) {
      setEntryLogs([]);
      localStorage.removeItem('tian_tai_entry_logs');
    }
  };

  // 一鍵存成圖片檔 (HTML5 Canvas 繪製高解析度圖片)
  const handleExportImage = () => {
    if (entryLogs.length === 0) {
      alert('目前尚無進場紀錄，無法生成存證照片。');
      return;
    }

    // 直式相片規格 (寬度 600px，適合手機直接長螢幕瀏覽或轉發 LINE/相簿)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 600;
    const rowHeight = 52; // 加高單行，字體更大
    const headerHeight = 150;
    const padding = 20;
    const tableHeaderHeight = 44;
    // 確保照片具備直式縱深 (至少 800px 高度)
    const contentHeight = headerHeight + tableHeaderHeight + (entryLogs.length * rowHeight) + 60;
    const height = Math.max(850, contentHeight);

    canvas.width = width;
    canvas.height = height;

    // 1. 深色質感漸層背景
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0b1329');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. 頂部飾條與大標題 (字體加大)
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(0, 0, width, 8);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Noto Sans TC", sans-serif';
    ctx.fillText('天泰營造 工區車輛進場留存表', padding, 48);

    const now = new Date();
    const exportTimeStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px "Noto Sans TC", sans-serif';
    ctx.fillText(`製表時間：${exportTimeStr}`, padding, 78);
    ctx.fillText(`執勤單位：天泰營造 & 飛龍保全  |  進場：${entryLogs.length} 車次`, padding, 102);

    // 3. 欄位標題條 (序號、車牌、單位人員、進場時間 緊密排列，無多餘留白)
    // 欄位分佈：序號(45px) | 車牌(160px) | 單位/人員(225px) | 進場時間(130px)
    const tableTop = 125;
    ctx.fillStyle = 'rgba(79, 70, 229, 0.35)';
    ctx.fillRect(padding, tableTop, width - (padding * 2), tableHeaderHeight);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
    ctx.strokeRect(padding, tableTop, width - (padding * 2), tableHeaderHeight);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px "Noto Sans TC", sans-serif';
    ctx.fillText('序號', padding + 8, tableTop + 28);
    ctx.fillText('車牌號碼', padding + 52, tableTop + 28);
    ctx.fillText('單位 / 人員', padding + 215, tableTop + 28);
    ctx.fillText('進場時間', padding + 435, tableTop + 28);

    // 4. 表格行渲染 (字體加大清晰易讀)
    let currentY = tableTop + tableHeaderHeight;
    entryLogs.forEach((item, index) => {
      // 斑馬條紋背景
      if (index % 2 === 1) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.fillRect(padding, currentY, width - (padding * 2), rowHeight);
      }

      // 底部分隔線
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
      ctx.beginPath();
      ctx.moveTo(padding, currentY + rowHeight);
      ctx.lineTo(width - padding, currentY + rowHeight);
      ctx.stroke();

      // 序號 (字體加大 16px)
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(String(index + 1).padStart(2, '0'), padding + 10, currentY + 33);

      // 車牌號碼 (字體加大 19px，高對比明亮天藍色)
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 19px monospace';
      const passTag = item.passNo ? `[#${item.passNo}] ` : '';
      ctx.fillText(`${passTag}${item.plate}`, padding + 52, currentY + 33);

      // 單位 / 人員 (字體加大 16px，緊湊不留白)
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 16px "Noto Sans TC", sans-serif';
      const unitText = item.subItem ? `${item.unit} (${item.subItem})` : `${item.unit} - ${item.name}`;
      ctx.fillText(unitText.slice(0, 14), padding + 215, currentY + 33);

      // 進場時間 (字體加大 16px，翡翠綠)
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(item.time, padding + 435, currentY + 33);

      currentY += rowHeight;
    });

    // 5. 底部相片浮水印
    ctx.fillStyle = '#64748b';
    ctx.font = '13px "Noto Sans TC", sans-serif';
    ctx.fillText('天泰營造現場智慧車輛放行管制系統存證相片', padding, height - 25);

    // 6. 觸發下載直式照片
    const fileDate = now.toISOString().slice(0, 10).replace(/-/g, '');
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `天泰車輛進場直式存證_${fileDate}.png`;
    link.href = dataUrl;
    link.click();
  };

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

  // 選中或確認驗證 (自動記錄進入車子時間)
  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setQuickPlate(vehicle.plate);
    recordEntry(vehicle); // 自動記入進場時間
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
      const visitor = {
        plate: quickPlate.trim().toUpperCase(),
        status: 'not_found',
        name: '未註冊車輛',
        unit: '外部訪客',
        notes: '此車輛未在名冊中，警衛請依標準訪客程序登記換證。'
      };
      setSelectedVehicle(visitor);
      recordEntry(visitor); // 訪客進入亦同步記錄時間
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

      {/* 2. 【本日進場時間留存】單位、車牌、時間(無秒) & 一鍵存圖片留存 */}
      <div className="p-4 rounded-xl border space-y-3 shadow-md"
           style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between gap-2 border-b pb-2.5"
             style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-black tracking-tight" style={{ color: 'var(--text)' }}>
              本日進場時間留存
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              已記 {entryLogs.length} 車
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportImage}
              disabled={entryLogs.length === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
              title="匯出本日進場時間相片檔留存"
            >
              <Camera className="w-3.5 h-3.5 text-indigo-200" />
              <span>一鍵存相片</span>
            </button>

            {entryLogs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="p-1.5 rounded-lg border text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                style={{ borderColor: 'var(--card-border)' }}
                title="清空紀錄"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 進場紀錄清單列表 (單位, 車牌, 時間無秒) */}
        {entryLogs.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            尚無車輛進場紀錄。於上方核對通過後，將自動記錄時間並供存檔。
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {entryLogs.map((log, idx) => (
              <div
                key={log.id}
                className="p-2.5 rounded-lg border flex items-center justify-between gap-2 text-xs transition-all"
                style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[11px] font-bold text-slate-400 w-5 text-center shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {log.passNo && (
                    <span 
                      className="font-mono text-[11px] font-black px-1.5 py-0.5 rounded shrink-0 border"
                      style={{ 
                        backgroundColor: 'var(--passno-bg)', 
                        color: 'var(--passno-text)',
                        borderColor: 'currentColor'
                      }}
                    >
                      #{log.passNo}
                    </span>
                  )}
                  <span 
                    className="font-mono font-black text-sm tracking-wider shrink-0"
                    style={{ color: 'var(--plate-color)' }}
                  >
                    {log.plate}
                  </span>
                  <span className="truncate font-semibold" style={{ color: 'var(--text)' }}>
                    {log.unit}
                    <span className="text-[11px] opacity-75 font-normal ml-1">
                      ({log.subItem || log.name})
                    </span>
                  </span>
                </div>

                <div className="font-mono text-[11px] font-bold text-emerald-400 shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {log.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
