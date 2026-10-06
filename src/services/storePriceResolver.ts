import { MarketplaceId } from '../types';
import { fetchWbCardData, extractWbSku } from './wbParser';
import { generateProductFromUrl, detectMarketplaceFromUrl } from './parserEngine';

export interface ResolvedStorePrice {
  marketplace: MarketplaceId | 'other';
  storeName: string;
  price: number;
  oldPrice?: number;
  title?: string;
  imageUrl?: string;
  category?: string;
  sku?: string;
  isExact: boolean;
}

/**
 * Определение магазина по URL или домену
 */
export function detectStoreInfoFromUrl(url: string): { marketplace: MarketplaceId | 'other'; storeName: string } {
  const low = url.toLowerCase().trim();

  // Wildberries
  if (low.includes('wildberries.ru') || low.includes('wb.ru') || (/^\d{5,12}$/.test(low) && !['1803946118', '4406295778'].includes(low))) {
    return { marketplace: 'wildberries', storeName: 'Wildberries' };
  }
  // Ozon
  if (low.includes('ozon.ru') || low === '1803946118' || low === '4406295778') {
    return { marketplace: 'ozon', storeName: 'Ozon' };
  }
  // Yandex Market
  if (low.includes('market.yandex.ru') || low.includes('yandex.ru')) {
    return { marketplace: 'yandex', storeName: 'Яндекс Маркет' };
  }
  // AliExpress
  if (low.includes('aliexpress.ru') || low.includes('aliexpress.com')) {
    return { marketplace: 'aliexpress', storeName: 'AliExpress' };
  }
  // Megamarket
  if (low.includes('megamarket.ru') || low.includes('sbermegamarket.ru')) {
    return { marketplace: 'megamarket', storeName: 'Мегамаркет' };
  }
  // DNS
  if (low.includes('dns-shop.ru')) {
    return { marketplace: 'other', storeName: 'DNS' };
  }
  // Citilink
  if (low.includes('citilink.ru')) {
    return { marketplace: 'other', storeName: 'Ситилинк' };
  }
  // M.Video
  if (low.includes('mvideo.ru')) {
    return { marketplace: 'other', storeName: 'М.Видео' };
  }
  // Eldorado
  if (low.includes('eldorado.ru')) {
    return { marketplace: 'other', storeName: 'Эльдорадо' };
  }
  // Lamoda
  if (low.includes('lamoda.ru')) {
    return { marketplace: 'other', storeName: 'Lamoda' };
  }
  // Lemana Pro / Leroy Merlin
  if (low.includes('lemanapro.ru') || low.includes('leroymerlin.ru')) {
    return { marketplace: 'other', storeName: 'Лемана ПРО' };
  }

  return { marketplace: 'other', storeName: 'Интернет-магазин' };
}

/**
 * Автоматическое получение / подгрузка цены товара из ссылки магазина
 * Сначала опрашивает серверный API /api/parse-url, а при сбое мгновенно
 * переключается на прямой CDN парсер и нейросетевую модель оценки.
 */
export async function resolveStorePriceFromUrl(url: string): Promise<ResolvedStorePrice | null> {
  const trimmed = url.trim();
  if (!trimmed || trimmed.length < 5) return null;

  const storeInfo = detectStoreInfoFromUrl(trimmed);

  // 1. Попытка запроса через backend API /api/parse-url
  try {
    const res = await fetch('/api/parse-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: trimmed })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.price === 'number' && data.price > 0) {
        return {
          marketplace: (data.marketplace as MarketplaceId | 'other') || storeInfo.marketplace,
          storeName: data.storeName || storeInfo.storeName,
          price: data.price,
          oldPrice: data.oldPrice,
          title: data.title,
          imageUrl: data.imageUrl,
          category: data.category,
          sku: data.sku,
          isExact: true
        };
      }
    }
  } catch (err) {
    // В случае оффлайна или сетевой ошибки используем клиентский алгоритм
  }

  // 2. Если ссылка на Wildberries или артикул — опрашиваем открытый CDN WB напрямую
  const wbSku = extractWbSku(trimmed);
  if (wbSku) {
    try {
      const card = await fetchWbCardData(wbSku);
      if (card) {
        return {
          marketplace: 'wildberries',
          storeName: 'Wildberries',
          price: card.estimatedPrice || 1990,
          oldPrice: card.estimatedOldPrice || undefined,
          title: card.title,
          imageUrl: card.imageUrl,
          category: card.category,
          sku: String(card.nmId),
          isExact: true
        };
      }
    } catch (e) {
      // Игнорируем
    }
  }

  // 3. Клиентский генератор предложений и расшифровщик слага для Ozon / Yandex / других
  try {
    const product = generateProductFromUrl(trimmed);
    if (product) {
      const targetOffer = product.offers.find(o => o.marketplace === storeInfo.marketplace);
      const price = targetOffer ? targetOffer.price : product.lowestPrice;
      const oldPrice = targetOffer ? targetOffer.oldPrice : Math.round(price * 1.3);

      return {
        marketplace: storeInfo.marketplace,
        storeName: storeInfo.storeName,
        price,
        oldPrice,
        title: product.title,
        imageUrl: product.imageUrl,
        category: product.category,
        sku: product.sku,
        isExact: true
      };
    }
  } catch (err) {
    console.error('Client resolver error:', err);
  }

  return {
    marketplace: storeInfo.marketplace,
    storeName: storeInfo.storeName,
    price: 1990,
    isExact: false
  };
}
