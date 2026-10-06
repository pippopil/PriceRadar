import { CustomProductWatch, StoreLink, MarketplaceId } from '../types';
import { 
  getTelegramConfig, 
  sendTelegramNotification, 
  formatMultiStorePriceDropAlert 
} from './telegramService';

const STORAGE_KEY = 'priceradar_custom_watches';

const INITIAL_WATCHES: CustomProductWatch[] = [
  {
    id: 'watch-deerma-filter',
    title: 'Сменный HEPA фильтр для пылесоса Xiaomi Deerma DX700 / DX700S',
    imageUrl: 'https://basket-02.wbbasket.ru/vol198/part19885/19885235/images/big/1.webp',
    category: 'Бытовая техника / Аксессуары для пылесосов / Фильтры',
    targetPrice: 200,
    lowestPrice: 195,
    lowestStore: 'AliExpress',
    createdAt: '2026-10-01T10:00:00Z',
    lastCheckedAt: 'Сегодня, 10:20',
    status: 'active',
    links: [
      {
        id: 'link-deerma-ali',
        marketplace: 'aliexpress',
        storeName: 'AliExpress (Экспресс РФ)',
        url: 'https://aliexpress.ru/wholesale?SearchText=%D1%84%D0%B8%D0%BB%D1%8C%D1%82%D1%80+Deerma+DX700',
        currentPrice: 195,
        oldPrice: 350,
        inStock: true,
        lastCheckedAt: 'Сегодня, 10:20',
        isLowest: true
      },
      {
        id: 'link-deerma-wb',
        marketplace: 'wildberries',
        storeName: 'Wildberries (Run Energy)',
        url: 'https://www.wildberries.ru/catalog/19885235/detail.aspx',
        directSku: '19885235',
        currentPrice: 239,
        oldPrice: 490,
        inStock: true,
        lastCheckedAt: 'Сегодня, 10:20',
        isLowest: false
      },
      {
        id: 'link-deerma-ozon',
        marketplace: 'ozon',
        storeName: 'Ozon (Магазин фильтров)',
        url: 'https://www.ozon.ru/product/smennyy-porolonovyy-hepa-filtr-dlya-vertikalnogo-pylesosa-xiaomi-deerma-dx700-dx700s-dx700c-3160195820/?at=1kSn1Op0SAHSEpV9bCGZsmVStDQSc8io&sh=S1Qk9_xTiA',
        directSku: '3160195820',
        currentPrice: 248,
        oldPrice: 520,
        inStock: true,
        lastCheckedAt: 'Сегодня, 10:20',
        isLowest: false
      },
      {
        id: 'link-deerma-yandex',
        marketplace: 'yandex',
        storeName: 'Яндекс Маркет',
        url: 'https://market.yandex.ru/search?text=HEPA+%D1%84%D0%B8%D0%BB%D1%8C%D1%82%D1%80+Deerma+DX700',
        currentPrice: 269,
        oldPrice: 550,
        inStock: true,
        lastCheckedAt: 'Сегодня, 10:20',
        isLowest: false
      },
      {
        id: 'link-deerma-megamarket',
        marketplace: 'megamarket',
        storeName: 'Мегамаркет Ритейл',
        url: 'https://megamarket.ru/catalog/?q=%D1%84%D0%B8%D0%BB%D1%8C%D1%82%D1%80+%D0%B4%D0%BB%D1%8F+%D0%BF%D1%8B%D0%BB%D0%B5%D1%81%D0%BE%D1%81%D0%B0+Deerma+DX700',
        currentPrice: 279,
        oldPrice: 560,
        inStock: true,
        lastCheckedAt: 'Сегодня, 10:20',
        isLowest: false
      }
    ],
    priceHistory: [
      { timestamp: '01 окт', storeName: 'AliExpress', price: 195, isLowestAcrossAll: true },
      { timestamp: '01 окт', storeName: 'Wildberries', price: 239, isLowestAcrossAll: false },
      { timestamp: '01 окт', storeName: 'Ozon', price: 248, isLowestAcrossAll: false }
    ],
    alertHistory: []
  },
  {
    id: 'watch-weissgauff-kettle',
    title: 'Электрический чайник Weissgauff WK 1711 EcoGlass Filter TempControl',
    imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop&q=80',
    category: 'Бытовая техника / Техника для кухни / Электрические чайники',
    targetPrice: 2000,
    lowestPrice: 2127,
    lowestStore: 'Ozon',
    createdAt: '2026-10-02T12:00:00Z',
    lastCheckedAt: 'Сегодня, 09:45',
    status: 'active',
    links: [
      {
        id: 'link-kettle-ozon',
        marketplace: 'ozon',
        storeName: 'Ozon (Официальный Weissgauff)',
        url: 'https://www.ozon.ru/product/weissgauff-elektricheskiy-chaynik-wk-1711-ecoglass-filter-tempcontrol-moshchnost-2200-vt-obem-1-4406295778/',
        directSku: '4406295778',
        currentPrice: 2127,
        oldPrice: 4785,
        inStock: true,
        lastCheckedAt: 'Сегодня, 09:45',
        isLowest: true
      },
      {
        id: 'link-kettle-ali',
        marketplace: 'aliexpress',
        storeName: 'AliExpress (Weissgauff Store)',
        url: 'https://aliexpress.ru/search?text=Weissgauff%20WK%201711',
        currentPrice: 2150,
        oldPrice: 4600,
        inStock: true,
        lastCheckedAt: 'Сегодня, 09:45',
        isLowest: false
      },
      {
        id: 'link-kettle-wb',
        marketplace: 'wildberries',
        storeName: 'Wildberries (Weissgauff Official)',
        url: 'https://www.wildberries.ru/catalog/0/search.aspx?search=Weissgauff%20WK%201711',
        currentPrice: 2190,
        oldPrice: 4890,
        inStock: true,
        lastCheckedAt: 'Сегодня, 09:45',
        isLowest: false
      },
      {
        id: 'link-kettle-yandex',
        marketplace: 'yandex',
        storeName: 'Яндекс Маркет',
        url: 'https://market.yandex.ru/search?text=Weissgauff+WK+1711',
        currentPrice: 2290,
        oldPrice: 4990,
        inStock: true,
        lastCheckedAt: 'Сегодня, 09:45',
        isLowest: false
      }
    ],
    priceHistory: [
      { timestamp: '02 окт', storeName: 'Ozon', price: 2127, isLowestAcrossAll: true },
      { timestamp: '02 окт', storeName: 'Wildberries', price: 2190, isLowestAcrossAll: false }
    ],
    alertHistory: []
  }
];

