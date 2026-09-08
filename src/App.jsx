import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import ScheduleView from './components/ScheduleView';
import ParkingView from './components/ParkingView';
import CloudSyncModal from './components/CloudSyncModal';

import { INITIAL_SCHEDULE_DATA } from './data/initialSchedule';
import { INITIAL_PARKING_DATA, DEFAULT_PARKING_SHEET_URL } from './data/defaultParking';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 勤務班表資料 (支援 LocalStorage 暫存)
  const [scheduleData, setScheduleData] = useState(() => {
    const cached = localStorage.getItem('tian_tai_schedule_data');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { /* ignore */ }
    }
    return INITIAL_SCHEDULE_DATA;
  });

  // 停車場名冊資料 (支援 LocalStorage 暫存)
  const [parkingList, setParkingList] = useState(() => {
    const cached = localStorage.getItem('tian_tai_parking_data');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { /* ignore */ }
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

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* 導覽列 */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode}
        cloudStatus={cloudStatus}
      />

      {/* 主工作區塊 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView 
            scheduleData={scheduleData}
            parkingList={parkingList}
            setActiveTab={setActiveTab}
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
          />
        )}

        {activeTab === 'cloud' && (
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
          />
        )}
      </main>

      {/* 頁尾資訊 */}
      <footer className="mt-auto border-t py-4 text-center text-xs" style={{ 
        borderColor: 'var(--card-border)', 
        backgroundColor: 'var(--card-bg)', 
        color: 'var(--text-dim)' 
      }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            天泰營造與勤務管理系統 © 2026 Tian-Tai Management
          </div>
          <div className="flex items-center gap-3">
            <span>現場案場：天泰三總工務所</span>
            <span>·</span>
            <span>執勤單位：飛龍保全 / 中華飛龍物業</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
