import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Apple,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  Dumbbell,
  FileSpreadsheet,
  FileText,
  LineChart,
  Mail,
  Medal,
  Send,
  Sparkles,
  Trophy,
  Users,
  Wallet
} from "lucide-react";

const quickReports = [
  ["Relatório mensal", "Visão geral do mes", CalendarDays],
  ["Relatório de alunos", "Desempenho dos alunos", Users],
  ["Relatório financeiro", "Receitas e faturamento", Wallet],
  ["Relatório de treinos", "Adesao e conclusao", Dumbbell],
  ["Relatório de dietas", "Adesao e evolução", Apple],
  ["Relatório de avaliações", "Evolução corporal", FileText]
];

const kpis = [
  ["Alunos ativos", "128", "+12% vs mês anterior", Users, [30, 42, 38, 50, 58, 72]],
  ["Evolução media", "87%", "+8% vs mês anterior", LineChart, [28, 35, 48, 55, 70, 87]],
  ["Receita mensal", "R$ 24.580", "+15% vs mês anterior", Wallet, [16, 21, 19, 25, 28, 34]],
  ["Aderência media", "89%", "+7% vs mês anterior", CheckCircle2, [62, 70, 68, 76, 82, 89]],
  ["Avaliações realizadas", "42", "+20% vs mês anterior", FileText, [18, 24, 25, 31, 35, 42]]
];

const recentReports = [
  ["Relatório Mensal - Maio/2026", "Gerado em 31/05/2026 as 10:42", "PDF", "2.4 MB"],
  ["Relatório de Alunos - Maio/2026", "Gerado em 30/05/2026 as 16:20", "PDF", "1.8 MB"],
  ["Relatório Financeiro - Maio/2026", "Gerado em 30/05/2026 as 09:15", "PDF", "1.2 MB"],
  ["Relatório de Treinos - Maio/2026", "Gerado em 29/05/2026 as 14:30", "PDF", "3.1 MB"],
  ["Relatório de Avaliações - Maio/2026", "Gerado em 28/05/2026 as 11:05", "PDF", "2.7 MB"]
];

const ranking = [
  ["Erika Gomes", "Maior evolução", "+4,2%", "94"],
  ["Lucas Almeida", "Aumento de carga", "+22 kg", "91"],
  ["Mariana Costa", "Melhor dieta", "96%", "89"],
  ["Rafael Santos", "Perda de peso", "-3,8 kg", "86"],
  ["Camila Ferreira", "Melhor aderência", "92%", "84"]
];

const insightPrompts = [
  ["Gerar resumo mensal", "Resumo completo do mês atual", Sparkles],
  ["Quais alunos mais evoluiram?", "Analise dos melhores resultados", Trophy],
  ["Quem precisa de atencao?", "Alunos com baixa aderência", AlertTriangle],
  ["Previsão de resultados", "Projecao para os pr?ximos meses", LineChart],
  ["Baixa aderência alimentar", "Detectar queda em dieta", Apple],
  ["Aumento de carga", "Evolução por exercicio", Dumbbell]
];

const performanceData = [52, 61, 68, 64, 72, 79, 75, 88, 91, 86, 94, 96];

