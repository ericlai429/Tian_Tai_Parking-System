import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import ScheduleView from './components/ScheduleView';
import ParkingView from './components/ParkingView';
import CloudSyncModal from './components/CloudSyncModal';

import { INITIAL_SCHEDULE_DATA } from './data/initialSchedule';
import { INITIAL_PARKING_DATA, DEFAULT_PARKING_SHEET_URL } from './data/defaultParking';
import { Lock, Unlock, KeyRound } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 後台管理員登入狀態 (密碼: t1898)
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('tian_tai_admin_auth') === 'true';
  });
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminError, setAdminError] = useState('');

  // 勤務班表資料
  const [scheduleData, setScheduleData] = useState(() => {
    const cached = localStorage.getItem('tian_tai_schedule_data');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { /* ignore */ }
    }
    return INITIAL_SCHEDULE_DATA;
  });

  // 停車場名冊資料 (確保 VIP 長官從 001 依序往下排序，統一 3 位數流水號，並自動補入最新車輛如 6831-MR)
  const [parkingList, setParkingList] = useState(() => {
    const cached = localStorage.getItem('tian_tai_parking_data');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 檢查是否已包含最新飛龍保全車輛 6831-MR
          const has6831 = parsed.some(p => (p.plate || '').includes('6831'));
          if (has6831 && parsed.length >= INITIAL_PARKING_DATA.length) {
            return parsed;
          }
          // 若舊快取缺少新車輛，自動與 INITIAL_PARKING_DATA 合併補齊
          const existingPlates = new Set(parsed.map(p => (p.plate || '').replace(/[\s-]/g, '').toUpperCase()));
          const missing = INITIAL_PARKING_DATA.filter(p => !existingPlates.has((p.plate || '').replace(/[\s-]/g, '').toUpperCase()));
          if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            localStorage.setItem('tian_tai_parking_data', JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      } catch (e) { /* ignore */ }
    }
    return INITIAL_PARKING_DATA;
  });

  // 雲端連線設定
  const [cloudConfig, setCloudConfig] = useState(() => {
    const cached = localStorage.getItem('tian_tai_cloud_config');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { /* ignore */ }
    }
    return {
      parkingUrl: DEFAULT_PARKING_SHEET_URL,
      scheduleFolderUrl: ''
    };
  });

  // 雲端連線狀態
  const [cloudStatus, setCloudStatus] = useState({
    connected: true,
    lastSync: '18:10'
  });

  // 主題切換 (暗色 / 淺色)
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    }
  }, [isDarkMode]);

  // 暫存資料至 LocalStorage
  useEffect(() => {
    localStorage.setItem('tian_tai_parking_data', JSON.stringify(parkingList));
  }, [parkingList]);

  // 驗證管理員密碼
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPasswordInput === 't1898') {
      setIsAdmin(true);
      localStorage.setItem('tian_tai_admin_auth', 'true');
      setShowAdminModal(false);
      setAdminPasswordInput('');
      setAdminError('');
    } else {
      setAdminError('密碼錯誤！請重新輸入');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('tian_tai_admin_auth');
    if (activeTab === 'cloud') {
      setActiveTab('dashboard');
    }
  };

  // 若非 Admin 身分，禁止停留或跳轉至雲端對接分頁
  useEffect(() => {
    if (!isAdmin && activeTab === 'cloud') {
      setActiveTab('dashboard');
    }
  }, [isAdmin, activeTab]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start transition-colors duration-300" style={{ backgroundColor: 'var(--bg)' }}>
      {/* 限制本機與各環境為 iPhone 13 Pro 規格尺寸 (390px ~ 430px) 置中，避免在大螢幕過度放大 */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col border-x shadow-2xl transition-all"
           style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--bg)' }}>
        {/* 導覽列 */}
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode}
          cloudStatus={cloudStatus}
          isAdmin={isAdmin}
          onAdminToggle={() => {
            if (isAdmin) {
              handleAdminLogout();
            } else {
              setShowAdminModal(true);
            }
          }}
        />

        {/* 主工作區塊 */}
        <main className="flex-1 w-full px-3 py-4 space-y-4">
        {activeTab === 'dashboard' && (
          <DashboardView 
            scheduleData={scheduleData}
            parkingList={parkingList}
            setActiveTab={setActiveTab}
            cloudConfig={cloudConfig}
            cloudStatus={cloudStatus}
            isAdmin={isAdmin}
            setIsAdmin={setIsAdmin}
            onAdminLoginClick={() => {
              if (isAdmin) handleAdminLogout();
              else setShowAdminModal(true);
            }}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView 
            scheduleData={scheduleData}
            setScheduleData={setScheduleData}
            onOpenCloudSync={() => setActiveTab('cloud')}
          />
        )}

        {activeTab === 'parking' && (
          <ParkingView 
            parkingList={parkingList}
            setParkingList={setParkingList}
            cloudConfig={cloudConfig}
            setCloudStatus={setCloudStatus}
            onOpenCloudSync={() => setActiveTab('cloud')}
            isAdmin={isAdmin}
            onRequireAdmin={() => setShowAdminModal(true)}
          />
        )}

        {isAdmin && activeTab === 'cloud' && (
          <CloudSyncModal 
            cloudConfig={cloudConfig}
            setCloudConfig={setCloudConfig}
            onSyncParking={(vehicles) => {
              setParkingList(vehicles);
              localStorage.setItem('tian_tai_parking_data', JSON.stringify(vehicles));
            }}
            onSyncSchedule={(sched) => {
              setScheduleData(sched);
              localStorage.setItem('tian_tai_schedule_data', JSON.stringify(sched));
            }}
            cloudStatus={cloudStatus}
            setCloudStatus={setCloudStatus}
            isAdmin={isAdmin}
            onRequireAdmin={() => setShowAdminModal(true)}
          />
        )}
      </main>

      {/* 頁尾資訊 (下方保留 15% 留白，防止未加入主畫面的 Safari/Chrome 使用者被底部工具列遮擋) */}
      <footer className="mt-auto border-t pt-6 pb-2 text-center transition-colors" style={{ 
        borderColor: 'var(--card-border)', 
        backgroundColor: 'var(--card-bg)', 
        color: 'var(--text-dim)' 
      }}>
        <div className="w-full px-3 space-y-3">
          {/* 手機 PWA 安裝獨立網格 (字體 14px，淡藍色呼吸燈 High_light 顯示) */}
          <div className="p-3.5 rounded-xl border text-[13px] leading-relaxed glow-cyan text-left sm:text-center transition-all"
               style={{ 
                 backgroundColor: 'rgba(14, 165, 233, 0.08)', 
                 borderColor: 'rgba(56, 189, 248, 0.6)',
                 color: 'var(--text)'
               }}>
            <div className="flex items-start gap-2">
              <span className="text-base shrink-0 animate-bounce">📱</span>
              <div>
                <span className="font-bold text-sky-400">iPhone (Safari)：</span>
                <span>以 Safari 開啟上方連結 ➔ 點擊底部「分享」按鈕 ➔ 選擇「加入主畫面」即可在桌面生成 App 圖示，點開即為全螢幕獨立 App！</span>
              </div>
            </div>
          </div>

          {/* 頁尾資料精準換行 */}
          <div className="flex flex-col items-center justify-center space-y-1 text-xs leading-relaxed">
            <div className="font-bold tracking-wide" style={{ color: 'var(--text)' }}>
              天泰營造與勤務管理系統 © 2026 Tian-Tai Management
            </div>
            <div className="font-semibold" style={{ color: 'var(--text-muted)' }}>
              使用單位：天泰營造
            </div>
            <div style={{ color: 'var(--text-dim)' }}>
              執勤單位：飛龍保全 / 中華飛龍物業
            </div>
          </div>

          {/* 底部 15% 自動安全留白區塊 (約 15vh) */}
          <div className="h-[15vh] w-full pointer-events-none" aria-hidden="true"></div>
        </div>
      </footer>
    </div>

      {/* 後台管理員密碼驗證彈出窗 (密碼: t1898) */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-2xl border space-y-4 animate-scaleUp shadow-2xl"
               style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>後台管理員驗證</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>請輸入後台權限密碼</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowAdminModal(false); setAdminError(''); }}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  autoFocus
                  required
                  value={adminPasswordInput}
                  onChange={(e) => { setAdminPasswordInput(e.target.value); setAdminError(''); }}
                  placeholder="請輸入管理員密碼..."
                  className="w-full px-4 py-3 rounded-xl border text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500"
                  style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
                />
                {adminError && (
                  <div className="text-xs text-rose-400 font-bold mt-1.5">{adminError}</div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAdminModal(false); setAdminError(''); }}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-400 hover:bg-slate-800/30"
                  style={{ borderColor: 'var(--card-border)' }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md transition-all active:scale-95"
                >
                  解鎖登入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
