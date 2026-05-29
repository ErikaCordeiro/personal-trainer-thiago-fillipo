import React from "react";
import { Clock, Dumbbell, Repeat, ShieldCheck } from "lucide-react";

function canEmbedYoutube(videoUrl) {
  return videoUrl?.includes("youtube.com/embed/");
}

function toYoutubeWatchUrl(videoUrl) {
  if (!videoUrl) return "";
  return videoUrl.replace("/embed/", "/watch?v=");
}

export default function ExerciseDetail({ exercise }) {
  return (
    <section className="exercise-detail">
      <div className="video-panel">
        {canEmbedYoutube(exercise.videoUrl) ? (
          <iframe
            src={exercise.videoUrl}
            title={exercise.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="video-fallback">
            <strong>Video recomendado disponivel</strong>
            <span>Abra no YouTube para assistir a recomendacao do instrutor.</span>
            <a href={toYoutubeWatchUrl(exercise.videoUrl)} target="_blank" rel="noreferrer">Abrir video</a>
          </div>
        )}
      </div>
      <aside className="exercise-info">
        <p className="eyebrow">Execução técnica</p>
        <h2>{exercise.name}</h2>
        <p>{exercise.explanation}</p>
        <div className="metric-stack">
          <span><ShieldCheck size={18} /> {exercise.sets} séries</span>
          <span><Repeat size={18} /> {exercise.reps} repetições</span>
          <span><Clock size={18} /> {exercise.rest} descanso</span>
          <span><Dumbbell size={18} /> {exercise.load || "Carga ajustável"}</span>
        </div>
      </aside>
    </section>
  );
}
