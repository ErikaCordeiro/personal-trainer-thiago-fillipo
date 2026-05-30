import React from "react";
import { useEffect, useMemo, useState } from "react";
import PersonalLayout from "./layouts/PersonalLayout.jsx";
import StudentLayout from "./layouts/StudentLayout.jsx";
import Login from "./pages/Login.jsx";
import StudentDashboard from "./pages/Dashboard.jsx";
import PersonalDashboard from "./pages/PersonalDashboard.jsx";
import Students from "./pages/Students.jsx";
import WorkoutBuilder from "./pages/WorkoutBuilder.jsx";
import ExerciseDetail from "./pages/ExerciseDetail.jsx";
import StudentPortal from "./pages/StudentPortal.jsx";
import WorkoutExecution from "./pages/WorkoutExecution.jsx";
import Progress from "./pages/Progress.jsx";
import StudentDiet from "./pages/StudentDiet.jsx";
import StudentAssessments from "./pages/StudentAssessments.jsx";
import PersonalDiet from "./pages/PersonalDiet.jsx";
import PersonalAssessments from "./pages/PersonalAssessments.jsx";
import PersonalProgress from "./pages/PersonalProgress.jsx";
import PersonalStudentProgress from "./pages/PersonalStudentProgress.jsx";
import CoachIA from "./pages/CoachIA.jsx";
import AboutPersonal from "./pages/AboutPersonal.jsx";
import { students as mockStudents, workouts as mockWorkouts } from "./data/mockData.js";

const pageMeta = {
  dashboard: ["Dashboard", "Disciplina hoje, liberdade amanhÃ£."],
  students: ["Alunos", "Visualize, encontre e edite seus atletas com rapidez."],
  "workout-builder": ["Treinos", "Monte protocolos personalizados com vÃ­deo, carga e descanso."],
  exercise: ["ExercÃ­cio", "ExecuÃ§Ã£o guiada com parÃ¢metros claros e vÃ­deo incorporado."],
  "student-view": ["Treino", "Treino do dia, check-ins e registro de carga."],
  diet: ["Dietas", "Gestao alimentar, hidratacao e registros nutricionais dos alunos."],
  assessments: ["AvaliaÃ§Ãµes", "Registre, acompanhe e analise a evoluÃ§Ã£o fÃ­sica dos seus alunos."],
  progress: ["Progresso", "HistÃ³rico, evoluÃ§Ã£o e indicadores de consistÃªncia."],
  "student-progress-detail": ["Progresso individual", "Central individual de performance do aluno."],
  coach: ["Coach IA", "Seu assistente inteligente para treino, dieta e evoluÃ§Ã£o."],
  "about-personal": ["Sobre o Personal", "ConheÃ§a a metodologia, experiÃªncia e filosofia do Thiago Filippo."]
};

const rolePath = {
  personal: "/dashboard/personal",
  student: "/dashboard/aluno"
};

function pushRoute(role) {
  const path = rolePath[role] || rolePath.personal;
  window.history.replaceState(null, "", path);
}

