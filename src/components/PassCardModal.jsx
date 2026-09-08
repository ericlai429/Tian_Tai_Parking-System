import React, { useState, useMemo, useRef } from 'react';
import { Printer, X, CreditCard, Search, FileText, CheckCircle2, AlertCircle, LayoutTemplate } from 'lucide-react';

/**
 * 停車証 (PassCardModal)
 * 4 種版面風格切換：
 * 1. classic: 經典工程藍 (字體全面放大，填滿空間無多餘留白)
 * 2. boldBadge: 醒目大徽章風 (天泰營造大抬頭、加粗字體)
 * 3. modernGrid: 現代科技工區風 (深藍底色飾條、大字卡)
 * 4. compactMax: 極致滿版大字風 (車牌與人員最大化 1.5 倍)
 */
export default function PassCardModal({ isOpen, onClose, parkingList }) {
  const [rangeInput, setRangeInput] = useState('001~004');
  const [cardStyle, setCardStyle] = useState('classic'); // 'classic', 'boldBadge', 'modernGrid', 'compactMax'
  const printContainerRef = useRef(null);

  // 解析號碼輸入：支援逗號、空格、破折號(~ 或 -)
  const parsedPassNumbers = useMemo(() => {
    if (!rangeInput || !rangeInput.trim()) return [];
    const tokens = rangeInput.split(/[,，\s]+/).filter(Boolean);
    const resultNums = [];

    tokens.forEach(token => {
      const rangeMatch = token.match(/^([0-9]+)[~\-－—]([0-9]+)$/);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        if (!isNaN(start) && !isNaN(end) && start <= end && end - start <= 100) {
          for (let n = start; n <= end; n++) {
            resultNums.push(String(n).padStart(3, '0'));
          }
        }
      } else {
        const singleNum = parseInt(token, 10);
        if (!isNaN(singleNum)) {
          resultNums.push(String(singleNum).padStart(3, '0'));
        }
      }
    });

    return Array.from(new Set(resultNums));
  }, [rangeInput]);

  // 依據號碼從名冊比對卡片資料
  const cardDataList = useMemo(() => {
    return parsedPassNumbers.map(numStr => {
      const numInt = parseInt(numStr, 10);
      const found = parkingList.find(p => {
        const pNum = parseInt(p.passNo || '', 10);
        return pNum === numInt || p.passNo === numStr;
      });

      if (found) {
        return {
          passNo: numStr,
          plate: found.plate || '尚未綁定',
          name: found.name || '車主',
          unit: found.unit || '天泰營造',
          subItem: found.subItem || '工程人員',
          type: found.type || 'regular'
        };
      }

      return {
        passNo: numStr,
        plate: '（手寫填入）',
        name: '（手寫填入）',
        unit: '天泰營造',
        subItem: '臨時通行證',
        type: 'temp'
      };
    });
  }, [parsedPassNumbers, parkingList]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="w-full max-w-5xl rounded-2xl border shadow-2xl flex flex-col max-h-[96vh] overflow-hidden"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        {/* 頂部操作列 */}
        <div className="no-print p-3 sm:p-5 border-b flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/60" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-black tracking-tight truncate" style={{ color: 'var(--text)' }}>
                天泰營造 工區專用停車証輸出
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block">
                A4 直式每頁 4 張 · 提供 4 種版面風格切換 · 抬頭大字體 · 單位人員放大 1.5 倍
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <button
              onClick={handlePrint}
              disabled={cardDataList.length === 0}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>輸出列印</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="關閉視窗"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 控制設定區：輸入號碼 + 4種版本選擇器 */}
        <div className="no-print p-4 border-b space-y-3 bg-slate-950/40" style={{ borderColor: 'var(--card-border)' }}>
          {/* 號碼輸入列 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-bold shrink-0 flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
              <FileText className="w-4 h-4 text-sky-400" />
              <span>欲輸出的停車証號碼：</span>
            </label>
            <div className="relative flex-1">
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder="範例：001,005,008 或 001~006"
                className="w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-sky-500"
                style={{
                  backgroundColor: 'var(--card-hover)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text)'
                }}
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setRangeInput('001~004')}
                className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold text-sky-400 border-sky-500/30 hover:bg-sky-500/10 cursor-pointer"
              >
                001~004 (剛好1頁)
              </button>
              <button
                type="button"
                onClick={() => setRangeInput('001~008')}
                className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold text-sky-400 border-sky-500/30 hover:bg-sky-500/10 cursor-pointer"
              >
                001~008 (剛好2頁)
              </button>
            </div>
          </div>

          {/* 4種版面風格選擇切換按鈕 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 shrink-0">
              <LayoutTemplate className="w-4 h-4 text-sky-400" />
              <span>選擇卡片排版樣式（4種版本）：</span>
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCardStyle('classic')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  cardStyle === 'classic'
                    ? 'bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                版本 1：工程大字經典版 (推薦)
              </button>
              <button
                type="button"
                onClick={() => setCardStyle('boldBadge')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  cardStyle === 'boldBadge'
                    ? 'bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                版本 2：深藍頂標徽章版
              </button>
              <button
                type="button"
                onClick={() => setCardStyle('modernGrid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  cardStyle === 'modernGrid'
                    ? 'bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                版本 3：滿版高對比工程版
              </button>
              <button
                type="button"
                onClick={() => setCardStyle('compactMax')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  cardStyle === 'compactMax'
                    ? 'bg-sky-600 text-white border-sky-400 shadow-lg shadow-sky-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                版本 4：極致大字填滿版
              </button>
            </div>
          </div>
        </div>

        {/* 預覽與列印版面容器 */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-900/40 flex justify-center">
          <div ref={printContainerRef} className="print-area w-full max-w-[800px] space-y-8">
            {cardDataList.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-400 border border-dashed rounded-2xl">
                請輸入正確的停車証號碼（如 001~004 或 001,005,008）以產生卡片預覽。
              </div>
            ) : (
              Array.from({ length: Math.ceil(cardDataList.length / 4) }).map((_, pageIdx) => {
                const pageCards = cardDataList.slice(pageIdx * 4, (pageIdx + 1) * 4);
                return (
                  <div 
                    key={pageIdx} 
                    className="a4-page-container bg-white text-slate-900 rounded-xl shadow-2xl p-5 relative border border-slate-300"
                    style={{
                      width: '100%',
                      maxWidth: '740px',
                      minHeight: '980px',
                      boxSizing: 'border-box',
                      pageBreakAfter: 'always'
                    }}
                  >
                    <div className="no-print absolute top-2 right-3 text-[10px] font-bold text-slate-400">
                      A4 第 {pageIdx + 1} 頁 (共 {Math.ceil(cardDataList.length / 4)} 頁)
                    </div>

                    <div className="grid grid-cols-2 gap-4 h-full">
                      {pageCards.map((card, cIdx) => (
                        <div
                          key={cIdx}
                          className="relative flex items-center justify-center p-3.5 border border-dashed border-slate-300 rounded-2xl bg-slate-50/50"
                          style={{ minHeight: '450px' }}
                        >
                          {/* 上方橫式留白提示 */}
                          <div className="absolute top-1 left-0 right-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                              ✂ 裁切區，護背留白
                            </span>
                          </div>

                          {/* 下方橫式留白提示 */}
                          <div className="absolute bottom-1 left-0 right-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                              ✂ 裁切區，護背留白
                            </span>
                          </div>

                          {/* 左側直式留白提示 */}
                          <div className="absolute left-1 top-0 bottom-0 flex items-center justify-center pointer-events-none">
                            <span 
                              className="text-[10px] font-mono font-bold tracking-widest text-slate-400 bg-white/80 px-1 py-1 rounded border border-slate-200"
                              style={{ writingMode: 'vertical-rl' }}
                            >
                              ✂ 裁切區，護背留白
                            </span>
                          </div>

                          {/* 右側直式留白提示 */}
                          <div className="absolute right-1 top-0 bottom-0 flex items-center justify-center pointer-events-none">
                            <span 
                              className="text-[10px] font-mono font-bold tracking-widest text-slate-400 bg-white/80 px-1 py-1 rounded border border-slate-200"
                              style={{ writingMode: 'vertical-rl' }}
                            >
                              ✂ 裁切區，護背留白
                            </span>
                          </div>

                          {/* 核心實體停車証卡片：依據 cardStyle 呈現 4 種截然不同的排版與視覺結構 */}
                          
                          {/* ========================================================= */}
                          {/* 版本 1：工程大字經典版 (classic) - 經典天藍、平衡佈局 */}
                          {/* ========================================================= */}
                          {cardStyle === 'classic' && (
                            <div className="pass-card w-[86%] rounded-xl flex flex-col justify-between p-3.5 relative shadow-md overflow-hidden bg-white text-slate-900 border-2 border-sky-500" style={{ minHeight: '380px' }}>
                              <div className="absolute top-0 left-0 right-0 h-2 bg-sky-600"></div>
                              <div className="space-y-1 mt-0.5 border-b-2 border-sky-300/80 pb-2">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <div className="w-5 h-5 rounded-md bg-sky-700 text-white font-black text-[11px] flex items-center justify-center shadow-xs shrink-0">天</div>
                                    <span className="font-black text-[14px] tracking-tight text-slate-950 whitespace-nowrap">天泰營造股份有限公司</span>
                                  </div>
                                  <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-sky-700 text-white shadow-xs shrink-0 whitespace-nowrap">證號 #{card.passNo}</span>
                                </div>
                                <div className="flex items-center justify-between font-black text-sky-800 tracking-wider">
                                  <span className="text-[11px] whitespace-nowrap">工區專用車輛停車許可證</span>
                                  <span className="text-[10px] tracking-widest text-sky-600 font-mono whitespace-nowrap">PARKING PERMIT</span>
                                </div>
                              </div>
                              <div className="my-auto py-1.5 text-center space-y-2">
                                <div className="text-[11px] font-black text-sky-900 tracking-wider">核准通行車牌號碼</div>
                                <div className="font-mono font-black text-2xl sm:text-3xl tracking-widest px-3 py-1.5 rounded-xl border-2 border-sky-500 bg-sky-50/50 text-slate-950 shadow-sm inline-block w-[92%]">
                                  {card.plate}
                                </div>
                                <div className="flex flex-col items-center justify-center gap-1 pt-0.5">
                                  <span className="px-3 py-0.5 rounded-md bg-sky-100 border border-sky-300 text-sky-950 font-black text-xs sm:text-sm tracking-wide shadow-xs">
                                    {card.unit}
                                  </span>
                                  <div className="flex items-center justify-center gap-1.5 text-sm sm:text-base font-black text-slate-900">
                                    <span>{card.name}</span>
                                    <span className="text-slate-600 font-bold text-xs sm:text-sm">({card.subItem})</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1.5 border-t-2 border-sky-300/80 pt-2 mt-auto">
                                <div className="flex items-center justify-between text-xs font-black text-slate-800">
                                  <span>聯絡手機號碼：</span>
                                  <span className="text-[10px] text-slate-500 font-normal">（必填，臨時移車用）</span>
                                </div>
                                <div className="w-full h-7 border-b-2 border-dashed border-slate-500 flex items-center justify-center text-xs text-slate-300 font-mono tracking-widest">&nbsp;</div>
                                <div className="text-[9.5px] text-slate-600 leading-tight space-y-0.5 pt-0.5 font-medium">
                                  <div>1. 請置放於擋風玻璃前明顯處以備警衛查驗。</div>
                                  <div>2. 工區內請減速慢行 (限速 15km/h)，遵從引導。</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ========================================================= */}
                          {/* 版本 2：深藍頂標徽章版 (boldBadge) - 深藍滿版大頂標、金色徽章 */}
                          {/* ========================================================= */}
                          {cardStyle === 'boldBadge' && (
                            <div className="pass-card w-[86%] rounded-xl flex flex-col justify-between relative shadow-md overflow-hidden bg-white text-slate-900 border-3 border-indigo-900" style={{ minHeight: '380px' }}>
                              {/* 滿版深藍頂標 */}
                              <div className="bg-indigo-950 text-white p-3 space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-6 h-6 rounded-full bg-amber-400 text-indigo-950 font-black text-xs flex items-center justify-center shadow-md">天</span>
                                    <span className="font-black text-[15px] tracking-wide whitespace-nowrap">天泰營造股份有限公司</span>
                                  </div>
                                  <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-amber-400 text-indigo-950 shadow-md whitespace-nowrap">
                                    NO. {card.passNo}
                                  </span>
                                </div>
                                <div className="text-center font-bold text-[11px] text-indigo-200 tracking-widest border-t border-indigo-800 pt-1">
                                  ★ 工區專用通行證 (PARKING PASS) ★
                                </div>
                              </div>
                              {/* 中間大徽章區 */}
                              <div className="p-3 my-auto text-center space-y-2.5">
                                <div className="inline-block px-4 py-1.5 rounded-lg bg-indigo-50 border-2 border-indigo-200 text-indigo-950 font-black text-sm">
                                  {card.unit}
                                </div>
                                <div>
                                  <div className="font-mono font-black text-3xl sm:text-4xl tracking-widest text-indigo-950 bg-slate-100 py-2 rounded-xl border-2 border-dashed border-indigo-300">
                                    {card.plate}
                                  </div>
                                </div>
                                <div className="text-base font-black text-slate-900">
                                  {card.name} <span className="text-indigo-700 text-sm">【{card.subItem}】</span>
                                </div>
                              </div>
                              {/* 底部電話填寫 */}
                              <div className="p-3 bg-indigo-50/50 border-t-2 border-indigo-200 space-y-1.5 mt-auto">
                                <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                                  <span>駕駛聯絡手機：</span>
                                  <span className="text-[10px] text-indigo-600">（必填欄位）</span>
                                </div>
                                <div className="w-full h-7 border-b-2 border-indigo-400 bg-white rounded flex items-center justify-center font-mono text-xs text-slate-400">&nbsp;</div>
                                <div className="text-[9px] text-slate-500 text-center font-medium">天泰營造工地安全衛生組製發 · 限工區指定車位停放</div>
                              </div>
                            </div>
                          )}

                          {/* ========================================================= */}
                          {/* 版本 3：滿版高對比工程版 (modernGrid) - 醒目警示黑黃高對比 */}
                          {/* ========================================================= */}
                          {cardStyle === 'modernGrid' && (
                            <div className="pass-card w-[86%] rounded-xl flex flex-col justify-between relative shadow-md overflow-hidden bg-white text-slate-900 border-4 border-slate-900" style={{ minHeight: '380px' }}>
                              {/* 工程斑馬警示頂部 */}
                              <div className="h-3 w-full bg-repeating-linear-gradient" style={{
                                backgroundImage: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #0f172a 10px, #0f172a 20px)'
                              }}></div>
                              <div className="p-3 space-y-2">
                                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                                  <div>
                                    <div className="font-black text-xs text-amber-600 uppercase tracking-wider">TIAN TAI CONSTRUCTION</div>
                                    <div className="font-black text-[15px] text-slate-950 whitespace-nowrap">天泰營造股份有限公司</div>
                                  </div>
                                  <div className="text-right">
                                    <span className="bg-slate-900 text-amber-400 font-mono font-black text-sm px-2.5 py-1 rounded">
                                      #{card.passNo}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-center font-black text-xs bg-slate-100 py-1 rounded border border-slate-300">
                                  三軍總醫院新建工程 · 車輛准入許可證
                                </div>
                              </div>
                              {/* 核心黑框大車號 */}
                              <div className="px-3 my-auto text-center space-y-2">
                                <div className="bg-slate-950 text-amber-400 font-mono font-black text-3xl sm:text-4xl py-2.5 rounded-lg tracking-widest shadow-inner">
                                  {card.plate}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-left pt-1">
                                  <div className="bg-slate-100 p-2 rounded border border-slate-200">
                                    <div className="text-[10px] font-bold text-slate-500">所屬廠商/單位</div>
                                    <div className="font-black text-xs text-slate-900 truncate">{card.unit}</div>
                                  </div>
                                  <div className="bg-slate-100 p-2 rounded border border-slate-200">
                                    <div className="text-[10px] font-bold text-slate-500">人員 / 職稱</div>
                                    <div className="font-black text-xs text-slate-900 truncate">{card.name} ({card.subItem})</div>
                                  </div>
                                </div>
                              </div>
                              {/* 底部手機欄位 */}
                              <div className="p-3 bg-amber-500/10 border-t-2 border-slate-900 space-y-1 mt-auto">
                                <div className="flex items-center justify-between text-xs font-black text-slate-900">
                                  <span>緊急移車手機號碼：</span>
                                  <span className="text-[10px] text-amber-700 font-bold">請以油性筆工整填寫</span>
                                </div>
                                <div className="w-full h-7 border-2 border-dashed border-slate-600 bg-white rounded flex items-center justify-center font-mono text-xs">&nbsp;</div>
                              </div>
                            </div>
                          )}

                          {/* ========================================================= */}
                          {/* 版本 4：極致大字填滿版 (compactMax) - 車牌超巨大、醒目字體 */}
                          {/* ========================================================= */}
                          {cardStyle === 'compactMax' && (
                            <div className="pass-card w-[86%] rounded-xl flex flex-col justify-between p-3 relative shadow-md overflow-hidden bg-white text-slate-900 border-3 border-emerald-600" style={{ minHeight: '380px' }}>
                              <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-600"></div>
                              <div className="flex items-center justify-between border-b-2 border-emerald-500 pb-1.5 mt-0.5">
                                <span className="font-black text-base text-emerald-950 whitespace-nowrap">天泰營造</span>
                                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">工區停車証</span>
                                <span className="font-mono font-black text-base text-emerald-800">#{card.passNo}</span>
                              </div>
                              {/* 超特大車牌號碼 */}
                              <div className="my-auto py-2 text-center space-y-2">
                                <div className="text-[11px] font-bold text-slate-500 tracking-wider">PERMITTED VEHICLE</div>
                                <div className="font-mono font-black text-4xl sm:text-5xl tracking-widest text-emerald-950 bg-emerald-50 py-3 rounded-2xl border-3 border-emerald-600 shadow-md">
                                  {card.plate}
                                </div>
                                <div className="text-lg font-black text-slate-900 pt-1">
                                  {card.unit} · {card.name} <span className="text-sm font-bold text-emerald-700">({card.subItem})</span>
                                </div>
                              </div>
                              {/* 底部大字手機欄 */}
                              <div className="border-t-2 border-emerald-500 pt-2 space-y-1 mt-auto">
                                <div className="flex items-center justify-between text-xs font-black text-emerald-950">
                                  <span>移車手機：</span>
                                  <span className="text-[10px] text-slate-500">未留電話者禁止停放</span>
                                </div>
                                <div className="w-full h-8 border-2 border-emerald-300 rounded-lg bg-emerald-50/50 flex items-center justify-center font-mono text-xs">&nbsp;</div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {pageCards.length < 4 && Array.from({ length: 4 - pageCards.length }).map((_, emptyIdx) => (
                        <div 
                          key={`empty_${emptyIdx}`}
                          className="border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-xs text-slate-300 min-h-[450px]"
                        >
                          （A4 四等分空白卡位）
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .a4-page-container {
            width: 100% !important;
            max-width: 100% !important;
            height: 100vh !important;
            min-height: 100vh !important;
            margin: 0 !important;
            padding: 6mm !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          .pass-card {
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
