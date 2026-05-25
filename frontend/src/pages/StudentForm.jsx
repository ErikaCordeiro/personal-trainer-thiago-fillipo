import React from "react";
import { Save } from "lucide-react";

export default function StudentForm({ onSave }) {
  const submit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSave({
      name: form.get("name"),
      email: form.get("email"),
      age: Number(form.get("age")),
      weight: Number(form.get("weight")),
      height: Number(form.get("height")),
      objective: form.get("objective"),
      notes: form.get("notes")
    });
    event.currentTarget.reset();
  };

  return (
    <form className="form-panel" onSubmit={submit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Novo perfil</p>
          <h2>Dados do aluno</h2>
        </div>
        <button className="metal-button inline" type="submit"><Save size={18} /> Salvar aluno</button>
      </div>
      <div className="form-grid">
        <label><span>Nome</span><input name="name" required placeholder="Nome completo" /></label>
        <label><span>Email</span><input name="email" type="email" required placeholder="aluno@email.com" /></label>
        <label><span>Idade</span><input name="age" type="number" min="12" max="100" required /></label>
        <label><span>Peso</span><input name="weight" type="number" min="30" step="0.1" required /></label>
        <label><span>Altura</span><input name="height" type="number" min="1" max="2.5" step="0.01" required /></label>
        <label><span>Objetivo</span><input name="objective" required placeholder="Hipertrofia, definição, performance..." /></label>
        <label className="wide"><span>Observações</span><textarea name="notes" rows="5" placeholder="Lesões, limitações, rotina, preferências e estratégia." /></label>
      </div>
    </form>
  );
}
