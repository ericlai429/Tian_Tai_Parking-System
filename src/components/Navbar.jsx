import React from 'react';
import { 
  Shield, Calendar, Car, Cloud, Moon, Sun, 
  Activity, RefreshCw, Layers, CheckCircle2 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isDarkMode, setIsDarkMode, cloudStatus }) {
  const tabs = [
    { id: 'dashboard', label: '總覽戰情室', icon: Activity },
    { id: 'schedule', label: '天泰三總班表', icon: Calendar, badge: '115.9' },
    { id: 'parking', label: '智慧停車管理', icon: Car },
    { id: 'cloud', label: '雲端試算表對接', icon: Cloud }
  ];

  return (
    <header className="border-b transition-colors" style={{ 
      borderColor: 'var(--card-border)', 
      backgroundColor: 'var(--card-bg)',
      boxShadow: 'var(--shadow)' 
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & 標題 */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg"
               style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%)' }}>
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
                天泰營造
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
                Tian-Tai v1.0
              </span>
            </div>
            <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              三總現場執勤排班 ＆ 智慧停車通過管制系統
            </div>
          </div>
        </div>

        {/* 導覽按鈕群 */}
        <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 whitespace-nowrap ${
                  isActive 
                    ? 'text-white shadow-md shadow-indigo-500/25 scale-[1.02]' 
                    : 'hover:bg-slate-800/20'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  border: isActive ? 'none' : '1px solid transparent'
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-white/20 text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 功能控制區：雲端燈號與主題切換 */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('cloud')}
            className="flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all"
            style={{ 
              borderColor: cloudStatus.connected ? 'rgba(16, 185, 129, 0.4)' : 'var(--card-border)',
              backgroundColor: cloudStatus.connected ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              color: cloudStatus.connected ? '#10b981' : 'var(--text-dim)'
            }}
            title="雲端資料庫狀態"
          >
            <span className={`w-2 h-2 rounded-full ${cloudStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
            <span className="font-semibold">{cloudStatus.connected ? '雲端連線' : '本地暫存'}</span>
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl border transition-all hover:scale-105 active:scale-95"
            style={{ 
              borderColor: 'var(--card-border)', 
              backgroundColor: 'var(--card-hover)',
              color: 'var(--text)'
            }}
            title={isDarkMode ? '切換淺色模式' : '切換深色模式'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
