-- Apply before deploying the practice integrations. Historical ledger rows are untouched.
INSERT INTO public.fp_rules_history(key, old_value, new_value)
SELECT key, value, jsonb_set(value, '{fp}', to_jsonb(CASE key WHEN 'learning_path' THEN 20 ELSE 100 END))
FROM public.fp_rules WHERE key IN ('learning_path', 'materia_completa');
UPDATE public.fp_rules SET value = jsonb_set(value, '{fp}', to_jsonb(CASE key WHEN 'learning_path' THEN 20 ELSE 100 END)), updated_at = now()
WHERE key IN ('learning_path', 'materia_completa');
INSERT INTO public.fp_rules(key,label,categoria,value,orden) VALUES
 ('rtari_completado','RTARI completado','RTARI','{"fp":50}',80),
 ('compass_modulo','Módulo Compass completado','Compass','{"fp":10}',81),
 ('compass_bateria','Simulacro Compass completado','Compass','{"fp":30}',82)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE public.fp_practice_activation (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
 activated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
INSERT INTO public.fp_practice_activation DEFAULT VALUES;
CREATE TABLE public.fp_compass_batches (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
 state text NOT NULL DEFAULT 'active' CHECK(state IN ('active','completed','abandoned')),
 started_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE public.fp_practice_runs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
 kind text NOT NULL CHECK(kind IN ('rtari','compass')),
 module_id text, simulacro_id uuid REFERENCES public.fp_compass_batches(id),
 config jsonb NOT NULL,
 state text NOT NULL DEFAULT 'started' CHECK(state IN ('started','connected','closed','completed','abandoned')),
 started_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 connected_at timestamptz, closed_at timestamptz, completed_at timestamptz,
 result jsonb, debrief jsonb, audio_hash text
);
CREATE INDEX fp_practice_user ON public.fp_practice_runs(user_id,started_at DESC);
CREATE UNIQUE INDEX fp_practice_audio_once ON public.fp_practice_runs(user_id,audio_hash) WHERE audio_hash IS NOT NULL;
CREATE UNIQUE INDEX fp_practice_batch_module ON public.fp_practice_runs(simulacro_id,module_id) WHERE simulacro_id IS NOT NULL AND state <> 'abandoned';
ALTER TABLE public.fp_practice_activation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fp_compass_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fp_practice_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.fp_practice_activation,public.fp_compass_batches,public.fp_practice_runs FROM anon,authenticated;
GRANT ALL ON public.fp_practice_activation,public.fp_compass_batches,public.fp_practice_runs TO service_role;

-- Same lock used by both new awards and the pre-existing reconciliation path.
CREATE FUNCTION public.fp_reconcile_balance(p_user uuid) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_total integer;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('fp:' || p_user::text,0));
 SELECT COALESCE(sum(amount),0)::integer INTO v_total FROM fp_transactions WHERE user_id=p_user AND status='procesada';
 INSERT INTO fp_balances(user_id,total,updated_at) VALUES(p_user,v_total,clock_timestamp())
 ON CONFLICT(user_id) DO UPDATE SET total=EXCLUDED.total,updated_at=EXCLUDED.updated_at;
 RETURN v_total;
END $$;

-- Config is computed by the trusted application server, never supplied verbatim by the client.
CREATE FUNCTION public.fp_begin_compass(p_user uuid,p_config jsonb,p_batch uuid DEFAULT NULL,p_new_batch boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_batch uuid:=p_batch; v_id uuid; v_modules text[]:=ARRAY['control','slalom','calculo','memoria','multitarea','orientacion','logica']; v_count integer;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('fp:' || p_user::text,0));
 -- Only one reward-bearing run per user can be active. Practice remains repeatable.
 UPDATE fp_compass_batches SET state='abandoned' WHERE state='active' AND id IN
   (SELECT simulacro_id FROM fp_practice_runs WHERE user_id=p_user AND kind='compass' AND state='started');
 UPDATE fp_practice_runs SET state='abandoned' WHERE user_id=p_user AND kind='compass' AND state='started';
 IF p_new_batch THEN
   UPDATE fp_compass_batches SET state='abandoned' WHERE user_id=p_user AND state='active';
   INSERT INTO fp_compass_batches(user_id) VALUES(p_user) RETURNING id INTO v_batch;
 END IF;
 IF p_config->>'mode'='simulacro' THEN
   IF v_batch IS NULL OR NOT EXISTS(SELECT 1 FROM fp_compass_batches WHERE id=v_batch AND user_id=p_user AND state='active' AND started_at>clock_timestamp()-interval '4 hours') THEN RAISE EXCEPTION 'invalid_batch'; END IF;
   SELECT count(*) INTO v_count FROM fp_practice_runs WHERE simulacro_id=v_batch AND state='completed';
   IF v_count>=7 OR p_config->>'moduleId'<>v_modules[v_count+1] THEN RAISE EXCEPTION 'invalid_batch_sequence'; END IF;
 ELSIF v_batch IS NOT NULL OR p_new_batch THEN RAISE EXCEPTION 'invalid_batch_mode';
 END IF;
 INSERT INTO fp_practice_runs(user_id,kind,module_id,simulacro_id,config)
 VALUES(p_user,'compass',p_config->>'moduleId',v_batch,p_config) RETURNING id INTO v_id;
 RETURN jsonb_build_object('id',v_id,'simulacroId',v_batch,'config',p_config);
