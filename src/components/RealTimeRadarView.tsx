import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  Play, 
  Pause, 
  RefreshCw, 
  Flame, 
  Bell, 
  Send, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sliders, 
  ShieldCheck, 
  Zap, 
  Store, 
  Award, 
  Trash2, 
  Radio, 
  TrendingDown,
  Check,
  Info
} from 'lucide-react';
import { 
  RadarConfig, 
  RealtimeAlertEvent, 
  TelegramConfig, 
  CustomProductWatch 
} from '../types';
import { 
  realtimeMonitor, 
  DEFAULT_RADAR_CONFIG 
} from '../services/realtimeMonitorService';
import { soundService } from '../services/soundNotificationService';
import { getTelegramConfig, sendTestTelegramAlert } from '../services/telegramService';
import { getCustomWatches } from '../services/multiStoreWatcher';
import { MARKETPLACE_CONFIGS } from '../data/mockCatalog';

interface RealTimeRadarViewProps {
  onOpenTelegramSettings: () => void;
  onNavigateToWatches: () => void;
}

export const RealTimeRadarView: React.FC<RealTimeRadarViewProps> = ({
  onOpenTelegramSettings,
  onNavigateToWatches
}) => {
  const [config, setConfig] = useState<RadarConfig>(realtimeMonitor.getConfig());
  const [alerts, setAlerts] = useState<RealtimeAlertEvent[]>(realtimeMonitor.getAlerts());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(config.intervalSeconds);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [desktopPermission, setDesktopPermission] = useState<NotificationPermission>(soundService.getNotificationPermission());
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(getTelegramConfig());
  const [watches, setWatches] = useState<CustomProductWatch[]>(getCustomWatches());
  const [selectedSimulateWatchId, setSelectedSimulateWatchId] = useState<string>(watches[0]?.id || '');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'alert' } | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyNotice, setVerifyNotice] = useState<{ id: string; text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Subscribe to monitor ticks and incoming alerts
  useEffect(() => {
    const unsubTick = realtimeMonitor.onTick((secs, scanning) => {
      setSecondsRemaining(secs);
      setIsScanning(scanning);
    });

    const unsubAlert = realtimeMonitor.onAlert((newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
      setFeedbackMessage({
        text: `⚡ Зафиксирована новая скидка: -${newAlert.dropPercent}% на ${newAlert.storeName}!`,
        type: 'success'
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    });

    return () => {
      unsubTick();
      unsubAlert();
    };
  }, []);

  const showNotification = (text: string, type: 'success' | 'alert' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleToggleRadar = () => {
    const nextState = !config.isEnabled;
    const nextConfig = { ...config, isEnabled: nextState };
    setConfig(nextConfig);
    realtimeMonitor.saveConfig(nextConfig);
    if (nextState) {
      showNotification('Автоматический радар запущен! Сканирование каждые ' + config.intervalSeconds + ' сек.');
    } else {
      showNotification('Автоматический радар приостановлен', 'alert');
    }
  };

  const handleUpdateConfig = (updates: Partial<RadarConfig>) => {
    const nextConfig = { ...config, ...updates };
    setConfig(nextConfig);
    realtimeMonitor.saveConfig(nextConfig);
  };

  const handleTriggerSimulatedDrop = async () => {
    setIsScanning(true);
    const alert = await realtimeMonitor.triggerSimulatedMarketDrop(selectedSimulateWatchId);
    setIsScanning(false);
    if (alert) {
      showNotification(`🔥 Сигнал успешно сформирован и отправлен по активным каналам!`);
    } else {
      showNotification('Не удалось смоделировать скидку: добавьте ссылки в отслеживание', 'alert');
    }
  };

  const handleVerifyPrice = async (alertId: string) => {
    setVerifyingId(alertId);
    try {
      const res = await realtimeMonitor.verifyAndSyncAlertPrice(alertId);
      if (res) {
        setAlerts(realtimeMonitor.getAlerts());
        if (res.hasPriceChanged) {
          setVerifyNotice({
            id: alertId,
            type: 'info',
            text: `Актуальная цена на сайте сейчас: ${res.currentSitePrice.toLocaleString('ru-RU')} ₽ (продавец обновил стоимость на маркетплейсе).`
          });
        } else {
          setVerifyNotice({
            id: alertId,
            type: 'success',
            text: `Цена проверена и подтверждена на сайте: ${res.currentSitePrice.toLocaleString('ru-RU')} ₽!`
          });
        }
      } else {
        setVerifyNotice({
          id: alertId,
          type: 'warning',
          text: `Не удалось автоматически извлечь цену с сайта. Нажмите «Купить» для прямого перехода.`
        });
      }
    } catch (e) {
      setVerifyNotice({
        id: alertId,
        type: 'warning',
        text: `Ошибка соединения при проверке цены.`
      });
    } finally {
      setVerifyingId(null);
      setTimeout(() => setVerifyNotice(null), 6000);
    }
  };

  const handleManualScanNow = async () => {
    setIsScanning(true);
    const result = await realtimeMonitor.scanNow();
    setIsScanning(false);
    if (result.dropsFound > 0) {
      showNotification(`Сканирование завершено: зафиксировано ${result.dropsFound} новых скидок!`);
    } else {
      showNotification(`Проверено ссылок: ${result.totalChecked}. Изменений цен не обнаружено.`);
    }
  };

  const handleRequestPushPermission = async () => {
    const permission = await soundService.requestNotificationPermission();
    setDesktopPermission(permission);
    if (permission === 'granted') {
      soundService.sendDesktopNotification('✅ Push-уведомления подключены!', {
        body: 'Теперь вы будете первыми узнавать о скидках в реальном времени.'
      });
      handleUpdateConfig({ notifyDesktopPush: true });
      showNotification('Браузерные уведомления успешно активированы!');
    } else {
      showNotification('Уведомления отклонены в настройках браузера', 'alert');
    }
  };

  const handleTestSound = () => {
    soundService.playPriceDropChime();
    showNotification('Звуковой колокольчик скидки воспроизведен');
  };

  const handleClearAlerts = () => {
    realtimeMonitor.clearAlerts();
    setAlerts([]);
    showNotification('История сигналов очищена');
  };

  const totalMonitoredLinks = watches.reduce((sum, w) => sum + (w.links?.length || 0), 0);

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md transition-all ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 shadow-emerald-900/30' 
            : 'bg-rose-950/90 text-rose-300 border-rose-500/40 shadow-rose-900/30'
        }`}>
          {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-semibold">{feedbackMessage.text}</span>
        </div>
      )}

      {/* Main Realtime Radar Control Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Animated Radar Eye and Title */}
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-950/90 border border-indigo-500/30 flex items-center justify-center overflow-hidden shadow-inner shadow-indigo-950">
              {/* Radar concentric rings */}
              <div className="absolute inset-2 border border-indigo-500/20 rounded-full" />
              <div className="absolute inset-5 border border-indigo-500/30 rounded-full" />
              <div className="absolute inset-8 border border-indigo-500/40 rounded-full" />
              
              {/* Rotating radar beam when active */}
              {config.isEnabled && (
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/30 via-transparent to-transparent rounded-full animate-spin [animation-duration:3s]" />
              )}
              
              {/* Center icon */}
              <Radar className={`w-10 h-10 relative z-10 transition-colors ${
                config.isEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
              }`} />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  config.isEnabled 
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${config.isEnabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  {config.isEnabled ? 'Радар активен (Real-Time)' : 'Радар на паузе'}
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  SSE v1.2 Stream
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mt-1.5 tracking-tight flex items-center gap-2">
                Авто-уведомления о скидках
                <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                Непрерывный мониторинг цен по вашим ссылкам на 5 маркетплейсах. При падении цены сигнал мгновенно поступает в Telegram, браузер и сопровождается звуковым колокольчиком.
              </p>
            </div>
          </div>

          {/* Right: Master Switch and Scan Now Button */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            <button
              onClick={handleToggleRadar}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all cursor-pointer ${
                config.isEnabled
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-amber-900/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 hover:scale-105'
              }`}
            >
              {config.isEnabled ? (
                <>
                  <Pause className="w-4 h-4" />
                  Приостановить радар
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Включить авто-радар
                </>
              )}
            </button>

            <button
              onClick={handleManualScanNow}
              disabled={isScanning}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-900/30 transition-all hover:scale-105 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Сканирование...' : 'Сканировать сейчас'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Status Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              До следующего скана
            </div>
            <div className="text-xl font-extrabold text-white mt-1 font-mono flex items-baseline gap-1">
              {config.isEnabled ? (
                <>
                  <span>{secondsRemaining}</span>
                  <span className="text-xs font-normal text-slate-400">сек</span>
                </>
              ) : (
                <span className="text-slate-500 text-sm">Пауза</span>
              )}
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-teal-400" />
              Отслеживаемых ссылок
            </div>
            <div className="text-xl font-extrabold text-teal-400 mt-1 font-mono">
              {totalMonitoredLinks}
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Поймано сигналов
            </div>
            <div className="text-xl font-extrabold text-rose-400 mt-1 font-mono">
              {alerts.length}
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              Интервал опроса
            </div>
            <div className="text-xl font-extrabold text-emerald-400 mt-1 font-mono">
              {config.intervalSeconds}с
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 1. Delivery Channels, 2. Threshold Trigger Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Multi-Channel Dispatch Config */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Каналы доставки сигналов</h3>
                <p className="text-xs text-slate-400">Куда мгновенно отправлять информацию о скидке</p>
              </div>
            </div>
          </div>

          {/* Telegram Channel Item */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  TG
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Telegram-бот</span>
                    {telegramConfig.botToken && telegramConfig.chatId ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Подключен
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">
                        Не настроен
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Мгновенное сообщение со сравнением цен и прямой ссылкой
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenTelegramSettings}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Настроить
                </button>
                <input
                  type="checkbox"
                  checked={config.notifyTelegram}
                  onChange={(e) => handleUpdateConfig({ notifyTelegram: e.target.checked })}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Browser Desktop Push Item */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Desktop Push (Браузер)</span>
                    {desktopPermission === 'granted' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                        Разрешено
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-semibold">
                        {desktopPermission === 'denied' ? 'Заблокировано' : 'Ожидает согласия'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Всплывающее окно в углу экрана даже если вкладка свернута
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {desktopPermission !== 'granted' ? (
                  <button
                    onClick={handleRequestPushPermission}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                  >
                    Разрешить
                  </button>
                ) : (
                  <input
                    type="checkbox"
                    checked={config.notifyDesktopPush}
                    onChange={(e) => handleUpdateConfig({ notifyDesktopPush: e.target.checked })}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Real-time Sound Chime Item */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  {config.notifySound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-sm font-bold text-white">Звуковой сигнал (Chime)</span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Чистый двухтональный синтезированный колокольчик падения цены
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestSound}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                >
                  Тест звука
                </button>
                <input
                  type="checkbox"
                  checked={config.notifySound}
                  onChange={(e) => {
                    handleUpdateConfig({ notifySound: e.target.checked });
                    soundService.setSoundEnabled(e.target.checked);
                  }}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* In-App Floating Banner */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white">Всплывающий баннер в приложении</span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Анимированный баннер в нижнем правом углу с кнопкой перехода в магазин
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={config.notifyInApp}
                onChange={(e) => handleUpdateConfig({ notifyInApp: e.target.checked })}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Rules & Interval Controls */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Правила срабатывания сигналов</h3>
              <p className="text-xs text-slate-400">Точная фильтрация для исключения лишнего спама</p>
            </div>
          </div>

          {/* Interval Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Частота опроса маркетплейсов
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { sec: 15, label: '15 сек', tag: 'Flash' },
                { sec: 30, label: '30 сек', tag: 'Turbo' },
                { sec: 60, label: '1 мин', tag: 'Fast' },
                { sec: 300, label: '5 мин', tag: 'Standard' }
              ].map(opt => (
                <button
                  key={opt.sec}
                  onClick={() => handleUpdateConfig({ intervalSeconds: opt.sec })}
                  className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                    config.intervalSeconds === opt.sec
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-900/40 font-bold'
                      : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs">{opt.label}</div>
                  <div className="text-[10px] opacity-75 font-mono">{opt.tag}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Min drop percent threshold */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex justify-between items-center mb-2">
              <span>Минимальная величина скидки:</span>
              <span className="text-indigo-400 font-mono text-sm">
                {config.minDropPercent === 0 ? 'Любое снижение' : `от ${config.minDropPercent}%`}
              </span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[0, 3, 5, 10, 20].map(pct => (
                <button
                  key={pct}
                  onClick={() => handleUpdateConfig({ minDropPercent: pct })}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    config.minDropPercent === pct
                      ? 'bg-teal-600 text-white border-teal-500'
                      : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {pct === 0 ? 'Все' : `≥ ${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Filters */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            {/* Filter: Only Lowest Among All */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={config.alertOnlyIfLowestAcrossAll}
                onChange={(e) => handleUpdateConfig({ alertOnlyIfLowestAcrossAll: e.target.checked })}
                className="mt-1 w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
              />
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  🏆 Сигнализировать только если магазин стал дешевле ВСЕХ остальных
                </span>
                <span className="text-[11px] text-slate-400">
                  Игнорирует скидки в магазинах, если в другом магазине тот же товар все еще дешевле.
                </span>
              </div>
            </label>

            {/* Filter: Target Price Only */}
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={config.alertOnTargetOnly}
                onChange={(e) => handleUpdateConfig({ alertOnTargetOnly: e.target.checked })}
                className="mt-1 w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
              />
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  🎯 Только при достижении моей целевой цены (Target Price)
                </span>
                <span className="text-[11px] text-slate-400">
                  Уведомлять исключительно тогда, когда цена опустилась ниже заданного вами порога.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Interactive Simulation / Test Suite */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-500/30 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Тестирование Real-Time оповещений
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
                  Sandbox
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Смоделируйте рыночное падение цен прямо сейчас, чтобы протестировать реакцию Telegram, браузерных пушей и звука.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {watches.length > 0 && (
              <select
                value={selectedSimulateWatchId}
                onChange={(e) => setSelectedSimulateWatchId(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2.5 font-medium max-w-[220px] focus:outline-none focus:border-indigo-500"
              >
                {watches.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.title.substring(0, 32)}...
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleTriggerSimulatedDrop}
              disabled={isScanning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Смоделировать падение цены</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Event Stream (Поток сигналов в реальном времени) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Лента пойманных скидок в реальном времени
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {alerts.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Хронологический поток всех зафиксированных ценовых просадок с прямой проверкой актуальности
              </p>
            </div>
          </div>

          {alerts.length > 0 && (
            <button
              onClick={handleClearAlerts}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Очистить историю</span>
            </button>
          )}
        </div>

        {/* Информационный блок гарантии и сверки цен */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/20 text-xs text-slate-300 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5 flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="font-bold text-white">Актуальность цен в онлайн-магазинах:</span>
            <p className="text-slate-400 leading-relaxed">
              Цены на маркетплейсах меняются динамически продавцами в зависимости от акций и персональных скидок. Ссылка «Купить» открывает предложения с фильтром минимальной стоимости. Нажмите <b>«Сверить цену»</b> для мгновенного онлайн-запроса актуальной стоимости из магазина прямо сейчас.
            </p>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-slate-950/50 border border-dashed border-slate-800">
            <Radar className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-300">Радар сканирует рынок</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Как только в одном из подключенных магазинов снизится цена, событие моментально появится в этом списке.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((al) => {
              const mktColor = (al.marketplace !== 'other' && MARKETPLACE_CONFIGS[al.marketplace as keyof typeof MARKETPLACE_CONFIGS]?.color) || '#6366f1';
              const isVerifying = verifyingId === al.id;
              const hasNotice = verifyNotice && verifyNotice.id === al.id;

              return (
                <div
                  key={al.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 p-1 flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                        <img
                          src={al.imageUrl}
                          alt={al.productTitle}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="absolute bottom-0 right-0 bg-rose-600 text-[9px] font-black text-white px-1 py-0.2 rounded-tl">
                          -{al.dropPercent}%
                        </span>
                      </div>

                      {/* Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span 
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm"
                            style={{ backgroundColor: mktColor }}
                          >
                            {al.storeName}
                          </span>
                          {al.isLowestAcrossAll && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                              <Award className="w-3 h-3" />
                              Лучшая цена на рынке
                            </span>
                          )}
                          {al.targetPriceReached && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              Цель достигнута
                            </span>
                          )}
                          {al.isSimulation && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              ⚡ Симуляция (тест)
                            </span>
                          )}
                          <span className="inline-flex items-center text-[10px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                            {al.isDirectLink ? '🛍️ Прямой товар' : '🔍 Каталог с лучшей ценой'}
                          </span>
                          {al.verifiedPrice && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              ✓ Проверено на сайте: {al.verifiedPrice.toLocaleString('ru-RU')} ₽
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500 font-mono">
                            {new Date(al.timestamp).toLocaleTimeString('ru-RU')}
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-slate-100 truncate mt-1">
                          {al.productTitle}
                        </h4>

                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="text-slate-500">Доставлено в:</span>
                          {al.notifiedChannels.telegram && <span className="text-sky-400">Telegram</span>}
                          {al.notifiedChannels.desktopPush && <span className="text-indigo-400">Push</span>}
                          {al.notifiedChannels.audio && <span className="text-emerald-400">Звук</span>}
                        </div>
                      </div>
                    </div>

                    {/* Right side: Prices and Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 flex-shrink-0">
                      <div className="text-left sm:text-right">
                        <div className="flex items-baseline gap-1.5 sm:justify-end">
                          <span className="text-lg font-black text-emerald-400">
                            {al.newPrice.toLocaleString('ru-RU')} ₽
                          </span>
                          <span className="text-xs text-slate-500 line-through">
                            {al.oldPrice.toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-500">
                          Экономия {al.dropAmount.toLocaleString('ru-RU')} ₽ (-{al.dropPercent}%)
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Кнопка сверки цены с сайтом */}
                        <button
                          onClick={() => handleVerifyPrice(al.id)}
                          disabled={isVerifying}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs border border-slate-700/80 transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
                          title="Запросить текущую цену с сайта магазина прямо сейчас"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-emerald-400' : ''}`} />
                          <span>{isVerifying ? 'Сверка...' : 'Сверить цену'}</span>
                        </button>

                        {/* Кнопка перехода в магазин */}
                        <a
                          href={al.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition-all hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
                          title="Открыть страницу магазина с лучшей ценой"
                        >
                          <span>Купить</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Плашка результата сверки цены */}
                  {hasNotice && (
                    <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2.5 ${
                      verifyNotice.type === 'success' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                      verifyNotice.type === 'info' ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30' :
                      'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      <Info className="w-4 h-4 flex-shrink-0" />
                      <span>{verifyNotice.text}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
