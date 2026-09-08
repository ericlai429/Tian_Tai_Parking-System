import * as XLSX from 'xlsx';

/**
 * 解析使用者上傳的停車清單 Excel 檔
 * 彈性辨識常見欄位：流水號/通行證, 車牌, 姓名, 單位別/公司, 電話, 分項/事由, 備註, 類型/VIP, 核可/管理者
 */
export function parseParkingExcel(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  return rawRows.map((row, index) => {
    // 找出流水號 / 通行證號 (統一 3 位數 001, 002...)
    const rawNo = row['通行證編號'] || row['通行證'] || row['流水號'] || row['序號'] || row['No'] || row['NO'] || (index + 1);
    const passNo = String(parseInt(String(rawNo).replace(/\D/g, ''), 10) || (index + 1)).padStart(3, '0');

    // 找出車牌
    const plate = String(
      row['車牌'] || row['車牌號碼'] || row['車號'] || row['Plate'] || row['PLATE'] || ''
    ).trim().toUpperCase();

    // 找出姓名
    const name = String(
      row['姓名'] || row['車主'] || row['駕駛'] || row['Name'] || ''
    ).trim();

    // 找出單位別
    const unit = String(
      row['單位別'] || row['單位'] || row['所屬公司'] || row['公司'] || row['廠商'] || row['Unit'] || '天泰營造'
    ).trim();

    // 找出電話
    const phone = String(
      row['電話'] || row['手機'] || row['連絡電話'] || row['Phone'] || ''
    ).trim();

    // 找出分項 / 事由 / 職稱
    const subItem = String(
      row['分項'] || row['職稱'] || row['事由'] || row['部門'] || ''
    ).trim();

    // 找出備註
    const notes = String(
      row['備註'] || row['說明'] || row['Remarks'] || ''
    ).trim();

    // 找出長官/VIP/類型
    const rawType = String(
      row['類型'] || row['Type'] || row['身分'] || ''
    ).toLowerCase();
    const isVip = rawType.includes('vip') || subItem.includes('長') || subItem.includes('主任') || subItem.includes('建築師') || subItem.includes('協理');
    const isTruck = name.includes('貨車') || subItem.includes('貨車') || plate.includes('CCF') || plate.includes('0159');
    const type = isVip ? 'vip' : (isTruck || rawType.includes('temp') ? 'temp' : 'regular');

    return {
      id: `p_${Date.now()}_${index}`,
      passNo,
      plate,
      name,
      unit,
      phone,
      subItem,
      notes,
      admin1: 'OK',
      admin2: 'OK',
      admin3: isVip ? 'OK' : '',
      type,
      status: 'pass',
      lastEntry: ''
    };
  }).filter(item => item.plate.length > 0);
}

/**
 * 匯出停車清單為標準 Excel 檔案
 */
export function exportParkingToExcel(parkingList, fileName = '天泰車輛名冊_最新.xlsx') {
  const exportData = parkingList.map((item, idx) => ({
    '通行證編號': item.passNo || String(idx + 1).padStart(2, '0'),
    '車牌': item.plate,
    '姓名': item.name,
    '所屬公司': item.unit,
    '職稱': item.subItem,
    '電話': item.phone || '',
    '備註': item.notes || '',
    '類型': item.type === 'vip' ? 'VIP長官' : (item.type === 'temp' ? '貨車/臨時' : '常駐固定'),
    '通行狀態': item.status === 'pass' ? '符合通過 OK!' : '未通過'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '車輛名冊');
  XLSX.writeFile(workbook, fileName);
}

/**
 * 匯出班表為 Excel 格式
 */
export function exportScheduleToExcel(scheduleData, fileName = '天泰現場執勤表_115年9月.xlsx') {
  const headers = ['班別', '執勤人員'];
  for (let d = 1; d <= scheduleData.daysInMonth; d++) {
    headers.push(`${d}日`);
  }

  const rows = [headers];

  scheduleData.guards.forEach(guard => {
    const row = [guard.role, guard.name];
    for (let d = 1; d <= scheduleData.daysInMonth; d++) {
      row.push(guard.shifts[d] || '');
    }
    rows.push(row);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `${scheduleData.yearRoc}.${scheduleData.month}班表`);
  XLSX.writeFile(workbook, fileName);
}
