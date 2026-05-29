import React from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckSquare,
  CircleDollarSign,
  ClipboardCheck,
  Dumbbell,
  LineChart,
  MessageSquare,
  MoreHorizontal,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Utensils
} from "lucide-react";

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
const chartLines = {
  adherence: "8,72 22,61 38,47 54,43 70,24 92,18",
  workouts: "8,86 22,73 38,70 54,58 70,62 92,38",
  students: "8,94 22,84 38,82 54,74 70,77 92,67"
};

const kpis = [
  ["Alunos ativos", "128", "↑ 12% vs mês anterior", Users],
  ["Adesão média", "87%", "↑ 8% vs mês anterior", TrendingUp],
  ["Treinos concluídos", "482", "↑ 15% vs mês anterior", Dumbbell],
  ["Avaliações pendentes", "7", "Ver avaliações", ClipboardCheck],
  ["Faturamento mensal", "R$ 24.870", "↑ 18% vs mês anterior", CircleDollarSign],
  ["Retenção (30 dias)", "92%", "↑ 5% vs mês anterior", RefreshCw]
];

const studentsRows = [
  ["Maria Eduarda", "Emagrecimento", "92%", "Hoje", "↓ 3.2 kg", "Em dia"],
  ["João Vitor", "Hipertrofia", "78%", "Ontem", "↑ 2.1 kg", "Em dia"],
  ["Lucas Almeida", "Definição", "85%", "Hoje", "↓ 1.5 kg", "Em dia"],
  ["Camila Santos", "Emagrecimento", "65%", "3 dias atrás", "↓ 2.8 kg", "Atrasado"],
  ["Rafael Lima", "Hipertrofia", "90%", "Hoje", "↑ 3.6 kg", "Em dia"]
];

const agenda = [
  ["08:00", "Consultoria", "Lucas Almeida"],
  ["09:00", "Avaliação física", "Maria Eduarda"],
  ["10:00", "Reunião online", "Novos alunos"],
  ["14:00", "Consulta", "João Vitor"],
  ["15:00", "Avaliação física", "Camila Santos"]
];

const alerts = [
  ["3 alunos não treinam há 5 dias", "Ver alunos"],
  ["2 avaliações vencendo", "Ver avaliações"],
  ["1 aluno com pagamento vencido", "Ver detalhes"]
];

