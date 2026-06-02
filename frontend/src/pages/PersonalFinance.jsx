import React from "react";
import {
  AlertTriangle,
  Brain,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Download,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet
} from "lucide-react";

const months = [
  ["Jul", 16],
  ["Ago", 19],
  ["Set", 20],
  ["Out", 19],
  ["Nov", 24],
  ["Jan", 26],
  ["Fev", 25],
  ["Mar", 28],
  ["Abr", 29],
  ["Mai", 28],
  ["Jun", 31]
];

const kpis = [
  { label: "Receita do mês", value: "R$ 24.870,00", delta: "+18% vs mês anterior", icon: CircleDollarSign, trend: [18, 26, 21, 31, 25, 35, 29, 42] },
  { label: "Alunos pagantes", value: "128", delta: "+12% vs mês anterior", icon: Users, trend: [20, 29, 24, 34, 30, 39, 35, 44] },
  { label: "Inadimplentes", value: "7", delta: "-23% vs mês anterior", icon: AlertTriangle, danger: true, trend: [17, 25, 18, 22, 19, 24, 21, 31] },
  { label: "Taxa de renovação", value: "92%", delta: "+5% vs mês anterior", icon: RefreshCw, trend: [18, 23, 28, 25, 33, 37, 30, 41] }
];

const pendingCharges = [
  { name: "Rafael Souza", plan: "Plano Premium", value: "R$ 149,00", delay: "3 dias em atraso", avatar: "/erika-gomes.jpeg" },
  { name: "Gabriel Ferreira", plan: "Plano Elite", value: "R$ 199,00", delay: "7 dias em atraso", avatar: "/lion-juda-logo.png" },
  { name: "Patricia Alves", plan: "Plano Elite", value: "R$ 249,00", delay: "12 dias em atraso", avatar: "/erika-gomes.jpeg" }
];

const dueGroups = [
  { label: "Hoje", total: "R$ 398,00", items: [["Juliana Costa", "Plano Premium", "R$ 199,00"], ["Lucas Martins", "Plano Básico", "R$ 199,00"]] },
  { label: "Esta semana", total: "R$ 597,00", items: [["Amanda Lima", "Plano Elite", "R$ 249,00"], ["+ 2 alunos", "Vencimentos futuros", "R$ 348,00"]] },
  { label: "Este mês", total: "R$ 1.892,00", items: [["8 alunos", "Renovações previstas", "R$ 1.892,00"]] }
];

const cashFlow = [
  { label: "Receitas", value: "R$ 24.870,00", delta: "+18% vs mês anterior", type: "positive" },
  { label: "Despesas", value: "R$ 6.430,00", delta: "+8% vs mês anterior", type: "warning" },
  { label: "Lucro líquido", value: "R$ 18.440,00", delta: "+22% vs mês anterior", type: "neutral" }
];

