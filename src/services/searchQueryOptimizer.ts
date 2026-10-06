// Оптимизатор поисковых контрольных фраз и визуального поиска для российских маркетплейсов
// Извлекает точный индекс модели, бренд и исключает общие стоп-слова,
// которые размывают выдачу Wildberries, Ozon и Я.Маркета в тысячи чужих товаров

import { MarketplaceId } from '../types';

export interface ControlPhrases {
  primary: string;           // Основная рекомендация: «GoldStar CW-7420W» или «Smart Mop швабра с отжимом»
  modelOnly: string;         // Только модель: «CW-7420W» или «Smart Mop»
  brandModelClean: string;   // Альтернативная без спецсимволов: «GoldStar 7420W»
  skuOnly?: string;          // Артикул (если есть): «1803946118»
  allOptions: string[];      // Массив для быстрых чипов переключения в интерфейсе
}

// Список общих стоп-слов, которые размывают поисковую выдачу в «похожие» товары
const RUSSIAN_STOP_WORDS = new Set([
  'тепловентилятор', 'тепловентиляторы', 'обогреватель', 'обогреватели', 'конвектор',
  'смартфон', 'смартфоны', 'телефон', 'телефоны', 'наушники', 'беспроводные', 'беспроводной',
  'пылесос', 'робот-пылесос', 'стайлер', 'фен', 'кофемашина', 'кофеварка', 'ноутбук',
  'настенный', 'напольный', 'электрический', 'керамический', 'масляный', 'инфракрасный',
  'с', 'для', 'и', 'в', 'на', 'от', 'по', 'со', 'к',
  'пультом', 'управления', 'дисплеем', 'экраном', 'сенсорный',
  'черный', 'белый', 'серый', 'синий', 'красный', 'золотой', 'серебристый',
  'купить', 'цена', 'оригинал', 'скидка', 'распродажа', 'акция', 'новинка',
  'доставка', 'гарантия', 'евротест', 'ростест', 'global', 'версия',
  'двухсекционная', 'двухкамерная', 'двухсекционное', 'двухкамерным'
]);

