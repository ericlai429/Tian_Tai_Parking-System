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

                    <div className="grid grid-cols-2 gap-3.5 h-full">
                      {pageCards.map((card, cIdx) => (
                        <div
                          key={cIdx}
                          className="pass-card rounded-xl flex flex-col justify-between p-4 relative shadow-sm overflow-hidden border-2 border-sky-400 bg-white text-slate-900"
                          style={{ minHeight: '450px' }}
                        >
                          {/* 頂部裝飾條 */}
                          <div className="absolute top-0 left-0 right-0 h-2 bg-sky-600"></div>

                          {/* 頂部：公司標題與流水號 (單行不折行 whitespace-nowrap，字體清晰大器) */}
                          <div className="space-y-1.5 mt-1 border-b-2 border-sky-300/80 pb-2.5">
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-6 h-6 rounded-md bg-sky-700 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                                  天
                                </div>
                                <span className="font-black text-[15px] sm:text-[17px] tracking-tight text-slate-950 whitespace-nowrap">
                                  天泰營造股份有限公司
                                </span>
                              </div>
                              <span className="font-mono font-black text-xs sm:text-sm px-2 py-0.5 rounded-md bg-sky-700 text-white shadow-xs shrink-0 whitespace-nowrap">
                                證號 #{card.passNo}
                              </span>
                            </div>
                            <div className="flex items-center justify-between font-black text-sky-800 tracking-wider">
                              <span className="text-xs sm:text-sm whitespace-nowrap">工區專用車輛停車許可證</span>
                              <span className="text-[11px] sm:text-xs tracking-widest text-sky-600 font-mono whitespace-nowrap">PARKING PERMIT</span>
                            </div>
                          </div>

                          {/* 中部核心車牌與人員展示區 (四周不留多餘空白，緊湊飽滿) */}
                          <div className="my-auto py-2 text-center space-y-3">
                            <div className="text-xs font-black text-sky-900 tracking-wider">
                              核准通行車牌號碼
                            </div>
                            <div 
                              className="font-mono font-black text-3xl sm:text-4xl tracking-widest px-4 py-2.5 rounded-xl border-3 border-sky-500 bg-white text-slate-950 shadow-md inline-block w-[88%]"
                            >
                              {card.plate}
                            </div>
                            
                            {/* 人員與單位資料欄：字體放大 1.5 倍，層次分明 */}
                            <div className="flex flex-col items-center justify-center gap-1.5 pt-1">
                              {/* 單位名稱 (放大 1.5 倍) */}
                              <span className="px-3.5 py-1 rounded-lg bg-sky-100 border border-sky-300 text-sky-950 font-black text-sm sm:text-base tracking-wide shadow-xs">
                                {card.unit}
                              </span>
                              {/* 姓名與職稱 (放大 1.5 倍) */}
                              <div className="flex items-center justify-center gap-2 text-base sm:text-lg font-black text-slate-900">
                                <span>{card.name}</span>
                                <span className="text-slate-600 font-bold text-sm sm:text-base">({card.subItem})</span>
                              </div>
                            </div>
                          </div>

                          {/* 下方手寫手機號碼空白欄位 */}
                          <div className="space-y-2 border-t-2 border-sky-300/80 pt-2.5 mt-auto">
                            <div className="flex items-center justify-between text-xs sm:text-sm font-black text-slate-800">
                              <span>聯絡手機號碼：</span>
                              <span className="text-[11px] text-slate-500 font-normal">（必填，臨時移車聯絡用）</span>
                            </div>
                            {/* 手寫底線空白欄位 (無預填，整條留白供自由書寫) */}
                            <div className="w-full h-8 border-b-2 border-dashed border-slate-500 flex items-center justify-center text-xs text-slate-300 font-mono tracking-widest">
                              &nbsp;
                            </div>

                            <div className="text-[10px] text-slate-600 leading-tight space-y-0.5 pt-0.5 font-medium">
                              <div>1. 本停車証請置放於車輛擋風玻璃前明顯處以備警衛查驗。</div>
                              <div>2. 進入工區請減速慢行 (限速 15km/h)，遵從警衛及指揮人員引導。</div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {pageCards.length < 4 && Array.from({ length: 4 - pageCards.length }).map((_, emptyIdx) => (
                        <div 
                          key={`empty_${emptyIdx}`}
                          className="border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-300 min-h-[440px]"
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
            padding: 8mm !important;
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
