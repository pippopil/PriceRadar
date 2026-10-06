import React, { useState, useEffect } from 'react';
import { MarketplaceId } from '../types';
import { 
  Flame, 
  Wind, 
  Radio, 
  Zap, 
  ShieldCheck, 
  Smartphone, 
  Headphones, 
  Laptop, 
  Sparkles, 
  Coffee, 
  Watch, 
  Gamepad2, 
  Tv, 
  ShoppingBag, 
  Camera,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { detectCategoryType } from '../services/imageResolver';

interface ProductImageProps {
  imageUrl?: string;
  title: string;
  brand: string;
  category: string;
  sourceMarketplace: MarketplaceId;
  className?: string;
  showBadges?: boolean;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  imageUrl,
  title,
  brand,
  category,
  sourceMarketplace,
  className = '',
  showBadges = true
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Сброс состояния ошибки при изменении входного URL или названия
  useEffect(() => {
    setHasError(false);
    setIsLoaded(Boolean(imageUrl?.startsWith('data:image/')));
  }, [imageUrl, title]);

  const isDataUri = Boolean(imageUrl?.startsWith('data:image/'));

  const categoryType = detectCategoryType(`${title} ${brand} ${category}`);

  // Рендеринг специализированной векторной карточки, если картинка не загрузилась или отсутствует
  const renderCategoryVisualFallback = () => {
    switch (categoryType) {
      case 'climate':
        return (
          <div className="relative w-full h-full bg-gradient-to-b from-stone-900 to-stone-950 rounded-xl overflow-hidden flex flex-col justify-between p-3 select-none border border-stone-800">
            {showBadges && (
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white shadow-sm">
                  {sourceMarketplace.toUpperCase()} Распродажа
                </span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-600/90 text-white">
                  Климат
                </span>
              </div>
            )}

            {/* Векторный корпус тепловентилятора */}
            <div className="relative my-auto py-2 flex flex-col items-center justify-center">
              <div className="relative w-40 sm:w-44 h-18 bg-gradient-to-b from-stone-100 via-stone-200 to-stone-300 rounded-lg shadow-2xl border border-stone-300 flex items-center justify-between px-3 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-b from-white/80 to-transparent" />
                <div className="flex flex-col z-10">
                  <span className="text-xs font-black tracking-tight text-red-600 font-sans">
                    {brand || 'GoldStar'}
                  </span>
                  <span className="text-[8px] font-bold text-stone-600 tracking-wider">
                    2000W
                  </span>
                </div>
                <div className="w-14 h-12 bg-stone-950 rounded border border-stone-800 p-1 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-cyan-400 font-mono font-bold text-sm leading-none">23°C</span>
                  <div className="flex items-center gap-1 mt-0.5 text-[7px] text-cyan-300">
                    <Flame className="w-2.5 h-2.5 text-amber-400" />
                    <Wind className="w-2.5 h-2.5 text-cyan-400" />
                  </div>
                </div>
                <div className="absolute bottom-1 inset-x-2 h-1 bg-stone-400/80 rounded-sm" />
              </div>
              <div className="w-32 h-4 bg-gradient-to-b from-amber-500/25 to-transparent blur-sm -mt-0.5 rounded-full" />
            </div>

            {showBadges && (
              <div className="grid grid-cols-2 gap-1 z-10 pt-1 border-t border-stone-800/80 text-[10px]">
                <div className="bg-stone-900 border border-stone-700 rounded px-1.5 py-0.5 flex items-center gap-1 text-amber-300 font-semibold">
                  <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>2000W</span>
                </div>
                <div className="bg-stone-900 border border-stone-700 rounded px-1.5 py-0.5 flex items-center gap-1 text-stone-200 font-semibold">
                  <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>До 25 м²</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'smartphone':
        return (
          <div className="relative w-full h-full bg-gradient-to-b from-indigo-950/80 to-slate-950 rounded-xl overflow-hidden flex flex-col justify-between p-3 select-none border border-indigo-900/50">
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white shadow-sm">
                Смартфон
              </span>
              <span className="text-[9px] font-mono text-indigo-300">OLED / 5G</span>
            </div>
            <div className="relative my-auto flex flex-col items-center justify-center">
              <div className="w-20 h-32 bg-slate-900 rounded-2xl border-2 border-slate-700 shadow-2xl p-1 flex flex-col items-center justify-between relative overflow-hidden">
                <div className="w-6 h-1.5 bg-black rounded-full mb-1" />
                <div className="my-auto text-center">
                  <Smartphone className="w-8 h-8 text-indigo-400 mx-auto mb-1 animate-pulse" />
                  <span className="text-[9px] font-bold text-white block">{brand}</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-600 rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 border-t border-slate-800">
              <span className="font-semibold text-indigo-400">Оригинал</span>
              <span className="font-mono">128-512GB</span>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="relative w-full h-full bg-gradient-to-b from-purple-950/80 to-slate-950 rounded-xl overflow-hidden flex flex-col justify-between p-3 select-none border border-purple-900/50">
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-600 text-white">
                Hi-Res Audio
              </span>
              <span className="text-[9px] font-mono text-purple-300">ANC</span>
            </div>
            <div className="my-auto flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-2 shadow-inner">
                <Headphones className="w-9 h-9 text-purple-400" />
              </div>
              <span className="text-xs font-bold text-white">{brand}</span>
              <span className="text-[10px] text-purple-300 font-mono">LDAC / 30h</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span>Шумоподавление</span>
              <span className="text-purple-300 font-semibold">Active ANC</span>
            </div>
          </div>
        );

      case 'laptop':
        return (
          <div className="relative w-full h-full bg-gradient-to-b from-sky-950/80 to-slate-950 rounded-xl overflow-hidden flex flex-col justify-between p-3 select-none border border-sky-900/50">
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-600 text-white">
                Ноутбук
              </span>
              <span className="text-[9px] font-mono text-sky-300">IPS / SSD</span>
            </div>
            <div className="my-auto flex flex-col items-center justify-center text-center">
              <Laptop className="w-12 h-12 text-sky-400 mb-1" />
              <span className="text-xs font-bold text-white">{brand}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span>Производительность</span>
              <span className="text-sky-300 font-semibold">Ultra</span>
            </div>
          </div>
        );

      case 'vacuum':
        return (
          <div className="relative w-full h-full bg-gradient-to-b from-emerald-950/80 to-slate-950 rounded-xl overflow-hidden flex flex-col justify-between p-3 select-none border border-emerald-900/50">
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                Умная уборка
              </span>
              <span className="text-[9px] font-mono text-emerald-300">LiDAR</span>
            </div>
            <div className="my-auto flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-1 relative">
                <div className="w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                </div>
              </div>
              <span className="text-xs font-bold text-white">{brand}</span>
              <span className="text-[10px] text-emerald-300">Сухая + влажная</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span>Автоочистка</span>
              <span className="text-emerald-300 font-semibold">5500 Pa</span>
            </div>
          </div>
        );

      case 'coffee':
        return (
          <div className="relative w-full h-full bg-gradient-to-b from-amber-950/80 to-slate-950 rounded-xl overflow-hidden flex flex-col justify-between p-3 select-none border border-amber-900/50">
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-600 text-white">
                Кофемашина
              </span>
              <span className="text-[9px] font-mono text-amber-300">15 Bar</span>
            </div>
            <div className="my-auto flex flex-col items-center justify-center text-center">
              <Coffee className="w-11 h-11 text-amber-400 mb-1" />
              <span className="text-xs font-bold text-white">{brand}</span>
              <span className="text-[10px] text-amber-300">Эспрессо / Капучино</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span>Жернова</span>
              <span className="text-amber-300 font-semibold">Керамика</span>
            </div>
          </div>
        );

      case 'beauty':
        return (
          <div className="relative w-full h-full bg-gradient-to-b from-pink-950/80 to-slate-950 rounded-xl overflow-hidden flex flex-col justify-between p-3 select-none border border-pink-900/50">
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-600 text-white">
                Красота & Уход
              </span>
              <span className="text-[9px] font-mono text-pink-300">Ионизация</span>
            </div>
            <div className="my-auto flex flex-col items-center justify-center text-center">
              <Sparkles className="w-11 h-11 text-pink-400 mb-1 animate-pulse" />
              <span className="text-xs font-bold text-white">{brand}</span>
              <span className="text-[10px] text-pink-300">Контроль нагрева</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span>Насадки</span>
              <span className="text-pink-300 font-semibold">Комплект</span>
            </div>
          </div>
        );

      case 'cleaning':
        return (
          <div className="relative w-full h-full bg-gradient-to-b from-sky-950/80 to-slate-950 rounded-xl overflow-hidden flex flex-col justify-between p-3 select-none border border-sky-900/50">
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-600 text-white">
                Уборка & Дом
              </span>
              <span className="text-[9px] font-mono text-sky-300">WASH & DRY 360°</span>
            </div>
            <div className="my-auto flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center mb-1.5 shadow-inner">
                <Layers className="w-8 h-8 text-sky-400" />
              </div>
              <span className="text-xs font-bold text-white line-clamp-1">{brand || 'Smart Mop'}</span>
              <span className="text-[10px] text-sky-300">Швабра с ведром и отжимом</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 border-t border-slate-800">
              <span>Система</span>
              <span className="text-sky-300 font-semibold">2 отсека (8 л)</span>
            </div>
          </div>
        );

      case 'kettle':
        return (
          <div className="relative w-full h-full bg-gradient-to-b from-sky-950/80 to-slate-950 rounded-xl overflow-hidden flex flex-col justify-between p-3 select-none border border-sky-900/50">
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-600 text-white shadow-sm">
                {brand || 'Weissgauff'}
              </span>
              <span className="text-[9px] font-mono text-cyan-300">EcoGlass 2200W</span>
            </div>
            <div className="my-auto flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mb-1.5 shadow-inner relative">
                <Coffee className="w-8 h-8 text-cyan-400" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-400/20 flex items-center justify-center">
                  <Flame className="w-2.5 h-2.5 text-amber-400" />
                </div>
              </div>
              <span className="text-xs font-bold text-white line-clamp-1">{title || 'Электрический чайник'}</span>
              <span className="text-[10px] text-cyan-300">1.7 л · 5 режимов · Заварочный фильтр</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1 border-t border-slate-800">
              <span className="text-slate-400">Колба</span>
              <span className="text-cyan-300 font-semibold">LED-подсветка</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="relative w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 rounded-xl overflow-hidden flex flex-col justify-between p-3 select-none border border-slate-800">
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-200">
                {sourceMarketplace.toUpperCase()}
              </span>
              <span className="text-[9px] font-mono text-slate-400">Проверено</span>
            </div>
            <div className="my-auto flex flex-col items-center justify-center text-center p-2">
              <ShoppingBag className="w-10 h-10 text-indigo-400 mb-1" />
              <span className="text-xs font-bold text-white line-clamp-1">{brand || 'Товар'}</span>
              <span className="text-[10px] text-slate-400 line-clamp-1">{category}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span>Качество</span>
              <span className="text-indigo-400 font-semibold">100% Оригинал</span>
            </div>
          </div>
        );
    }
  };

  // Если URL картинки передан и нет ошибки загрузки
  if (imageUrl && !hasError) {
    const showImage = isLoaded || isDataUri;
    return (
      <div className={`relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-slate-950 ${className}`}>
        {/* Skeleton while loading */}
        {!showImage && (
          <div className="absolute inset-0 bg-slate-900/80 animate-pulse flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-slate-700 animate-spin" />
          </div>
        )}

        <img
          src={imageUrl}
          alt={title}
          loading="eager"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`max-h-full max-w-full object-contain transition-opacity duration-300 rounded-lg ${
            showImage ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {showBadges && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-200 border border-slate-700/80 backdrop-blur-sm">
              {brand}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Fallback к векторной визуализации карточки
  return (
    <div className={`w-full h-full ${className}`}>
      {renderCategoryVisualFallback()}
    </div>
  );
};
