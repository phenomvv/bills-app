/**
 * State Management & Data
 */
// Available categories
const CATEGORIES = [
  'Entertainment', 'Software', 'Lifestyle', 'Utilities', 'Auto',
  'Health', 'Finance', 'Education', 'Food', 'Shopping', 'Other'
];

const CATEGORY_MAP = {
  en: {
    'Entertainment': 'Entertainment', 'Software': 'Software', 'Lifestyle': 'Lifestyle',
    'Utilities': 'Utilities', 'Auto': 'Auto', 'Health': 'Health',
    'Finance': 'Finance', 'Education': 'Education', 'Food': 'Food',
    'Shopping': 'Shopping', 'Other': 'Other'
  },
  es: {
    'Entertainment': 'Entretenimiento', 'Software': 'Software', 'Lifestyle': 'Estilo de vida',
    'Utilities': 'Servicios', 'Auto': 'Automóvil', 'Health': 'Salud',
    'Finance': 'Finanzas', 'Education': 'Educación', 'Food': 'Comida',
    'Shopping': 'Compras', 'Other': 'Otro'
  }
};

// Currency options
const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar' },
  MXN: { symbol: '$', name: 'Mexican Peso', suffix: ' MXN' },
  GBP: { symbol: '£', name: 'British Pound' },
  EUR: { symbol: '€', name: 'Euro' }
};

const BRAND_COLORS = {
  'netflix': '#E50914',
  'spotify': '#1DB954',
  'apple': '#555555',
  'icloud': '#007AFF',
  'disney': '#006E99',
  'youtube': '#FF0000',
  'adobe': '#FF021B',
  'amazon': '#FF9900',
  'slack': '#4A154B',
  'figma': '#F24E1E',
  'zoom': '#2D8CFF',
  'google': '#4285F4',
  'microsoft': '#00A4EF',
  'hulu': '#1CE783',
  'hbo': '#151515',
  'paramount': '#0064FF',
  'crunchyroll': '#F47521'
};

let state = {
  user: JSON.parse(localStorage.getItem('user')) || {
    name: "Alex Thompson",
    email: "alex.t@premium.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    isPremium: true,
    biometricEnabled: false
  },
  preferences: JSON.parse(localStorage.getItem('preferences')) || {
    currency: 'USD',
    notificationsEnabled: false,
    language: 'en',
    theme: 'dark',
    reminderDaysBefore: 1
  },
  subscriptions: JSON.parse(localStorage.getItem('subscriptions')) || [
    { id: 1, name: 'Netflix', price: 15.99, currency: 'USD', category: 'Entertainment', billingDay: 5, billingCycle: 'monthly', startDate: '2020-03-01', icon: 'N', color: '#E50914' },
    { id: 2, name: 'Spotify', price: 9.99, currency: 'GBP', category: 'Entertainment', billingDay: 15, billingCycle: 'monthly', startDate: '2019-06-15', icon: 'S', color: '#1DB954' },
    { id: 3, name: 'iCloud+', price: 9.99, currency: 'USD', category: 'Software', billingDay: 12, billingCycle: 'monthly', startDate: '2021-01-12', icon: 'C', color: '#007AFF' },
    { id: 4, name: 'Adobe CC', price: 52.99, currency: 'EUR', category: 'Software', billingDay: 22, billingCycle: 'monthly', startDate: '2022-09-01', icon: 'Ai', color: '#FF0000' },
    { id: 5, name: 'YouTube Premium', price: 13.99, currency: 'USD', category: 'Entertainment', billingDay: 28, billingCycle: 'monthly', startDate: '2023-02-28', icon: 'Y', color: '#FF0000' }
  ],
  notifications: JSON.parse(localStorage.getItem('notifications')) || [
    { id: Date.now(), title: "Welcome to Bills!", body: "Tap to clear this notification. Swiping simulated.", icon: "star" },
    { id: Date.now() + 1, title: "Currency Rates Updated", body: "We've fetched the latest rates for USD, MXN, GBP, and EUR.", icon: "refresh-cw" }
  ],
  exchangeRates: JSON.parse(localStorage.getItem('exchangeRates')) || { USD: 1, MXN: 17.5, GBP: 0.79, EUR: 0.92 },
  currentScreen: 'home',
  isLocked: false,
  selectedPreset: null
};

// Auto-lock if biometric enabled
if (state.user.biometricEnabled) {
  state.isLocked = true;
}

// PWA Install Detection
const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone ||
  document.referrer.includes('android-app://');

let deferredPrompt;

// Capture the beforeinstallprompt event (Chrome, Edge, Samsung Internet)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Show install banner if not already installed
  if (!isPWA && !localStorage.getItem('installBannerDismissed')) {
    showInstallBanner();
  }
});

// For mobile devices (especially iOS which doesn't support beforeinstallprompt)
window.addEventListener('load', () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile && !isPWA && !localStorage.getItem('installBannerDismissed')) {
    // Wait 2 seconds for page to load, then show banner
    setTimeout(() => {
      showInstallBanner();
    }, 2000);
  }
});

// Show install banner
const showInstallBanner = () => {
  const banner = document.createElement('div');
  banner.id = 'install-banner';
  banner.innerHTML = `
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 16px 20px; display: flex; align-items: center; gap: 16px; position: fixed; bottom: 80px; left: 16px; right: 16px; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); z-index: 1000; animation: slideUp 0.3s ease">
            <div style="width: 48px; height: 48px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0">
                <i data-lucide="download" style="color: #2563eb; width: 24px; height: 24px"></i>
            </div>
            <div style="flex: 1">
                <div style="font-weight: 600; font-size: 15px; margin-bottom: 2px">Install Bills App</div>
                <div style="font-size: 13px; opacity: 0.9">Add to home screen for quick access</div>
            </div>
            <button id="install-btn" style="background: white; color: #2563eb; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer">Install</button>
            <button id="dismiss-banner" style="background: rgba(255,255,255,0.2); color: white; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center">
                <i data-lucide="x" style="width: 18px; height: 18px"></i>
            </button>
        </div>
    `;

  document.body.appendChild(banner);
  if (window.lucide) lucide.createIcons();

  // Install button click
  document.getElementById('install-btn').addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);
      deferredPrompt = null;
    } else {
      // Show iOS instructions
      showIOSInstructions();
    }
    banner.remove();
  });

  // Dismiss button
  document.getElementById('dismiss-banner').addEventListener('click', () => {
    localStorage.setItem('installBannerDismissed', 'true');
    banner.remove();
  });
};

