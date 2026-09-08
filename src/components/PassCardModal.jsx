import React, { useState, useMemo, useRef } from 'react';
import { Printer, X, CreditCard, Search, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * 停車証 (PassCardModal)
 * 規格要求：
 * 1. 輸入管理者密碼可輸出並製作停車証
 * 2. 停車証號可單筆或連續輸入，如：001,005,008 或 001~006，或混用如 001~004, 008, 010~012
 * 3. 輸出符合規格之停卡單卡，以 A4 直式列印輸出 淺藍色風格自動排版
 * 4. 停車卡尺寸為 2 倍台灣最常見標準名片（90 × 54 mm）尺寸，即每張 A4 恰可排入 4 張停車卡 (2欄 × 2列)
 * 5. 車卡下方預留可以手寫手機號碼的空白欄位
 */
export default function PassCardModal({ isOpen, onClose, parkingList }) {
  const [rangeInput, setRangeInput] = useState('001~004');
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
        <div className="no-print p-4 sm:p-5 border-b flex items-center justify-between gap-3 bg-slate-900/60" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight" style={{ color: 'var(--text)' }}>
                天泰營造 工區專用停車証輸出
              </h2>
              <p className="text-xs text-slate-400">
                A4 直式列印每頁 4 張（名片 2 倍規格：約 90×108 mm）· 淺藍色風格 · 含手機手寫欄位
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={cardDataList.length === 0}
              className="px-4 py-2 rounded-xl text-xs font-black bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>輸出列印 / 存為 PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="no-print p-4 border-b space-y-2.5 bg-slate-950/40" style={{ borderColor: 'var(--card-border)' }}>
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
                placeholder="範例：001,005,008 或 001~006，或 001~004, 008"
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
              <button
                type="button"
                onClick={() => setRangeInput('001,005,008')}
                className="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold text-slate-300 border-slate-700 hover:bg-slate-800 cursor-pointer"
              >
                單筆範例
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2">
            <span>
              已解析 <strong className="text-sky-400 font-mono font-black">{cardDataList.length}</strong> 張停車卡
              （約佔用 <strong className="text-sky-300 font-mono">{Math.ceil(cardDataList.length / 4)}</strong> 頁 A4 直式紙張）
            </span>
            <span className="text-[11px] text-amber-400/90">
              💡 提示：在列印視窗中，目標印表機選擇「另存為 PDF」，版面請選「直向 (Portrait)」即可永久保存。
            </span>
          </div>
        </div>

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
                    className="a4-page-container bg-white text-slate-900 rounded-xl shadow-2xl p-6 relative border border-slate-300"
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
                          className="pass-card border-2 rounded-xl flex flex-col justify-between p-3.5 relative shadow-sm overflow-hidden"
                          style={{
                            borderColor: '#0284c7',
                            backgroundColor: '#f0f9ff',
                            minHeight: '440px'
                          }}
                        >
                          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500"></div>

                          <div className="space-y-1 mt-1 border-b border-sky-200 pb-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded bg-sky-600 text-white font-black text-[11px] flex items-center justify-center">
                                  天
                                </div>
                                <span className="font-black text-sm tracking-tight text-sky-950">
                                  天泰營造股份有限公司
                                </span>
                              </div>
                              <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-sky-600 text-white shadow-xs">
                                證號 #{card.passNo}
                              </span>
                            </div>
                            <div className="text-[11px] font-bold tracking-widest text-sky-700 uppercase flex items-center justify-between">
                              <span>工區專用車輛停車許可證</span>
                              <span className="text-[10px] text-sky-600">PARKING PERMIT</span>
                            </div>
                          </div>

                          <div className="my-auto py-3 text-center space-y-2">
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              核准通行車牌號碼
                            </div>
                            <div 
                              className="font-mono font-black text-3xl sm:text-4xl tracking-widest px-3 py-2 rounded-xl border-2 border-dashed border-sky-400 bg-white text-slate-900 shadow-inner inline-block min-w-[200px]"
                            >
                              {card.plate}
                            </div>
                            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700">
                              <span className="px-2 py-0.5 rounded bg-sky-100 border border-sky-300 text-sky-800">
                                {card.unit}
                              </span>
                              <span>{card.name}</span>
                              <span className="text-slate-500 font-normal">({card.subItem})</span>
                            </div>
                          </div>

                          <div className="space-y-2 border-t border-sky-200 pt-2.5 mt-auto">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                              <span>聯絡手機號碼：</span>
                              <span className="text-[10px] text-slate-400 font-normal">（必填，臨時移車聯絡用）</span>
                            </div>
                            <div className="w-full h-8 border-b-2 border-dashed border-slate-400 flex items-center justify-center text-xs text-slate-400 font-mono">
                              09___ - ______
                            </div>

                            <div className="text-[9px] text-slate-500 leading-tight space-y-0.5 pt-1">
                              <div>1. 本停車証請置放於車輛擋風玻璃前明顯處以備警衛查驗。</div>
                              <div>2. 進入工區請減速慢行 (限速 15km/h)，遵從警衛及指揮人員引導。</div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {pageCards.length < 4 && Array.from({ length: 4 - pageCards.length }).map((_, emptyIdx) => (
                        <div 
                          key={empty_}
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
            padding: 10mm !important;
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
