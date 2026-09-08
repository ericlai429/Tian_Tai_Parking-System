import React, { useState, useMemo } from 'react';
import { 
  Users, Car, Calendar, ShieldCheck, Clock, Search, 
  ArrowRight, CheckCircle2, AlertCircle, FileSpreadsheet, 
  Upload, Sparkles, Phone, MapPin, AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DashboardView({ 
  scheduleData, 
  parkingList, 
  setActiveTab, 
  onQuickPlateSearch,
  onImportParkingClick 
}) {
  const [quickPlate, setQuickPlate] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  // 當前模擬日期（以 9月8日 開工首日為預設示範，亦可切換選擇 1~30 日）
  const [currentDay, setCurrentDay] = useState(8);

  // 取得當日值班人員
  const todayRoster = useMemo(() => {
    const list = [];
    scheduleData.guards.forEach(g => {
      const shift = g.shifts[currentDay];
      if (shift && shift !== '休') {
        const special = g.specialNotes && g.specialNotes[currentDay];
        list.push({
          guard: g,
          shift,
          special
        });
      }
    });
    return list;
  }, [scheduleData, currentDay]);

  // 快速搜尋車牌
  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!quickPlate.trim()) return;
    const q = quickPlate.trim().toUpperCase();
    const found = parkingList.find(p => p.plate.toUpperCase() === q);
    if (found) {
      setSearchResult(found);
      if (found.status === 'pass') {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      }
    } else {
      setSearchResult({
        plate: q,
        status: 'not_found',
        name: '未註冊車輛',
        unit: '無授權紀錄',
        notes: '此車牌不在資料庫中，請警衛引導訪客登記或聯繫總包'
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 頂部歡迎與案場狀態橫幅 */}
      <div className="p-6 rounded-2xl border transition-all" style={{
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(14, 165, 233, 0.1) 100%)',
        borderColor: 'rgba(99, 102, 241, 0.25)'
      }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500 text-white tracking-wider">
                現場運行中
              </span>
              <span className="text-xs font-semibold text-indigo-400">
                案場：{scheduleData.projectTitle}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text)' }}>
              天泰三總營造勤務戰情中心
            </h1>
            <p className="text-sm mt-1 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
              <span>現場案場：天泰三總工務所</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">勤務主管：飛龍保全勤務指揮中心</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('schedule')}
              className="px-4 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>查看 115.9 班表</span>
            </button>
            <button
              onClick={() => setActiveTab('parking')}
              className="px-4 py-2.5 rounded-xl font-bold text-sm border hover:bg-slate-800/20 flex items-center gap-2 transition-all active:scale-95"
              style={{ borderColor: 'var(--card-border)', color: 'var(--text)' }}
            >
              <Car className="w-4 h-4 text-emerald-400" />
              <span>進入車管管制</span>
            </button>
          </div>
        </div>
      </div>

      {/* 核心數據統計卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>全月執勤總工時</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
              {scheduleData.totalTargetHours}
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>小時 (100% 覆蓋)</span>
          </div>
          <div className="mt-2 text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>自 9/8 起每日 12H 連續值勤無空班</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>執勤保全編制</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
              {scheduleData.guards.length}
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>位保全員</span>
          </div>
          <div className="mt-2 text-xs font-medium" style={{ color: 'var(--text-dim)' }}>
            賴鯤仲 (常駐日班) · 葉榮東/賴宗興 (日機)
          </div>
        </div>

        <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>停車清單總車輛</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
              {parkingList.length}
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>輛註冊中</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-indigo-400 flex items-center gap-1 cursor-pointer hover:underline" onClick={() => setActiveTab('parking')}>
            <span>{parkingList.length === 0 ? '尚未匯入車冊 (點此匯入)' : '點此檢視車牌白名單'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>資料庫同步機制</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-emerald-400">
              本地＋雲端
            </span>
          </div>
          <div className="mt-2 text-xs font-semibold text-purple-400 cursor-pointer hover:underline" onClick={() => setActiveTab('cloud')}>
            <span>支援 Excel 匯入與雲端試算表連線</span>
          </div>
        </div>
      </div>

      {/* 主面板區塊：左邊「今日執勤保全」＆ 右邊「車牌秒查核對站」 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左側：當日執勤狀態 */}
        <div className="lg:col-span-6 p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                現場今日執勤崗位
              </h2>
            </div>
            {/* 快速模擬日期選擇 */}
            <div className="flex items-center gap-2 text-xs">
              <span style={{ color: 'var(--text-muted)' }}>檢視 9 月日期：</span>
              <select 
                value={currentDay}
                onChange={(e) => setCurrentDay(Number(e.target.value))}
                className="px-2.5 py-1 rounded-lg border font-bold"
                style={{ 
                  backgroundColor: 'var(--card-hover)', 
                  borderColor: 'var(--card-border)',
                  color: 'var(--text)' 
                }}
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>
                    9/{d} ({scheduleData.dayNames[(d + 1) % 7]}) {d === 11 ? '★9/11代班' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
              <span>勤務時段：日班 07:00 ~ 19:00 (12H)</span>
              <span>應勤時數：{scheduleData.dailyTargetHours[currentDay] || 0} 小時</span>
            </div>

            {todayRoster.length > 0 ? (
              <div className="space-y-3">
                {todayRoster.map(({ guard, shift, special }, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border flex items-center justify-between" style={{
                    backgroundColor: special ? 'rgba(217, 70, 239, 0.08)' : 'var(--card-bg)',
                    borderColor: special ? '#d946ef' : 'var(--card-border)'
                  }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white"
                           style={{ backgroundColor: special ? '#d946ef' : '#4f46e5' }}>
                        {guard.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base" style={{ color: 'var(--text)' }}>
                            {guard.name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-300">
                            {guard.role}
                          </span>
                          {special && (
                            <span className="text-xs px-2 py-0.5 rounded font-black text-white bg-fuchsia-600 animate-pulse">
                              {typeof special === 'object' ? special.label : special}
                            </span>
                          )}
                        </div>
                        <div className="text-xs mt-0.5 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{guard.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        正在執勤中
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6" style={{ color: 'var(--text-muted)' }}>
                {currentDay <= 7 ? '9/1 ~ 9/7 全案場尚未進駐，應勤時數 0 小時。' : '今日無排定勤務人員。'}
              </div>
            )}
          </div>

          {/* 9/11 特別標註說明卡 */}
          {currentDay === 11 && (
            <div className="p-3.5 rounded-xl border border-fuchsia-500/40 bg-fuchsia-500/10 text-xs text-fuchsia-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">★ 特別校對標註 (9/11 桃紅色標記)：</span>
                此日原日班「賴鯤仲」排休，由日機「賴宗興」臨時代班 A 班（07:00~19:00），以確保現場 12 小時執勤無空班。
              </div>
            </div>
          )}
        </div>

        {/* 右側：車牌秒查核對站 */}
        <div className="lg:col-span-6 p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Car className="w-5 h-5 text-indigo-400" />
              <span>車牌進出快速核對站</span>
            </h2>
            <button 
              onClick={() => setActiveTab('parking')}
              className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>完整管制清冊</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleQuickSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={quickPlate}
                onChange={(e) => setQuickPlate(e.target.value)}
                placeholder="輸入車牌快速驗證 (例如 ABC-1234)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border font-mono font-bold tracking-widest text-base uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ 
                  backgroundColor: 'var(--card-hover)', 
                  borderColor: 'var(--card-border)',
                  color: 'var(--text)' 
                }}
              />
            </div>
            <button 
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95 transition-all"
            >
              檢驗
            </button>
          </form>

          {/* 搜尋結果卡 */}
          {searchResult && (
            <div className={`p-4 rounded-xl border transition-all ${
              searchResult.status === 'pass' 
                ? 'border-emerald-500/50 bg-emerald-500/10 glow-emerald' 
                : (searchResult.status === 'pending' ? 'border-amber-500/50 bg-amber-500/10' : 'border-rose-500/50 bg-rose-500/10 glow-rose')
            }`}>
              <div className="flex items-center justify-between">
                <div className="font-mono text-2xl font-black tracking-wider" style={{ color: 'var(--text)' }}>
                  {searchResult.plate}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  searchResult.status === 'pass'
                    ? 'bg-emerald-500 text-white'
                    : (searchResult.status === 'pending' ? 'bg-amber-500 text-slate-900' : 'bg-rose-500 text-white')
                }`}>
                  {searchResult.status === 'pass' ? '✔ 准予放行 PASS' : (searchResult.status === 'pending' ? '待核可 PENDING' : '✖ 查無紀錄 DENIED')}
                </span>
              </div>

              <div className="mt-2 text-sm space-y-1" style={{ color: 'var(--text-muted)' }}>
                <div className="flex items-center gap-2">
                  <span className="font-semibold" style={{ color: 'var(--text)' }}>車主/身分：</span>
                  <span>{searchResult.name} ({searchResult.unit})</span>
                </div>
                {searchResult.notes && (
                  <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                    備註：{searchResult.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {parkingList.length === 0 && (
            <div className="p-4 rounded-xl border border-dashed text-center space-y-2" style={{ borderColor: 'var(--card-border)' }}>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                車輛名冊目前為空（重要長官與工程車冊由您自行匯入）
              </div>
              <button
                onClick={() => setActiveTab('parking')}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all"
              >
                立即前往匯入 Excel 車冊
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
