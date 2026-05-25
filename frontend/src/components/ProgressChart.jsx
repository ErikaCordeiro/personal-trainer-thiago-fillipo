import React from "react";

export default function ProgressChart({ data }) {
  const max = 100;

  return (
    <div className="chart-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Evolução</p>
          <h2>Progresso físico</h2>
        </div>
        <span className="status-pill">Últimos 5 meses</span>
      </div>
      <div className="bar-chart" aria-label="Gráfico de progresso">
        {data.map((item) => (
          <div className="bar-group" key={item.label}>
            <div className="bar-track">
              <span style={{ height: `${(item.strength / max) * 100}%` }} />
              <span style={{ height: `${(item.adherence / max) * 100}%` }} />
              <span style={{ height: `${(item.body / max) * 100}%` }} />
            </div>
            <small>{item.label}</small>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <span><i className="legend-silver" />Força</span>
        <span><i className="legend-white" />Aderência</span>
        <span><i className="legend-dark" />Composição</span>
      </div>
    </div>
  );
}
