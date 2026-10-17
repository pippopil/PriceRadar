import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Clock, 
  Zap, 
  ExternalLink, 
  SlidersHorizontal, 
  Server, 
  Flame, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Sparkles,
  Info,
  Bug,
  RotateCcw,
  Check
} from 'lucide-react';
import { StoreHealthInfo, ParsingIncident, ParsingErrorCode, ParsingHealthStatus } from '../types';
import { parsingHealthService } from '../services/parsingHealthService';

interface ParsingHealthMonitoringPanelProps {
  onNavigateToWatches?: () => void;
  onNavigateToRadar?: () => void;
}

export const ParsingHealthMonitoringPanel: React.FC<ParsingHealthMonitoringPanelProps> = ({
  onNavigateToWatches,
  onNavigateToRadar
}) => {
  const [stores, setStores] = useState<StoreHealthInfo[]>([]);
  const [incidents, setIncidents] = useState<ParsingIncident[]>([]);
  const [isScanningAll, setIsScanningAll] = useState(false);
  const [checkingStoreId, setCheckingStoreId] = useState<string | null>(null);
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('all');
  const [selectedErrorFilter, setSelectedErrorFilter] = useState<string>('all');
  const [onlyActiveIncidents, setOnlyActiveIncidents] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsub = parsingHealthService.subscribe((updatedStores, updatedIncidents) => {
      setStores(updatedStores);
      setIncidents(updatedIncidents);
    });
    return unsub;
  }, []);

  const showNotice = (msg: string) => {
    setActionSuccessNotice(msg);
    setTimeout(() => setActionSuccessNotice(null), 4000);
  };

  const summary = parsingHealthService.getOverallSummary();

  const handleCheckAll = async () => {
    setIsScanningAll(true);
    await parsingHealthService.checkAllStores();
    setIsScanningAll(false);
    showNotice('Проверка всех маркетплейсов успешно завершена! Данные обновлены.');
  };

  const handleCheckSingle = async (storeId: string) => {
    setCheckingStoreId(storeId);
    await parsingHealthService.checkStoreHealth(storeId);
    setCheckingStoreId(null);
    showNotice(`Канал связи с ${storeId.toUpperCase()} проверен.`);
  };

  const handleSimulate = (storeId: string, code: ParsingErrorCode) => {
    const inc = parsingHealthService.simulateIncident(storeId, code);
    showNotice(`Смоделирован инцидент: «${inc.errorTitle}» для ${inc.storeName}`);
  };

  const handleResolveIncident = (incidentId: string) => {
    parsingHealthService.resolveIncident(incidentId);
    showNotice('Инцидент помечен как устраненный. Статус магазина обновлен.');
  };

  const handleResolveAll = () => {
    parsingHealthService.resolveAllIncidents();
    showNotice('Все маркетплейсы переведены в штатный режим!');
  };

  const handleResetToDefault = () => {
    parsingHealthService.resetToDefault();
    showNotice('Данные мониторинга сброшены к стандартным значениям.');
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter(inc => {
    if (selectedStoreFilter !== 'all' && inc.storeId !== selectedStoreFilter) return false;
    if (selectedErrorFilter !== 'all' && inc.errorCode !== selectedErrorFilter) return false;
    if (onlyActiveIncidents && inc.resolved) return false;
    return true;
  });

  const getStatusBadge = (status: ParsingHealthStatus) => {
    switch (status) {
      case 'operational':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Штатно (100% онлайн)
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Ограниченная актуальность
          </span>
        );
      case 'down':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Критический сбой / 404
          </span>
        );
      case 'checking':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
            Диагностика...
          </span>
        );
    }
  };

  const getErrorCodeBadge = (code: ParsingErrorCode, httpStatus: number) => {
    switch (code) {
      case 'CAPTCHA_BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Lock className="w-3 h-3" /> HTTP {httpStatus} · Блокировка капчей
          </span>
        );
      case 'NOT_FOUND_404':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <XCircle className="w-3 h-3" /> HTTP {httpStatus} · 404 не найдено
          </span>
        );
      case 'RATE_LIMIT_429':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">
            <Clock className="w-3 h-3" /> HTTP {httpStatus} · Лимит 429
          </span>
        );
      case 'SELECTOR_MUTATION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
            <SlidersHorizontal className="w-3 h-3" /> Смена селектора
          </span>
        );
      case 'GATEWAY_TIMEOUT_504':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <Server className="w-3 h-3" /> HTTP {httpStatus} · Таймаут 504
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            HTTP {httpStatus}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast Notification */}
      {actionSuccessNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Качество парсинга & Доступность маркетплейсов
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Прозрачный мониторинг точности сбора данных, защит от роботов (капчи, Cloudflare WAF) и ошибок 404
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCheckAll}
            disabled={isScanningAll}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-sm shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanningAll ? 'animate-spin' : ''}`} />
            <span>{isScanningAll ? 'Проверка маркетплейсов...' : 'Проверить все магазины'}</span>
          </button>

          <button
            onClick={handleResolveAll}
            className="px-3 py-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Снять все временные ошибки и восстановить штатный статус"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Восстановить все</span>
          </button>

          <button
            onClick={handleResetToDefault}
            className="px-2.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
            title="Сбросить состояние к стандартному демо"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Общий статус каналов</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-white">
              {summary.operational}/{summary.total}
            </span>
            <span className="text-xs text-slate-400">онлайн</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {summary.hasLimitedFreshness ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {summary.degraded + summary.down} магазин(а) ограничены
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Все источники в норме
              </span>
            )}
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Успешность сбора (24ч)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-emerald-400">
              {summary.avgSuccessRate}%
            </span>
            <span className="text-xs text-slate-400">запросов</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${summary.avgSuccessRate}%` }}
            />
          </div>
        </div>

        {/* Active Incidents */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Активные инциденты</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-black ${summary.activeIncidentsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {summary.activeIncidentsCount}
            </span>
            <span className="text-xs text-slate-400">проблем</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {summary.activeIncidentsCount > 0 
              ? 'Включен защитный fallback'
              : 'Блокировок и 404 нет'}
          </div>
        </div>

        {/* Data Freshness Indicator */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Режим синхронизации</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-white">
              {summary.hasLimitedFreshness ? 'Гибридный кэш' : 'Прямой Realtime'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {summary.hasLimitedFreshness 
              ? 'Задержка до 10 мин на Ozon'
              : 'Задержка < 30 сек'}
          </div>
        </div>
      </div>

      {/* Prominent Data Freshness Warning Banner (if any store is degraded/down) */}
      {summary.hasLimitedFreshness && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                  <span>Актуальность данных временно ограничена для части магазинов</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                    WAF Challenge / 404
                  </span>
                </h3>
                <p className="text-xs text-amber-300/80 leading-relaxed max-w-3xl">
                  Маркетплейс <strong>Ozon</strong> или другой источник временно активировал защитную капчу (SmartCaptcha / Cloudflare) или вернул 404 при прямом скрапинге. 
                  PriceRadar автоматически переключился на безопасный режим: данные обновляются через поисковое зеркало и кэш. 
                  При нажатии кнопки «Купить» вы всегда переходите на прямую страницу товара с актуальной ценой на момент перехода.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={() => handleCheckSingle('ozon')}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                Диагностика Ozon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Stores Health Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Состояние парсеров по маркетплейсам</span>
            <span className="text-xs font-normal text-slate-400">({stores.length} площадок)</span>
          </h2>
          <span className="text-xs text-slate-400">
            Опрос CDN, API мобильных приложений и HTML-микроразметки
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => {
            const hasError = store.activeIncident !== null;
            const isChecking = checkingStoreId === store.storeId || store.status === 'checking';

            return (
              <div
                key={store.storeId}
                className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                  store.status === 'down'
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-rose-950/20'
                    : store.status === 'degraded'
                    ? 'bg-amber-950/15 border-amber-500/40 shadow-amber-950/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {store.storeName}
                        </h3>
                        <a 
                          href={`https://${store.domain}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-slate-500 hover:text-slate-300 text-xs flex items-center gap-0.5"
                          title="Открыть сайт магазина"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {store.domain}
                      </span>
                    </div>

                    <div>
                      {getStatusBadge(store.status)}
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-3 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400">Отклик</div>
                      <div className="text-xs font-bold text-slate-200 mt-0.5">
                        {store.avgLatencyMs} мс
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Успешность</div>
                      <div className={`text-xs font-bold mt-0.5 ${store.successRate24h > 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {store.successRate24h}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Сверка</div>
                      <div className="text-xs font-medium text-slate-300 mt-0.5">
                        {store.lastCheckedAt}
                      </div>
                    </div>
                  </div>

                  {/* Active Incident Warning Box if exists */}
                  {store.activeIncident && (
                    <div className="rounded-xl bg-slate-950/90 border border-amber-500/30 p-3 mb-3 space-y-2">
                      <div className="flex items-center justify-between">
                        {getErrorCodeBadge(store.activeIncident.errorCode, store.activeIncident.httpStatus)}
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(store.activeIncident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-amber-200 leading-snug">
                        {store.activeIncident.errorTitle}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {store.activeIncident.message}
                      </p>
                      <div className="pt-1 border-t border-slate-800/80 text-[11px] text-amber-300/90 font-medium">
                        🛡️ {store.activeIncident.impactDescription}
                      </div>
                      <button
                        onClick={() => handleResolveIncident(store.activeIncident!.id)}
                        className="w-full mt-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Снять ошибку (проверено)</span>
                      </button>
                    </div>
                  )}

                  {/* Strategy & Freshness Details */}
                  <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                    <div className="flex items-start gap-1.5">
                      <Server className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="text-[11px]">
                        <strong>Канал сбора:</strong> {store.bypassMethod}
                      </span>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="text-[11px]">
                        <strong>Актуальность:</strong>{' '}
                        <span className={store.freshnessState === 'realtime' ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                          {store.freshnessNotice}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCheckSingle(store.storeId)}
                    disabled={isChecking}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin text-indigo-400' : ''}`} />
                    <span>{isChecking ? 'Опрос...' : 'Пинг канала'}</span>
                  </button>

                  {/* Simulator Dropdown / Trigger */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSimulate(store.storeId, 'CAPTCHA_BLOCKED')}
                      className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[10px] font-semibold transition-colors cursor-pointer"
                      title="Смоделировать появление капчи на этом магазине"
                    >
                      + Капча
                    </button>
                    <button
                      onClick={() => handleSimulate(store.storeId, 'NOT_FOUND_404')}
                      className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-semibold transition-colors cursor-pointer"
                      title="Смоделировать ошибку 404 (карточка удалена)"
                    >
                      + 404
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incident & Error Log Section */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bug className="w-4 h-4 text-rose-400" />
              <span>Журнал диагностических событий и ошибок парсинга</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              История срабатываний защит капчи, ответов 404, лимитов 429 и автоматических мер восстановления
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Всего записей: <strong className="text-white">{filteredIncidents.length}</strong>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Store Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Магазин:</span>
            <select
              value={selectedStoreFilter}
              onChange={(e) => setSelectedStoreFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
            >
              <option value="all">Все магазины</option>
              <option value="ozon">Ozon</option>
              <option value="wildberries">Wildberries</option>
              <option value="yandex">Яндекс Маркет</option>
              <option value="megamarket">Мегамаркет</option>
              <option value="aliexpress">AliExpress</option>
              <option value="dns">DNS Ритейл</option>
            </select>
          </div>

          {/* Error Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Тип ошибки:</span>
            <select
              value={selectedErrorFilter}
              onChange={(e) => setSelectedErrorFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
            >
              <option value="all">Все типы</option>
              <option value="CAPTCHA_BLOCKED">Блокировка капчей (403)</option>
              <option value="NOT_FOUND_404">404 не найдено</option>
              <option value="RATE_LIMIT_429">Лимит запросов (429)</option>
              <option value="SELECTOR_MUTATION">Смена селекторов</option>
              <option value="GATEWAY_TIMEOUT_504">Таймаут шлюза (504)</option>
            </select>
          </div>

          {/* Only Active Checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 ml-auto">
            <input
              type="checkbox"
              checked={onlyActiveIncidents}
              onChange={(e) => setOnlyActiveIncidents(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
            />
            <span>Только активные сбои</span>
          </label>
        </div>

        {/* Incidents List Table */}
        <div className="overflow-x-auto">
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-60" />
              <p className="text-sm font-medium text-slate-300">Ошибок по заданным фильтрам не обнаружено</p>
              <p className="text-xs text-slate-500">Все каналы парсинга работают стабильно</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className={`rounded-xl border p-4 transition-all ${
                    inc.resolved
                      ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-xs px-2 py-0.5 rounded bg-slate-800">
                        {inc.storeName}
                      </span>
                      {getErrorCodeBadge(inc.errorCode, inc.httpStatus)}
                      {inc.resolved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                          <CheckCircle2 className="w-3 h-3" /> Устранено
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold px-2 py-0.5 rounded bg-amber-500/10 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> Активно (влияет на актуальность)
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                      <span>{new Date(inc.timestamp).toLocaleString('ru-RU')}</span>
                      {!inc.resolved && (
                        <button
                          onClick={() => handleResolveIncident(inc.id)}
                          className="px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Решено
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="text-slate-300 font-medium">
                      {inc.message}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 text-[11px]">
                      <div className="rounded-lg bg-slate-900/80 border border-slate-800/80 p-2 text-slate-400">
                        <strong className="text-amber-300">Влияние на пользователя:</strong> {inc.impactDescription}
                      </div>
                      <div className="rounded-lg bg-slate-900/80 border border-slate-800/80 p-2 text-slate-400">
                        <strong className="text-emerald-300">Принятые меры / Fallback:</strong> {inc.recommendation}
                      </div>
                    </div>

                    {inc.affectedUrl && (
                      <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                        <span>Затронутый URL:</span>
                        <a 
                          href={inc.affectedUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-indigo-400 hover:underline truncate"
                        >
                          {inc.affectedUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Architecture & Anti-Bot Protection Explainer */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/20 p-6 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Как PriceRadar гарантирует актуальность при защите маркетплейсов от роботов
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
              Современные маркетплейсы (Ozon, Яндекс Маркет, Мегамаркет) используют динамические экраны WAF, Cloudflare Turnstile и капчи для защиты от агрессивного скрапинга. Мы разработали 4-уровневую архитектуру устойчивости:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2">
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-1">
            <div className="text-indigo-400 font-bold flex items-center gap-1.5">
              <span>1. CDN & API кэш</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-snug">
              Прямой опрос открытых CDN-нод Wildberries и JSON-ручек без генерации браузерного следа.
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-1">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span>2. Поисковый индекс</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-snug">
              При блокировке прямой карточки парсер переходит на каталог с сортировкой по мин. цене (how=aprice).
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-1">
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <span>3. Защита от 404</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-snug">
              Если товар удален продавцом, система автоматически находит точные совпадения модели у смежных продавцов.
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3.5 space-y-1">
            <div className="text-teal-400 font-bold flex items-center gap-1.5">
              <span>4. Онлайн-сверка</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-snug">
              Кнопка «Сверить цену» в карточках позволяет пользователю принудительно подтвердить свежесть цены перед покупкой.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
