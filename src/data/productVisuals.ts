// Аутентичные векторные и графические представления товаров
// Гарантируют мгновенную загрузку без внешних блокировок CDN или 404

export const GOLDSTAR_HEATER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="wallBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="30%" stop-color="#f8fafc" />
      <stop offset="70%" stop-color="#e2e8f0" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>
    <linearGradient id="bodyBevel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#94a3b8" stop-opacity="0.3" />
    </linearGradient>
    <linearGradient id="displayGlass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09090b" />
      <stop offset="50%" stop-color="#18181b" />
      <stop offset="100%" stop-color="#000000" />
    </linearGradient>
    <linearGradient id="warmAir" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.45" />
      <stop offset="50%" stop-color="#ef4444" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
    </linearGradient>
    <filter id="bodyShadow" x="-10%" y="-10%" width="120%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#000000" flood-opacity="0.65" />
    </filter>
    <filter id="glowCyan">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background Wall Mount Context -->
  <rect width="600" height="450" fill="url(#wallBg)" rx="16" />

  <!-- Background ambient room lighting -->
  <circle cx="300" cy="180" r="220" fill="#38bdf8" opacity="0.04" filter="blur(40px)" />

  <!-- Wall-mounted bracket shadow -->
  <rect x="55" y="105" width="490" height="150" rx="20" fill="#000000" opacity="0.4" filter="blur(14px)" />

  <!-- Main Chassis: GoldStar Wall Fan Heater Body -->
  <g filter="url(#bodyShadow)">
    <!-- Base Chassis Body -->
    <rect x="60" y="90" width="480" height="135" rx="16" fill="url(#bodyGrad)" stroke="#94a3b8" stroke-width="1.5" />
    
    <!-- Top Chamfer Highlight -->
    <path d="M 64 92 Q 300 88 536 92 L 536 98 Q 300 94 64 98 Z" fill="url(#bodyBevel)" />
    
    <!-- Bottom Air Vent Louver Inset -->
    <rect x="80" y="195" width="440" height="18" rx="4" fill="#64748b" stroke="#475569" stroke-width="1" />
    
    <!-- Vent Grill Slits -->
    <line x1="90" y1="200" x2="510" y2="200" stroke="#1e293b" stroke-width="1.5" />
    <line x1="90" y1="205" x2="510" y2="205" stroke="#334155" stroke-width="1.5" />
    <line x1="90" y1="209" x2="510" y2="209" stroke="#1e293b" stroke-width="1" />
    
    <!-- Left Section: GoldStar Brand Logo -->
    <text x="92" y="142" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="24" fill="#dc2626" letter-spacing="-0.5">
      GoldStar
    </text>
    <text x="94" y="160" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="11" fill="#475569" letter-spacing="1">
      GFH/CW-7420W
    </text>
    <text x="94" y="174" font-family="Arial, Helvetica, sans-serif" font-weight="600" font-size="9" fill="#0284c7">
      CERAMIC HEATER · 2000W
    </text>

    <!-- Center Separator Subtle Line -->
    <line x1="280" y1="110" x2="280" y2="175" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3,3" />

    <!-- Right Section: Digital LED Display Module -->
    <rect x="360" y="108" width="155" height="72" rx="10" fill="url(#displayGlass)" stroke="#3f3f46" stroke-width="1.5" />
    <rect x="364" y="112" width="147" height="64" rx="8" fill="#09090b" opacity="0.9" />

    <!-- Digital Temperature Readout 23°C -->
    <text x="382" y="152" font-family="'Courier New', Courier, monospace" font-weight="900" font-size="34" fill="#22d3ee" filter="url(#glowCyan)">
      23
    </text>
    <text x="428" y="136" font-family="'Courier New', Courier, monospace" font-weight="700" font-size="16" fill="#38bdf8">
      °C
    </text>

    <!-- Display Indicators: Heat Flame & Fan Icon -->
    <circle cx="465" cy="130" r="4" fill="#f59e0b" filter="url(#glowCyan)" />
    <text x="473" y="133" font-family="Arial, sans-serif" font-weight="800" font-size="9" fill="#fbbf24">
      HEAT
    </text>

    <circle cx="465" cy="148" r="4" fill="#38bdf8" filter="url(#glowCyan)" />
    <text x="473" y="151" font-family="Arial, sans-serif" font-weight="800" font-size="9" fill="#38bdf8">
      SWING
    </text>

    <!-- Mode Badge -->
    <rect x="375" y="162" width="50" height="10" rx="3" fill="#1e293b" />
    <text x="383" y="170" font-family="Arial, sans-serif" font-weight="700" font-size="7" fill="#94a3b8">
      2000W MAX
    </text>

    <rect x="432" y="162" width="45" height="10" rx="3" fill="#1e293b" />
    <text x="440" y="170" font-family="Arial, sans-serif" font-weight="700" font-size="7" fill="#4ade80">
      TIMER ON
    </text>
  </g>

  <!-- Warm Downward Air Flow Visualization -->
  <polygon points="120,215 480,215 520,300 80,300" fill="url(#warmAir)" />

  <!-- Remote Control (Пульт ДУ в комплекте) -->
  <g transform="translate(450, 245) rotate(-8)">
    <rect x="0" y="0" width="55" height="110" rx="8" fill="#1e293b" stroke="#475569" stroke-width="1.5" filter="url(#bodyShadow)" />
    <!-- IR Emitter Bulb -->
    <rect x="22" y="-3" width="11" height="4" rx="2" fill="#ef4444" />
    <!-- Brand on Remote -->
    <text x="10" y="16" font-family="Arial, sans-serif" font-weight="800" font-size="7" fill="#dc2626">
      GoldStar
    </text>
    <!-- Power Button -->
    <circle cx="27" cy="32" r="8" fill="#dc2626" stroke="#991b1b" stroke-width="1" />
    <text x="24" y="35" font-family="Arial, sans-serif" font-weight="900" font-size="9" fill="#ffffff">⏻</text>
    <!-- Control Buttons Grid -->
    <rect x="10" y="47" width="15" height="10" rx="2" fill="#334155" />
    <text x="14" y="55" font-size="7" fill="#ffffff">+</text>
    <rect x="30" y="47" width="15" height="10" rx="2" fill="#334155" />
    <text x="35" y="55" font-size="7" fill="#ffffff">-</text>

    <rect x="10" y="62" width="15" height="10" rx="2" fill="#0284c7" />
    <text x="12" y="70" font-size="6" fill="#ffffff">MODE</text>
    <rect x="30" y="62" width="15" height="10" rx="2" fill="#d97706" />
    <text x="32" y="70" font-size="6" fill="#ffffff">HEAT</text>

    <rect x="10" y="77" width="35" height="10" rx="2" fill="#475569" />
    <text x="17" y="85" font-size="6" fill="#ffffff">SWING</text>
  </g>

  <!-- Ozon Verified Badge Overlay -->
  <g transform="translate(40, 360)">
    <rect width="210" height="38" rx="8" fill="#005bff" opacity="0.95" />
    <text x="14" y="24" font-family="Arial, sans-serif" font-weight="900" font-size="14" fill="#ffffff">
      OZON КАРТА: 2 543 ₽
    </text>
  </g>

  <!-- Key Specs Badges Overlay -->
  <g transform="translate(265, 360)">
    <rect width="135" height="38" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1" />
    <text x="14" y="17" font-family="Arial, sans-serif" font-weight="700" font-size="10" fill="#94a3b8">
      МОЩНОСТЬ
    </text>
    <text x="14" y="32" font-family="Arial, sans-serif" font-weight="800" font-size="12" fill="#f59e0b">
      2000 Вт (2 кВт)
    </text>
  </g>

  <g transform="translate(415, 360)">
    <rect width="145" height="38" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1" />
    <text x="14" y="17" font-family="Arial, sans-serif" font-weight="700" font-size="10" fill="#94a3b8">
      ПЛОЩАДЬ ОБОГРЕВА
    </text>
    <text x="14" y="32" font-family="Arial, sans-serif" font-weight="800" font-size="12" fill="#38bdf8">
      до 25 кв.м
    </text>
  </g>
