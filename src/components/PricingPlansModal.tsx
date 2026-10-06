import React from 'react';
import { 
  Check, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Zap, 
  BellRing, 
  Clock, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { PlanId } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/planConfigs';

interface PricingPlansModalProps {
  currentPlan: PlanId;
  onSelectPlan: (planId: PlanId) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const PricingPlansModal: React.FC<PricingPlansModalProps> = ({
  currentPlan,
  onSelectPlan,
  onClose,
  isModal = true,
}) => {
  const plans = Object.values(SUBSCRIPTION_PLANS);

  const content = (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Прозрачные тарифы без скрытых платежей</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Тарифные планы PriceRadar РФ
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Выберите подходящее количество отслеживаемых товаров и частоту опроса маркетплейсов.
        </p>
      </div>

      {/* Grid of 3 Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.id;
          const isFeatured = p.id === 'standard';

          return (
            <div
              key={p.id}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                isFeatured
                  ? 'bg-slate-900 border-2 border-indigo-500 shadow-xl shadow-indigo-500/10'
                  : 'bg-slate-900/70 border border-slate-800'
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  Хит продаж
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  {isCurrent && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Активен
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mb-4 min-h-[36px]">
                  {p.description}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">
                      {p.price.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/{p.billingPeriod}</span>
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-3 mb-6 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Лимит товаров: <strong className="text-white font-bold">{p.maxTracks} {p.maxTracks === 1 ? 'товар' : p.maxTracks === 5 ? 'товаров' : 'товаров'}</strong>
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>
                      Опрос цен: <strong className="text-white">{p.checkInterval}</strong>
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <BellRing className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Сигналы в Telegram-бот</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${p.hasPersonalDiscounts ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className={p.hasPersonalDiscounts ? 'text-slate-200' : 'text-slate-500 line-through'}>
                      Персональные скидки (СПП / Ozon)
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Zap className={`w-4 h-4 shrink-0 mt-0.5 ${p.hasPriorityScraping ? 'text-indigo-400' : 'text-slate-600'}`} />
                    <span className={p.hasPriorityScraping ? 'text-slate-200' : 'text-slate-500 line-through'}>
                      Приоритетный парсер без задержек
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Layers className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>История цен: {p.historyDays} дней</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  onSelectPlan(p.id);
                  if (onClose) onClose();
                }}
                disabled={isCurrent}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-default ${
                  isCurrent
                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                    : isFeatured
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {isCurrent ? (
                  <span>Ваш текущий тариф</span>
                ) : (
                  <>
                    <span>Перейти на {p.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (!isModal) {
    return <div className="py-8 px-4 sm:px-6">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {content}
      </div>
    </div>
  );
};
