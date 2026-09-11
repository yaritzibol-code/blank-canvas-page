-- Comunidad: los alumnos pueden ver la información BÁSICA de ranking de otros
-- alumnos (folio/privacidad, racha, logros y total de FlightPoints), nunca su
-- correo ni el detalle de su actividad. Las escrituras siguen siendo del
-- servidor (service_role).

-- 1) Sólo lectura para el cliente en las tablas de FlightPoints.
REVOKE ALL ON public.fp_community_profiles FROM anon, authenticated;
REVOKE ALL ON public.fp_balances FROM anon, authenticated;
REVOKE ALL ON public.fp_transactions FROM anon, authenticated;
GRANT SELECT ON public.fp_community_profiles TO authenticated;
GRANT SELECT ON public.fp_balances TO authenticated;
GRANT SELECT ON public.fp_transactions TO authenticated;
GRANT ALL ON public.fp_community_profiles TO service_role;
GRANT ALL ON public.fp_balances TO service_role;
GRANT ALL ON public.fp_transactions TO service_role;

-- 2) Perfil público de Comunidad: visible para cualquier alumno autenticado,
--    excepto las cuentas administrativas (no participan en los rankings).
DROP POLICY IF EXISTS "fp_community ranking basico" ON public.fp_community_profiles;
CREATE POLICY "fp_community ranking basico" ON public.fp_community_profiles
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = fp_community_profiles.user_id
        AND COALESCE(p.role, 'student') <> 'admin'
    )
  );

-- 3) Saldo de FlightPoints: mismo criterio (es el valor que alimenta el Top).
DROP POLICY IF EXISTS "fp_balances ranking basico" ON public.fp_balances;
CREATE POLICY "fp_balances ranking basico" ON public.fp_balances
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = fp_balances.user_id
        AND COALESCE(p.role, 'student') <> 'admin'
    )
  );

-- 4) El detalle de transacciones sigue siendo privado (propio o admin).

-- 5) Índices para que los rankings sigan siendo rápidos con toda la plataforma.
CREATE INDEX IF NOT EXISTS fp_tx_user_status_fecha_idx
  ON public.fp_transactions (user_id, status, occurred_at);
CREATE INDEX IF NOT EXISTS fp_tx_program_idx
  ON public.fp_transactions (program) WHERE status = 'procesada';