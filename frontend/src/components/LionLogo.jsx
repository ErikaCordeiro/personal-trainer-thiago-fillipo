import React from "react";

export default function LionLogo({ compact = false, hero = false }) {
  return (
    <div className={`lion-logo ${compact ? "compact" : ""} ${hero ? "hero" : ""}`} aria-label="Personal Thiago Filippo">
      <div className="lion-mark">
        <img src="/lion-juda-logo.png" alt="Leão de Judá" />
      </div>
      {!compact && (
        <div className="brand-lockup">
          <span>Personal</span>
          <strong>Thiago Filippo</strong>
          <small>Disciplina • Foco • Propósito</small>
        </div>
      )}
    </div>
  );
}
