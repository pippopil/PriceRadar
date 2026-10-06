import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ExternalLink, 
  BellRing, 
  TrendingDown, 
  ShieldCheck, 
  Store, 
  Star, 
  Truck, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Info, 
  Edit3, 
  X, 
  Save,
  Target,
  Copy,
  Search,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  UploadCloud,
  Link2,
  Compass,
  Wrench
} from 'lucide-react';
import { ParsedProduct, MarketplaceOffer, MarketplaceId, PlanId } from '../types';
import { MARKETPLACE_CONFIGS } from '../data/mockCatalog';
import { formatPrice, rebuildProductOffersWithControlPhrase, refineProductWithTitleAndTags } from '../services/parserEngine';
import { analyzeCardImage } from '../services/visualMatcher';
import { ProductImage } from './ProductImage';
import { SMART_MOP_SVG, GOLDSTAR_HEATER_SVG } from '../data/productVisuals';
import { 
  buildVisualSearchUrl, 
  buildYandexProductsUrl, 
  buildDirectMarketplaceProductUrl,
  buildTargetedMarketplaceUrl,
  buildMarketplaceSiteSearchUrl
} from '../services/searchQueryOptimizer';

const MARKETPLACE_DOMAINS: Record<MarketplaceId, string> = {
  wildberries: 'wildberries.ru',
  ozon: 'ozon.ru',
  yandex: 'market.yandex.ru',
  aliexpress: 'aliexpress.ru',
  megamarket: 'megamarket.ru'
};

interface PriceComparisonViewProps {
  product: ParsedProduct;
  onStartTracking: (product: ParsedProduct, targetPrice: number | null) => void;
  isAlreadyTracked: boolean;
  currentPlan: PlanId;
  openUpgradeModal: () => void;
  onUpdateProduct?: (updated: ParsedProduct) => void;
}

