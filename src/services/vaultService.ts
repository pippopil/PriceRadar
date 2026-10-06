import { MarketplaceId, MarketplaceAccount } from '../types';

export const DEFAULT_ACCOUNTS: MarketplaceAccount[] = [
  {
    marketplace: 'ozon',
    marketplaceName: 'Ozon',
    isConnected: true,
    accountIdentifier: '+7 (916) •••-42-89',
    discountName: 'Ozon Карта & Ozon Премиум',
    discountPercent: 7,
    lastSync: '15 минут назад',
    authMethod: 'extension_bridge',
    securityStatus: 'encrypted_aes_256'
  },
  {
    marketplace: 'wildberries',
    marketplaceName: 'Wildberries',
    isConnected: true,
    accountIdentifier: '+7 (916) •••-42-89',
    discountName: 'СПП 15% + WB Кошелек (-3%)',
    discountPercent: 15,
    lastSync: '1 час назад',
    authMethod: 'token_vault',
    securityStatus: 'encrypted_aes_256'
  },
  {
    marketplace: 'yandex',
    marketplaceName: 'Яндекс Маркет',
    isConnected: false,
    accountIdentifier: 'Не подключен',
    discountName: 'Яндекс Плюс (Кешбэк & Сплит)',
    discountPercent: 8,
    lastSync: '—',
    authMethod: 'extension_bridge',
    securityStatus: 'not_connected'
  },
  {
    marketplace: 'aliexpress',
    marketplaceName: 'AliExpress Россия',
    isConnected: false,
    accountIdentifier: 'Не подключен',
    discountName: 'Монеты & VIP Скидка',
    discountPercent: 6,
    lastSync: '—',
    authMethod: 'token_vault',
    securityStatus: 'not_connected'
  },
  {
    marketplace: 'megamarket',
    marketplaceName: 'Мегамаркет',
    isConnected: false,
    accountIdentifier: 'Не подключен',
    discountName: 'СберСпасибо & СберПрайм',
    discountPercent: 10,
    lastSync: '—',
    authMethod: 'token_vault',
    securityStatus: 'not_connected'
  }
];

export interface SecurityAuditReport {
  encryptionStandard: string;
  zeroKnowledgeCompliant: boolean;
  isolationLevel: string;
  proxyStrategy: string;
  recommendations: string[];
}

export function getSecurityAudit(): SecurityAuditReport {
  return {
    encryptionStandard: 'AES-256-GCM с PBKDF2 (100 000 итераций) + аппаратный TPM/KMS',
    zeroKnowledgeCompliant: true,
    isolationLevel: 'Песочница сессий (Ephemeral Container Sandbox)',
    proxyStrategy: 'Резидентные прокси г. Москва/СПб с эмуляцией TLS Fingerprint (JA3/JA4)',
    recommendations: [
      'Используйте режим «Browser Extension Bridge» — данные аккаунта не покидают ваш браузер.',
      'Никогда не передавайте пароли от Госуслуг и Ozon Банка: для парсинга цен нужны только сессионные куки чтения.',
      'Сессионные токены шифруются на стороне клиента мастер-паролем перед отправкой в защищенный анклав.',
      'Автоматическое аннулирование токенов при обнаружении подозрительной активности маркетплейса.'
    ]
  };
}
