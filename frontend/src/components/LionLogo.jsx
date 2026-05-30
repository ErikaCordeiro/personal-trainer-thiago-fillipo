import React from "react";

export default function LionLogo({ compact = false, hero = false }) {
  return (
    <div className={`lion-logo ${compact ? "compact" : ""} ${hero ? "hero" : ""}`} aria-label="Personal Thiago Filippo">
      <div className="lion-mark">
        <img src="/lion-juda-logo.png" alt="LeÃ£o de JudÃ¡" />
      </div>
      {!compact && (
        <div className="brand-lockup">
          <span>Personal</span>
          <strong>Thiago Filippo</strong>
          <small>Disciplina â€¢ Foco â€¢ PropÃ³sito</small>
        </div>
      )}
    </div>
  );
}
