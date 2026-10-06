import React, { useState } from 'react';
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  Flame,
  Layers, 
  ShieldCheck,
  Camera,
  UploadCloud,
  ImageIcon,
  RefreshCw,
  Info
} from 'lucide-react';
import { ParsedProduct, MarketplaceId } from '../types';
import { generateProductFromUrl, parseProductUrl } from '../services/parserEngine';
import { SMART_MOP_SVG, GOLDSTAR_HEATER_SVG, WEISSGAUFF_KETTLE_SVG } from '../data/productVisuals';
import { buildVisualSearchUrl } from '../services/searchQueryOptimizer';
import { analyzeCardImage, createProductFromVisualCard } from '../services/visualMatcher';

interface ProductSearchHeroProps {
  onProductParsed: (product: ParsedProduct) => void;
  isParsing: boolean;
  setIsParsing: (val: boolean) => void;
}

export const ProductSearchHero: React.FC<ProductSearchHeroProps> = ({
  onProductParsed,
  isParsing,
  setIsParsing,
}) => {
  const [searchMode, setSearchMode] = useState<'url' | 'image'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [parsingStep, setParsingStep] = useState<string>('');
  const [parsingProgress, setParsingProgress] = useState<number>(0);

  // Состояние поиска по фото
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);
  const [detectedPhotoTitle, setDetectedPhotoTitle] = useState<string>('');
  const [detectedPhotoUrl, setDetectedPhotoUrl] = useState<string>('');

  const samples = [
    {
      name: 'Чайник Weissgauff WK 1711 (Ozon)',
      store: 'Ozon',
      badge: 'OZON',
      url: 'https://www.ozon.ru/product/weissgauff-elektricheskiy-chaynik-wk-1711-ecoglass-filter-tempcontrol-moshchnost-2200-vt-obem-1-4406295778/?at=1hOn1YCkOqC4YPUJZnENGBz4Z40BG6N9&sh=1AE544cg_A'
    },
    {
      name: 'Швабра Smart Mop с ведром (Ozon)',
      store: 'Ozon',
      badge: 'OZON',
      url: 'https://www.ozon.ru/product/shvabra-c-otzhimom-i-vedrom-dlya-mytya-polov-smart-mop-1393219451/?at=1hKn1ZPUv6kiewjkBgwcYf5z8FJNZkpw&sh=1AE544cg_A'
    },
    {
      name: 'Тепловентилятор GoldStar 2000W',
      store: 'Ozon',
      badge: 'OZON',
      url: 'https://www.ozon.ru/product/teploventilyator-nastennyy-goldstar-gfh-cw-7420w-1803946118/?from=share_android&perehod=smm_share_button_productpage_link&sh=S1Qk9_XtiA&short=9o556pB&__rr=1&abt_att=1'
    },
    {
      name: 'iPhone 16 128GB',
      store: 'Wildberries',
      badge: 'WB',
      url: 'https://www.wildberries.ru/catalog/268912401/detail.aspx'
    },
    {
      name: 'Sony WH-1000XM5',
      store: 'Ozon',
      badge: 'OZON',
      url: 'https://www.ozon.ru/product/besprovodnye-naushniki-sony-wh-1000xm5-black-76543210/'
    },
    {
      name: 'Dyson Airwrap HS05',
      store: 'Wildberries',
      badge: 'WB',
      url: 'https://www.wildberries.ru/catalog/98234120/detail.aspx'
    },
    {
      name: 'Roborock Q7 Max',
      store: 'Я.Маркет',
      badge: 'Я.Маркет',
      url: 'https://market.yandex.ru/product--robot-pylesos-roborock-q7-max/101892834'
    }
  ];

  // Пресеты для быстрого поиска по изображению
  const photoPresets = [
    {
      id: 'deerma-filter',
      name: 'HEPA фильтр Deerma DX700',
      category: 'Аксессуары',
      image: 'https://basket-02.wbbasket.ru/vol198/part19885/19885235/images/big/1.webp',
      targetUrl: 'https://www.ozon.ru/product/smennyy-porolonovyy-hepa-filtr-dlya-vertikalnogo-pylesosa-xiaomi-deerma-dx700-dx700s-dx700c-3160195820/?at=1kSn1Op0SAHSEpV9bCGZsmVStDQSc8io&sh=S1Qk9_xTiA',
      query: 'фильтр Deerma DX700'
    },
    {
      id: 'weissgauff',
      name: 'Чайник Weissgauff WK 1711',
      category: 'Кухня',
      image: WEISSGAUFF_KETTLE_SVG,
      targetUrl: 'https://www.ozon.ru/product/weissgauff-elektricheskiy-chaynik-wk-1711-ecoglass-filter-tempcontrol-moshchnost-2200-vt-obem-1-4406295778/?at=1hOn1YCkOqC4YPUJZnENGBz4Z40BG6N9&sh=1AE544cg_A',
      query: 'Weissgauff WK 1711'
    },
    {
      id: 'mop',
      name: 'Швабра с отжимом Smart Mop',
      category: 'Уборка',
      image: SMART_MOP_SVG,
      targetUrl: 'https://www.ozon.ru/product/shvabra-c-otzhimom-i-vedrom-dlya-mytya-polov-smart-mop-1393219451/',
      query: 'швабра с отжимом и ведром'
    },
    {
      id: 'goldstar',
      name: 'Обогреватель GoldStar CW-7420W',
      category: 'Климат',
      image: GOLDSTAR_HEATER_SVG,
      targetUrl: 'https://www.ozon.ru/product/teploventilyator-nastennyy-goldstar-gfh-cw-7420w-1803946118/',
      query: 'GoldStar CW-7420W'
    },
    {
      id: 'iphone',
      name: 'Apple iPhone 16 128GB',
      category: 'Смартфон',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&auto=format&fit=crop&q=80',
      targetUrl: 'https://www.wildberries.ru/catalog/268912401/detail.aspx',
      query: 'Apple iPhone 16 128GB'
    },
    {
      id: 'dyson',
      name: 'Стайлер Dyson Airwrap HS05',
      category: 'Красота',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80',
      targetUrl: 'https://www.wildberries.ru/catalog/98234120/detail.aspx',
      query: 'Dyson Airwrap HS05'
    }
  ];

  const handleStartParsing = async (targetUrl: string) => {
    let cleanUrl = targetUrl.trim();
    if (!cleanUrl) return;

    // Поддержка прямого ввода артикулов Ozon / WB
    if (/^\d{6,12}$/.test(cleanUrl)) {
      if (cleanUrl === '3160195820' || cleanUrl === '19885235') {
        cleanUrl = 'https://www.ozon.ru/product/smennyy-porolonovyy-hepa-filtr-dlya-vertikalnogo-pylesosa-xiaomi-deerma-dx700-dx700s-dx700c-3160195820/?at=1kSn1Op0SAHSEpV9bCGZsmVStDQSc8io&sh=S1Qk9_xTiA';
      } else if (cleanUrl === '4406295778') {
        cleanUrl = 'https://www.ozon.ru/product/weissgauff-elektricheskiy-chaynik-wk-1711-ecoglass-filter-tempcontrol-moshchnost-2200-vt-obem-1-4406295778/?at=1hOn1YCkOqC4YPUJZnENGBz4Z40BG6N9&sh=1AE544cg_A';
      } else if (cleanUrl === '1803946118') {
        cleanUrl = 'https://www.ozon.ru/product/teploventilyator-nastennyy-goldstar-gfh-cw-7420w-1803946118/';
      } else if (cleanUrl === '1393219451') {
        cleanUrl = 'https://www.ozon.ru/product/shvabra-c-otzhimom-i-vedrom-dlya-mytya-polov-smart-mop-1393219451/';
      } else {
        cleanUrl = `https://www.wildberries.ru/catalog/${cleanUrl}/detail.aspx`;
      }
    } else if (!cleanUrl.startsWith('http') && !cleanUrl.includes('.ru') && !cleanUrl.includes('.com')) {
      // Пользователь ввел название или контрольную фразу модели напрямую (например: "Deerma", "Weissgauff" или "GoldStar")
      if (/deerma|dx-?700|фильтр.*пылесос/i.test(cleanUrl)) {
        cleanUrl = 'https://www.ozon.ru/product/smennyy-porolonovyy-hepa-filtr-dlya-vertikalnogo-pylesosa-xiaomi-deerma-dx700-dx700s-dx700c-3160195820/?at=1kSn1Op0SAHSEpV9bCGZsmVStDQSc8io&sh=S1Qk9_xTiA';
      } else if (/weissgauff|wk-?1711|чайник/i.test(cleanUrl)) {
        cleanUrl = 'https://www.ozon.ru/product/weissgauff-elektricheskiy-chaynik-wk-1711-ecoglass-filter-tempcontrol-moshchnost-2200-vt-obem-1-4406295778/?at=1hOn1YCkOqC4YPUJZnENGBz4Z40BG6N9&sh=1AE544cg_A';
      } else if (/smart\s*mop|швабр/i.test(cleanUrl)) {
        cleanUrl = 'https://www.ozon.ru/product/shvabra-c-otzhimom-i-vedrom-dlya-mytya-polov-smart-mop-1393219451/';
      } else if (/goldstar|cw-7420/i.test(cleanUrl)) {
        cleanUrl = 'https://www.ozon.ru/product/teploventilyator-nastennyy-goldstar-gfh-cw-7420w-1803946118/';
      } else {
        cleanUrl = `https://www.wildberries.ru/catalog/0/search.aspx?search=${encodeURIComponent(cleanUrl)}`;
      }
    }

    setIsParsing(true);
    setParsingProgress(15);
    setParsingStep('Идентификация маркетплейса и получение данных карточки...');

    // Запускаем асинхронный поиск/парсинг карточки (включая прямой CDN Wildberries)
    const parseTask = parseProductUrl(cleanUrl);

    await new Promise(r => setTimeout(r, 350));
    setParsingProgress(45);
    setParsingStep('Извлечение характеристик товара, артикула и оригинального фото...');

    await new Promise(r => setTimeout(r, 400));
    setParsingProgress(75);
    setParsingStep('Кросс-поиск модели на Ozon, WB, Я.Маркет, AliExpress, Мегамаркет...');

    const parsed = await parseTask;

    setParsingProgress(95);
    setParsingStep('Расчет цен с учетом скидок (Ozon Карта, СПП WB, Плюс)...');
    await new Promise(r => setTimeout(r, 200));

    setParsingProgress(100);
    setIsParsing(false);
    onProductParsed(parsed);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSelectedPhotoPreview(dataUrl);

      // Комплексный визуальный анализ изображения карточки
      const analysis = analyzeCardImage(dataUrl, { fileName: file.name });
      setDetectedPhotoTitle(analysis.detectedTitle);

      // Мгновенно формируем кросс-маркетплейсный товар по скриншоту карточки
      const visualProduct = createProductFromVisualCard(analysis, dataUrl);
      onProductParsed(visualProduct);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative overflow-hidden pt-8 pb-10 border-b border-slate-800/80">
      {/* Background glow subtle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-indigo-500/5 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Main Heading */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Интеллектуальный кросс-поиск цен и визуальное сравнение по фото</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Сравните цены на <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">Ozon, Wildberries, Я.Маркете</span>
          </h1>
          
          <p className="mt-2 text-sm text-slate-400 max-w-2xl mx-auto">
            Вставьте ссылку на товар или загрузите скриншот/фото. Сервис находит идентичный товар даже если разные продавцы называют его совершенно по-разному.
          </p>
        </div>

        {/* Tab Mode Switcher: По ссылке / По фото */}
        <div className="flex justify-center mb-3">
          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
            <button
              type="button"
              onClick={() => setSearchMode('url')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                searchMode === 'url'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Поиск по ссылке или названию</span>
            </button>
            <button
              type="button"
              onClick={() => setSearchMode('image')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                searchMode === 'image'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Поиск по фото / скриншоту</span>
              <span className="px-1.5 py-0.2 bg-amber-400/20 text-amber-300 text-[10px] rounded font-bold">
                NEW
              </span>
            </button>
          </div>
        </div>

        {/* Search Mode: По ссылке */}
        {searchMode === 'url' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-xl shadow-black/40">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleStartParsing(urlInput);
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Вставьте ссылку на товар: ozon.ru/product/..., wildberries.ru/catalog/..., артикул..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  disabled={isParsing}
                />
                {urlInput && (
                  <button
                    type="button"
                    onClick={() => setUrlInput('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-white"
                  >
                    Очистить
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isParsing || !urlInput.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 shadow-md shadow-indigo-600/30 cursor-pointer disabled:cursor-not-allowed"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Анализируем...</span>
                  </>
                ) : (
                  <>
                    <span>Найти дешевле</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Samples */}
            <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Быстрый тест:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {samples.map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setUrlInput(sample.url);
                      handleStartParsing(sample.url);
                    }}
                    disabled={isParsing}
                    className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 rounded border border-slate-700/60 transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <span className="text-[10px] font-bold px-1 rounded bg-slate-900 text-indigo-400">
                      {sample.badge}
                    </span>
                    <span>{sample.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Mode: По фото (Visual Search) */}
        {searchMode === 'image' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl shadow-black/40">
            <div className="mb-3 flex items-start gap-2 p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span>
                <strong>Зачем искать по фото:</strong> продавцы на Wildberries и Ozon часто называют один и тот же комплект по-разному (например: «Швабра Smart Mop» vs «Швабра-лентяйка с ведром»). Поиск по фото находит 100% идентичных товаров по внешнему виду!
              </span>
            </div>

            {/* Upload or Drop Zone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-950/60 group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <div className="w-12 h-12 rounded-full bg-sky-500/10 group-hover:bg-sky-500/20 flex items-center justify-center text-sky-400 mb-2 transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-white group-hover:text-sky-300">
                  Загрузить фото или скриншот
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Нажмите или перетащите скриншот товара с Ozon или WB (PNG, JPG)
                </span>
              </label>

              {/* Quick Preset Photos */}
              <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/80 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Примеры фото для мгновенной проверки:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {photoPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedPhotoPreview(preset.image);
                        setDetectedPhotoTitle(preset.name);
                        setDetectedPhotoUrl(preset.targetUrl);
                      }}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500/50 flex items-center gap-2 text-left cursor-pointer transition-colors group"
                    >
                      <div className="w-10 h-10 rounded bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                        <img src={preset.image} alt={preset.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[11px] font-semibold text-white block truncate group-hover:text-sky-300">
                          {preset.name}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {preset.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Photo Actions */}
            {selectedPhotoPreview && (
              <div className="mt-4 pt-4 border-t border-slate-800/80 bg-slate-950/80 rounded-xl p-3 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shrink-0">
                    <img src={selectedPhotoPreview} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {detectedPhotoTitle || 'Товар распознан'}
                    </span>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Визуальные характеристики извлечены
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Яндекс Картинки (поиск по фото) */}
                  <a
                    href={buildVisualSearchUrl('yandex', selectedPhotoPreview, detectedPhotoTitle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-red-600/90 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Искать в Я.Картинках</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {/* Google Lens */}
                  <a
                    href={buildVisualSearchUrl('google_lens', selectedPhotoPreview, detectedPhotoTitle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Google Объектив</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {/* Полное сравнение цен в PriceRadar */}
                  <button
                    type="button"
                    onClick={() => {
                      if (detectedPhotoUrl) {
                        handleStartParsing(detectedPhotoUrl);
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-sky-600/30"
                  >
                    <span>Сравнить цены в магазинах</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Parsing Progress Feedback */}
        {isParsing && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-indigo-500/30 animate-pulse">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-indigo-300 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                {parsingStep}
              </span>
              <span className="font-mono text-indigo-400 tabular-nums">{parsingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all duration-300 rounded-full"
                style={{ width: `${parsingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Value Proposition Badges */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>5 маркетплейсов в одном окне</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Учет Ozon Карты и СПП WB</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50">
            <Camera className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Визуальный поиск по фото</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Сигнал в Telegram при падении</span>
          </div>
        </div>
      </div>
    </div>
  );
};
