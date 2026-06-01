import React, { useState } from "react";
import {
  Activity,
  Award,
  BadgeCheck,
  Camera,
  Droplets,
  Dumbbell,
  Flame,
  HeartPulse,
  LineChart,
  Medal,
  Scale,
  Sparkles,
  Trophy,
  TrendingUp,
  Utensils
} from "lucide-react";

const metricCards = [
  { label: "Peso atual", value: "67,4 kg", diff: "-2,8 kg", note: "desde a ultima avaliação", icon: Scale },
  { label: "Gordura corporal", value: "18,6%", diff: "-1,2%", note: "evolução positiva", icon: HeartPulse },
  { label: "Massa magra", value: "54,1 kg", diff: "+1,4 kg", note: "ganho no ciclo", icon: Activity },
  { label: "IMC", value: "22,4", diff: "Normal", note: "faixa saudavel", icon: BadgeCheck },
  { label: "Agua corporal", value: "39,6 L", diff: "+0,8 L", note: "melhora hidratacao", icon: Droplets },
  { label: "Aderencia", value: "87%", diff: "+12%", note: "vs mes anterior", icon: TrendingUp },
  { label: "Score do Leao", value: "92/100", diff: "Excelente", note: "performance geral", icon: Trophy }
];

const loadProgress = [
  { name: "Supino reto", start: 40, current: 52, percent: 78 },
  { name: "Leg press", start: 120, current: 180, percent: 92 },
  { name: "Agachamento", start: 30, current: 55, percent: 84 },
  { name: "Puxada frontal", start: 25, current: 40, percent: 72 }
];

const records = [
  ["Maior carga", "180 kg", "Leg press"],
  ["Maior streak", "18 dias", "sequencia ativa"],
  ["Melhor mes", "Junho", "31 treinos"],
  ["Maior frequencia", "5x/sem", "consistencia"],
  ["Maior volume", "18.450 kg", "ciclo atual"]
];

const measures = [
  ["Cintura", "78,2 cm", "-3,1 cm"],
  ["Braco", "30,5 cm", "+0,5 cm"],
  ["Peito", "98,0 cm", "+1,8 cm"],
  ["Quadril", "102,3 cm", "-1,5 cm"],
  ["Coxa", "56,1 cm", "+0,8 cm"]
];

const bodyEvolution = [74, 72.8, 71.6, 70.2, 68.9, 67.4];
const strengthEvolution = [40, 48, 62, 75, 88, 104];

