import { TelegramConfig } from '../types';

export type { TelegramConfig };

const STORAGE_KEY = 'priceradar_telegram_config';

export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '',
  chatId: '',
  isEnabled: true,
  connectedAt: null,
  alertOnlyIfLowestAcrossAll: true,
  minDropPercent: 3
};

export function getTelegramConfig(): TelegramConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_TELEGRAM_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load telegram config from localStorage', e);
  }
  return DEFAULT_TELEGRAM_CONFIG;
}

export function saveTelegramConfig(config: TelegramConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save telegram config to localStorage', e);
  }
}

/**
 * Отправляет сообщение в Telegram через серверный прокси или прямой API Telegram
 */
export async function sendTelegramNotification(
  message: string,
  overrideConfig?: Partial<TelegramConfig>
): Promise<{ success: boolean; error?: string }> {
  const currentConfig = { ...getTelegramConfig(), ...overrideConfig };

  if (!currentConfig.botToken || !currentConfig.chatId) {
    return {
      success: false,
      error: 'Укажите токен бота и Chat ID в настройках Telegram'
    };
  }

  // 1. Попытка через backend прокси (/api/telegram/send)
  try {
    const res = await fetch('/api/telegram/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        botToken: currentConfig.botToken.trim(),
        chatId: currentConfig.chatId.trim(),
        message
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true };
    }
    if (data.error) {
      throw new Error(data.error);
    }
  } catch (proxyError: any) {
    // 2. Fallback: прямой запрос к Telegram Bot API
    try {
      const tgUrl = `https://api.telegram.org/bot${encodeURIComponent(currentConfig.botToken.trim())}/sendMessage`;
      const resDirect = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: currentConfig.chatId.trim(),
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: false
        })
      });

      const directData = await resDirect.json();
      if (directData.ok) {
        return { success: true };
      }
      return {
        success: false,
        error: directData.description || 'Ошибка Telegram API'
      };
    } catch (directError: any) {
      return {
        success: false,
        error: proxyError.message || directError.message || 'Сбой сети при отправке в Telegram'
      };
    }
  }

  return { success: false, error: 'Неизвестная ошибка отправки' };
}

/**
 * Отправляет тестовое приветственное уведомление для проверки связки бота и чата
 */
export async function sendTestTelegramAlert(config: TelegramConfig): Promise<{ success: boolean; error?: string }> {
  const testMessage = `🤖 <b>PriceRadar РФ — Проверка подключения бота!</b>\n\n` +
    `✅ Бот успешно подключен к системе мониторинга цен!\n\n` +
    `📡 <b>Режим работы:</b> автоматический мониторинг ваших ссылок на маркетплейсах.\n` +
    `🔔 <b>Правило сигнала:</b> уведомление приходит, когда цена в одном из магазинов проседает и становится <u>ниже, чем во всех остальных магазинах</u>.\n\n` +
    `⏱ <i>Время проверки: ${new Date().toLocaleString('ru-RU')}</i>`;

  return sendTelegramNotification(testMessage, config);
}

/**
 * Форматирует сигнал о просадке цены ниже конкурентов
 */
export function formatMultiStorePriceDropAlert(params: {
  productTitle: string;
  droppedStore: string;
  newPrice: number;
  oldPrice: number;
  bestCompetitorStore: string;
  bestCompetitorPrice: number;
  allStorePrices: Array<{ store: string; price: number; isWinner: boolean }>;
  productUrl: string;
}): string {
  const dropDiff = params.oldPrice - params.newPrice;
  const dropPercent = Math.round((dropDiff / params.oldPrice) * 100);
  const savingsVsCompetitor = params.bestCompetitorPrice - params.newPrice;

  const storesList = params.allStorePrices
    .map(s => {
      if (s.isWinner) {
        return `  🟢 <b>${s.store}:</b> <b>${s.price.toLocaleString('ru-RU')} ₽</b> 🏆 <i>(САМАЯ НИЗКАЯ!)</i>`;
      }
      const diff = s.price - params.newPrice;
      return `  ⚪️ ${s.store}: ${s.price.toLocaleString('ru-RU')} ₽ <i>(+${diff.toLocaleString('ru-RU')} ₽)</i>`;
    })
    .join('\n');

  return `🔥 <b>СИГНАЛ PRICERADAR: ЦЕНА ПРОСЕЛА НИЖЕ ВСЕХ МАГАЗИНОВ!</b>\n\n` +
    `📦 <b>Товар:</b> ${params.productTitle}\n` +
    `🏪 <b>Магазин-лидер:</b> <b>${params.droppedStore}</b>\n` +
    `📉 <b>Новая цена:</b> <b>${params.newPrice.toLocaleString('ru-RU')} ₽</b> ` +
    `<s>${params.oldPrice.toLocaleString('ru-RU')} ₽</s> (<b>-${dropPercent}%</b>, экономия ${dropDiff.toLocaleString('ru-RU')} ₽)\n\n` +
    `📊 <b>Сравнение со всеми вашими ссылками:</b>\n` +
    `${storesList}\n\n` +
    `⚡️ <b>Выгода:</b> дешевле ближайшего магазина (${params.bestCompetitorStore}) на <b>${savingsVsCompetitor.toLocaleString('ru-RU')} ₽</b>!\n\n` +
    `🛒 <a href="${params.productUrl}"><b>Купить прямо сейчас на ${params.droppedStore}</b></a>`;
}