</svg>
`)}`;

export const SMART_MOP_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="mopBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="bucketGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="50%" stop-color="#f1f5f9" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>
    <linearGradient id="bucketLid" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="steelPole" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#94a3b8" />
      <stop offset="40%" stop-color="#f8fafc" />
      <stop offset="70%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#64748b" />
    </linearGradient>
    <filter id="mopShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#000000" flood-opacity="0.6" />
    </filter>
  </defs>

  <rect width="600" height="450" fill="url(#mopBg)" rx="16" />

  <!-- Ambient light -->
  <circle cx="320" cy="220" r="180" fill="#38bdf8" opacity="0.06" filter="blur(30px)" />

  <!-- Two-Chamber Bucket Body (Ведро с двумя отсеками WASH & DRY) -->
  <g filter="url(#mopShadow)">
    <!-- Base Bucket Shell -->
    <rect x="220" y="150" width="180" height="200" rx="14" fill="url(#bucketGrad)" stroke="#cbd5e1" stroke-width="2" />
    
    <!-- Vertical divider line between Wash & Dry chambers -->
    <line x1="310" y1="170" x2="310" y2="330" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4,4" />

    <!-- Bucket Rim & Lid Module -->
    <rect x="210" y="140" width="200" height="34" rx="8" fill="url(#bucketLid)" stroke="#0369a1" stroke-width="1.5" />

    <!-- Left Slot: WASH (Очистка) -->
    <rect x="230" y="148" width="65" height="18" rx="4" fill="#0f172a" />
    <text x="246" y="161" font-family="Arial, sans-serif" font-weight="900" font-size="9" fill="#38bdf8">
      WASH
    </text>

    <!-- Right Slot: DRY (Отжим) -->
    <rect x="325" y="148" width="65" height="18" rx="4" fill="#0f172a" />
    <text x="345" y="161" font-family="Arial, sans-serif" font-weight="900" font-size="9" fill="#f59e0b">
      DRY
    </text>

    <!-- Drain plugs at bottom -->
    <circle cx="265" cy="335" r="5" fill="#94a3b8" />
    <circle cx="355" cy="335" r="5" fill="#94a3b8" />

    <!-- Bucket Handle -->
    <path d="M 215 170 Q 310 110 405 170" fill="none" stroke="#64748b" stroke-width="4" stroke-linecap="round" />

    <!-- Smart Mop Branding on Bucket -->
    <rect x="240" y="225" width="140" height="42" rx="6" fill="#0f172a" opacity="0.9" />
    <text x="250" y="246" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#ffffff">
      Smart Mop
    </text>
    <text x="252" y="260" font-family="Arial, sans-serif" font-weight="700" font-size="8" fill="#38bdf8">
      СИСТЕМА ОТЖИМА 360°
    </text>
  </g>

  <!-- Mop: Stainless Steel Pole and Flat Head -->
  <g transform="translate(130, 70) rotate(-18)" filter="url(#mopShadow)">
    <!-- Steel Pole -->
    <rect x="38" y="0" width="10" height="280" rx="3" fill="url(#steelPole)" stroke="#475569" stroke-width="1" />
    <!-- Foam grip handle -->
    <rect x="36" y="15" width="14" height="60" rx="4" fill="#0284c7" />
    <rect x="36" y="110" width="14" height="40" rx="4" fill="#0284c7" />

    <!-- 360 Swivel joint -->
    <circle cx="43" cy="285" r="9" fill="#0284c7" stroke="#0369a1" stroke-width="1.5" />

    <!-- Flat Mop Head (Плоская насадка) -->
    <rect x="-15" y="290" width="116" height="24" rx="5" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" />
    
    <!-- Microfiber Pad (Микрофибра) -->
    <rect x="-17" y="310" width="120" height="8" rx="2" fill="#38bdf8" />
    <line x1="-15" y1="314" x2="101" y2="314" stroke="#0284c7" stroke-width="1" stroke-dasharray="2,2" />
  </g>

  <!-- Feature Badges -->
  <g transform="translate(40, 365)">
    <rect width="165" height="38" rx="8" fill="#005bff" opacity="0.95" />
    <text x="14" y="24" font-family="Arial, sans-serif" font-weight="900" font-size="13" fill="#ffffff">
      OZON / WB: от 819 ₽
    </text>
  </g>

  <g transform="translate(220, 365)">
    <rect width="170" height="38" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1" />
    <text x="12" y="17" font-family="Arial, sans-serif" font-weight="700" font-size="9" fill="#94a3b8">
      СИСТЕМА ОТЖИМА
    </text>
    <text x="12" y="32" font-family="Arial, sans-serif" font-weight="800" font-size="11" fill="#38bdf8">
      2 отсека (мойка + сушка)
    </text>
  </g>

  <g transform="translate(405, 365)">
    <rect width="155" height="38" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1" />
    <text x="12" y="17" font-family="Arial, sans-serif" font-weight="700" font-size="9" fill="#94a3b8">
      НАСАДКА
    </text>
    <text x="12" y="32" font-family="Arial, sans-serif" font-weight="800" font-size="11" fill="#4ade80">
      Густая микрофибра
    </text>
  </g>