export default function Progress({ student, students = [] }) {
  const [modal, setModal] = useState(null);
  const currentStudent = student || students[0] || {};
  const avatar = currentStudent.avatar || "/erika-gomes.jpeg";

  return (
    <section className="student-progress-premium">
      <header className="student-progress-hero">
        <div>
          <p className="eyebrow">Central de evolução</p>
          <h1>Você esta evoluindo de verdade.</h1>
          <span>Forca, medidas, dieta e consistencia reunidas em uma tela premium.</span>
          <div className="student-progress-hero-actions">
            <button type="button" onClick={() => setModal("analysis")}>Ver anÃ¡lise completa</button>
            <button type="button" onClick={() => setModal("coach")}>Falar com Coach IA</button>
          </div>
        </div>
        <img className="student-progress-lion" src="/lion-juda-logo.png" alt="Leao de Juda" />
        <div className="student-progress-profile">
          <img src={avatar} alt={currentStudent.name || "Aluno"} />
          <strong>{currentStudent.name || "Erika Gomes"}</strong>
          <small>Score do Leao 92/100</small>
        </div>
      </header>

      <section className="student-progress-kpis">
        {metricCards.map(({ label, value, diff, note, icon: Icon }) => (
          <article key={label} className="student-progress-kpi">
            <span><Icon size={18} /></span>
            <small>{label}</small>
            <strong>{value}</strong>
            <em>{diff}</em>
            <p>{note}</p>
          </article>
        ))}
      </section>

      <section className="student-progress-grid student-progress-grid-top">
        <article className="student-progress-card load-evolution-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Evolução de carga</p>
              <h2>Forca aumentando</h2>
            </div>
            <Dumbbell size={22} />
          </div>
          <div className="strength-chart" aria-label="Grafico de evolução de forca">
            <svg viewBox="0 0 520 210" role="img">
              <defs>
                <linearGradient id="strengthFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(245,245,245,0.35)" />
                  <stop offset="100%" stopColor="rgba(245,245,245,0.02)" />
                </linearGradient>
              </defs>
              <polyline points="20,175 110,154 200,118 290,96 380,62 500,34" fill="none" stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />
              <polygon points="20,175 110,154 200,118 290,96 380,62 500,34 500,198 20,198" fill="url(#strengthFill)" />
              {strengthEvolution.map((value, index) => (
                <circle key={value} cx={20 + index * 96} cy={175 - index * 28} r="6" fill="#f5f5f5" />
              ))}
            </svg>
          </div>
          <div className="load-list">
            {loadProgress.map((item) => (
              <div key={item.name} className="load-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.start}kg &rarr; {item.current}kg</span>
                </div>
                <em>+{item.current - item.start}kg</em>
                <div className="silver-bar"><span style={{ width: `${item.percent}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="student-progress-card records-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Seus recordes</p>
              <h2>Marcas pessoais</h2>
            </div>
            <Medal size={22} />
          </div>
          <div className="record-grid">
            {records.map(([label, value, detail]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{detail}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="student-progress-card consistency-card">
          <p className="eyebrow">Streak e consistencia</p>
          <strong>18 <span>dias seguidos</span></strong>
          <div className="week-dots">
            {["S", "T", "Q", "Q", "S", "S", "D"].map((day) => <span key={day}>{day}</span>)}
          </div>
          <ul>
            <li><Flame size={17} /> Frequencia semanal: 5 treinos</li>
            <li><BadgeCheck size={17} /> Treinos concluidos: 31</li>
            <li><LineChart size={17} /> Consistencia mensal: 89%</li>
          </ul>
        </article>
      </section>

      <section className="student-progress-grid student-progress-grid-middle">
        <article className="student-progress-card body-evolution-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Evolução corporal</p>
              <h2>Ultimos 6 meses</h2>
            </div>
            <span>Peso / gordura / massa magra</span>
          </div>
          <svg className="body-chart" viewBox="0 0 640 260" role="img" aria-label="Grafico corporal">
            <polyline points="36,60 146,83 256,105 366,128 476,158 604,188" fill="none" stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" />
            <polyline points="36,178 146,164 256,150 366,132 476,112 604,94" fill="none" stroke="rgba(192,192,192,0.55)" strokeWidth="3" strokeDasharray="8 9" />
            <polyline points="36,110 146,126 256,140 366,152 476,165 604,178" fill="none" stroke="rgba(120,120,120,0.8)" strokeWidth="3" />
            {bodyEvolution.map((value, index) => <circle key={value} cx={36 + index * 114} cy={60 + index * 26} r="6" fill="#f5f5f5" />)}
          </svg>
          <div className="chart-legend-premium">
            <span>Peso</span><span>Gordura corporal</span><span>Massa magra</span><span>IMC</span>
          </div>
        </article>

        <article className="student-progress-card visual-progress-student">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Evolução visual</p>
              <h2>Fotos comparativas</h2>
            </div>
            <Camera size={21} />
          </div>
          <div className="visual-photo-grid">
            {["Frontal", "Lateral", "Traseira"].map((label) => (
              <figure key={label}>
                <img src={avatar} alt={`${label} da avaliação`} />
                <figcaption>{label}</figcaption>
              </figure>
            ))}
          </div>
          <button type="button" onClick={() => setModal("evolution")}>Comparar antes/depois</button>
        </article>

        <article className="student-progress-card measures-card-student">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Medidas corporais</p>
              <h2>Detalhes em cm</h2>
            </div>
            <span>Atual x anterior</span>
          </div>
          {measures.map(([label, value, diff]) => (
            <div key={label} className="measure-row-student">
              <span>{label}</span>
              <strong>{value}</strong>
              <em className={diff.startsWith("+") ? "up" : "down"}>{diff}</em>
            </div>
          ))}
        </article>
      </section>

      <section className="student-progress-grid student-progress-grid-bottom">
        <article className="student-progress-card diet-progress-card-student">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Progresso da dieta</p>
              <h2>Alimentacao e hidratacao</h2>
            </div>
            <Utensils size={22} />
          </div>
          <div className="diet-progress-metrics">
            <div><strong>87%</strong><span>Aderencia alimentar</span></div>
            <div><strong>128g</strong><span>Proteinas medias</span></div>
            <div><strong>2,1L</strong><span>Hidratacao media</span></div>
            <div><strong>1.812</strong><span>Calorias medias</span></div>
          </div>
          <div className="silver-bar"><span style={{ width: "87%" }} /></div>
        </article>

        <article className="student-progress-card ai-insights-student">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Insights da IA</p>
              <h2>Coach IA analisou sua evolução</h2>
            </div>
            <Sparkles size={22} />
          </div>
          <ul>
            <li>Você aumentou 60kg no leg press desde o inicio do ciclo.</li>
            <li>Sua forca geral subiu 18% nos principais exercicios.</li>
            <li>Sua consistencia esta acima da media dos alunos premium.</li>
            <li>Continue priorizando agua e proteina para manter a evolução.</li>
          </ul>
          <button type="button" onClick={() => setModal("coach")}>Perguntar ao Coach IA</button>
        </article>
      </section>
      {modal && (
        <div className="progress-modal-backdrop" role="presentation" onMouseDown={() => setModal(null)}>
          <article className="progress-action-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setModal(null)}>Fechar</button>
            <p className="eyebrow">{modal === "coach" ? "Coach IA" : modal === "evolution" ? "EvoluÃ§Ã£o visual" : "AnÃ¡lise completa"}</p>
            <h2>{modal === "coach" ? "Como posso te ajudar hoje?" : modal === "evolution" ? "Comparativo antes/depois" : "Resumo da sua evoluÃ§Ã£o"}</h2>
            {modal === "coach" ? (
              <div className="coach-question-grid">
                <button type="button">Como melhorar minha forÃ§a?</button>
                <button type="button">O que ajustar na dieta?</button>
                <button type="button">Estou evoluindo bem?</button>
                <button type="button">Como manter a consistÃªncia?</button>
              </div>
            ) : modal === "evolution" ? (
              <div className="progress-before-after">
                <img src={avatar} alt="Antes" />
                <span>â†’</span>
                <img src={avatar} alt="Depois" />
                <p>ReduÃ§Ã£o de gordura, melhora de postura e aumento de massa magra no ciclo atual.</p>
              </div>
            ) : (
              <ul className="progress-analysis-list">
                <li>ForÃ§a geral: +18% nos exercÃ­cios principais.</li>
                <li>Carga no leg press: +60kg desde o inÃ­cio.</li>
                <li>AderÃªncia alimentar: 87%, acima da mÃ©dia.</li>
                <li>PrÃ³ximo foco: manter proteÃ­na e melhorar hidrataÃ§Ã£o.</li>
              </ul>
            )}
          </article>
        </div>
      )}
    </section>
  );
}