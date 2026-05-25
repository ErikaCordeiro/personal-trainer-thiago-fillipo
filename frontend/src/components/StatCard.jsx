import React from "react";

export default function StatCard({ label, value, detail, icon: Icon }) {
  return (
    <article className="stat-card">
      <div className="stat-icon">{Icon && <Icon size={22} />}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}