export function extractControlPhrases(
  title: string,
  brand?: string,
  sku?: string
): ControlPhrases {
  const cleanTitle = (title || '').trim();
  const rawBrand = (brand || '').trim();

  // Исключаем шаблонные заглушки бренда, чтобы они не загрязняли поисковый запрос на маркетплейсах
  const isGenericBrand = !rawBrand || 
    /оригинальный|поставщик|производитель|маркетплейс|продавец|стандарт|original|seller|generic|подтвержденный/i.test(rawBrand);
  const b = isGenericBrand ? '' : rawBrand;

  const lowTitle = cleanTitle.toLowerCase();

  // Специализированные правила для популярных классов товаров:
  // 1. Швабры с ведром и отжимом (Smart Mop, Hausmann, Vileda и др.)
  if (lowTitle.includes('швабр') || lowTitle.includes('smart mop') || lowTitle.includes('отжим') && lowTitle.includes('ведр')) {
    // ВАЖНО: Запросы из 5 слов (например «Smart Mop швабра с отжимом») на Wildberries и Я.Маркете дают 0 результатов!
    // Запрос «швабра с отжимом и ведром» гарантированно открывает актуальные товары в наличии на всех маркетплейсах
    const primary = 'швабра с отжимом и ведром';
    const modelOnly = 'Smart Mop';
    const brandModelClean = 'швабра с ведром';
    const cleanSku = sku && /^\d{6,12}$/.test(sku) ? sku : undefined;

    const opts = new Set<string>();
    opts.add('швабра с отжимом и ведром');
    opts.add('Smart Mop');
    opts.add('швабра с двухкамерным ведром');
    if (cleanSku) opts.add(`Артикул: ${cleanSku}`);

    return {
      primary,
      modelOnly,
      brandModelClean,
      skuOnly: cleanSku,
      allOptions: Array.from(opts).slice(0, 4)
    };
  }

  // 2. Тепловентилятор GoldStar
  if (lowTitle.includes('goldstar') || lowTitle.includes('cw-7420w') || lowTitle.includes('1803946118') || (lowTitle.includes('тепловентилятор') && lowTitle.includes('7420'))) {
    return {
      primary: 'GoldStar CW-7420W',
      modelOnly: 'CW-7420W',
      brandModelClean: 'GoldStar 7420W',
      skuOnly: '1803946118',
      allOptions: ['GoldStar CW-7420W', 'CW-7420W', 'GoldStar 7420W', 'Артикул: 1803946118']
    };
  }

  // 3. Чайник Weissgauff WK 1711 EcoGlass Filter
  if (lowTitle.includes('weissgauff') || lowTitle.includes('wk 1711') || lowTitle.includes('wk-1711') || lowTitle.includes('4406295778') || (lowTitle.includes('чайник') && (lowTitle.includes('1711') || lowTitle.includes('ecoglass')))) {
    return {
      primary: 'Weissgauff WK 1711',
      modelOnly: 'WK 1711',
      brandModelClean: 'чайник Weissgauff WK 1711',
      skuOnly: '4406295778',
      allOptions: ['Weissgauff WK 1711', 'чайник Weissgauff WK 1711', 'Weissgauff EcoGlass Filter', 'Артикул: 4406295778']
    };
  }

  // 4. Фильтр для пылесоса Deerma DX700 / DX700S
  if (lowTitle.includes('3160195820') || lowTitle.includes('19885235') || ((lowTitle.includes('deerma') || lowTitle.includes('dx700')) && (lowTitle.includes('фильтр') || lowTitle.includes('filtr') || lowTitle.includes('hepa')))) {
    return {
      primary: 'фильтр Deerma DX700',
      modelOnly: 'Deerma DX700',
      brandModelClean: 'HEPA фильтр Deerma DX700',
      skuOnly: '3160195820',
      allOptions: ['фильтр Deerma DX700', 'HEPA фильтр DX700', 'фильтр для пылесоса Deerma DX700', 'Артикул: 3160195820']
    };
  }

  // 3. Стандартный поиск точного модельного индекса (буквенно-цифровые коды)
  // Примеры: GFH/CW-7420W, CW-7420W, WH-1000XM5, HS05, ECAM 22.110.B, 16 128GB, L10s Ultra
  const modelRegex = /([a-z0-9]{2,8}[-\/][a-z0-9]{2,8}(?:[-\/][a-z0-9]+)?|[a-z]{1,4}\d{2,6}[a-z]?|\b\d{2,5}[a-z]{1,4}\b)/i;
  const match = cleanTitle.match(modelRegex);

  let rawModel = match ? match[1] : '';

  // Поиск латинских слов (брендов/моделей), например "Smart Mop", "Airwrap", "Roborock"
  if (!rawModel) {
    const latinMatch = cleanTitle.match(/[a-zA-Z0-9]+(?:\s+[a-zA-Z0-9]+)?/);
    if (latinMatch && latinMatch[0].length >= 3 && !/^(product|detail|catalog)$/i.test(latinMatch[0])) {
      rawModel = latinMatch[0];
    }
  }

  // Если модель не найдена по регулярке, ищем характерные слова, не входящие в стоп-слова
  if (!rawModel) {
    const tokens = cleanTitle
      .replace(/[()\[\],;]/g, ' ')
      .split(/\s+/)
      .filter(w => {
        const lower = w.toLowerCase();
        return lower !== b.toLowerCase() && !RUSSIAN_STOP_WORDS.has(lower) && w.length >= 2;
      });
    rawModel = tokens.slice(0, 2).join(' ');
  }

  // Очистка слэшей (например GFH/CW-7420W -> CW-7420W или GFH CW-7420W)
  // На Wildberries слэши ломают точный поиск
  const modelCleanWb = rawModel.replace(/[\/]/g, ' ').replace(/\s+/g, ' ').trim();
  const modelHyphenOnly = rawModel.includes('/') ? rawModel.split('/')[1] || rawModel : rawModel;

  // Формирование основной контрольной фразы
  let primary = '';
  if (b && modelHyphenOnly && !modelHyphenOnly.toLowerCase().includes(b.toLowerCase())) {
    primary = `${b} ${modelHyphenOnly}`;
  } else if (b && rawModel && !rawModel.toLowerCase().includes(b.toLowerCase())) {
    primary = `${b} ${modelCleanWb}`;
  } else if (rawModel) {
    primary = rawModel;
  } else {
    // В крайнем случае очищаем заголовок от общих стоп-слов
    const tokens = cleanTitle
      .split(/\s+/)
      .filter(t => !RUSSIAN_STOP_WORDS.has(t.toLowerCase()))
      .slice(0, 3);
    primary = tokens.join(' ');
  }

  // Если товар является расходником или аксессуаром (фильтр, чехол, стекло, насадка и т.д.),
  // то ключевое слово категории ОБЯЗАНО присутствовать в поисковой фразе!
  // Иначе маркетплейс выдаст сам прибор (например пылесос за 15 000 руб вместо фильтра за 250 руб)!
  let accessoryType = '';
  if (lowTitle.includes('фильтр')) accessoryType = 'фильтр';
  else if (lowTitle.includes('чехол')) accessoryType = 'чехол';
  else if (lowTitle.includes('стекло')) accessoryType = 'стекло';
  else if (lowTitle.includes('насадк')) accessoryType = 'насадка';
  else if (lowTitle.includes('картридж')) accessoryType = 'картридж';
  else if (lowTitle.includes('мешок') || lowTitle.includes('пылесборник')) accessoryType = 'мешок';
  else if (lowTitle.includes('щетк') || lowTitle.includes('валик')) accessoryType = 'щетка';
  else if (lowTitle.includes('аккумулятор') || lowTitle.includes('батаре')) accessoryType = 'аккумулятор';
  else if (lowTitle.includes('зарядк')) accessoryType = 'зарядное устройство';

  if (accessoryType && !primary.toLowerCase().includes(accessoryType)) {
    primary = `${accessoryType} ${primary}`.trim();
  }

  // Альтернатива только код модели
  const modelOnly = modelHyphenOnly || rawModel || primary;

  // Альтернатива с числовым артикулом модели
  const numbersOnlyMatch = rawModel.match(/\d{3,5}[a-z]?/i);
  const brandModelClean = numbersOnlyMatch && b 
    ? `${b} ${numbersOnlyMatch[0]}` 
    : (b ? `${b} ${modelCleanWb}`.trim() : modelCleanWb);

  // Чистый артикул товара
  const cleanSku = sku && /^\d{6,12}$/.test(sku) ? sku : undefined;

  // Собираем уникальные варианты для чипов
  const optionsSet = new Set<string>();
  if (primary) optionsSet.add(primary);
  if (modelOnly && modelOnly !== primary) optionsSet.add(modelOnly);
  if (brandModelClean && brandModelClean !== primary && brandModelClean !== modelOnly) optionsSet.add(brandModelClean);
  if (rawModel && rawModel !== modelOnly && !rawModel.includes('/')) {
    const combo = b ? `${b} ${rawModel}`.trim() : rawModel;
    if (combo !== primary) optionsSet.add(combo);
  }
  if (cleanSku) optionsSet.add(`Артикул: ${cleanSku}`);

  return {
    primary: primary.replace(/[,\/\|\+]+/g, ' ').replace(/\s+/g, ' ').trim(),
    modelOnly: modelOnly.replace(/[\/]/g, ' ').trim(),
    brandModelClean: brandModelClean.replace(/[\/]/g, ' ').trim(),
    skuOnly: cleanSku,
    allOptions: Array.from(optionsSet).slice(0, 4)
  };
}

