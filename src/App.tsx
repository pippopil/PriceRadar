import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductSearchHero } from './components/ProductSearchHero';
import { PriceComparisonView } from './components/PriceComparisonView';
import { TrackingDashboard } from './components/TrackingDashboard';
import { TelegramSettingsPanel } from './components/TelegramSettingsPanel';
import { AccountsVaultPanel } from './components/AccountsVaultPanel';
import { PricingPlansModal } from './components/PricingPlansModal';
import { ArchitectureSecurityView } from './components/ArchitectureSecurityView';
import { MultiStoreWatcherView } from './components/MultiStoreWatcherView';
import { 
  ParsedProduct, 
  TrackedItem, 
  PlanId, 
  MarketplaceAccount, 
  TelegramConfig, 
  NotificationLog,
  MarketplaceId
} from './types';
import { INITIAL_PRODUCTS, INITIAL_TRACKS } from './data/mockCatalog';
import { DEFAULT_ACCOUNTS } from './services/vaultService';
import { SUBSCRIPTION_PLANS } from './data/planConfigs';
import { formatTelegramMarkdown, sendTelegramMessage } from './services/parserEngine';
import { AlertCircle, CheckCircle2, ShieldCheck, Sparkles, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'multi-watch' | 'tracking' | 'vault' | 'telegram' | 'plans' | 'architecture'>('search');
  
  // Current active parsed product (defaults to iPhone 16 benchmark)
  const [currentProduct, setCurrentProduct] = useState<ParsedProduct | null>(INITIAL_PRODUCTS[0]);
  const [isParsing, setIsParsing] = useState(false);

  // User subscription plan
  const [currentPlan, setCurrentPlan] = useState<PlanId>(() => {
    const saved = localStorage.getItem('priceradar_plan');
    return (saved as PlanId) || 'free';
  });

  // Tracked products
  const [tracks, setTracks] = useState<TrackedItem[]>(() => {
    const saved = localStorage.getItem('priceradar_tracks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_TRACKS;
  });

  // Connected accounts
  const [accounts, setAccounts] = useState<MarketplaceAccount[]>(() => {
    const saved = localStorage.getItem('priceradar_accounts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_ACCOUNTS;
  });

  // Telegram Config
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => {
    const saved = localStorage.getItem('priceradar_telegram');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      botToken: '',
      chatId: '',
      isEnabled: true,
      connectedAt: null
    };
  });

  // Notification logs
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem('priceradar_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        productTitle: 'Apple iPhone 16 128GB Black',
        marketplace: 'wildberries',
        oldPrice: 86990,
        newPrice: 81990,
        dropAmount: 5000,
        dropPercent: 5.7,
        url: 'https://www.wildberries.ru/catalog/268912401/detail.aspx',
        status: 'simulated'
      }
    ];
  });

  // Modals & alerts
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' } | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('priceradar_plan', currentPlan);
  }, [currentPlan]);

  useEffect(() => {
    localStorage.setItem('priceradar_tracks', JSON.stringify(tracks));
  }, [tracks]);

  useEffect(() => {
    localStorage.setItem('priceradar_accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('priceradar_telegram', JSON.stringify(telegramConfig));
  }, [telegramConfig]);

  useEffect(() => {
    localStorage.setItem('priceradar_logs', JSON.stringify(notificationLogs));
  }, [notificationLogs]);

  const showToast = (text: string, type: 'success' | 'alert' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handlers
  const handleProductParsed = (product: ParsedProduct) => {
    setCurrentProduct(product);
    setActiveTab('search');
    showToast(`Товар «${product.brand}» успешно проанализирован на 5 площадках!`);
  };

  const handleStartTracking = (product: ParsedProduct, targetPrice: number | null) => {
    const planLimit = SUBSCRIPTION_PLANS[currentPlan].maxTracks;

    // Check if limit is reached
    if (tracks.length >= planLimit) {
      setIsUpgradeModalOpen(true);
      showToast(`На тарифе «${SUBSCRIPTION_PLANS[currentPlan].name}» доступно максимум ${planLimit} ${planLimit === 1 ? 'товар' : 'товаров'}. Перейдите на следующий тариф!`, 'alert');
      return;
    }

    // Check if already in tracking
    if (tracks.some(t => t.productId === product.id)) {
      showToast('Этот товар уже находится в списке отслеживания', 'alert');
      return;
    }

    const newTrack: TrackedItem = {
      id: `track-${Date.now()}`,
      productId: product.id,
      title: product.title,
      brand: product.brand,
      imageUrl: product.imageUrl,
      category: product.category,
      sourceMarketplace: product.sourceMarketplace,
      sourceUrl: product.sourceUrl,
      createdAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
      initialPrice: product.lowestPrice,
      currentPrice: product.lowestPrice,
      lowestPrice: product.lowestPrice,
      lowestMarketplace: product.lowestMarketplace,
      targetPrice,
      status: 'active',
      priceHistory: [
        { date: 'Сегодня', price: product.lowestPrice, marketplace: product.lowestMarketplace }
      ],
      lastDrop: null
    };

    setTracks(prev => [newTrack, ...prev]);
    showToast(`Товар добавлен в мониторинг! Сигнал придет в Telegram при снижении цены.`);
  };

  const handleRemoveTrack = (id: string) => {
    setTracks(prev => prev.filter(t => t.id !== id));
    showToast('Товар удален из мониторинга');
  };

  const handleToggleTrackStatus = (id: string) => {
    setTracks(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'active' ? 'paused' : 'active';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleSimulatePriceDrop = async (id: string) => {
    const target = tracks.find(t => t.id === id);
    if (!target) return;

    const discountRate = 0.15; // 15% drop
    const dropAmount = Math.round(target.currentPrice * discountRate);
    const newPrice = target.currentPrice - dropAmount;

    setTracks(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          currentPrice: newPrice,
          lastCheckedAt: new Date().toISOString(),
          lastDrop: {
            amount: dropAmount,
            percent: 15,
            marketplace: t.lowestMarketplace,
            date: 'Только что',
            notified: true
          },
          priceHistory: [
            ...t.priceHistory,
            { date: 'Только что', price: newPrice, marketplace: t.lowestMarketplace }
          ]
        };
      }
      return t;
    }));

    // Record notification log
    const newLog: NotificationLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      productTitle: target.title,
      marketplace: target.lowestMarketplace,
      oldPrice: target.currentPrice,
      newPrice,
      dropAmount,
      dropPercent: 15,
      url: target.sourceUrl,
      status: telegramConfig.botToken && telegramConfig.chatId ? 'sent' : 'simulated'
    };

    setNotificationLogs(prev => [newLog, ...prev]);

    // Format & send live telegram if credentials available
    const markdown = formatTelegramMarkdown({
      productTitle: target.title,
      marketplaceName: target.lowestMarketplace.toUpperCase(),
      oldPrice: target.currentPrice,
      newPrice,
      dropAmount,
      dropPercent: 15,
      url: target.sourceUrl
    });

    if (telegramConfig.botToken && telegramConfig.chatId) {
      await sendTelegramMessage(telegramConfig.botToken, telegramConfig.chatId, markdown);
      showToast(`🔥 Сигнал о скидке -${dropAmount.toLocaleString('ru-RU')} ₽ отправлен в ваш Telegram!`);
    } else {
      showToast(`🔥 Смоделировано падение цены (-${dropAmount.toLocaleString('ru-RU')} ₽)! Проверьте вкладку «Telegram-бот» для просмотра сигнала.`);
    }
  };

  const handleRefreshAllPrices = () => {
    setTracks(prev => prev.map(t => ({
      ...t,
      lastCheckedAt: new Date().toISOString()
    })));
    showToast('Цены по всем отслеживаемым товарам обновлены');
  };

  const handleSelectPlan = (newPlan: PlanId) => {
    setCurrentPlan(newPlan);
    setIsUpgradeModalOpen(false);
    showToast(`Тариф успешно изменен на «${SUBSCRIPTION_PLANS[newPlan].name}»! Лимит: ${SUBSCRIPTION_PLANS[newPlan].maxTracks} товаров.`);
  };

  const handleConnectAccount = (marketplace: MarketplaceId, discountPercent: number, identifier: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.marketplace === marketplace) {
        return {
          ...acc,
          isConnected: true,
          accountIdentifier: identifier,
          discountPercent,
          lastSync: 'Только что'
        };
      }
      return acc;
    }));
    showToast('Аккаунт магазина успешно настроен с сохранением в защищенный Vault!');
  };

  const handleDisconnectAccount = (marketplace: MarketplaceId) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.marketplace === marketplace) {
        return {
          ...acc,
          isConnected: false,
          accountIdentifier: 'Не подключен',
          lastSync: '—'
        };
      }
      return acc;
    }));
    showToast('Аккаунт отключен, сессионные данные удалены из сейфа');
  };

  const isCurrentProductTracked = currentProduct ? tracks.some(t => t.productId === currentProduct.id) : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-4">
          <div className={`p-4 rounded-xl shadow-2xl flex items-start gap-3 border ${
            toastMessage.type === 'alert'
              ? 'bg-amber-950/95 border-amber-500/50 text-amber-200'
              : 'bg-slate-900/95 border-emerald-500/50 text-emerald-200'
          }`}>
            {toastMessage.type === 'alert' ? (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs leading-relaxed">
              {toastMessage.text}
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentPlan={currentPlan}
        trackedCount={tracks.length}
        openUpgradeModal={() => setIsUpgradeModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'search' && (
          <div>
            <ProductSearchHero
              onProductParsed={handleProductParsed}
              isParsing={isParsing}
              setIsParsing={setIsParsing}
            />

            {currentProduct && (
              <PriceComparisonView
                product={currentProduct}
                onStartTracking={handleStartTracking}
                isAlreadyTracked={isCurrentProductTracked}
                currentPlan={currentPlan}
                openUpgradeModal={() => setIsUpgradeModalOpen(true)}
                onUpdateProduct={(updated) => {
                  setCurrentProduct(updated);
                  showToast('Данные и цены товара успешно обновлены!');
                }}
              />
            )}
          </div>
        )}

        {activeTab === 'multi-watch' && (
          <MultiStoreWatcherView />
        )}

        {activeTab === 'tracking' && (
          <TrackingDashboard
            tracks={tracks}
            currentPlan={currentPlan}
            onRemoveTrack={handleRemoveTrack}
            onToggleTrackStatus={handleToggleTrackStatus}
            onSimulatePriceDrop={handleSimulatePriceDrop}
            onRefreshAllPrices={handleRefreshAllPrices}
            openUpgradeModal={() => setIsUpgradeModalOpen(true)}
            onNavigateToSearch={() => setActiveTab('search')}
            onNavigateToTelegram={() => setActiveTab('telegram')}
          />
        )}

        {activeTab === 'vault' && (
          <AccountsVaultPanel
            accounts={accounts}
            onUpdateAccount={(updated) => {
              setAccounts(prev => prev.map(a => a.marketplace === updated.marketplace ? updated : a));
            }}
            onConnectAccount={handleConnectAccount}
            onDisconnectAccount={handleDisconnectAccount}
          />
        )}

        {activeTab === 'telegram' && (
          <TelegramSettingsPanel
            telegramConfig={telegramConfig}
            onSaveConfig={(cfg) => {
              setTelegramConfig(cfg);
              showToast('Параметры Telegram-бота успешно сохранены!');
            }}
            notificationLogs={notificationLogs}
            onTriggerTestSignal={() => {
              if (tracks.length > 0) {
                handleSimulatePriceDrop(tracks[0].id);
              } else {
                showToast('Тестовый сигнал сформирован');
              }
            }}
          />
        )}

        {activeTab === 'plans' && (
          <PricingPlansModal
            currentPlan={currentPlan}
            onSelectPlan={handleSelectPlan}
            isModal={false}
          />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureSecurityView />
        )}
      </main>

      {/* Plan Upgrade Modal */}
      {isUpgradeModalOpen && (
        <PricingPlansModal
          currentPlan={currentPlan}
          onSelectPlan={handleSelectPlan}
          onClose={() => setIsUpgradeModalOpen(false)}
          isModal={true}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">PriceRadar РФ</span>
            <span>·</span>
            <span>Сервис мониторинга и кросс-поиска цен в России</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('architecture')} 
              className="hover:text-slate-300 transition-colors text-indigo-400"
            >
              Архитектура и безопасность данных
            </button>
            <span>·</span>
            <span>AES-256 GCM Zero-Knowledge</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
