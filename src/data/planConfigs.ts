import { PlanConfig } from '../types';

export const SUBSCRIPTION_PLANS: Record<'free' | 'standard' | 'pro', PlanConfig> = {
  free: {
    id: 'free',
    name: 'Бесплатный',
    price: 0,
    billingPeriod: 'Навсегда',
    maxTracks: 1,
    checkInterval: 'Каждые 6 часов',
    checkIntervalMinutes: 360,
    hasPersonalDiscounts: false,
    hasTelegramAlerts: true,
    hasPriorityScraping: false,
    historyDays: 7,
    description: 'Для знакомства с сервисом и отслеживания 1 самого важного товара'
  },
  standard: {
    id: 'standard',
    name: 'Базовый',
    price: 490,
    billingPeriod: 'в месяц',
    maxTracks: 5,
    checkInterval: 'Каждые 30 минут',
    checkIntervalMinutes: 30,
    hasPersonalDiscounts: true,
    hasTelegramAlerts: true,
    hasPriorityScraping: false,
    historyDays: 30,
    description: 'Оптимально для активных покупок: 5 товаров и частый мониторинг'
  },
  pro: {
    id: 'pro',
    name: 'Премиум',
    price: 990,
    billingPeriod: 'в месяц',
    maxTracks: 10,
    checkInterval: 'Каждые 5 минут (Flash-проверка)',
    checkIntervalMinutes: 5,
    hasPersonalDiscounts: true,
    hasTelegramAlerts: true,
    hasPriorityScraping: true,
    historyDays: 90,
    description: 'Максимальный тариф: 10 товаров, мгновенные сигналы и персональные скидки всех сетей'
  }
};
