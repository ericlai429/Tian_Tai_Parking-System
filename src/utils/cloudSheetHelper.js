import * as XLSX from 'xlsx';

/**
 * 將 Google Sheets 試算表分享網址轉化為直接可抓取之 CSV 串流網址
 */
export function normalizeGoogleSheetUrl(rawUrl, preferGviz = true) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();

  // 匹配 Google Spreadsheet ID 與 gid
  const docMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);

  if (docMatch && docMatch[1]) {
    const docId = docMatch[1];
    const gid = gidMatch && gidMatch[1] ? gidMatch[1] : '0';
    if (preferGviz) {
      return `https://docs.google.com/spreadsheets/d/${docId}/gviz/tq?tqx=out:csv&gid=${gid}`;
    }
    return `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`;
  }

  return trimmed;
}

/**
 * 遠端抓取並解析雲端試算表車輛名冊
 */
export async function fetchCloudParkingData(url) {
  if (!url) throw new Error('請提供有效的雲端試算表網址！');
  const targetUrl = normalizeGoogleSheetUrl(url, true);

  let response;
  try {
    response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (err) {
    try {
      const altUrl = normalizeGoogleSheetUrl(url, false);
      response = await fetch(altUrl);
    } catch (e) {
      throw new Error(`無法連接雲端試算表 (${err.message || 'Load failed'})，請確認網路環境或試算表共用權限。`);
    }
  }

  if (!response || !response.ok) {
    throw new Error(`無法連接雲端試算表 (HTTP ${response?.status || 'Error'})，請確認試算表分享權限為「知道連結的任何人均可檢視」。`);
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

/**
 * 遠端抓取並解析雲端 Google 試算表之執勤排班表
 */
export async function fetchCloudScheduleData(url, currentSchedule = null) {
  // 執勤班表因包含複雜合併儲存格，export 格式能精準保留原格式且支援 CORS
  let targetUrl = normalizeGoogleSheetUrl(url, false);

  let response;
  try {
    response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (err) {
    const altUrl = normalizeGoogleSheetUrl(url, true);
    response = await fetch(altUrl);
  }

  if (!response || !response.ok) {
    throw new Error(`無法連接雲端試算表 (HTTP ${response?.status || 'Error'})，請確認試算表分享權限為「知道連結的任何人均可檢視」。`);
  }

  const csvText = await response.text();
  const workbook = XLSX.read(csvText, { type: 'string' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  if (!aoa || aoa.length === 0) {
    throw new Error('試算表內容為空！');
  }

  // 尋找包含「執勤人員」或「班別」的標題列
  let headerRowIdx = -1;
  for (let r = 0; r < Math.min(10, aoa.length); r++) {
    const row = aoa[r] || [];
    if (row.some(cell => String(cell || '').includes('執勤人員'))) {
      headerRowIdx = r;
      break;
    }
  }

  if (headerRowIdx === -1) {
    throw new Error('試算表中未找到包含「執勤人員」之表頭列！');
  }

  const headerRow = aoa[headerRowIdx];
  // 找出日期 1..31 對應的欄位索引
  const dayColMap = {};
  headerRow.forEach((cell, c) => {
    const n = parseInt(String(cell || '').trim(), 10);
    if (!isNaN(n) && n >= 1 && n <= 31) {
      dayColMap[n] = c;
    }
  });

  const daysInMonth = Object.keys(dayColMap).length || 30;

  // 預設應勤時數 (9/8 ~ 9/30 每日 12H)
  const dailyTargetHours = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dailyTargetHours[d] = d >= 8 ? 12 : 0;
  }
  let totalTargetHours = 276;

  // 掃描「每日應勤時數」列
  for (let r = headerRowIdx + 1; r < aoa.length; r++) {
    const row = aoa[r] || [];
    const firstCell = String(row[0] || '').trim();
    if (firstCell.includes('應勤時數')) {
      for (let d = 1; d <= daysInMonth; d++) {
        const col = dayColMap[d];
        const val = parseInt(String(row[col] || '0').trim(), 10);
        if (!isNaN(val)) dailyTargetHours[d] = val;
      }
      const lastNums = row.map(c => parseInt(String(c || '').trim(), 10)).filter(n => !isNaN(n) && n > 50);
      if (lastNums.length > 0) totalTargetHours = lastNums[lastNums.length - 1];
      break;
    }
  }

  // 讀取各保全人員列
  const guards = [];
  let r = headerRowIdx + 1;
  if (aoa[r] && !aoa[r][0] && !aoa[r][1]) {
    r++; // 跳過星期幾列
  }

  while (r < aoa.length) {
    const row = aoa[r] || [];
    const role = String(row[0] || '').trim();
    const name = String(row[1] || '').trim();

    if (role.includes('應勤時數') || name.includes('應勤時數') || role.includes('班次說明') || role.includes('注意事項')) {
      break;
    }

    if (name) {
      const shifts = {};
      for (let d = 1; d <= daysInMonth; d++) {
        const col = dayColMap[d];
        const val = col !== undefined ? String(row[col] || '').trim() : '';
        if (val) shifts[d] = val;
      }

      // 從數值欄位提取應勤與實勤
      const nums = row.map(c => parseInt(String(c || '').trim(), 10)).filter(n => !isNaN(n) && n > 0);
      const targetHours = nums.length >= 2 ? nums[nums.length - 2] : (Object.keys(shifts).length * 12);
      const actualHours = nums.length >= 1 ? nums[nums.length - 1] : targetHours;

      const existingGuard = currentSchedule?.guards?.find(g => g.name === name);

      guards.push({
        id: existingGuard?.id || `g_${guards.length + 1}`,
        name,
        role: role || '日班',
        type: role.includes('機') ? 'backup' : 'regular',
        phone: existingGuard?.phone || (name === '賴鯤仲' ? '0911-222-333' : (name === '葉榮東' ? '0922-333-444' : '0933-444-555')),
        targetHours,
        actualHours,
        shifts,
        specialNotes: existingGuard?.specialNotes || {}
      });
    }
    r++;
  }

  return {
    dayNames: ["日", "一", "二", "三", "四", "五", "六"],
    phone: "02-2259-2999",
    fax: "02-2256-2609",
    headquarters: "220新北市板橋區文化路二段498號3樓",
    shiftTypes: {
      A: {
        name: "日班",
        timeRange: "07:00~19:00",
        hours: 12,
        color: "#4f46e5"
      }
    },
    ...(currentSchedule || {}),
    projectTitle: "天泰三總 現場執勤表",
    companyName: "飛龍保全",
    corpName: "中華飛龍物業",
    yearRoc: 115,
    yearAd: 2026,
    month: 9,
    daysInMonth,
    dailyTargetHours,
    totalTargetHours,
    guards
  };
}
