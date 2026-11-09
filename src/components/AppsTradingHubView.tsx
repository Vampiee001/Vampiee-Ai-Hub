import React, { useState } from 'react';
import {
  TrendingUp,
  ExternalLink,
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  Edit2,
  LineChart,
  Grid,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Globe,
  Radio,
  BookOpen,
  DollarSign,
  Maximize2,
  ShieldCheck,
  RefreshCw,
  FolderPlus,
} from 'lucide-react';
import { ConnectedAppItem, AppCategory, LiveMarketTicker, TradeJournalEntry } from '../types';

interface AppsTradingHubViewProps {
  apps: ConnectedAppItem[];
  onAddApp: (app: Omit<ConnectedAppItem, 'id'>) => void;
  onUpdateApp: (app: ConnectedAppItem) => void;
  onDeleteApp: (id: string) => void;
  tradeJournal: TradeJournalEntry[];
  onAddTrade: (trade: Omit<TradeJournalEntry, 'id' | 'createdAt'>) => void;
  onDeleteTrade: (id: string) => void;
}

const LIVE_TICKERS: LiveMarketTicker[] = [
  {
    symbol: 'BTC/USDT',
    name: 'Bitcoin',
    price: '$87,420.00',
    change24h: 3.42,
    high24h: '$88,150.00',
    low24h: '$84,800.00',
    volume: '$42.8B',
    tradeUrl: 'https://www.binance.com/en/trade/BTC_USDT',
    tradingViewSymbol: 'BINANCE:BTCUSDT',
  },
  {
    symbol: 'ETH/USDT',
    name: 'Ethereum',
    price: '$3,382.50',
    change24h: 2.15,
    high24h: '$3,440.00',
    low24h: '$3,290.00',
    volume: '$19.4B',
    tradeUrl: 'https://www.binance.com/en/trade/ETH_USDT',
    tradingViewSymbol: 'BINANCE:ETHUSDT',
  },
  {
    symbol: 'SOL/USDT',
    name: 'Solana',
    price: '$189.60',
    change24h: 5.84,
    high24h: '$194.20',
    low24h: '$178.50',
    volume: '$8.2B',
    tradeUrl: 'https://www.binance.com/en/trade/SOL_USDT',
    tradingViewSymbol: 'BINANCE:SOLUSDT',
  },
  {
    symbol: 'XAU/USD',
    name: 'Gold Spot',
    price: '$2,724.80',
    change24h: 0.68,
    high24h: '$2,735.00',
    low24h: '$2,710.00',
    volume: '$145B',
    tradeUrl: 'https://trade.mql5.com/trade',
    tradingViewSymbol: 'OANDA:XAUUSD',
  },
  {
    symbol: 'AED/USD',
    name: 'UAE Dirham',
    price: '0.2723',
    change24h: 0.01,
    high24h: '0.2724',
    low24h: '0.2722',
    volume: 'Pegged 3.6725',
    tradeUrl: 'https://www.tradingview.com/chart/?symbol=FX_IDC%3AUSDDAED',
    tradingViewSymbol: 'FX_IDC:USDAED',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp',
    price: '$144.20',
    change24h: 1.95,
    high24h: '$146.00',
    low24h: '$141.80',
    volume: '$28.1B',
    tradeUrl: 'https://www.tradingview.com/chart/?symbol=NASDAQ%3ANVDA',
    tradingViewSymbol: 'NASDAQ:NVDA',
  },
];

