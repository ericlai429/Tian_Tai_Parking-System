import React, { useState, useRef } from 'react';
import { Calendar, ClipboardList, Clock, ShieldCheck, CheckCircle2, AlertCircle, Download, MapPin, ZoomIn, Check } from 'lucide-react';

export default function ScheduleView({ scheduleData, setScheduleData }) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState(0); // 0: 標準, 1: 中, 2: 大 (放大三級)
  const longPressTimer = useRef(null);

  // 切換 3 級字體大小
  const toggleFontSize = () => {
    setFontSizeLevel((prev) => (prev + 1) % 3);
  };

  // 3 級字體樣式配置
  const fontSizes = [
    { text: 'text-[12px]', header: 'text-xs', sub: 'text-[11px]', badge: '標準' },
    { text: 'text-[14px]', header: 'text-sm', sub: 'text-[12px]', badge: '中' },
    { text: 'text-[16px]', header: 'text-base font-bold', sub: 'text-[13px]', badge: '大' }
  ];
  const currentFont = fontSizes[fontSizeLevel];

  // 週末例假日判斷 (2026/09/01 為星期二)
  const isWeekendDay = (d) => {
    const weekdayIndex = (d + 1) % 7;
    return weekdayIndex === 0 || weekdayIndex === 6; // 0=日, 6=六
  };

  const getWeekdayName = (d) => {
    return scheduleData.dayNames[(d + 1) % 7];
  };

  // 下載 Door_list 原尺寸照片
  const handleSaveDoorList = () => {
    const link = document.createElement('a');
    link.href = './door_list.jpg';
    link.download = '質子中心大門編號_Door_list.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  // 手機觸控長按偵測
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      handleSaveDoorList();
    }, 600); // 長按 600ms 觸發存檔
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 現場執勤表 (極簡純淨版，不強調矩陣，四周緊密適中，保證手機不遮擋) */}
      <div className="p-3 sm:p-4 rounded-xl border overflow-x-auto space-y-3" 
           style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        
        {/* 表格頂部簡潔標題列 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5"
             style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400 shrink-0" />
            <h2 className="text-base sm:text-lg font-black tracking-tight" style={{ color: 'var(--text)' }}>
              現場執勤表
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-300">
              115年9月份
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-400/30 border border-amber-400"></span> 週末例假日
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-500/20 text-rose-400 text-center font-bold leading-3">休</span> 排休
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-fuchsia-500/40 border border-fuchsia-400"></span> 9/11 代班
            </span>
          </div>
        </div>

        {/* 執勤明細表格 */}
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse min-w-[1020px] text-xs font-mono">
            <thead>
              {/* 日期列 1 ~ 30 */}
              <tr className="border-b" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-hover)' }}>
                <th className="p-2 text-center font-sans font-bold w-[72px] min-w-[72px] sticky left-0 z-20 whitespace-nowrap" style={{ backgroundColor: 'var(--card-hover)', color: 'var(--text)' }}>
                  班別
                </th>
                <th className="p-2 text-center font-sans font-bold w-[78px] min-w-[78px] sticky left-[72px] z-20 whitespace-nowrap" style={{ backgroundColor: 'var(--card-hover)', color: 'var(--text)' }}>
                  人員
                </th>
                {Array.from({ length: scheduleData.daysInMonth }, (_, i) => i + 1).map(d => {
                  const weekend = isWeekendDay(d);
                  return (
                    <th 
                      key={d} 
                      className={`p-1 font-bold ${weekend ? 'bg-amber-400/20 text-amber-300' : ''}`}
                      style={{ color: weekend ? '#fbbf24' : 'var(--text)' }}
                    >
                      {d}
                    </th>
                  );
                })}
              </tr>

              {/* 星期幾列 */}
              <tr className="border-b text-[11px]" style={{ borderColor: 'var(--card-border)' }}>
                <th className="p-1 sticky left-0 z-20 whitespace-nowrap" style={{ backgroundColor: 'var(--card-bg)' }}>-</th>
                <th className="p-1 sticky left-[72px] z-20 whitespace-nowrap" style={{ backgroundColor: 'var(--card-bg)' }}>-</th>
                {Array.from({ length: scheduleData.daysInMonth }, (_, i) => i + 1).map(d => {
                  const weekend = isWeekendDay(d);
                  return (
                    <th 
                      key={d} 
                      className={`p-1 font-sans font-bold ${weekend ? 'bg-amber-400/25 text-amber-400' : ''}`}
                      style={{ color: weekend ? '#f59e0b' : 'var(--text-muted)' }}
                    >
                      {getWeekdayName(d)}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {scheduleData.guards.map((guard) => (
                <tr key={guard.id} className="border-b hover:bg-slate-800/10 transition-colors" style={{ borderColor: 'var(--card-border)' }}>
                  {/* 班別 (寬度足夠且 whitespace-nowrap，保證 日班 / 日機 絕不換行) */}
                  <td className="p-2 font-sans font-bold text-center sticky left-0 z-20 whitespace-nowrap" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text)' }}>
                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-black tracking-wider whitespace-nowrap ${
                      guard.role === '日班' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-sky-500/20 text-sky-300'
                    }`}>
                      {guard.role}
                    </span>
                  </td>

                  {/* 人員姓名 */}
                  <td className="p-2 font-sans font-extrabold text-center sticky left-[72px] z-20 whitespace-nowrap text-xs" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text)' }}>
                    {guard.name}
                  </td>

                  {/* 每日班別格子 */}
                  {Array.from({ length: scheduleData.daysInMonth }, (_, i) => i + 1).map(d => {
                    const shift = guard.shifts[d] || '';
                    const isSpecialPink = guard.id === 'g3' && d === 11;
                    const weekend = isWeekendDay(d);

                    return (
                      <td 
                        key={d} 
                        className={`p-1 transition-all ${weekend ? 'bg-amber-400/5' : ''}`}
                      >
                        {shift === 'A' ? (
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded font-black text-xs ${
                            isSpecialPink 
                              ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/40 animate-pulse'
                              : 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                          }`}
                          title={isSpecialPink ? '9/11 賴宗興臨時代班賴鯤仲' : `${guard.name} 日班 A`}
                          >
                            A
                          </span>
                        ) : shift === '休' ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded font-bold text-xs bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            休
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. 保全人員辦理事項表 (精簡化但完整保留原意，直觀時段條列卡片) */}
      <div className="p-4 rounded-xl border space-y-3.5 shadow-md"
           style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        
        <div className="flex items-center justify-between border-b pb-2.5"
             style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-black tracking-tight" style={{ color: 'var(--text)' }}>
              保全人員辦理事項表
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {/* A-a 字體切換按鈕 (支援放大三級) */}
            <button
              onClick={toggleFontSize}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-bold border transition-all hover:scale-105 active:scale-95 shadow-sm"
              style={{
                backgroundColor: fontSizeLevel > 0 ? 'rgba(79, 70, 229, 0.2)' : 'var(--card-hover)',
                borderColor: fontSizeLevel > 0 ? 'var(--primary)' : 'var(--card-border)',
                color: fontSizeLevel > 0 ? '#818cf8' : 'var(--text)'
              }}
              title="點擊切換字體大小 (標準 / 中 / 大)"
            >
              <span className="font-serif font-black tracking-tighter">A-a</span>
              <span className="text-[10px] px-1 rounded bg-slate-800/50 border border-slate-700/50">
                {currentFont.badge}
              </span>
            </button>

            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              常規勤務
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {/* 07:00 上班開門 */}
          <div className="p-3 rounded-xl border space-y-1.5 transition-all"
               style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between">
              <span className={`font-mono font-black text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 ${currentFont.header}`}>
                07:00 上班開門
              </span>
              <span className={`text-amber-300 font-bold ${currentFont.sub}`}>2、5號門全天不開放</span>
            </div>
            <ul className={`space-y-1 pl-1 leading-relaxed ${currentFont.text}`} style={{ color: 'var(--text)' }}>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span>群組通報上班打卡。</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span><strong>1號大門</strong>：全開啟用（09:00 後關閉管制）。</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span><strong>3號小門</strong>：打開門栓（09:00 後拴上閉合）。</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span><strong>4號小門</strong>：打開門栓（18:00 後拴上閉合）。</span>
              </li>
            </ul>
          </div>

          {/* 08:00 ~ 17:00 日間管制與清運簽認 */}
          <div className="p-3 rounded-xl border space-y-1.5 transition-all"
               style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between">
              <span className={`font-mono font-black text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 ${currentFont.header}`}>
                08:00 ~ 17:00 日間勤務管制
              </span>
              <span className={`text-emerald-300 font-bold ${currentFont.sub}`}>工區出入把關</span>
            </div>
            <ul className={`space-y-1 pl-1 leading-relaxed ${currentFont.text}`} style={{ color: 'var(--text)' }}>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>1門人車登記</strong>：登記進出場人車，無線電呼叫工務所確認。</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>大門交管</strong>：引導進出場動線，協助沖洗出入車輛輪胎泥沙。</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>清運簽認</strong>：每週垃圾子車、流動廁所清運確實簽收確認。</span>
              </li>
            </ul>
          </div>

          {/* 18:00 巡檢關閉與下班通報 */}
          <div className="p-3 rounded-xl border space-y-1.5 transition-all"
               style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between">
              <span className={`font-mono font-black text-rose-400 px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 ${currentFont.header}`}>
                18:00 巡檢與下班通報
              </span>
              <span className={`text-rose-300 font-bold ${currentFont.sub}`}>巡檢鎖固</span>
            </div>
            <ul className={`space-y-1 pl-1 leading-relaxed ${currentFont.text}`} style={{ color: 'var(--text)' }}>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-400 font-bold">•</span>
                <span>確認工區內部已無人車後，<strong>1號大門上鎖</strong>。</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-400 font-bold">•</span>
                <span>巡檢 <strong>1~5 號門</strong>皆已全數妥善關閉。</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-400 font-bold">•</span>
                <span>巡查並確認<strong>男廁抽風扇</strong>已關閉電源。</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-400 font-bold">•</span>
                <span>全數確認無誤後，於<strong>工作群組通報完成下班</strong>。</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-1 text-[11px] text-center" style={{ color: 'var(--text-muted)' }}>
          ※ 本表各項工作配合現場施工進度隨時機動修正調整。
        </div>
      </div>

      {/* 質子中心大門編號全景圖 (Door_list 原尺寸照片網格) */}
      <div className="p-3 sm:p-4 rounded-xl border space-y-3"
           style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between border-b pb-2"
             style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-400 shrink-0" />
            <h2 className="text-base font-black tracking-tight" style={{ color: 'var(--text)' }}>
              質子中心大門編號配置圖 (Door List)
            </h2>
          </div>
          <button
            onClick={handleSaveDoorList}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-bold border transition-all active:scale-95"
            style={{
              backgroundColor: downloadSuccess ? 'rgba(16, 185, 129, 0.15)' : 'var(--card-hover)',
              borderColor: downloadSuccess ? '#10b981' : 'var(--card-border)',
              color: downloadSuccess ? '#10b981' : 'var(--text)'
            }}
            title="點擊下載原尺寸照片"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>已存檔！</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>存原圖</span>
              </>
            )}
          </button>
        </div>

        <div className="relative group cursor-pointer overflow-hidden rounded-lg border border-slate-700/40"
             onDoubleClick={handleSaveDoorList}
             onTouchStart={handleTouchStart}
             onTouchEnd={handleTouchEnd}
             onTouchCancel={handleTouchEnd}
             title="雙擊或手機長按可存下原尺寸照片"
        >
          <img 
            src="./door_list.jpg" 
            alt="質子中心大門編號 Door List" 
            className="w-full h-auto object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.01] select-none"
            loading="lazy"
          />
          {/* 操作提示小浮標 */}
          <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-slate-900/85 backdrop-blur-sm border border-slate-700/60 text-[11px] font-bold text-slate-200 flex items-center gap-1.5 shadow-lg pointer-events-none">
            <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
            <span>雙擊 / 手機長按 下載原圖</span>
          </div>
        </div>

        <div className="text-[11px] text-center" style={{ color: 'var(--text-muted)' }}>
          💡 提示：手機觸控<strong>長按照片</strong>或電腦上<strong>雙擊照片</strong>，即可一鍵下載儲存 Door_list 高解析原圖。
        </div>
      </div>
    </div>
  );
}
