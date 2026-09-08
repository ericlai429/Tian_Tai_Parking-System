import React, { useState, useMemo, useEffect } from 'react';
import { 
  Car, Search, CheckCircle2, XCircle, AlertCircle,
  ExternalLink, Lock, Unlock, ArrowRight, Sparkles, Hash,
  Camera, Download, Trash2, Clock, Building2, ShieldCheck, KeyRound
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

  // 保全員放行確認 PIN 碼驗證 (Pin: 888，當班驗證一次即可保持授權)
  const [isSecurityUnlocked, setIsSecurityUnlocked] = useState(() => {
    return sessionStorage.getItem('tian_tai_security_auth') === 'true';
  });
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pendingVehicle, setPendingVehicle] = useState(null);
  const [pinSuccessToast, setPinSuccessToast] = useState('');

  // 刪除進場紀錄管理員密碼驗證 (密碼: t1898)
  const [showDeleteAdminModal, setShowDeleteAdminModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null); // 'all' 或 特定 id
  const [deleteAdminPassword, setDeleteAdminPassword] = useState('');
  const [deleteAdminError, setDeleteAdminError] = useState('');

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
    if (!vehicle || !vehicle.plate) return;
    const timeStr = getEntryTimeString();
    const uniqueId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newLog = {
      id: uniqueId,
      plate: vehicle.plate,
      name: vehicle.name || '車主',
      unit: vehicle.unit || '外部單位',
      subItem: vehicle.subItem || '',
      passNo: vehicle.passNo || '',
      type: vehicle.type || 'regular',
      time: timeStr
    };

    setEntryLogs(prev => {
      const prevList = Array.isArray(prev) ? prev : [];
      // 若剛好在同一分鐘同一台車重複按，更新該筆時間或允許紀錄但給予不同唯一 key
      const updated = [newLog, ...prevList];
      try {
        localStorage.setItem('tian_tai_entry_logs', JSON.stringify(updated));
      } catch (e) {
        console.error('LocalStorage write error:', e);
      }
      return updated;
    });
  };

  // 觸發刪除請求 (需要管理員密碼驗證)
  const requestDeleteLog = (target = 'all') => {
    setDeleteTargetId(target);
    setDeleteAdminPassword('');
    setDeleteAdminError('');
    setShowDeleteAdminModal(true);
  };

  // 驗證管理員密碼並執行刪除
  const handleConfirmDeleteWithAdmin = (e) => {
    e.preventDefault();
    if (deleteAdminPassword.trim() === 't1898') {
      if (deleteTargetId === 'all') {
        setEntryLogs([]);
        localStorage.removeItem('tian_tai_entry_logs');
        setPinSuccessToast('已清空本日所有進場紀錄！');
      } else {
        setEntryLogs(prev => {
          const updated = prev.filter(item => item.id !== deleteTargetId);
          localStorage.setItem('tian_tai_entry_logs', JSON.stringify(updated));
          return updated;
        });
        setPinSuccessToast('已成功刪除該筆車輛進場紀錄！');
      }
      setShowDeleteAdminModal(false);
      setDeleteTargetId(null);
      setDeleteAdminPassword('');
      setDeleteAdminError('');
      setTimeout(() => setPinSuccessToast(''), 3000);
    } else {
      setDeleteAdminError('管理員密碼錯誤！無法刪除紀錄');
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

  const [debouncedPlate, setDebouncedPlate] = useState('');

  // 避免資料連續狂按狂打輸入，每碼車碼相隔 50ms 防抖過濾，避免系統崩潰
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPlate(quickPlate);
    }, 50);

    return () => {
      clearTimeout(handler);
    };
  }, [quickPlate]);

  // 即時 2~3 碼 / 模糊過濾候選車輛 (限制：只輸入 1 碼時不動作，防範資料探測蒐集；2 碼以上即刻極速匹配)
  const candidates = useMemo(() => {
    const q = quickPlate.trim();
    // 嚴格限制：小於 2 碼不觸發過濾，防止單一字元暴力枚舉整批名冊
    if (!q || q.length < 2) return [];
    
    const qClean = cleanStr(q);
    const qDigits = extractDigits(q);

    return parkingList.filter(item => {
      const plateClean = cleanStr(item.plate);
      const plateDigits = extractDigits(item.plate);
      const passNo = item.passNo ? String(item.passNo) : '';

      // 流水號比對 (例如輸入 01, 13, 14 等)
      if (passNo && (passNo === q || passNo === q.padStart(3, '0') || passNo.endsWith(q))) {
        return true;
      }
      // 純數字比對 (例如輸入 68, 683, 31, 887 等任意 2~3 碼純數字)
      if (qDigits && qDigits.length >= 2 && plateDigits.includes(qDigits)) {
        return true;
      }
      // 完整或局部車牌比對 (去破折號比對，如 6831MR, 6831, 68)
      if (qClean.length >= 2 && plateClean.includes(qClean)) {
        return true;
      }
      // 車牌原始字串比對 (大小寫不拘)
      if (item.plate.toUpperCase().includes(q.toUpperCase())) {
        return true;
      }
      // 車主姓名模糊搜尋 (至少2字元)
      if (q.length >= 2 && item.name && item.name.includes(q)) {
        return true;
      }
      return false;
    }).slice(0, 10);
  }, [parkingList, quickPlate]);

  // 當快速輸入 3~4 碼以上，若查未屬資料庫之車牌，主動顯示「未通過,待通報查核」紅色呼吸燈外框
  const isUnmatchedQuery = useMemo(() => {
    const q = quickPlate.trim();
    return q.length >= 3 && candidates.length === 0 && !selectedVehicle;
  }, [quickPlate, candidates, selectedVehicle]);

  // 選中或確認驗證 (若當班已輸入 888 解鎖，直接放行記錄；未解鎖時才彈出 PIN 碼確認視窗)
  const triggerReleaseWithPin = (vehicle) => {
    setSelectedVehicle(vehicle);
    setQuickPlate(vehicle.plate);

    // 若保全當班已驗證解鎖過，直接放行並存檔，無需每台車重複輸入
    if (isSecurityUnlocked) {
      recordEntry(vehicle);
      if (vehicle.status === 'pass') {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      }
      setPinSuccessToast(`車輛 [${vehicle.plate}] 已核准放行並記錄時間。`);
      setTimeout(() => setPinSuccessToast(''), 2500);
      return;
    }

    setPendingVehicle(vehicle);
    setPinInput('');
    setPinError('');
    setShowPinModal(true);
  };

  const handleSelectVehicle = (vehicle) => {
    triggerReleaseWithPin(vehicle);
  };

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickPlate.trim()) return;

    if (candidates.length === 1) {
      triggerReleaseWithPin(candidates[0]);
      return;
    }

    const exact = parkingList.find(p => cleanStr(p.plate) === cleanStr(quickPlate));
    if (exact) {
      triggerReleaseWithPin(exact);
    } else {
      const visitor = {
        plate: quickPlate.trim().toUpperCase(),
        status: 'not_found',
        name: '未註冊車輛',
        unit: '外部訪客',
        notes: '此車輛未在名冊中，警衛請依標準訪客程序登記換證。'
      };
      triggerReleaseWithPin(visitor);
    }
  };

  // 【不在名冊內 (備查)】：嚴格免保全 PIN 碼，直接以「未登記/外部訪客(備查)」登錄備存至本日進場時間留存清單
  const handleDirectVisitorRecord = () => {
    const rawInput = quickPlate.trim().toUpperCase();
    if (!rawInput) {
      alert('請先於搜尋框輸入車牌號碼，再點擊「不在名冊內 (備查)」！');
      return;
    }

    const visitorVehicle = {
      plate: rawInput,
      name: '未在名冊(備查)',
      unit: '外部訪客',
      subItem: '臨時抵達',
      passNo: '備查',
      status: 'not_found',
      type: 'temp'
    };

    // 直接呼叫 recordEntry，完全不經過 triggerReleaseWithPin 或 888 PIN 碼驗證
    recordEntry(visitorVehicle);
    setSelectedVehicle(visitorVehicle);
    setPinSuccessToast(`已備存車輛 [${rawInput}] (未在名冊/外部訪客)，免PIN碼直接留存！`);
    setTimeout(() => setPinSuccessToast(''), 3000);
  };

  // 驗證保全 PIN 碼 (需輸入 888 才能正常存檔本日進場留存，成功後保持當班授權)
  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === '888') {
      setIsSecurityUnlocked(true);
      sessionStorage.setItem('tian_tai_security_auth', 'true');

      if (pendingVehicle) {
        recordEntry(pendingVehicle); // 正常存檔進場紀錄
        if (pendingVehicle.status === 'pass') {
          confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
        }
      }
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
      setPinSuccessToast(`保全授權成功！車輛 [${pendingVehicle?.plate}] 已放行，當班已保持解鎖狀態。`);
      setTimeout(() => setPinSuccessToast(''), 3500);
      setPendingVehicle(null);
    } else {
      setPinError('PIN 碼錯誤！請輸入保全員確認碼 888');
    }
  };

  // 保全授權鎖定切換
  const toggleSecurityLock = () => {
    if (isSecurityUnlocked) {
      setIsSecurityUnlocked(false);
      sessionStorage.removeItem('tian_tai_security_auth');
      setPinSuccessToast('已鎖定保全授權，下次驗證車輛需重新輸入 PIN 碼。');
      setTimeout(() => setPinSuccessToast(''), 2500);
    } else {
      setPinInput('');
      setPinError('');
      setShowPinModal(true);
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
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleSecurityLock}
                className={`text-[11px] font-black px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
                  isSecurityUnlocked
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
                title={isSecurityUnlocked ? "保全當班中：已授權放行（點擊可鎖定）" : "尚未授權：點擊輸入保全 PIN 碼 888"}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>{isSecurityUnlocked ? '保全已解鎖' : '需保全PIN'}</span>
              </button>
              <div className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {parkingList.length} 輛
              </div>
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            支援輸入車牌或「任意數字 2~3 碼」（例：98、132）
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
              placeholder="輸入車牌或數字 2~3 碼..."
              className="w-full pl-11 pr-3 py-3 rounded-xl border text-lg font-mono font-black tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              style={{ 
                backgroundColor: 'var(--card-hover)', 
                borderColor: 'var(--card-border)',
                color: 'var(--text)' 
              }}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button 
              type="submit"
              className="w-full py-3 rounded-xl font-black text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>紀錄 且 放行</span>
            </button>
            <button 
              type="button"
              onClick={handleDirectVisitorRecord}
              className="w-full py-3 rounded-xl font-black text-sm bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0 cursor-pointer"
              title="未在名冊內之車輛免保全PIN碼，直接備存登錄進本日留存清單"
            >
              <AlertCircle className="w-4 h-4" />
              <span>不在名冊內 (備查)</span>
            </button>
          </div>
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

        {/* 當輸入 3~4 碼以上查無此車牌：主動顯示「未通過,待通報查核」紅色呼吸燈外框卡片 */}
        {isUnmatchedQuery && (
          <div className="p-4 rounded-xl border-2 border-rose-500 bg-rose-500/15 glow-rose text-rose-200 animate-fadeIn space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
                <span>查無名冊資料：<span className="underline decoration-rose-400 font-black">未通過，待通報查核</span></span>
              </div>
              <button
                type="button"
                onClick={handleDirectVisitorRecord}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 shadow transition-all active:scale-95"
              >
                一鍵備查
              </button>
            </div>
            <div className="text-xs text-rose-300/80 leading-relaxed font-mono">
              輸入「{quickPlate}」未符合任何在冊車輛。請指示靠邊暫停，並通報工區幹部或點擊一鍵備查記錄。
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
      <div 
        className="p-4 rounded-2xl border space-y-3.5 transition-all shadow-lg"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b" style={{ borderColor: 'var(--card-border)' }}>
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
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  requestDeleteLog('all');
                }}
                className="p-2 rounded-lg border text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-all cursor-pointer active:scale-90 touch-manipulation"
                style={{ borderColor: 'var(--card-border)' }}
                title="清空本日所有紀錄 (需管理員密碼)"
              >
                <Trash2 className="w-4 h-4 pointer-events-none" />
              </button>
            )}
          </div>
        </div>

        {/* 進場紀錄清單列表 (無最大高度限制，隨資料量自適應延展) */}
        {entryLogs.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            尚無車輛進場紀錄。於上方核對通過或點擊「不在名冊內 (備查)」後，將自動記錄時間並供存檔。
          </div>
        ) : (
          <div className="space-y-2 min-h-[120px] transition-all">
            {entryLogs.map((log, idx) => (
              <div
                key={log.id}
                className="p-2.5 sm:p-3 rounded-xl border flex flex-col gap-1.5 text-xs transition-all shadow-xs"
                style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)' }}
              >
                {/* 上排：序號、通行證號、車牌號碼 (大字辨識) 與右側刪除鈕 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-400 w-5 text-center shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    {log.passNo && (
                      <span 
                        className="font-mono text-xs font-black px-1.5 py-0.5 rounded shrink-0 border"
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
                      className="font-mono font-black text-base sm:text-lg tracking-wider"
                      style={{ color: 'var(--plate-color)' }}
                    >
                      {log.plate}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      requestDeleteLog(log.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer active:scale-90 touch-manipulation shrink-0"
                    title="刪除此筆紀錄 (需管理員密碼)"
                  >
                    <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                  </button>
                </div>

                {/* 下排：所屬單位與姓名職稱 (左側) + 進場時間標章 (右側，絕不重疊) */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-700/30 text-[11px] sm:text-xs">
                  <div className="font-medium truncate min-w-0" style={{ color: 'var(--text)' }}>
                    <span className="font-bold">{log.unit}</span>
                    <span className="text-slate-400 font-normal ml-1">
                      ({log.subItem || log.name})
                    </span>
                  </div>

                  <div className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0 whitespace-nowrap">
                    {log.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 成功放行提示條 (加上 pointer-events-none 避免在浮現時阻擋使用者點擊輸入框或卡片) */}
      {pinSuccessToast && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-400 pointer-events-none">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{pinSuccessToast}</span>
        </div>
      )}

      {/* 保全放行 PIN 碼驗證彈窗 (密碼: 888) */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-4"
               style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            
            <div className="flex items-center justify-between border-b pb-3"
                 style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight" style={{ color: 'var(--text)' }}>
                    保全員放行授權確認
                  </h3>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    車輛即將進場放行並登記時間
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowPinModal(false);
                  setPinInput('');
                  setPinError('');
                  setPendingVehicle(null);
                }}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* 待放行車輛摘要 */}
            {pendingVehicle && (
              <div className="p-3 rounded-xl border space-y-1 text-xs"
                   style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)' }}>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-base text-sky-400">
                    {pendingVehicle.plate}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    pendingVehicle.status === 'pass' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {pendingVehicle.status === 'pass' ? '核准放行' : '未註冊/臨時訪客'}
                  </span>
                </div>
                <div className="text-[11px] font-semibold" style={{ color: 'var(--text)' }}>
                  {pendingVehicle.unit} - {pendingVehicle.name} ({pendingVehicle.subItem || '人員'})
                </div>
              </div>
            )}

            {/* PIN 碼輸入表單 */}
            <form onSubmit={handleVerifyPin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text)' }}>
                  請輸入保全確認 PIN 碼：
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (pinError) setPinError('');
                    }}
                    placeholder="輸入保全 PIN 碼"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-center font-mono font-black text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
                    autoFocus
                  />
                </div>
                {pinError && (
                  <p className="text-xs text-rose-400 font-bold mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {pinError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinInput('');
                    setPinError('');
                    setPendingVehicle(null);
                  }}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border transition-colors"
                  style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                >
                  確認放行存檔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 刪除車輛紀錄管理員密碼驗證彈窗 (密碼: t1898) */}
      {showDeleteAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-4"
               style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            
            <div className="flex items-center justify-between border-b pb-3"
                 style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight" style={{ color: 'var(--text)' }}>
                    {deleteTargetId === 'all' ? '清空進場紀錄授權' : '刪除單筆紀錄授權'}
                  </h3>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    此操作需要輸入管理員密碼
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowDeleteAdminModal(false);
                  setDeleteAdminPassword('');
                  setDeleteAdminError('');
                  setDeleteTargetId(null);
                }}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDeleteWithAdmin} className="space-y-3">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text)' }}>
                  請輸入後台管理員密碼：
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="password"
                    value={deleteAdminPassword}
                    onChange={(e) => {
                      setDeleteAdminPassword(e.target.value);
                      if (deleteAdminError) setDeleteAdminError('');
                    }}
                    placeholder="輸入管理員密碼"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-500"
                    style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
                    autoFocus
                  />
                </div>
                {deleteAdminError && (
                  <p className="text-xs text-rose-400 font-bold mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {deleteAdminError}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteAdminModal(false);
                    setDeleteAdminPassword('');
                    setDeleteAdminError('');
                    setDeleteTargetId(null);
                  }}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border transition-colors"
                  style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 transition-all active:scale-95"
                >
                  確認刪除
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
