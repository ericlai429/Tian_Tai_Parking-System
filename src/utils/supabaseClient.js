import { createClient } from '@supabase/supabase-js';

// Supabase 連線資訊 (優先讀取環境變數，若無則採用安全預設)
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rtolgqezctkioewmlcob.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_F3Y3oV47O3Ls9WZ5hKE74Q_H1xyniVc';

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

/**
 * 取得雲端所有車輛名冊
 */
export async function fetchSupabaseParkingData() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('parking_records')
    .select('*')
    .order('pass_no', { ascending: true });

  if (error) {
    console.error('Supabase 取得車輛名冊失敗:', error);
    throw error;
  }

  // 轉換欄位名稱符合前端命名
  return data.map(row => ({
    id: row.id,
    passNo: row.pass_no || '',
    plate: row.plate,
    name: row.name || '',
    unit: row.unit || '',
    subItem: row.sub_item || '',
    phone: row.phone || '',
    notes: row.notes || '',
    type: row.type || 'regular',
    status: row.status || 'pass',
    admin1: row.admin1 || '',
    admin2: row.admin2 || '',
    admin3: row.admin3 || ''
  }));
}

/**
 * 儲存或更新單筆車輛名冊
 */
export async function saveSingleParkingToSupabase(item) {
  if (!supabase || !item) return;
  const row = {
    id: item.id,
    pass_no: item.passNo,
    plate: item.plate,
    name: item.name,
    unit: item.unit,
    sub_item: item.subItem,
    phone: item.phone || '',
    notes: item.notes || '',
    type: item.type || 'regular',
    status: item.status || 'pass',
    admin1: item.admin1 || '',
    admin2: item.admin2 || '',
    admin3: item.admin3 || '',
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('parking_records')
    .upsert(row, { onConflict: 'id' });

  if (error) {
    console.error('Supabase 儲存車輛失敗:', error);
    throw error;
  }
}

/**
 * 批次儲存/同步車輛名冊至 Supabase
 */
export async function syncParkingDataToSupabase(parkingList) {
  if (!supabase || !Array.isArray(parkingList)) return;
  const rows = parkingList.map(item => ({
    id: item.id,
    pass_no: item.passNo,
    plate: item.plate,
    name: item.name,
    unit: item.unit,
    sub_item: item.subItem,
    phone: item.phone || '',
    notes: item.notes || '',
    type: item.type || 'regular',
    status: item.status || 'pass',
    admin1: item.admin1 || '',
    admin2: item.admin2 || '',
    admin3: item.admin3 || '',
    updated_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('parking_records')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('Supabase 批次更新車輛失敗:', error);
    throw error;
  }
}

/**
 * 刪除單筆車輛名冊
 */
export async function deleteParkingFromSupabase(id) {
  if (!supabase || !id) return;
  const { error } = await supabase
    .from('parking_records')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase 刪除車輛失敗:', error);
    throw error;
  }
}

/**
 * 取得雲端執勤班表
 */
export async function fetchSupabaseScheduleData() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('schedules')
    .select('data')
    .eq('id', 'tian_tai_schedule_main')
    .single();

  if (error) {
    console.error('Supabase 取得班表失敗:', error);
    throw error;
  }
  return data?.data || null;
}

/**
 * 儲存班表至 Supabase
 */
export async function saveScheduleDataToSupabase(scheduleData) {
  if (!supabase || !scheduleData) return;
  const { error } = await supabase
    .from('schedules')
    .upsert({
      id: 'tian_tai_schedule_main',
      data: scheduleData,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Supabase 儲存班表失敗:', error);
    throw error;
  }
}

/**
 * 訂閱車輛即時推播變更 (Realtime)
 */
export function subscribeToParkingChanges(onChanged) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('parking-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'parking_records' }, () => {
      fetchSupabaseParkingData().then(data => {
        if (data && onChanged) onChanged(data);
      }).catch(err => console.error('Realtime 更新停車名冊失敗:', err));
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * 訂閱班表即時推播變更 (Realtime)
 */
export function subscribeToScheduleChanges(onChanged) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('schedule-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, (payload) => {
      if (payload.new && payload.new.data && onChanged) {
        onChanged(payload.new.data);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