export default function PersonalReports({ students = [] }) {
  const [selectedReport, setSelectedReport] = useState("Relatório mensal");
  const [period, setPeriod] = useState("Este mês (01/05/2026 - 31/05/2026)");
  const [reportType, setReportType] = useState("Relatório mensal");
  const studentCount = students.length || 128;

  const bars = useMemo(() => performanceData.map((value, index) => ({ label: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"][index], value })), []);

  return (
    <section className="reports-admin-page">
      <header className="reports-admin-header">
        <div>
          <h2>Relatórios</h2>
          <p>Visão geral dos resultados do seu neg?cio e da evolução dos seus alunos.</p>
        </div>
        <div className="reports-header-actions">
          <button type="button" aria-label="Notificacoes"><Bell size={20} /><span>3</span></button>
          <label>
            <CalendarDays size={18} />
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option>Este mês (01/05/2026 - 31/05/2026)</option>
              <option>Ultimos 30 dias</option>
              <option>Ultimos 3 meses</option>
              <option>Ultimos 12 meses</option>
            </select>
            <ChevronDown size={16} />
          </label>
          <button type="button"><Download size={18} /> Exportar relatório</button>
        </div>
      </header>

      <article className="reports-card reports-quick-card">
        <div className="reports-section-title">
          <h3>Relatórios rapidos</h3>
          <p>Atalhos executivos para gerar visoes prontas.</p>
        </div>
        <div className="reports-quick-grid">
          {quickReports.map(([title, text, Icon]) => (
            <button key={title} className={selectedReport === title ? "active" : ""} type="button" onClick={() => { setSelectedReport(title); setReportType(title); }}>
              <Icon size={27} />
              <span><strong>{title}</strong><small>{text}</small></span>
            </button>
          ))}
        </div>
      </article>

      <div className="reports-kpi-grid">
        {kpis.map(([title, value, delta, Icon, trend]) => (
          <article key={title} className="reports-kpi-card">
            <div>
              <span>{title}</span>
              <strong>{title === "Alunos ativos" ? studentCount : value}</strong>
              <small>{delta}</small>
            </div>
            <div className="reports-kpi-orb"><Icon size={24} /></div>
            <MiniTrend values={trend} />
          </article>
        ))}
      </div>

      <div className="reports-main-grid">
        <article className="reports-card reports-performance-card">
          <div className="reports-section-title horizontal">
            <div>
              <h3>Desempenho geral</h3>
              <p>Evolução de alunos, aderência e resultado financeiro.</p>
            </div>
            <select>
              <option>Ultimos 6 meses</option>
              <option>30 dias</option>
              <option>3 meses</option>
              <option>12 meses</option>
            </select>
          </div>
          <div className="reports-chart-area">
            {bars.map((bar) => (
              <div key={bar.label} className="reports-chart-bar">
                <i style={{ height: `${bar.value}%` }} />
                <span>{bar.label}</span>
              </div>
            ))}
          </div>
          <div className="reports-chart-legend">
            <span><i /> Alunos</span>
            <span><i /> Aderência</span>
            <span><i /> Financeiro</span>
          </div>
        </article>

        <article className="reports-card reports-ranking-card">
          <div className="reports-section-title horizontal">
            <div>
              <h3>Ranking premium</h3>
              <p>Top 5 alunos do mes.</p>
            </div>
            <Medal size={26} />
          </div>
          <div className="reports-ranking-list">
            {ranking.map(([name, label, result, score], index) => (
              <button key={name} type="button">
                <b>{index + 1}</b>
                <span><strong>{name}</strong><small>{label}</small></span>
                <em>{result}</em>
                <i>{score}</i>
              </button>
            ))}
          </div>
        </article>
      </div>

      <div className="reports-lower-grid">
        <article className="reports-card reports-generator-card">
          <div className="reports-section-title">
            <h3>Gerador de relatório</h3>
            <p>Selecione os filtros abaixo para gerar seu relatório personalizado.</p>
          </div>
          <div className="reports-form-grid">
            <label>Periodo<input value="01/05/2026 - 31/05/2026" readOnly /></label>
            <label>Aluno<select><option>Todos os alunos</option><option>Erika Gomes</option><option>Lucas Almeida</option></select></label>
            <label>Tipo de relatório<select value={reportType} onChange={(event) => setReportType(event.target.value)}>{quickReports.map(([title]) => <option key={title}>{title}</option>)}</select></label>
            <label>Status<select><option>Todos</option><option>Ativos</option><option>Atenção</option></select></label>
            <label>Objetivo<select><option>Todos os objetivos</option><option>Hipertrofia</option><option>Emagrecimento</option></select></label>
            <label>Formato<select><option>PDF</option><option>Excel</option><option>CSV</option></select></label>
          </div>
          <div className="reports-export-actions">
            <button type="button" className="primary"><FileText size={18} /> Gerar PDF</button>
            <button type="button"><FileSpreadsheet size={18} /> Exportar Excel</button>
            <button type="button"><Mail size={18} /> Enviar por e-mail</button>
          </div>
        </article>

        <article className="reports-card reports-recent-card">
          <div className="reports-section-title horizontal">
            <div>
              <h3>Relatórios recentes</h3>
              <p>Arquivos gerados com identidade da marca.</p>
            </div>
            <button type="button">Ver todos</button>
          </div>
          <div className="reports-recent-list">
            {recentReports.map(([title, date, format, size]) => (
              <button key={title} type="button">
                <FileText size={22} />
                <span><strong>{title}</strong><small>{date}</small></span>
                <em>{format}<small>{size}</small></em>
                <Download size={18} />
              </button>
            ))}
          </div>
        </article>
      </div>

      <article className="reports-card reports-ai-card">
        <div>
          <div className="reports-section-title">
            <h3>Coach IA para relatórios</h3>
            <p>Use inteligencia artificial para gerar insights e analises avancadas.</p>
          </div>
          <div className="reports-insight-grid">
            {insightPrompts.map(([title, text, Icon]) => (
              <button key={title} type="button">
                <Icon size={23} />
                <span><strong>{title}</strong><small>{text}</small></span>
              </button>
            ))}
          </div>
        </div>
        <div className="reports-ai-emblem">
          <img src="/lion-juda-logo.png" alt="Leao de Juda" />
        </div>
      </article>
    </section>
  );
}

function MiniTrend({ values }) {
  return (
    <svg className="reports-mini-trend" viewBox="0 0 100 42" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={values.map((value, index) => `${index * (100 / (values.length - 1))},${42 - (value / 100) * 34}`).join(" ")}
        fill="none"
        stroke="rgba(245,245,245,.82)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

