import { useMemo, useState } from 'react'
import './App.css'

type PageKey = 'painel' | 'moedas' | 'conversor' | 'graficos' | 'favoritos' | 'relatorios' | 'configuracoes'

type MarketCard = {
  currency: string
  symbol: string
  price: string
  variation: string
  trend: number[]
  status: 'up' | 'down'
}

type MarketRow = {
  currency: string
  symbol: string
  buy: string
  sell: string
  variation: string
  update: string
}

const API_CONFIG = {
  // Caminho da API já engatilhado para integração real depois.
  // Exemplo com AwesomeAPI:
  // baseUrl: 'https://economia.awesomeapi.com.br/json/last',
  // pairs: 'USD-BRL,EUR-BRL,GBP-BRL,BTC-BRL,ETH-BRL',
  // fetchUrl final: `${baseUrl}/${pairs}`
  baseUrl: '',
  pairs: '',
}

const navItems: { id: PageKey; label: string; icon: string }[] = [
  { id: 'painel', label: 'Painel', icon: '📊' },
  { id: 'moedas', label: 'Moedas', icon: '🌐' },
  { id: 'conversor', label: 'Conversor', icon: '🔁' },
  { id: 'graficos', label: 'Gráficos', icon: '📈' },
  { id: 'favoritos', label: 'Favoritos', icon: '⭐' },
  { id: 'relatorios', label: 'Relatórios', icon: '📑' },
  { id: 'configuracoes', label: 'Configurações', icon: '⚙️' },
]

const overviewCards: MarketCard[] = [
  {
    currency: 'USD/BRL',
    symbol: 'USDBRL',
    price: 'R$ 5.12',
    variation: '+1.24%',
    trend: [2, 4, 3.8, 4.5, 4.2, 4.8, 5.2],
    status: 'up',
  },
  {
    currency: 'EUR/BRL',
    symbol: 'EURBRL',
    price: 'R$ 5.56',
    variation: '+0.92%',
    trend: [2.6, 3.1, 3.4, 3.2, 3.6, 4.1, 4.7],
    status: 'up',
  },
  {
    currency: 'GBP/BRL',
    symbol: 'GBPBRL',
    price: 'R$ 6.21',
    variation: '-0.18%',
    trend: [3.8, 4.1, 4.0, 3.9, 3.8, 3.6, 3.7],
    status: 'down',
  },
  {
    currency: 'BTC/BRL',
    symbol: 'BTCBRL',
    price: 'R$ 267.4k',
    variation: '+2.80%',
    trend: [210, 215, 220, 230, 245, 255, 267],
    status: 'up',
  },
  {
    currency: 'ETH/BRL',
    symbol: 'ETHBRL',
    price: 'R$ 13.9k',
    variation: '+3.46%',
    trend: [10.6, 11.0, 11.4, 11.9, 12.6, 13.0, 13.9],
    status: 'up',
  },
]

const marketRows: MarketRow[] = [
  { currency: 'USD', symbol: 'USDBRL', buy: 'R$ 5.10', sell: 'R$ 5.12', variation: '+1.2%', update: '2 min atrás' },
  { currency: 'EUR', symbol: 'EURBRL', buy: 'R$ 5.54', sell: 'R$ 5.56', variation: '+0.9%', update: '3 min atrás' },
  { currency: 'GBP', symbol: 'GBPBRL', buy: 'R$ 6.19', sell: 'R$ 6.21', variation: '-0.2%', update: '5 min atrás' },
  { currency: 'ARS', symbol: 'ARSBRL', buy: 'R$ 0.033', sell: 'R$ 0.034', variation: '+2.1%', update: '1 min atrás' },
  { currency: 'JPY', symbol: 'JPYBRL', buy: 'R$ 0.037', sell: 'R$ 0.038', variation: '+0.7%', update: '4 min atrás' },
  { currency: 'BTC', symbol: 'BTCBRL', buy: 'R$ 266.1k', sell: 'R$ 267.4k', variation: '+2.8%', update: 'agora' },
  { currency: 'ETH', symbol: 'ETHBRL', buy: 'R$ 13.7k', sell: 'R$ 13.9k', variation: '+3.5%', update: 'agora' },
]

