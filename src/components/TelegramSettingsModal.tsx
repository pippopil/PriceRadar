import React, { useState } from 'react';
import { 
  Send, 
  X, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  ExternalLink, 
  ShieldCheck, 
  Bell, 
  Loader2, 
  Sparkles,
  Bot
} from 'lucide-react';
import { TelegramConfig } from '../types';
import { 
  getTelegramConfig, 
  saveTelegramConfig, 
  sendTestTelegramAlert 
} from '../services/telegramService';

interface TelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (config: TelegramConfig) => void;
}

export const TelegramSettingsModal: React.FC<TelegramSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [config, setConfig] = useState<TelegramConfig>(getTelegramConfig());
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showInstructions, setShowInstructions] = useState(!config.botToken);

  if (!isOpen) return null;

  const handleSave = () => {
    saveTelegramConfig(config);
    if (onSaved) onSaved(config);
    onClose();
  };

  const handleTest = async () => {
    if (!config.botToken.trim() || !config.chatId.trim()) {
      setTestResult({
        success: false,
        message: 'Пожалуйста, заполните токен бота и Chat ID'
      });
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    const res = await sendTestTelegramAlert(config);
    setIsSendingTest(false);

    if (res.success) {
      const updatedConfig = { ...config, isEnabled: true, connectedAt: new Date().toISOString() };
      setConfig(updatedConfig);
      saveTelegramConfig(updatedConfig);
      if (onSaved) onSaved(updatedConfig);
      setTestResult({
        success: true,
        message: 'Тестовый сигнал успешно доставлен в ваш Telegram! Проверьте чат с ботом.'
      });
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Ошибка при отправке сообщения. Проверьте правильность токена и Chat ID.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl relative text-left my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Подключение Telegram Бота</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Мгновенные сигналы
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Сигнал приходит, когда цена в одном магазине проседает ниже всех остальных
            </p>
          </div>
        </div>

        {/* Instructions toggle */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showInstructions ? 'Скрыть инструкцию по созданию бота' : 'Как бесплатно создать бота за 30 секунд?'}</span>
          </button>

          {showInstructions && (
            <div className="mt-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2.5">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <div>
                  Откройте официального бота <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-semibold">@BotFather</a> в Telegram, отправьте команду <code>/newbot</code>, задайте имя и скопируйте полученный <strong>HTTP API Token</strong>.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <div>
                  Нажмите <strong>«Start» / «Запустить»</strong> в вашем созданном боте (иначе бот не сможет писать вам первым).
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <div>
                  Узнайте свой цифровой <strong>Chat ID</strong> через бота <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-semibold">@userinfobot</a> (он сразу напишет ваш <code>Id</code>, например <code>123456789</code>).
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              HTTP API Token бота (@BotFather):
            </label>
            <input
              type="text"
              value={config.botToken}
              onChange={(e) => setConfig({ ...config, botToken: e.target.value.trim() })}
              placeholder="Например: 7891234567:AAFl-k2jQW5x..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ваш Chat ID (или ID канала):
            </label>
            <input
              type="text"
              value={config.chatId}
              onChange={(e) => setConfig({ ...config, chatId: e.target.value.trim() })}
              placeholder="Например: 987654321"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Trigger Condition Setting */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.alertOnlyIfLowestAcrossAll !== false}
                onChange={(e) => setConfig({ ...config, alertOnlyIfLowestAcrossAll: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-sky-600 focus:ring-sky-500 mt-0.5"
              />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Присылать сигнал ТОЛЬКО если цена ниже, чем во ВСЕХ остальных магазинах
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Если в Ozon цена упала, но на WB или AliExpress всё равно дешевле — спам не отправляется. Вы получаете сигнал только об абсолютном рекордном минимуме!
                </span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none pt-2 border-t border-slate-800/80">
              <input
                type="checkbox"
                checked={config.isEnabled}
                onChange={(e) => setConfig({ ...config, isEnabled: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-xs font-medium text-slate-300">
                Включить фоновые уведомления Telegram
              </span>
            </label>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div className={`p-3 rounded-xl mb-4 text-xs flex items-start gap-2.5 ${
            testResult.success 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}>
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{testResult.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={isSendingTest || !config.botToken || !config.chatId}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:bg-slate-950 disabled:text-slate-600 text-sky-400 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isSendingTest ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Отправка теста...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Отправить тестовый сигнал</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors shadow-md shadow-sky-600/30 cursor-pointer"
            >
              Сохранить настройки
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