</svg>
`)}`;

export const WEISSGAUFF_KETTLE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="kettleBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a0f1d" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="glassBody" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.15" />
      <stop offset="25%" stop-color="#ffffff" stop-opacity="0.25" />
      <stop offset="50%" stop-color="#0284c7" stop-opacity="0.08" />
      <stop offset="85%" stop-color="#ffffff" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#0369a1" stop-opacity="0.2" />
    </linearGradient>
    <linearGradient id="waterGlow" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.85" />
      <stop offset="40%" stop-color="#38bdf8" stop-opacity="0.45" />
      <stop offset="80%" stop-color="#7dd3fc" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="steelTrim" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#64748b" />
      <stop offset="30%" stop-color="#f8fafc" />
      <stop offset="60%" stop-color="#94a3b8" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>
    <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="40%" stop-color="#334155" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="teaFilter" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#94a3b8" />
      <stop offset="50%" stop-color="#cbd5e1" />
      <stop offset="100%" stop-color="#64748b" />
    </linearGradient>
    <filter id="kettleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="kettleShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="#000000" flood-opacity="0.75" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="600" height="450" fill="url(#kettleBg)" rx="16" />

  <!-- Ambient blue neon light reflection -->
  <circle cx="280" cy="240" r="170" fill="#0284c7" opacity="0.12" filter="blur(40px)" />
  <ellipse cx="280" cy="380" rx="190" ry="25" fill="#000000" opacity="0.65" filter="blur(10px)" />

  <!-- Main Kettle Body Assembly -->
  <g filter="url(#kettleShadow)">
    
    <!-- 360 Swivel Base (Подставка 360 градусов) -->
    <ellipse cx="280" cy="355" rx="115" ry="20" fill="url(#steelTrim)" stroke="#334155" stroke-width="1.5" />
    <ellipse cx="280" cy="350" rx="108" ry="16" fill="#0f172a" />
    <ellipse cx="280" cy="348" rx="30" ry="8" fill="#334155" stroke="#64748b" stroke-width="1" />

    <!-- Lower Stainless Steel Collar of Kettle (Металлическое основание колбы) -->
    <path d="M 185 320 C 185 342, 375 342, 375 320 L 370 344 C 370 358, 190 358, 190 344 Z" fill="url(#steelTrim)" stroke="#475569" stroke-width="1.5" />
    
    <!-- Brand Name "Weissgauff" on lower steel rim -->
    <text x="280" y="341" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="12" fill="#0f172a" text-anchor="middle" letter-spacing="1">
      Weissgauff
    </text>

    <!-- Glowing Blue LED Light Ring at bottom (Синяя LED подсветка) -->
    <ellipse cx="280" cy="320" rx="88" ry="12" fill="#00e5ff" filter="url(#kettleGlow)" opacity="0.9" />

    <!-- Glass Jug Interior Water Glow (Вода с ярким неоновым свечением) -->
    <path d="M 194 316 C 190 280, 195 210, 202 180 C 240 185, 320 185, 358 180 C 365 210, 370 280, 366 316 Z" fill="url(#waterGlow)" opacity="0.85" />
    
    <!-- Water Bubbles -->
    <circle cx="230" cy="290" r="4" fill="#ffffff" opacity="0.6" />
    <circle cx="238" cy="270" r="3" fill="#ffffff" opacity="0.5" />
    <circle cx="320" cy="285" r="5" fill="#ffffff" opacity="0.7" />
    <circle cx="312" cy="255" r="3.5" fill="#ffffff" opacity="0.5" />
    <circle cx="270" cy="300" r="4.5" fill="#ffffff" opacity="0.8" />
    <circle cx="275" cy="240" r="3" fill="#ffffff" opacity="0.4" />

    <!-- Tea Infuser Basket Inside (Съемный металлический заварочный фильтр) -->
    <rect x="255" y="160" width="50" height="135" rx="6" fill="url(#teaFilter)" stroke="#cbd5e1" stroke-width="1" opacity="0.85" />
    <!-- Filter perforations (микроперфорация) -->
    <line x1="262" y1="180" x2="298" y2="180" stroke="#475569" stroke-width="1.5" stroke-dasharray="2,2" />
    <line x1="262" y1="200" x2="298" y2="200" stroke="#475569" stroke-width="1.5" stroke-dasharray="2,2" />
    <line x1="262" y1="220" x2="298" y2="220" stroke="#475569" stroke-width="1.5" stroke-dasharray="2,2" />
    <line x1="262" y1="240" x2="298" y2="240" stroke="#475569" stroke-width="1.5" stroke-dasharray="2,2" />
    <line x1="262" y1="260" x2="298" y2="260" stroke="#475569" stroke-width="1.5" stroke-dasharray="2,2" />
    <line x1="262" y1="280" x2="298" y2="280" stroke="#475569" stroke-width="1.5" stroke-dasharray="2,2" />
    <text x="280" y="235" font-family="Arial, sans-serif" font-weight="700" font-size="7" fill="#1e293b" text-anchor="middle" letter-spacing="0.5">
      FILTER
    </text>

    <!-- Glass Jug Outer Contour (Стеклянная колба EcoGlass) -->
    <path d="M 190 324 L 202 165 C 203 155, 357 155, 358 165 L 370 324 C 370 338, 190 338, 190 324 Z" fill="url(#glassBody)" stroke="#94a3b8" stroke-width="2" />

    <!-- Glass Reflection Highlights -->
    <path d="M 205 170 L 196 315" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.65" />
    <path d="M 212 175 L 204 310" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.35" />
    <path d="M 353 170 L 362 315" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" opacity="0.5" />

    <!-- Measurement Scale (Мерная шкала 0.5, 1.0, 1.5, 1.7L MAX) -->
    <line x1="215" y1="290" x2="228" y2="290" stroke="#ffffff" stroke-width="1.5" opacity="0.8" />
    <text x="232" y="293" font-family="Arial, sans-serif" font-size="8" font-weight="700" fill="#ffffff" opacity="0.9">0.5L</text>
    <line x1="216" y1="255" x2="228" y2="255" stroke="#ffffff" stroke-width="1.5" opacity="0.8" />
    <text x="232" y="258" font-family="Arial, sans-serif" font-size="8" font-weight="700" fill="#ffffff" opacity="0.9">1.0L</text>
    <line x1="218" y1="220" x2="228" y2="220" stroke="#ffffff" stroke-width="1.5" opacity="0.8" />
    <text x="232" y="223" font-family="Arial, sans-serif" font-size="8" font-weight="700" fill="#ffffff" opacity="0.9">1.5L</text>
    <line x1="219" y1="195" x2="232" y2="195" stroke="#f43f5e" stroke-width="2" opacity="0.9" />
    <text x="236" y="198" font-family="Arial, sans-serif" font-size="8" font-weight="900" fill="#f43f5e">1.7L MAX</text>

    <!-- Stainless Steel Upper Collar and Spout (Металлический верх и носик) -->
    <path d="M 198 165 C 198 152, 362 152, 362 165 L 360 148 C 360 140, 200 140, 200 148 Z" fill="url(#steelTrim)" stroke="#475569" stroke-width="1.5" />
    <!-- Spout (Носик чайника) -->
    <path d="M 200 152 L 175 138 C 174 146, 185 165, 198 168 Z" fill="url(#steelTrim)" stroke="#475569" stroke-width="1.5" />

    <!-- Kettle Lid Assembly (Крышка с кнопкой открывания) -->
    <ellipse cx="280" cy="144" rx="78" ry="12" fill="url(#steelTrim)" stroke="#334155" stroke-width="1" />
    <rect x="260" y="132" width="40" height="8" rx="3" fill="#1e293b" />
    <!-- Push button -->
    <ellipse cx="280" cy="135" rx="10" ry="3" fill="#64748b" />

    <!-- Ergonomic Handle with TempControl Buttons (Ручка с кнопками регулировки температуры) -->
    <!-- Handle Outer Arch -->
    <path d="M 358 155 C 420 160, 440 230, 435 285 C 430 325, 395 342, 368 335 L 366 318 C 388 322, 412 305, 415 278 C 418 235, 402 180, 356 172 Z" fill="url(#handleGrad)" stroke="#475569" stroke-width="1.5" />
    
    <!-- Temperature Control Panel Inset on Handle (Панель 40°, 70°, 80°, 90°, 100°C) -->
    <g transform="translate(390, 205) rotate(12)">
      <rect x="0" y="0" width="26" height="75" rx="5" fill="#090d16" stroke="#334155" stroke-width="1" />
      
      <!-- Power button -->
      <circle cx="13" cy="10" r="5" fill="#ef4444" />
      <text x="13" y="12" font-family="Arial, sans-serif" font-size="5" font-weight="900" fill="#ffffff" text-anchor="middle">⏻</text>

      <!-- 100° Mode LED -->
      <circle cx="8" cy="24" r="2.5" fill="#38bdf8" />
      <text x="14" y="26" font-family="Arial, sans-serif" font-size="5.5" font-weight="700" fill="#94a3b8">100°</text>

      <!-- 90° Mode LED -->
      <circle cx="8" cy="35" r="2.5" fill="#38bdf8" />
      <text x="14" y="37" font-family="Arial, sans-serif" font-size="5.5" font-weight="700" fill="#94a3b8">90°</text>

      <!-- 80° Mode LED -->
      <circle cx="8" cy="46" r="2.5" fill="#38bdf8" />
      <text x="14" y="48" font-family="Arial, sans-serif" font-size="5.5" font-weight="700" fill="#94a3b8">80°</text>

      <!-- 70° Mode LED -->
      <circle cx="8" cy="57" r="2.5" fill="#38bdf8" />
      <text x="14" y="59" font-family="Arial, sans-serif" font-size="5.5" font-weight="700" fill="#94a3b8">70°</text>

      <!-- 40° Mode LED -->
      <circle cx="8" cy="67" r="2.5" fill="#38bdf8" />
      <text x="14" y="69" font-family="Arial, sans-serif" font-size="5.5" font-weight="700" fill="#94a3b8">40°</text>
    </g>
  </g>

  <!-- Product Feature Chips at Bottom -->
  <g transform="translate(35, 385)">
    <rect width="165" height="42" rx="10" fill="#005bff" opacity="0.95" />
    <text x="14" y="17" font-family="Arial, sans-serif" font-weight="700" font-size="9" fill="#bae6fd">
      OZON КАРТА: -10%
    </text>
    <text x="14" y="34" font-family="Arial, sans-serif" font-weight="900" font-size="14" fill="#ffffff">
      1 914 ₽ <tspan font-size="11" font-weight="500" fill="#93c5fd">(вместо 4 785 ₽)</tspan>
    </text>
  </g>

  <g transform="translate(210, 385)">
    <rect width="185" height="42" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
    <text x="14" y="17" font-family="Arial, sans-serif" font-weight="700" font-size="9" fill="#94a3b8">
      МОЩНОСТЬ И ОБЪЕМ
    </text>
    <text x="14" y="33" font-family="Arial, sans-serif" font-weight="900" font-size="12" fill="#38bdf8">
      2200 Вт · 1.7 л · EcoGlass
    </text>
  </g>

  <g transform="translate(405, 385)">
    <rect width="160" height="42" rx="10" fill="#1e293b" stroke="#334155" stroke-width="1.5" />
    <text x="14" y="17" font-family="Arial, sans-serif" font-weight="700" font-size="9" fill="#94a3b8">
      ФУНКЦИИ 2 В 1
    </text>
    <text x="14" y="33" font-family="Arial, sans-serif" font-weight="900" font-size="12" fill="#4ade80">
      5 режимов + Фильтр
    </text>
  </g>