export default function App() {
  const [session, setSession] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedExercise, setSelectedExercise] = useState(mockWorkouts[0].exercises[0]);
  const [students, setStudents] = useState(mockStudents);
  const [pendingStudents, setPendingStudents] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ptf_pending_students") || "[]");
    } catch {
      return [];
    }
  });
  const [workouts, setWorkouts] = useState(mockWorkouts);
  const [completed, setCompleted] = useState(() => new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [executionWorkoutId, setExecutionWorkoutId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(mockStudents[0]?.id);
  const [personalProfile, setPersonalProfile] = useState({
    name: "Thiago Filippo",
    bio: "Personal trainer focado em forÃ§a, disciplina, performance e transformaÃ§Ã£o real. Une estratÃ©gia, tÃ©cnica e acompanhamento prÃ³ximo para cada aluno evoluir com seguranÃ§a.",
    specialty: "Hipertrofia, emagrecimento e performance",
    experience: "10+ anos de atuaÃ§Ã£o",
    method: "Disciplina, foco e propÃ³sito",
    philosophy: "Treinar nÃ£o Ã© apenas cumprir exercÃ­cios. Ã‰ construir uma versÃ£o mais forte, constante e confiante todos os dias.",
    highlights: ["Treinos personalizados", "Acompanhamento de evoluÃ§Ã£o", "Ajustes por performance", "Feedback inteligente", "EstratÃ©gia individual por objetivo"],
    email: "contato@thiagofilippo.com",
    instagram: "@personal.thiagofilippo"
  });

  const meta = pageMeta[activePage] || pageMeta.dashboard;
  const activeWorkout = useMemo(() => workouts[0], [workouts]);

  useEffect(() => {
    localStorage.setItem("ptf_pending_students", JSON.stringify(pendingStudents));
  }, [pendingStudents]);

  if (!session) {
    return (
      <Login
        onSignup={(student) => {
          setPendingStudents((current) => [
            { ...student, id: crypto.randomUUID(), status: "pending", requestedAt: new Date().toISOString() },
            ...current
          ]);
        }}
        onLogin={(user) => {
          const normalizedRole = user.role === "student" || user.role === "aluno" ? "student" : "personal";
          const normalizedUser = { ...user, role: normalizedRole };
          setSession(normalizedUser);
          setActivePage("dashboard");
          pushRoute(normalizedRole);
        }}
      />
    );
  }

  const isStudent = session.role === "student";
  const navigate = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
    if (page !== "workout-execution") {
      setExecutionWorkoutId(null);
    }
    if (page === "coach") {
      window.history.replaceState(null, "", isStudent ? "/aluno/coach-ia" : "/personal/coach-ia");
    } else if (page === "about-personal") {
      window.history.replaceState(null, "", isStudent ? "/aluno/sobre-o-personal" : "/personal/sobre-o-personal");
    } else if (isStudent && page === "progress") {
      window.history.replaceState(null, "", "/aluno/progresso");
    } else if (isStudent && page === "diet") {
      window.history.replaceState(null, "", "/aluno/dieta");
    } else if (isStudent && page === "assessments") {
      window.history.replaceState(null, "", "/aluno/avaliacao");
    } else if (!isStudent && page === "diet") {
      window.history.replaceState(null, "", "/dashboard/personal/dietas");
    } else if (!isStudent && page === "assessments") {
      window.history.replaceState(null, "", "/personal/avaliacoes");
    } else if (!isStudent && page === "progress") {
      window.history.replaceState(null, "", "/personal/progresso");
    } else if (!isStudent && page === "student-progress-detail") {
      window.history.replaceState(null, "", `/personal/aluno/${selectedStudentId || "aluno"}/progresso`);
    } else {
      pushRoute(isStudent ? "student" : "personal");
    }
  };

  const openWorkoutExecution = (workoutId) => {
    resetWorkoutProgress(workoutId);
    setExecutionWorkoutId(workoutId);
    setActivePage("workout-execution");
    setSidebarOpen(false);
    window.history.replaceState(null, "", `/aluno/treino/${workoutId}`);
  };

  const resetWorkoutProgress = (workoutId) => {
    const workout = workouts.find((item) => item.id === workoutId) || activeWorkout;
    const exerciseIds = new Set(workout.exercises.map((exercise) => exercise.id));
    setCompleted((current) => {
      const next = new Set(current);
      exerciseIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const openStudentProgress = (student) => {
    setSelectedStudentId(student.id);
    setActivePage("student-progress-detail");
    setSidebarOpen(false);
    window.history.replaceState(null, "", `/personal/aluno/${student.id}/progresso`);
  };

  const commonLayoutProps = {
    activePage,
    meta,
    onNavigate: navigate,
    onLogout: () => {
      setSession(null);
      window.history.replaceState(null, "", "/");
    },
    session,
    sidebarOpen,
    setSidebarOpen,
    student: students[0]
  };

  const sharedPages = (
    <>
      {activePage === "exercise" && <ExerciseDetail exercise={selectedExercise} />}
      {activePage === "student-view" && (
        <StudentPortal
          workout={activeWorkout}
          workouts={workouts}
          completed={completed}
          onStartWorkout={openWorkoutExecution}
          onToggleExercise={(id) => {
            setCompleted((current) => {
              const next = new Set(current);
              next.has(id) ? next.delete(id) : next.add(id);
              return next;
            });
          }}
        />
      )}
      {activePage === "workout-execution" && (
        <WorkoutExecution
          workout={workouts.find((item) => item.id === executionWorkoutId) || activeWorkout}
          completed={completed}
          onBack={() => navigate("student-view")}
          onToggleExercise={(id) => {
            setCompleted((current) => {
              const next = new Set(current);
              next.has(id) ? next.delete(id) : next.add(id);
              return next;
            });
          }}
          onFinishWorkout={() => resetWorkoutProgress(executionWorkoutId)}
        />
      )}
      {isStudent && activePage === "progress" && <Progress student={students[0]} students={students} workouts={workouts} completed={completed} />}
      {activePage === "coach" && (
        <CoachIA
          role={isStudent ? "student" : "personal"}
          student={students[0]}
          onClose={() => navigate("dashboard")}
        />
      )}
      {activePage === "about-personal" && (
        <AboutPersonal
          profile={personalProfile}
          editable={!isStudent}
          onSave={setPersonalProfile}
        />
      )}
    </>
  );

  if (isStudent) {
    return (
      <StudentLayout {...commonLayoutProps}>
        {activePage === "dashboard" && <StudentDashboard students={students} workouts={workouts} onNavigate={navigate} />}
        {activePage === "diet" && <StudentDiet student={students[0]} />}
        {activePage === "assessments" && <StudentAssessments student={students[0]} />}
        {sharedPages}
      </StudentLayout>
    );
  }

  return (
    <PersonalLayout {...commonLayoutProps}>
      {activePage === "dashboard" && <PersonalDashboard students={students} workouts={workouts} onNavigate={navigate} />}
      {activePage === "diet" && <PersonalDiet students={students} />}
      {activePage === "assessments" && <PersonalAssessments students={students} />}
      {activePage === "progress" && <PersonalProgress students={students} onOpenStudentProgress={openStudentProgress} />}
      {activePage === "student-progress-detail" && (
        <PersonalStudentProgress
          student={students.find((student) => student.id === selectedStudentId) || students[0]}
          onBack={() => navigate("students")}
        />
      )}
      {activePage === "students" && (
        <Students
          students={students}
          pendingStudents={pendingStudents}
          workouts={workouts}
          onOpenProgress={openStudentProgress}
          onApproveStudent={(student) => {
            setStudents((current) => [
              {
                ...student,
                avatar: mockStudents[0].avatar,
                adherence: 0,
                workoutIds: student.workoutIds || [],
                workoutId: student.workoutId || null,
                status: "active"
              },
              ...current
            ]);
            setPendingStudents((current) => current.filter((item) => item.id !== student.id));
          }}
          onSaveStudent={(student) => {
            setStudents((current) => {
              if (student.id) {
                return current.map((item) => item.id === student.id ? { ...item, ...student } : item);
              }
              return [
                { ...student, id: crypto.randomUUID(), avatar: mockStudents[0].avatar, adherence: 0, workoutIds: student.workoutIds || [] },
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
      {sharedPages}
    </PersonalLayout>
  );
}