END $$;

CREATE FUNCTION public.fp_mark_practice(p_user uuid,p_id uuid,p_action text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_run fp_practice_runs;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('fp:' || p_user::text,0));
 SELECT * INTO v_run FROM fp_practice_runs WHERE id=p_id AND user_id=p_user FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 IF p_action='abandoned' THEN
   UPDATE fp_practice_runs SET state='abandoned' WHERE id=p_id AND state NOT IN ('completed','closed');
   UPDATE fp_compass_batches SET state='abandoned' WHERE id=v_run.simulacro_id AND state='active';
 ELSIF p_action='connected' AND v_run.kind='rtari' AND v_run.state='started' THEN
   UPDATE fp_practice_runs SET state='connected',connected_at=clock_timestamp() WHERE id=p_id;
 ELSIF p_action='closed' AND v_run.kind='rtari' AND v_run.state='connected' THEN
   UPDATE fp_practice_runs SET state='closed',closed_at=clock_timestamp() WHERE id=p_id;
 ELSE RETURN false;
 END IF;
 RETURN true;
END $$;

-- Service-only: invoked after application-server evidence validation. No award endpoint accepts amounts.
CREATE FUNCTION public.fp_finish_practice(p_user uuid,p_id uuid,p_result jsonb,p_audio_hash text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_run fp_practice_runs; v_now timestamptz:=clock_timestamp(); v_day text;
 v_rule text; v_key text; v_label text; v_fp integer; v_value jsonb; v_n integer;
 v_new jsonb:='[]'::jsonb; v_tx uuid; v_total integer; v_battery boolean:=false; v_cut timestamptz;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('fp:' || p_user::text,0));
 SELECT * INTO v_run FROM fp_practice_runs WHERE id=p_id AND user_id=p_user FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'unknown_practice'; END IF;
 IF v_run.state='completed' THEN RETURN jsonb_build_object('nuevos',v_new,'total',fp_reconcile_balance(p_user)); END IF;
 SELECT activated_at INTO v_cut FROM fp_practice_activation WHERE singleton;
 IF v_cut IS NULL OR v_run.started_at<v_cut OR v_run.started_at>v_now OR v_now-v_run.started_at>interval '2 hours'
 OR (v_run.kind='rtari' AND (v_run.state<>'closed' OR v_run.connected_at IS NULL OR p_audio_hash IS NULL OR (p_result->>'verified') IS DISTINCT FROM 'true'))
 OR (v_run.kind='compass' AND (v_run.state<>'started' OR (p_result->>'validated') IS DISTINCT FROM 'true')) THEN RAISE EXCEPTION 'ineligible_practice'; END IF;
 UPDATE fp_practice_runs SET state='completed',completed_at=v_now,result=p_result,audio_hash=p_audio_hash WHERE id=p_id;
 v_day:=to_char(v_now AT TIME ZONE 'America/Mexico_City','YYYY-MM-DD');
 IF v_run.kind='rtari' THEN
   v_rule:='rtari_completado'; v_key:='rtari:'||p_id::text; v_label:='RTARI completado';
   SELECT count(*) INTO v_n FROM fp_transactions WHERE user_id=p_user AND rule_key=v_rule AND metadata->>'reward_day'=v_day;
   IF v_n>=2 THEN v_rule:=NULL; END IF;
 ELSE
   v_rule:='compass_modulo'; v_key:='compass:'||v_day||':'||v_run.module_id;
   v_label:='Compass · '||CASE v_run.module_id WHEN 'control' THEN 'Control' WHEN 'slalom' THEN 'Slalom' WHEN 'memoria' THEN 'Memoria' WHEN 'calculo' THEN 'Cálculo' WHEN 'orientacion' THEN 'Orientación' WHEN 'multitarea' THEN 'Multitarea' WHEN 'logica' THEN 'Lógica' END;
   IF v_label IS NULL THEN RAISE EXCEPTION 'invalid_module'; END IF;
 END IF;
 IF v_rule IS NOT NULL THEN
   SELECT value INTO v_value FROM fp_rules WHERE key=v_rule AND enabled;
   v_fp:=COALESCE((v_value->>'fp')::integer,0);
   IF v_fp>0 THEN
     INSERT INTO fp_transactions(user_id,event_key,rule_key,amount,program,activity_type,activity_id,activity_label,rule_snapshot,metadata,occurred_at)
     VALUES(p_user,v_key,v_rule,v_fp,'GENERAL',CASE v_run.kind WHEN 'rtari' THEN 'rtari' ELSE 'compass' END,p_id::text,v_label,v_value,
       jsonb_build_object('reward_day',v_day,'simulacroId',v_run.simulacro_id,'module',v_run.module_id),v_now)
     ON CONFLICT(user_id,event_key) DO NOTHING RETURNING id INTO v_tx;
     IF v_tx IS NOT NULL THEN v_new:=v_new||jsonb_build_array(jsonb_build_object('amount',v_fp,'activity_label',v_label,'activity_type',v_run.kind,'detail',NULL)); END IF;
   END IF;
 END IF;
 IF v_run.kind='compass' AND v_run.simulacro_id IS NOT NULL THEN
   SELECT count(DISTINCT module_id)=7 AND bool_and(state='completed') INTO v_battery FROM fp_practice_runs
   WHERE simulacro_id=v_run.simulacro_id AND user_id=p_user AND module_id IN ('control','slalom','memoria','calculo','orientacion','multitarea','logica');
   IF v_battery AND EXISTS(SELECT 1 FROM fp_compass_batches WHERE id=v_run.simulacro_id AND user_id=p_user AND state='active') THEN
     UPDATE fp_compass_batches SET state='completed' WHERE id=v_run.simulacro_id;
     SELECT value INTO v_value FROM fp_rules WHERE key='compass_bateria' AND enabled;
     v_fp:=COALESCE((v_value->>'fp')::integer,0); v_tx:=NULL;
     IF v_fp>0 THEN
       INSERT INTO fp_transactions(user_id,event_key,rule_key,kind,amount,program,activity_type,activity_id,activity_label,rule_snapshot,metadata,occurred_at)
       VALUES(p_user,'compass_battery:'||v_day,'compass_bateria','bonus',v_fp,'GENERAL','compass_bateria',v_run.simulacro_id::text,'Simulacro Compass completado',v_value,jsonb_build_object('reward_day',v_day,'simulacroId',v_run.simulacro_id),v_now)
       ON CONFLICT(user_id,event_key) DO NOTHING RETURNING id INTO v_tx;
       IF v_tx IS NOT NULL THEN v_new:=v_new||jsonb_build_array(jsonb_build_object('amount',v_fp,'activity_label','Simulacro Compass completado','activity_type','compass_bateria','detail',NULL)); END IF;
     END IF;
   END IF;
 END IF;
 v_total:=fp_reconcile_balance(p_user);
 RETURN jsonb_build_object('nuevos',v_new,'total',v_total);
END $$;

REVOKE ALL ON FUNCTION public.fp_reconcile_balance(uuid),public.fp_begin_compass(uuid,jsonb,uuid,boolean),public.fp_mark_practice(uuid,uuid,text),public.fp_finish_practice(uuid,uuid,jsonb,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fp_reconcile_balance(uuid),public.fp_begin_compass(uuid,jsonb,uuid,boolean),public.fp_mark_practice(uuid,uuid,text),public.fp_finish_practice(uuid,uuid,jsonb,text) TO service_role;