export function getCustomWatches(): CustomProductWatch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load custom watches from localStorage', e);
  }
  saveCustomWatches(INITIAL_WATCHES);
  return INITIAL_WATCHES;
}

export function saveCustomWatches(watches: CustomProductWatch[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watches));
  } catch (e) {
    console.warn('Failed to save custom watches to localStorage', e);
  }
}

/**
 * Добавляет новый товар с набором пользовательских ссылок из разных магазинов
 */
export function createCustomWatch(params: {
  title: string;
  category?: string;
  imageUrl?: string;
  targetPrice?: number;
  initialLinks: Array<{
    marketplace: MarketplaceId | 'other';
    storeName: string;
    url: string;
    currentPrice: number;
  }>;
}): CustomProductWatch {
  const watches = getCustomWatches();
  const id = `watch-${Date.now()}`;

  const links: StoreLink[] = params.initialLinks.map((l, idx) => ({
    id: `link-${id}-${idx}`,
    marketplace: l.marketplace,
    storeName: l.storeName,
    url: l.url,
    currentPrice: l.currentPrice,
    oldPrice: l.currentPrice,
    inStock: true,
    lastCheckedAt: 'Только что',
    isLowest: false
  }));

  // Находим минимальную цену среди всех ссылок
  let lowestPrice = Infinity;
  let lowestStore = '';
  links.forEach(l => {
    if (l.currentPrice < lowestPrice) {
      lowestPrice = l.currentPrice;
      lowestStore = l.storeName;
    }
  });

  links.forEach(l => {
    l.isLowest = l.currentPrice === lowestPrice;
  });

  const newWatch: CustomProductWatch = {
    id,
    title: params.title.trim(),
    category: params.category || 'Товары для мониторинга',
    imageUrl: params.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
    targetPrice: params.targetPrice || null,
    links,
    lowestPrice: lowestPrice === Infinity ? 0 : lowestPrice,
    lowestStore,
    createdAt: new Date().toISOString(),
    lastCheckedAt: 'Только что',
    status: 'active',
    priceHistory: [
      {
        timestamp: 'Сегодня',
        storeName: lowestStore,
        price: lowestPrice,
        isLowestAcrossAll: true
      }
    ],
    alertHistory: []
  };

  watches.unshift(newWatch);
  saveCustomWatches(watches);
  return newWatch;
}

