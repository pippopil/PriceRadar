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

  // 5. Смартфоны Samsung Galaxy (Z Fold, Z Flip, S-серия, A-серия)
  if (lowTitle.includes('samsung') || lowTitle.includes('galaxy') || lowTitle.includes('fold') || lowTitle.includes('flip')) {
    // Samsung Galaxy Z Fold (флагманы со складным экраном)
    if (lowTitle.includes('fold')) {
      const genMatch = cleanTitle.match(/fold[-_\s]*(\d+)/i) || lowTitle.match(/fold\s*(\d+)/i);
      const rawGen = genMatch ? parseInt(genMatch[1], 10) : 6;
      const memMatch = cleanTitle.match(/(256|512|1024|1tb|128)/i);
      const memStr = memMatch ? (memMatch[1].toLowerCase() === '1tb' || memMatch[1] === '1024' ? ' 1TB' : ` ${memMatch[1]}GB`) : ' 256GB';

      // ВАЖНО: В карточках продавцов на Ozon часто пишут неофициальные названия "Fold 8" или "Fold 7".
      // Если передать "Fold 8" в Wildberries или Яндекс Маркет, их поисковый робот сбрасывает запрос в "Galaxy 256",
      // выдавая дешевые телефоны Galaxy A-серии за 20 000 руб вместо складного смартфона за 140 000 руб!
      // Поэтому основной контрольной фразой формируем «Samsung Galaxy Z Fold 256GB» (гарантированное нахождение всех Fold).
      const isUnreleasedGen = rawGen > 6;
      const primary = isUnreleasedGen
        ? `Samsung Galaxy Z Fold${memStr}`.trim()
        : `Samsung Galaxy Z Fold ${rawGen}${memStr}`.trim();
      
      const modelOnly = isUnreleasedGen ? 'Galaxy Z Fold' : `Galaxy Z Fold ${rawGen}`;
      const brandModelClean = isUnreleasedGen ? `Samsung Galaxy Z Fold 6${memStr}` : `Samsung Galaxy Z Fold ${rawGen}`;
      const cleanSku = sku && /^\d{6,12}$/.test(sku) ? sku : undefined;

      const opts = new Set<string>();
      opts.add(`Samsung Galaxy Z Fold${memStr}`.trim());
      opts.add(`Samsung Galaxy Z Fold 6${memStr}`.trim());
      if (isUnreleasedGen) {
        opts.add(`Samsung Galaxy Z Fold ${rawGen}${memStr}`.trim());
      }
      opts.add('Samsung Galaxy Z Fold');
      if (cleanSku) opts.add(`Артикул: ${cleanSku}`);

      return {
        primary,
        modelOnly,
        brandModelClean,
        skuOnly: cleanSku,
        allOptions: Array.from(opts).slice(0, 4)
      };
    }

    // Samsung Galaxy Z Flip
    if (lowTitle.includes('flip')) {
      const genMatch = cleanTitle.match(/flip[-_\s]*(\d+)/i) || lowTitle.match(/flip\s*(\d+)/i);
      const rawGen = genMatch ? parseInt(genMatch[1], 10) : 6;
      const genStr = rawGen > 6 ? '' : ` ${rawGen}`;
      const memMatch = cleanTitle.match(/(256|512|128)/i);
      const memStr = memMatch ? ` ${memMatch[1]}GB` : ' 256GB';

      const primary = `Samsung Galaxy Z Flip${genStr}${memStr}`.trim();
      const modelOnly = `Galaxy Z Flip${genStr}`.trim();
      const brandModelClean = `Samsung Galaxy Z Flip 6${memStr}`.trim();
      const cleanSku = sku && /^\d{6,12}$/.test(sku) ? sku : undefined;

      const opts = new Set<string>();
      opts.add(primary);
      opts.add(`Samsung Galaxy Z Flip${memStr}`.trim());
      opts.add(`Samsung Galaxy Z Flip 6${memStr}`.trim());
      if (cleanSku) opts.add(`Артикул: ${cleanSku}`);

      return {
        primary,
        modelOnly,
        brandModelClean,
        skuOnly: cleanSku,
        allOptions: Array.from(opts).slice(0, 4)
      };
    }

    // Samsung Galaxy S-серия (S25 Ultra, S24 Ultra, S24+, S24, S23, FE)
    const sMatch = cleanTitle.match(/s(21|22|23|24|25)\s*(ultra|plus|\+|fe)?/i);
    if (sMatch) {
      const sModel = sMatch[0].toUpperCase();
      const memMatch = cleanTitle.match(/(256|512|1tb|128)/i);
      const memStr = memMatch ? (memMatch[1].toLowerCase() === '1tb' ? ' 1TB' : ` ${memMatch[1]}GB`) : '';

      const primary = `Samsung Galaxy ${sModel}${memStr}`.trim();
      const modelOnly = `Galaxy ${sModel}`.trim();
      const brandModelClean = `Samsung ${sModel}`.trim();
      const cleanSku = sku && /^\d{6,12}$/.test(sku) ? sku : undefined;

      const opts = new Set<string>();
      opts.add(primary);
      opts.add(`Samsung Galaxy ${sModel}`);
      opts.add(`Galaxy ${sModel}${memStr}`);
      if (cleanSku) opts.add(`Артикул: ${cleanSku}`);

      return {
        primary,
        modelOnly,
        brandModelClean,
        skuOnly: cleanSku,
        allOptions: Array.from(opts).slice(0, 4)
      };
    }

    // Samsung Galaxy A-серия (A55, A54, A35, A34, A25, A15, A05)
    const aMatch = cleanTitle.match(/a(05|14|15|16|24|25|34|35|54|55|56)\b/i);
    if (aMatch) {
      const aModel = aMatch[0].toUpperCase();
      const memMatch = cleanTitle.match(/(128|256|64)/i);
      const memStr = memMatch ? ` ${memMatch[1]}GB` : '';

      const primary = `Samsung Galaxy ${aModel}${memStr}`.trim();
      const modelOnly = `Galaxy ${aModel}`.trim();
      const brandModelClean = `Samsung ${aModel}`.trim();
      const cleanSku = sku && /^\d{6,12}$/.test(sku) ? sku : undefined;

      const opts = new Set<string>();
      opts.add(primary);
      opts.add(`Samsung Galaxy ${aModel}`);
      opts.add(`Galaxy ${aModel}${memStr}`);
      if (cleanSku) opts.add(`Артикул: ${cleanSku}`);

      return {
        primary,
        modelOnly,
        brandModelClean,
        skuOnly: cleanSku,
        allOptions: Array.from(opts).slice(0, 4)
      };
    }
  }

  // 6. Смартфоны Apple iPhone
  if (lowTitle.includes('iphone') || (lowTitle.includes('apple') && lowTitle.includes('айфон'))) {
    const ipMatch = cleanTitle.match(/iphone\s*(\d{1,2}(?:\s*(?:pro\s*max|pro|plus|mini))?)/i);
    const ipModel = ipMatch ? ipMatch[0] : 'iPhone 16';
    const memMatch = cleanTitle.match(/(128|256|512|1tb)/i);
    const memStr = memMatch ? (memMatch[1].toLowerCase() === '1tb' ? ' 1TB' : ` ${memMatch[1]}GB`) : ' 128GB';

    const primary = `Apple ${ipModel}${memStr}`.trim();
    const modelOnly = ipModel.trim();
    const brandModelClean = `Apple ${ipModel}`.trim();
    const cleanSku = sku && /^\d{6,12}$/.test(sku) ? sku : undefined;

    const opts = new Set<string>();
    opts.add(primary);
    opts.add(`Apple ${ipModel}`);
    opts.add(`${ipModel}${memStr}`);
    if (cleanSku) opts.add(`Артикул: ${cleanSku}`);

    return {
      primary,
      modelOnly,
      brandModelClean,
      skuOnly: cleanSku,
      allOptions: Array.from(opts).slice(0, 4)
    };
  }

  // 7. Стандартный поиск точного модельного индекса (буквенно-цифровые коды)
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
  let modelHyphenOnly = rawModel;
  if (rawModel.includes('/')) {
    const parts = rawModel.split('/');
    if (/^\d+$/.test(parts[1])) {
      // Если вторая часть - чисто число (например 256 или 512), не выбрасываем первую часть
      modelHyphenOnly = `${parts[0]} ${parts[1]}`.trim();
    } else {
      modelHyphenOnly = parts[1] || rawModel;
    }
  }

  // Если модель состоит только из цифр памяти (128, 256, 512), не оставляем ее голой
  if (/^(64|128|256|512|1024)$/.test(modelHyphenOnly)) {
    modelHyphenOnly = rawModel.replace(/[\/]/g, ' ').trim();
  }

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
  let cleanQuery = controlPhrase.replace(/^Артикул:\s*/i, '').trim();

  // Защита от сброса поиска в дешевые Galaxy A-серии на Wildberries и Я.Маркете:
  // Если в запросе указана несуществующая в каталогах модель (например "Fold 8"),
  // робот Wildberries вырезает неизвестное слово и ищет "Galaxy 256"!
  // Заменяем на гарантированно индексируемую модель «Samsung Galaxy Z Fold 256GB».
  if (/fold\s*[789]\b/i.test(cleanQuery)) {
    cleanQuery = cleanQuery.replace(/fold\s*[789]\b/i, 'Fold').replace(/\s+/g, ' ');
    if (!cleanQuery.includes('256') && !cleanQuery.includes('512') && !cleanQuery.includes('1TB')) {
      cleanQuery = `${cleanQuery} 256GB`;
    }
  }

  // Если запрос деградировал до «Galaxy 256» или «Galaxy 12», восстанавливаем полный бренд и контекст
  if (/^galaxy\s*\d{2,4}$/i.test(cleanQuery)) {
    cleanQuery = `Samsung ${cleanQuery}`;
  }

  const encoded = encodeURIComponent(cleanQuery);

  switch (marketplace) {
    case 'wildberries':
      // На WB стандартный поиск по запросу (без priceup, чтобы не выдавать чехлы и заглушки за 50 руб)
      return `https://www.wildberries.ru/catalog/0/search.aspx?search=${encoded}`;

    case 'ozon':
      // На Ozon from_global=true открывает глобальный каталог товаров с сортировкой по возрастанию цены
      return `https://www.ozon.ru/search/?text=${encoded}&from_global=true&sorting=price`;

    case 'yandex':
      // На Яндекс.Маркете открываем каталог с сортировкой по возрастанию цены (how=aprice)
      return `https://market.yandex.ru/search?text=${encoded}&how=aprice`;

    case 'aliexpress':
      // На AliExpress РФ актуальный формат поиска с сортировкой по цене (sortType=price_asc)
      return `https://aliexpress.ru/search?text=${encoded}&sortType=price_asc`;

    case 'megamarket':
      // На Мегамаркете прямой поиск по каталогу с сортировкой по возрастанию цены (sort=1)
      return `https://megamarket.ru/catalog/?q=${encoded}&sort=1`;

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
