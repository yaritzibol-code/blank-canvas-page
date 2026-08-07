CREATE TABLE public.yaris_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  seccion text,
  materia text,
  tono text,
  fuente text NOT NULL DEFAULT 'chat',
  pre_answer boolean NOT NULL DEFAULT false,
  question_text text,
  pregunta text NOT NULL DEFAULT '',
  respuesta text NOT NULL DEFAULT '',
  tokens_in integer NOT NULL DEFAULT 0,
  tokens_out integer NOT NULL DEFAULT 0,
  latency_ms integer NOT NULL DEFAULT 0,
  success boolean NOT NULL DEFAULT true,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.yaris_messages TO authenticated;
GRANT ALL ON public.yaris_messages TO service_role;

ALTER TABLE public.yaris_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "yaris_messages_select_own_or_admin"
  ON public.yaris_messages FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE INDEX yaris_messages_created_idx ON public.yaris_messages (created_at DESC);
CREATE INDEX yaris_messages_user_idx ON public.yaris_messages (user_id, created_at DESC);