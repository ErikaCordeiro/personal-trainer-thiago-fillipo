import React, { useState } from "react";
import { Award, CheckCircle2, Dumbbell, Edit3, Instagram, Mail, Save, Star, Target } from "lucide-react";

export default function AboutPersonal({ profile, editable = false, onSave }) {
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(false);
  const data = editing ? draft : profile;

  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const save = () => {
    onSave?.(draft);
    setEditing(false);
  };

  return (
    <section className="about-personal-page">
      <article className="about-personal-hero">
        <div>
          <p className="eyebrow">Sobre o Personal</p>
          {editing ? (
            <input className="about-title-input" value={draft.name} onChange={(event) => update("name", event.target.value)} />
          ) : <h2>{data.name}</h2>}
          {editing ? (
            <textarea value={draft.bio} onChange={(event) => update("bio", event.target.value)} />
          ) : <p>{data.bio}</p>}
          <div className="about-personal-actions">
            {editable && !editing && <button type="button" onClick={() => setEditing(true)}><Edit3 size={18} /> Editar informações</button>}
            {editable && editing && <button type="button" onClick={save}><Save size={18} /> Salvar página</button>}
          </div>
        </div>
        <img src="/lion-juda-logo.png" alt="Leão de Judá" />
      </article>

      <section className="about-personal-grid">
        <article>
          <Award size={24} />
          <span>Especialidade</span>
          {editing ? <input value={draft.specialty} onChange={(event) => update("specialty", event.target.value)} /> : <strong>{data.specialty}</strong>}
        </article>
        <article>
          <Star size={24} />
          <span>Experiência</span>
          {editing ? <input value={draft.experience} onChange={(event) => update("experience", event.target.value)} /> : <strong>{data.experience}</strong>}
        </article>
        <article>
          <Target size={24} />
          <span>Método</span>
          {editing ? <input value={draft.method} onChange={(event) => update("method", event.target.value)} /> : <strong>{data.method}</strong>}
        </article>
      </section>

      <section className="about-personal-content">
        <article className="about-card-large">
          <p className="eyebrow">Filosofia</p>
          {editing ? <textarea value={draft.philosophy} onChange={(event) => update("philosophy", event.target.value)} /> : <h3>{data.philosophy}</h3>}
        </article>
        <article className="about-card-large">
          <p className="eyebrow">O que você encontra aqui</p>
          <ul>
            {(data.highlights || []).map((item, index) => (
              <li key={`${item}-${index}`}><CheckCircle2 size={18} /> {item}</li>
            ))}
          </ul>
          {editing && (
            <textarea
              value={(draft.highlights || []).join("\n")}
              onChange={(event) => update("highlights", event.target.value.split("\n").filter(Boolean))}
            />
          )}
        </article>
      </section>

      <section className="about-contact-card">
        <div><Dumbbell size={22} /><span>Personal Thiago Filippo</span></div>
        <div><Mail size={20} /><span>{data.email}</span></div>
        <div><Instagram size={20} /><span>{data.instagram}</span></div>
      </section>
    </section>
  );
}