export default function PersonalFinance() {
  return (
    <section className="finance-page">
      <div className="finance-toolbar">
        <button type="button"><CalendarDays size={18} /> 01/06/2025 - 30/06/2025</button>
        <button type="button"><Download size={18} /> Exportar relatório</button>
      </div>

      <div className="finance-kpi-grid">
        <article className="finance-health-card">
          <div>
            <p className="eyebrow">Saúde financeira</p>
            <div className="finance-score-ring">
              <strong>87</strong>
              <span>/100</span>
            </div>
          </div>
          <div>
            <strong>Excelente!</strong>
            <p>Seu negócio está em ótima saúde financeira.</p>
            <button type="button"><Brain size={15} /> Ver análise da IA</button>
          </div>
        </article>

        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="finance-kpi-card">
              <span className="finance-kpi-icon"><Icon size={24} /></span>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <small className={item.danger ? "danger" : "positive"}>{item.delta}</small>
              <MiniLine values={item.trend} danger={item.danger} />
            </article>
          );
        })}
      </div>

      <article className="finance-chart-card">
        <div className="section-heading">
          <div>
            <h2>Receita dos últimos 12 meses</h2>
          </div>
          <button type="button">Mensal</button>
        </div>
        <div className="finance-chart-layout">
          <div className="finance-bars" aria-label="Gráfico de receita mensal">
            <div className="finance-axis">
              <span>R$ 40k</span>
              <span>R$ 30k</span>
              <span>R$ 20k</span>
              <span>R$ 10k</span>
              <span>R$ 0</span>
            </div>
            <div className="finance-bar-grid">
              {months.map(([month, value]) => (
                <div key={month} className="finance-bar-item">
                  <i style={{ height: `${value * 6}px` }} />
                  <span>{month}</span>
                </div>
              ))}
              <svg viewBox="0 0 620 190" preserveAspectRatio="none" aria-hidden="true">
                <polyline points="12,130 70,112 130,110 190,111 250,78 310,64 370,72 430,50 490,44 550,48 608,36" />
                {[[12,130],[70,112],[130,110],[190,111],[250,78],[310,64],[370,72],[430,50],[490,44],[550,48],[608,36]].map(([x, y]) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r="5" />
                ))}
              </svg>
            </div>
          </div>
          <aside className="finance-period-summary">
            <p>Resumo do período</p>
            <strong>Receita total <span>R$ 24.870,00</span></strong>
            <strong>Receita média/mês <span>R$ 20.725,00</span></strong>
            <strong>Maior receita <span>R$ 28.430,00</span><small>Maio/2025</small></strong>
            <strong className="forecast">Previsão próximo mês <span>R$ 26.300,00</span></strong>
          </aside>
        </div>
      </article>

      <div className="finance-two-columns">
        <article className="finance-card">
          <div className="section-heading">
            <h2>Cobranças pendentes</h2>
            <button type="button">Ver todas</button>
          </div>
          <div className="finance-charge-list">
            {pendingCharges.map((charge) => (
              <div key={charge.name} className="finance-charge-row">
                <img src={charge.avatar} alt={charge.name} />
                <div>
                  <strong>{charge.name}</strong>
                  <span>{charge.plan}</span>
                </div>
                <div>
                  <strong>{charge.value}</strong>
                  <small>{charge.delay}</small>
                </div>
                <button type="button" aria-label={`Cobrar ${charge.name}`}><MessageCircle size={18} /></button>
              </div>
            ))}
          </div>
          <button className="finance-wide-button" type="button"><Send size={18} /> Cobrar todos inadimplentes</button>
        </article>

        <article className="finance-card">
          <div className="section-heading">
            <h2>Próximos vencimentos</h2>
            <button type="button">Ver todas</button>
          </div>
          <div className="finance-due-list">
            {dueGroups.map((group) => (
              <div key={group.label} className="finance-due-group">
                <header><span>{group.label}</span><strong>{group.total}</strong></header>
                {group.items.map(([name, plan, value]) => (
                  <button type="button" key={`${group.label}-${name}`}>
                    <span>{name}</span>
                    <small>{plan}</small>
                    <strong>{value}</strong>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="finance-ai-card">
        <div className="finance-ai-orb"><Brain size={46} /></div>
        <div className="finance-ai-insights">
          <h2>Coach IA Financeiro</h2>
          <p><TrendingUp size={16} /> Seu faturamento cresceu 18% este mês.</p>
          <p><AlertTriangle size={16} /> 7 alunos estão inadimplentes.</p>
          <p><ShieldCheck size={16} /> Plano Premium é o mais lucrativo.</p>
          <p><Wallet size={16} /> Você pode aumentar o faturamento em R$ 4.200 reduzindo a inadimplência.</p>
        </div>
        <button type="button"><SparkleIcon /> Analisar meu negócio</button>
      </article>

      <article className="finance-flow-card">
        <div className="section-heading">
          <h2>Fluxo financeiro</h2>
          <button type="button">Este mês</button>
        </div>
        <div className="finance-flow-grid">
          {cashFlow.map((item) => (
            <div key={item.label} className={`finance-flow-item ${item.type}`}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.delta}</small>
              <MiniLine values={[12, 14, 19, 17, 23, 21, 26, 24, 29]} danger={item.type === "warning"} />
            </div>
          ))}
          <div className="finance-margin">
            <div><strong>74%</strong><span>Margem de lucro</span></div>
          </div>
        </div>
      </article>

      <article className="finance-risk-card">
        <div>
          <p className="eyebrow">Risco de cancelamento</p>
          <h2>Retenção sob controle</h2>
          <span>A IA cruza frequência, pagamentos, aderência e interação para indicar risco de churn.</span>
        </div>
        <div className="finance-risk-grid">
          <div><strong>96</strong><span>baixo risco</span></div>
          <div><strong>21</strong><span>médio risco</span></div>
          <div><strong>7</strong><span>alto risco</span></div>
        </div>
      </article>
    </section>
  );
}

function MiniLine({ values, danger = false }) {
  const max = Math.max(...values);
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${42 - (value / max) * 34}`).join(" ");
  return (
    <svg className={`finance-mini-line ${danger ? "danger" : ""}`} viewBox="0 0 100 48" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} />
    </svg>
  );
}

function SparkleIcon() {
  return <Brain size={18} />;
}
