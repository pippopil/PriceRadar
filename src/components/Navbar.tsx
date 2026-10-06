import React from 'react';
import { 
  Radar, 
  Search, 
  BellRing, 
  ShieldCheck, 
  CreditCard, 
  Send, 
  Sparkles, 
  Cpu,
  Bot,
  Zap
} from 'lucide-react';
import { PlanId } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/planConfigs';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  activeTab: 'search' | 'multi-watch' | 'tracking' | 'vault' | 'telegram' | 'plans' | 'architecture';
  setActiveTab: (tab: 'search' | 'multi-watch' | 'tracking' | 'vault' | 'telegram' | 'plans' | 'architecture') => void;
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

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div 
          onClick={() => setActiveTab('search')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/30 transition-colors">
            <Radar className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              PriceRadar <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">РФ</span>
            </span>
          </div>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Поиск и парсинг</span>
          </button>

          <button
            onClick={() => setActiveTab('multi-watch')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'multi-watch'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-indigo-400 hover:text-indigo-200 hover:bg-slate-900/50'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Мульти-ссылки & TG</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
              NEW
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'tracking'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Отслеживаемые</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700/80 text-slate-300 tabular-nums">
              {trackedCount}/{plan.maxTracks}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'vault'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Личные скидки & Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'telegram'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram-бот</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'plans'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Тарифы</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <PWAInstallButton />

          <button
            onClick={openUpgradeModal}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-500/20 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Тариф {plan.name}</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation strip */}
      <div className="flex lg:hidden overflow-x-auto px-4 py-2 bg-slate-900/60 border-t border-slate-800/60 gap-1.5 no-scrollbar text-xs">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${activeTab === 'search' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
        >
          Парсинг
        </button>
        <button
          onClick={() => setActiveTab('multi-watch')}
          className={`px-2.5 py-1 rounded whitespace-nowrap font-semibold ${activeTab === 'multi-watch' ? 'bg-indigo-600 text-white' : 'text-indigo-400'}`}
        >
          Мульти-ссылки & TG
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