export const PriceComparisonView: React.FC<PriceComparisonViewProps> = ({
  product,
  onStartTracking,
  isAlreadyTracked,
  currentPlan,
  openUpgradeModal,
  onUpdateProduct,
}) => {
  const [usePersonalDiscounts, setUsePersonalDiscounts] = useState(true);
  const [customTargetPrice, setCustomTargetPrice] = useState<string>('');
  const [trackingActivatedFeedback, setTrackingActivatedFeedback] = useState(false);
  
  // Контрольные фразы поиска
  const [activeControlPhrase, setActiveControlPhrase] = useState(product.controlPhrase || '');
  const [customQueryInput, setCustomQueryInput] = useState('');
  const [queryNotice, setQueryNotice] = useState<string | null>(null);
  const [copiedQueryMarketplace, setCopiedQueryMarketplace] = useState<string | null>(null);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [bindingMarketplace, setBindingMarketplace] = useState<MarketplaceId | null>(null);
  const [directSkuInput, setDirectSkuInput] = useState('');
  const [directUrlInput, setDirectUrlInput] = useState('');
  const [editTitle, setEditTitle] = useState(product.title);
  const [editBrand, setEditBrand] = useState(product.brand);
  const [editPrice, setEditPrice] = useState(String(product.lowestPrice));
  const [editPersonalPrice, setEditPersonalPrice] = useState(String(product.lowestPersonalPrice));
  const [editImageUrl, setEditImageUrl] = useState(product.imageUrl || '');

  // Комплексный поиск: уточнение по названию, меткам и изображению с карточки
  const [refineTitleInput, setRefineTitleInput] = useState('');
  const [uploadedCardImage, setUploadedCardImage] = useState<string | null>(null);
  const [isAnalyzingCard, setIsAnalyzingCard] = useState(false);

  const handleApplyRefinement = (titleToApply: string, tags?: string[], image?: string) => {
    const updated = refineProductWithTitleAndTags(product, titleToApply, tags, image);
    if (onUpdateProduct) {
      onUpdateProduct(updated);
    }
    setQueryNotice(`Комплексный поиск применен: «${titleToApply}»`);
    setTimeout(() => setQueryNotice(null), 4000);
  };

  const handleApplyTag = (tag: string) => {
    const newTitle = product.title.includes('Товар Wildberries') 
      ? tag 
      : `${tag} ${product.title}`.trim();
    handleApplyRefinement(newTitle, [tag, ...(product.tags || [])]);
  };

  const handleCardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingCard(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedCardImage(dataUrl);

      const analysis = analyzeCardImage(dataUrl, {
        fileName: file.name,
        fallbackTitle: product.title
      });

      const updated = refineProductWithTitleAndTags(
        product,
        analysis.detectedTitle,
        analysis.tags,
        dataUrl
      );
      updated.visualSimilarityScore = analysis.confidenceScore;
      updated.visualTags = analysis.tags;

      if (onUpdateProduct) {
        onUpdateProduct(updated);
      }
      setIsAnalyzingCard(false);
      setQueryNotice(`Скриншот карточки распознан (${analysis.confidenceScore}% сходство): «${analysis.detectedTitle}»`);
      setTimeout(() => setQueryNotice(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  // Синхронизация локального состояния при смене входного товара
  useEffect(() => {
    setEditTitle(product.title);
    setEditBrand(product.brand);
    setEditPrice(String(product.lowestPrice));
    setEditPersonalPrice(String(product.lowestPersonalPrice));
    setEditImageUrl(product.imageUrl || '');
    setActiveControlPhrase(product.controlPhrase || '');
    setCustomQueryInput('');
  }, [product.id, product.imageUrl, product.title]);

  // Расчет цен с учетом переключателя персональных скидок
  const offersWithCurrentPrices = product.offers.map(offer => ({
    ...offer,
    effectivePrice: usePersonalDiscounts ? offer.personalPrice : offer.price
  }));

  // Разделение на предложения в наличии и отсутствующие
  const availableOffers = offersWithCurrentPrices.filter(
    o => o.inStock !== false && o.effectivePrice > 0 && o.availabilityStatus !== 'not_found' && o.availabilityStatus !== 'out_of_stock'
  );
  const unavailableOffers = offersWithCurrentPrices.filter(
    o => o.inStock === false || o.effectivePrice <= 0 || o.availabilityStatus === 'not_found' || o.availabilityStatus === 'out_of_stock'
  );

  availableOffers.sort((a, b) => a.effectivePrice - b.effectivePrice);
  const sortedOffers = [...availableOffers, ...unavailableOffers];

  const bestOffer = availableOffers[0] || offersWithCurrentPrices[0];
  const highestOffer = availableOffers[availableOffers.length - 1] || bestOffer;
  const maxSavings = highestOffer && bestOffer && highestOffer.effectivePrice > bestOffer.effectivePrice
    ? highestOffer.effectivePrice - bestOffer.effectivePrice
    : 0;
  const savingsPercent = highestOffer && highestOffer.effectivePrice > 0
    ? Math.round((maxSavings / highestOffer.effectivePrice) * 100)
    : 0;

  const bestConfig = MARKETPLACE_CONFIGS[bestOffer.marketplace];

  const handleActivateTracking = () => {
    const target = customTargetPrice ? parseFloat(customTargetPrice.replace(/\D/g, '')) : null;
    onStartTracking(product, target);
    setTrackingActivatedFeedback(true);
    setTimeout(() => setTrackingActivatedFeedback(false), 3000);
  };

  // Применение контрольной поисковой фразы (пересчет ссылок на всех 5 площадках)
  const handleApplyControlPhrase = (phrase: string) => {
    const trimmed = phrase.trim().replace(/^Артикул:\s*/i, '');
    if (!trimmed) return;

    setActiveControlPhrase(trimmed);
    const updatedProduct = rebuildProductOffersWithControlPhrase(product, trimmed);
    if (onUpdateProduct) {
      onUpdateProduct(updatedProduct);
    }
    setQueryNotice(`Ссылки пересчитаны по контрольной фразе «${trimmed}»`);
    setTimeout(() => setQueryNotice(null), 4000);
  };

  // Копирование контрольной фразы в буфер обмена
  const handleCopyPhrase = (phrase: string, marketplaceKey: string) => {
    navigator.clipboard.writeText(phrase);
    setCopiedQueryMarketplace(marketplaceKey);
    setTimeout(() => setCopiedQueryMarketplace(null), 2500);
  };

  const handleSaveEdits = () => {
    const parsedPrice = parseFloat(editPrice) || product.lowestPrice;
    const parsedPersonal = parseFloat(editPersonalPrice) || product.lowestPersonalPrice;

    const updatedOffers = product.offers.map(off => {
      if (off.marketplace === product.sourceMarketplace) {
        return {
          ...off,
          title: editTitle,
          price: parsedPrice,
          personalPrice: parsedPersonal
        };
      }
      return off;
    });

    const updatedProduct: ParsedProduct = {
      ...product,
      title: editTitle,
      brand: editBrand,
      imageUrl: editImageUrl || product.imageUrl,
      lowestPrice: parsedPrice,
      lowestPersonalPrice: parsedPersonal,
      offers: updatedOffers
    };

    if (onUpdateProduct) {
      onUpdateProduct(updatedProduct);
    }
    setIsEditModalOpen(false);
  };

  const handleQuickChangeImage = (newUrl: string) => {
    setEditImageUrl(newUrl);
    const updatedProduct: ParsedProduct = {
      ...product,
      imageUrl: newUrl
    };
    if (onUpdateProduct) {
      onUpdateProduct(updatedProduct);
    }
    setIsImageModalOpen(false);
  };

  const handleSaveDirectLink = (m: MarketplaceId) => {
    let finalUrl = directUrlInput.trim();
    let finalSku = directSkuInput.trim();

    if (!finalUrl && finalSku) {
      finalUrl = buildDirectMarketplaceProductUrl(m, finalSku);
    } else if (finalUrl && !finalSku) {
      const match = finalUrl.match(/(\d{6,12})/);
      if (match) finalSku = match[1];
    }

    if (!finalUrl) return;

    const updatedOffers = product.offers.map(off => {
      if (off.marketplace === m) {
        return {
          ...off,
          url: finalUrl,
          directSku: finalSku || off.directSku,
          isDirectLink: true,
          searchQuery: `Прямая карточка (Артикул: ${finalSku || 'закреплен'})`,
          availabilityStatus: 'available' as const,
          inStock: true
        };
      }
      return off;
    });

    const updatedProduct: ParsedProduct = {
      ...product,
      offers: updatedOffers
    };

    if (onUpdateProduct) {
      onUpdateProduct(updatedProduct);
    }

    setBindingMarketplace(null);
    setDirectSkuInput('');
    setDirectUrlInput('');
    setQueryNotice(`Прямая карточка для ${MARKETPLACE_CONFIGS[m].name} успешно привязана!`);
    setTimeout(() => setQueryNotice(null), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Comprehensive Refinement Banner (for unresolved WB items like 996330082) */}
      {product.needsRefinement && (
        <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900 to-purple-950/90 border-2 border-indigo-500/60 rounded-2xl p-5 sm:p-6 mb-6 shadow-xl shadow-indigo-950/40">
          <div className="flex items-start gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Комплексный поиск предложений: артикул WB {product.sku}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Требуется уточнение
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {product.refinementReason || 'Товар находится в Избранном или закрытом каталоге WB. Для точного поиска на Ozon, Яндекс.Маркете, AliExpress и Мегамаркете укажите название, выберите метку или загрузите скриншот карточки!'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800">
            {/* 1. По названию */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 mb-1.5">
                  <Search className="w-4 h-4 text-indigo-400" />
                  <span>1. По названию или модели</span>
                </span>
                <p className="text-[11px] text-slate-400 mb-2.5">
                  Введите наименование товара из карточки WB:
                </p>
                <input
                  type="text"
                  value={refineTitleInput}
                  onChange={(e) => setRefineTitleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && refineTitleInput.trim()) {
                      handleApplyRefinement(refineTitleInput);
                    }
                  }}
                  placeholder="Например: Пальто бежевое, Кроссовки..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={() => handleApplyRefinement(refineTitleInput)}
                disabled={!refineTitleInput.trim()}
                className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Найти по названию
              </button>
            </div>

            {/* 2. По меткам */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>2. По меткам категорий</span>
                </span>
                <p className="text-[11px] text-slate-400 mb-2.5">
                  Выберите подходящую метку товара:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['Пальто / Куртка', 'Одежда мужская', 'Одежда женская', 'Обувь / Кроссовки', 'Чайник', 'Пылесос / Фильтр', 'Обогреватель', 'Смартфон', 'Товары для дома'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleApplyTag(tag)}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-200 border border-slate-700/80 hover:border-amber-500/40 transition-colors cursor-pointer"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-slate-500 mt-2 block">
                Клик мгновенно перестроит кросс-поиск
              </span>
            </div>

            {/* 3. По изображению с карточки */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-1.5">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>3. По скриншоту карточки</span>
                </span>
                <p className="text-[11px] text-slate-400 mb-2.5">
                  Скриншот или фото товара с WB:
                </p>
                <label className="w-full py-3 px-3 border border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs text-emerald-300 font-medium">
                  <UploadCloud className="w-4 h-4 text-emerald-400" />
                  <span>{isAnalyzingCard ? 'Анализируем фото...' : 'Загрузить скриншот карточки'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCardImageUpload}
                    className="hidden"
                    disabled={isAnalyzingCard}
                  />
                </label>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 block text-center">
                Авто-сравнение с 5 маркетплейсами РФ
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Product Summary Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Product Image Container with key for clean React re-rendering */}
          <div className="flex flex-col items-center shrink-0 w-full md:w-64">
            <div className="w-full h-64 rounded-xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden relative group">
              <ProductImage
                key={`${product.id}-${product.imageUrl}`}
                imageUrl={product.imageUrl}
                title={product.title}
                brand={product.brand}
                category={product.category}
                sourceMarketplace={product.sourceMarketplace}
              />
              <div className="absolute top-3 left-3 z-20">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-900/90 text-slate-200 border border-slate-700/80 backdrop-blur-sm">
                  {product.brand}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsImageModalOpen(true)}
              className="mt-2 text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <Camera className="w-3 h-3 text-indigo-400" />
              <span>Сменить или уточнить фото</span>
            </button>
          </div>

          {/* Product Meta & Specs */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">Артикул: {product.sku}</span>
                <span aria-hidden="true">·</span>
                <span>Источник: {MARKETPLACE_CONFIGS[product.sourceMarketplace].name}</span>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/80 flex items-center gap-1.5 transition-colors"
                title="Скорректировать цену или параметры"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Уточнить цену / данные</span>
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-3">
              {product.title}
            </h2>

            {/* Key Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 mb-3">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-slate-400">{key}:</span>
                  <span className="font-medium text-slate-200">{val}</span>
                </div>
              ))}
            </div>

            {/* Tags / Метки товара */}
            {product.tags && product.tags.length > 0 && (
              <div className="mb-4">
                <div className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-indigo-400" />
                  <span>Метки карточки (кликните для быстрой фильтрации):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleApplyTag(tag)}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800/90 hover:bg-indigo-600/30 text-indigo-300 border border-slate-700 hover:border-indigo-500/50 transition-colors cursor-pointer"
                      title={`Искать по метке ${tag}`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Personal Discount Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={usePersonalDiscounts}
                  onChange={(e) => setUsePersonalDiscounts(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-slate-300 font-medium">
                  Учитывать скидки аккаунтов (Ozon Карта, СПП WB, Яндекс Плюс)
                </span>
              </label>

              <span className="text-slate-400 text-[11px]">
                {usePersonalDiscounts ? 'Цены с учетом скидок ваших карт' : 'Базовые цены маркетплейсов'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Search Panel (Визуальный поиск по фото в Яндекс.Картинках и Google Lens) */}
      <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-4 sm:p-5 mb-6 shadow-lg shadow-sky-950/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  Визуальный поиск по фото на маркетплейсах
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Рекомендуется для точного совпадения
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Продавцы на Wildberries и Ozon часто называют одинаковый товар по-разному (например: «Швабра Smart Mop» vs «Швабра-лентяйка с ведром»). Обратный поиск по фото находит 100% идентичных товаров по внешнему виду!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
            <a
              href={buildVisualSearchUrl('yandex', product.imageUrl, product.title, product.controlPhrase)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-red-600/90 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Открыть Яндекс.Картинки для поиска этого товара по фото во всех магазинах"
            >
              <span>В Яндекс.Картинках</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={buildVisualSearchUrl('google_lens', product.imageUrl, product.title, product.controlPhrase)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Открыть Google Объектив (Lens)"
            >
              <span>Google Lens</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={() => setIsImageModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-3 h-3 text-sky-400" />
              <span>Сменить / загрузить фото</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Phrases (Контрольные поисковые фразы для точного кросс-поиска) */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 mb-8 relative overflow-hidden shadow-lg shadow-indigo-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Контрольные фразы для точного поиска модели</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Без лишнего спама
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Маркетплейсы WB и Я.Маркет выдают сотни посторонних товаров по общим словам. Мы ищем по чистому коду модели:
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold font-mono">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>{activeControlPhrase || product.controlPhrase || product.brand}</span>
            </span>
          </div>
        </div>

        {/* Quick Click Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[11px] text-slate-400 font-medium">Рекомендуемые фразы:</span>
          {product.controlOptions && product.controlOptions.length > 0 ? (
            product.controlOptions.map((opt, i) => {
              const isCurrent = activeControlPhrase.toLowerCase() === opt.toLowerCase().replace(/^артикул:\s*/i, '');
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyControlPhrase(opt)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-950/80 text-slate-300 border-slate-700 hover:border-indigo-400 hover:text-white'
                  }`}
                >
                  <Search className="w-3 h-3 text-indigo-400" />
                  <span>{opt}</span>
                </button>
              );
            })
          ) : (
            <button
              type="button"
              onClick={() => handleApplyControlPhrase(`${product.brand} ${product.sku}`)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-950/80 text-slate-300 border border-slate-700 hover:border-indigo-400"
            >
              {product.brand} {product.sku}
            </button>
          )}
        </div>

        {/* Custom Phrase Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-800/80">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customQueryInput}
              onChange={(e) => setCustomQueryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyControlPhrase(customQueryInput);
                }
              }}
              placeholder={`Уточнить запрос модели, например: ${product.brand} CW-7420W`}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <button
            type="button"
            onClick={() => handleApplyControlPhrase(customQueryInput)}
            disabled={!customQueryInput.trim()}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Обновить ссылки 5 магазинов</span>
          </button>
        </div>

        {/* Notice on update */}
        {queryNotice && (
          <div className="mt-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{queryNotice}</span>
          </div>
        )}
      </div>

      {/* Best Deal Winner Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-2 border-emerald-500/70 rounded-2xl p-5 sm:p-6 mb-8 shadow-xl shadow-emerald-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Самая низкая цена в РФ прямо сейчас</span>
            </div>

            <div className="flex items-center gap-2">
              <span 
                className="text-xs font-bold px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: bestConfig.color }}
              >
                {bestConfig.badge}
              </span>
              <span className="text-base sm:text-lg font-bold text-white">
                {bestConfig.name}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono tabular-nums">
                {formatPrice(bestOffer.effectivePrice)}
              </span>
              {bestOffer.oldPrice > bestOffer.effectivePrice && (
                <span className="text-base text-slate-400 line-through font-mono tabular-nums">
                  {formatPrice(bestOffer.oldPrice)}
                </span>
              )}
            </div>

            {availableOffers.length === 1 ? (
              <p className="text-xs sm:text-sm text-amber-300/90 font-medium">
                ⚡ Товар в наличии только на {bestConfig.name}. На остальных площадках модель временно отсутствует.
              </p>
            ) : maxSavings > 0 ? (
              <p className="text-xs sm:text-sm text-slate-300">
                Экономия до <span className="text-emerald-300 font-semibold">{formatPrice(maxSavings)} ({savingsPercent}%)</span> по сравнению с другим магазином.
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-slate-300">
                Минимальная подтвержденная цена на российских маркетплейсах.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <a
              href={bestOffer.isDirectLink && bestOffer.url.startsWith('http')
                ? bestOffer.url
                : buildTargetedMarketplaceUrl(bestOffer.marketplace, bestOffer.searchQuery || activeControlPhrase || product.controlPhrase || product.title, false, product.sourceUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              <span>{bestOffer.isDirectLink ? `Купить на ${bestConfig.name}` : `Искать на ${bestConfig.name}`}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Comparison Grid Across All 5 Marketplaces */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Сравнение цен на всех маркетплейсах</span>
          </h3>
          <span className="text-xs text-slate-400">Цены актуальны на сегодня</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sortedOffers.map((offer, idx) => {
            const config = MARKETPLACE_CONFIGS[offer.marketplace];
            const isAvailable = offer.inStock !== false && 
                                offer.effectivePrice > 0 && 
                                offer.availabilityStatus !== 'not_found' && 
                                offer.availabilityStatus !== 'out_of_stock';
            const isCheapest = isAvailable && idx === 0;
            const diffWithCheapest = isAvailable ? offer.effectivePrice - bestOffer.effectivePrice : 0;
            const activeQuery = offer.searchQuery || activeControlPhrase || product.controlPhrase || product.title;
            const effectiveOfferUrl = offer.isDirectLink && offer.url.startsWith('http')
              ? offer.url
              : buildTargetedMarketplaceUrl(offer.marketplace, activeQuery, false, product.sourceUrl);

            const domain = MARKETPLACE_DOMAINS[offer.marketplace] || `${offer.marketplace}.ru`;
            const siteSearchUrl = buildMarketplaceSiteSearchUrl(domain, activeQuery);

            return (
              <div 
                key={offer.marketplace}
                className={`rounded-xl p-4 transition-all flex flex-col justify-between ${
                  isCheapest 
                    ? 'bg-slate-900/90 border-2 border-emerald-500/80 shadow-md shadow-emerald-500/10' 
                    : !isAvailable
                    ? 'bg-slate-950/60 border border-slate-800/60 opacity-85'
                    : 'bg-slate-900/60 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Marketplace Title Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-xs font-bold px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: config.color }}
                      >
                        {config.badge}
                      </span>
                      <span className="text-sm font-semibold text-slate-200">
                        {config.name}
                      </span>
                    </div>

                    {isCheapest ? (
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Минимальная цена
                      </span>
                    ) : !isAvailable ? (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Нет в наличии
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-400 tabular-nums">
                        +{formatPrice(diffWithCheapest)}
                      </span>
                    )}
                  </div>

                  {/* Price display */}
                  <div className="mb-2">
                    {isAvailable ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-2xl font-bold font-mono tabular-nums ${isCheapest ? 'text-emerald-400' : 'text-white'}`}>
                            {formatPrice(offer.effectivePrice)}
                          </span>
                          {offer.oldPrice > offer.effectivePrice && (
                            <span className="text-xs text-slate-500 line-through font-mono tabular-nums">
                              {formatPrice(offer.oldPrice)}
                            </span>
                          )}
                        </div>

                        {usePersonalDiscounts && (
                          <div className="text-[11px] text-indigo-300 mt-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span>Скидка аккаунта: {config.personalDiscountLabel} (-{offer.personalDiscountPercent}%)</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="py-0.5">
                        <span className="text-base font-bold text-slate-400">
                          Товар не найден
                        </span>
                        <p className="text-[11px] text-amber-400/90 mt-1 leading-relaxed">
                          {offer.availabilityNote || 'Точная модель на этой площадке отсутствует у продавцов.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Seller & Delivery */}
                  <div className="space-y-1 pt-2 border-t border-slate-800/60 text-xs text-slate-400 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 truncate max-w-[180px]">
                        <Store className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{offer.sellerName}</span>
                      </span>
                      {isAvailable && (
                        <span className="flex items-center gap-0.5 text-amber-400 font-mono text-[11px]">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {offer.sellerRating}
                        </span>
                      )}
                    </div>

                    {isAvailable && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{offer.deliverySpeed}</span>
                        </span>
                        <span className="text-slate-300 font-medium">{offer.deliveryDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Targeted Query Info with Copy Button */}
                  <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-800/80 mb-3 text-[11px]">
                    <div className="flex items-center justify-between gap-1 text-slate-400 mb-1">
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <Target className="w-3 h-3 text-indigo-400" />
                        <span>{isAvailable ? 'Поисковая фраза:' : 'Поиск аналогов:'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPhrase(activeQuery, offer.marketplace)}
                        className="text-slate-400 hover:text-white flex items-center gap-0.5"
                        title="Скопировать фразу"
                      >
                        {copiedQueryMarketplace === offer.marketplace ? (
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            <span>Скопировано</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-[10px]">
                            <Copy className="w-3 h-3" />
                            <span>Копия</span>
                          </span>
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-slate-200 truncate font-semibold">
                      «{activeQuery}»
                    </div>
                    <div className="text-[10px] text-emerald-400/90 mt-0.5 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      <span>{isAvailable ? 'Авто-фильтр: минимальная цена' : 'Поиск похожих товаров категории'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                  <a
                    href={effectiveOfferUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
                      isCheapest
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                        : isAvailable
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    <span>
                      {offer.isDirectLink 
                        ? `Купить за ${formatPrice(offer.personalPrice)} на ${config.name}` 
                        : isAvailable 
                        ? `Купить за ~${formatPrice(offer.personalPrice)} на ${config.name}` 
                        : `Искать аналоги на ${config.name}`}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* 3 Fallback & Alternative routes: Яндекс.Покупки, Яндекс Site:Search & Привязать артикул */}
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    <a
                      href={buildYandexProductsUrl(activeQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-1.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center gap-1 transition-colors text-center"
                      title="Открыть через Яндекс.Покупки — официальный агрегатор всех маркетплейсов РФ (без блокировок и капчи)"
                    >
                      <Compass className="w-3 h-3 text-red-400 shrink-0" />
                      <span className="truncate">Я.Покупки</span>
                    </a>

                    <a
                      href={siteSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-1.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center gap-1 transition-colors text-center"
                      title={`Прямой поиск по сайту ${domain} через Яндекс — мгновенно находит прямые карточки товаров`}
                    >
                      <Search className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">site:{config.badge}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setBindingMarketplace(offer.marketplace);
                        setDirectSkuInput(offer.directSku || '');
                        setDirectUrlInput(offer.isDirectLink ? offer.url : '');
                      }}
                      className="px-1.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center justify-center gap-1 transition-colors cursor-pointer text-center"
                      title="Привязать точный артикул товара на этом маркетплейсе"
                    >
                      <Link2 className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="truncate">{offer.isDirectLink ? 'Сменить' : 'Ввести SKU'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Troubleshooting Hub: Если поиск на маркетплейсе не сработал */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Wrench className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <span>Не открывается поиск при переходе по ссылке?</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                3 надежных способа
              </span>
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Российские маркетплейсы часто блокируют внешние ссылки поиска антиботами или сбрасывают запрос на главную. Используйте один из надежных путей:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <a
                href={buildYandexProductsUrl(activeControlPhrase || product.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500/40 flex flex-col justify-between transition-colors group"
              >
                <div>
                  <span className="font-bold text-white flex items-center gap-1.5 group-hover:text-red-400 mb-1">
                    <Compass className="w-3.5 h-3.5 text-red-400" />
                    <span>1. Яндекс.Покупки</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Официальный агрегатор без блокировок. Показывает прямые ссылки на всех продавцов WB, Ozon и Я.Маркета.
                  </span>
                </div>
                <span className="mt-2 text-[10px] text-red-400 font-semibold flex items-center gap-1">
                  <span>Открыть поиск</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </a>

              <a
                href={buildVisualSearchUrl('yandex', product.imageUrl, product.title, activeControlPhrase)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/40 flex flex-col justify-between transition-colors group"
              >
                <div>
                  <span className="font-bold text-white flex items-center gap-1.5 group-hover:text-sky-400 mb-1">
                    <Camera className="w-3.5 h-3.5 text-sky-400" />
                    <span>2. Поиск по фото</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Яндекс.Картинки находят 100% идентичных товаров по фотографии комплекта, минуя несовпадения в названиях.
                  </span>
                </div>
                <span className="mt-2 text-[10px] text-sky-400 font-semibold flex items-center gap-1">
                  <span>Искать по картинке</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(activeControlPhrase || product.title);
                  setQueryNotice('Контрольная фраза скопирована! Вставьте ее прямо в приложении Wildberries или Ozon.');
                  setTimeout(() => setQueryNotice(null), 4000);
                }}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 flex flex-col justify-between text-left transition-colors group cursor-pointer"
              >
                <div>
                  <span className="font-bold text-white flex items-center gap-1.5 group-hover:text-emerald-400 mb-1">
                    <Copy className="w-3.5 h-3.5 text-emerald-400" />
                    <span>3. Копия для приложения</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Скопируйте очищенную фразу модели и вставьте прямо в поисковую строку приложения на смартфоне.
                  </span>
                </div>
                <span className="mt-2 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span>Скопировать фразу</span>
                  <Check className="w-2.5 h-2.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Box: Not Satisfied with Price? Activate Tracking! */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
            <BellRing className="w-3.5 h-3.5 animate-bounce" />
            <span>Не устраивает текущая цена?</span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            Активируйте отслеживание и получите сигнал в Telegram
          </h3>

          <p className="text-xs sm:text-sm text-slate-400 mb-5 leading-relaxed">
            Робот будет регулярно сканировать Ozon, Wildberries, Я.Маркет и AliExpress. Как только цена снизится — вы мгновенно получите уведомление в ваш Telegram-бот с суммой экономии и прямой ссылкой на покупку.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-400">
                Желаемая цена:
              </span>
              <input
                type="text"
                value={customTargetPrice}
                onChange={(e) => setCustomTargetPrice(e.target.value)}
                placeholder={`Например: ${Math.round(bestOffer.effectivePrice * 0.9)} ₽ (или любое снижение)`}
                className="w-full pl-32 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={handleActivateTracking}
              disabled={isAlreadyTracked}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isAlreadyTracked
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
              }`}
            >
              {isAlreadyTracked ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Уже отслеживается</span>
                </>
              ) : trackingActivatedFeedback ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Отслеживание включено!</span>
                </>
              ) : (
                <>
                  <BellRing className="w-4 h-4" />
                  <span>Включить мониторинг</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-slate-500" />
              Лимит вашего тарифа: {currentPlan === 'free' ? '1 товар' : currentPlan === 'standard' ? '5 товаров' : '10 товаров'}
            </span>
            <button
              onClick={openUpgradeModal}
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
            >
              Увеличить лимит тарифа
            </button>
          </div>
        </div>
      </div>

      {/* Quick Image Customization Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>Фото товара</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Вставить прямую ссылку на фото:
                </label>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* File Upload for custom photo or screenshot */}
              <div className="pt-1">
                <label className="block text-slate-300 font-semibold mb-1">
                  Или загрузить скриншот / фото товара:
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-sky-600/90 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Выбрать файл (скриншот Ozon / WB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const r = new FileReader();
                          r.onload = () => {
                            if (typeof r.result === 'string') {
                              setEditImageUrl(r.result);
                            }
                          };
                          r.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Sample Photo Presets */}
              <div>
                <label className="block text-slate-400 font-medium mb-1.5">
                  Быстрый выбор из каталога:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { name: 'Швабра Smart Mop', url: SMART_MOP_SVG },
                    { name: 'Обогреватель GoldStar', url: GOLDSTAR_HEATER_SVG },
                    { name: 'Швабра (фото)', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Обогреватель (фото)', url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80' },
                    { name: 'iPhone 16', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Sony Наушники', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Робот-пылесос', url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80' },
                    { name: 'Dyson Стайлер', url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditImageUrl(p.url)}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        editImageUrl === p.url 
                          ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-12 object-contain bg-slate-900 rounded mb-1" />
                      <span className="text-[10px] block truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => handleQuickChangeImage(editImageUrl)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                Сохранить фото
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>Уточнить данные товара</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Название товара:
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Бренд:
                  </label>
                  <input
                    type="text"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Базовая цена ({MARKETPLACE_CONFIGS[product.sourceMarketplace].name}):
                  </label>
                  <input
                    type="text"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="2825"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Цена со скидкой (Ozon Карта / СПП WB), ₽:
                </label>
                <input
                  type="text"
                  value={editPersonalPrice}
                  onChange={(e) => setEditPersonalPrice(e.target.value)}
                  placeholder="2543"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-bold font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Например, со скриншота: <strong>2 543 ₽</strong> с Ozon Банком / <strong>2 825 ₽</strong> без банка.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Ссылка на фото товара (URL, опционально):
                </label>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveEdits}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Применить изменения</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct SKU / Link Binding Modal */}
      {bindingMarketplace && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-sky-400" />
                <span>Привязать прямую ссылку {MARKETPLACE_CONFIGS[bindingMarketplace].name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setBindingMarketplace(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Если поиск в магазине выдает не тот товар, укажите точный артикул или ссылку на карточку товара в {MARKETPLACE_CONFIGS[bindingMarketplace].name}. Кнопка станет прямой и всегда будет открывать именно этот товар!
            </p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Точный артикул товара на {MARKETPLACE_CONFIGS[bindingMarketplace].name}:
                </label>
                <input
                  type="text"
                  value={directSkuInput}
                  onChange={(e) => setDirectSkuInput(e.target.value)}
                  placeholder="Например: 143892019"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Или полная ссылка на карточку товара:
                </label>
                <input
                  type="text"
                  value={directUrlInput}
                  onChange={(e) => setDirectUrlInput(e.target.value)}
                  placeholder={`https://www.${MARKETPLACE_CONFIGS[bindingMarketplace].domain}/...`}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setBindingMarketplace(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => handleSaveDirectLink(bindingMarketplace)}
                disabled={!directSkuInput.trim() && !directUrlInput.trim()}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-sky-600/30 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Закрепить товар</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
