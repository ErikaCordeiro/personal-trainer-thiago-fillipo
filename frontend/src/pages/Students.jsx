import React from "react";
import { Plus, Save, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import StudentCard from "../components/StudentCard.jsx";

export default function Students({ students, workouts, onSaveStudent }) {
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const filtered = useMemo(
    () => students.filter((student) => `${student.name} ${student.objective}`.toLowerCase().includes(query.toLowerCase())),
    [students, query]
  );

  const submit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSaveStudent({
      id: editingStudent?.id,
      name: form.get("name"),
      email: form.get("email"),
      age: Number(form.get("age")),
      weight: Number(form.get("weight")),
      height: Number(form.get("height")),
      objective: form.get("objective"),
      notes: form.get("notes"),
      workoutId: form.get("workoutId") || null
    });
    setIsModalOpen(false);
    setEditingStudent(null);
    event.currentTarget.reset();
  };

  const openNewStudent = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const openEditStudent = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  return (
    <>
      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Gestao de alunos</p>
            <h2>Lista de alunos</h2>
          </div>
          <div className="section-actions">
            <label className="search-shell compact-search">
              <Search size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar aluno" />
            </label>
            <button className="metal-button inline" type="button" onClick={openNewStudent}>
              <Plus size={18} /> Adicionar aluno
            </button>
          </div>
        </div>
        <div className="students-grid">
          {filtered.map((student) => (
            <StudentCard key={student.id} student={student} onOpen={() => openEditStudent(student)} />
          ))}
        </div>
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={editingStudent ? "Editar aluno" : "Adicionar aluno"}>
          <form className="student-modal" onSubmit={submit}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">{editingStudent ? "Editar aluno" : "Novo aluno"}</p>
                <h2>{editingStudent ? "Editar aluno" : "Adicionar aluno"}</h2>
              </div>
              <button className="icon-button" type="button" aria-label="Fechar" onClick={() => { setIsModalOpen(false); setEditingStudent(null); }}>
                <X size={19} />
              </button>
            </div>
            <div className="form-grid">
              <label><span>Nome</span><input name="name" required placeholder="Nome completo" defaultValue={editingStudent?.name || ""} /></label>
              <label><span>Email</span><input name="email" type="email" required placeholder="aluno@email.com" defaultValue={editingStudent?.email || ""} /></label>
              <label><span>Idade</span><input name="age" type="number" min="12" max="100" required defaultValue={editingStudent?.age || ""} /></label>
              <label><span>Peso</span><input name="weight" type="number" min="30" step="0.1" required defaultValue={editingStudent?.weight || ""} /></label>
              <label><span>Altura</span><input name="height" type="number" min="1" max="2.5" step="0.01" required defaultValue={editingStudent?.height || ""} /></label>
              <label><span>Objetivo</span><input name="objective" required placeholder="Hipertrofia, definicao, performance..." defaultValue={editingStudent?.objective || ""} /></label>
              <label className="wide">
                <span>Treino do aluno</span>
                <select name="workoutId" defaultValue={editingStudent?.workoutId || ""}>
                  <option value="">Selecionar depois</option>
                  {workouts.map((workout) => (
                    <option key={workout.id} value={workout.id}>{workout.name} - {workout.focus}</option>
                  ))}
                </select>
              </label>
              <label className="wide">
                <span>Observacoes</span>
                <textarea name="notes" rows="4" placeholder="Lesoes, limitacoes, rotina, preferencias e estrategia." defaultValue={editingStudent?.notes || ""} />
              </label>
            </div>
            <div className="modal-actions">
              <button className="ghost-button" type="button" onClick={() => { setIsModalOpen(false); setEditingStudent(null); }}>Cancelar</button>
              <button className="metal-button inline" type="submit"><Save size={18} /> {editingStudent ? "Salvar edicao" : "Salvar aluno"}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
