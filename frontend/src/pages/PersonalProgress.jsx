import React from "react";
import {
  AlertTriangle,
  Apple,
  Award,
  BarChart3,
  Droplets,
  Dumbbell,
  FileText,
  Flame,
  LineChart,
  RefreshCw,
  Sparkles,
  Star,
  TrendingDown,
  Trophy,
  Users
} from "lucide-react";

const kpis = [
  ["Alunos ativos", "128", "↑ 12% vs mês anterior", Users],
  ["Aderência média", "78%", "↑ 6% vs mês anterior", Award],
  ["Peso total perdido", "-128,4 kg", "↑ 15,3 kg vs mês anterior", TrendingDown],
  ["Massa magra total ganha", "+46,7 kg", "↑ 6,3 kg vs mês anterior", Trophy],
  ["Redução média de gordura", "-2,4%", "↓ 0,6% vs mês anterior", Flame],
  ["Adesao alimentar", "74%", "↑ 8% vs mês anterior", Apple],
  ["Treinos concluidos", "2.156", "↑ 18% vs mês anterior", Dumbbell],
  ["Hidratação média", "2,1 L", "↑ 0,3 L vs mês anterior", Droplets]
];

const highlights = [
  { rank: 2, name: "Lucas Almeida", avatar: "/jessica-gomes.png", result: "-3,8% gordura", mass: "+1,8 kg massa magra" },
  { rank: 1, name: "Erika Gomes", avatar: "/erika-gomes.jpeg", result: "-4,2% gordura", mass: "+2,1 kg massa magra" },
  { rank: 3, name: "Mariana Costa", avatar: "/erika-gomes.jpeg", result: "-3,5% gordura", mass: "+1,6 kg massa magra" }
];

const alerts = [
  ["Alta", "3 alunos com queda de aderência", "Aderência abaixo de 50%"],
  ["Média", "2 alunos não registraram refeições", "Nos últimos 2 dias"],
  ["Alta", "1 aluno aumentou gordura corporal", "Fique atento a evolução"],
  ["Média", "Baixa hidratação geral", "Média abaixo do ideal"],
  ["Boa", "Parabéns! 12 alunos bateram meta", "Ótimo trabalho"]
];

const ranking = [
  ["1", "Erika Gomes", "92%", "95%", "90%", "2,2 L", "9,4", "/erika-gomes.jpeg"],
  ["2", "Lucas Almeida", "88%", "90%", "85%", "2,0 L", "8,9", "/jessica-gomes.png"],
  ["3", "Mariana Costa", "86%", "88%", "82%", "1,9 L", "8,6", "/erika-gomes.jpeg"],
  ["4", "Felipe Rocha", "84%", "85%", "80%", "1,8 L", "8,4", "/jessica-gomes.png"],
  ["5", "Juliana Santos", "82%", "83%", "78%", "1,8 L", "8,2", "/erika-gomes.jpeg"]
];

const measureRows = [
  ["Cintura", "78,2 cm", "81,1 cm", "-2,9 cm ↓", 82],
  ["Abdômen", "85,4 cm", "88,7 cm", "-3,3 cm ↓", 76],
  ["Peito", "98,0 cm", "96,2 cm", "+1,8 cm ↑", 66],
  ["Quadril", "102,3 cm", "104,1 cm", "-1,8 cm ↓", 72],
  ["Braço", "30,5 cm", "30,0 cm", "+0,5 cm ↑", 44],
  ["Coxa", "56,1 cm", "56,9 cm", "-0,8 cm ↓", 58]
];

const insights = [
  "Erika Gomes e a aluna com melhor evolução do mes, com -4,2% de gordura corporal e +2,1 kg de massa magra.",
  "Aderência alimentar aumentou 8% em relação ao mês anterior. Excelente tendência.",
  "Hidratação média ainda abaixo do ideal. Sugira aumentar ingestão de água aos alunos."
];