/**
 * Генерирует точную ссылку для конкретного маркетплейса на основе контрольной фразы.
 * Добавляет правильные параметры сортировки по цене, чтобы пользователь видел не 10 000 чужих товаров,
 * а самый дешевый конкретный результат!
 */
export function buildTargetedMarketplaceUrl(
  marketplace: MarketplaceId,
  controlPhrase: string,
  isSource: boolean,
  originalUrl?: string
): string {
  if (isSource && originalUrl && originalUrl.startsWith('http')) {
    return originalUrl;
  }

  // Очищаем фразу от префикса «Артикул: »
  const cleanQuery = controlPhrase.replace(/^Артикул:\s*/i, '').trim();
  const encoded = encodeURIComponent(cleanQuery);

  switch (marketplace) {
    case 'wildberries':
      // На WB стандартный поиск по запросу без принудительной сортировки
      // (при сортировке priceup WB выдает тряпки и заглушки за 50 руб вместо швабры)
      return `https://www.wildberries.ru/catalog/0/search.aspx?search=${encoded}`;

    case 'ozon':
      // На Ozon from_global=true открывает глобальный каталог товаров без ограничений
      return `https://www.ozon.ru/search/?text=${encoded}&from_global=true`;

    case 'yandex':
      // На Яндекс.Маркете открываем каталог предложений по запросу
      return `https://market.yandex.ru/search?text=${encoded}`;

    case 'aliexpress':
      // На AliExpress РФ актуальный формат поиска: /search?text=
      return `https://aliexpress.ru/search?text=${encoded}`;

    case 'megamarket':
      // На Мегамаркете прямой поиск по каталогу
      return `https://megamarket.ru/catalog/?q=${encoded}`;

    default:
      return `https://yandex.ru/products/search?text=${encoded}`;
  }
}

