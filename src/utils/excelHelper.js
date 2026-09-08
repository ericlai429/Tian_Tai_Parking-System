import * as XLSX from 'xlsx';

/**
 * 解析使用者上傳的停車清單 Excel 檔
 * 彈性辨識常見欄位：車牌, 姓名, 單位別/公司, 電話, 分項/事由, 備註, 類型/VIP, 核可/管理者
 */
export function parseParkingExcel(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  return rawRows.map((row, index) => {
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
      row['單位別'] || row['單位'] || row['公司'] || row['廠商'] || row['Unit'] || '外部訪客'
    ).trim();

    // 找出電話
    const phone = String(
      row['電話'] || row['手機'] || row['連絡電話'] || row['Phone'] || ''
    ).trim();

    // 找出分項 / 事由
    const subItem = String(
      row['分項'] || row['事由'] || row['部門'] || row['職稱'] || ''
    ).trim();

    // 找出備註
    const notes = String(
      row['備註'] || row['說明'] || row['Remarks'] || ''
    ).trim();

    // 找出長官/VIP/類型
    const rawType = String(
      row['類型'] || row['Type'] || row['身分'] || ''
    ).toLowerCase();
    const isVip = rawType.includes('vip') || notes.includes('長官') || notes.includes('VIP') || subItem.includes('長官');
    const type = isVip ? 'vip' : (rawType.includes('temp') || rawType.includes('臨') ? 'temp' : 'regular');

    // 核可狀態判斷
    const admin1 = String(row['管理者1'] || row['核准1'] || '').toUpperCase();
    const admin2 = String(row['管理者2'] || row['核准2'] || '').toUpperCase();
    const admin3 = String(row['管理者3'] || row['核准3'] || '').toUpperCase();
    const isApproved = isVip || admin1 === 'OK' || admin2 === 'OK' || admin3 === 'OK' || String(row['狀態'] || '').includes('核可') || String(row['狀態'] || '').includes('通過');

    return {
      id: `p_${Date.now()}_${index}`,
      plate,
      name,
      unit,
      phone,
      subItem,
      notes,
      admin1,
      admin2,
      admin3,
      type,
      status: isApproved ? 'pass' : (plate ? 'pending' : 'denied'),
      lastEntry: ''
    };
  }).filter(item => item.plate.length > 0);
}

/**
 * 匯出停車清單為標準 Excel 檔案
 */
export function exportParkingToExcel(parkingList, fileName = '天泰停車名冊.xlsx') {
  const exportData = parkingList.map(item => ({
    '車牌': item.plate,
    '姓名': item.name,
    '單位別': item.unit,
    '分項': item.subItem,
    '電話': item.phone,
    '備註': item.notes,
    '類型': item.type === 'vip' ? 'VIP長官' : (item.type === 'temp' ? '臨時洽公' : '常駐固定'),
    '管理者1': item.admin1 || '',
    '管理者2': item.admin2 || '',
    '管理者3': item.admin3 || '',
    '通行狀態': item.status === 'pass' ? '核准通行' : (item.status === 'pending' ? '待查核' : '未通過')
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '停車清單');
  XLSX.writeFile(workbook, fileName);
}

/**
 * 匯出班表為 Excel 格式 (符合 115年9月執勤表)
 */
export function exportScheduleToExcel(scheduleData, fileName = '天泰三總現場執勤表_115年9月.xlsx') {
  const headers = ['班別', '執勤人員'];
  for (let d = 1; d <= scheduleData.daysInMonth; d++) {
    headers.push(`${d}日`);
  }
  headers.push('應勤時數', '實勤時數');

  const rows = [headers];

  scheduleData.guards.forEach(guard => {
    const row = [guard.role, guard.name];
    for (let d = 1; d <= scheduleData.daysInMonth; d++) {
      row.push(guard.shifts[d] || '');
    }
    row.push(guard.targetHours, guard.actualHours);
    rows.push(row);
  });

  // 每日應勤總時數行
  const summaryRow = ['每日應勤時數', '現場時數'];
  for (let d = 1; d <= scheduleData.daysInMonth; d++) {
    summaryRow.push(scheduleData.dailyTargetHours[d] || 0);
  }
  summaryRow.push(scheduleData.totalTargetHours, scheduleData.totalTargetHours);
  rows.push(summaryRow);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `${scheduleData.yearRoc}.${scheduleData.month}班表`);
  XLSX.writeFile(workbook, fileName);
}