/**
 * Добавляет новую ссылку на магазин в существующий товар
 */
export function addStoreLinkToWatch(
  watchId: string,
  linkData: {
    marketplace: MarketplaceId | 'other';
    storeName: string;
    url: string;
    currentPrice: number;
    directSku?: string;
  }
): CustomProductWatch | null {
  const watches = getCustomWatches();
  const watch = watches.find(w => w.id === watchId);
  if (!watch) return null;

  const newLink: StoreLink = {
    id: `link-${watchId}-${Date.now()}`,
    marketplace: linkData.marketplace,
    storeName: linkData.storeName,
    url: linkData.url,
    currentPrice: linkData.currentPrice,
    oldPrice: linkData.currentPrice,
    inStock: true,
    lastCheckedAt: 'Только что',
    directSku: linkData.directSku,
    isLowest: false
  };

  watch.links.push(newLink);

  // Пересчитываем минимум
  let min = Infinity;
  let minStore = '';
  watch.links.forEach(l => {
    if (l.currentPrice < min) {
      min = l.currentPrice;
      minStore = l.storeName;
    }
  });
  watch.lowestPrice = min;
  watch.lowestStore = minStore;
  watch.links.forEach(l => {
    l.isLowest = l.currentPrice === min;
  });

  saveCustomWatches(watches);
  return watch;
}

/**
 * Удаляет ссылку из товара
 */
export function removeStoreLinkFromWatch(watchId: string, linkId: string): CustomProductWatch | null {
  const watches = getCustomWatches();
  const watch = watches.find(w => w.id === watchId);
  if (!watch) return null;

  watch.links = watch.links.filter(l => l.id !== linkId);

  // Пересчитываем минимум
  if (watch.links.length > 0) {
    let min = Infinity;
    let minStore = '';
    watch.links.forEach(l => {
      if (l.currentPrice < min) {
        min = l.currentPrice;
        minStore = l.storeName;
      }
    });
    watch.lowestPrice = min;
    watch.lowestStore = minStore;
    watch.links.forEach(l => {
      l.isLowest = l.currentPrice === min;
    });
  }

  saveCustomWatches(watches);
  return watch;
}

/**
 * Обновляет цену конкретного магазина и запускает сравнение со всеми остальными магазинами.
 * Если цена ниже, чем во ВСЕХ остальных магазинах — отправляет сигнал в Telegram!
 */