export default function PersonalDashboard({ students, onNavigate }) {
  const firstStudent = students[0];

  return (
    <div className="admin-mock-dashboard">
      <section className="admin-kpis">
        {kpis.map(([label, value, detail, Icon]) => (
          <article className="admin-kpi-card" key={label}>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{detail}</small>
            </div>
            <Icon size={28} />
          </article>
        ))}
      </section>

      <section className="admin-main-grid">
        <article className="admin-panel performance-panel">
          <div className="panel-head">
            <h2>Desempenho geral</h2>
            <button type="button">Últimos 6 meses</button>
          </div>
          <div className="admin-line-chart">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Gráfico de desempenho">
              <polyline points={chartLines.adherence} className="line-solid" />
              <polyline points={chartLines.workouts} className="line-dashed" />
              <polyline points={chartLines.students} className="line-dotted" />
              {chartLines.adherence.split(" ").map((point) => {
                const [cx, cy] = point.split(",");
                return <circle key={point} cx={cx} cy={cy} r="1.2" />;
              })}
            </svg>
            <div className="chart-axis">
              {months.map((month) => <span key={month}>{month}</span>)}
            </div>
          </div>
          <div className="chart-legend">
            <span><i className="legend-white" />Adesão média</span>
            <span><i className="legend-silver" />Treinos concluídos</span>
            <span><i className="legend-dark" />Novos alunos</span>
          </div>
        </article>

        <article className="admin-panel goals-panel">
          <h2>Distribuição de objetivos</h2>
          <div className="donut-total"><strong>128</strong><span>Total</span></div>
          <ul>
            <li>Hipertrofia <strong>45%</strong></li>
            <li>Emagrecimento <strong>30%</strong></li>
            <li>Definição <strong>15%</strong></li>
            <li>Performance <strong>10%</strong></li>
          </ul>
        </article>

        <article className="admin-panel agenda-panel">
          <div className="panel-head">
            <h2>Agenda de hoje</h2>
            <button type="button">Ver agenda</button>
          </div>
          <div className="agenda-list">
            {agenda.map(([time, title, detail], index) => (
              <div key={`${time}-${title}`}>
                <time>{time}</time>
                <img src={firstStudent?.avatar} alt="" />
                <span><strong>{title}</strong>{detail}</span>
                <i className={index === 0 ? "active" : ""} />
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel students-panel">
          <div className="panel-head">
            <h2>Alunos recentes</h2>
            <div className="table-actions">
              <button type="button">Buscar aluno...</button>
              <button type="button" onClick={() => onNavigate("students")}>Ver todos</button>
            </div>
          </div>
          <div className="admin-table">
            <div className="admin-table-row head">
              <span>Aluno</span><span>Objetivo</span><span>Adesão</span><span>Último treino</span><span>Progresso</span><span>Pagamento</span><span>Ações</span>
            </div>
            {studentsRows.map(([name, objective, adherence, last, progress, payment]) => (
              <div className="admin-table-row" key={name}>
                <span className="student-cell"><img src={firstStudent?.avatar} alt="" />{name}</span>
                <span>{objective}</span>
                <span>{adherence}</span>
                <span>{last}</span>
                <span>{progress}</span>
                <span className={payment === "Em dia" ? "badge-ok" : "badge-danger"}>{payment}</span>
                <button type="button" aria-label={`Ações de ${name}`}><MoreHorizontal size={17} /></button>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-panel finance-panel">
          <div className="panel-head">
            <h2>Resumo financeiro</h2>
            <button type="button">Este mês</button>
          </div>
          <dl>
            <div><dt>Receita</dt><dd>R$ 24.870,00 <span>↑ 18%</span></dd></div>
            <div><dt>Despesas</dt><dd>R$ 5.430,00 <span className="down">↓ 4%</span></dd></div>
            <div><dt>Lucro líquido</dt><dd>R$ 19.440,00 <span>↑ 22%</span></dd></div>
          </dl>
          <button className="metal-button" type="button">Ver relatório completo <BarChart3 size={18} /></button>
        </article>

        <article className="admin-panel alerts-panel">
          <div className="panel-head">
            <h2>Alertas importantes</h2>
            <button type="button">Ver todos</button>
          </div>
          {alerts.map(([title, detail], index) => (
            <div key={title} className={`alert-row alert-${index}`}>
              <AlertTriangle size={18} />
              <span><strong>{title}</strong>{detail}</span>
            </div>
          ))}
        </article>

        <article className="admin-panel quick-actions-panel">
          <h2>Ações rápidas</h2>
          <div>
            {[
              ["Novo aluno", Users],
              ["Novo treino", CalendarDays],
              ["Nova dieta", Utensils],
              ["Adicionar avaliação", CheckSquare],
              ["Enviar mensagem", MessageSquare],
              ["Gerar relatório", BarChart3]
            ].map(([label, Icon]) => (
              <button key={label} type="button"><Icon size={22} />{label}</button>
            ))}
          </div>
        </article>

        <article className="admin-panel business-panel">
          <h2>Visão geral do negócio</h2>
          <div>
            <span>Novos alunos <strong>18</strong><small>↑ 20%</small></span>
            <span>Cancelamentos <strong>3</strong><small>↓ 25%</small></span>
            <span>Ticket médio <strong>R$ 194,00</strong><small>↑ 15%</small></span>
            <span>Satisfação <strong>4,8/5</strong><small>↑ 8%</small></span>
          </div>
        </article>

        <article className="admin-panel coach-ia-panel">
          <div>
            <p className="eyebrow">Coach IA</p>
            <h2>Seu assistente inteligente para gestão de alunos.</h2>
            <button type="button">Abrir Coach IA</button>
          </div>
          <img src="/lion-juda-logo.png" alt="" />
        </article>
      </section>

      <section className="admin-feature-strip">
        <div><ShieldCheck size={36} /><span><strong>Gestão completa</strong>Tenha total controle do seu negócio fitness</span></div>
        <div><LineChart size={36} /><span><strong>Dados inteligentes</strong>Acompanhe métricas e tome decisões melhores</span></div>
        <div><Users size={36} /><span><strong>Evolução dos alunos</strong>Veja o progresso e resultados dos seus alunos</span></div>
        <div><Sparkles size={36} /><span><strong>Coach IA</strong>Assistente para gestão e produtividade</span></div>
      </section>
    </div>
  );
}
