import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import ScheduleView from './components/ScheduleView';
import ParkingView from './components/ParkingView';
import CloudSyncModal from './components/CloudSyncModal';
import PassCardModal from './components/PassCardModal';

import { INITIAL_SCHEDULE_DATA } from './data/initialSchedule';
import { INITIAL_PARKING_DATA, DEFAULT_PARKING_SHEET_URL } from './data/defaultParking';
import { Lock, Unlock, KeyRound, CreditCard } from 'lucide-react';

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

  // 停車証輸出彈窗與密碼保護控制
  const [showPassCardModal, setShowPassCardModal] = useState(false);
  const [showPassCardAuthModal, setShowPassCardAuthModal] = useState(false);
  const [passCardPasswordInput, setPassCardPasswordInput] = useState('');
  const [passCardError, setPassCardError] = useState('');

  // 勤務班表資料
  const [scheduleData, setScheduleData] = useState(() => {
    const cached = localStorage.getItem('tian_tai_schedule_data');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { /* ignore */ }
    }
    return INITIAL_SCHEDULE_DATA;
  });

  // 停車場名冊資料 (確保 001 必為執行長/總經理 鄭全欽/謝佳蓉，統一 3 位數流水號，消除舊快取衝突)
  const [parkingList, setParkingList] = useState(() => {
    const cached = localStorage.getItem('tian_tai_parking_data');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 檢查 001 或第一筆是否為 CCN-1898 鄭全欽/謝佳蓉，若舊快取順序錯誤則捨棄舊快取採用最新 INITIAL_PARKING_DATA
          const firstItem = parsed[0] || {};
          const isFirstCorrect = (firstItem.plate || '').toUpperCase().includes('1898') || (firstItem.name || '').includes('鄭全欽');
          if (isFirstCorrect) {
            return parsed;
          }
        }
      } catch (e) { /* ignore */ }
    }
    // 預設寫入最新的 INITIAL_PARKING_DATA
    try {
      localStorage.setItem('tian_tai_parking_data', JSON.stringify(INITIAL_PARKING_DATA));
    } catch (e) { /* ignore */ }
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
    if ((adminPasswordInput || '').trim().toLowerCase() === 't1898') {
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

  // 點擊「停車証」按鈕：若已是 Admin 身分直接開啟，否則跳出密碼驗證視窗 (密碼: t1898)
  const handlePassCardClick = () => {
    if (isAdmin) {
      setShowPassCardModal(true);
    } else {
      setPassCardPasswordInput('');
      setPassCardError('');
      setShowPassCardAuthModal(true);
    }
  };

  // 停車証密碼驗證
  const handlePassCardAuthSubmit = (e) => {
    e.preventDefault();
    if ((passCardPasswordInput || '').trim().toLowerCase() === 't1898') {
      setIsAdmin(true);
      localStorage.setItem('tian_tai_admin_auth', 'true');
      setShowPassCardAuthModal(false);
      setShowPassCardModal(true);
      setPassCardPasswordInput('');
      setPassCardError('');
    } else {
      setPassCardError('管理員密碼錯誤！請重新輸入');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start transition-colors duration-300" style={{ backgroundColor: 'var(--bg)' }}>
      {/* 嚴格鎖定全螢幕/筆電/手機皆為固定手機尺寸 (max-w-[430px]) 置中，任何分頁切換皆不變動尺寸 */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col border-x shadow-2xl transition-colors duration-200"
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
          onOpenPassCard={handlePassCardClick}
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
          {/* LINE 瀏覽器下載存檔提示 (黃色呼吸光背景效果) */}
          <div className="p-3 sm:p-3.5 rounded-xl border text-[13px] leading-relaxed glow-amber text-left sm:text-center transition-all"
               style={{ 
                 backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                 borderColor: 'rgba(245, 158, 11, 0.6)',
                 color: 'var(--text)'
               }}>
            <div className="flex items-center justify-center gap-2">
              <span className="text-base shrink-0 animate-pulse">⚠️</span>
              <div className="font-bold text-amber-300 text-xs sm:text-[13px] tracking-wide text-center">
                <span>LINE 無法存檔？點右上「…」➔「在瀏覽器中開啟」</span>
              </div>
            </div>
          </div>

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

      {/* 停車証密碼驗證彈出窗 (密碼: t1898) */}
      {showPassCardAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-2xl border space-y-4 animate-scaleUp shadow-2xl"
               style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>停車証輸出授權</h3>
                  <p className="text-xs text-slate-400">請輸入管理者密碼以製作停車卡</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowPassCardAuthModal(false); setPassCardError(''); }}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePassCardAuthSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  autoFocus
                  required
                  value={passCardPasswordInput}
                  onChange={(e) => { setPassCardPasswordInput(e.target.value); setPassCardError(''); }}
                  placeholder="請輸入管理者密碼..."
                  className="w-full px-4 py-3 rounded-xl border text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-sky-500"
                  style={{ backgroundColor: 'var(--card-hover)', borderColor: 'var(--card-border)', color: 'var(--text)' }}
                />
                {passCardError && (
                  <div className="text-xs text-rose-400 font-bold mt-1.5">{passCardError}</div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowPassCardAuthModal(false); setPassCardError(''); }}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold text-slate-400 hover:bg-slate-800/30"
                  style={{ borderColor: 'var(--card-border)' }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md transition-all active:scale-95"
                >
                  驗證並製作
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 停車証輸出列印 Modal */}
      {showPassCardModal && (
        <PassCardModal
          isOpen={showPassCardModal}
          onClose={() => setShowPassCardModal(false)}
          parkingList={parkingList}
        />
      )}
    </div>
  );
}
