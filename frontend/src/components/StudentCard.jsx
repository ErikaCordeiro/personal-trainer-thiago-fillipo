import React from "react";
import { LineChart, Mail, Target } from "lucide-react";

export default function StudentCard({ student, onOpen, onOpenProgress }) {
  const hasAccess = student.accessApproved !== false && student.status !== "pending";

  return (
    <article className="student-card" onClick={onOpen}>
      <img src={student.avatar} alt={student.name} />
      <div className="student-card-body">
        <div>
          <h3>{student.name}</h3>
          <span>{student.age} anos - {student.weight} kg - {student.height} m</span>
        </div>
        <span className={`student-access-badge ${hasAccess ? "approved" : "pending"}`}>
          {hasAccess ? "Acesso liberado" : "Aguardando liberacao"}
        </span>
        <p><Target size={15} /> {student.objective}</p>
        <p><Mail size={15} /> {student.email}</p>
        <div className="mini-progress">
          <span style={{ width: `${student.adherence}%` }} />
        </div>
        {onOpenProgress && (
          <button
            className="student-progress-link"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenProgress(student);
            }}
          >
            <LineChart size={15} />
            Ver progresso
          </button>
        )}
      </div>
    </article>
  );
}
