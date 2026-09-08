import React from 'react';
import { 
  Shield, Calendar, Car, Cloud, Moon, Sun, 
  Home, RefreshCw, Layers, Lock, Unlock, Crown, CreditCard 
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  setIsDarkMode, 
  cloudStatus,
  isAdmin,
  onAdminToggle,
  onOpenPassCard
}) {
  const allTabs = [
    { id: 'dashboard', label: '總覽戰情室', icon: Home },
    { id: 'schedule', label: '天泰三總班表', icon: Calendar, badge: '115.9' },
    { id: 'parking', label: '智慧停車管理', icon: Car },
    { id: 'cloud', label: '雲端試算表對接', icon: Cloud }
  ];

  const tabs = isAdmin ? allTabs : allTabs.filter(t => t.id !== 'cloud');

  return (
    <header className="border-b transition-colors sticky top-0 z-40" style={{ 
      borderColor: 'var(--card-border)', 
      backgroundColor: 'var(--card-bg)',
      boxShadow: 'var(--shadow)' 
    }}>
      <div className="w-full px-3 py-2.5 flex flex-col gap-2">
        {/* Logo & 標題 與 右側工具 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 cursor-pointer shrink-0 min-w-0" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white shadow-md shrink-0"
                 style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)' }}>
              <Shield className="w-4 h-4" />
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-base font-black tracking-tight whitespace-nowrap inline-block" style={{ color: 'var(--text)' }}>
                  天泰營造
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 whitespace-nowrap shrink-0">
                  V1.0  2026.9/8
                </span>
              </div>
              <div className="text-[10px] font-medium leading-none mt-0.5 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                智慧停車 & 執勤管理
              </div>
            </div>
          </div>

          {/* 功能控制區：停車証製作、Admin 身分、雲端燈號與主題切換 */}
          <div className="flex items-center gap-1 shrink-0">
            {/* 停車証製作按鈕 (需管理者授權) */}
            <button
              onClick={onOpenPassCard}
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border font-bold transition-all bg-sky-500/10 text-sky-400 border-sky-500/30 hover:bg-sky-500/20 active:scale-95 shadow-sm cursor-pointer whitespace-nowrap"
              title="輸出並製作符合規格之直式 A4 停車卡 (需管理員密碼)"
            >
              <CreditCard className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="hidden xs:inline">停車証</span>
            </button>

            {/* 後台管理員登入切換鈕 (密碼: t1898) */}
            <button
              onClick={onAdminToggle}
              className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border font-bold transition-all cursor-pointer whitespace-nowrap ${
                isAdmin 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm' 
                  : 'text-slate-400 border-slate-700 hover:bg-slate-800/30'
              }`}
              title={isAdmin ? "目前已登入 Admin (點擊登出)" : "點擊輸入密碼登入後台"}
            >
              {isAdmin ? <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              <span>{isAdmin ? 'Admin' : '後台'}</span>
            </button>

            {/* 雲端狀態小標籤 (僅 Admin 可見可點擊) */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('cloud')}
                className="flex items-center gap-1 text-[11px] px-1.5 py-1 rounded-lg border transition-all whitespace-nowrap"
                style={{ 
                  borderColor: cloudStatus.connected ? 'rgba(16, 185, 129, 0.4)' : 'var(--card-border)',
                  backgroundColor: cloudStatus.connected ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  color: cloudStatus.connected ? '#10b981' : 'var(--text-dim)'
                }}
                title="雲端資料庫狀態"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cloudStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                <span className="font-semibold">{cloudStatus.connected ? '連線' : '本地'}</span>
              </button>
            )}

            {/* 主題切換 */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-lg border transition-all hover:scale-105 active:scale-95 shrink-0"
              style={{ 
                borderColor: 'var(--card-border)', 
                backgroundColor: 'var(--card-hover)',
                color: 'var(--text)'
              }}
              title={isDarkMode ? '切換淺色模式' : '切換深色模式'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            </button>
          </div>
        </div>

        {/* 導覽頁籤 (具備清晰引導外框，提示使用者可點擊切換) */}
        <nav className="flex items-center justify-between gap-1.5 p-1 rounded-xl border overflow-x-auto scrollbar-none"
             style={{ 
               backgroundColor: 'var(--card-hover)', 
               borderColor: 'var(--card-border)' 
             }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-black transition-all duration-150 whitespace-nowrap cursor-pointer select-none ${
                  isActive 
                    ? 'text-white shadow-md shadow-indigo-500/30 ring-1 ring-white/20' 
                    : 'hover:bg-slate-700/20 active:scale-95'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--primary)' : 'var(--card-bg)',
                  color: isActive ? '#ffffff' : 'var(--text)',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid var(--card-border)',
                  boxShadow: isActive ? '0 2px 8px rgba(79, 70, 229, 0.35)' : 'none'
                }}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white animate-pulse' : 'text-indigo-400'}`} />
                <span>{tab.label.replace('總覽戰情室', '總覽').replace('天泰三總班表', '執勤班表').replace('智慧停車管理', '停車名冊').replace('雲端試算表對接', '雲端對接')}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