// iOS install instructions
const showIOSInstructions = () => {
  const modal = document.createElement('div');
  modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px">
            <div style="background: var(--card-bg); border-radius: 24px; padding: 32px; max-width: 400px; text-align: center">
                <h3 style="font-family: var(--font-heading); margin: 0 0 16px 0">Install on iOS</h3>
                <p style="color: var(--text-secondary); margin-bottom: 24px">Tap the Share button <i data-lucide="share" style="width: 16px; display: inline; vertical-align: middle"></i> in Safari, then select "Add to Home Screen"</p>
                <button onclick="this.closest('div').parentElement.remove()" style="width: 100%; background: var(--accent-blue); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 600; cursor: pointer">Got it</button>
            </div>
        </div>
    `;
  document.body.appendChild(modal);
  if (window.lucide) lucide.createIcons();
};

// Helper to get service logo or letter icon
const getServiceLogoHTML = (name, color, icon, size = 44) => {
  const serviceLogos = {
    'netflix': 'netflix.png',
    'spotify': 'spotify.png',
    'icloud': 'icloud.png',
    'disney': 'disney.png',
    'amazon': 'amazon.png',
    'adobe': 'adobe.png',
    'youtube': 'youtube.png',
    'slack': 'slack.png'
  };

  const lowerName = name.toLowerCase();
  let logoFile = null;

  // Check for specific matches
  if (lowerName.includes('netflix')) {
    logoFile = serviceLogos['netflix'];
  } else if (lowerName.includes('spotify')) {
    logoFile = serviceLogos['spotify'];
  } else if (lowerName.includes('icloud')) {
    logoFile = serviceLogos['icloud'];
  } else if (lowerName.includes('disney')) {
    logoFile = serviceLogos['disney'];
  } else if (lowerName.includes('amazon')) {
    logoFile = serviceLogos['amazon'];
  } else if (lowerName.includes('adobe')) {
    logoFile = serviceLogos['adobe'];
  } else if (lowerName.includes('youtube')) {
    logoFile = serviceLogos['youtube'];
  } else if (lowerName.includes('slack')) {
    logoFile = serviceLogos['slack'];
  }

  if (logoFile) {
    return `<div style="width: ${size}px; height: ${size}px; background-image: url('${logoFile}'); background-size: cover; background-position: center; border-radius: ${size / 4}px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15)"></div>`;
  }

  return `
    <div class="service-icon" style="background: ${color}; width: ${size}px; height: ${size}px; border-radius: ${size / 4}px; flex-shrink: 0; display: flex; align-items: center; justify-content: center">
      <span style="font-weight:bold; color:white; font-size: ${size / 2.5}px">${icon || name.charAt(0).toUpperCase()}</span>
    </div>
  `;
};

// Format price based on currency preference and convert if needed
const convertCurrency = (amount, from, to) => {
  const fromRate = state.exchangeRates[from] || 1;
  const toRate = state.exchangeRates[to] || 1;
  return (amount / fromRate) * toRate;
};

const formatPrice = (price, fromCurrency = null) => {
  const toCurrency = state.preferences.currency;
  let finalPrice = price;

  if (fromCurrency && fromCurrency !== toCurrency) {
    finalPrice = convertCurrency(price, fromCurrency, toCurrency);
  }

  const curr = CURRENCIES[toCurrency] || CURRENCIES.USD;
  const formatted = parseFloat(finalPrice).toFixed(2);
  return curr.suffix ? `${curr.symbol}${formatted}${curr.suffix}` : `${curr.symbol}${formatted}`;
};

const notifyUser = (title, body, icon = 'bell') => {
  // In-app notification
  state.notifications.unshift({
    id: Date.now(),
    title,
    body,
    icon,
    timestamp: new Date().toISOString()
  });
  saveState();

  // System notification
  showLocalNotification(title, body);

  // Refresh UI if on home
  if (state.currentScreen === 'home') render();
};

// Format notification time (e.g., "2 minutes ago", "1 hour ago")
const formatNotificationTime = (timestamp) => {
  if (!timestamp) return '';

  const now = new Date();
  const notifTime = new Date(timestamp);
  const diffMs = now - notifTime;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  // For older notifications, show the date
  return notifTime.toLocaleDateString();
};

const fetchExchangeRates = async () => {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    if (data.rates) {
      state.exchangeRates = data.rates;
      saveState();
    }
  } catch (e) {
    console.warn('Currency API failed, using cached rates');
  }
};

const TRANSLATIONS = {
  en: {
    welcomeBack: "Welcome back",
    totalSpend: "Total Monthly Spend",
    upcomingBills: "Upcoming Bills",
    seeAll: "SEE ALL",
    categoryBreakdown: "Category Breakdown",
    viewInsights: "View Spending Insights",
    activeServices: "Active Services",
    analytics: "Analytics",
    avgService: "Avg/Service",
    yearlyCost: "Yearly Cost",
    spendingByCategory: "Spending by Category",
    topSubscriptions: "Top Subscriptions",
    accountSettings: "Account Settings",
    securityPrivacy: "Security & Privacy",
    notifications: "Notifications",
    billReminders: "Bill Reminders",
    preferences: "Preferences",
    currency: "Currency",
    language: "Language",
    appTheme: "App Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    seeAll: "See all",
    recentActivity: "Recent Activity",
    addSub: "Add Subscription",
    subscriptionAdded: "Subscription Added",
    subscriptionDeleted: "Subscription Deleted",
    subscriptionUpdated: "Subscription Updated",
    popularServices: "Popular Services",
    customService: "Add Custom Service",
    newService: "New Service",
    serviceName: "Service Name",
    price: "Price",
    billingCycle: "Billing Cycle",
    billingDay: "Billing Day of Month",
    nextDue: "Next Due Date",
    reminderInterval: "Remind me",
    dayBefore: "{n} day before",
    daysBefore: "{n} days before",
    weekBefore: "1 week before",
    startedOn: "Started On",
    saveChanges: "Save Changes",
    deleteSub: "Delete",
    backupData: "Backup & Restore",
    exportData: "Export Data",
    importData: "Import Data",
    copyCode: "Copy this code and save it somewhere safe.",
    pasteCode: "Paste your backup code here to restore your data.",
    invalidCode: "Invalid backup code.",
    dataRestored: "Data Restored!",
    optional: "optional",
    category: "Category",
    accentColor: "Accent Color",
    saveChanges: "Save Changes",
    deleteSub: "Delete Subscription",
    confirmDelete: "Are you sure you want to delete {name}?",
    lifetimeSpend: "Estimated Lifetime Spend",
    status: "Status",
    active: "Active",
    en: "English",
    es: "Español",
    enabled: "Enabled",
    disabled: "Disabled",
    months: "months",
    years: "years",
    weeks: "weeks",
    dueToday: "Due today",
    dueTomorrow: "Due tomorrow",
    dueInDays: "Due in {n} days",
    overdue: "Overdue",
    noDueDate: "No due date",
    search: "Search"
  },
  es: {
    welcomeBack: "Bienvenido de nuevo",
    totalSpend: "Gasto Mensual Total",
    upcomingBills: "Próximas Facturas",
    seeAll: "VER TODO",
    categoryBreakdown: "Desglose por Categoría",
    viewInsights: "Ver Análisis de Gastos",
    activeServices: "Servicios Activos",
    analytics: "Análisis",
    avgService: "Promedio/Servicio",
    yearlyCost: "Costo Anual",
    spendingByCategory: "Gasto por Categoría",
    topSubscriptions: "Top Suscripciones",
    accountSettings: "Ajustes de Cuenta",
    securityPrivacy: "Seguridad y Privacidad",
    notifications: "Notificaciones",
    billReminders: "Recordatorios de Facturas",
    preferences: "Preferencias",
    currency: "Moneda",
    language: "Idioma",
    appTheme: "Tema de la App",
    darkMode: "Modo Oscuro",
    lightMode: "Modo Claro",
    seeAll: "Ver todo",
    recentActivity: "Actividad Reciente",
    addSub: "Añadir suscripción",
    subscriptionAdded: "Suscripción añadida",
    subscriptionDeleted: "Suscripción eliminada",
    subscriptionUpdated: "Suscripción actualizada",
    popularServices: "Servicios populares",
    customService: "Añadir Servicio Personalizado",
    newService: "Nuevo Servicio",
    serviceName: "Nombre del Servicio",
    price: "Precio",
    billingCycle: "Ciclo de Facturación",
    billingDay: "Día de Facturación",
    nextDue: "Próximo Vencimiento",
    reminderInterval: "Recordarme",
    dayBefore: "{n} día antes",
    daysBefore: "{n} días antes",
    weekBefore: "1 semana antes",
    startedOn: "Fecha de inicio",
    optional: "opcional",
    category: "Categoría",
    accentColor: "Color de Acento",
    saveChanges: "Guardar cambios",
    deleteSub: "Eliminar",
    backupData: "Respaldar y Restaurar",
    exportData: "Exportar Datos",
    importData: "Importar Datos",
    copyCode: "Copia este código y guárdalo en un lugar seguro.",
    pasteCode: "Pega tu código de respaldo aquí para restaurar tus datos.",
    invalidCode: "Código de respaldo inválido.",
    dataRestored: "¡Datos Restaurados!",
    confirmDelete: "¿Estás seguro de que quieres eliminar {name}?",
    lifetimeSpend: "Gasto Total Estimado",
    status: "Estado",
    active: "Activo",
    en: "English",
    es: "Español",
    enabled: "Activado",
    disabled: "Desactivado",
    months: "meses",
    years: "años",
    weeks: "semanas",
    dueToday: "Vence hoy",
    dueTomorrow: "Vence mañana",
    dueInDays: "Vence en {n} días",
    overdue: "Vencido",
    noDueDate: "Sin fecha de vencimiento",
    search: "Buscar"
  }
};

const t = (key, params = {}) => {
  const lang = state.preferences.language || 'en';
  let text = TRANSLATIONS[lang][key] || key;
  Object.keys(params).forEach(p => {
    text = text.replace(`{${p}}`, params[p]);
  });
  return text;
};

// Get next due date based on billing day (for monthly subscriptions)
const getNextDueDate = (billingDay, billingCycle = 'monthly') => {
  const today = new Date();
  let nextDue = new Date();

  if (billingCycle === 'monthly') {
    // Use billing day (1-31)
    const day = parseInt(billingDay) || 1;
    nextDue.setDate(day);

    // If this month's billing day has passed, move to next month
    if (nextDue <= today) {
      nextDue.setMonth(nextDue.getMonth() + 1);
    }

    // Handle months with fewer days
    const maxDays = new Date(nextDue.getFullYear(), nextDue.getMonth() + 1, 0).getDate();
    if (day > maxDays) {
      nextDue.setDate(maxDays);
    }
  } else if (billingCycle === 'yearly') {
    // For yearly, billingDay should be a full date string
    nextDue = new Date(billingDay);
    if (nextDue <= today) {
      nextDue.setFullYear(nextDue.getFullYear() + 1);
    }
  } else if (billingCycle === 'weekly') {
    // billingDay is day of week (0-6, 0=Sunday)
    const dayOfWeek = parseInt(billingDay) || 0;
    const daysUntil = (dayOfWeek - today.getDay() + 7) % 7 || 7;
    nextDue.setDate(today.getDate() + daysUntil);
  }

  return nextDue;
};

// Format due date to show days remaining
const formatDueDate = (sub) => {
  if (!sub.billingDay && !sub.dueDate) return 'No due date';

  let dueDate;
  if (sub.billingCycle === 'monthly' && sub.billingDay) {
    dueDate = getNextDueDate(sub.billingDay, 'monthly');
  } else if (sub.dueDate) {
    dueDate = new Date(sub.dueDate);
  } else {
    return 'No due date';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return t('overdue');
  if (diffDays === 0) return t('dueToday');
  if (diffDays === 1) return t('dueTomorrow');
  if (diffDays <= 7) return t('dueInDays', { n: diffDays });

  // Format as readable date
  return dueDate.toLocaleDateString(state.preferences.language === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' });
};

// Get relative due date (e.g., "In 2 days", "Tomorrow", "Today")
const getRelativeDueDate = (sub) => {
  const daysUntil = getDaysUntilDue(sub);

  if (daysUntil === 0) return t('dueToday');
  if (daysUntil === 1) return t('dueTomorrow');
  if (daysUntil === -1) return "Yesterday"; // Could add to translations if needed
  if (daysUntil < 0) return t('overdue');
  if (daysUntil < 14) return t('dueInDays').replace('{n}', daysUntil);

  // For longer periods, fall back to date
  return formatDueDate(sub);
};

// Get days until due for sorting/display
const getDaysUntilDue = (sub) => {
  if (!sub.billingDay && !sub.dueDate) return 999;

  let dueDate;
  if (sub.billingCycle === 'monthly' && sub.billingDay) {
    dueDate = getNextDueDate(sub.billingDay, 'monthly');
  } else if (sub.dueDate) {
    dueDate = new Date(sub.dueDate);
  } else {
    return 999;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
};

// Calculate lifetime spending (estimated based on current price)
const calculateLifetimeSpend = (sub) => {
  if (!sub.startDate) return null;

  const start = new Date(sub.startDate);
  const now = new Date();

  // Calculate months between dates
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());

  const label = t(sub.billingCycle === 'yearly' ? 'years' : sub.billingCycle === 'weekly' ? 'weeks' : 'months');
  if (sub.billingCycle === 'yearly') {
    const years = Math.floor(months / 12);
    return { amount: years * sub.price, periods: years, periodLabel: label };
  } else if (sub.billingCycle === 'weekly') {
    const weeks = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000));
    return { amount: weeks * sub.price, periods: weeks, periodLabel: label };
  } else {
    return { amount: months * sub.price, periods: months, periodLabel: label };
  }
};

// Helper to get theme-based colors for charts
const getThemeColors = () => {
  const isLight = state.preferences.theme === 'light';
  return {
    chartGrid: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
    chartTicks: isLight ? '#64748b' : '#94a3b8',
    chartBarInactive: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
    chartDonutBg: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)'
  };
};

const applyTheme = () => {
  if (state.preferences.theme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
};

const saveState = () => {
  localStorage.setItem('subscriptions', JSON.stringify(state.subscriptions));
  localStorage.setItem('preferences', JSON.stringify(state.preferences));
  localStorage.setItem('user', JSON.stringify(state.user));
};

const addSubscription = (sub) => {
  // Default due date is 1 month from today if not provided
  const defaultDueDate = new Date();
  defaultDueDate.setMonth(defaultDueDate.getMonth() + 1);

  const newSub = {
    ...sub,
    id: Date.now(),
    dueDate: sub.dueDate || defaultDueDate.toISOString().split('T')[0],
    billingCycle: sub.billingCycle || 'monthly'
  };
  state.subscriptions.push(newSub);
  saveState();
  navigate('bills');
};

const deleteSubscription = (id) => {
  const sub = state.subscriptions.find(s => s.id === id);
  state.subscriptions = state.subscriptions.filter(sub => sub.id !== id);
  saveState();
  render();
};

const updateSubscription = (id, updates) => {
  state.subscriptions = state.subscriptions.map(sub =>
    sub.id === id ? { ...sub, ...updates } : sub
  );
  saveState();
  navigate('bills');
};

const openDetailView = (id) => {
  state.editingId = id;
  navigate('detail');
};

/**
 * Navigation Logic
 */
const navigate = (screen) => {
  state.currentScreen = screen;
  render();

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(item => {
    const span = item.querySelector('span');
    if (item.dataset.screen === 'home' && span) span.textContent = t('home');
    if (item.dataset.screen === 'bills' && span) span.textContent = t('bills');
    if (item.dataset.screen === 'stats' && span) span.textContent = t('stats');
    if (item.dataset.screen === 'account' && span) span.textContent = t('account');

    if (item.dataset.screen === screen) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
};

const showLockScreen = () => {
  const app = document.getElementById('app-container');
  const lock = document.createElement('div');
  lock.id = 'lock-screen';
  lock.innerHTML = `
    <div class="lock-icon">
      <i data-lucide="shield-check" style="width:40px; height:40px"></i>
    </div>
    <h2 style="font-family: var(--font-heading)">${state.user.name}</h2>
    <p style="color: var(--text-secondary)">Biometric login required</p>
    <button class="insights-btn" id="unlock-btn" style="max-width:200px">
      <i data-lucide="fingerprint"></i> Authenticate
    </button>
  `;
  app.appendChild(lock);
  lucide.createIcons({ props: { "stroke-width": 2 }, targets: [lock] });

  lock.querySelector('#unlock-btn').addEventListener('click', async () => {
    // Simulate WebAuthn/Biometric
    try {
      // This is a browser feature, we simulate successful auth
      const btn = lock.querySelector('#unlock-btn');
      btn.innerHTML = '<i data-lucide="check"></i> Success';
      lucide.createIcons({ targets: [btn] });
      setTimeout(() => {
        state.isLocked = false;
        lock.remove();
        render();
      }, 800);
    } catch (e) {
      console.error(e);
    }
  });
};

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => navigate(item.dataset.screen));
});

/**
 * Components & Rendering
 */
const render = () => {
  const main = document.getElementById('main-content');
  main.innerHTML = '';
  main.className = 'animate-up';

  if (state.isLocked) {
    showLockScreen();
    return;
  }

  switch (state.currentScreen) {
    case 'home':
      renderHome(main);
      break;
    case 'bills':
      renderBills(main);
      break;
    case 'stats':
      renderStats(main);
      break;
    case 'account':
      renderAccount(main);
      break;
    case 'add':
      renderAdd(main);
      break;
    case 'add-custom':
      renderAddCustom(main);
      break;
    case 'edit':
      renderEdit(main);
      break;
    case 'detail':
      renderDetail(main);
      break;
    case 'insights':
      renderInsights(main);
      break;
  }

  // Refresh icons
  if (window.lucide) lucide.createIcons();
};

const renderHome = (container) => {
  // Correctly convert all sums to base currency
  const totalSpendRaw = state.subscriptions.reduce((sum, sub) => {
    return sum + convertCurrency(sub.price, sub.currency || 'USD', state.preferences.currency);
  }, 0);
  const totalSpendFormatted = totalSpendRaw.toFixed(2);

  container.innerHTML = `
    <header class="dashboard-header">
      <div class="user-profile">
        <img src="${state.user.avatar}" class="avatar" alt="Avatar">
        <div class="user-info">
          <span>${t('welcomeBack')}</span>
          <h4>${state.user.name}</h4>
        </div>
      </div>
      <div style="position: relative">
        <button class="icon-button" id="notif-btn">
          <i data-lucide="bell"></i>
          ${state.notifications.length > 0 ? `<div style="position:absolute; top:8px; right:8px; width:8px; height:8px; background:#f43f5e; border-radius:50%; border:2px solid var(--bg-color)"></div>` : ''}
        </button>
        <div id="notification-center">
          <div class="notification-header">
            <span style="font-weight:600">Notifications</span>
            <button id="clear-notifs" style="background:none; border:none; color:var(--accent-blue); font-size:12px; cursor:pointer">Clear all</button>
          </div>
          <div class="notification-list">
            ${state.notifications.length === 0 ? '<div class="empty-notif">No new messages</div>' : state.notifications.map(n => `
              <div class="notification-item" data-id="${n.id}">
                <div class="notif-icon"><i data-lucide="${n.icon || 'info'}"></i></div>
                <div class="notif-content">
                  <h5>${n.title}</h5>
                  <p>${n.body}</p>
                  <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px; opacity: 0.7">${formatNotificationTime(n.timestamp)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </header>

    <section class="spend-card">
      <div class="spend-label">
        ${t('totalSpend')}
        <span class="trend-badge">
          <i data-lucide="trending-up" style="width:12px; height:12px"></i>
          5.2%
        </span>
      </div>
      <div class="spend-amount">${formatPrice(totalSpendFormatted)}</div>
      <div class="chart-container">
        <canvas id="mainChart"></canvas>
      </div>
      <button class="insights-btn" id="insights-btn">
        ${t('viewInsights')} <i data-lucide="arrow-right" style="width:16px"></i>
      </button>
    </section>

    <section class="upcoming-section">
      <div class="section-title">
        <h3>${t('upcomingBills')}</h3>
        <button class="see-all" id="see-all-bills" style="background:none; border:none; cursor:pointer">${t('seeAll')}</button>
      </div>
      <div class="upcoming-scroll">
        ${[...state.subscriptions]
      .sort((a, b) => getDaysUntilDue(a) - getDaysUntilDue(b))
      .slice(0, 3)
      .map(sub => {
        const daysUntil = getDaysUntilDue(sub);
        const isUrgent = daysUntil <= 3 && daysUntil >= 0;
        return `
          <div class="bill-card clickable-bill" data-id="${sub.id}" style="cursor:pointer; ${isUrgent ? 'border: 1px solid rgba(244, 63, 94, 0.5);' : ''}">
            ${getServiceLogoHTML(sub.name, sub.color, sub.icon, 48)}
            <div class="service-name">${sub.name}</div>
            <div class="service-price">${formatPrice(sub.price, sub.currency)}</div>
            <div class="service-date" style="${isUrgent ? 'color: #f43f5e;' : ''}">
              <i data-lucide="calendar" style="width:12px"></i>
              ${getRelativeDueDate(sub).toUpperCase()}
            </div>
          </div>
        `}).join('')}
      </div>
    </section>

    <section class="activity-section" style="margin-top: 32px">
      <div class="section-title">
        <h3>${t('recentActivity')}</h3>
      </div>
      <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 24px; padding: 12px; margin-bottom: 20px">
        ${state.notifications.length === 0 ? '<div style="padding: 24px; text-align: center; color: var(--text-secondary)">No recent activity</div>' :
      state.notifications.slice(0, 4).map((n, idx) => `
            <div style="display: flex; gap: 16px; align-items: center; padding: 12px; ${idx === Math.min(state.notifications.length, 4) - 1 ? '' : 'border-bottom: 1px solid var(--border-color);'}">
              <div style="width: 36px; height: 36px; border-radius: 10px; background: var(--glass-bg); display: flex; align-items: center; justify-content: center; color: var(--accent-blue)">
                <i data-lucide="${n.icon || 'activity'}" style="width: 16px"></i>
              </div>
              <div style="flex: 1">
                <div style="font-size: 14px; font-weight: 600">${n.title}</div>
                <div style="font-size: 12px; color: var(--text-secondary)">${n.body}</div>
                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px; opacity: 0.6">${formatNotificationTime(n.timestamp)}</div>
              </div>
            </div>
          `).join('')}
      </div>
    </section>
`;

  // Add click handlers
  container.querySelector('#insights-btn').addEventListener('click', () => navigate('insights'));

  // Notification Center Toggle
  const notifBtn = container.querySelector('#notif-btn');
  const notifCenter = container.querySelector('#notification-center');
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifCenter.classList.toggle('show');
  });

  document.addEventListener('click', () => notifCenter.classList.remove('show'));
  notifCenter.addEventListener('click', e => e.stopPropagation());

  // Swipe-to-dismiss (click for now as simulation)
  container.querySelectorAll('.notification-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.add('swiping');
      setTimeout(() => {
        state.notifications = state.notifications.filter(n => n.id !== parseInt(item.dataset.id));
        saveState();
        render();
      }, 300);
    });
  });

  container.querySelector('#clear-notifs')?.addEventListener('click', () => {
    state.notifications = [];
    saveState();
    render();
  });

  container.querySelectorAll('.clickable-bill').forEach(card => {
    card.addEventListener('click', () => openDetailView(parseInt(card.dataset.id)));
  });

  initHomeCharts();
};

