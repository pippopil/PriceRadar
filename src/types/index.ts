export type MarketplaceId = 'ozon' | 'wildberries' | 'yandex' | 'aliexpress' | 'megamarket';

export interface MarketplaceOffer {
  marketplace: MarketplaceId;
  title: string;
  price: number;
  oldPrice: number;
  personalPrice: number;
  personalDiscountPercent: number;
  sellerName: string;
  sellerRating: number;
  deliveryDate: string;
  deliverySpeed: string;
  url: string;
  inStock: boolean;
  isLowest?: boolean;
  searchQuery?: string;
  directSku?: string;
  isDirectLink?: boolean;
  availabilityStatus?: 'available' | 'out_of_stock' | 'not_found';
  availabilityNote?: string;
}

export interface ParsedProduct {
  id: string;
  sourceUrl: string;
  sourceMarketplace: MarketplaceId;
  title: string;
  brand: string;
  category: string;
  sku: string;
  imageUrl: string;
  specs: Record<string, string>;
  lowestPrice: number;
  lowestMarketplace: MarketplaceId;
  lowestPersonalPrice: number;
  lowestPersonalMarketplace: MarketplaceId;
  offers: MarketplaceOffer[];
  controlPhrase?: string;
  controlOptions?: string[];
  tags?: string[];
  visualTags?: string[];
  visualSimilarityScore?: number;
  needsRefinement?: boolean;
  refinementReason?: string;
}

export interface PricePoint {
  date: string;
  price: number;
  marketplace: MarketplaceId;
}

export interface TrackedItem {
  id: string;
  productId: string;
  title: string;
  brand: string;
  imageUrl: string;
  category: string;
  sourceMarketplace: MarketplaceId;
  sourceUrl: string;
  createdAt: string;
  lastCheckedAt: string;
  initialPrice: number;
  currentPrice: number;
  lowestPrice: number;
  lowestMarketplace: MarketplaceId;
  targetPrice: number | null;
  status: 'active' | 'paused';
  priceHistory: PricePoint[];
  lastDrop: {
    amount: number;
    percent: number;
    marketplace: MarketplaceId;
    date: string;
    notified: boolean;
  } | null;
}

export type PlanId = 'free' | 'standard' | 'pro';

export interface PlanConfig {
  id: PlanId;
  name: string;
  price: number;
  billingPeriod: string;
  maxTracks: number;
  checkInterval: string;
  checkIntervalMinutes: number;
  hasPersonalDiscounts: boolean;
  hasTelegramAlerts: boolean;
  hasPriorityScraping: boolean;
  historyDays: number;
  description: string;
}

export interface MarketplaceAccount {
  marketplace: MarketplaceId;
  marketplaceName: string;
  isConnected: boolean;
  accountIdentifier: string;
  discountName: string;
  discountPercent: number;
  lastSync: string;
  authMethod: 'token_vault' | 'extension_bridge';
  securityStatus: 'encrypted_aes_256' | 'not_connected';
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  isEnabled: boolean;
  connectedAt: string | null;
  alertOnlyIfLowestAcrossAll?: boolean;
  minDropPercent?: number;
}

export interface StoreLink {
  id: string;
  marketplace: MarketplaceId | 'other';
  storeName: string;
  url: string;
  currentPrice: number;
  oldPrice?: number;
  inStock: boolean;
  lastCheckedAt: string;
  directSku?: string;
  isLowest?: boolean;
}

export interface CustomProductWatch {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  targetPrice: number | null;
  links: StoreLink[];
  lowestPrice: number;
  lowestStore: string;
  createdAt: string;
  lastCheckedAt: string;
  status: 'active' | 'paused';
  priceHistory: Array<{
    timestamp: string;
    storeName: string;
    price: number;
    isLowestAcrossAll: boolean;
  }>;
  alertHistory: Array<{
    id: string;
    timestamp: string;
    storeName: string;
    newPrice: number;
    oldPrice: number;
    savingsVsCompetitor: number;
    message: string;
    telegramSent: boolean;
  }>;
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  productTitle: string;
  marketplace: MarketplaceId;
  oldPrice: number;
  newPrice: number;
  dropAmount: number;
  dropPercent: number;
  url: string;
  status: 'sent' | 'simulated';
}

export interface RealtimeAlertEvent {
  id: string;
  timestamp: string;
  productId: string;
  productTitle: string;
  imageUrl: string;
  storeName: string;
  marketplace: MarketplaceId | 'other';
  oldPrice: number;
  newPrice: number;
  dropAmount: number;
  dropPercent: number;
  isLowestAcrossAll: boolean;
  targetPriceReached: boolean;
  targetPrice: number | null;
  url: string;
  notifiedChannels: {
    telegram: boolean;
    desktopPush: boolean;
    audio: boolean;
    inApp: boolean;
  };
  reason: 'target_reached' | 'lowest_store' | 'discount_drop' | 'flash_deal';
  isSimulation?: boolean;
  isDirectLink?: boolean;
  verifiedAt?: string;
  verifiedPrice?: number;
}

export interface RadarConfig {
  isEnabled: boolean;
  intervalSeconds: number;
  minDropPercent: number;
  alertOnTargetOnly: boolean;
  alertOnlyIfLowestAcrossAll: boolean;
  notifyTelegram: boolean;
  notifyDesktopPush: boolean;
  notifySound: boolean;
  notifyInApp: boolean;
}

export type ParsingHealthStatus = 'operational' | 'degraded' | 'down' | 'checking';

export type ParsingErrorCode = 
  | 'CAPTCHA_BLOCKED' 
  | 'NOT_FOUND_404' 
  | 'RATE_LIMIT_429' 
  | 'SELECTOR_MUTATION' 
  | 'GATEWAY_TIMEOUT_504' 
  | 'SESSION_EXPIRED';

export interface ParsingIncident {
  id: string;
  timestamp: string;
  storeId: string;
  storeName: string;
  errorCode: ParsingErrorCode;
  errorTitle: string;
  httpStatus: number;
  message: string;
  affectedUrl: string;
  impactDescription: string;
  recommendation: string;
  resolved: boolean;
  resolvedAt?: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface StoreHealthInfo {
  storeId: string;
  storeName: string;
  domain: string;
  status: ParsingHealthStatus;
  statusMessage: string;
  successRate24h: number;
  avgLatencyMs: number;
  lastCheckedAt: string;
  freshnessState: 'realtime' | 'delayed_cache' | 'limited';
  freshnessNotice: string;
  activeIncident: ParsingIncident | null;
  bypassMethod: string;
  recentIncidentsCount: number;
  totalChecks24h: number;
}

