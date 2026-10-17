import React, { useEffect, useState } from 'react';
import { 
  Radar, 
  Search, 
  BellRing, 
  ShieldCheck, 
  CreditCard, 
  Send, 
  Sparkles, 
  Bot,
  Zap,
  Flame,
  Radio
} from 'lucide-react';
import { PlanId } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/planConfigs';
import { PWAInstallButton } from './PWAInstallButton';
import { realtimeMonitor } from '../services/realtimeMonitorService';

export type ActiveTab = 'search' | 'radar' | 'multi-watch' | 'tracking' | 'vault' | 'telegram' | 'plans' | 'architecture';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentPlan: PlanId;
  trackedCount: number;
  openUpgradeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentPlan,
  trackedCount,
  openUpgradeModal,
}) => {
  const plan = SUBSCRIPTION_PLANS[currentPlan];
  const [radarConfig, setRadarConfig] = useState(realtimeMonitor.getConfig());
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [isScanning, setIsScanning] = useState(false);
  const [alertCount, setAlertCount] = useState(realtimeMonitor.getAlerts().length);

  useEffect(() => {
    const unsubTick = realtimeMonitor.onTick((secs, scanning) => {
      setSecondsRemaining(secs);
      setIsScanning(scanning);
      setRadarConfig(realtimeMonitor.getConfig());
    });

    const unsubAlert = realtimeMonitor.onAlert(() => {
      setAlertCount(realtimeMonitor.getAlerts().length);
    });

    return () => {
      unsubTick();
      unsubAlert();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Wordmark logo */}
        <div 
          onClick={() => setActiveTab('search')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/30 transition-colors relative overflow-hidden">
            <Radar className="w-5 h-5 text-indigo-400 group-hover:text-emerald-400 transition-colors" />
            {radarConfig.isEnabled && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              PriceRadar <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">РФ</span>
            </span>
          </div>
        </div>

        {/* Clean navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {/* Live Radar Button */}
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 border cursor-pointer ${
              activeTab === 'radar'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-md shadow-emerald-900/30 scale-105'
                : 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40 hover:border-emerald-500/50'
            }`}
          >
            <span className="relative flex h-2 w-2">
              {radarConfig.isEnabled && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${radarConfig.isEnabled ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            </span>
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Радар Live</span>
            {radarConfig.isEnabled && (
              <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-black/40 text-emerald-200">
                {isScanning ? 'скан...' : `${secondsRemaining}с`}
              </span>
            )}
            {alertCount > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-rose-600 text-white">
                {alertCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('multi-watch')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'multi-watch'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-indigo-400 hover:text-indigo-200 hover:bg-slate-900/50'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Мульти-ссылки</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'search'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Поиск & Сравнение</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tracking'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Мониторинг ({trackedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'telegram'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Скидки & Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'plans'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Тарифы</span>
          </button>
        </nav>

        {/* Primary actions */}
        <div className="flex items-center gap-2.5">
          <PWAInstallButton />

          <button
            onClick={openUpgradeModal}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Тариф {plan.name}</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation strip */}
      <div className="flex lg:hidden overflow-x-auto px-4 py-2 bg-slate-900/80 border-t border-slate-800/60 gap-1.5 no-scrollbar text-xs">
        <button
          onClick={() => setActiveTab('radar')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-bold flex items-center gap-1 ${
            activeTab === 'radar' ? 'bg-emerald-600 text-white' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span>Радар Live</span>
          {alertCount > 0 && (
            <span className="text-[9px] px-1 rounded-full bg-rose-600 text-white font-mono">
              {alertCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('multi-watch')}
          className={`px-2.5 py-1 rounded whitespace-nowrap font-semibold ${activeTab === 'multi-watch' ? 'bg-indigo-600 text-white' : 'text-indigo-400'}`}
        >
          Мульти-ссылки
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'search' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
        >
          Парсинг
        </button>
        <button
          onClick={() => setActiveTab('tracking')}
          className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${activeTab === 'tracking' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
        >
          Товары ({trackedCount})
        </button>
        <button
          onClick={() => setActiveTab('telegram')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'telegram' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
        >
          Telegram
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'vault' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
        >
          Скидки
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'plans' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
        >
          Тарифы
        </button>
      </div>
    </header>
  );
};
