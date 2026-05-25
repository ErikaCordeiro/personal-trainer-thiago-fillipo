import React from "react";
import { useMemo, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Students from "./pages/Students.jsx";
import WorkoutBuilder from "./pages/WorkoutBuilder.jsx";
import ExerciseDetail from "./pages/ExerciseDetail.jsx";
import StudentPortal from "./pages/StudentPortal.jsx";
import Progress from "./pages/Progress.jsx";
import { students as mockStudents, workouts as mockWorkouts } from "./data/mockData.js";

const pageMeta = {
  dashboard: ["Dashboard do Personal", "Controle a operação do estúdio em tempo real."],
  students: ["Alunos", "Visualize, encontre e edite seus atletas com rapidez."],
  "workout-builder": ["Criação de Treino", "Monte protocolos personalizados com vídeo, carga e descanso."],
  exercise: ["Exercício", "Execução guiada com parâmetros claros e vídeo incorporado."],
  "student-view": ["Área do Aluno", "Treino do dia, check-ins e registro de carga."],
  progress: ["Progresso", "Histórico, evolução e indicadores de consistência."]
};

export default function App() {
  const [session, setSession] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedExercise, setSelectedExercise] = useState(mockWorkouts[0].exercises[0]);
  const [students, setStudents] = useState(mockStudents);
  const [workouts, setWorkouts] = useState(mockWorkouts);
  const [completed, setCompleted] = useState(() => new Set(["ex-001"]));

  const meta = pageMeta[activePage] || pageMeta.dashboard;
  const activeWorkout = useMemo(() => workouts[0], [workouts]);

  if (!session) {
    return (
      <Login
        onLogin={(user) => {
          setSession(user);
          if (user.role === "student") {
            setActivePage("student-view");
          }
        }}
      />
    );
  }

  const navigate = (page) => setActivePage(page);

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={navigate} />
      <main className="main-panel">
        <Header title={meta[0]} subtitle={meta[1]} user={session} onLogout={() => setSession(null)} />
        {activePage === "dashboard" && (
          <Dashboard students={students} workouts={workouts} onNavigate={navigate} />
        )}
        {activePage === "students" && (
          <Students
            students={students}
            workouts={workouts}
            onSaveStudent={(student) => {
              setStudents((current) => {
                if (student.id) {
                  return current.map((item) => item.id === student.id ? { ...item, ...student } : item);
                }
                return [
                  { ...student, id: crypto.randomUUID(), avatar: mockStudents[0].avatar, adherence: 0 },
                  ...current
                ];
              });
            }}
          />
        )}
        {activePage === "workout-builder" && (
          <WorkoutBuilder
            students={students}
            workouts={workouts}
            onOpenExercise={(exercise) => {
              setSelectedExercise(exercise);
              navigate("exercise");
            }}
            onSaveWorkout={(workout) => {
              setWorkouts((current) => {
                const exists = current.some((item) => item.id === workout.id);
                return exists
                  ? current.map((item) => item.id === workout.id ? workout : item)
                  : [workout, ...current];
              });
            }}
          />
        )}
        {activePage === "exercise" && <ExerciseDetail exercise={selectedExercise} />}
        {activePage === "student-view" && (
          <StudentPortal
            workout={activeWorkout}
            completed={completed}
            onToggleExercise={(id) => {
              setCompleted((current) => {
                const next = new Set(current);
                next.has(id) ? next.delete(id) : next.add(id);
                return next;
              });
            }}
          />
        )}
        {activePage === "progress" && <Progress students={students} workouts={workouts} completed={completed} />}
      </main>
    </div>
  );
}
