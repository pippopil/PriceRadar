import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, ExternalLink, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'banner' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'header' ? (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/30 cursor-pointer ${className}`}
          title="Установить приложение на телефон (PWA / APK)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Установить на телефон</span>
          <span className="sm:hidden">Приложение</span>
        </button>
      ) : (
        <div className={`p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Мобильное приложение PriceRadar</div>
              <div className="text-[11px] text-slate-400">Мониторинг цен без браузера прямо с домашнего экрана телефона</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Установить</span>
          </button>
        </div>
      )}

      {/* Mobile App & APK Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Приложение PriceRadar для телефона</h3>
                <p className="text-xs text-slate-400">Установка на Android и iPhone или сборка APK</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 mb-4 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('pwa')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'pwa'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                1-Клик Установка (PWA на Android & iOS)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('apk')}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'apk'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Сборка файла .APK (Android)
              </button>
            </div>

            {activeTab === 'pwa' ? (
              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800">
                  <div className="font-semibold text-white mb-1.5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-bold">1</span>
                    <span>Android (Google Chrome, Яндекс Браузер, Samsung Internet):</span>
                  </div>
                  <p className="text-slate-400 pl-7 leading-relaxed">
                    Нажмите меню браузера <strong className="text-white">⋮ (три точки)</strong> в правом верхнем углу и выберите <strong className="text-emerald-400">«Установить приложение»</strong> или <strong className="text-emerald-400">«Добавить на главный экран»</strong>. Приложение установится как автономная мобильная программа с иконкой и без рамок браузера!
                  </p>
                </div>

                <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800">
                  <div className="font-semibold text-white mb-1.5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[11px] font-bold">2</span>
                    <span>iPhone / iPad (Safari):</span>
                  </div>
                  <p className="text-slate-400 pl-7 leading-relaxed">
                    Нажмите кнопку <strong className="text-white">«Поделиться» (иконка квадрата со стрелкой вверх)</strong> в нижней панели Safari и выберите пункт <strong className="text-indigo-400">«На экран "Домой"»</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Работает офлайн, сохраняет данные, не требует места на диске и Google Play!</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-2">
                  <div className="font-semibold text-white mb-1">
                    Генерация автономного APK для Android (RuStore / Google Play / Direct APK):
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    PriceRadar полностью соответствует спецификации PWA / TWA (Trusted Web Activity). Вы можете сгенерировать готовый <code className="text-amber-300">.apk</code> файл за 1 минуту:
                  </p>

                  <div className="bg-black/60 rounded-lg p-2.5 font-mono text-[11px] text-emerald-300 border border-slate-800">
                    npx @bubblewrap/cli init --manifest=https://[YOUR_URL]/manifest.webmanifest<br />
                    npx @bubblewrap/cli build
                  </div>

                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Или через онлайн-генератор: перейдите на <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline hover:text-sky-300">PWABuilder.com</a>, вставьте URL приложения и нажмите <strong>«Package for Android (.apk)»</strong>.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
};