</svg>
`)}`;

export const MIXIT_SHAMPOO_SET_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
  <defs>
    <linearGradient id="cosmeticBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#181310" />
      <stop offset="50%" stop-color="#100d0b" />
      <stop offset="100%" stop-color="#070504" />
    </linearGradient>
    <linearGradient id="bottleBeige" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e2c5b0" />
      <stop offset="25%" stop-color="#fdf4ec" />
      <stop offset="60%" stop-color="#d9b69e" />
      <stop offset="100%" stop-color="#a8856e" />
    </linearGradient>
    <linearGradient id="bottleBalm" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ddbcab" />
      <stop offset="30%" stop-color="#faf0e6" />
      <stop offset="70%" stop-color="#d3ad99" />
      <stop offset="100%" stop-color="#9e7b67" />
    </linearGradient>
    <linearGradient id="pumpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2a221d" />
      <stop offset="40%" stop-color="#423730" />
      <stop offset="100%" stop-color="#140f0c" />
    </linearGradient>
    <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <filter id="bottleShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="15" flood-color="#000000" flood-opacity="0.8" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="600" height="450" fill="url(#cosmeticBg)" rx="16" />

  <!-- Ambient warm peach studio glow -->
  <circle cx="300" cy="220" r="190" fill="#f59e0b" opacity="0.08" filter="blur(40px)" />
  <ellipse cx="300" cy="375" rx="220" ry="25" fill="#000000" opacity="0.75" filter="blur(12px)" />

  <!-- Product Bottles Group -->
  <g filter="url(#bottleShadow)">
    
    <!-- LEFT BOTTLE: MIXIT ШАМПУНЬ (1000 мл) -->
    <g transform="translate(170, 75)">
      <!-- Pump Head (Помпа-дозатор) -->
      <!-- Pump tube neck -->
      <rect x="52" y="32" width="16" height="20" rx="2" fill="url(#pumpGrad)" stroke="#1a1410" stroke-width="1" />
      <!-- Pump nozzle horizontal -->
      <path d="M 40 18 C 40 14, 85 14, 85 18 L 82 32 L 43 32 Z" fill="url(#pumpGrad)" stroke="#1a1410" stroke-width="1" />
      <path d="M 40 20 L 15 24 C 13 25, 13 29, 16 30 L 42 27 Z" fill="url(#pumpGrad)" />
      <!-- Push button top -->
      <ellipse cx="62" cy="15" rx="14" ry="4" fill="#52433b" />

      <!-- Bottle Main Cylindrical Body (1000 мл) -->
      <!-- Shoulder curve -->
      <path d="M 42 50 C 42 42, 78 42, 78 50 L 105 75 C 114 84, 114 95, 114 105 L 114 275 C 114 286, 106 292, 95 292 L 25 292 C 14 292, 6 286, 6 275 L 6 105 C 6 95, 6 84, 15 75 Z" fill="url(#bottleBeige)" stroke="#a8856e" stroke-width="1.5" />

      <!-- Specular glass/plastic highlights -->
      <path d="M 18 90 L 18 275" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.45" />
      <path d="M 26 95 L 26 270" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.3" />

      <!-- Front Label Area -->
      <rect x="22" y="98" width="76" height="155" rx="4" fill="#fdfaf7" stroke="#e8d8ce" stroke-width="1" opacity="0.95" />

      <!-- Brand Logo "MIXIT" -->
      <text x="60" y="122" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="16" fill="#181310" text-anchor="middle" letter-spacing="3">
        MIXIT
      </text>
      <text x="60" y="133" font-family="Arial, sans-serif" font-weight="700" font-size="6.5" fill="#a8856e" text-anchor="middle" letter-spacing="1.5">
        LABORATORIA
      </text>

      <!-- Gold line -->
      <line x1="32" y1="140" x2="88" y2="140" stroke="url(#goldAccent)" stroke-width="1" />

      <!-- Series Name -->
      <text x="60" y="152" font-family="Arial, sans-serif" font-weight="800" font-size="8" fill="#181310" text-anchor="middle">
        COLLAGEN
      </text>
      <text x="60" y="161" font-family="Arial, sans-serif" font-weight="800" font-size="8" fill="#c2410c" text-anchor="middle">
        + BIOTIN
      </text>

      <!-- Product Purpose -->
      <rect x="28" y="168" width="64" height="13" rx="2" fill="#181310" />
      <text x="60" y="177" font-family="Arial, sans-serif" font-weight="900" font-size="7" fill="#ffffff" text-anchor="middle">
        ШАМПУНЬ
      </text>

      <text x="60" y="193" font-family="Arial, sans-serif" font-size="6" fill="#52433b" text-anchor="middle">
        Восстановление
      </text>
      <text x="60" y="201" font-family="Arial, sans-serif" font-size="5.5" fill="#52433b" text-anchor="middle">
        после окрашивания
      </text>

      <!-- Volume -->
      <text x="60" y="235" font-family="Arial, sans-serif" font-weight="800" font-size="10" fill="#181310" text-anchor="middle">
        1000 ml
      </text>
    </g>

    <!-- RIGHT BOTTLE: MIXIT БАЛЬЗАМ ДЛЯ ВОЛОС (1000 мл) -->
    <g transform="translate(310, 75)">
      <!-- Pump Head -->
      <rect x="52" y="32" width="16" height="20" rx="2" fill="url(#pumpGrad)" stroke="#1a1410" stroke-width="1" />
      <path d="M 40 18 C 40 14, 85 14, 85 18 L 82 32 L 43 32 Z" fill="url(#pumpGrad)" stroke="#1a1410" stroke-width="1" />
      <path d="M 40 20 L 15 24 C 13 25, 13 29, 16 30 L 42 27 Z" fill="url(#pumpGrad)" />
      <ellipse cx="62" cy="15" rx="14" ry="4" fill="#52433b" />

      <!-- Bottle Main Cylindrical Body (1000 мл) -->
      <path d="M 42 50 C 42 42, 78 42, 78 50 L 105 75 C 114 84, 114 95, 114 105 L 114 275 C 114 286, 106 292, 95 292 L 25 292 C 14 292, 6 286, 6 275 L 6 105 C 6 95, 6 84, 15 75 Z" fill="url(#bottleBalm)" stroke="#9e7b67" stroke-width="1.5" />

      <!-- Specular highlights -->
      <path d="M 18 90 L 18 275" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.45" />
      <path d="M 26 95 L 26 270" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.3" />

      <!-- Front Label Area -->
      <rect x="22" y="98" width="76" height="155" rx="4" fill="#fdfaf7" stroke="#e8d8ce" stroke-width="1" opacity="0.95" />

      <!-- Brand Logo "MIXIT" -->
      <text x="60" y="122" font-family="'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="16" fill="#181310" text-anchor="middle" letter-spacing="3">
        MIXIT
      </text>
      <text x="60" y="133" font-family="Arial, sans-serif" font-weight="700" font-size="6.5" fill="#a8856e" text-anchor="middle" letter-spacing="1.5">
        LABORATORIA
      </text>

      <!-- Gold line -->
      <line x1="32" y1="140" x2="88" y2="140" stroke="url(#goldAccent)" stroke-width="1" />

      <!-- Series Name -->
      <text x="60" y="152" font-family="Arial, sans-serif" font-weight="800" font-size="8" fill="#181310" text-anchor="middle">
        COLLAGEN
      </text>
      <text x="60" y="161" font-family="Arial, sans-serif" font-weight="800" font-size="8" fill="#c2410c" text-anchor="middle">
        + BIOTIN
      </text>

      <!-- Product Purpose -->
      <rect x="28" y="168" width="64" height="13" rx="2" fill="#c2410c" />
      <text x="60" y="177" font-family="Arial, sans-serif" font-weight="900" font-size="7" fill="#ffffff" text-anchor="middle">
        БАЛЬЗАМ
      </text>

      <text x="60" y="193" font-family="Arial, sans-serif" font-size="6" fill="#52433b" text-anchor="middle">
        Увлажнение и блеск
      </text>
      <text x="60" y="201" font-family="Arial, sans-serif" font-size="5.5" fill="#52433b" text-anchor="middle">
        легкое расчесывание
      </text>

      <!-- Volume -->
      <text x="60" y="235" font-family="Arial, sans-serif" font-weight="800" font-size="10" fill="#181310" text-anchor="middle">
        1000 ml
      </text>
    </g>

    <!-- Center "+2 шт в наборе" Badge linking both bottles -->
    <g transform="translate(255, 235)">
      <rect x="0" y="0" width="90" height="26" rx="13" fill="#cb11ab" stroke="#ffffff" stroke-width="1.5" />
      <text x="45" y="17" font-family="Arial, sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle">
        2 x 1000 мл
      </text>
    </g>
  </g>

  <!-- Product Feature Chips at Bottom -->
  <g transform="translate(35, 385)">
    <rect width="165" height="42" rx="10" fill="#cb11ab" opacity="0.95" />
    <text x="14" y="17" font-family="Arial, sans-serif" font-weight="700" font-size="9" fill="#fdf2f8">
      WB КОШЕЛЕК / СПП: -56%
    </text>
    <text x="14" y="34" font-family="Arial, sans-serif" font-weight="900" font-size="15" fill="#ffffff">
      777 ₽ <tspan font-size="11" font-weight="500" fill="#fbcfe8">(вместо 1 752 ₽)</tspan>
    </text>
  </g>

  <g transform="translate(210, 385)">
    <rect width="185" height="42" rx="10" fill="#1e1b18" stroke="#3d332a" stroke-width="1.5" />
    <text x="14" y="17" font-family="Arial, sans-serif" font-weight="700" font-size="9" fill="#a89a8c">
      ОБЪЕМ НАБОРА
    </text>
    <text x="14" y="33" font-family="Arial, sans-serif" font-weight="900" font-size="12" fill="#fbbf24">
      2000 мл · Шампунь + Бальзам
    </text>
  </g>

  <g transform="translate(405, 385)">
    <rect width="160" height="42" rx="10" fill="#1e1b18" stroke="#3d332a" stroke-width="1.5" />
    <text x="14" y="17" font-family="Arial, sans-serif" font-weight="700" font-size="9" fill="#a89a8c">
      РЕЙТИНГ WB
    </text>
    <text x="14" y="33" font-family="Arial, sans-serif" font-weight="900" font-size="12" fill="#4ade80">
      4.9 ★ (307 377 отзывов)
    </text>
  </g>
</svg>
`)}`;
