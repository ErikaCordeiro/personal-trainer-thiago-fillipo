import React from "react";
import { Mail, Target } from "lucide-react";

export default function StudentCard({ student, onOpen }) {
  return (
    <article className="student-card" onClick={onOpen}>
      <img src={student.avatar} alt={student.name} />
      <div className="student-card-body">
        <div>
          <h3>{student.name}</h3>
          <span>{student.age} anos · {student.weight} kg · {student.height} m</span>
        </div>
        <p><Target size={15} /> {student.objective}</p>
        <p><Mail size={15} /> {student.email}</p>
        <div className="mini-progress">
          <span style={{ width: `${student.adherence}%` }} />
        </div>
      </div>
    </article>
  );
}
