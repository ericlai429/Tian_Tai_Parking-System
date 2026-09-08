import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Car, Search, CheckCircle2, XCircle, AlertCircle, 
  Upload, Download, Plus, Trash2, Shield, Crown, 
  Phone, User, Building, FileSpreadsheet, Sparkles, Filter,
  Cloud, RefreshCw, ExternalLink, Lock, Unlock, ChevronLeft, ChevronRight, LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseParkingExcel, exportParkingToExcel } from '../utils/excelHelper';
import { fetchCloudParkingData } from '../utils/cloudSheetHelper';

export default function ParkingView({ 
  parkingList, 
  setParkingList, 
  cloudConfig, 
  onOpenCloudSync,
  setCloudStatus,
  isAdmin,
  onRequireAdmin,
  onLogout
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, vip, regular, temp
  const [verifiedVehicle, setVerifiedVehicle] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    name: '',
    unit: '',
    phone: '',
    subItem: '',
    notes: '',
    type: 'regular',
    status: 'pass'
  });

  const fileInputRef = useRef(null);

  // 橫向滾動與滑鼠拖曳 Ref
  const parkingTableRef = useRef(null);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // 滑鼠滾輪直接水平捲動 (NB 筆電滑鼠支援)
  useEffect(() => {
    const el = parkingTableRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // 滑鼠按住拖曳平移 (Drag-to-Scroll)
  const handleMouseDown = (e) => {
    if (e.button !== 0 || !parkingTableRef.current || e.target.closest('button, a, input')) return;
    isMouseDownRef.current = true;
    setIsDragging(true);
    startXRef.current = e.pageX - parkingTableRef.current.offsetLeft;
    scrollLeftRef.current = parkingTableRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current || !parkingTableRef.current) return;
    e.preventDefault();
    const x = e.pageX - parkingTableRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    parkingTableRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    setIsDragging(false);
  };

  // 左右平移跳轉按鈕
  const scrollTable = (direction) => {
    if (!parkingTableRef.current) return;
    const delta = direction === 'left' ? -260 : 260;
    parkingTableRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  // 標準化車牌號碼 (去空白與破折號)
  const normalizePlate = (str) => (str || '').replace(/[\s-]/g, '').toUpperCase();

  // 即時驗證搜尋車牌
  const handleVerifyPlate = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const cleanTarget = normalizePlate(searchQuery);
    const found = parkingList.find(v => normalizePlate(v.plate) === cleanTarget);

    if (found) {
      setVerifiedVehicle(found);
      if (found.status === 'pass') {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      setVerifiedVehicle({
        plate: searchQuery.trim().toUpperCase(),
        name: '訪客 / 未登記車輛',
        unit: '外部單位',
        phone: '',
        subItem: '臨時抵達',
        notes: '此車輛不在名冊中。請警衛人員依訪客SOP登記換證。',
        type: 'temp',
        status: 'denied',
        isUnregistered: true
      });
    }
  };

  // 從 Google 雲端試算表拉取最新車冊
  const handleSyncCloudSheet = async () => {
    setIsSyncing(true);
    try {
      const url = cloudConfig?.parkingUrl;
      const vehicles = await fetchCloudParkingData(url);
      setParkingList(vehicles);
      localStorage.setItem('tian_tai_parking_data', JSON.stringify(vehicles));
      if (setCloudStatus) {
        setCloudStatus({ connected: true, lastSync: new Date().toLocaleTimeString() });
      }
      alert(`🎉 成功自 Google 雲端試算表同步 ${vehicles.length} 筆最新名冊！`);
      confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
    } catch (err) {
      alert(`同步失敗：${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // 處理匯入使用者的新 Excel 檔 (需要 Admin 權限)
  const handleFileUpload = (e) => {
    if (!isAdmin) {
      onRequireAdmin();
      e.target.value = '';
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        const parsed = parseParkingExcel(buffer);
        if (parsed.length === 0) {
          alert('未能從該 Excel 中解析出有效的車牌欄位，請確認試算表中包含「車牌」或「車號」標題。');
          return;
        }
        setParkingList(parsed);
        localStorage.setItem('tian_tai_parking_data', JSON.stringify(parsed));
        alert(`🎉 成功自 Excel 匯入 ${parsed.length} 筆車輛資料！`);
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
      } catch (err) {
        console.error(err);
        alert(`匯入失敗：${err.message}`);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // 手動新增車輛 (需要 Admin 權限)
  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    if (!newVehicle.plate.trim()) {
      alert('請填寫車牌號碼！');
      return;
    }
    const item = {
      id: `p_${Date.now()}`,
      plate: newVehicle.plate.trim().toUpperCase(),
      name: newVehicle.name.trim() || '未具名',
      unit: newVehicle.unit.trim() || '天泰營造',
      phone: newVehicle.phone.trim(),
      subItem: newVehicle.subItem.trim(),
      notes: newVehicle.notes.trim(),
      admin1: 'OK',
      admin2: 'OK',
      admin3: '',
      type: newVehicle.type,
      status: newVehicle.status,
      lastEntry: ''
    };
    const updated = [item, ...parkingList];
    setParkingList(updated);
    localStorage.setItem('tian_tai_parking_data', JSON.stringify(updated));
    setShowAddModal(false);
    setNewVehicle({
      plate: '',
      name: '',
      unit: '',
      phone: '',
      subItem: '',
      notes: '',
      type: 'regular',
      status: 'pass'
    });
    alert(`車牌 ${item.plate} 已成功加入名冊！`);
  };

  // 刪除車輛 (需要 Admin 權限)
  const handleDelete = (id) => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    if (confirm('確定要自名冊中移除此車輛嗎？')) {
      const updated = parkingList.filter(p => p.id !== id);
      setParkingList(updated);
      localStorage.setItem('tian_tai_parking_data', JSON.stringify(updated));
      if (verifiedVehicle && verifiedVehicle.id === id) {
        setVerifiedVehicle(null);
      }
    }
  };

  // 切換車輛核可狀態 (Pass / Denied) (需要 Admin 權限)
  const toggleStatus = (id) => {
    if (!isAdmin) {
      onRequireAdmin();
      return;
    }
    const updated = parkingList.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'pass' ? 'denied' : 'pass';
        return { ...p, status: nextStatus };
      }
      return p;
    });
    setParkingList(updated);
    localStorage.setItem('tian_tai_parking_data', JSON.stringify(updated));
  };

  // 格式化流水號為 3 碼 (例如 001, 002, 004...)
  const formatPassNo = (item, idx) => {
    if (item.passNo) {
      const num = parseInt(String(item.passNo).replace(/\D/g, ''), 10);
      if (!isNaN(num)) return String(num).padStart(3, '0');
      return String(item.passNo);
    }
    return String(idx + 1).padStart(3, '0');
  };

  // 過濾並排序車輛列表：VIP 長官從上而下優先排列，並依 001, 002... 依序往下排序
  const filteredList = useMemo(() => {
    const list = parkingList.filter(item => {
      if (filterType === 'vip' && item.type !== 'vip') return false;
      if (filterType === 'regular' && item.type !== 'regular') return false;
      if (filterType === 'temp' && item.type !== 'temp') return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.plate.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.unit.toLowerCase().includes(q) ||
        (item.passNo && String(item.passNo).includes(q))
      );
    });

    // 排序：VIP長官置頂優先，同等級內依 passNo 數字升冪排序 (001 -> 002 -> 003...)
    return [...list].sort((a, b) => {
      const aIsVip = a.type === 'vip' ? 1 : 0;
      const bIsVip = b.type === 'vip' ? 1 : 0;
      if (aIsVip !== bIsVip) {
        return bIsVip - aIsVip; // VIP 長官在前
      }
      const aNum = parseInt(String(a.passNo || '999').replace(/\D/g, ''), 10) || 999;
      const bNum = parseInt(String(b.passNo || '999').replace(/\D/g, ''), 10) || 999;
      return aNum - bNum;
    });
  }, [parkingList, filterType, searchQuery]);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 頂部簡潔控制列 */}
      <div className="p-3.5 sm:p-4 rounded-xl border space-y-3" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        {/* 第一行：標題與數量統計 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-tight" style={{ color: 'var(--text)' }}>
              車輛名冊
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              共 {parkingList.length} 輛
            </span>
          </div>

          {isAdmin ? (
            <button
              onClick={() => {
                if (window.confirm('確定要登出管理員身分嗎？登出後將切換為訪客模式。')) {
                  onLogout && onLogout();
                }
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
              title="點擊登出管理員身分"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>登出管理</span>
            </button>
          ) : (
            <button
              onClick={() => exportParkingToExcel(parkingList)}
              disabled={parkingList.length === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all hover:bg-slate-800/20 disabled:opacity-50 cursor-pointer"
              style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
              title="匯出 Excel"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>匯出 Excel</span>
            </button>
          )}
        </div>

        {/* 隱藏的檔案上傳 input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept=".xlsx, .xls, .csv" 
          className="hidden" 
        />

        {/* 第二行：功能按鈕獨立成行 (平分整行寬度，大按鍵好按，完全不擠壓炸框) */}
        {isAdmin && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={handleSyncCloudSheet}
                disabled={isSyncing}
                className="w-full py-2 px-1 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="雲端同步名冊"
              >
                <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? '同步中' : '同步'}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-1 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                title="匯入新 Excel"
              >
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span>匯入</span>
              </button>

              <button
                onClick={() => exportParkingToExcel(parkingList)}
                disabled={parkingList.length === 0}
                className="w-full py-2 px-1 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all hover:bg-slate-800/20 disabled:opacity-50 cursor-pointer"
                style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
                title="匯出 Excel"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>匯出</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="w-full py-2 px-1 rounded-xl text-xs font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                title="手動新增車輛"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>新增</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 車輛名冊表格 */}
      <div className="p-3.5 sm:p-4 rounded-xl border space-y-3" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold whitespace-nowrap" style={{ color: 'var(--text)' }}>
                名冊清單 ({filteredList.length} / {parkingList.length})
              </span>
            </div>

            {/* 左右快速移動微調按鈕 */}
            <div className="flex items-center gap-1">
              <button 
                type="button"
                onClick={() => scrollTable('left')}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-300 hover:text-white transition-all shadow-sm"
                title="向左滑動查看車牌/編號"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={() => scrollTable('right')}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-300 hover:text-white transition-all shadow-sm"
                title="向右滑動查看姓名/職稱/狀態"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 類別標籤篩選列 */}
          <div className="flex rounded-xl p-1 border overflow-x-auto" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-hover)' }}>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterType === 'all' ? 'bg-indigo-600 text-white' : ''}`}
              style={{ color: filterType === 'all' ? '#ffffff' : 'var(--text-muted)' }}
            >
              全部車輛
            </button>
            <button
              onClick={() => setFilterType('vip')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterType === 'vip' ? 'bg-indigo-600 text-white' : ''}`}
              style={{ color: filterType === 'vip' ? '#ffffff' : 'var(--text-muted)' }}
            >
              👑 VIP長官
            </button>
            <button
              onClick={() => setFilterType('regular')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterType === 'regular' ? 'bg-indigo-600 text-white' : ''}`}
              style={{ color: filterType === 'regular' ? '#ffffff' : 'var(--text-muted)' }}
            >
              常駐車輛
            </button>
            <button
              onClick={() => setFilterType('temp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filterType === 'temp' ? 'bg-indigo-600 text-white' : ''}`}
              style={{ color: filterType === 'temp' ? '#ffffff' : 'var(--text-muted)' }}
            >
              貨車&重機械
            </button>
          </div>
        </div>

        {/* 表格 (依順序：編號 - 車牌 - 所屬公司 - 職稱 - 姓名) */}
        <div 
          ref={parkingTableRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`overflow-x-auto rounded-xl border select-none transition-colors ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ 
            borderColor: 'var(--card-border)',
            scrollbarWidth: 'thin',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain'
          }}
        >
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="border-b whitespace-nowrap" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-hover)' }}>
                {/* 凍結前兩欄：編號 (寬度 56px) 與 車牌 (寬度 104px) */}
                <th className="p-3 font-bold w-[56px] min-w-[56px] text-center sticky left-0 z-20 whitespace-nowrap" style={{ backgroundColor: 'var(--card-hover)', color: 'var(--text-dim)' }}>
                  編號
                </th>
                <th className="p-3 font-bold w-[104px] min-w-[104px] sticky left-[56px] z-20 whitespace-nowrap" style={{ backgroundColor: 'var(--card-hover)', color: 'var(--text)' }}>
                  車牌號碼
                </th>
                <th className="p-3 font-bold whitespace-nowrap" style={{ color: 'var(--text)' }}>所屬公司</th>
                <th className="p-3 font-bold whitespace-nowrap" style={{ color: 'var(--text)' }}>職稱</th>
                <th className="p-3 font-bold whitespace-nowrap" style={{ color: 'var(--text)' }}>姓名</th>
                <th className="p-3 font-bold whitespace-nowrap" style={{ color: 'var(--text)' }}>類別</th>
                <th className="p-3 font-bold text-center whitespace-nowrap" style={{ color: 'var(--text)' }}>通行狀態</th>
                {isAdmin && (
                  <th className="p-3 font-bold text-right whitespace-nowrap" style={{ color: 'var(--text)' }}>操作</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, idx) => (
                <tr key={item.id} className="border-b hover:bg-slate-800/10 transition-colors whitespace-nowrap" style={{ borderColor: 'var(--card-border)' }}>
                  {/* 凍結欄 1：編號 */}
                  <td className="p-3 text-center font-mono font-black sticky left-0 z-20 whitespace-nowrap" style={{ backgroundColor: 'var(--card-bg)' }}>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-xs">
                      {formatPassNo(item, idx)}
                    </span>
                  </td>
                  {/* 凍結欄 2：車牌號碼 */}
                  <td className="p-3 font-mono font-black text-sm tracking-wider sticky left-[56px] z-20 whitespace-nowrap" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--plate-color)' }}>
                    {item.plate}
                  </td>
                  <td className="p-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text)' }}>
                    {item.unit}
                  </td>
                  <td className="p-3 font-medium whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                    {item.subItem || '-'}
                  </td>
                  <td className="p-3 font-bold whitespace-nowrap" style={{ color: 'var(--text)' }}>
                    {item.name}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.type === 'vip' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : (item.type === 'temp' ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-500/20 text-slate-300')
                    }`}>
                      {item.type === 'vip' ? '👑 VIP長官' : (item.type === 'temp' ? '貨車&重機械' : '常駐固定')}
                    </span>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(item.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-black tracking-wider transition-all ${
                        item.status === 'pass' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      }`}
                      title={isAdmin ? "點擊切換通行狀態" : "需要管理員權限"}
                    >
                      {item.status === 'pass' ? '✔ 核准放行' : '✖ 暫停通行'}
                    </button>
                  </td>
                  {isAdmin && (
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                        title="自名冊移除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 筆電滑鼠操作提示 */}
        <div className="flex items-center justify-between text-[11px] px-1 text-slate-400 border-t pt-2"
             style={{ borderColor: 'var(--card-border)' }}>
          <span className="flex items-center gap-1 text-indigo-300 font-medium">
            <span>🖱️</span>
            <span>NB 滑鼠滾輪／按住拖曳可查看右側資料</span>
          </span>
          <span className="text-[10px] text-slate-500 whitespace-nowrap">
            ← 左右滑動查閱全表 →
          </span>
        </div>
      </div>

      {/* 手動新增車輛彈出視窗 (限 Admin) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl border space-y-4 animate-scaleUp"
               style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', boxShadow: 'var(--shadow)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                手動登記新車輛 (Admin 模式)
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1" style={{ color: 'var(--text-muted)' }}>車牌號碼 *</label>
                <input
                  type="text"
                  required
                  value={newVehicle.plate}
                  onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                  placeholder="例：ABC-1234"
                  className="w-full px-3 py-2 rounded-lg border font-mono font-bold uppercase"
                  style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--text-muted)' }}>姓名/人員</label>
                  <input
                    type="text"
                    value={newVehicle.name}
                    onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                    placeholder="例：郭工程師"
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--text-muted)' }}>所屬公司</label>
                  <input
                    type="text"
                    value={newVehicle.unit}
                    onChange={(e) => setNewVehicle({ ...newVehicle, unit: e.target.value })}
                    placeholder="例：天泰營造 / 永瀚機電"
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--text-muted)' }}>職稱/身分</label>
                  <input
                    type="text"
                    value={newVehicle.subItem}
                    onChange={(e) => setNewVehicle({ ...newVehicle, subItem: e.target.value })}
                    placeholder="例：品管工程師"
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1" style={{ color: 'var(--text-muted)' }}>車輛類別</label>
                  <select
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border font-bold"
                    style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
                  >
                    <option value="regular">常駐車輛</option>
                    <option value="vip">👑 長官 / VIP</option>
                    <option value="temp">貨車&重機械</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1" style={{ color: 'var(--text-muted)' }}>備註說明</label>
                <input
                  type="text"
                  value={newVehicle.notes}
                  onChange={(e) => setNewVehicle({ ...newVehicle, notes: e.target.value })}
                  placeholder="例：現場常駐公務車"
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border text-slate-300 hover:bg-slate-800/30 font-semibold"
                  style={{ borderColor: 'var(--card-border)' }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  確定儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
