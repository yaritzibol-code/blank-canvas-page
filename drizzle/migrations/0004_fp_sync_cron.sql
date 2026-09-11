-- Sincronización horaria de FlightPoints desde la actividad real de los alumnos.
SELECT cron.unschedule('flightpath-fp-sync')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'flightpath-fp-sync');

SELECT cron.schedule(
  'flightpath-fp-sync',
  '37 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--3c6f9dde-9dcd-4a00-8fe8-8fe4bbf710b1.lovable.app/api/public/hooks/fp-sync',
    headers := '{"Content-Type": "application/json", "apikey": "sb_publishable_Ewg9zx_Q314nYnnRHq_xbg_sBbtO8NW"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);