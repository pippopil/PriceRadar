import React, { useState } from 'react';
import { 
  BellRing, 
  Trash2, 
  TrendingDown, 
  RefreshCw, 
  ExternalLink, 
  Play, 
  Pause, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  AlertTriangle,
  History,
  Send
} from 'lucide-react';
import { TrackedItem, PlanId } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/planConfigs';
import { MARKETPLACE_CONFIGS } from '../data/mockCatalog';
import { formatPrice } from '../services/parserEngine';
import { ProductImage } from './ProductImage';

interface TrackingDashboardProps {
  tracks: TrackedItem[];
  currentPlan: PlanId;
  onRemoveTrack: (id: string) => void;
  onToggleTrackStatus: (id: string) => void;
  onSimulatePriceDrop: (id: string) => void;
  onRefreshAllPrices: () => void;
  openUpgradeModal: () => void;
  onNavigateToSearch: () => void;
  onNavigateToTelegram: () => void;
}

export const TrackingDashboard: React.FC<TrackingDashboardProps> = ({
  tracks,
  currentPlan,
  onRemoveTrack,
  onToggleTrackStatus,
  onSimulatePriceDrop,
  onRefreshAllPrices,
  openUpgradeModal,
  onNavigateToSearch,
  onNavigateToTelegram,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'dropped'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const plan = SUBSCRIPTION_PLANS[currentPlan];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(r => setTimeout(r, 600));
    onRefreshAllPrices();
    setIsRefreshing(false);
  };

  const filteredTracks = tracks.filter(t => {
    if (filter === 'active') return t.status === 'active';
    if (filter === 'dropped') return t.lastDrop !== null;
    return true;
  });

  const quotaReached = tracks.length >= plan.maxTracks;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Мониторинг цен товаров
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono tabular-nums">
              {tracks.length} / {plan.maxTracks}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Опрос цен происходит автоматически ({plan.checkInterval}). Сигналы поступают в подключенный Telegram-бот.
          </p>
        </div>

        {/* Quota & Action Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || tracks.length === 0}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Обновить цены</span>
          </button>

          <button
            onClick={onNavigateToSearch}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 transition-colors"
          >
            <span>+ Добавить товар</span>
          </button>
        </div>
      </div>

      {/* Plan Quota Alert Bar if close or reached limit */}
      {quotaReached && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3.5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Достигнут лимит отслеживаемых товаров для тарифа <strong className="font-semibold text-white">{plan.name}</strong> ({tracks.length} из {plan.maxTracks}).
            </span>
          </div>
          <button
            onClick={openUpgradeModal}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors shrink-0"
          >
            Расширить до {currentPlan === 'free' ? '5 товаров' : '10 товаров'}
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              filter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Все ({tracks.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              filter === 'active' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Активные ({tracks.filter(t => t.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('dropped')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              filter === 'dropped' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Было снижение ({tracks.filter(t => t.lastDrop !== null).length})
          </button>
        </div>

        <button
          onClick={onNavigateToTelegram}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Настроить бота</span>
        </button>
      </div>

      {/* Empty State */}
      {filteredTracks.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <BellRing className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            {tracks.length === 0 ? 'Нет товаров на отслеживании' : 'Нет товаров под выбранный фильтр'}
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Вставьте ссылку на товар с Ozon или Wildberries в строке поиска, чтобы сервис начал отслеживать падение цен.
          </p>
          <button
            onClick={onNavigateToSearch}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <span>Найти товар для отслеживания</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Tracked List */
        <div className="space-y-4">
          {filteredTracks.map((item) => {
            const lowestConfig = MARKETPLACE_CONFIGS[item.lowestMarketplace];
            const sourceConfig = MARKETPLACE_CONFIGS[item.sourceMarketplace];
            const totalDrop = item.initialPrice - item.currentPrice;
            const hasDropped = totalDrop > 0 || item.lastDrop !== null;

            return (
              <div 
                key={item.id}
                className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 transition-all ${
                  item.lastDrop 
                    ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/20' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-5 items-start justify-between">
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-950 border border-slate-800 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                      <ProductImage
                        imageUrl={item.imageUrl}
                        title={item.title}
                        brand={item.brand}
                        category={item.category}
                        sourceMarketplace={item.sourceMarketplace}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mb-1">
                        <span className="font-semibold text-slate-300">{item.brand}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <span 
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: lowestConfig.color }}
                          />
                          Минимум на {lowestConfig.name}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug line-clamp-2 mb-2">
                        {item.title}
                      </h3>

                      {/* Drop Banner if dropped */}
                      {item.lastDrop && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2 animate-pulse">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>
                            Снижение цены: -{formatPrice(item.lastDrop.amount)} (-{item.lastDrop.percent.toFixed(1)}%) на {MARKETPLACE_CONFIGS[item.lastDrop.marketplace].name}!
                          </span>
                        </div>
                      )}

                      {/* Mini Price History Sparkline */}
                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <History className="w-3 h-3 text-slate-500" />
                          <span>Начальная: {formatPrice(item.initialPrice)}</span>
                        </span>
                        <span>·</span>
                        <span>
                          Порог: {item.targetPrice ? formatPrice(item.targetPrice) : 'Любое снижение'}
                        </span>
                        <span>·</span>
                        <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                          Проверено: {new Date(item.lastCheckedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Prices & Action Controls */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    <div className="text-left lg:text-right">
                      <div className="text-[11px] text-slate-400 mb-0.5">Текущая лучшая цена:</div>
                      <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono tabular-nums">
                        {formatPrice(item.currentPrice)}
                      </div>
                      {item.initialPrice > item.currentPrice && (
                        <div className="text-xs text-slate-400 line-through font-mono tabular-nums">
                          {formatPrice(item.initialPrice)}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Test price drop button */}
                      <button
                        type="button"
                        onClick={() => onSimulatePriceDrop(item.id)}
                        title="Смоделировать снижение цены и отправить сигнал в Telegram"
                        className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span>Тест: -15% цены</span>
                      </button>

                      {/* Buy link */}
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                        title="Открыть в магазине"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {/* Toggle status */}
                      <button
                        type="button"
                        onClick={() => onToggleTrackStatus(item.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          item.status === 'active'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                        title={item.status === 'active' ? 'Поставить на паузу' : 'Возобновить'}
                      >
                        {item.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onRemoveTrack(item.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-colors"
                        title="Удалить из отслеживания"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
