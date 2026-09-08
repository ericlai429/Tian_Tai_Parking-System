import React, { useState, useMemo, useRef } from 'react';
import { 
  Car, Search, CheckCircle2, XCircle, AlertCircle, 
  Upload, Download, Plus, Trash2, Shield, Crown, 
  Phone, User, Building, FileSpreadsheet, Sparkles, Filter,
  Cloud, RefreshCw, ExternalLink, Lock, Unlock 
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
  onRequireAdmin
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

  // 過濾車輛列表
  const filteredList = useMemo(() => {
    return parkingList.filter(item => {
      if (filterType === 'vip' && item.type !== 'vip') return false;
      if (filterType === 'regular' && item.type !== 'regular') return false;
      if (filterType === 'temp' && item.type !== 'temp') return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.plate.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.unit.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    });
  }, [parkingList, filterType, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 頂部操作控制列 */}
      <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-black bg-emerald-500 text-white flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5" />
                智慧停車通行管制系統
              </span>
              <span className="text-xs font-semibold text-slate-400">
                名冊總計：{parkingList.length} 輛車
              </span>
              {isAdmin && (
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  👑 後台管理模式已啟用 (t1898)
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight" style={{ color: 'var(--text)' }}>
              車輛放行查驗與名冊中心
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              長官座車、常駐工程車與廠商出入放行查核。支援即時車牌比對與 Google 試算表同步。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* 隱藏的檔案上傳 input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
            />

            {/* 一鍵雲端同步按鈕 */}
            <button
              onClick={handleSyncCloudSheet}
              disabled={isSyncing}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              title="立即從 Google 試算表抓取最新名冊"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? '同步中...' : '雲端同步名冊'}</span>
            </button>

            {/* 匯入 Excel 按鈕 (需要 Admin 權限) */}
            <button
              onClick={() => {
                if (isAdmin) fileInputRef.current?.click();
                else onRequireAdmin();
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>匯入新 Excel 車冊</span>
            </button>

            {/* 匯出 Excel 按鈕 */}
            <button
              onClick={() => exportParkingToExcel(parkingList)}
              disabled={parkingList.length === 0}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-hover)', color: 'var(--text)' }}
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>匯出 Excel 清單</span>
            </button>

            {/* 手動新增按鈕 (需要 Admin 權限) */}
            <button
              onClick={() => {
                if (isAdmin) setShowAddModal(true);
                else onRequireAdmin();
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>手動新增車輛</span>
            </button>
          </div>
        </div>
      </div>

      {/* 雲端試算表連結與 Admin 編輯橫幅 */}
      <div className="p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3"
           style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs bg-emerald-600 shadow-sm">
            <Cloud className="w-4 h-4" />
          </span>
          <div className="text-xs">
            <div className="font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <span>已連接雲端試算表：</span>
              <span className="text-emerald-400 font-mono">天泰營造 工地工區大門－車輛管制</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-bold">由 Admin 編輯 (密碼: t1898)</span>
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              管理員可隨時在 Google 試算表新增、修改車號或職稱，系統支援一鍵同步或離線放行。
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={cloudConfig?.parkingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>線上以 Admin 編輯試算表</span>
          </a>
        </div>
      </div>

      {/* 車牌快速查驗儀表（大字體、高對比） */}
      <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <form onSubmit={handleVerifyPlate} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="輸入車牌號碼 (例：1079-KS 或 BVU-3132)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border text-lg sm:text-xl font-mono font-black tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            className="px-8 py-3.5 rounded-xl text-base font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
          >
            <span>即時驗證放行</span>
          </button>
        </form>

        {/* 查驗放行結果卡 */}
        {verifiedVehicle && (
          <div className={`p-6 rounded-2xl border transition-all ${
            verifiedVehicle.status === 'pass'
              ? 'border-emerald-500/60 bg-emerald-500/10 glow-emerald'
              : 'border-rose-500/60 bg-rose-500/10 glow-rose'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-3xl sm:text-4xl font-black tracking-widest" style={{ color: 'var(--text)' }}>
                    {verifiedVehicle.plate}
                  </span>
                  {verifiedVehicle.type === 'vip' && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
                      <Crown className="w-3.5 h-3.5" />
                      長官貴賓車輛
                    </span>
                  )}
                </div>

                <div className="text-sm font-semibold flex items-center gap-3" style={{ color: 'var(--text)' }}>
                  <span>人員：{verifiedVehicle.name}</span>
                  <span>|</span>
                  <span>單位：{verifiedVehicle.unit}</span>
                  {verifiedVehicle.subItem && (
                    <>
                      <span>|</span>
                      <span>職稱：{verifiedVehicle.subItem}</span>
                    </>
                  )}
                </div>

                {verifiedVehicle.notes && (
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    備註：{verifiedVehicle.notes}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                <div className={`px-6 py-2.5 rounded-xl text-lg font-black uppercase tracking-wider shadow-lg flex items-center gap-2 ${
                  verifiedVehicle.status === 'pass'
                    ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                    : 'bg-rose-500 text-white shadow-rose-500/40'
                }`}>
                  {verifiedVehicle.status === 'pass' ? (
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 車輛名冊表格 */}
      <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
              名冊清單 ({filteredList.length} / {parkingList.length})
            </span>
          </div>

          <div className="flex rounded-xl p-1 border overflow-x-auto" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-hover)' }}>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-indigo-600 text-white' : ''}`}
              style={{ color: filterType === 'all' ? '#ffffff' : 'var(--text-muted)' }}
            >
              全部車輛
            </button>
            <button
              onClick={() => setFilterType('vip')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'vip' ? 'bg-indigo-600 text-white' : ''}`}
              style={{ color: filterType === 'vip' ? '#ffffff' : 'var(--text-muted)' }}
            >
              👑 VIP長官
            </button>
            <button
              onClick={() => setFilterType('regular')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'regular' ? 'bg-indigo-600 text-white' : ''}`}
              style={{ color: filterType === 'regular' ? '#ffffff' : 'var(--text-muted)' }}
            >
              常駐工程車
            </button>
            <button
              onClick={() => setFilterType('temp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'temp' ? 'bg-indigo-600 text-white' : ''}`}
              style={{ color: filterType === 'temp' ? '#ffffff' : 'var(--text-muted)' }}
            >
              貨車 / 運補
            </button>
          </div>
        </div>

        {/* 表格 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-hover)' }}>
                <th className="p-3 font-bold" style={{ color: 'var(--text)' }}>車牌號碼</th>
                <th className="p-3 font-bold" style={{ color: 'var(--text)' }}>姓名/人員</th>
                <th className="p-3 font-bold" style={{ color: 'var(--text)' }}>所屬公司</th>
                <th className="p-3 font-bold" style={{ color: 'var(--text)' }}>職稱/身分</th>
                <th className="p-3 font-bold" style={{ color: 'var(--text)' }}>備註</th>
                <th className="p-3 font-bold" style={{ color: 'var(--text)' }}>類別</th>
                <th className="p-3 font-bold text-center" style={{ color: 'var(--text)' }}>通行狀態</th>
                {isAdmin && (
                  <th className="p-3 font-bold text-right" style={{ color: 'var(--text)' }}>管理操作</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item) => (
                <tr key={item.id} className="border-b hover:bg-slate-800/10 transition-colors" style={{ borderColor: 'var(--card-border)' }}>
                  <td className="p-3 font-mono font-black text-sm tracking-wider" style={{ color: 'var(--text)' }}>
                    {item.plate}
                  </td>
                  <td className="p-3 font-semibold" style={{ color: 'var(--text)' }}>
                    {item.name}
                  </td>
                  <td className="p-3" style={{ color: 'var(--text-muted)' }}>
                    {item.unit}
                  </td>
                  <td className="p-3 font-semibold" style={{ color: 'var(--text)' }}>
                    {item.subItem || '-'}
                  </td>
                  <td className="p-3" style={{ color: 'var(--text-dim)' }}>
                    {item.notes || '-'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.type === 'vip' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : (item.type === 'temp' ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-500/20 text-slate-300')
                    }`}>
                      {item.type === 'vip' ? '👑 VIP長官' : (item.type === 'temp' ? '貨車運補' : '常駐固定')}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleStatus(item.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider transition-all ${
                        item.status === 'pass' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30' 
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      }`}
                      title={isAdmin ? "點擊切換通行狀態" : "需要管理員權限 (t1898)"}
                    >
                      {item.status === 'pass' ? '✔ 核准放行' : '✖ 暫停通行'}
                    </button>
                  </td>
                  {isAdmin && (
                    <td className="p-3 text-right">
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
                    <option value="regular">常駐工程車</option>
                    <option value="vip">👑 長官 / VIP</option>
                    <option value="temp">貨車運補 / 臨時車</option>
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
