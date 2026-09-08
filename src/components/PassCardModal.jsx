import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Printer, X, CreditCard, FileText, CheckCircle2, 
  LayoutTemplate, Download, Loader2, Smartphone, 
  ZoomIn, ZoomOut, AlertCircle, Info 
} from 'lucide-react';

/**
 * 單張停車卡元件 (包含裁切留白導引、外內雙虛線框、以及 4 種風格)
 */
function ParkingCardUnit({ card, cardStyle, className = '' }) {
  if (!card) {
    return (
      <div className={`border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 min-h-[440px] bg-slate-50/50 ${className}`}>
        （A4 四等分空白卡位）
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center p-3 border-2 border-dashed border-slate-300 rounded-md bg-slate-50/50 w-full min-h-[440px] ${className}`}>
      {/* 上方橫式留白提示 */}
      <div className="absolute top-1 left-0 right-0 flex items-center justify-center pointer-events-none z-20">
        <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 bg-white/95 px-2 py-0.5 rounded-sm border border-slate-300 shadow-xs">
          ✂ 裁切區，護背留白
        </span>
      </div>

      {/* 下方橫式留白提示 */}
      <div className="absolute bottom-1 left-0 right-0 flex items-center justify-center pointer-events-none z-20">
        <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 bg-white/95 px-2 py-0.5 rounded-sm border border-slate-300 shadow-xs">
          ✂ 裁切區，護背留白
        </span>
      </div>

      {/* 左側直式留白提示 */}
      <div className="absolute left-1 top-0 bottom-0 flex items-center justify-center pointer-events-none z-20">
        <span 
          className="text-[10px] font-mono font-bold tracking-widest text-slate-500 bg-white/95 px-1 py-1.5 rounded-sm border border-slate-300 shadow-xs"
          style={{ writingMode: 'vertical-rl' }}
        >
          ✂ 裁切區，護背留白
        </span>
      </div>

      {/* 右側直式留白提示 */}
      <div className="absolute right-1 top-0 bottom-0 flex items-center justify-center pointer-events-none z-20">
        <span 
          className="text-[10px] font-mono font-bold tracking-widest text-slate-500 bg-white/95 px-1 py-1.5 rounded-sm border border-slate-300 shadow-xs"
          style={{ writingMode: 'vertical-rl' }}
        >
          ✂ 裁切區，護背留白
        </span>
      </div>

      {/* 緊貼停車卡的加粗內圈輔助虛線框 */}
      <div className="relative p-1.5 border-2 border-dashed border-slate-600 rounded-md z-10 flex items-center justify-center w-[90%] bg-transparent">
        {/* ========================================================= */}
        {/* 版本 1：工程大字經典版 (classic) */}
        {/* ========================================================= */}
        {cardStyle === 'classic' && (
          <div className="pass-card w-full rounded-md flex flex-col justify-between p-3.5 relative shadow-md overflow-hidden bg-white text-slate-900 border-2 border-sky-500 z-10" style={{ minHeight: '380px' }}>
            <div className="absolute top-0 left-0 right-0 h-2 bg-sky-600"></div>
            <div className="space-y-1 mt-0.5 border-b-2 border-sky-300/80 pb-2">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-5 h-5 rounded-sm bg-sky-700 text-white font-black text-[11px] flex items-center justify-center shadow-xs shrink-0">天</div>
                  <span className="font-black text-[14px] tracking-tight text-slate-950 whitespace-nowrap">天泰營造股份有限公司</span>
                </div>
                <span className="font-mono font-black text-xs px-2 py-0.5 rounded-sm bg-sky-700 text-white shadow-xs shrink-0 whitespace-nowrap">證號 #{card.passNo}</span>
              </div>
              <div className="flex items-center justify-between font-black text-sky-800 tracking-wider">
                <span className="text-[11px] whitespace-nowrap">工區專用車輛停車許可證</span>
                <span className="text-[10px] tracking-widest text-sky-600 font-mono whitespace-nowrap">PARKING PERMIT</span>
              </div>
            </div>
            <div className="my-auto py-1.5 text-center space-y-2">
              <div className="text-[11px] font-black text-sky-900 tracking-wider">核准通行車牌號碼</div>
              <div className="font-mono font-black text-2xl sm:text-3xl tracking-widest px-3 py-1.5 rounded-md border-2 border-sky-500 bg-sky-50/50 text-slate-950 shadow-sm inline-block w-[92%] whitespace-nowrap">
                {card.plate}
              </div>
              <div className="flex flex-col items-center justify-center gap-1 pt-0.5 px-1">
                <span className="px-3 py-0.5 rounded-sm bg-sky-100 border border-sky-300 text-sky-950 font-black text-xs sm:text-sm tracking-wide shadow-xs">
                  {card.unit}
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1 text-center max-w-full">
                  <span className={`font-black text-slate-900 ${
                    (card.name || '').length > 7 ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                  }`}>
                    {card.name}
                  </span>
                  {card.subItem && (
                    <span className="text-slate-600 font-bold text-xs sm:text-sm whitespace-nowrap">
                      ({card.subItem})
                    </span>
                  )}
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
        {/* 版本 2：深藍頂標徽章版 (boldBadge) */}
        {/* ========================================================= */}
        {cardStyle === 'boldBadge' && (
          <div className="pass-card w-full rounded-md flex flex-col justify-between relative shadow-md overflow-hidden bg-white text-slate-900 border-3 border-indigo-900 z-10" style={{ minHeight: '380px' }}>
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
            <div className="p-3 my-auto text-center space-y-2.5">
              <div className="inline-block px-4 py-1.5 rounded-sm bg-indigo-50 border-2 border-indigo-200 text-indigo-950 font-black text-sm whitespace-nowrap">
                {card.unit}
              </div>
              <div>
                <div className="font-mono font-black text-2xl sm:text-3xl tracking-widest text-indigo-950 bg-slate-100 py-2 px-2 rounded-md border-2 border-dashed border-indigo-300 whitespace-nowrap inline-block max-w-full">
                  {card.plate}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1 text-center px-1 max-w-full">
                <span className={`font-black text-slate-900 ${
                  (card.name || '').length > 7 ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
                }`}>
                  {card.name}
                </span>
                {card.subItem && (
                  <span className="text-indigo-700 text-xs sm:text-sm font-bold whitespace-nowrap">
                    【{card.subItem}】
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 bg-indigo-50/50 border-t-2 border-indigo-200 space-y-1.5 mt-auto">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                <span>駕駛聯絡手機：</span>
                <span className="text-[10px] text-indigo-600">（必填欄位）</span>
              </div>
              <div className="w-full h-7 border-b-2 border-indigo-400 bg-white rounded-sm flex items-center justify-center font-mono text-xs text-slate-400">&nbsp;</div>
              <div className="text-[9px] text-slate-500 text-center font-medium">天泰營造工地安全衛生組製發 · 限工區指定車位停放</div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 版本 3：滿版高對比工程版 (modernGrid - 解決李健宏/總工程師裁切問題) */}
        {/* ========================================================= */}
        {cardStyle === 'modernGrid' && (
          <div className="pass-card w-full rounded-md flex flex-col justify-between relative shadow-md overflow-hidden bg-white text-slate-900 border-4 border-slate-900 z-10" style={{ minHeight: '380px' }}>
            <div className="h-3 w-full bg-amber-500" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #0f172a 10px, #0f172a 20px)'
            }}></div>
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                <div>
                  <div className="font-black text-xs text-amber-600 uppercase tracking-wider">TIAN TAI CONSTRUCTION</div>
                  <div className="font-black text-[15px] text-slate-950 whitespace-nowrap">天泰營造股份有限公司</div>
                </div>
                <div className="text-right">
                  <span className="bg-slate-900 text-amber-400 font-mono font-black text-sm px-2.5 py-1 rounded-sm whitespace-nowrap">
                    #{card.passNo}
                  </span>
                </div>
              </div>
              <div className="text-center font-black text-xs bg-slate-100 py-1 rounded-sm border border-slate-300 whitespace-nowrap">
                三軍總醫院新建工程 · 車輛准入許可證
              </div>
            </div>
            <div className="px-3 my-auto text-center space-y-2">
              <div className="bg-slate-950 text-amber-400 font-mono font-black text-2xl sm:text-3xl py-2 px-2 rounded-md tracking-widest shadow-inner whitespace-nowrap inline-block max-w-full">
                {card.plate}
              </div>
              <div className="grid grid-cols-2 gap-2 text-left pt-1">
                <div className="bg-slate-100 p-2 rounded-sm border border-slate-200 flex flex-col justify-center">
                  <div className="text-[10px] font-bold text-slate-500">所屬廠商/單位</div>
                  <div className="font-black text-xs text-slate-900 break-words leading-tight mt-0.5">
                    {card.unit}
                  </div>
                </div>
                <div className="bg-slate-100 p-2 rounded-sm border border-slate-200 flex flex-col justify-center">
                  <div className="text-[10px] font-bold text-slate-500">人員 / 職稱</div>
                  <div className="font-black text-xs text-slate-900 break-words leading-tight mt-0.5">
                    <div>{card.name}</div>
                    {card.subItem && (
                      <div className="text-[10.5px] font-bold text-amber-700">({card.subItem})</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-amber-500/10 border-t-2 border-slate-900 space-y-1 mt-auto">
              <div className="flex items-center justify-between text-xs font-black text-slate-900">
                <span>緊急移車手機號碼：</span>
                <span className="text-[10px] text-amber-700 font-bold">請以油性筆工整填寫</span>
              </div>
              <div className="w-full h-7 border-2 border-dashed border-slate-600 bg-white rounded-sm flex items-center justify-center font-mono text-xs">&nbsp;</div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 版本 4：極致大字填滿版 (compactMax - 智能換行縮放，絕不炸框) */}
        {/* ========================================================= */}
        {cardStyle === 'compactMax' && (
          <div className="pass-card w-full rounded-md flex flex-col justify-between p-3 relative shadow-md overflow-hidden bg-white text-slate-900 border-3 border-emerald-600 z-10" style={{ minHeight: '380px' }}>
            <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-600"></div>
            <div className="flex items-center justify-between border-b-2 border-emerald-500 pb-1.5 mt-0.5">
              <span className="font-black text-base text-emerald-950 whitespace-nowrap">天泰營造</span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-sm whitespace-nowrap">工區停車証</span>
              <span className="font-mono font-black text-base text-emerald-800 whitespace-nowrap">#{card.passNo}</span>
            </div>
            <div className="my-auto py-2 text-center space-y-2">
              <div className="text-[11px] font-bold text-slate-500 tracking-wider whitespace-nowrap">PERMITTED VEHICLE</div>
              <div className="font-mono font-black text-2xl sm:text-3xl tracking-widest text-emerald-950 bg-emerald-50 py-2.5 px-2 rounded-md border-3 border-emerald-600 shadow-md whitespace-nowrap inline-block max-w-full">
                {card.plate}
              </div>
              {/* 單位與人員職稱：分層智能換行與彈性自適應，徹底杜絕炸框 */}
              <div className="flex flex-col items-center justify-center gap-1.5 pt-1 px-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 font-black text-xs tracking-wide">
                  {card.unit}
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1 text-center max-w-full">
                  <span className={`font-black text-slate-950 tracking-tight leading-snug ${
                    (card.name || '').length > 7 ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
                  }`}>
                    {card.name}
                  </span>
                  {card.subItem && (
                    <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ({card.subItem})
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="border-t-2 border-emerald-500 pt-2 space-y-1 mt-auto">
              <div className="flex items-center justify-between text-xs font-black text-emerald-950">
                <span>移車手機：</span>
                <span className="text-[10px] text-slate-500">未留電話者禁止停放</span>
              </div>
              <div className="w-full h-8 border-2 border-emerald-300 rounded-sm bg-emerald-50/50 flex items-center justify-center font-mono text-xs">&nbsp;</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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

  // 雙預覽模式：'card' (手機單卡清晰大字) 或 'sheet' (A4 整頁 2x2 列印排版)
  const [previewMode, setPreviewMode] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 640 ? 'card' : 'sheet';
  });

  // A4 排版預覽縮放控制 (避免手機版跑版)
  const [isZoomFit, setIsZoomFit] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);

  // PDF 生成狀態
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState('');

  const printContainerRef = useRef(null);
  const previewScrollRef = useRef(null);

  // 動態偵測容器寬度以計算 A4 縮放比例
  useEffect(() => {
    const measureWidth = () => {
      if (previewScrollRef.current) {
        setContainerWidth(previewScrollRef.current.clientWidth);
      } else if (typeof window !== 'undefined') {
        setContainerWidth(window.innerWidth);
      }
    };

    measureWidth();
    window.addEventListener('resize', measureWidth);
    return () => window.removeEventListener('resize', measureWidth);
  }, [isOpen, previewMode]);

  // A4 整頁基準寬度 740px，計算等比縮放係數
  const a4BaseWidth = 740;
  const a4BaseHeight = 1046;
  const currentScale = useMemo(() => {
    if (!isZoomFit || containerWidth <= 0) return 1;
    const padding = 28; // 預留邊距
    const available = containerWidth - padding;
    if (available >= a4BaseWidth) return 1;
    return Math.max(0.32, available / a4BaseWidth);
  }, [isZoomFit, containerWidth]);

  // 純前端高畫質 PDF 下載輸出 (jspdf + html2canvas)
  const handleDownloadPdf = async () => {
    if (cardDataList.length === 0 || isGeneratingPdf) return;

    const previousMode = previewMode;
    try {
      setIsGeneratingPdf(true);
      setPdfProgress('準備匯出高解析度 A4 PDF 排版...');
      setPdfSuccessMessage('');

      // 切換至整頁模式以確保 A4 頁面節點完全載入於 DOM 中
      if (previewMode !== 'sheet') {
        setPreviewMode('sheet');
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      // 等待 DOM 穩定
      await new Promise(resolve => setTimeout(resolve, 100));

      setPdfProgress('載入 PDF 繪製引擎...');
      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);

      const pageElements = document.querySelectorAll('.a4-page-container');
      if (!pageElements || pageElements.length === 0) {
        throw new Error('找不到可輸出的 A4 排版內容，請稍候重試');
      }

      const totalPages = pageElements.length;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      for (let i = 0; i < totalPages; i++) {
        setPdfProgress(`正在渲染第 ${i + 1} / ${totalPages} 頁 (高畫質 2x)...`);
        const pageEl = pageElements[i];

        // 高清晰度 canvas 採樣 (scale: 2)
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
            // 在被克隆的虛擬 DOM 中去除 transform 縮放，確保以原始 740px 滿版畫質渲染
            const clonedPages = clonedDoc.querySelectorAll('.a4-page-container');
            clonedPages.forEach(p => {
              p.style.transform = 'none';
              p.style.margin = '0 auto';
              p.style.boxShadow = 'none';
              p.style.borderRadius = '0';
              p.style.border = 'none';
            });
          }
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) {
          pdf.addPage('a4', 'p');
        }
        // A4 直式尺寸 210mm x 297mm
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }

      setPdfProgress('正在封裝 PDF 檔案並啟動下載...');
      const cleanRange = (rangeInput || '001-004').replace(/[^0-9a-zA-Z~_-]/g, '');
      const filename = `天泰營造_工區停車證_${cleanRange}.pdf`;

      // 產生 Blob 觸發安全下載（兼顧 Android/iOS 與各類瀏覽器）
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 1500);

      setPdfSuccessMessage(`✅ 已成功生成並下載：${filename}！LINE 無法存檔？點右上「…」➔「在瀏覽器中開啟」`);
      setTimeout(() => {
        setPdfSuccessMessage('');
      }, 10000);

      // 若原先為單卡模式，完成後還原模式
      if (previousMode === 'card') {
        setPreviewMode('card');
      }

    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF 生成過程發生異常：' + (err.message || err) + '\n建議切換至「A4 整頁排版」或直接點選「輸出列印」。');
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  // 瀏覽器列印
  const handlePrint = () => {
    if (cardDataList.length === 0) return;
    try {
      window.print();
    } catch (e) {
      alert('您的裝置無法直接啟動列印對話框，請改用「下載 PDF 檔案」按鈕！');
    }
  };

  if (!isOpen) return null;

  const totalA4Pages = Math.ceil(cardDataList.length / 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="w-full max-w-5xl rounded-2xl border shadow-2xl flex flex-col max-h-[96vh] overflow-hidden"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        {/* 頂部操作列 */}
        <div className="no-print p-3 sm:p-4 border-b flex items-center justify-between gap-2 bg-slate-900/70" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-base font-black tracking-tight flex flex-wrap items-center gap-1.5" style={{ color: 'var(--text)' }}>
                <span>天泰營造 停車証輸出</span>
                <span className="text-[10.5px] sm:text-xs font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  (使用電腦觀看以達最佳效果)
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                A4 直式每頁 4 張 · 雙模式預覽 · 純前端 PDF 高畫質匯出
              </p>
            </div>
          </div>

          {/* 動作按鈕群：下載 PDF (主要) + 輸出列印 (輔助) + 關閉 */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {/* 下載 PDF 檔案按鈕 */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={cardDataList.length === 0 || isGeneratingPdf}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              title="將停車證輸出為標準高畫質 A4 PDF 檔案下載"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPdf ? '處理中...' : '下載 PDF'}</span>
            </button>

            {/* 傳統列印按鈕 */}
            <button
              type="button"
              onClick={handlePrint}
              disabled={cardDataList.length === 0 || isGeneratingPdf}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 cursor-pointer whitespace-nowrap"
              title="喚起瀏覽器系統列印"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">列印</span>
            </button>

            {/* 關閉按鈕 */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="關閉視窗"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 成功下載通知提示橫幅 */}
        {pdfSuccessMessage && (
          <div className="no-print mx-3 sm:mx-4 mt-2 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="flex-1 leading-relaxed">{pdfSuccessMessage}</span>
            <button type="button" onClick={() => setPdfSuccessMessage('')} className="text-emerald-400 hover:text-white text-sm">✕</button>
          </div>
        )}

        {/* 控制設定區：號碼輸入 + 4 種版面風格切換 */}
        <div className="no-print p-3 sm:p-4 border-b space-y-3 bg-slate-950/50" style={{ borderColor: 'var(--card-border)' }}>
          {/* 號碼輸入列 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <label className="text-xs font-bold shrink-0 flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
              <FileText className="w-4 h-4 text-sky-400" />
              <span>欲輸出的卡片號碼：</span>
            </label>
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder="範例：001,005,008 或 001~004"
                className="w-full px-3 py-1.5 sm:py-2 rounded-xl border text-xs sm:text-sm font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                className="px-2.5 py-1 rounded-lg border text-[11px] font-bold text-sky-400 border-sky-500/30 hover:bg-sky-500/10 cursor-pointer"
              >
                001~004 (1頁4卡)
              </button>
              <button
                type="button"
                onClick={() => setRangeInput('001~008')}
                className="px-2.5 py-1 rounded-lg border text-[11px] font-bold text-sky-400 border-sky-500/30 hover:bg-sky-500/10 cursor-pointer"
              >
                001~008 (2頁8卡)
              </button>
            </div>
          </div>

          {/* 4種版面風格選擇 (手機版 2x2 緊湊自適應) */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            <div className="text-[11px] sm:text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <LayoutTemplate className="w-3.5 h-3.5 text-sky-400" />
              <span>選擇卡片排版樣式（4種版本）：</span>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setCardStyle('classic')}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-all text-center cursor-pointer ${
                  cardStyle === 'classic'
                    ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                1. 工程大字經典版 ⭐
              </button>
              <button
                type="button"
                onClick={() => setCardStyle('boldBadge')}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-all text-center cursor-pointer ${
                  cardStyle === 'boldBadge'
                    ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                2. 深藍頂標徽章版
              </button>
              <button
                type="button"
                onClick={() => setCardStyle('modernGrid')}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-all text-center cursor-pointer ${
                  cardStyle === 'modernGrid'
                    ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                3. 高對比工程版
              </button>
              <button
                type="button"
                onClick={() => setCardStyle('compactMax')}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-all text-center cursor-pointer ${
                  cardStyle === 'compactMax'
                    ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                4. 極致大字填滿版
              </button>
            </div>
          </div>
        </div>

        {/* 雙預覽切換工具列 */}
        <div className="no-print px-3 py-2 border-b bg-slate-900/80 flex items-center justify-between gap-2" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setPreviewMode('card')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                previewMode === 'card'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>單卡大字預覽</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('sheet')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                previewMode === 'sheet'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>A4 整頁排版</span>
            </button>
          </div>

          {/* 整頁模式時提供縮放切換按鈕 */}
          {previewMode === 'sheet' && currentScale < 1 && (
            <button
              type="button"
              onClick={() => setIsZoomFit(!isZoomFit)}
              className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 px-2.5 py-1 rounded-lg border border-sky-500/30 bg-sky-500/10 cursor-pointer"
            >
              {isZoomFit ? <ZoomIn className="w-3.5 h-3.5" /> : <ZoomOut className="w-3.5 h-3.5" />}
              <span>{isZoomFit ? '100% 原寸' : '適應螢幕'}</span>
            </button>
          )}

          {previewMode === 'card' && (
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              已排入 {cardDataList.length} 張卡片
            </span>
          )}
        </div>

        {/* 預覽與列印版面容器 */}
        <div 
          ref={previewScrollRef} 
          className="flex-1 p-3 sm:p-6 overflow-y-auto bg-slate-900/50 flex justify-center relative"
        >
          {cardDataList.length === 0 ? (
            <div className="p-12 text-center text-xs sm:text-sm text-slate-400 border border-dashed rounded-2xl w-full max-w-md my-auto">
              請輸入正確的停車証號碼（如 001~004 或 001,005）以產生卡片預覽。
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              {/* ========================================================= */}
              {/* 模式 1：📱 單卡清晰大字預覽 (完美適應手機螢幕，絕不跑版) */}
              {/* ========================================================= */}
              {previewMode === 'card' && (
                <div className="w-full max-w-sm space-y-6 pb-6">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] leading-relaxed text-center flex items-center justify-center gap-1.5">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>手機單卡大字模式：已自動適配寬度，文字與車號清晰不溢出。</span>
                  </div>

                  {cardDataList.map((card, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs px-1 text-slate-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 font-black text-[11px] flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span>證號 #{card.passNo}</span>
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">{card.unit} · {card.name}</span>
                      </div>

                      <div className="bg-white rounded-xl shadow-xl p-2 border border-slate-300">
                        <ParkingCardUnit card={card} cardStyle={cardStyle} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ========================================================= */}
              {/* 模式 2：📄 A4 整頁 2x2 排版預覽 (等比縮放，亦供列印/PDF捕捉) */}
              {/* ========================================================= */}
              <div 
                ref={printContainerRef} 
                className={`print-area ${previewMode === 'card' ? 'hidden print:block' : 'w-full flex flex-col items-center space-y-8'}`}
              >
                {Array.from({ length: totalA4Pages }).map((_, pageIdx) => {
                  const pageCards = cardDataList.slice(pageIdx * 4, (pageIdx + 1) * 4);
                  return (
                    <div 
                      key={pageIdx}
                      className="a4-page-wrapper flex justify-center w-full"
                      style={{
                        height: isZoomFit && currentScale < 1 ? `${Math.ceil(a4BaseHeight * currentScale) + 8}px` : 'auto',
                        overflow: isZoomFit && currentScale < 1 ? 'hidden' : 'visible'
                      }}
                    >
                      <div 
                        className="a4-page-container bg-white text-slate-900 rounded-xl shadow-2xl p-5 relative border border-slate-300"
                        style={{
                          width: `${a4BaseWidth}px`,
                          minWidth: `${a4BaseWidth}px`,
                          maxWidth: `${a4BaseWidth}px`,
                          minHeight: `${a4BaseHeight}px`,
                          boxSizing: 'border-box',
                          transform: isZoomFit && currentScale < 1 ? `scale(${currentScale})` : 'none',
                          transformOrigin: 'top center'
                        }}
                      >
                        <div className="no-print absolute top-2 right-3 text-[10px] font-bold text-slate-400">
                          A4 第 {pageIdx + 1} 頁 (共 {totalA4Pages} 頁)
                        </div>

                        <div className="grid grid-cols-2 gap-4 h-full">
                          {pageCards.map((card, cIdx) => (
                            <ParkingCardUnit key={cIdx} card={card} cardStyle={cardStyle} />
                          ))}

                          {pageCards.length < 4 && Array.from({ length: 4 - pageCards.length }).map((_, emptyIdx) => (
                            <ParkingCardUnit key={`empty_${emptyIdx}`} card={null} cardStyle={cardStyle} />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 生成 PDF 中之遮罩提示 */}
        {isGeneratingPdf && (
          <div className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-sky-500/40 p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center space-y-3">
              <Loader2 className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
              <h3 className="text-base font-black text-white">正在生成 A4 停車證 PDF</h3>
              <p className="text-xs text-sky-300 font-mono">{pdfProgress}</p>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-sky-500 h-full w-full animate-pulse"></div>
              </div>
              <p className="text-[11px] text-slate-400">正在處理純前端 300 DPI 向量轉圖，請稍候片刻...</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }
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
            display: block !important;
          }
          .a4-page-wrapper {
            height: 297mm !important;
            max-height: 297mm !important;
            overflow: visible !important;
            display: block !important;
            page-break-after: always !important;
            break-after: page !important;
          }
          .a4-page-container {
            width: 100% !important;
            max-width: 100% !important;
            min-height: 297mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 8mm !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            transform: none !important;
            page-break-after: always !important;
            break-after: page !important;
            box-sizing: border-box !important;
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