const renderBills = (container) => {
  const searchQuery = state.billsSearchQuery || '';
  const searchOpen = state.billsSearchOpen || false;

  // List rendering with Swipe support
  const renderListHTML = (items) => {
    return items.map(sub => {
      const daysUntil = getDaysUntilDue(sub);
      const isUrgent = daysUntil <= 3 && daysUntil >= 0;
      const cycleLabel = sub.billingCycle === 'yearly' ? '/yr' : sub.billingCycle === 'weekly' ? '/wk' : '/mo';
      return `
      <div class="swipe-container">
        <div class="swipe-actions" data-id="${sub.id}">
          <i data-lucide="trash-2"></i>
        </div>
        <div class="subscription-item clickable-bill" data-id="${sub.id}">
          ${getServiceLogoHTML(sub.name, sub.color, sub.icon, 44)}
          <div class="item-info">
            <div class="item-title">${sub.name}</div>
            <div class="item-subtitle">${CATEGORY_MAP[state.preferences.language][sub.category] || sub.category} • ${sub.billingCycle || 'monthly'}</div>
          </div>
          <div class="item-meta">
            <div class="item-price">${formatPrice(sub.price)}${cycleLabel}</div>
            <div class="item-next" style="${isUrgent ? 'color: #f43f5e;' : ''}">${getRelativeDueDate(sub)}</div>
          </div>
        </div>
      </div>
    `}).join('');
  };

  const initialFiltered = state.subscriptions
    .filter(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => getDaysUntilDue(a) - getDaysUntilDue(b));

  container.innerHTML = `
    <div class="section-title" style="margin-top: 10px; margin-bottom: 24px">
      <h2 style="font-family: var(--font-heading); font-size: 28px">${t('bills')}</h2>
      <div style="display: flex; gap: 8px; align-items: center">
        <div id="search-container" style="display: ${searchOpen || searchQuery ? 'flex' : 'none'}; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 4px 12px; align-items: center; gap: 8px">
          <i data-lucide="search" style="width: 14px; color: var(--text-secondary)"></i>
          <input type="text" id="bill-search-input" value="${searchQuery}" placeholder="${t('search')}..." style="background: none; border: none; color: var(--text-primary); outline: none; font-size: 14px; width: 120px">
        </div>
        <button class="icon-button" id="toggle-search-btn"><i data-lucide="search"></i></button>
      </div>
    </div>

    <h4 style="color: var(--text-secondary); font-size: 12px; letter-spacing: 1px; margin-bottom: 16px; text-transform: uppercase">${t('activeServices')}</h4>
    
    <div class="subscriptions-list">
      ${renderListHTML(initialFiltered)}
    </div>
  `;

  // Initial event mapping
  const attachItemEvents = (root) => {
    let touchStartX = 0;
    let longPressTimer = null;
    let contextMenuOpen = null;

    root.querySelectorAll('.subscription-item').forEach(item => {
      const container = item.closest('.swipe-container');

      // Click to open detail view
      item.addEventListener('click', (e) => {
        // Don't open if context menu is showing
        if (contextMenuOpen) {
          closeContextMenu();
          return;
        }
        openDetailView(parseInt(item.dataset.id));
      });

      // Long press to show context menu
      item.addEventListener('touchstart', (e) => {
        longPressTimer = setTimeout(() => {
          showContextMenu(item, e.touches[0].clientX, e.touches[0].clientY);
        }, 500); // 500ms long press
      }, { passive: true });

      item.addEventListener('touchmove', () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }, { passive: true });

      item.addEventListener('touchend', () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }, { passive: true });

      item.addEventListener('touchcancel', () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }, { passive: true });

      // Desktop: right-click for context menu
      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(item, e.clientX, e.clientY);
      });
    });

    // Function to show context menu
    const showContextMenu = (item, x, y) => {
      closeContextMenu(); // Close any existing menu

      const subId = parseInt(item.dataset.id);
      const sub = state.subscriptions.find(s => s.id === subId);
      if (!sub) return;

      // Add haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      const menu = document.createElement('div');
      menu.className = 'context-menu';
      menu.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                z-index: 10000;
                min-width: 180px;
                overflow: hidden;
                animation: scaleIn 0.2s ease-out;
            `;

      menu.innerHTML = `
                <div class="context-menu-item" data-action="edit" style="padding: 14px 16px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: background 0.2s">
                    <i data-lucide="edit-3" style="width: 18px; height: 18px; color: var(--accent-blue)"></i>
                    <span style="color: var(--text-primary); font-size: 14px">Edit</span>
                </div>
                <div style="height: 1px; background: var(--border-color); margin: 0 8px"></div>
                <div class="context-menu-item" data-action="delete" style="padding: 14px 16px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: background 0.2s">
                    <i data-lucide="trash-2" style="width: 18px; height: 18px; color: #ef4444"></i>
                    <span style="color: #ef4444; font-size: 14px">Delete</span>
                </div>
            `;

      document.body.appendChild(menu);
      contextMenuOpen = menu;

      // Position adjustment if menu goes off screen
      const rect = menu.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menu.style.left = `${window.innerWidth - rect.width - 10}px`;
      }
      if (rect.bottom > window.innerHeight) {
        menu.style.top = `${window.innerHeight - rect.height - 10}px`;
      }

      // Add event listeners to menu items
      menu.querySelectorAll('.context-menu-item').forEach(menuItem => {
        menuItem.addEventListener('mouseenter', () => {
          menuItem.style.background = 'var(--glass-bg)';
        });
        menuItem.addEventListener('mouseleave', () => {
          menuItem.style.background = 'transparent';
        });
        menuItem.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = menuItem.dataset.action;

          if (action === 'edit') {
            navigate('edit');
            state.editingId = subId;
          } else if (action === 'delete') {
            if (confirm(`Delete ${sub.name}?`)) {
              deleteSubscription(subId);
            }
          }

          closeContextMenu();
        });
      });

      // Refresh icons
      if (window.lucide) window.lucide.createIcons();

      // Close menu when clicking outside
      setTimeout(() => {
        document.addEventListener('click', closeContextMenu);
        document.addEventListener('touchstart', closeContextMenu);
      }, 100);
    };

    const closeContextMenu = () => {
      if (contextMenuOpen) {
        contextMenuOpen.remove();
        contextMenuOpen = null;
        document.removeEventListener('click', closeContextMenu);
        document.removeEventListener('touchstart', closeContextMenu);
      }
    };

    if (window.lucide) window.lucide.createIcons();
  };

  attachItemEvents(container);

  // Toggle search bar
  const toggleBtn = container.querySelector('#toggle-search-btn');
  const searchInput = container.querySelector('#bill-search-input');
  const searchBox = container.querySelector('#search-container');

  toggleBtn.addEventListener('click', () => {
    state.billsSearchOpen = !state.billsSearchOpen;
    if (state.billsSearchOpen) {
      searchBox.style.display = 'flex';
      searchBox.classList.add('opening');
      setTimeout(() => {
        searchInput.focus();
        searchBox.classList.remove('opening');
      }, 400);
    } else {
      state.billsSearchQuery = '';
      render();
    }
  });

  // Handle search input
  searchInput.addEventListener('input', (e) => {
    state.billsSearchQuery = e.target.value;
    const currentList = container.querySelector('.subscriptions-list');
    const filtered = state.subscriptions
      .filter(sub => sub.name.toLowerCase().includes(state.billsSearchQuery.toLowerCase()))
      .sort((a, b) => getDaysUntilDue(a) - getDaysUntilDue(b));

    currentList.innerHTML = renderListHTML(filtered);
    attachItemEvents(currentList);
  });
};

const renderStats = (container) => {
  const totalSpend = state.subscriptions.reduce((sum, sub) => sum + sub.price, 0).toFixed(2);

  // Calculate category breakdown
  const categoryTotals = state.subscriptions.reduce((acc, sub) => {
    acc[sub.category] = (acc[sub.category] || 0) + sub.price;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryTotals).map(([name, amount]) => ({
    name,
    amount: amount.toFixed(2),
    percentage: ((amount / parseFloat(totalSpend)) * 100).toFixed(0)
  }));

  container.innerHTML = `
  <div class="section-title" style="margin-top: 10px; margin-bottom: 24px" >
      <h2 style="font-family: var(--font-heading); font-size: 28px">${t('analytics')}</h2>
      <button class="icon-button"><i data-lucide="download"></i></button>
    </div>

    <section class="spend-card" style="padding: 24px">
      <div style="text-align: center; margin-bottom: 24px">
        <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px">${t('totalSpend')}</div>
        <div style="font-size: 48px; font-weight: 700; font-family: var(--font-heading)">${formatPrice(totalSpend)}</div>
        <div style="color: var(--text-secondary); font-size: 13px; margin-top: 4px">${state.subscriptions.length} active subscriptions</div>
      </div>
      
      <div style="height: 200px; margin-bottom: 20px">
        <canvas id="statsBarChart"></canvas>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
        <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: 16px; text-align: center">
          <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px">${t('avgService')}</div>
          <div style="font-size: 24px; font-weight: 700">${formatPrice((parseFloat(totalSpend) / state.subscriptions.length).toFixed(2))}</div>
        </div>
        <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: 16px; text-align: center">
          <div style="color: var(--text-secondary); font-size: 12px; margin-bottom: 4px">${t('yearlyCost')}</div>
          <div style="font-size: 24px; font-weight: 700">${formatPrice((parseFloat(totalSpend) * 12).toFixed(0))}</div>
        </div>
      </div>
    </section>

    <h4 style="color: var(--text-secondary); font-size: 12px; letter-spacing: 1px; margin-bottom: 16px; margin-top: 32px; text-transform: uppercase">${t('spendingByCategory')}</h4>
    
    <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 20px; padding: 20px; margin-bottom: 20px">
      <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 24px">
        <div style="width: 120px; height: 120px; flex-shrink: 0">
          <canvas id="statsDoughnutChart"></canvas>
        </div>
        <div style="flex: 1">
          ${categoryData.map((cat, idx) => {
    const colors = ['#f43f5e', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];
    return `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
                <div style="display: flex; align-items: center; gap: 8px">
                  <div style="width: 12px; height: 12px; border-radius: 3px; background: ${colors[idx % colors.length]}"></div>
                  <span style="font-size: 14px">${cat.name}</span>
                </div>
                <div style="text-align: right">
                  <div style="font-weight: 600">${formatPrice(cat.amount)}</div>
                  <div style="font-size: 11px; color: var(--text-secondary)">${cat.percentage}%</div>
                </div>
              </div>
            `;
  }).join('')}
        </div>
      </div>
    </div>

    <h4 style="color: var(--text-secondary); font-size: 12px; letter-spacing: 1px; margin-bottom: 16px; text-transform: uppercase">${t('topSubscriptions')}</h4>
    
    ${state.subscriptions
      .sort((a, b) => b.price - a.price)
      .slice(0, 5)
      .map((sub, idx) => `
        <div class="subscription-item" style="margin-bottom: 12px">
          <div style="display: flex; align-items: center; gap: 12px; flex: 1">
            <div style="color: var(--text-secondary); font-size: 14px; font-weight: 600; width: 20px">#${idx + 1}</div>
            ${getServiceLogoHTML(sub.name, sub.color, sub.icon, 40)}
            <div class="item-info">
              <div class="item-title">${sub.name}</div>
              <div class="item-subtitle">${CATEGORY_MAP[state.preferences.language][sub.category] || sub.category}</div>
            </div>
          </div>
          <div class="item-price">${formatPrice(sub.price)}</div>
        </div>
      `).join('')
    }
`;

  // Initialize charts
  setTimeout(() => {
    const barCtx = document.getElementById('statsBarChart').getContext('2d');
    const doughnutCtx = document.getElementById('statsDoughnutChart').getContext('2d');

    new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Monthly Spend',
          data: [totalSpend * 0.9, totalSpend * 0.95, totalSpend, totalSpend * 1.05, totalSpend * 0.98, totalSpend],
          backgroundColor: '#2563eb',
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => '$' + context.parsed.y.toFixed(2)
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: getThemeColors().chartTicks }
          },
          y: {
            grid: { color: getThemeColors().chartGrid },
            ticks: { color: getThemeColors().chartTicks }
          }
        }
      }
    });

    const colors = ['#f43f5e', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];
    new Chart(doughnutCtx, {
      type: 'doughnut',
      data: {
        labels: categoryData.map(c => c.name),
        datasets: [{
          data: categoryData.length > 0 ? categoryData.map(c => c.amount) : [1],
          backgroundColor: categoryData.length > 0 ? colors.slice(0, categoryData.length) : [getThemeColors().chartDonutBg],
          borderWidth: 0,
          cutout: '80%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => context.label + ': $' + context.parsed
            }
          }
        }
      }
    });
  }, 100);
};

const renderAccount = (container) => {
  container.innerHTML = `
  <div class="section-title" style="margin-top: 10px; margin-bottom: 24px" >
      <button class="icon-button" onclick="navigate('home')"><i data-lucide="chevron-left"></i></button>
      <h3 style="font-family: var(--font-heading)">${t('accountSettings')}</h3>
      <button class="icon-button"><i data-lucide="edit-3"></i></button>
    </div>

    <div style="text-align: center; margin-bottom: 32px">
      <div style="position: relative; width: 100px; height: 100px; margin: 0 auto 16px; cursor: pointer" id="avatar-container">
        <img id="profile-img" src="${state.user.avatar}" style="width: 100px; height: 100px; border-radius: 50%; border: 4px solid var(--accent-blue); object-fit: cover">
        <div style="position: absolute; bottom: 0; right: 0; background: var(--accent-blue); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid var(--bg-primary)">
          <i data-lucide="camera" style="width: 14px; color: var(--text-primary)"></i>
        </div>
      </div>
      <input type="file" id="avatar-input" accept="image/*" style="display: none">
      <h3>${state.user.name}</h3>
      <p style="color: var(--text-secondary); font-size: 14px">${state.user.email}</p>
      <div style="display:inline-block; margin-top:12px; background: rgba(37,99,235,0.1); color: var(--accent-blue); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600">PREMIUM MEMBER</div>
    </div>

    <div class="settings-section">
    <h4 style="color: var(--text-secondary); font-size: 12px; letter-spacing: 1px; margin-bottom: 16px; text-transform: uppercase">${t('notifications')}</h4>
    
    <div class="subscription-item" style="justify-content: space-between">
      <div style="display:flex; align-items:center; gap:16px">
        <div class="icon-button" style="background: rgba(245,158,11,0.1); color: #f59e0b"><i data-lucide="bell"></i></div>
        <div>
          <div class="item-title">${t('billReminders')}</div>
          <div class="item-subtitle" id="notif-status">${state.preferences.notificationsEnabled ? t('enabled') : t('disabled')}</div>
        </div>
      </div>
      <div id="notif-toggle" style="width: 44px; height: 24px; background: ${state.preferences.notificationsEnabled ? 'var(--accent-blue)' : 'var(--border-color)'}; border-radius: 12px; position:relative; cursor:pointer; transition: all 0.3s">
        <div style="width: 20px; height: 20px; background: white; border-radius: 50%; position:absolute; ${state.preferences.notificationsEnabled ? 'right: 2px' : 'left: 2px'}; top: 2px; transition: all 0.3s"></div>
      </div>
    </div>

    <div style="margin-left: 60px; margin-top: 12px; display: ${state.preferences.notificationsEnabled ? 'block' : 'none'}">
      <label style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; display: block">${t('reminderInterval')}</label>
      <select id="reminder-interval" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; color: var(--text-primary); outline: none; cursor: pointer; width: 100%">
        <option value="1" ${state.preferences.reminderDaysBefore === 1 ? 'selected' : ''}>${t('dayBefore', { n: 1 })}</option>
        <option value="3" ${state.preferences.reminderDaysBefore === 3 ? 'selected' : ''}>${t('daysBefore', { n: 3 })}</option>
        <option value="7" ${state.preferences.reminderDaysBefore === 7 ? 'selected' : ''}>${t('weekBefore')}</option>
      </select>
    </div>

    <button id="test-notif-btn" class="insights-btn" style="margin-top: 20px; background: var(--glass-bg); border: 1px solid var(--glass-border); display: ${state.preferences.notificationsEnabled ? 'flex' : 'none'}">
      <i data-lucide="send" style="width:16px"></i> Send Test Notification
    </button>

    <h4 style="color: var(--text-secondary); font-size: 12px; letter-spacing: 1px; margin-top: 24px; margin-bottom: 16px; text-transform: uppercase">${t('preferences')}</h4>
    
    <div class="subscription-item" style="justify-content: space-between">
      <div style="display:flex; align-items:center; gap:16px">
        <div class="icon-button" style="background: rgba(16,185,129,0.1); color: #10b981"><i data-lucide="coins"></i></div>
        <div>
          <div class="item-title">${t('currency')}</div>
          <div class="item-subtitle">${CURRENCIES[state.preferences.currency].name}</div>
        </div>
      </div>
      <select id="currency-select" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; color: var(--text-primary); outline: none; cursor: pointer">
        <option value="USD" style="background: var(--card-bg)" ${state.preferences.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
        <option value="MXN" style="background: var(--card-bg)" ${state.preferences.currency === 'MXN' ? 'selected' : ''}>MXN (Peso)</option>
      </select>
    </div>

    <div class="subscription-item" style="justify-content: space-between">
      <div style="display:flex; align-items:center; gap:16px">
        <div class="icon-button" style="background: rgba(124,58,237,0.1); color: #7c3aed"><i data-lucide="languages"></i></div>
        <div>
          <div class="item-title">${t('language')}</div>
          <div class="item-subtitle">${t(state.preferences.language)}</div>
        </div>
      </div>
      <select id="language-select" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px 12px; color: var(--text-primary); outline: none; cursor: pointer">
        <option value="en" style="background: var(--card-bg)" ${state.preferences.language === 'en' ? 'selected' : ''}>English</option>
        <option value="es" style="background: var(--card-bg)" ${state.preferences.language === 'es' ? 'selected' : ''}>Español</option>
      </select>
    </div>

    <div class="subscription-item" id="theme-toggle" style="cursor: pointer">
      <div class="icon-button" style="background: rgba(236,72,153,0.1); color: #ec4899"><i data-lucide="${state.preferences.theme === 'dark' ? 'moon' : 'sun'}"></i></div>
      <div class="item-info">
        <div class="item-title">${t('appTheme')}</div>
        <div class="item-subtitle">${state.preferences.theme === 'dark' ? t('darkMode') : t('lightMode')}</div>
      </div>
      <i data-lucide="chevron-right" style="color: var(--text-secondary)"></i>
    </div>

    <h4 style="color: var(--text-secondary); font-size: 12px; letter-spacing: 1px; margin-top: 24px; margin-bottom: 16px; text-transform: uppercase">${t('backupData')}</h4>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 40px">
      <button id="export-btn" class="insights-btn" style="background: var(--glass-bg); border: 1px solid var(--glass-border); color: var(--text-primary)">
        <i data-lucide="download" style="width:14px"></i> ${t('exportData')}
      </button>
      <button id="import-btn" class="insights-btn" style="background: var(--glass-bg); border: 1px solid var(--border-color); color: var(--accent-blue)">
        <i data-lucide="upload-cloud" style="width:14px"></i> ${t('importData')}
      </button>
    </div>
    </div>
`;

  // Currency preference change handler
  container.querySelector('#currency-select').addEventListener('change', (e) => {
    state.preferences.currency = e.target.value;
    saveState();
    render(); // Re-render to update all prices
  });

  // Language preference change handler
  container.querySelector('#language-select').addEventListener('change', (e) => {
    state.preferences.language = e.target.value;
    saveState();
    render();
  });

  // Reminder interval handler
  if (state.preferences.notificationsEnabled) {
    container.querySelector('#reminder-interval').addEventListener('change', (e) => {
      state.preferences.reminderDaysBefore = parseInt(e.target.value);
      saveState();
    });
  }

  // Notification toggle handler
  container.querySelector('#notif-toggle').addEventListener('click', async () => {
    if (!state.preferences.notificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        state.preferences.notificationsEnabled = true;
        saveState();
        render();
        showLocalNotification('Notifications Enabled!', 'You will now receive bill reminders.');
      } else {
        alert('Notification permission denied. Please enable it in your browser settings.');
      }
    } else {
      state.preferences.notificationsEnabled = false;
      saveState();
      render();
    }
  });

  // Test notification handler
  if (state.preferences.notificationsEnabled) {
    container.querySelector('#test-notif-btn').addEventListener('click', () => {
      showLocalNotification('Test Notification', 'This is how your bill reminders will look!');
    });
  }

  // Avatar change handler
  const avatarContainer = container.querySelector('#avatar-container');
  const avatarInput = container.querySelector('#avatar-input');

  avatarContainer.addEventListener('click', () => {
    avatarInput.click();
  });

  // Theme toggle handler
  container.querySelector('#theme-toggle').addEventListener('click', () => {
    state.preferences.theme = state.preferences.theme === 'dark' ? 'light' : 'dark';
    saveState();
    applyTheme();
    render(); // Re-render to update the button text/icon
  });

  // Backup handlers
  container.querySelector('#export-btn').addEventListener('click', () => {
    const data = btoa(JSON.stringify({
      subscriptions: state.subscriptions,
      preferences: state.preferences,
      user: state.user
    }));
    const code = prompt(t('copyCode'), data);
  });

  container.querySelector('#import-btn').addEventListener('click', () => {
    const code = prompt(t('pasteCode'));
    if (code) {
      try {
        const data = JSON.parse(atob(code));
        if (data.subscriptions && Array.isArray(data.subscriptions)) {
          state.subscriptions = data.subscriptions;
          if (data.preferences) state.preferences = data.preferences;
          if (data.user) state.user = data.user;
          saveState();
          alert(t('dataRestored'));
          render();
        } else {
          throw new Error();
        }
      } catch (e) {
        alert(t('invalidCode'));
      }
    }
  });

  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        state.user.avatar = dataUrl;
        saveState();
        container.querySelector('#profile-img').src = dataUrl;
        // Optionally re-render completely
        // render(); 
      };
      reader.readAsDataURL(file);
    }
  });
};

const renderAdd = (container) => {
  container.innerHTML = `
  <div class="section-title" style="margin-top: 10px; margin-bottom: 24px" >
      <button class="icon-button" onclick="navigate('home')"><i data-lucide="chevron-left"></i></button>
      <h3 style="font-family: var(--font-heading)">${t('addSub')}</h3>
      <button class="icon-button" onclick="navigate('home')"><i data-lucide="x"></i></button>
    </div>

    <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 16px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; margin-bottom: 32px">
      <i data-lucide="search" style="color: var(--text-secondary)"></i>
      <input type="text" placeholder="${t('search')}..." style="background:none; border:none; color:var(--text-primary); width:100%; outline:none; font-size:16px">
    </div>

    <h4 style="color: var(--text-secondary); font-size: 12px; letter-spacing: 1px; margin-bottom: 16px; text-transform: uppercase">${t('popularServices')}</h4>
    
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px">
      ${[
      { name: 'Netflix', price: 15.99, color: '#E50914', cat: 'Entertainment', logo: 'netflix.png' },
      { name: 'Spotify', price: 9.99, color: '#1DB954', cat: 'Entertainment', logo: 'spotify.png' },
      { name: 'iCloud', price: 9.99, color: '#007AFF', cat: 'Software', logo: 'icloud.png' },
      { name: 'Disney+', price: 13.99, color: '#006E99', cat: 'Entertainment', logo: 'disney.png' },
      { name: 'Amazon', price: 14.99, color: '#FF9900', cat: 'Shopping', logo: 'amazon.png' },
      { name: 'Adobe', price: 52.99, color: '#FF021B', cat: 'Software', logo: 'adobe.png' },
      { name: 'YouTube', price: 13.99, color: '#FF0000', cat: 'Entertainment', logo: 'youtube.png' },
      { name: 'Slack', price: 12.50, color: '#4A154B', cat: 'Software', logo: 'slack.png' }
    ].map(p => `
        <div class="preset-card" data-name="${p.name}" data-price="${p.price}" data-color="${p.color}" data-icon="${p.name.charAt(0)}" data-category="${p.cat}" style="background:var(--card-bg); border: 1px solid var(--border-color); border-radius:16px; height:90px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; cursor:pointer; overflow:hidden; transition: all 0.3s">
          <div style="width: 40px; height: 40px; background-image: url('${p.logo}'); background-size: cover; background-position: center; border-radius: 10px"></div>
          <div style="font-size:10px; font-weight:600; color: var(--text-primary)">${p.name}</div>
        </div>
      `).join('')}
    </div>

    <button id="custom-service-btn" class="insights-btn" style="background: var(--glass-bg); border: 1px solid var(--border-color); color: var(--text-primary); margin-top: 32px">
      <i data-lucide="plus" style="width:16px"></i> ${t('customService')}
    </button>
`;

  // Add listener to custom button
  container.querySelector('#custom-service-btn').addEventListener('click', () => navigate('add-custom'));

  // Add listeners to presets
  container.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => {
      const { name, price, color, icon, category } = card.dataset;
      state.selectedPreset = { name, price: parseFloat(price), color, icon, category };
      navigate('add-custom');
    });
  });
};

const renderAddCustom = (container) => {
  container.innerHTML = `
  <div class="section-title" style="margin-top: 10px; margin-bottom: 24px" >
      <button class="icon-button" onclick="state.selectedPreset = null; navigate('add')"><i data-lucide="chevron-left"></i></button>
      <h3 style="font-family: var(--font-heading)">${t('newService')}</h3>
      <button class="icon-button" onclick="state.selectedPreset = null; navigate('home')"><i data-lucide="x"></i></button>
    </div>

  <form id="custom-sub-form" style="display: flex; flex-direction: column; gap: 20px; max-width: 100%; overflow-x: hidden">
    <div class="input-group" style="width: 100%">
      <label style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; display: block">${t('serviceName')}</label>
      <input type="text" id="custom-name" value="${state.selectedPreset?.name || ''}" placeholder="e.g. Disney+" required style="width: 100%; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; color: var(--text-primary); outline: none; border-bottom: 2px solid ${state.selectedPreset?.color || 'transparent'}; transition: all 0.3s">
    </div>


    <div class="input-group">
      <label style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; display: block">${t('price')}</label>
      <input type="number" step="0.01" id="custom-price" value="${state.selectedPreset?.price || ''}" placeholder="0.00" required style="width: 100%; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; color: var(--text-primary); outline: none">
    </div>

    <div class="input-group">
      <label style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; display: block">${t('billingCycle')}</label>
      <select id="custom-billing-cycle" style="width: 100%; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; color: var(--text-primary); outline: none; appearance: none">
        <option value="weekly">Weekly</option>
        <option value="monthly" selected>Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
    </div>

    <div id="billing-day-group" class="input-group">
      <label style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; display: block">${t('billingDay')}</label>
      <select id="custom-billing-day" style="width: 100%; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; color: var(--text-primary); outline: none; appearance: none">
        ${Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}">${i + 1}${['st', 'nd', 'rd'][i] || 'th'}</option>`).join('')}
      </select>
    </div>

    <div id="due-date-group" class="input-group" style="display: none">
      <label style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; display: block">${t('nextDue')}</label>
      <input type="date" id="custom-due-date" style="width: 100%; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; color: var(--text-primary); outline: none; color-scheme: dark">
    </div>

    <div class="input-group">
      <label style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; display: block">${t('startedOn')} <span style="color: var(--text-secondary); font-weight: 400">(${t('optional')})</span></label>
      <input type="date" id="custom-start-date" style="width: 100%; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; color: var(--text-primary); outline: none; color-scheme: dark">
    </div>

    <div class="input-group">
      <label style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; display: block">${t('category')}</label>
      <select id="custom-category" style="width: 100%; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; color: var(--text-primary); outline: none; appearance: none">
        ${CATEGORIES.map(cat => `<option value="${cat}" ${state.selectedPreset?.category === cat ? 'selected' : ''}>${CATEGORY_MAP[state.preferences.language][cat] || cat}</option>`).join('')}
      </select>
    </div>

    <input type="hidden" id="custom-color" value="${state.selectedPreset?.color || '#2563eb'}">

      <button type="submit" class="insights-btn" style="margin-top: 12px">
        ${t('addSub')}
      </button>
  </form>
`;

  // Brand color auto-matching
  const nameInput = container.querySelector('#custom-name');
  nameInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    let matched = false;
    for (const brand in BRAND_COLORS) {
      if (val.includes(brand)) {
        container.querySelector('#custom-color').value = BRAND_COLORS[brand];
        nameInput.style.borderBottom = `2px solid ${BRAND_COLORS[brand]} `;
        matched = true;
        break;
      }
    }
    if (!matched) {
      container.querySelector('#custom-color').value = '#2563eb';
      nameInput.style.borderBottom = `2px solid transparent`;
    }
  });

  // Toggle billing day vs due date based on cycle
  const billingCycleSelect = document.getElementById('custom-billing-cycle');
  const billingDayGroup = document.getElementById('billing-day-group');
  const dueDateGroup = document.getElementById('due-date-group');

  billingCycleSelect.addEventListener('change', (e) => {
    if (e.target.value === 'monthly') {
      billingDayGroup.style.display = 'block';
      dueDateGroup.style.display = 'none';
    } else {
      billingDayGroup.style.display = 'none';
      dueDateGroup.style.display = 'block';
    }
  });

  container.querySelector('#custom-sub-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('custom-name').value;
    const price = parseFloat(document.getElementById('custom-price').value);
    const currency = state.preferences.currency; // Use currency from settings
    const billingCycle = document.getElementById('custom-billing-cycle').value;
    const category = document.getElementById('custom-category').value;
    const color = document.getElementById('custom-color').value;
    const icon = name.charAt(0).toUpperCase();
    const startDate = document.getElementById('custom-start-date').value || null;

    let billingDay, dueDate;
    if (billingCycle === 'monthly') {
      billingDay = parseInt(document.getElementById('custom-billing-day').value);
    } else {
      dueDate = document.getElementById('custom-due-date').value;
    }

    addSubscription({ name, price, currency, billingCycle, billingDay, dueDate, category, color, icon, startDate });
    state.selectedPreset = null;
  });
};

const renderEdit = (container) => {
  const sub = state.subscriptions.find(s => s.id === state.editingId);
  if (!sub) {
    navigate('bills');
    return;
  }

  container.innerHTML = `
  <div class="section-title" style="margin-top: 10px; margin-bottom: 24px">
      <button class="icon-button" onclick="navigate('bills')"><i data-lucide="chevron-left"></i></button>
      <h3 style="font-family: var(--font-heading)">Edit Subscription</h3>
      <button class="icon-button" onclick="navigate('bills')"><i data-lucide="x"></i></button>
    </div>

    <div style="text-align: center; margin-bottom: 32px">
      <div style="margin: 0 auto 16px; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center">
        ${getServiceLogoHTML(sub.name, sub.color, sub.icon, 80)}
      </div>
      <h2 style="font-family: var(--font-heading); margin: 0 0 4px 0">${sub.name}</h2>
      <div style="color: var(--text-secondary); font-size: 14px">${CATEGORY_MAP[state.preferences.language][sub.category] || sub.category}</div>
      ${(() => {
      const lifetime = calculateLifetimeSpend(sub);
      if (lifetime && lifetime.periods > 0) {
        return `<div style="margin-top: 12px; padding: 12px; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 12px">
            <div style="font-size: 12px; color: var(--text-secondary)">Estimated Lifetime Spend</div>
            <div style="font-size: 24px; font-weight: 700; color: #f43f5e">${formatPrice(lifetime.amount)}</div>
            <div style="font-size: 11px; color: var(--text-secondary)">${lifetime.periods} ${lifetime.periodLabel} subscribed</div>
          </div>`;
      }
      return '';
    })()}
    </div>

    <form id="edit-sub-form" style="display: flex; flex-direction: column; gap: 20px">
      <div class="input-group">
        <label style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; display: block">${t('serviceName')}</label>
        <input type="text" id="edit-name" value="${sub.name}" required style="width: 100%; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; color: var(--text-primary); outline: none">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
        <div class="input-group">
          <label style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; display: block">${t('price')}</label>
          <input type="number" step="0.01" id="edit-price" value="${sub.price}" required style="width: 100%; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; color: var(--text-primary); outline: none">
        </div>
        <div class="input-group">
          <label style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; display: block">${t('billingCycle')}</label>
          <select id="edit-billing-cycle" style="width: 100%; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; color: var(--text-primary); outline: none; appearance: none">
            <option value="weekly" ${sub.billingCycle === 'weekly' ? 'selected' : ''}>Weekly</option>
            <option value="monthly" ${sub.billingCycle === 'monthly' || !sub.billingCycle ? 'selected' : ''}>Monthly</option>
            <option value="yearly" ${sub.billingCycle === 'yearly' ? 'selected' : ''}>Yearly</option>
          </select>
        </div>
      </div>

      <div id="edit-billing-day-group" class="input-group" style="${sub.billingCycle !== 'monthly' && sub.billingCycle ? 'display: none' : ''}">
        <label style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; display: block">${t('billingDay')}</label>
        <select id="edit-billing-day" style="width: 100%; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; color: var(--text-primary); outline: none; appearance: none">
          ${Array.from({ length: 31 }, (_, i) => `<option value="${i + 1}" ${(sub.billingDay || 1) === i + 1 ? 'selected' : ''}>${i + 1}${['st', 'nd', 'rd'][i] || 'th'}</option>`).join('')}
        </select>
      </div>

      <div id="edit-due-date-group" class="input-group" style="${sub.billingCycle === 'monthly' || !sub.billingCycle ? 'display: none' : ''}">
        <label style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; display: block">${t('nextDue')}</label>
        <input type="date" id="edit-due-date" value="${sub.dueDate || ''}" style="width: 100%; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; color: var(--text-primary); outline: none; color-scheme: dark">
      </div>

      <div class="input-group">
        <label style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; display: block">${t('startedOn')} <span style="color: var(--text-secondary); font-weight: 400">(${t('optional')})</span></label>
        <input type="date" id="edit-start-date" value="${sub.startDate || ''}" style="width: 100%; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; color: var(--text-primary); outline: none; color-scheme: dark">
      </div>

      <div class="input-group">
        <label style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; display: block">${t('category')}</label>
        <select id="edit-category" style="width: 100%; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; color: var(--text-primary); outline: none; appearance: none">
          ${CATEGORIES.map(cat => `<option value="${cat}" ${sub.category === cat ? 'selected' : ''}>${CATEGORY_MAP[state.preferences.language][cat] || cat}</option>`).join('')}
        </select>
      </div>

      <div class="input-group">
        <label style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px; display: block">${t('accentColor')}</label>
        <div id="edit-color-swatches" style="display: flex; gap: 12px; flex-wrap: wrap">
          ${['#E50914', '#1DB954', '#007AFF', '#FF9900', '#FF021B', '#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'].map(c => `
            <div class="color-swatch" data-color="${c}" style="width: 44px; height: 44px; background: ${c}; border-radius: 12px; cursor: pointer; border: 2px solid ${sub.color === c ? 'white' : 'transparent'}; transform: scale(${sub.color === c ? '1.1' : '1'}); transition: all 0.2s"></div>
          `).join('')}
        </div>
      </div>

      <input type="hidden" id="edit-color" value="${sub.color}">

      <button type="submit" class="insights-btn" style="margin-top: 12px">
        ${t('saveChanges')}
      </button>

      <button type="button" id="delete-btn" class="insights-btn" style="background: rgba(244, 63, 94, 0.1); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.3)">
        <i data-lucide="trash-2" style="width:16px"></i> ${t('deleteSub')}
      </button>
    </form>
`;



  // Color swatch selection for edit
  container.querySelectorAll('#edit-color-swatches .color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      container.querySelectorAll('#edit-color-swatches .color-swatch').forEach(s => {
        s.style.border = '2px solid transparent';
        s.style.transform = 'scale(1)';
      });
      swatch.style.border = '2px solid white';
      swatch.style.transform = 'scale(1.1)';
      document.getElementById('edit-color').value = swatch.dataset.color;
    });
  });

  // Toggle billing day vs due date based on cycle
  const editBillingCycleSelect = document.getElementById('edit-billing-cycle');
  const editBillingDayGroup = document.getElementById('edit-billing-day-group');
  const editDueDateGroup = document.getElementById('edit-due-date-group');

  editBillingCycleSelect.addEventListener('change', (e) => {
    if (e.target.value === 'monthly') {
      editBillingDayGroup.style.display = 'block';
      editDueDateGroup.style.display = 'none';
    } else {
      editBillingDayGroup.style.display = 'none';
      editDueDateGroup.style.display = 'block';
    }
  });

  container.querySelector('#edit-sub-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('edit-name').value;
    const price = parseFloat(document.getElementById('edit-price').value);
    const billingCycle = document.getElementById('edit-billing-cycle').value;
    const category = document.getElementById('edit-category').value;
    const color = document.getElementById('edit-color').value;
    const icon = name.charAt(0).toUpperCase();
    const startDate = document.getElementById('edit-start-date').value || null;

    // Get billing day or due date based on cycle
    let billingDay, dueDate;
    if (billingCycle === 'monthly') {
      billingDay = parseInt(document.getElementById('edit-billing-day').value);
    } else {
      dueDate = document.getElementById('edit-due-date').value;
    }

    updateSubscription(sub.id, { name, price, billingCycle, billingDay, dueDate, category, color, icon, startDate });
  });

  container.querySelector('#delete-btn').addEventListener('click', () => {
    if (confirm(t('confirmDelete', { name: sub.name }))) {
      deleteSubscription(sub.id);
    }
  });
};

const renderInsights = (container) => {
  const totalSpend = state.subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const yearlySpend = totalSpend * 12;

  // Category analysis
  const categoryTotals = state.subscriptions.reduce((acc, sub) => {
    acc[sub.category] = (acc[sub.category] || 0) + sub.price;
    return acc;
  }, {});

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const mostExpensive = state.subscriptions.reduce((max, sub) => sub.price > max.price ? sub : max, state.subscriptions[0]);

  // Simulated savings suggestions
  const savings = [
    { title: 'Switch to annual billing', description: 'Save ~15% on Netflix and Spotify', amount: (totalSpend * 0.15).toFixed(2) },
    { title: 'Bundle services', description: 'Combine streaming services for discounts', amount: '12.99' },
    { title: 'Remove duplicates', description: 'You have 2 music streaming services', amount: '9.99' }
  ];

  container.innerHTML = `
  <div class="section-title" style="margin-top: 10px; margin-bottom: 24px" >
      <button class="icon-button" onclick="navigate('home')"><i data-lucide="chevron-left"></i></button>
      <h3 style="font-family: var(--font-heading)">${t('viewInsights')}</h3>
      <button class="icon-button"><i data-lucide="share-2"></i></button>
    </div>

    <section class="spend-card" style="padding: 24px; text-align: center">
      <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px">${t('yearlyCost')}</div>
      <div style="font-size: 48px; font-weight: 700; font-family: var(--font-heading); color: #f43f5e">${formatPrice(yearlySpend.toFixed(2))}</div>
      <div style="color: var(--text-secondary); font-size: 13px; margin-top: 4px">That's ${formatPrice((yearlySpend / 365).toFixed(2))} per day</div>
    </section>

    <h4 style="color: var(--text-secondary); font-size: 12px; letter-spacing: 1px; margin-bottom: 16px; margin-top: 32px; text-transform: uppercase">${t('analytics')}</h4>
    
    <div class="subscription-item" style="margin-bottom: 12px">
      <div class="icon-button" style="background: rgba(244, 63, 94, 0.1); color: #f43f5e"><i data-lucide="trending-up"></i></div>
      <div class="item-info">
        <div class="item-title">Biggest Expense</div>
        <div class="item-subtitle">${mostExpensive.name} at ${formatPrice(mostExpensive.price)}/mo</div>
      </div>
    </div>

    <div class="subscription-item" style="margin-bottom: 12px">
      <div class="icon-button" style="background: rgba(37, 99, 235, 0.1); color: var(--accent-blue)"><i data-lucide="pie-chart"></i></div>
      <div class="item-info">
        <div class="item-title">Top Category</div>
        <div class="item-subtitle">${topCategory[0]} - ${formatPrice(topCategory[1].toFixed(2))}/mo</div>
      </div>
    </div>

    <div class="subscription-item" style="margin-bottom: 12px">
      <div class="icon-button" style="background: rgba(16, 185, 129, 0.1); color: #10b981"><i data-lucide="layers"></i></div>
      <div class="item-info">
        <div class="item-title">Total Services</div>
        <div class="item-subtitle">${state.subscriptions.length} active subscriptions</div>
      </div>
    </div>

    <h4 style="color: var(--text-secondary); font-size: 12px; letter-spacing: 1px; margin-bottom: 16px; margin-top: 32px; text-transform: uppercase">Money-Saving Tips</h4>
    
    ${savings.map(tip => `
      <div class="subscription-item" style="margin-bottom: 12px; border: 1px solid var(--border-color)">
        <div class="icon-button" style="background: rgba(16, 185, 129, 0.1); color: #10b981"><i data-lucide="lightbulb"></i></div>
        <div class="item-info" style="flex: 1">
          <div class="item-title">${tip.title}</div>
          <div class="item-subtitle">${tip.description}</div>
        </div>
        <div style="text-align: right">
          <div style="color: #10b981; font-weight: 700">-${formatPrice(tip.amount)}</div>
          <div style="font-size: 11px; color: var(--text-secondary)">/mo</div>
        </div>
      </div>
    `).join('')
    }

<div style="margin-top: 32px; padding: 20px; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 20px; text-align: center">
  <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px">Potential Monthly Savings</div>
  <div style="font-size: 32px; font-weight: 700; color: #10b981; font-family: var(--font-heading)">${formatPrice(savings.reduce((sum, s) => sum + parseFloat(s.amount), 0).toFixed(2))}</div>
</div>
`;
};

/**
 * Charts Initialization
 */
const initHomeCharts = () => {
  const mainChartElem = document.getElementById('mainChart');
  if (!mainChartElem) return;

  const ctx = mainChartElem.getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [12, 19, 13, 15, 22, 10, 15],
        backgroundColor: (context) => {
          if (context.dataIndex === 4) return '#2563eb';
          return getThemeColors().chartBarInactive;
        },
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });
};

/**
 * App Boot
 */
// Handle plus button
document.getElementById('add-btn').addEventListener('click', () => navigate('add'));

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
  fetchExchangeRates();
  applyTheme();
  render();
  initServiceWorker();
  checkUpcomingBills();
});

/**
 * Notification & Service Worker Logic
 */
const initServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('SW registered: ', registration);

        // Check for updates every 5 minutes
        setInterval(() => {
          registration.update();
        }, 300000); // 5 minutes
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'NEW_VERSION') {
        // Add notification about new version
        notifyUser(
          'App Updated! 🎉',
          'A new version of Bills App is available. Refresh to get the latest features.',
          'sparkles'
        );

        // Store update notification
        const updateNotification = {
          id: Date.now(),
          type: 'update',
          title: 'App Updated',
          message: 'New version available. Tap to refresh.',
          timestamp: new Date().toISOString(),
          read: false
        };

        state.notifications.unshift(updateNotification);
        saveState();
      }
    });
  }
};

const showLocalNotification = (title, body) => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body: body,
          icon: '/icon-512.png',
          badge: '/icon-512.png',
          vibrate: [100, 50, 100],
        });
      });
    } else {
      // Fallback to browser notification if SW not ready
      new Notification(title, { body, icon: '/icon-512.png' });
    }
  }
};

const checkUpcomingBills = () => {
  if (!state.preferences.notificationsEnabled) return;

  // Only check once per day/session
  const lastCheck = localStorage.getItem('lastNotifCheck');
  const today = new Date().toDateString();

  if (lastCheck === today) return;

  state.subscriptions.forEach(sub => {
    const daysUntil = getDaysUntilDue(sub);
    if (daysUntil === 1) {
      showLocalNotification('Bill Due Tomorrow', `Your ${sub.name} subscription(${formatPrice(sub.price)}) is due tomorrow!`);
    } else if (daysUntil === 0) {
      showLocalNotification('Bill Due Today', `Your ${sub.name} subscription(${formatPrice(sub.price)}) is due today!`);
    }
  });

  localStorage.setItem('lastNotifCheck', today);
};
const renderDetail = (container) => {
  const sub = state.subscriptions.find(s => s.id === state.editingId);
  if (!sub) {
    navigate('bills');
    return;
  }

  const daysUntil = getDaysUntilDue(sub);
  const dueText = daysUntil === 0 ? 'Due today' : daysUntil === 1 ? 'Due tomorrow' : daysUntil < 0 ? `Overdue by ${Math.abs(daysUntil)} days` : `Coming up in ${daysUntil} days`;

  container.innerHTML = `
    <div style="min-height: 100vh; background: var(--bg-primary); padding: 20px">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px">
        <button class="icon-button" id="menu-btn" style="position: relative">
          <i data-lucide="more-horizontal"></i>
        </button>
        <div id="menu-dropdown" style="display: none; position: absolute; top: 60px; left: 20px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 8px; z-index: 100; min-width: 150px">
          <button id="edit-option" style="width: 100%; text-align: left; padding: 12px; background: none; border: none; color: var(--text-primary); cursor: pointer; border-radius: 8px; display: flex; align-items: center; gap: 8px">
            <i data-lucide="edit-3" style="width: 16px"></i> Edit
          </button>
          <button id="delete-option" style="width: 100%; text-align: left; padding: 12px; background: none; border: none; color: #f43f5e; cursor: pointer; border-radius: 8px; display: flex; align-items: center; gap: 8px">
            <i data-lucide="trash-2" style="width: 16px"></i> Delete
          </button>
        </div>
        <button class="icon-button" onclick="navigate('bills')">
          <i data-lucide="x"></i>
        </button>
      </div>

      <div style="text-align: center; margin-bottom: 40px">
        <div style="margin: 0 auto 20px; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center">
          ${getServiceLogoHTML(sub.name, sub.color, sub.icon, 100)}
        </div>
        <div style="color: var(--text-secondary); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px">${CATEGORY_MAP[state.preferences.language][sub.category] || sub.category}</div>
        <h1 style="font-family: var(--font-heading); font-size: 32px; margin: 0 0 8px 0">${sub.name}</h1>
        <div style="color: var(--text-secondary); font-size: 14px; text-transform: uppercase; letter-spacing: 1px">${sub.billingCycle || 'monthly'} subscription</div>
      </div>

      <div style="background: var(--glass-bg); border: 1px solid var(--border-color); border-radius: 20px; padding: 20px; margin-bottom: 20px; text-align: center">
        <div style="color: var(--text-secondary); font-size: 13px; margin-bottom: 8px">${dueText} for ${formatPrice(sub.price, sub.currency)}</div>
      </div>
    </div>
  `;

  // Menu toggle
  const menuBtn = container.querySelector('#menu-btn');
  const menuDropdown = container.querySelector('#menu-dropdown');

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuDropdown.style.display = menuDropdown.style.display === 'none' ? 'block' : 'none';
  });

  // Close menu when clicking outside
  document.addEventListener('click', () => {
    menuDropdown.style.display = 'none';
  });

  // Edit option
  container.querySelector('#edit-option').addEventListener('click', () => {
    navigate('edit');
  });

  // Delete option
  container.querySelector('#delete-option').addEventListener('click', () => {
    if (confirm(`Are you sure you want to delete ${sub.name}?`)) {
      deleteSubscription(sub.id);
    }
  });
};

