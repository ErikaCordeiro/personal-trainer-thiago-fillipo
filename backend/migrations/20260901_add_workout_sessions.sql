ALTER TABLE workout_exercises ADD COLUMN IF NOT EXISTS set_type VARCHAR(24) NOT NULL DEFAULT 'standard';
ALTER TABLE workout_exercises ADD COLUMN IF NOT EXISTS technique_config JSON NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS workout_sessions (
    id UUID PRIMARY KEY,
    client_session_id VARCHAR(180) NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id),
    personal_id UUID NOT NULL REFERENCES users(id),
    workout_ref VARCHAR(180) NOT NULL,
    workout_name VARCHAR(160) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'em_andamento',
    started_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    current_exercise_id VARCHAR(180) NULL,
    progress JSON NOT NULL DEFAULT '{}',
    exercises JSON NOT NULL DEFAULT '[]',
    feedback JSON NULL,
    client_updated_at TIMESTAMPTZ NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_workout_session_student_client UNIQUE (student_id, client_session_id)
);

CREATE INDEX IF NOT EXISTS ix_workout_sessions_student_id ON workout_sessions(student_id);
CREATE INDEX IF NOT EXISTS ix_workout_sessions_personal_id ON workout_sessions(personal_id);
CREATE INDEX IF NOT EXISTS ix_workout_sessions_workout_ref ON workout_sessions(workout_ref);
CREATE INDEX IF NOT EXISTS ix_workout_sessions_status ON workout_sessions(status);

CREATE TABLE IF NOT EXISTS progression_alerts (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id),
    exercise_ref VARCHAR(180) NOT NULL,
    exercise_name VARCHAR(180) NOT NULL,
    kind VARCHAR(40) NOT NULL DEFAULT 'load_stagnation',
    signature VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    last_notified_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_progression_alert_student_exercise UNIQUE (student_id, exercise_ref, kind)
);

CREATE INDEX IF NOT EXISTS ix_progression_alerts_student_id ON progression_alerts(student_id);
