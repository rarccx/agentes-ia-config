CREATE TABLE IF NOT EXISTS ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  task text NOT NULL CHECK (task IN ('marketing_copy', 'schedule_insight')),
  input_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_generations_clinic_created_idx ON ai_generations (clinic_id, created_at DESC);
