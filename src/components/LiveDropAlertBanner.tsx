import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  X, 
  ExternalLink, 
  Bell, 
  Send, 
  Volume2, 
  CheckCircle2, 
  TrendingDown, 
  Award,
  Sparkles
} from 'lucide-react';
import { RealtimeAlertEvent } from '../types';

interface LiveDropAlertBannerProps {
  alert: RealtimeAlertEvent | null;
  onDismiss: () => void;
  onOpenStore?: (url: string) => void;
}

export const LiveDropAlertBanner: React.FC<LiveDropAlertBannerProps> = ({
  alert,
  onDismiss,
  onOpenStore
}) => {
  if (!alert) return null;

  const handleAction = () => {
    if (onOpenStore) {
      onOpenStore(alert.url);
    } else {
      window.open(alert.url, '_blank');
    }
    onDismiss();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] pointer-events-auto"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-emerald-500/40 p-4 shadow-2xl shadow-emerald-500/20 backdrop-blur-xl">
          {/* Subtle radar glowing line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 animate-pulse" />

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Закрыть уведомление"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Flame className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
              Скидка в реальном времени!
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {new Date(alert.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          {/* Body */}
          <div className="flex gap-3 items-center">
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl bg-slate-800/80 border border-slate-700/60 p-1 flex-shrink-0 relative overflow-hidden flex items-center justify-center">
              <img
                src={alert.imageUrl}
                alt={alert.productTitle}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute -bottom-1 -right-1 bg-rose-600 text-[10px] font-black text-white px-1.5 py-0.2 rounded-md shadow">
                -{alert.dropPercent}%
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pr-6">
              <h4 className="text-xs font-semibold text-slate-100 line-clamp-1">
                {alert.productTitle}
              </h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-slate-300 font-medium">
                  {alert.storeName}
                </span>
                {alert.isLowestAcrossAll && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/20">
                    <Award className="w-2.5 h-2.5" />
                    Лучшая цена!
                  </span>
                )}
                {alert.isSimulation && (
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.2 rounded">
                    Тест
                  </span>
                )}
              </div>

              {/* Price comparison */}
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base font-extrabold text-emerald-400">
                  {alert.newPrice.toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-xs text-slate-400 line-through">
                  {alert.oldPrice.toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-xs font-semibold text-emerald-500">
                  (-{alert.dropAmount.toLocaleString('ru-RU')} ₽)
                </span>
              </div>
            </div>
          </div>

          {/* Delivery channels info */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[10px]">Доставлено:</span>
              {alert.notifiedChannels.telegram && (
                <span className="flex items-center gap-1 text-sky-400" title="Отправлено в Telegram">
                  <Send className="w-3 h-3" /> TG
                </span>
              )}
              {alert.notifiedChannels.desktopPush && (
                <span className="flex items-center gap-1 text-indigo-400" title="Отправлено в Desktop Push">
                  <Bell className="w-3 h-3" /> Push
                </span>
              )}
              {alert.notifiedChannels.audio && (
                <span className="flex items-center gap-1 text-emerald-400" title="Звуковой сигнал прозвучал">
                  <Volume2 className="w-3 h-3" /> Звук
                </span>
              )}
            </div>

            {/* Action button */}
            <div className="flex flex-col items-end">
              <button
                onClick={handleAction}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Перейти в магазин с сортировкой по возрастанию цены"
              >
                <span>Купить</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <span className="text-[9px] text-slate-500 mt-0.5">
                {alert.isDirectLink ? 'Товар продавца' : 'Каталог с мин. ценой'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