export default function PersonalProgress({ onOpenStudentProgress }) {
  return (
    <section className="personal-progress-page">
      <header className="progress-admin-header">
        <div>
          <h2>Progresso</h2>
          <p>Acompanhe a evolução geral de todos os seus alunos.</p>
        </div>
        <div className="progress-filter-row">
          <select defaultValue="month">
            <option value="month">01/05/2025 - 31/05/2025</option>
          </select>
          <select defaultValue="all">
            <option value="all">Todos os alunos</option>
          </select>
          <select defaultValue="compare">
            <option value="compare">Comparar com: 01/04/2025 - 30/04/2025</option>
          </select>
          <button type="button"><FileText size={18} /> Relatório completo</button>
        </div>
      </header>

      <div className="progress-kpi-grid">
        {kpis.map(([label, value, detail, Icon]) => (
          <article key={label}>
            <Icon size={21} />
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
          </article>
        ))}
      </div>

      <div className="progress-main-grid">
        <article className="progress-panel progress-chart-panel">
          <div className="section-heading">
            <div>
              <h2>Progresso geral dos alunos</h2>
              <div className="progress-tabs">
                {["Peso", "Gordura corporal", "Massa magra", "IMC", "Medidas médias"].map((tab) => (
                  <button type="button" key={tab}>{tab}</button>
                ))}
              </div>
            </div>
            <select defaultValue="daily"><option value="daily">Diario</option></select>
          </div>
          <div className="performance-line-chart">
            <svg viewBox="0 0 760 330" role="img">
              {[60, 115, 170, 225, 280].map((y) => <line key={y} x1="50" x2="710" y1={y} y2={y} />)}
              <polyline points="52,96 145,102 238,132 330,152 422,164 515,198 608,220 706,252" />
              <polyline className="previous" points="52,64 145,82 238,90 330,108 422,130 515,148 608,162 706,196" />
              {["01/05", "08/05", "15/05", "22/05", "31/05"].map((label, index) => (
                <text key={label} x={54 + index * 162} y="316">{label}</text>
              ))}
            </svg>
          </div>
          <aside className="chart-summary">
            <span>Total atual</span>
            <strong>1.243,6 kg</strong>
            <span>Total anterior</span>
            <strong>1.372,0 kg</strong>
            <em>-128,4 kg • 9,4%</em>
          </aside>
        </article>

        <article className="progress-panel highlight-panel">
          <div className="section-heading">
            <h2>Alunos destaque</h2>
            <button type="button">Ver todos</button>
          </div>
          <div className="highlight-tabs">
            {["Maior evolução", "Mais consistentes", "Melhor dieta", "Mais treinos"].map((tab) => <button key={tab} type="button">{tab}</button>)}
          </div>
          <div className="highlight-podium">
            {highlights.map((item) => (
              <button
                className={item.rank === 1 ? "winner" : ""}
                key={item.name}
                type="button"
                onClick={() => onOpenStudentProgress?.({ id: "stu-erika", name: item.name, avatar: item.avatar })}
              >
                <mark>{item.rank}</mark>
                <img src={item.avatar} alt={item.name} />
                <strong>{item.name}</strong>
                <span>{item.result}</span>
                <small>{item.mass}</small>
              </button>
            ))}
          </div>
        </article>

        <article className="progress-panel alerts-panel">
          <div className="section-heading">
            <h2>Alertas inteligentes</h2>
            <button type="button">Ver todos</button>
          </div>
          <div className="progress-alert-list">
            {alerts.map(([level, title, detail]) => (
              <div key={title}>
                <AlertTriangle size={18} />
                <span><strong>{title}</strong><small>{detail}</small></span>
                <em>{level}</em>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="progress-secondary-grid">
        <article className="progress-panel diet-progress-panel">
          <h2>Progresso da dieta</h2>
          <div className="diet-ring"><strong>74%</strong><span>Adesao alimentar</span></div>
          <ul>
            <li><Flame size={18} /> <strong>1.812 kcal</strong> Média de calorias</li>
            <li><Apple size={18} /> <strong>128 g</strong> Média de proteínas</li>
            <li><BarChart3 size={18} /> <strong>5,2 refeições</strong> Média de refeições/dia</li>
            <li><Droplets size={18} /> <strong>2,1 L</strong> Média de hidratação</li>
          </ul>
        </article>

        <article className="progress-panel measures-progress-panel">
          <div className="section-heading">
            <h2>Evolução das medidas</h2>
            <select defaultValue="month"><option value="month">Mês atual</option></select>
          </div>
          {measureRows.map(([label, current, previous, diff, value]) => (
            <div className="measure-progress-row" key={label}>
              <span>{label}</span>
              <div><i style={{ width: `${value}%` }} /></div>
              <strong>{current}</strong>
              <small>{previous}</small>
              <em className={diff.includes("+") ? "up" : ""}>{diff}</em>
            </div>
          ))}
        </article>

        <article className="progress-panel visual-progress-panel">
          <div className="section-heading">
            <h2>Evolução visual</h2>
            <button type="button">Ver todos</button>
          </div>
          <div className="visual-cards">
            {["Erika Gomes", "Lucas Almeida", "Mariana Costa"].map((name, index) => (
              <div key={name}>
                <strong>{name}</strong>
                <div>
                  <img src={index === 1 ? "/jessica-gomes.png" : "/erika-gomes.jpeg"} alt={`${name} antes`} />
                  <span>→</span>
                  <img src={index === 1 ? "/jessica-gomes.png" : "/erika-gomes.jpeg"} alt={`${name} depois`} />
                </div>
                <small>-{index + 3},8% gordura</small>
                <small>+{index + 1},8 kg massa magra</small>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="progress-bottom-grid">
        <article className="progress-panel ranking-panel">
          <div className="section-heading">
            <h2>Ranking geral dos alunos</h2>
            <div className="progress-tabs compact">
              {["Aderência", "Evolução", "Frequência", "Dieta", "Hidratação"].map((tab) => <button type="button" key={tab}>{tab}</button>)}
            </div>
          </div>
          <div className="ranking-table">
            {ranking.map(([pos, name, adherence, workout, diet, water, score, avatar]) => (
              <div key={name}>
                <span>{pos}</span>
                <img src={avatar} alt={name} />
                <strong>{name}</strong>
                <span>{adherence}</span>
                <span>{workout}</span>
                <span>{diet}</span>
                <span>{water}</span>
                <span className="stars"><Star size={13} /><Star size={13} /><Star size={13} /><Star size={13} /><Star size={13} /></span>
                <mark>{score}</mark>
              </div>
            ))}
          </div>
        </article>

        <article className="progress-panel distribution-panel">
          <h2>Distribuicao dos alunos</h2>
          <div className="distribution-donut"><span /></div>
          <ul>
            <li>Em evolução <strong>78 (61%)</strong></li>
            <li>Em manutencao <strong>32 (25%)</strong></li>
            <li>Atencao necessaria <strong>12 (9%)</strong></li>
            <li>Sem progresso <strong>6 (5%)</strong></li>
          </ul>
        </article>

        <article className="progress-panel insights-panel">
          <div className="section-heading">
            <h2>Coach IA Insights</h2>
            <button type="button">Ver todos</button>
          </div>
          {insights.map((insight) => (
            <div key={insight}>
              <Sparkles size={18} />
              <span>{insight}</span>
            </div>
          ))}
          <button type="button">Fazer pergunta para Coach IA</button>
        </article>
      </div>

      <footer className="progress-footer">
        <Trophy size={22} />
        <span>Parabéns! Você ajudou 12 alunos a baterem suas metas este mês.</span>
        <button type="button"><RefreshCw size={18} /> Atualizar</button>
      </footer>
    </section>
  );
}
