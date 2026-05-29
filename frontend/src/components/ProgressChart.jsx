import React, { useState } from "react";

const tabs = ["Peso", "Gordura corporal", "Massa magra"];

export default function ProgressChart({ data }) {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const source = data.length ? data : [
    { label: "Jan", adherence: 72, body: 68, strength: 64 },
    { label: "Fev", adherence: 76, body: 72, strength: 70 },
    { label: "Mar", adherence: 80, body: 74, strength: 76 },
    { label: "Abr", adherence: 84, body: 80, strength: 82 },
    { label: "Mai", adherence: 88, body: 84, strength: 89 },
    { label: "Jun", adherence: 92, body: 88, strength: 94 }
  ];
  const points = source.length >= 6
    ? source.slice(-6)
    : [{ label: "Dez", adherence: 70, body: 62, strength: 58 }, ...source].slice(-6);
  const metricKey = activeTab === "Peso" ? "adherence" : activeTab === "Gordura corporal" ? "body" : "strength";
  const coordinates = points.map((item, index) => {
    const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
    const y = 100 - Math.min(100, Math.max(0, item[metricKey]));
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="chart-card evolution-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Evolução</p>
          <h2>Evolução</h2>
        </div>
        <span className="chart-period">Últimos 6 meses</span>
        <div className="chart-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="line-chart" aria-label={`Gráfico de ${activeTab}`}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img">
          <defs>
            <linearGradient id="lineGlow" x1="0" x2="1" y1="0" y2="0">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#E5E5E5" />
            </linearGradient>
          </defs>
          <polyline className="chart-area" points={`0,100 ${coordinates} 100,100`} />
          <polyline className="chart-line" points={coordinates} />
          {points.map((item, index) => {
            const [x, y] = coordinates.split(" ")[index].split(",");
            return <circle key={item.label} cx={x} cy={y} r="1.8" />;
          })}
        </svg>
        <div className="chart-months">
          {points.map((item) => <span key={item.label}>{item.label}</span>)}
        </div>
      </div>
    </div>
  );
}