export async function updateStorePriceAndCheckAlert(
  watchId: string,
  linkId: string,
  newPrice: number
): Promise<{ watch: CustomProductWatch; alertSent: boolean; message?: string }> {
  const watches = getCustomWatches();
  const watch = watches.find(w => w.id === watchId);
  if (!watch) throw new Error('Товар не найден');

  const link = watch.links.find(l => l.id === linkId);
  if (!link) throw new Error('Ссылка магазина не найдена');

  const oldPrice = link.currentPrice;
  link.oldPrice = oldPrice;
  link.currentPrice = newPrice;
  link.lastCheckedAt = 'Только что';

  // 1. Проверяем цены во всех ОСТАЛЬНЫХ магазинах этого товара
  const competitorLinks = watch.links.filter(l => l.id !== linkId && l.inStock);
  const bestCompetitor = competitorLinks.reduce(
    (min, curr) => (curr.currentPrice < min.currentPrice ? curr : min),
    competitorLinks[0]
  );

  const bestCompetitorPrice = bestCompetitor ? bestCompetitor.currentPrice : Infinity;
  const isLowerThanAllOthers = newPrice < bestCompetitorPrice;
  const hasPriceDropped = newPrice < oldPrice;

  // Обновляем общий минимум карточки
  let overallMin = Infinity;
  let overallMinStore = '';
  watch.links.forEach(l => {
    if (l.currentPrice < overallMin) {
      overallMin = l.currentPrice;
      overallMinStore = l.storeName;
    }
  });
  watch.lowestPrice = overallMin;
  watch.lowestStore = overallMinStore;
  watch.links.forEach(l => {
    l.isLowest = l.currentPrice === overallMin;
  });

  // Записываем точку в историю
  watch.priceHistory.push({
    timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    storeName: link.storeName,
    price: newPrice,
    isLowestAcrossAll: isLowerThanAllOthers
  });

  let alertSent = false;
  let alertMessage = '';

  const tgConfig = getTelegramConfig();

  // КЛЮЧЕВОЕ УСЛОВИЕ ПОЛЬЗОВАТЕЛЯ:
  // "в случае просадки цены в каком-то месте магазине идёт сравнение цены с другими магазинами,
  // если цена ниже чем везде то приходит сигнал в телеграмм бот о понижении цены"
  if (hasPriceDropped && isLowerThanAllOthers && tgConfig.isEnabled && tgConfig.botToken && tgConfig.chatId) {
    const formattedAlert = formatMultiStorePriceDropAlert({
      productTitle: watch.title,
      droppedStore: link.storeName,
      newPrice,
      oldPrice,
      bestCompetitorStore: bestCompetitor?.storeName || 'Другие магазины',
      bestCompetitorPrice: bestCompetitorPrice === Infinity ? oldPrice : bestCompetitorPrice,
      allStorePrices: watch.links.map(l => ({
        store: l.storeName,
        price: l.currentPrice,
        isWinner: l.id === link.id
      })),
      productUrl: link.url
    });

    const sendRes = await sendTelegramNotification(formattedAlert);
    alertSent = sendRes.success;

    const savings = bestCompetitorPrice === Infinity ? oldPrice - newPrice : bestCompetitorPrice - newPrice;

    watch.alertHistory.unshift({
      id: `alert-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      storeName: link.storeName,
      newPrice,
      oldPrice,
      savingsVsCompetitor: savings,
      message: `Цена в ${link.storeName} (${newPrice} ₽) стала самой низкой среди всех ваших магазинов! Экономия ${savings} ₽!`,
      telegramSent: alertSent
    });

    alertMessage = alertSent 
      ? `Сигнал успешно отправлен в Telegram бот!` 
      : `Цена ниже всех, но ошибка Telegram: ${sendRes.error}`;
  } else if (hasPriceDropped && !isLowerThanAllOthers) {
    alertMessage = `Цена в ${link.storeName} снизилась до ${newPrice} ₽, но в ${bestCompetitor?.storeName} всё еще дешевле (${bestCompetitor?.currentPrice} ₽). Сигнал не отправлен, так как цена не является абсолютным минимумом среди всех магазинов.`;
  }

  watch.lastCheckedAt = 'Только что';
  saveCustomWatches(watches);

  return { watch, alertSent, message: alertMessage };
}

/**
 * Симулирует просадку цены в выбранном магазине для моментальной проверки работы Telegram-бота
 */
export async function simulatePriceDropInStore(
  watchId: string,
  linkId: string,
  dropPercent = 15
): Promise<{ watch: CustomProductWatch; alertSent: boolean; message?: string }> {
  const watches = getCustomWatches();
  const watch = watches.find(w => w.id === watchId);
  if (!watch) throw new Error('Товар не найден');

  const link = watch.links.find(l => l.id === linkId);
  if (!link) throw new Error('Магазин не найден');

  // Рассчитываем цену так, чтобы она гарантированно стала ниже всех конкурентов
  const competitorPrices = watch.links.filter(l => l.id !== linkId).map(l => l.currentPrice);
  const minCompetitor = competitorPrices.length > 0 ? Math.min(...competitorPrices) : link.currentPrice;
  
  // Делаем цену на dropPercent ниже самого дешевого конкурента
  const targetDroppedPrice = Math.max(100, Math.round((minCompetitor * (1 - dropPercent / 100)) / 10) * 10);

  return updateStorePriceAndCheckAlert(watchId, linkId, targetDroppedPrice);
}
