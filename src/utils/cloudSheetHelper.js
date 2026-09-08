import * as XLSX from 'xlsx';

/**
 * 將 Google Sheets 試算表分享網址轉化為直接可抓取之 CSV 串流網址
 */
export function normalizeGoogleSheetUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();

  // 若已經是 CSV 連結
  if (trimmed.includes('out:csv')) {
    return trimmed;
  }

  // 匹配 Google Spreadsheet ID 與 gid
  const docMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);

  if (docMatch && docMatch[1]) {
    const docId = docMatch[1];
    let csvUrl = `https://docs.google.com/spreadsheets/d/${docId}/gviz/tq?tqx=out:csv`;
    if (gidMatch && gidMatch[1]) {
      csvUrl += `&gid=${gidMatch[1]}`;
    }
    return csvUrl;
  }

  return trimmed;
}

/**
 * 遠端抓取並解析雲端試算表車輛名冊
 */
export async function fetchCloudParkingData(url) {
  if (!url) throw new Error('請提供有效的雲端試算表網址！');
  const targetUrl = normalizeGoogleSheetUrl(url);

  const response = await fetch(targetUrl);
  if (!response.ok) {
    throw new Error(`無法連接雲端試算表 (HTTP ${response.status})，請確認試算表分享權限為「知道連結的任何人均可檢視」。`);
  }

  const csvText = await response.text();
  const workbook = XLSX.read(csvText, { type: 'string' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  if (!aoa || aoa.length === 0) {
    throw new Error('試算表內容為空！');
  }

  // 自動探測標題列
  let headerIdx = -1;
  const colMap = {};
  for (let r = 0; r < Math.min(10, aoa.length); r++) {
    const row = aoa[r] || [];
    row.forEach((cell, c) => {
      const text = String(cell || '').trim();
      if (text.includes('姓名') || text.includes('車主')) colMap.name = c;
      if (text.includes('公司') || text.includes('單位')) colMap.unit = c;
      if (text.includes('職稱') || text.includes('分項')) colMap.title = c;
      if (text.includes('車號') || text.includes('車牌') || text.includes('Plate')) colMap.plate = c;
      if (text.includes('電話') || text.includes('手機')) colMap.phone = c;
      if (text.includes('備註') || text.includes('說明')) colMap.notes = c;
    });
    if (colMap.plate !== undefined || colMap.name !== undefined) {
      headerIdx = r;
      break;
    }
  }

  if (headerIdx === -1 || colMap.plate === undefined) {
    throw new Error('試算表中未找到包含「車號」或「車牌」的標題欄位！');
  }

  const vehicles = [];
  for (let r = headerIdx + 1; r < aoa.length; r++) {
    const row = aoa[r] || [];
    const rawPlate = String(row[colMap.plate] || '').trim().toUpperCase();
    if (!rawPlate) continue; // 跳過無車號空行

    const name = String(row[colMap.name] || '').trim();
    const unit = String(row[colMap.unit] || '').trim() || '天泰營造';
    const title = String(row[colMap.title] || '').trim();
    const phone = colMap.phone !== undefined ? String(row[colMap.phone] || '').trim() : '';
    const notes = colMap.notes !== undefined ? String(row[colMap.notes] || '').trim() : '';

    // 自動判斷長官/VIP/公務車/貨車
    const isVip = title.includes('長') || title.includes('主任') || title.includes('經理') || title.includes('協理') || title.includes('建築師') || title.includes('執行長') || title.includes('總經理') || title.includes('負責人') || notes.includes('VIP');
    const isTruck = name.includes('貨車') || title.includes('貨車') || rawPlate.includes('CCF') || rawPlate.includes('0159');

    vehicles.push({
      id: `p_cloud_${r}_${Date.now()}`,
      passNo: String(vehicles.length + 1).padStart(3, '0'),
      plate: rawPlate,
      name: name || (isTruck ? '工程貨車' : '公務車輛'),
      unit,
      subItem: title || (isTruck ? '貨車&重機械' : '公務'),
      phone,
      notes: notes || `${unit} ${title}`,
      type: isVip ? 'vip' : (isTruck ? 'temp' : 'regular'),
      status: 'pass',
      admin1: 'OK',
      admin2: 'OK',
      admin3: isVip ? 'OK' : ''
    });
  }

  return vehicles;
}
