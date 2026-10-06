import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Smartphone, 
  Copy, 
  Check, 
  Sparkles,
  Bot,
  MessageSquare,
  ShieldCheck,
  Flame,
  Info
} from 'lucide-react';
import { TelegramConfig, NotificationLog } from '../types';
import { formatTelegramMarkdown, sendTelegramMessage } from '../services/parserEngine';

interface TelegramSettingsPanelProps {
  telegramConfig: TelegramConfig;
  onSaveConfig: (config: TelegramConfig) => void;
  notificationLogs: NotificationLog[];
  onTriggerTestSignal: () => void;
}

export const TelegramSettingsPanel: React.FC<TelegramSettingsPanelProps> = ({
  telegramConfig,
  onSaveConfig,
  notificationLogs,
  onTriggerTestSignal,
}) => {
  const [tokenInput, setTokenInput] = useState(telegramConfig.botToken);
  const [chatIdInput, setChatIdInput] = useState(telegramConfig.chatId);
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSave = () => {
    onSaveConfig({
      ...telegramConfig,
      botToken: tokenInput.trim(),
      chatId: chatIdInput.trim(),
      isEnabled: true,
      connectedAt: new Date().toISOString()
    });
    setTestResult({ success: true, message: 'Настройки бота успешно сохранены!' });
  };

  const handleSendLiveTest = async () => {
    setIsSendingTest(true);
    setTestResult(null);

    const sampleText = formatTelegramMarkdown({
      productTitle: 'Смартфон Apple iPhone 16 128GB Black',
      marketplaceName: 'Wildberries',
      oldPrice: 86990,
      newPrice: 81990,
      dropAmount: 5000,
      dropPercent: 5.7,
      url: 'https://www.wildberries.ru/catalog/268912401/detail.aspx'
    });

    if (tokenInput.trim() && chatIdInput.trim()) {
      const res = await sendTelegramMessage(tokenInput.trim(), chatIdInput.trim(), sampleText);
      setTestResult(res);
    } else {
      // Offline/preview mode simulation
      await new Promise(r => setTimeout(r, 600));
      onTriggerTestSignal();
      setTestResult({
        success: true,
        message: 'Тестовый сигнал сформирован! (Для отправки на реальный телефон укажите Bot Token и Chat ID)'
      });
    }
    setIsSendingTest(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Send className="w-6 h-6 text-sky-400" />
          <span>Подключение Telegram-бота для сигналов</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          При любом падении цены на отслеживаемый товар сервис мгновенно отправляет уведомление в Telegram с точной суммой и процентом скидки.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration & Instructions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Config Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Параметры вашего бота</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Telegram Bot Token:
                </label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Например: 7123456789:AAFnk9sK..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Получите токен у официального бота <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-indigo-400 underline">@BotFather</a> в Telegram
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ваш Chat ID:
                </label>
                <input
                  type="text"
                  value={chatIdInput}
                  onChange={(e) => setChatIdInput(e.target.value)}
                  placeholder="Например: 123456789 или @username_канала"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Узнать свой ID можно через бота <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-indigo-400 underline">@userinfobot</a>
                </p>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  testResult.success 
                    ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-600/30"
                >
                  Сохранить настройки
                </button>

                <button
                  type="button"
                  onClick={handleSendLiveTest}
                  disabled={isSendingTest}
                  className="px-4 py-2 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingTest ? 'Отправляем...' : 'Отправить тестовый сигнал'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Setup Guide */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-400" />
              <span>Пошаговая инструкция (занимает 1 минуту)</span>
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-[11px] shrink-0">
                  1
                </span>
                <div>
                  Откройте Telegram и найдите официального бота <strong>@BotFather</strong>. Отправьте команду:
                  <div className="flex items-center gap-2 mt-1">
                    <code className="px-2 py-0.5 rounded bg-slate-950 text-indigo-300 font-mono text-[11px]">/newbot</code>
                    <button 
                      onClick={() => copyToClipboard('/newbot', 'step1')}
                      className="text-slate-400 hover:text-white"
                      title="Скопировать"
                    >
                      {copiedStep === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-[11px] shrink-0">
                  2
                </span>
                <div>
                  Укажите имя и username бота (например, <em>MyPriceRadar_bot</em>). BotFather пришлет <strong>HTTP API Token</strong>. Вставьте его в поле выше.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-[11px] shrink-0">
                  3
                </span>
                <div>
                  Зайдите в вашего созданного бота и нажмите кнопку <strong>«Запустить» (/start)</strong>.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-[11px] shrink-0">
                  4
                </span>
                <div>
                  Узнайте свой Chat ID через <strong>@userinfobot</strong> и вставьте его выше. Нажмите <em>«Отправить тестовый сигнал»</em>.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Smartphone Simulator */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm">
            <div className="text-center mb-3">
              <span className="text-xs font-semibold text-slate-400 flex items-center justify-center gap-1.5">
                <Smartphone className="w-4 h-4 text-slate-400" />
                <span>Интерактивный предпросмотр сообщения</span>
              </span>
            </div>

            {/* Smartphone Mockup */}
            <div className="bg-slate-900 border-4 border-slate-700 rounded-[36px] p-3 shadow-2xl shadow-black relative overflow-hidden">
              {/* Speaker notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-3" />

              {/* Telegram App Header */}
              <div className="bg-slate-800/90 rounded-t-2xl px-3 py-2 flex items-center justify-between border-b border-slate-700/60 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    PR
                  </div>
                  <div>
                    <div className="font-semibold text-white text-[12px] leading-tight">PriceRadar Bot</div>
                    <div className="text-[10px] text-sky-400">бот · bot</div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">12:45</span>
              </div>

              {/* Telegram Chat Area */}
              <div className="bg-slate-950 p-3 min-h-[360px] rounded-b-2xl flex flex-col justify-end space-y-3">
                {/* Incoming Message Bubble */}
                <div className="bg-slate-800/95 border border-slate-700/80 rounded-2xl p-3.5 text-xs text-slate-200 shadow-md max-w-[95%]">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[12px] mb-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>СИГНАЛ: Снижение цены на Wildberries!</span>
                  </div>

                  <div className="space-y-1 mb-2.5 text-[11px] leading-relaxed">
                    <div>
                      <span className="text-slate-400">📦 Товар: </span>
                      <strong className="text-white">Apple iPhone 16 128GB Black</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">💰 Было: </span>
                      <span className="line-through text-slate-400 font-mono">86 990 ₽</span>
                      <span className="text-slate-400"> ➔ Стало: </span>
                      <strong className="text-emerald-400 font-mono">81 990 ₽</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">📉 Экономия: </span>
                      <strong className="text-emerald-400 font-mono">-5 000 ₽ (-5.7%)</strong>
                    </div>
                  </div>

                  {/* Telegram Inline Button */}
                  <div className="pt-2 border-t border-slate-700/60">
                    <div className="w-full py-1.5 px-3 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-sky-300 font-semibold text-[11px] text-center flex items-center justify-center gap-1.5">
                      <span>Купить по минимальной цене</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-400 text-right mt-1.5 font-mono">
                    12:45 · доставлено ✓✓
                  </div>
                </div>
              </div>

              {/* Home indicator bar */}
              <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Logs of Sent Signals */}
      <div className="mt-12 pt-8 border-t border-slate-800">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span>История отправленных сигналов</span>
        </h2>

        {notificationLogs.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 text-center text-xs text-slate-400">
            Здесь будет отображаться история всех отправленных в Telegram сигналов при падении цен.
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800/80 text-xs">
            {notificationLogs.map((log) => (
              <div key={log.id} className="p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{log.productTitle}</div>
                    <div className="text-[11px] text-slate-400">
                      Площадка: <span className="text-slate-300">{log.marketplace.toUpperCase()}</span> · Падение на: <span className="text-emerald-400 font-mono font-medium">-{log.dropAmount.toLocaleString('ru-RU')} ₽ (-{log.dropPercent.toFixed(1)}%)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px]">
                  <span className="font-mono text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString('ru-RU')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    log.status === 'sent' 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {log.status === 'sent' ? 'Доставлено' : 'Тест / Симуляция'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
