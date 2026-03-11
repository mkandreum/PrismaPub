export const SITE_FONT_OPTIONS = [
  {
    key: "amplitude",
    label: "Amplitude BRK (actual)",
    stack: '"Amplitude BRK", "Trebuchet MS", "Segoe UI", sans-serif',
    description: "La tipografia actual del sitio.",
  },
  {
    key: "bungee",
    label: "Bungee",
    stack: '"Bungee", "Trebuchet MS", "Segoe UI", sans-serif',
    description: "Gruesa y festiva, muy de cartel de fiesta.",
  },
  {
    key: "orbitron",
    label: "Orbitron",
    stack: '"Orbitron", "Arial Black", "Segoe UI", sans-serif',
    description: "Futurista y neon, estilo club electronico.",
  },
  {
    key: "russo",
    label: "Russo One",
    stack: '"Russo One", "Arial Black", "Segoe UI", sans-serif',
    description: "Compacta y potente para titulares.",
  },
  {
    key: "staatliches",
    label: "Staatliches",
    stack: '"Staatliches", "Impact", "Segoe UI", sans-serif',
    description: "Industrial y de alto impacto visual.",
  },
  {
    key: "monoton",
    label: "Monoton",
    stack: '"Monoton", "Arial Black", "Segoe UI", sans-serif',
    description: "Retro neon, ideal para noches tematicas.",
  },
  {
    key: "bebas-neue",
    label: "Bebas Neue",
    stack: '"Bebas Neue", "Impact", "Segoe UI", sans-serif',
    description: "Titulo limpio y potente para flyers.",
  },
  {
    key: "anton",
    label: "Anton",
    stack: '"Anton", "Arial Black", "Segoe UI", sans-serif',
    description: "Muy gruesa, para mensajes directos y fuertes.",
  },
  {
    key: "teko",
    label: "Teko",
    stack: '"Teko", "Trebuchet MS", "Segoe UI", sans-serif',
    description: "Condensada y moderna, estilo cartel urbano.",
  },
  {
    key: "audiowide",
    label: "Audiowide",
    stack: '"Audiowide", "Trebuchet MS", "Segoe UI", sans-serif',
    description: "Techno suave con vibra de club futurista.",
  },
  {
    key: "righteous",
    label: "Righteous",
    stack: '"Righteous", "Trebuchet MS", "Segoe UI", sans-serif',
    description: "Curvada y divertida, ideal para noche pop.",
  },
  {
    key: "exo2",
    label: "Exo 2",
    stack: '"Exo 2", "Trebuchet MS", "Segoe UI", sans-serif',
    description: "Versatil y moderna para todo el sitio.",
  },
  {
    key: "chakra-petch",
    label: "Chakra Petch",
    stack: '"Chakra Petch", "Trebuchet MS", "Segoe UI", sans-serif',
    description: "Geometrica y digital para eventos electronicos.",
  },
  {
    key: "press-start",
    label: "Press Start 2P",
    stack: '"Press Start 2P", "Courier New", monospace',
    description: "Pixel retro para tematicas arcade.",
  },
  {
    key: "saira-stencil",
    label: "Saira Stencil One",
    stack: '"Saira Stencil One", "Arial Black", "Segoe UI", sans-serif',
    description: "Stencil agresiva y muy llamativa.",
  },
  {
    key: "wallpoet",
    label: "Wallpoet",
    stack: '"Wallpoet", "Impact", "Segoe UI", sans-serif',
    description: "Underground con caracter de poster nocturno.",
  },
  {
    key: "black-ops",
    label: "Black Ops One",
    stack: '"Black Ops One", "Arial Black", "Segoe UI", sans-serif',
    description: "Bloque militar vintage, muy impactante.",
  },
  {
    key: "syncopate",
    label: "Syncopate",
    stack: '"Syncopate", "Trebuchet MS", "Segoe UI", sans-serif',
    description: "Fina y espacial para look premium.",
  },
  {
    key: "rubik-glitch",
    label: "Rubik Glitch",
    stack: '"Rubik Glitch", "Arial Black", "Segoe UI", sans-serif',
    description: "Efecto glitch extremo para campanas especiales.",
  },
  {
    key: "unica-one",
    label: "Unica One",
    stack: '"Unica One", "Trebuchet MS", "Segoe UI", sans-serif',
    description: "Elegante y condensada para branding moderno.",
  },
  {
    key: "quantico",
    label: "Quantico",
    stack: '"Quantico", "Trebuchet MS", "Segoe UI", sans-serif',
    description: "Tecnica y contundente para anuncios de DJs.",
  },
] as const;

export type SiteFontKey = (typeof SITE_FONT_OPTIONS)[number]["key"];

export const DEFAULT_SITE_FONT: SiteFontKey = "amplitude";

const FONT_STACK_BY_KEY = SITE_FONT_OPTIONS.reduce((acc, option) => {
  acc[option.key] = option.stack;
  return acc;
}, {} as Record<SiteFontKey, string>);

export function normalizeSiteFontKey(value?: string): SiteFontKey {
  if (!value) return DEFAULT_SITE_FONT;
  const found = SITE_FONT_OPTIONS.find((option) => option.key === value);
  return found?.key || DEFAULT_SITE_FONT;
}

export function applySiteFont(siteFont?: string): SiteFontKey {
  const key = normalizeSiteFontKey(siteFont);
  const fontStack = FONT_STACK_BY_KEY[key];

  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--font-sans", fontStack);
    document.documentElement.style.setProperty("--font-display", fontStack);
    document.documentElement.dataset.siteFont = key;
  }

  return key;
}