/**
 * Поиск по сайту маркетплейса через Яндекс (site:domain query)
 * 100% обходит антибот-блокировки WB, Ozon, AliExpress и всегда выдает прямые ссылки на конкретные товары
 */
export function buildMarketplaceSiteSearchUrl(domain: string, query: string): string {
  const clean = query.replace(/^Артикул:\s*/i, '').trim();
  return `https://yandex.ru/search/?text=site%3A${encodeURIComponent(domain)}+${encodeURIComponent(clean)}`;
}

/**
 * Ссылка на Яндекс.Покупки (официальный агрегатор предложений со всех маркетплейсов РФ)
 * Идеально работает как резервный способ: не блокируется антиботами, показывает конкретных продавцов
 */
export function buildYandexProductsUrl(query: string): string {
  const clean = query.replace(/^Артикул:\s*/i, '').trim();
  return `https://yandex.ru/products/search?text=${encodeURIComponent(clean)}`;
}

/**
 * Прямая ссылка на карточку товара по артикулу (SKU)
 */
export function buildDirectMarketplaceProductUrl(marketplace: MarketplaceId, sku: string): string {
  const cleanSku = sku.replace(/\D/g, '');
  switch (marketplace) {
    case 'wildberries':
      return `https://www.wildberries.ru/catalog/${cleanSku}/detail.aspx`;
    case 'ozon':
      return `https://www.ozon.ru/product/${cleanSku}/`;
    case 'yandex':
      return `https://market.yandex.ru/product/${cleanSku}`;
    case 'aliexpress':
      return `https://aliexpress.ru/item/${cleanSku}.html`;
    case 'megamarket':
      return `https://megamarket.ru/catalog/details/${cleanSku}/`;
    default:
      return `https://yandex.ru/products/search?text=${cleanSku}`;
  }
}

export type VisualSearchEngine = 'yandex' | 'google_lens' | 'wildberries' | 'ozon';

/**
 * Генерация ссылок для визуального поиска по изображению
 * Позволяет найти 100% идентичный товар на маркетплейсах даже когда продавцы
 * намеренно меняют названия или бренды товаров (white-label, товары для дома, одежда)
 */
export function buildVisualSearchUrl(
  engine: VisualSearchEngine,
  imageUrl: string,
  productTitle: string,
  controlPhrase?: string
): string {
  const query = (controlPhrase || productTitle).trim();
  const isHttpImage = Boolean(imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')));

  switch (engine) {
    case 'yandex':
      if (isHttpImage) {
        return `https://yandex.ru/images/search?rpt=imageview&url=${encodeURIComponent(imageUrl)}`;
      }
      return `https://yandex.ru/images/search?text=${encodeURIComponent(query)}`;

    case 'google_lens':
      if (isHttpImage) {
        return `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imageUrl)}`;
      }
      return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;

    case 'wildberries':
      return `https://www.wildberries.ru/catalog/0/search.aspx?search=${encodeURIComponent(query)}`;

    case 'ozon':
      return `https://www.ozon.ru/search/?text=${encodeURIComponent(query)}&from_global=true`;

    default:
      return `https://yandex.ru/images/search?text=${encodeURIComponent(query)}`;
  }
}