export const AppsTradingHubView: React.FC<AppsTradingHubViewProps> = ({
  apps,
  onAddApp,
  onUpdateApp,
  onDeleteApp,
  tradeJournal,
  onAddTrade,
  onDeleteTrade,
}) => {
  const [activeTab, setActiveTab] = useState<'chart_suite' | 'apps_directory' | 'trade_journal'>('chart_suite');
  const [selectedChartSymbol, setSelectedChartSymbol] = useState<string>('BINANCE:BTCUSDT');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  // New App Form State
  const [newAppName, setNewAppName] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<AppCategory>('trading');
  const [newAppDescription, setNewAppDescription] = useState('');
  const [newAppBadge, setNewAppBadge] = useState('');
  const [newAppAccount, setNewAppAccount] = useState('');
  const [newAppIsTrading, setNewAppIsTrading] = useState(true);
  const [newAppPinned, setNewAppPinned] = useState(true);

  // New Trade Form State
  const [tradeSymbol, setTradeSymbol] = useState('BTC/USDT');
  const [tradeSide, setTradeSide] = useState<'long' | 'short'>('long');
  const [tradeEntry, setTradeEntry] = useState('87400');
  const [tradeTarget, setTradeTarget] = useState('95000');
  const [tradeStopLoss, setTradeStopLoss] = useState('84500');
  const [tradeSize, setTradeSize] = useState('0.25 BTC');
  const [tradeLeverage, setTradeLeverage] = useState('5x');
  const [tradePlatform, setTradePlatform] = useState('Binance Futures');
  const [tradeNotes, setTradeNotes] = useState('');

  const filteredApps = apps.filter((app) => {
    const matchesCategory =
      categoryFilter === 'all'
        ? true
        : categoryFilter === 'trading'
        ? app.isTradingApp
        : app.category === categoryFilter;
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.notes && app.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppUrl.trim()) return;

    let formattedUrl = newAppUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    onAddApp({
      name: newAppName.trim(),
      url: formattedUrl,
      category: newAppCategory,
      description: newAppDescription.trim() || 'Custom user integrated application',
      iconType: 'custom',
      isTradingApp: newAppIsTrading,
      isPinned: newAppPinned,
      badge: newAppBadge.trim() || undefined,
      accountIdentifier: newAppAccount.trim() || undefined,
    });

    setNewAppName('');
    setNewAppUrl('');
    setNewAppDescription('');
    setNewAppBadge('');
    setNewAppAccount('');
    setIsAddModalOpen(false);
  };

  const handleCreateTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeSymbol.trim()) return;

    onAddTrade({
      symbol: tradeSymbol.trim(),
      side: tradeSide,
      entryPrice: parseFloat(tradeEntry) || 0,
      targetPrice: parseFloat(tradeTarget) || 0,
      stopLossPrice: parseFloat(tradeStopLoss) || 0,
      positionSize: tradeSize.trim() || '1.0',
      leverage: tradeLeverage.trim() || undefined,
      platform: tradePlatform.trim() || 'Binance',
      status: 'planned',
      notes: tradeNotes.trim() || 'Executed via Vampiee Trading Hub',
    });

    setTradeNotes('');
    setIsTradeModalOpen(false);
  };

  const handleOpenApp = (app: ConnectedAppItem) => {
    onUpdateApp({
      ...app,
      lastOpened: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    window.open(app.url, '_blank', 'noopener,noreferrer');
  };

  const renderAppIcon = (iconType: string, accentColor?: string) => {
    switch (iconType) {
      case 'tradingview':
        return <LineChart className="w-6 h-6 text-blue-400" />;
      case 'binance':
        return <span className="font-extrabold text-amber-400 text-lg">🔶</span>;
      case 'bybit':
        return <span className="font-extrabold text-amber-300 text-lg">⚡</span>;
      case 'dexscreener':
        return <span className="font-extrabold text-emerald-400 text-lg">🦅</span>;
      case 'metatrader':
        return <TrendingUp className="w-6 h-6 text-cyan-400" />;
      case 'uniswap':
        return <span className="font-extrabold text-pink-400 text-lg">🦄</span>;
      case 'coinbase':
        return <span className="font-extrabold text-blue-500 text-lg">🔵</span>;
      case 'calendar':
        return <span className="font-extrabold text-blue-400 text-lg">📅</span>;
      case 'contacts':
        return <span className="font-extrabold text-emerald-400 text-lg">👥</span>;
      case 'spotify':
        return <span className="font-extrabold text-emerald-400 text-lg">🟢</span>;
      case 'tiktok':
        return <span className="font-extrabold text-rose-500 text-lg">🎬</span>;
      case 'gmail':
        return <span className="font-extrabold text-red-400 text-lg">✉️</span>;
      case 'github':
        return <span className="font-extrabold text-slate-200 text-lg">🐙</span>;
      default:
        return <Globe className="w-6 h-6 text-purple-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-200 overflow-y-auto">
      {/* Live Market Tickers Ribbon */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-2.5 flex items-center overflow-x-auto gap-5 select-none no-scrollbar">
        <div className="flex items-center gap-2 text-xs font-bold text-rose-400 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono uppercase tracking-wider text-[11px]">Real-Time Feeds:</span>
        </div>

        {LIVE_TICKERS.map((ticker) => {
          const isSelected = selectedChartSymbol === ticker.tradingViewSymbol;
          return (
            <div
              key={ticker.symbol}
              onClick={() => {
                setSelectedChartSymbol(ticker.tradingViewSymbol);
                setActiveTab('chart_suite');
              }}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer transition-all shrink-0 ${
                isSelected
                  ? 'bg-rose-500/15 border-rose-500/50 text-white'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
              title={`Switch chart to ${ticker.symbol} or click to trade`}
            >
              <span className="font-bold font-mono">{ticker.symbol}</span>
              <span className="font-mono font-bold text-white">{ticker.price}</span>
              <span
                className={`flex items-center font-mono text-[11px] font-semibold ${
                  ticker.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {ticker.change24h >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {ticker.change24h > 0 ? `+${ticker.change24h}%` : `${ticker.change24h}%`}
              </span>

              <a
                href={ticker.tradeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="ml-1 text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
                title="Trade on exchange"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          );
        })}
      </div>

      {/* Main Hub Header & Tab Controls */}
      <div className="px-6 py-5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black text-white tracking-wide flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-rose-500" />
              TRADING SUITE &amp; REAL APPS HUB
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-wider font-semibold">
              Live Connected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Access your real trading platforms (Binance, TradingView, Bybit, DEX, MT5) and real everyday apps in one synchronized command terminal.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('chart_suite')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'chart_suite'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChart className="w-4 h-4" />
              Live Charts &amp; Trading
            </button>
            <button
              onClick={() => setActiveTab('apps_directory')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'apps_directory'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
              All Real Apps ({apps.length})
            </button>
            <button
              onClick={() => setActiveTab('trade_journal')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'trade_journal'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Trade Journal ({tradeJournal.length})
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950/50 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Custom App
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE CHARTS & TRADING SUITE */}
      {activeTab === 'chart_suite' && (
        <div className="p-6 space-y-6">
          {/* Quick Platform Launchers Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {apps
              .filter((a) => a.isTradingApp)
              .slice(0, 6)
              .map((app) => (
                <div
                  key={app.id}
                  onClick={() => handleOpenApp(app)}
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-rose-500/50 cursor-pointer transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800">
                      {renderAppIcon(app.iconType, app.accentColor)}
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {app.badge || 'Trade'}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors flex items-center gap-1">
                    {app.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{app.description}</p>
                </div>
              ))}
          </div>

          {/* Interactive TradingView Chart Frame */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
            {/* Chart Toolbar */}
            <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                  Live TradingView Engine:
                </span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {LIVE_TICKERS.map((t) => (
                    <button
                      key={t.symbol}
                      onClick={() => setSelectedChartSymbol(t.tradingViewSymbol)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                        selectedChartSymbol === t.tradingViewSymbol
                          ? 'bg-rose-600 text-white shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {t.symbol}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(selectedChartSymbol)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  Open Full TradingView
                </a>
                <button
                  onClick={() => setIsTradeModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Log Trade Idea
                </button>
              </div>
            </div>

            {/* Embedded Responsive TradingView Iframe Widget */}
            <div className="w-full h-[540px] bg-slate-950 relative">
              <iframe
                title="TradingView Live Chart"
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(
                  selectedChartSymbol
                )}&interval=60&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0b0f19&studies=%5B%22RSI%40tv-basicstudies%22%2C%22MASimple%40tv-basicstudies%22%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en`}
                className="w-full h-full border-0"
                allow="clipboard-write; accelerometer; gyroscope"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>
          </div>

          {/* Quick Trade Execution & Risk Calculator Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast Execution Portals</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Connect your real Binance, Bybit, or MT5 accounts. Trades opened from Vampiee launch the authenticated live platform securely.
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <a
                    href="https://www.binance.com/en/trade/BTC_USDT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Launch Binance Spot <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-slate-600">•</span>
                  <a
                    href="https://www.bybit.com/trade/usdt/BTCUSDT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Launch Bybit Perpetuals <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">DEX &amp; On-Chain Scanners</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Spot new trending liquidity pools on Solana, Base, and Ethereum using DexScreener and Uniswap.
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <a
                    href="https://dexscreener.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Launch DexScreener <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-slate-600">•</span>
                  <a
                    href="https://app.uniswap.org/swap"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-pink-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Launch Uniswap Swap <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Forex &amp; Gold Commodities</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Access MetaTrader 5 Web directly to execute high-volume Gold (XAUUSD), oil, and currency trades.
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <a
                    href="https://trade.mql5.com/trade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Launch MT5 Web Terminal <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL REAL APPS DIRECTORY */}
      {activeTab === 'apps_directory' && (
        <div className="p-6 space-y-6">
          {/* Filter Bar & Search */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Apps' },
                { id: 'trading', label: 'Trading & Exchanges' },
                { id: 'crypto_dex', label: 'Crypto & DEX' },
                { id: 'productivity', label: 'Google & Productivity' },
                { id: 'social_music', label: 'Music & Social' },
                { id: 'custom', label: 'Custom Added' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    categoryFilter === cat.id
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search real apps..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Apps Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                      {renderAppIcon(app.iconType, app.accentColor)}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {app.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                          {app.badge}
                        </span>
                      )}
                      <button
                        onClick={() => onUpdateApp({ ...app, isPinned: !app.isPinned })}
                        className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          app.isPinned
                            ? 'bg-rose-600/20 text-rose-400 border-rose-500/30'
                            : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-white'
                        }`}
                        title={app.isPinned ? 'Pinned to Desktop Dock' : 'Pin to Desktop Dock'}
                      >
                        {app.isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
                      </button>
                      {app.iconType === 'custom' && (
                        <button
                          onClick={() => onDeleteApp(app.id)}
                          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 hover:text-red-400 cursor-pointer"
                          title="Remove custom app"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors flex items-center gap-1.5">
                    {app.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{app.description}</p>

                  {app.accountIdentifier && (
                    <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <span className="text-slate-500">Account:</span>
                      <span className="text-indigo-400 truncate">{app.accountIdentifier}</span>
                    </div>
                  )}

                  {app.notes && (
                    <div className="mt-1.5 text-[10px] text-slate-500 italic line-clamp-1">
                      "{app.notes}"
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {app.lastOpened ? `Opened ${app.lastOpened}` : 'Ready to launch'}
                  </span>

                  <button
                    onClick={() => handleOpenApp(app)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Quick Add Custom App Card */}
            <div
              onClick={() => setIsAddModalOpen(true)}
              className="p-6 rounded-2xl border-2 border-dashed border-slate-800 hover:border-rose-500/50 bg-slate-950/40 hover:bg-slate-900/40 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[190px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-rose-400">Add Another Real App</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                Connect your trading bot, exchange account, brokerage, or web tool.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRADE JOURNAL & EXECUTION LOG */}
      {activeTab === 'trade_journal' && (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Live Trade Journal &amp; Signals</h2>
              <p className="text-xs text-slate-400">
                Log entries, position sizing, stop-loss, and targets before executing on Binance or Bybit.
              </p>
            </div>
            <button
              onClick={() => setIsTradeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              Record Trade Setup
            </button>
          </div>

          <div className="space-y-3">
            {tradeJournal.map((trade) => (
              <div
                key={trade.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                      trade.side === 'long'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {trade.side}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-sm">{trade.symbol}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {trade.platform}
                      </span>
                      {trade.leverage && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {trade.leverage}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{trade.notes}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Entry</span>
                    <span className="text-white font-bold">${trade.entryPrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Target (TP)</span>
                    <span className="text-emerald-400 font-bold">${trade.targetPrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Stop Loss (SL)</span>
                    <span className="text-rose-400 font-bold">${trade.stopLossPrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Size</span>
                    <span className="text-indigo-300 font-bold">{trade.positionSize}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href="https://www.binance.com/en/trade/BTC_USDT"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
                    >
                      Trade Now <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => onDeleteTrade(trade.id)}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 hover:text-red-400 cursor-pointer"
                      title="Delete journal entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM APP */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-rose-500" />
                Connect Your App or Broker
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateApp} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">App or Broker Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Crypto Bot, KuCoin, eToro, Notion"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Web URL</label>
                <input
                  type="text"
                  required
                  placeholder="https://app.mybroker.com or web address"
                  value={newAppUrl}
                  onChange={(e) => setNewAppUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newAppCategory}
                    onChange={(e) => setNewAppCategory(e.target.value as AppCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="trading">Trading Platform</option>
                    <option value="crypto_dex">Crypto &amp; DEX</option>
                    <option value="productivity">Productivity &amp; Work</option>
                    <option value="social_music">Music &amp; Social</option>
                    <option value="ai_tools">AI Tools</option>
                    <option value="custom">Other Web App</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Badge Tag (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bot, Real, Scalping"
                    value={newAppBadge}
                    onChange={(e) => setNewAppBadge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account or Username (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. markstephenyucada@gmail.com"
                  value={newAppAccount}
                  onChange={(e) => setNewAppAccount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="What do you use this app for?"
                  value={newAppDescription}
                  onChange={(e) => setNewAppDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAppPinned}
                    onChange={(e) => setNewAppPinned(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-rose-600 focus:ring-0"
                  />
                  <span>Pin to Desktop Dock</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAppIsTrading}
                    onChange={(e) => setNewAppIsTrading(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-rose-600 focus:ring-0"
                  />
                  <span>Is Trading Platform</span>
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-lg shadow-rose-950/50"
                >
                  Save App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG TRADE IDEA */}
      {isTradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                Record Trade Plan
              </h3>
              <button
                onClick={() => setIsTradeModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTrade} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Symbol</label>
                  <input
                    type="text"
                    required
                    value={tradeSymbol}
                    onChange={(e) => setTradeSymbol(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Direction</label>
                  <select
                    value={tradeSide}
                    onChange={(e) => setTradeSide(e.target.value as 'long' | 'short')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="long">LONG (Buy)</option>
                    <option value="short">SHORT (Sell)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Entry ($)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={tradeEntry}
                    onChange={(e) => setTradeEntry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target TP ($)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={tradeTarget}
                    onChange={(e) => setTradeTarget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stop SL ($)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={tradeStopLoss}
                    onChange={(e) => setTradeStopLoss(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white text-rose-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Position Size</label>
                  <input
                    type="text"
                    value={tradeSize}
                    onChange={(e) => setTradeSize(e.target.value)}
                    placeholder="e.g. 0.5 BTC, 2 Lots"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Platform</label>
                  <input
                    type="text"
                    value={tradePlatform}
                    onChange={(e) => setTradePlatform(e.target.value)}
                    placeholder="Binance, Bybit, MT5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rationale / Technical Setup</label>
                <textarea
                  rows={2}
                  value={tradeNotes}
                  onChange={(e) => setTradeNotes(e.target.value)}
                  placeholder="Support bounce, 4h breakout, EMA cross..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsTradeModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-lg shadow-emerald-950/50"
                >
                  Save to Journal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
