import React, { useState } from 'react';
import { 
  Calendar, Download, Upload, Users, Clock, AlertTriangle, 
  CheckCircle2, FileSpreadsheet, Info, ChevronLeft, ChevronRight, 
  Shield, Printer, Sparkles 
} from 'lucide-react';
import { exportScheduleToExcel } from '../utils/excelHelper';

export default function ScheduleView({ scheduleData, setScheduleData, onOpenCloudSync }) {
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'cards' | 'calendar'
  const [selectedDay, setSelectedDay] = useState(8);
  const [showRegulations, setShowRegulations] = useState(true);

  // 週六、週日判斷 (2026/09/01 是星期二，因此 day + 1 模 7 為星期幾，0為日，6為六)
  const isWeekendDay = (d) => {
    const weekdayIndex = (d + 1) % 7;
    return weekdayIndex === 0 || weekdayIndex === 6; // 0=日, 6=六
  };

  const getWeekdayName = (d) => {
    return scheduleData.dayNames[(d + 1) % 7];
  };

  // 匯出 Excel
  const handleExport = () => {
    exportScheduleToExcel(scheduleData);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 標頭與功能列 */}
      <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-black bg-indigo-500 text-white">
                民國 {scheduleData.yearRoc} 年 {scheduleData.month} 月份 (2026/09)
              </span>
              <span className="text-xs font-bold text-slate-400">
                ■ {scheduleData.companyName} / □ {scheduleData.corpName}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight" style={{ color: 'var(--text)' }}>
              {scheduleData.projectTitle}
            </h1>
            <div className="text-xs mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1" style={{ color: 'var(--text-muted)' }}>
              <span>執勤單位：{scheduleData.companyName}</span>
              <span>聯絡電話：{scheduleData.phone}</span>
              <span>班次規格：<strong className="text-indigo-400">A 班 (日班 07:00~19:00 / 12H)</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 視圖切換 */}
            <div className="flex rounded-xl p-1 border" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-hover)' }}>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'matrix' ? 'bg-indigo-600 text-white shadow-sm' : ''
                }`}
                style={{ color: viewMode === 'matrix' ? '#ffffff' : 'var(--text-muted)' }}
              >
                全月排班矩陣
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'cards' ? 'bg-indigo-600 text-white shadow-sm' : ''
                }`}
                style={{ color: viewMode === 'cards' ? '#ffffff' : 'var(--text-muted)' }}
              >
                人員工時卡
              </button>
            </div>

            <button
              onClick={handleExport}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-hover)', color: 'var(--text)' }}
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>匯出 Excel</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-hover)', color: 'var(--text)' }}
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>列印班表</span>
            </button>
          </div>
        </div>
      </div>

      {/* 9/11 特別標註與總工時快報提示 */}
      <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
           style={{ backgroundColor: 'rgba(217, 70, 239, 0.08)', borderColor: 'rgba(217, 70, 239, 0.35)' }}>
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-white text-xs bg-fuchsia-600 shadow-md">
            ★
          </span>
          <div className="text-xs">
            <span className="font-extrabold text-fuchsia-400">9/11 特殊代班標記已對齊：</span>
            <span style={{ color: 'var(--text-muted)' }}>
              賴宗興於 9/11 以桃紅色標註代班賴鯤仲排休（12H），全月案場總應勤工時為 <strong>276 小時</strong>，無空班漏洞。
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="px-2.5 py-1 rounded font-bold bg-indigo-500/20 text-indigo-300">
            賴鯤仲 192H
          </span>
          <span className="px-2.5 py-1 rounded font-bold bg-sky-500/20 text-sky-300">
            葉榮東 60H
          </span>
          <span className="px-2.5 py-1 rounded font-bold bg-fuchsia-500/20 text-fuchsia-300">
            賴宗興 12H (代班)
          </span>
        </div>
      </div>

      {/* 視圖 1：全月排班矩陣表 (符合原圖片執勤表版型) */}
      {viewMode === 'matrix' && (
        <div className="p-6 rounded-2xl border overflow-x-auto space-y-4" 
             style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="text-sm font-bold flex items-center justify-between" style={{ color: 'var(--text)' }}>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>全月現場執勤矩陣表（1日～30日）</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400/30 border border-amber-400"></span> 週末例假日</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-fuchsia-500/40 border border-fuchsia-400"></span> 9/11 代班標記</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500/20 text-rose-400 text-center font-bold leading-3">休</span> 排休</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse min-w-[1050px] text-xs font-mono">
              <thead>
                {/* 日期列 1 ~ 30 */}
                <tr className="border-b" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-hover)' }}>
                  <th className="p-2 text-left font-sans font-bold w-16 sticky left-0 z-10" style={{ backgroundColor: 'var(--card-hover)', color: 'var(--text)' }}>
                    班別
                  </th>
                  <th className="p-2 text-left font-sans font-bold w-20 sticky left-16 z-10" style={{ backgroundColor: 'var(--card-hover)', color: 'var(--text)' }}>
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
                  <th className="p-2 font-sans font-bold w-16 text-indigo-400">應勤</th>
                  <th className="p-2 font-sans font-bold w-16 text-emerald-400">實勤</th>
                </tr>

                {/* 星期幾列 */}
                <tr className="border-b text-[11px]" style={{ borderColor: 'var(--card-border)' }}>
                  <th className="p-1 sticky left-0 z-10" style={{ backgroundColor: 'var(--card-bg)' }}>-</th>
                  <th className="p-1 sticky left-16 z-10" style={{ backgroundColor: 'var(--card-bg)' }}>-</th>
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
                  <th className="p-1">時數</th>
                  <th className="p-1">時數</th>
                </tr>
              </thead>

              <tbody>
                {scheduleData.guards.map((guard) => (
                  <tr key={guard.id} className="border-b hover:bg-slate-800/10 transition-colors" style={{ borderColor: 'var(--card-border)' }}>
                    {/* 班別 */}
                    <td className="p-2 font-sans font-bold text-left sticky left-0 z-10" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text)' }}>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        guard.role === '日班' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-sky-500/20 text-sky-300'
                      }`}>
                        {guard.role}
                      </span>
                    </td>

                    {/* 人員姓名 */}
                    <td className="p-2 font-sans font-extrabold text-left sticky left-16 z-10" style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text)' }}>
                      {guard.name}
                    </td>

                    {/* 每日班別格子 */}
                    {Array.from({ length: scheduleData.daysInMonth }, (_, i) => i + 1).map(d => {
                      const shift = guard.shifts[d] || '';
                      const special = guard.specialNotes && guard.specialNotes[d];
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
                            title={isSpecialPink ? '9/11 賴宗興臨時代班賴鯤仲 (A班 12H)' : `${guard.name} 日班 A (12H)`}
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

                    {/* 應勤 / 實勤 */}
                    <td className="p-2 font-black text-indigo-400 text-sm">{guard.targetHours}</td>
                    <td className="p-2 font-black text-emerald-400 text-sm">{guard.actualHours}</td>
                  </tr>
                ))}

                {/* 每日現場應勤時數統計行 */}
                <tr className="font-extrabold" style={{ backgroundColor: 'var(--card-hover)' }}>
                  <td colSpan={2} className="p-2.5 font-sans text-left sticky left-0 z-10" style={{ backgroundColor: 'var(--card-hover)', color: 'var(--text)' }}>
                    每日應勤時數
                  </td>
                  {Array.from({ length: scheduleData.daysInMonth }, (_, i) => i + 1).map(d => {
                    const hours = scheduleData.dailyTargetHours[d] || 0;
                    return (
                      <td key={d} className="p-1 text-xs" style={{ color: hours > 0 ? 'var(--text)' : 'var(--text-dim)' }}>
                        {hours}
                      </td>
                    );
                  })}
                  <td colSpan={2} className="p-2 text-indigo-400 font-black text-sm">
                    {scheduleData.totalTargetHours} H
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 視圖 2：人員工時與執勤卡片 */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scheduleData.guards.map((guard) => {
            const shiftDays = Object.keys(guard.shifts).filter(d => guard.shifts[d] === 'A');
            const offDays = Object.keys(guard.shifts).filter(d => guard.shifts[d] === '休');

            return (
              <div key={guard.id} className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg"
                         style={{ backgroundColor: guard.role === '日班' ? '#4f46e5' : '#0ea5e9' }}>
                      {guard.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                        {guard.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-300">
                        {guard.role} ({guard.type === 'regular' ? '固定正班' : '機動支援'})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-indigo-400">
                      {guard.actualHours}
                    </div>
                    <div className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-muted)' }}>
                      實勤工時 (H)
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border text-xs space-y-1.5" style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)' }}>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>出勤天數：</span>
                    <strong style={{ color: 'var(--text)' }}>{shiftDays.length} 天 ({shiftDays.length * 12} 小時)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>排休天數：</span>
                    <span className="text-rose-400 font-bold">{offDays.length} 天</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>聯絡電話：</span>
                    <span className="font-mono" style={{ color: 'var(--text)' }}>{guard.phone}</span>
                  </div>
                </div>

                {/* 出勤日期標籤 */}
                <div>
                  <div className="text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>執勤日期分佈：</div>
                  <div className="flex flex-wrap gap-1">
                    {shiftDays.map(d => (
                      <span key={d} className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        guard.id === 'g3' && d === '11' 
                          ? 'bg-fuchsia-600 text-white animate-pulse' 
                          : 'bg-indigo-500/20 text-indigo-300'
                      }`}>
                        9/{d} {guard.id === 'g3' && d === '11' ? '(★代班)' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 注意事項摺疊區塊 */}
      <div className="p-6 rounded-2xl border space-y-3" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
        <button 
          onClick={() => setShowRegulations(!showRegulations)}
          className="w-full flex items-center justify-between text-left font-bold"
          style={{ color: 'var(--text)' }}
        >
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>現場執勤表注意事項與勤務守則 (共 5 條)</span>
          </span>
          <span className="text-xs text-indigo-400">{showRegulations ? '收合' : '展開'}</span>
        </button>

        {showRegulations && (
          <div className="pt-2 border-t space-y-2 text-xs leading-relaxed" style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}>
            {scheduleData.regulations.map((reg, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="font-bold text-indigo-400 shrink-0">{idx + 1}.</span>
                <span>{reg}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