const timeRanges = ['1D', '7D', '1M', '6M', '1A']
const currencyPairs = ['USD/BRL', 'EUR/BRL', 'GBP/BRL', 'BTC/BRL', 'ETH/BRL']
const reportRows = [
  { title: 'Resumo Diário de Câmbio', date: 'Hoje', type: 'PDF', status: 'Pronto' },
  { title: 'Relatório de Fluxo Cripto', date: 'Ontem', type: 'CSV', status: 'Pronto' },
  { title: 'Monitor de Volatilidade do BRL', date: 'Últimos 7 dias', type: 'PDF', status: 'Processando' },
]

const iconMap: Record<string, string> = {
  USDBRL: 'US$',
  EURBRL: '€',
  GBPBRL: '£',
  ARSBRL: 'AR$',
  JPYBRL: '¥',
  BTCBRL: '₿',
  ETHBRL: 'Ξ',
}

const sampleRates = {
  BRL: 1,
  USD: 5.12,
  EUR: 5.56,
  GBP: 6.21,
  ARS: 0.034,
  JPY: 0.038,
  BTC: 267400,
  ETH: 13900,
}

function toPath(points: number[]) {
  const width = 100
  const height = 30
  const max = Math.max(...points)
  const min = Math.min(...points)
  const delta = max - min || 1
  return points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * width
      const y = height - ((value - min) / delta) * height
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

function MiniSparkline({ points }: { points: number[] }) {
  return (
    <svg viewBox="0 0 100 30" className="sparkline">
      <path d={toPath(points)} />
    </svg>
  )
}

function App() {
  const [activeNav, setActiveNav] = useState<PageKey>('painel')
  const [selectedPair, setSelectedPair] = useState('USD/BRL')
  const [activeRange, setActiveRange] = useState('1D')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('BRL')
  const [amount, setAmount] = useState(1000)
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState('Neon Escuro')
  const [notifications, setNotifications] = useState(true)
  const [apiKey, setApiKey] = useState('')

  const selectedCard = overviewCards.find((card) => card.currency === selectedPair) ?? overviewCards[0]

  const filteredRows = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    if (!normalized) return marketRows

    return marketRows.filter((row) => {
      return row.currency.toLowerCase().includes(normalized) || row.symbol.toLowerCase().includes(normalized)
    })
  }, [query])

  const chartPoints = useMemo(() => {
    const base = selectedCard.trend
    if (activeRange === '1D') return base
    if (activeRange === '7D') return base.map((value, idx) => value * (1 + (idx - 3) * 0.03))
    if (activeRange === '1M') return base.map((value, idx) => value * (1 + Math.sin(idx / 2) * 0.04))
    if (activeRange === '6M') return base.map((value, idx) => value * (1 + Math.cos(idx / 2) * 0.08))
    if (activeRange === '1A') return base.map((value, idx) => value * (1 + Math.sin(idx / 1.4) * 0.12))
    return base
  }, [activeRange, selectedCard])

  const converterResult = useMemo(() => {
    const fromRate = sampleRates[fromCurrency as keyof typeof sampleRates] ?? 1
    const toRate = sampleRates[toCurrency as keyof typeof sampleRates] ?? 1
    return ((amount * fromRate) / toRate).toLocaleString('pt-BR', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })
  }, [amount, fromCurrency, toCurrency])

  const trendState = selectedCard.status === 'up' ? 'positive' : 'negative'

  async function refreshMarketData() {
    try {
      // Integração real com API de cotação fica aqui.
      // Exemplo com AwesomeAPI:
      // const response = await fetch(`${API_CONFIG.baseUrl}/${API_CONFIG.pairs}`)
      // const data = await response.json()
      // Exemplo de acesso:
      // const dolar = data.USDBRL.bid
      // const euro = data.EURBRL.bid
      // Depois disso, atualize os cards/tabelas usando setState.

      console.log('Caminho da API pronto para integração:', API_CONFIG)
    } catch (error) {
      console.error('Erro ao atualizar dados do mercado:', error)
    }
  }

  function renderDashboard() {
    return (
      <>
        <section className="overview-grid">
          {overviewCards.map((card) => (
            <article
              key={card.currency}
              className={`overview-card ${card.status === 'up' ? 'up' : 'down'}`}
              onClick={() => setSelectedPair(card.currency)}
            >
              <div className="overview-head">
                <div>
                  <span className="overview-currency">{card.currency}</span>
                  <p className="overview-symbol">{card.symbol}</p>
                </div>
                <span className={`pill ${card.status === 'up' ? 'positive' : 'negative'}`}>
                  {card.status === 'up' ? '▲' : '▼'} {card.variation}
                </span>
              </div>
              <div className="overview-price">{card.price}</div>
              <MiniSparkline points={card.trend} />
            </article>
          ))}
        </section>

        <section className="workspace-grid">
          <div className="chart-panel glass-card">
            <div className="panel-header">
              <div>
                <p className="panel-title">Pulso do Mercado</p>
                <h2>{selectedPair}</h2>
              </div>
              <div className="pair-select">
                {currencyPairs.map((pair) => (
                  <button
                    key={pair}
                    className={pair === selectedPair ? 'range-button active' : 'range-button'}
                    onClick={() => setSelectedPair(pair)}
                  >
                    {pair}
                  </button>
                ))}
              </div>
            </div>

            <div className="chart-meta">
              <div>
                <span>Atual</span>
                <strong>{selectedCard.price}</strong>
              </div>
              <div>
                <span>Variação</span>
                <strong className={trendState}>{selectedCard.variation}</strong>
              </div>
              <div>
                <span>Volume</span>
                <strong>R$ 12.4M</strong>
              </div>
            </div>

            <div className="ticker-filters">
              {timeRanges.map((range) => (
                <button
                  key={range}
                  className={`time-button ${activeRange === range ? 'active' : ''}`}
                  onClick={() => setActiveRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>

            <div className="chart-visual">
              <div className="grid-lines"></div>
              <svg viewBox="0 0 800 320" className="live-chart">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6cffb1" />
                    <stop offset="100%" stopColor="#25c176" />
                  </linearGradient>
                </defs>
                <path d={toPath(chartPoints.map((item) => item * 2))} className="chart-line" />
              </svg>
            </div>
          </div>

          <aside className="right-panel">
            {renderConverterCard()}
            {renderMomentumCard()}
            {renderNewsCard()}
          </aside>
        </section>

        {renderMarketTable()}
      </>
    )
  }

  function renderConverterCard() {
    return (
      <div className="glass-card converter-card">
        <div className="panel-title-row">
          <h3>Conversor de Moedas</h3>
          <button
            className="icon-button"
            onClick={() => {
              setFromCurrency(toCurrency)
              setToCurrency(fromCurrency)
            }}
          >
            ↔
          </button>
        </div>
        <label>
          Moeda de origem
          <select value={fromCurrency} onChange={(event) => setFromCurrency(event.target.value)}>
            {Object.keys(sampleRates).map((symbol) => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </label>
        <label>
          Moeda de destino
          <select value={toCurrency} onChange={(event) => setToCurrency(event.target.value)}>
            {Object.keys(sampleRates).map((symbol) => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </label>
        <label>
          Quantidade
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
          />
        </label>
        <div className="converter-result">
          <span>Valor estimado</span>
          <strong>{amount.toLocaleString('pt-BR')} {fromCurrency} = {converterResult} {toCurrency}</strong>
        </div>
      </div>
    )
  }

  function renderMomentumCard() {
    return (
      <div className="glass-card summary-card">
        <div className="widget-head">
          <p className="panel-title">Movimento do Dia</p>
        </div>
        <div className="summary-grid">
          <div className="mini-card green">
            <span>Melhor desempenho</span>
            <strong>ETH/BRL</strong>
            <p>+3.46%</p>
          </div>
          <div className="mini-card red">
            <span>Pior desempenho</span>
            <strong>GBP/BRL</strong>
            <p>-0.18%</p>
          </div>
        </div>
        <div className="alert-tile">
          <span>Alertas de Mercado</span>
          <p>USD/BRL ultrapassou R$ 5,12 com forte pressão compradora.</p>
        </div>
      </div>
    )
  }

  function renderNewsCard() {
    return (
      <div className="glass-card news-card">
        <div className="widget-head">
          <p className="panel-title">Notícias do Mercado</p>
          <button className="text-button">Ver tudo</button>
        </div>
        <ul>
          <li>
            <strong>Demanda global por câmbio dispara</strong>
            <span>O real ganha força com commodities e alta do dólar.</span>
          </li>
          <li>
            <strong>Fluxo cripto continua elevado</strong>
            <span>BTC e ETH recebem novo interesse institucional.</span>
          </li>
        </ul>
        <button className="cta-button">Exportar relatório</button>
      </div>
    )
  }

  function renderMarketTable(title = 'Mercado em tempo real', subtitle = 'Principais pares e spreads do mercado') {
    return (
      <section className="market-table-card glass-card">
        <div className="panel-title-row">
          <div>
            <p className="panel-title">{title}</p>
            <span>{subtitle}</span>
          </div>
          <button className="text-button" onClick={refreshMarketData}>Atualizar dados</button>
        </div>
        <div className="table-scroll">
          <table className="market-table">
            <thead>
              <tr>
                <th>Moeda</th>
                <th>Compra</th>
                <th>Venda</th>
                <th>Variação</th>
                <th>Última atualização</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.currency}>
                  <td>
                    <div className="currency-cell">
                      <span className="ticker-icon">{iconMap[row.symbol]}</span>
                      <div>
                        <strong>{row.currency}</strong>
                        <small>{row.symbol}</small>
                      </div>
                    </div>
                  </td>
                  <td>{row.buy}</td>
                  <td>{row.sell}</td>
                  <td className={row.variation.startsWith('+') ? 'positive' : 'negative'}>{row.variation}</td>
                  <td>{row.update}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  function renderCurrenciesPage() {
    return (
      <>
        <section className="overview-grid">
          {overviewCards.map((card) => (
            <article key={card.currency} className={`overview-card ${card.status === 'up' ? 'up' : 'down'}`}>
              <div className="overview-head">
                <div>
                  <span className="overview-currency">{card.currency}</span>
                  <p className="overview-symbol">{card.symbol}</p>
                </div>
                <span className={`pill ${card.status === 'up' ? 'positive' : 'negative'}`}>{card.variation}</span>
              </div>
              <div className="overview-price">{card.price}</div>
              <MiniSparkline points={card.trend} />
            </article>
          ))}
        </section>
        {renderMarketTable('Lista de moedas', 'Pesquise, compare e monitore todos os pares disponíveis')}
      </>
    )
  }

  function renderConverterPage() {
    return (
      <section className="workspace-grid">
        <div className="chart-panel glass-card">
          <div className="panel-header">
            <div>
              <p className="panel-title">Mesa de Conversão</p>
              <h2>{fromCurrency}/{toCurrency}</h2>
            </div>
            <button
              className="range-button active"
              onClick={() => {
                setFromCurrency(toCurrency)
                setToCurrency(fromCurrency)
              }}
            >
              Inverter par
            </button>
          </div>

          <div className="chart-meta">
            <div>
              <span>Quantidade</span>
              <strong>{amount.toLocaleString('pt-BR')} {fromCurrency}</strong>
            </div>
            <div>
              <span>Resultado estimado</span>
              <strong>{converterResult} {toCurrency}</strong>
            </div>
            <div>
              <span>Fonte da cotação</span>
              <strong>Mock local/API pronta</strong>
            </div>
          </div>

          <div className="glass-card converter-card">
            <label>
              Moeda de origem
              <select value={fromCurrency} onChange={(event) => setFromCurrency(event.target.value)}>
                {Object.keys(sampleRates).map((symbol) => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
            </label>
            <label>
              Moeda de destino
              <select value={toCurrency} onChange={(event) => setToCurrency(event.target.value)}>
                {Object.keys(sampleRates).map((symbol) => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
            </label>
            <label>
              Quantidade
              <input type="number" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
            </label>
            <div className="converter-result">
              <span>Valor estimado</span>
              <strong>{amount.toLocaleString('pt-BR')} {fromCurrency} = {converterResult} {toCurrency}</strong>
            </div>
          </div>
        </div>

        <aside className="right-panel">
          <div className="glass-card summary-card">
            <p className="panel-title">Pares rápidos</p>
            <div className="summary-grid">
              {currencyPairs.map((pair) => (
                <button key={pair} className="range-button" onClick={() => setSelectedPair(pair)}>{pair}</button>
              ))}
            </div>
          </div>
          {renderMomentumCard()}
        </aside>
      </section>
    )
  }

  function renderChartsPage() {
    return (
      <section className="workspace-grid">
        <div className="chart-panel glass-card">
          <div className="panel-header">
            <div>
              <p className="panel-title">Gráficos Avançados</p>
              <h2>{selectedPair}</h2>
            </div>
            <div className="pair-select">
              {currencyPairs.map((pair) => (
                <button key={pair} className={pair === selectedPair ? 'range-button active' : 'range-button'} onClick={() => setSelectedPair(pair)}>
                  {pair}
                </button>
              ))}
            </div>
          </div>

          <div className="ticker-filters">
            {timeRanges.map((range) => (
              <button key={range} className={`time-button ${activeRange === range ? 'active' : ''}`} onClick={() => setActiveRange(range)}>
                {range}
              </button>
            ))}
          </div>

          <div className="chart-visual">
            <div className="grid-lines"></div>
            <svg viewBox="0 0 800 320" className="live-chart">
              <path d={toPath(chartPoints.map((item) => item * 2))} className="chart-line" />
            </svg>
          </div>
        </div>

        <aside className="right-panel">
          <div className="glass-card summary-card">
            <p className="panel-title">Ferramentas do gráfico</p>
            <div className="summary-grid">
              <div className="mini-card green"><span>Tipo</span><strong>Gráfico de linha</strong><p>Tendência neon</p></div>
              <div className="mini-card green"><span>Período</span><strong>{activeRange}</strong><p>Faixa dinâmica</p></div>
              <div className="mini-card red"><span>Risco</span><strong>Moderado</strong><p>Monitor de volatilidade</p></div>
            </div>
          </div>
          {renderNewsCard()}
        </aside>
      </section>
    )
  }

  function renderFavoritesPage() {
    const favoriteCards = overviewCards.filter((card) => ['USD/BRL', 'BTC/BRL', 'ETH/BRL'].includes(card.currency))

    return (
      <>
        <section className="overview-grid">
          {favoriteCards.map((card) => (
            <article key={card.currency} className={`overview-card ${card.status === 'up' ? 'up' : 'down'}`} onClick={() => setSelectedPair(card.currency)}>
              <div className="overview-head">
                <div>
                  <span className="overview-currency">⭐ {card.currency}</span>
                  <p className="overview-symbol">{card.symbol}</p>
                </div>
                <span className="pill positive">{card.variation}</span>
              </div>
              <div className="overview-price">{card.price}</div>
              <MiniSparkline points={card.trend} />
            </article>
          ))}
        </section>

        <section className="workspace-grid">
          <div className="chart-panel glass-card">
            <div className="panel-header">
              <div>
                <p className="panel-title">Favoritos em destaque</p>
                <h2>{selectedPair}</h2>
              </div>
            </div>
            <div className="chart-visual">
              <div className="grid-lines"></div>
              <svg viewBox="0 0 800 320" className="live-chart">
                <path d={toPath(chartPoints.map((item) => item * 2))} className="chart-line" />
              </svg>
            </div>
          </div>
          <aside className="right-panel">{renderMomentumCard()}</aside>
        </section>
      </>
    )
  }

  function renderReportsPage() {
    return (
      <section className="workspace-grid">
        <div className="chart-panel glass-card">
          <div className="panel-header">
            <div>
              <p className="panel-title">Central de Relatórios</p>
              <h2>Exportações Financeiras</h2>
            </div>
            <div className="pair-select">
              <button className="range-button active">Exportar PDF</button>
              <button className="range-button">Exportar CSV</button>
            </div>
          </div>

          <div className="chart-meta">
            <div><span>Gerados</span><strong>12 relatórios</strong></div>
            <div><span>Período</span><strong>Últimos 30 dias</strong></div>
            <div><span>Status</span><strong className="positive">Pronto</strong></div>
          </div>

          <div className="market-table-card glass-card">
            <div className="panel-title-row">
              <div>
                <p className="panel-title">Histórico de exportações</p>
                <span>Pronto para integração com gerador PDF/CSV</span>
              </div>
            </div>
            <div className="table-scroll">
              <table className="market-table">
                <thead>
                  <tr><th>Relatório</th><th>Data</th><th>Tipo</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {reportRows.map((row) => (
                    <tr key={row.title}>
                      <td><strong>{row.title}</strong></td>
                      <td>{row.date}</td>
                      <td>{row.type}</td>
                      <td className={row.status === 'Pronto' ? 'positive' : 'negative'}>{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="right-panel">{renderNewsCard()}</aside>
      </section>
    )
  }

  function renderSettingsPage() {
    return (
      <section className="workspace-grid">
        <div className="chart-panel glass-card">
          <div className="panel-header">
            <div>
              <p className="panel-title">Configurações do Sistema</p>
              <h2>Preferências</h2>
            </div>
          </div>

          <div className="glass-card converter-card">
            <label>
              Tema
              <select value={theme} onChange={(event) => setTheme(event.target.value)}>
                <option>Neon Escuro</option>
                <option>Preto Profundo</option>
                <option>Esmeralda Pro</option>
              </select>
            </label>

            <label>
              Chave da API
              <input value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="Cole aqui sua chave da API de cotação" />
            </label>

            <div className="converter-result">
              <span>Status da API</span>
              <strong>{apiKey ? 'Chave salva localmente' : 'Aguardando chave da API'}</strong>
            </div>

            <button className="cta-button" onClick={() => setNotifications((prev) => !prev)}>
              Notificações: {notifications ? 'Ativadas' : 'Desativadas'}
            </button>
          </div>
        </div>

        <aside className="right-panel">
          <div className="glass-card summary-card">
            <p className="panel-title">API pronta</p>
            <div className="alert-tile">
              <span>Próximo passo</span>
              <p>Conecte AwesomeAPI, ExchangeRate API ou outra API de cotação dentro da função refreshMarketData().</p>
            </div>
          </div>
          {renderMomentumCard()}
        </aside>
      </section>
    )
  }

  function renderPage() {
    if (activeNav === 'painel') return renderDashboard()
    if (activeNav === 'moedas') return renderCurrenciesPage()
    if (activeNav === 'conversor') return renderConverterPage()
    if (activeNav === 'graficos') return renderChartsPage()
    if (activeNav === 'favoritos') return renderFavoritesPage()
    if (activeNav === 'relatorios') return renderReportsPage()
    if (activeNav === 'configuracoes') return renderSettingsPage()
    return renderDashboard()
  }

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">C</div>
          <div>
            <p className="brand-name">Voltis</p>
            <p className="brand-tag">Central Financeira</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-chip live">Mercado Ao Vivo</div>
          <p>Próxima sincronização em 12s</p>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div className="search-block">
            <span className="search-icon">🔍</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar moeda, par ou símbolo" />
          </div>
          <div className="top-actions">
            <div className="filter-pill">Hoje</div>
            <button className="top-button" onClick={refreshMarketData}>⟳ Atualizar</button>
            <button className="profile-button">J</button>
          </div>
        </header>

        {renderPage()}
      </main>
    </div>
  )
}

export default App
