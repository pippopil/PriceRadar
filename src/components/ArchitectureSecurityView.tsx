import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Lightbulb, 
  Cpu, 
  Lock, 
  Layers, 
  Database, 
  Globe, 
  KeyRound, 
  Server,
  Zap,
  Terminal,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';

export const ArchitectureSecurityView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>Архитектурный анализ ведущего инженера (10+ лет стажа)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Инженерия, защита данных и парсинг маркетплейсов в РФ
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Подробный технический разбор реальных вызовов, рисков безопасности при вводе аккаунтов и лучших практик построения масштабируемой системы мониторинга цен.
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1: Problems with Scraping Russian Marketplaces */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                1. Проблемы и подводные камни парсинга в 2026 году
              </h2>
              <p className="text-xs text-slate-400">Что происходит под капотом российских ритейлеров</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Ozon: WAF Kasada & Dynamic Tokens
              </div>
              <p className="text-slate-400 leading-relaxed">
                Ozon защищен тяжелым WAF (Kasada / Cloudflare Turnstile). Запросы с датацентров (AWS, Hetzner, Selectel) мгновенно ловят 403 Forbidden. Ответы API шифруются динамическими солями на уровне JS-рантайма.
              </p>
              <div className="text-[11px] text-indigo-300 font-mono">
                Решение: Пул мобильных резидентных 4G/LTE прокси (Beeline, MTS, MegaFon) с рандомизацией TLS fingerprint (JA4).
              </div>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                Wildberries: Геолокационная динамика цен и СПП
              </div>
              <p className="text-slate-400 leading-relaxed">
                Цена товара на WB зависит от выбранного ПВЗ (склада отгрузки) и индивидуальной СПП (скидки постоянного покупателя до 27%). Без передачи регионального `dest` цена может отличаться на 10-25%.
              </p>
              <div className="text-[11px] text-indigo-300 font-mono">
                Решение: Фиксация региональных координат ПВЗ в заголовках запроса мобильного шлюза WB.
              </div>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                Яндекс Маркет: Client-Side React & Антибот
              </div>
              <p className="text-slate-400 leading-relaxed">
                Маркет рендерит карточки товаров клиентским гидрированием. Прямой HTML-парсинг не отдает финальную цену со сплитом и баллами Плюса без выполнения JS-бандла.
              </p>
              <div className="text-[11px] text-indigo-300 font-mono">
                Решение: Легковесный Headless Chromium (Playwright Stealth) с перехватом внутренних GraphQL/REST ответов.
              </div>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                AliExpress & Мегамаркет: СберСпасибо и валюты
              </div>
              <p className="text-slate-400 leading-relaxed">
                На Мегамаркете финальная выгода часто кроется в возврате бонусов СберСпасибо (до 40-70% кешбэка), а не в номинальной цене.
              </p>
              <div className="text-[11px] text-indigo-300 font-mono">
                Решение: Раздельный расчет номинальной цены и эффективной цены с учетом кешбэка Спасибо.
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: User Security & Account Ingestion (Critical) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                2. Безопасность пользователей при вводе данных маркетплейсов
              </h2>
              <p className="text-xs text-slate-400">Почему пароли нельзя запрашивать и как это решить грамотно</p>
            </div>
          </div>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="bg-rose-950/30 border border-rose-500/30 p-4 rounded-xl space-y-2">
              <div className="font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Опасность прямого ввода паролей / SMS-кодов:</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                1. <strong>Финансовый риск:</strong> Аккаунт Ozon привязан к Ozon Банку, а WB — к WB Кошельку. Любая утечка базы данных или перехват SMS-кода ставит под удар реальные банковские средства пользователя.<br />
                2. <strong>Блокировка аккаунта:</strong> Если наш сервер попробует авторизоваться по номеру телефона пользователя с IP дата-центра, антифрод маркетплейса посчитает это взломом и заморозит аккаунт покупателя с потерей накопленных скидок.
              </p>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-xl space-y-3">
              <div className="font-bold text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Наше правильное архитектурное решение (3 уровня защиты):</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div className="font-semibold text-white mb-1">Уровень 1: Browser Extension Bridge</div>
                  <p className="text-[11px] text-slate-400">
                    Пользователь ставит расширение Chrome. Оно локально считывает персональную цену в его браузере. Данные логина <strong>вообще не передаются на сервер</strong>.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div className="font-semibold text-white mb-1">Уровень 2: AES-256 Token Vault</div>
                  <p className="text-[11px] text-slate-400">
                    Передаются только сессионные куки чтения (read-only). Токены шифруются ключом на клиенте, сервер не имеет доступа к расшифровке без сессии пользователя.
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div className="font-semibold text-white mb-1">Уровень 3: Профиль скидок (No-Token)</div>
                  <p className="text-[11px] text-slate-400">
                    Пользователь просто указывает размер своей СПП (например, 15%) и галочку «Ozon Карта». Сервис математически пересчитывает цены без авторизации.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Ideas & Improvements (Roadmap) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                3. Идеи улучшения сервиса (Рекомендации Senior Dev)
              </h2>
              <p className="text-xs text-slate-400">Что сделает продукт безоговорочным лидером на рынке</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-indigo-400" />
                <span>ML-детектор фейковых скидок</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Перед распродажами продавцы часто завышают цену на 40%, а затем ставят скидку 20%. Модель анализирует 90-дневный медианный тренд и показывает бейдж: «Истинная скидка» или «Искусственная накрутка».
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Авто-поиск лучшего ПВЗ</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                На Wildberries доставка в ПВЗ в 1 км от вас может стоить дешевле из-за загруженности склада. Бот подскажет соседний пункт выдачи с более низкой итоговой ценой.
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Автоматический запрос скидки</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                На Ozon есть официальная кнопка «Хочу скидку». Сервис может автоматически слать запрос продавцу на снижение цены на 5-10% в фоновом режиме.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Production Architecture Stack */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                4. Масштабируемый стек для продакшена (Highload 100k+ товаров)
              </h2>
              <p className="text-xs text-slate-400">Очереди задач, распределенный воркер-кластер и Telegram Webhooks</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[11px] mb-1">Очередь задач:</div>
              <div className="font-bold text-white font-mono">BullMQ + Redis 7</div>
              <div className="text-[10px] text-slate-400 mt-1">Приоритетные очереди для платных тарифов</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[11px] mb-1">Парсер-кластер:</div>
              <div className="font-bold text-white font-mono">Playwright + Go</div>
              <div className="text-[10px] text-slate-400 mt-1">Стелс-драйверы с пулом резидентных IP</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[11px] mb-1">База данных:</div>
              <div className="font-bold text-white font-mono">PostgreSQL + TimescaleDB</div>
              <div className="text-[10px] text-slate-400 mt-1">Оптимизировано для таймсерий цен</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[11px] mb-1">Уведомления:</div>
              <div className="font-bold text-white font-mono">Telegram Bot API</div>
              <div className="text-[10px] text-slate-400 mt-1">Асинхронный диспетчер с ретраями</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
