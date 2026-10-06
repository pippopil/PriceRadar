import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Plus, 
  Trash2, 
  ExternalLink, 
  TrendingDown, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Store, 
  Link2, 
  Flame, 
  Settings, 
  Bell, 
  Clock, 
  Layers, 
  Smartphone,
  Edit2,
  Check,
  X,
  ShieldCheck,
  Zap,
  Loader2,
  CheckCircle2,
  ShoppingBag,
  Tag
} from 'lucide-react';
import { CustomProductWatch, StoreLink, MarketplaceId, TelegramConfig } from '../types';
import { 
  getCustomWatches, 
  saveCustomWatches, 
  createCustomWatch, 
  addStoreLinkToWatch, 
  removeStoreLinkFromWatch, 
  updateStorePriceAndCheckAlert, 
  simulatePriceDropInStore 
} from '../services/multiStoreWatcher';
import { getTelegramConfig } from '../services/telegramService';
import { 
  resolveStorePriceFromUrl, 
  detectStoreInfoFromUrl 
} from '../services/storePriceResolver';
import { TelegramSettingsModal } from './TelegramSettingsModal';
import { PWAInstallButton } from './PWAInstallButton';
import { MARKETPLACE_CONFIGS } from '../data/mockCatalog';

export const MultiStoreWatcherView: React.FC = () => {
  const [watches, setWatches] = useState<CustomProductWatch[]>(getCustomWatches());
  const [selectedWatchId, setSelectedWatchId] = useState<string>(watches[0]?.id || '');
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(getTelegramConfig());
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);

  // Notifications feedback
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Modal: Add new product with custom links
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [newProductTitle, setNewProductTitle] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductTargetPrice, setNewProductTargetPrice] = useState('');
  const [newProductImageUrl, setNewProductImageUrl] = useState('');
  const [newProductLinks, setNewProductLinks] = useState<Array<{ marketplace: MarketplaceId | 'other'; storeName: string; url: string; currentPrice: number }>>([
    { marketplace: 'wildberries', storeName: 'Wildberries', url: '', currentPrice: 0 },
    { marketplace: 'ozon', storeName: 'Ozon', url: '', currentPrice: 0 },
    { marketplace: 'yandex', storeName: 'Яндекс Маркет', url: '', currentPrice: 0 }
  ]);
  const [resolvingLinkIndex, setResolvingLinkIndex] = useState<number | null>(null);
  const [linkFeedbackMap, setLinkFeedbackMap] = useState<Record<number, { success: boolean; message: string }>>({});

  // Modal: Add single store link to existing product
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [newLinkMarketplace, setNewLinkMarketplace] = useState<MarketplaceId | 'other'>('wildberries');
  const [newLinkStoreName, setNewLinkStoreName] = useState('Wildberries');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkPrice, setNewLinkPrice] = useState('');
  const [isResolvingSingleLink, setIsResolvingSingleLink] = useState(false);
  const [singleLinkFeedback, setSingleLinkFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Edit price inline
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<string>('');

  const currentWatch = watches.find(w => w.id === selectedWatchId) || watches[0];

  useEffect(() => {
    setTelegramConfig(getTelegramConfig());
  }, [isTelegramModalOpen]);

  const showFeedback = (type: 'success' | 'info' | 'error', message: string) => {
    setActionFeedback({ type, message });
    setTimeout(() => setActionFeedback(null), 6000);
  };

  // Handle simulating a price drop
  const handleSimulateDrop = async (linkId: string, storeName: string) => {
    if (!currentWatch) return;

    try {
      const res = await simulatePriceDropInStore(currentWatch.id, linkId, 15);
      setWatches(getCustomWatches());

      if (res.alertSent) {
        showFeedback('success', `⚡ Просадка цены в ${storeName} зафиксирована! Сигнал успешно отправлен в ваш Telegram бот!`);
      } else {
        showFeedback('info', res.message || `Цена обновлена в ${storeName}, но уведомление не отправлено.`);
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Ошибка обновления цены');
    }
  };

  // Handle saving inline price
  const handleSavePrice = async (linkId: string) => {
    if (!currentWatch) return;
    const priceNum = parseFloat(editPriceInput);
    if (isNaN(priceNum) || priceNum <= 0) return;

    try {
      const res = await updateStorePriceAndCheckAlert(currentWatch.id, linkId, priceNum);
      setWatches(getCustomWatches());
      setEditingLinkId(null);

      if (res.alertSent) {
        showFeedback('success', `🔔 Цена снизилась ниже всех магазинов! Сигнал отправлен в Telegram!`);
      } else if (res.message) {
        showFeedback('info', res.message);
      }
    } catch (err: any) {
      showFeedback('error', err.message);
    }
  };

  // Handle auto-detecting and loading price for single link modal
  const handleSingleLinkUrlChange = async (url: string) => {
    setNewLinkUrl(url);
    setSingleLinkFeedback(null);

    const clean = url.trim();
    if (!clean) return;

    // Автоматическое распознавание магазина
    const detected = detectStoreInfoFromUrl(clean);
    setNewLinkMarketplace(detected.marketplace);
    setNewLinkStoreName(detected.storeName);

    // Если URL похож на реальную ссылку или артикул — подгружаем цену автоматически
    if (clean.startsWith('http') || clean.includes('.ru') || clean.includes('.com') || /^\d{5,12}$/.test(clean)) {
      setIsResolvingSingleLink(true);
      try {
        const resolved = await resolveStorePriceFromUrl(clean);
        if (resolved && resolved.price > 0) {
          setNewLinkPrice(String(resolved.price));
          setNewLinkMarketplace(resolved.marketplace);
          setNewLinkStoreName(resolved.storeName);
          setSingleLinkFeedback({
            success: true,
            message: `Цена подгружена из ${resolved.storeName}: ${resolved.price.toLocaleString('ru-RU')} ₽`
          });
        }
      } catch (err) {
        // Оставляем возможность ручного ввода
      } finally {
        setIsResolvingSingleLink(false);
      }
    }
  };

  const triggerSingleLinkPriceFetch = async () => {
    if (!newLinkUrl.trim()) return;
    setIsResolvingSingleLink(true);
    setSingleLinkFeedback(null);
    try {
      const resolved = await resolveStorePriceFromUrl(newLinkUrl.trim());
      if (resolved && resolved.price > 0) {
        setNewLinkPrice(String(resolved.price));
        setNewLinkMarketplace(resolved.marketplace);
        setNewLinkStoreName(resolved.storeName);
        setSingleLinkFeedback({
          success: true,
          message: `Цена подгружена из ${resolved.storeName}: ${resolved.price.toLocaleString('ru-RU')} ₽`
        });
      } else {
        setSingleLinkFeedback({
          success: false,
          message: 'Не удалось определить цену автоматически. Введите цену вручную.'
        });
      }
    } catch (err: any) {
      setSingleLinkFeedback({
        success: false,
        message: 'Ошибка при связи с магазином. Укажите цену вручную.'
      });
    } finally {
      setIsResolvingSingleLink(false);
    }
  };

  // Handle auto-detecting and loading price for product creation modal
  const handleProductLinkUrlChange = async (idx: number, url: string) => {
    const updated = [...newProductLinks];
    updated[idx].url = url;

    const clean = url.trim();
    if (clean) {
      const detected = detectStoreInfoFromUrl(clean);
      updated[idx].marketplace = detected.marketplace;
      updated[idx].storeName = detected.storeName;
    }
    setNewProductLinks(updated);

    if (clean.startsWith('http') || clean.includes('.ru') || clean.includes('.com') || /^\d{5,12}$/.test(clean)) {
      setResolvingLinkIndex(idx);
      try {
        const resolved = await resolveStorePriceFromUrl(clean);
        if (resolved && resolved.price > 0) {
          const fresh = [...newProductLinks];
          if (fresh[idx]) {
            fresh[idx].currentPrice = resolved.price;
            fresh[idx].marketplace = resolved.marketplace;
            fresh[idx].storeName = resolved.storeName;
            setNewProductLinks(fresh);
          }

          // Автозаполнение названия товара и картинки, если они еще не заполнены пользователем
          if (!newProductTitle.trim() && resolved.title) {
            setNewProductTitle(resolved.title);
          }
          if (!newProductImageUrl.trim() && resolved.imageUrl) {
            setNewProductImageUrl(resolved.imageUrl);
          }
          if (!newProductCategory.trim() && resolved.category) {
            setNewProductCategory(resolved.category);
          }

          setLinkFeedbackMap(prev => ({
            ...prev,
            [idx]: {
              success: true,
              message: `✓ ${resolved.price.toLocaleString('ru-RU')} ₽`
            }
          }));
        }
      } catch (err) {
        // Оставляем ручной ввод
      } finally {
        setResolvingLinkIndex(null);
      }
    }
  };

  // Quick add store preset in Create Product Modal
  const handleAddStorePreset = (marketplace: MarketplaceId | 'other', storeName: string) => {
    setNewProductLinks(prev => [
      ...prev,
      { marketplace, storeName, url: '', currentPrice: 0 }
    ]);
  };

  const handleRemoveProductLink = (idx: number) => {
    if (newProductLinks.length <= 1) {
      showFeedback('info', 'В мониторинге должен остаться хотя бы один магазин.');
      return;
    }
    setNewProductLinks(prev => prev.filter((_, i) => i !== idx));
  };

  // Handle adding store link
  const handleAddLink = () => {
    if (!currentWatch || !newLinkUrl.trim()) return;
    const price = parseFloat(newLinkPrice) || 0;

    addStoreLinkToWatch(currentWatch.id, {
      marketplace: newLinkMarketplace,
      storeName: newLinkStoreName,
      url: newLinkUrl.trim(),
      currentPrice: price
    });

    setWatches(getCustomWatches());
    setIsAddLinkModalOpen(false);
    setNewLinkUrl('');
    setNewLinkPrice('');
    setSingleLinkFeedback(null);
    showFeedback('success', `Ссылка на ${newLinkStoreName} успешно добавлена в мониторинг товара!`);
  };

  // Handle removing store link
  const handleRemoveLink = (linkId: string, storeName: string) => {
    if (!currentWatch) return;
    if (confirm(`Удалить ссылку ${storeName} из мониторинга?`)) {
      removeStoreLinkFromWatch(currentWatch.id, linkId);
      setWatches(getCustomWatches());
      showFeedback('info', `Ссылка на ${storeName} удалена.`);
    }
  };

  // Handle creating new custom product
  const handleCreateProduct = () => {
    if (!newProductTitle.trim()) return;

    const validLinks = newProductLinks.filter(l => l.url.trim() && l.currentPrice > 0);

    const created = createCustomWatch({
      title: newProductTitle.trim(),
      category: newProductCategory.trim(),
      imageUrl: newProductImageUrl.trim(),
      targetPrice: parseFloat(newProductTargetPrice) || undefined,
      initialLinks: validLinks.length > 0 ? validLinks : [
        { marketplace: 'wildberries', storeName: 'Wildberries', url: 'https://wildberries.ru', currentPrice: 1000 }
      ]
    });

    const updated = getCustomWatches();
    setWatches(updated);
    setSelectedWatchId(created.id);
    setIsCreateProductModalOpen(false);
    setNewProductTitle('');
    setNewProductCategory('');
    setNewProductTargetPrice('');
    setNewProductImageUrl('');
    setNewProductLinks([
      { marketplace: 'wildberries', storeName: 'Wildberries', url: '', currentPrice: 0 },
      { marketplace: 'ozon', storeName: 'Ozon', url: '', currentPrice: 0 },
      { marketplace: 'yandex', storeName: 'Яндекс Маркет', url: '', currentPrice: 0 }
    ]);
    setLinkFeedbackMap({});
    showFeedback('success', `Товар «${created.title}» с ${created.links.length} магазинами добавлен в мониторинг!`);
  };

  const totalStoresInSystem = watches.reduce((acc, w) => acc + w.links.length, 0);
  const maxPriceInCurrent = currentWatch?.links?.length 
    ? Math.max(...currentWatch.links.map(l => l.currentPrice))
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner: Concept Explanation & Telegram Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 mb-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Мульти-Мониторинг Ссылок & Telegram Сигналы
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Пользовательские ссылки
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Добавляйте свои прямые ссылки на один товар из разных магазинов (Ozon, Wildberries, Яндекс Маркет, AliExpress, Мегамаркет). Система отслеживает цены: <strong>если в каком-то магазине цена падает ниже всех остальных магазинов — вам моментально приходит сигнал в Telegram бот!</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsTelegramModalOpen(true)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                telegramConfig.botToken && telegramConfig.chatId && telegramConfig.isEnabled
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 hover:bg-sky-500/25'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 animate-bounce'
              }`}
            >
              <Bot className="w-4 h-4 text-sky-400" />
              <span>
                {telegramConfig.botToken && telegramConfig.chatId && telegramConfig.isEnabled
                  ? 'Telegram Бот: Подключен'
                  : 'Настроить Telegram Бот'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateProductModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить свой товар</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {actionFeedback && (
        <div className={`p-4 rounded-xl mb-6 text-xs flex items-center justify-between gap-3 shadow-lg transition-all animate-fadeIn ${
          actionFeedback.type === 'success'
            ? 'bg-emerald-950/90 border border-emerald-500/40 text-emerald-200'
            : actionFeedback.type === 'info'
            ? 'bg-sky-950/90 border border-sky-500/40 text-sky-200'
            : 'bg-red-950/90 border border-red-500/40 text-red-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {actionFeedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : actionFeedback.type === 'info' ? (
              <Sparkles className="w-5 h-5 text-sky-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="font-medium">{actionFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Products Tab Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {watches.map(w => {
          const isSelected = w.id === currentWatch?.id;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setSelectedWatchId(w.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-2.5 border ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="w-6 h-6 rounded bg-slate-950 overflow-hidden shrink-0 border border-slate-700/60">
                <img src={w.imageUrl} alt={w.title} className="w-full h-full object-contain" />
              </div>
              <span className="max-w-[200px] truncate">{w.title}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 ${
                isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
              }`}>
                <Store className="w-3 h-3" />
                <span>{w.links.length} магазинов</span>
              </span>
            </button>
          );
        })}
      </div>

      {currentWatch ? (
        <div className="space-y-6">
          {/* Active Product Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-5 items-start justify-between">
              <div className="flex gap-4 items-start">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={currentWatch.imageUrl} alt={currentWatch.title} className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">{currentWatch.category}</div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug mb-2">
                    {currentWatch.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                    <span className="text-slate-400">Лучшая цена среди магазинов:</span>
                    <span className="font-mono text-emerald-400 font-bold text-sm">
                      {currentWatch.lowestPrice.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium">
                      Лидер: {currentWatch.lowestStore}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Магазинов в мониторинге: {currentWatch.links.length} шт.</span>
                    </span>
                  </div>

                  {/* Connected Store Badges List */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 mr-1">Подключенные магазины:</span>
                    {currentWatch.links.map(l => (
                      <span
                        key={l.id}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded border flex items-center gap-1 ${
                          l.isLowest
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-950/80 text-slate-300 border-slate-800'
                        }`}
                      >
                        <span>{l.storeName}</span>
                        <span className="font-mono text-[9px] opacity-80">({l.currentPrice.toLocaleString('ru-RU')} ₽)</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddLinkModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Добавить магазин</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                    +{currentWatch.links.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar: Store Count & Price Spread */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] mb-0.5">Количество магазинов</span>
                <span className="text-base font-bold text-white flex items-center gap-1">
                  <Store className="w-4 h-4 text-indigo-400" />
                  <span>{currentWatch.links.length} магазинов</span>
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] mb-0.5">Минимальная цена</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {currentWatch.lowestPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] mb-0.5">Максимальная цена</span>
                <span className="text-base font-bold text-slate-300 font-mono">
                  {maxPriceInCurrent.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] mb-0.5">Разница цен (экономия)</span>
                <span className="text-base font-bold text-amber-400 font-mono">
                  {(maxPriceInCurrent - currentWatch.lowestPrice).toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>
          </div>

          {/* Links Grid: Comparison of user-added store links */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-400" />
                <span>Ваши ссылки на этот товар в магазинах ({currentWatch.links.length} магазинов)</span>
              </h4>
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Сравнение цен в реальном времени</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentWatch.links.map(link => {
                const isWinner = link.isLowest;
                const isEditing = editingLinkId === link.id;
                const diffWithWinner = link.currentPrice - currentWatch.lowestPrice;

                return (
                  <div
                    key={link.id}
                    className={`rounded-2xl p-4.5 transition-all flex flex-col justify-between border ${
                      isWinner
                        ? 'bg-slate-900 border-2 border-emerald-500/80 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                            {link.storeName}
                          </span>
                        </div>

                        {isWinner ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>ЛУЧШАЯ ЦЕНА</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400">
                            +{diffWithWinner.toLocaleString('ru-RU')} ₽
                          </span>
                        )}
                      </div>

                      {/* Price Display / Inline Edit */}
                      <div className="mb-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2 my-1">
                            <input
                              type="number"
                              value={editPriceInput}
                              onChange={(e) => setEditPriceInput(e.target.value)}
                              placeholder="Новая цена"
                              className="w-28 px-2.5 py-1 bg-slate-950 border border-indigo-500 rounded text-xs font-mono text-white focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePrice(link.id)}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                              title="Сохранить цену"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingLinkId(null)}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-2">
                            <span className={`text-2xl font-bold font-mono ${isWinner ? 'text-emerald-400' : 'text-white'}`}>
                              {link.currentPrice.toLocaleString('ru-RU')} ₽
                            </span>
                            {link.oldPrice && link.oldPrice > link.currentPrice && (
                              <span className="text-xs line-through text-slate-500 font-mono">
                                {link.oldPrice.toLocaleString('ru-RU')} ₽
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingLinkId(link.id);
                                setEditPriceInput(String(link.currentPrice));
                              }}
                              className="text-slate-500 hover:text-slate-300 p-0.5 ml-1 transition-colors"
                              title="Изменить цену вручную"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                          <span>Проверено: {link.lastCheckedAt}</span>
                          {link.directSku && <span>Арт: {link.directSku}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-2">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
                          isWinner
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <span>Купить в {link.storeName}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <div className="flex items-center justify-between gap-1">
                        {/* Simulation button */}
                        <button
                          type="button"
                          onClick={() => handleSimulateDrop(link.id, link.storeName)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/25 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Симулировать резкую просадку цены в этом магазине и отправить сигнал в Telegram"
                        >
                          <Zap className="w-3 h-3 text-indigo-400" />
                          <span>Симулировать просадку</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveLink(link.id, link.storeName)}
                          className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-red-500/20 text-slate-500 hover:text-red-400 border border-slate-800 transition-colors cursor-pointer"
                          title="Удалить эту ссылку"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alert History Section */}
          {currentWatch.alertHistory.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>История отправленных сигналов в Telegram ({currentWatch.alertHistory.length})</span>
              </h4>
              <div className="space-y-2">
                {currentWatch.alertHistory.map(alert => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-white mb-0.5">
                        {alert.message}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Магазин: {alert.storeName}</span>
                        <span>·</span>
                        <span>Новая цена: {alert.newPrice} ₽ (было {alert.oldPrice} ₽)</span>
                        <span>·</span>
                        <span>Экономия: {alert.savingsVsCompetitor} ₽</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-[10px] text-slate-500 block">{alert.timestamp}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        alert.telegramSent ? 'bg-sky-500/20 text-sky-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {alert.telegramSent ? 'Telegram ✅' : 'В приложении'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
          Товары в мониторинге отсутствуют. Нажмите «Добавить свой товар»!
        </div>
      )}

      {/* PWA Mobile App Card Banner */}
      <div className="mt-8">
        <PWAInstallButton variant="banner" />
      </div>

      {/* Telegram Modal */}
      <TelegramSettingsModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        onSaved={(c) => {
          setTelegramConfig(c);
          showFeedback('success', 'Настройки Telegram бота успешно сохранены!');
        }}
      />

      {/* Modal: Add link to existing watch */}
      {isAddLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setIsAddLinkModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>Добавить ссылку магазина</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3 truncate">
              Товар: «{currentWatch?.title}»
            </p>

            {/* Store count in current product */}
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-between text-xs mb-4">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-indigo-400" />
                <span>Магазинов у этого товара:</span>
              </span>
              <span className="font-bold text-indigo-200 bg-indigo-600/30 px-2 py-0.5 rounded border border-indigo-500/30 font-mono text-[11px]">
                {currentWatch?.links.length} шт. (станет {currentWatch ? currentWatch.links.length + 1 : 1})
              </span>
            </div>

            <div className="space-y-3.5 mb-5 text-xs">
              {/* URL input with instant auto price fetch */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Прямая ссылка на товар в магазине:</label>
                  <span className="text-[10px] text-indigo-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Авто-подгрузка цены</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={newLinkUrl}
                    onChange={(e) => handleSingleLinkUrlChange(e.target.value)}
                    placeholder="Вставьте ссылку (WB, Ozon, Яндекс Маркет, AliExpress, DNS...)"
                    className="w-full pl-3 pr-24 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={triggerSingleLinkPriceFetch}
                    disabled={!newLinkUrl.trim() || isResolvingSingleLink}
                    className="absolute right-1 top-1 bottom-1 px-2.5 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Определить магазин и подгрузить цену"
                  >
                    {isResolvingSingleLink ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Zap className="w-3 h-3 text-amber-300" />
                    )}
                    <span>{isResolvingSingleLink ? 'Загрузка...' : 'Подгрузить'}</span>
                  </button>
                </div>

                {isResolvingSingleLink && (
                  <div className="mt-1.5 text-[11px] text-indigo-300 flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 shrink-0" />
                    <span>Определяем магазин и подгружаем цену товара...</span>
                  </div>
                )}

                {singleLinkFeedback && (
                  <div className={`mt-1.5 text-[11px] p-2 rounded-lg flex items-center gap-1.5 border ${
                    singleLinkFeedback.success 
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                  }`}>
                    {singleLinkFeedback.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span>{singleLinkFeedback.message}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Магазин (определяется автоматически):</label>
                <select
                  value={newLinkMarketplace}
                  onChange={(e) => {
                    const val = e.target.value as MarketplaceId | 'other';
                    setNewLinkMarketplace(val);
                    if (val === 'wildberries') setNewLinkStoreName('Wildberries');
                    else if (val === 'ozon') setNewLinkStoreName('Ozon');
                    else if (val === 'yandex') setNewLinkStoreName('Яндекс Маркет');
                    else if (val === 'aliexpress') setNewLinkStoreName('AliExpress');
                    else if (val === 'megamarket') setNewLinkStoreName('Мегамаркет');
                    else setNewLinkStoreName('Другой магазин');
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  <option value="wildberries">Wildberries</option>
                  <option value="ozon">Ozon</option>
                  <option value="yandex">Яндекс Маркет</option>
                  <option value="aliexpress">AliExpress</option>
                  <option value="megamarket">Мегамаркет</option>
                  <option value="other">Другой магазин (DNS, Ситилинк, М.Видео, и т.д.)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Название магазина / продавца:</label>
                <input
                  type="text"
                  value={newLinkStoreName}
                  onChange={(e) => setNewLinkStoreName(e.target.value)}
                  placeholder="Например: Wildberries или DNS"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Текущая цена (₽):</label>
                  <span className="text-[10px] text-emerald-400 font-medium">Подгружается автоматически</span>
                </div>
                <input
                  type="number"
                  value={newLinkPrice}
                  onChange={(e) => setNewLinkPrice(e.target.value)}
                  placeholder="Например: 2490"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddLinkModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleAddLink}
                disabled={!newLinkUrl.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Добавить ссылку
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create new product watch */}
      {isCreateProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl relative text-left my-8">
            <button
              type="button"
              onClick={() => setIsCreateProductModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <span>Создать новый товар для мульти-мониторинга</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Вставьте ссылки на товар в разных магазинах. Цена подгрузится автоматически!
            </p>

            <div className="space-y-4 mb-5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Название товара (заполнится само при вставке ссылки):
                </label>
                <input
                  type="text"
                  value={newProductTitle}
                  onChange={(e) => setNewProductTitle(e.target.value)}
                  placeholder="Например: Робот-пылесос Roborock S8 или Кроссовки Nike"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Категория:</label>
                  <input
                    type="text"
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    placeholder="Бытовая техника, Одежда..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Целевая цена (₽):</label>
                  <input
                    type="number"
                    value={newProductTargetPrice}
                    onChange={(e) => setNewProductTargetPrice(e.target.value)}
                    placeholder="Желаемая цена"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ссылка на фото товара (URL):</label>
                <input
                  type="text"
                  value={newProductImageUrl}
                  onChange={(e) => setNewProductImageUrl(e.target.value)}
                  placeholder="https://... (подгрузится автоматически из первой ссылки)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              {/* Stores Section with Counter and Quick Add */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-indigo-400" />
                    <span className="text-slate-200 font-bold text-xs">
                      Магазины для мониторинга:
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                    Количество магазинов: {newProductLinks.length} шт.
                  </span>
                </div>

                {/* Quick Add Presets */}
                <div className="mb-3.5">
                  <span className="text-[11px] text-slate-400 block mb-1.5">
                    Добавить еще магазин в мониторинг:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddStorePreset('wildberries', 'Wildberries')}
                      className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-purple-950/60 text-purple-300 border border-purple-500/30 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Wildberries
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddStorePreset('ozon', 'Ozon')}
                      className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-blue-950/60 text-blue-300 border border-blue-500/30 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Ozon
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddStorePreset('yandex', 'Яндекс Маркет')}
                      className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-yellow-950/60 text-yellow-300 border border-yellow-500/30 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Яндекс Маркет
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddStorePreset('aliexpress', 'AliExpress')}
                      className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-red-950/60 text-red-300 border border-red-500/30 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" /> AliExpress
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddStorePreset('megamarket', 'Мегамаркет')}
                      className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Мегамаркет
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddStorePreset('other', 'DNS')}
                      className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-orange-950/60 text-orange-300 border border-orange-500/30 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" /> DNS
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddStorePreset('other', 'Другой магазин')}
                      className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Другой
                    </button>
                  </div>
                </div>

                {/* List of Store Links */}
                <div className="space-y-3">
                  {newProductLinks.map((link, idx) => {
                    const isResolving = resolvingLinkIndex === idx;
                    const feedback = linkFeedbackMap[idx];

                    return (
                      <div key={idx} className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{link.storeName}</span>
                            <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              Магазин #{idx + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {feedback && (
                              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{feedback.message}</span>
                              </span>
                            )}

                            {newProductLinks.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveProductLink(idx)}
                                className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                                title="Удалить магазин"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* URL input */}
                        <div>
                          <div className="relative">
                            <input
                              type="text"
                              value={link.url}
                              onChange={(e) => handleProductLinkUrlChange(idx, e.target.value)}
                              placeholder={`Вставьте ссылку на ${link.storeName} (https://...)`}
                              className="w-full pl-2.5 pr-20 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                            />
                            {isResolving && (
                              <div className="absolute right-2 top-1.5 flex items-center gap-1 text-[10px] text-indigo-400">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Цена...</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price input */}
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px] whitespace-nowrap">Цена в магазине (₽):</span>
                          <input
                            type="number"
                            value={link.currentPrice || ''}
                            onChange={(e) => {
                              const updated = [...newProductLinks];
                              updated[idx].currentPrice = parseFloat(e.target.value) || 0;
                              setNewProductLinks(updated);
                            }}
                            placeholder="Подгрузится сама или введите"
                            className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Всего магазинов: <strong className="text-white font-mono">{newProductLinks.length}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleCreateProduct}
                  disabled={!newProductTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Создать и начать мониторинг
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
