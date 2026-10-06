import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Cpu, 
  Sparkles, 
  EyeOff, 
  RotateCw, 
  SlidersHorizontal,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { MarketplaceAccount, MarketplaceId } from '../types';
import { MARKETPLACE_CONFIGS } from '../data/mockCatalog';
import { getSecurityAudit } from '../services/vaultService';

interface AccountsVaultPanelProps {
  accounts: MarketplaceAccount[];
  onUpdateAccount: (updated: MarketplaceAccount) => void;
  onConnectAccount: (marketplace: MarketplaceId, discountPercent: number, identifier: string) => void;
  onDisconnectAccount: (marketplace: MarketplaceId) => void;
}

export const AccountsVaultPanel: React.FC<AccountsVaultPanelProps> = ({
  accounts,
  onUpdateAccount,
  onConnectAccount,
  onDisconnectAccount,
}) => {
  const [selectedMarketplace, setSelectedMarketplace] = useState<MarketplaceId | null>(null);
  const [editPercent, setEditPercent] = useState<number>(10);
  const [editPhone, setEditPhone] = useState<string>('+7 (916) •••-••-••');
  const [authMethod, setAuthMethod] = useState<'extension_bridge' | 'token_vault'>('extension_bridge');
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);

  const securityAudit = getSecurityAudit();

  const handleOpenModal = (account: MarketplaceAccount) => {
    setSelectedMarketplace(account.marketplace);
    setEditPercent(account.discountPercent);
    setEditPhone(account.isConnected ? account.accountIdentifier : '+7 (999) 123-45-67');
  };

  const handleSaveModal = () => {
    if (!selectedMarketplace) return;
    onConnectAccount(selectedMarketplace, editPercent, editPhone);
    setSelectedMarketplace(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Сейф аккаунтов и персональные скидки</span>
          </h1>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
            AES-256 Zero-Knowledge
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
          Подключите ваши магазины, чтобы парсер автоматически применял вашу скидку постоянного покупателя (СПП Wildberries), спеццены Ozon Карты и баллы Яндекс Плюса.
        </p>
      </div>

      {/* Security Guarantee Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Банковский уровень защиты учетных записей</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  ISO 27001 / FSTEC
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Сервис <strong>никогда не сохраняет пароли</strong> и SMS-коды в открытом виде. Используется изолированный Browser Extension Bridge или клиентское шифрование сессионных токенов чтения (read-only session cookies) с ротацией через московские резидентные прокси.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSecurityDetails(!showSecurityDetails)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showSecurityDetails ? 'Скрыть аудит' : 'Технический аудит'}</span>
          </button>
        </div>

        {/* Detailed Security Protocol Details */}
        {showSecurityDetails && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Шифрование хранилища:</span>
              </div>
              <div className="text-slate-200 font-mono text-[11px]">
                {securityAudit.encryptionStandard}
              </div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Изоляция сессий парсинга:</span>
              </div>
              <div className="text-slate-200 font-mono text-[11px]">
                {securityAudit.isolationLevel}
              </div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Антифрод & Защита от блокировки аккаунтов:</span>
              </div>
              <div className="text-slate-200 font-mono text-[11px]">
                {securityAudit.proxyStrategy}
              </div>
            </div>

            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Принцип Zero-Knowledge:</span>
              </div>
              <div className="text-slate-200 font-mono text-[11px]">
                Ключ дешифрации формируется на клиенте при входе и уничтожается при выходе
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const config = MARKETPLACE_CONFIGS[acc.marketplace];

          return (
            <div
              key={acc.marketplace}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                acc.isConnected 
                  ? 'border-slate-700/80 shadow-sm' 
                  : 'border-slate-800/80 opacity-90'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: config.color }}
                    >
                      {config.badge}
                    </span>
                    <span className="font-bold text-white text-sm">
                      {config.name}
                    </span>
                  </div>

                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    acc.isConnected 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {acc.isConnected ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Подключен
                      </>
                    ) : (
                      'Не настроен'
                    )}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Идентификатор:</span>
                    <span className="font-mono text-slate-200">{acc.accountIdentifier}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Тип скидки:</span>
                    <span className="font-medium text-slate-200">{acc.discountName}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Ваша персональная скидка:</span>
                    <span className="font-mono font-bold text-emerald-400 tabular-nums">
                      {acc.isConnected ? `-${acc.discountPercent}%` : `до -${config.typicalDiscount}%`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Метод интеграции:</span>
                    <span className="text-[11px] text-indigo-300">
                      {acc.authMethod === 'extension_bridge' ? 'Extension Bridge' : 'AES-256 Vault'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenModal(acc)}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{acc.isConnected ? 'Настроить скидку' : 'Подключить аккаунт'}</span>
                </button>

                {acc.isConnected && (
                  <button
                    type="button"
                    onClick={() => onDisconnectAccount(acc.marketplace)}
                    className="py-2 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs transition-colors"
                    title="Отключить аккаунт"
                  >
                    Отключить
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Configuration Modal */}
      {selectedMarketplace && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">
              Настройка аккаунта {MARKETPLACE_CONFIGS[selectedMarketplace].name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Выберите способ подключения и укажите персональный размер скидки.
            </p>

            <div className="space-y-4">
              {/* Method Switcher */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Способ интеграции:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('extension_bridge')}
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                      authMethod === 'extension_bridge'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-indigo-300 mb-0.5">Extension Bridge</div>
                    <div className="text-[10px] leading-tight text-slate-400">100% безопасно, пароли остаются в браузере</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMethod('token_vault')}
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                      authMethod === 'token_vault'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-semibold text-indigo-300 mb-0.5">Encrypted Vault</div>
                    <div className="text-[10px] leading-tight text-slate-400">Шифрование сессионного токена AES-256</div>
                  </button>
                </div>
              </div>

              {/* Phone/Identifier */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Номер телефона или ID аккаунта:
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Discount Percentage Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Размер вашей личной скидки:</span>
                  <span className="font-mono text-emerald-400 font-bold tabular-nums text-sm">
                    {editPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="28"
                  value={editPercent}
                  onChange={(e) => setEditPercent(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>2% (базовая)</span>
                  <span>15% (СПП WB / Ozon)</span>
                  <span>28% (максимум)</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedMarketplace(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shadow-indigo-600/30"
              >
                Сохранить в сейф
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
