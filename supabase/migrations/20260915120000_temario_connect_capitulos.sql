-- Temario CONNECT: los reactivos de Línea Aérea se reacomodan en los capítulos
-- del temario oficial de la convocatoria (documento "Línea Aérea — TEMARIO
-- CONNECT"). Catálogo en src/lib/store/linea-aerea-meta.ts; secciones en
-- src/lib/store/linea-aerea-temario.ts.
--
--   · ATP y PHAK conservan sus capítulos (1, 2, 3, 6, 7, 8 y 2 a 17).
--   · Jeppesen pasa de los 7 capítulos de la sección Introduction a los 8
--     bloques del temario: Definiciones/Abreviaturas → bloque 1; Introducción,
--     Chart Legend, Chart Format y State NOTAMs → bloque 2 (lectura de cartas);
--     Signs and Markings y VDGS → bloque 3. Los bloques 4 a 8 son temario nuevo.
--   · Legislación pasa a un capítulo por ordenamiento: Constitución (1),
--     convenios internacionales (2), Ley de Aviación Civil (3) y su reglamento
--     (4), Reglamento de la Ley de Aeropuertos (5), Reglamento de Medicina (6),
--     Ley Aduanera (7) y su reglamento (8), LFT (9) y circulares obligatorias (10).
--   · Anexo 10 Vol. II se organiza por sus 8 capítulos.
--
-- Los ids no cambian (historial y analítica intactos). Cada fila reacomodada
-- queda marcada con data.temario = 'connect-2026', que además hace idempotente
-- el reacomodo por capítulo anterior (pasos 2 a 4).

-- 1) Reactivos de la semilla (ids estables q_la_*): capítulo y sección exactos,
--    los mismos que lleva src/lib/store/seed-linea-aerea.ts.
with m(id, cap, sec) as (
  values
    ('q_la_ATP_001', 3, 'High Speed Flight'),
    ('q_la_ATP_002', 3, 'High Speed Flight'),
    ('q_la_ATP_003', 3, 'High Speed Flight'),
    ('q_la_ATP_004', 3, 'Stability'),
    ('q_la_ATP_005', 3, 'High Speed Flight'),
    ('q_la_ATP_006', 3, 'Lift and Drag'),
    ('q_la_ATP_007', 3, 'High-Lift Devices'),
    ('q_la_ATP_008', 3, 'High Speed Flight'),
    ('q_la_ATP_009', 3, 'High Speed Flight'),
    ('q_la_ATP_010', 3, 'High Speed Flight'),
    ('q_la_ATP_011', 2, NULL),
    ('q_la_ATP_012', 2, NULL),
    ('q_la_ATP_013', 7, 'Flight Emergencies and Hazards'),
    ('q_la_ATP_014', 7, 'Flight Emergencies and Hazards'),
    ('q_la_ATP_015', 7, 'Flight Emergencies and Hazards'),
    ('q_la_ATP_016', 7, 'Flight Emergencies and Hazards'),
    ('q_la_ATP_017', 2, 'Safety of Flight Equipment'),
    ('q_la_ATP_018', 7, 'Flight Physiology'),
    ('q_la_ATP_019', 8, 'Weather Systems'),
    ('q_la_ATP_020', 8, 'Turbulence'),
    ('q_la_ATP_021', 8, 'Wind Shear'),
    ('q_la_ATP_022', 8, 'Wind Shear'),
    ('q_la_ATP_023', 8, 'Wind Shear'),
    ('q_la_ATP_024', 8, 'Icing'),
    ('q_la_ATP_025', 8, 'Icing'),
    ('q_la_ATP_026', 8, 'Thunderstorms'),
    ('q_la_ATP_027', 8, 'Thunderstorms'),
    ('q_la_ATP_028', 8, 'Turbulence'),
    ('q_la_ATP_029', 6, 'Instrument Approaches'),
    ('q_la_ATP_030', 6, 'Instrument Approaches'),
    ('q_la_ATP_031', 6, 'Holding'),
    ('q_la_ATP_032', 6, 'Holding'),
    ('q_la_ATP_033', 6, 'Airspace'),
    ('q_la_ATP_034', 2, 'Global Navigation'),
    ('q_la_ATP_035', 6, 'Instrument Approaches'),
    ('q_la_ATP_036', 6, 'Landing'),
    ('q_la_ATP_037', 6, 'Instrument Approaches'),
    ('q_la_ATP_038', 1, 'Dispatching and Flight Release'),
    ('q_la_ATP_039', 1, 'Dispatching and Flight Release'),
    ('q_la_ATP_040', 1, 'Fuel Requirements'),
    ('q_la_ATP_041', 6, 'Communications'),
    ('q_la_ATP_042', 2, 'Inoperative Equipment'),
    ('q_la_ATP_043', 1, 'Dispatching and Flight Release'),
    ('q_la_ATP_044', 7, NULL),
    ('q_la_ATP_045', 7, NULL),
    ('q_la_ATP_046', 7, NULL),
    ('q_la_ATP_047', 7, 'Flight Physiology'),
    ('q_la_ATP_048', 2, 'Global Navigation'),
    ('q_la_ATP_049', 2, 'GPS'),
    ('q_la_ATP_050', 2, 'GPS'),
    ('q_la_PHAK_001', 3, 'Major Components'),
    ('q_la_PHAK_002', 5, 'Forces Acting on the Aircraft'),
    ('q_la_PHAK_003', 4, 'Airfoil Design'),
    ('q_la_PHAK_004', 5, 'Stalls'),
    ('q_la_PHAK_005', 5, 'Load Factors'),
    ('q_la_PHAK_006', 5, 'Load Factors'),
    ('q_la_PHAK_007', 5, 'Forces Acting on the Aircraft'),
    ('q_la_PHAK_008', 5, 'Ground Effect'),
    ('q_la_PHAK_009', 5, 'Load Factors'),
    ('q_la_PHAK_010', 5, 'Basic Propeller Principles'),
    ('q_la_PHAK_011', 5, 'Aircraft Design Characteristics'),
    ('q_la_PHAK_012', 10, 'Balance, Stability, and Center of Gravity'),
    ('q_la_PHAK_013', 6, 'Flight Control Systems'),
    ('q_la_PHAK_014', 6, 'Flight Control Systems'),
    ('q_la_PHAK_015', 6, 'Flight Control Systems'),
    ('q_la_PHAK_016', 6, 'Flight Control Systems'),
    ('q_la_PHAK_017', 7, 'Powerplant'),
    ('q_la_PHAK_018', 7, 'Powerplant'),
    ('q_la_PHAK_019', 7, 'Powerplant'),
    ('q_la_PHAK_020', 7, 'Airframe Systems'),
    ('q_la_PHAK_021', 7, 'Powerplant'),
    ('q_la_PHAK_022', 8, 'Pitot-Static Flight Instruments'),
    ('q_la_PHAK_023', 8, 'Gyroscopic Flight Instruments'),
    ('q_la_PHAK_024', 8, 'Pitot-Static Flight Instruments'),
    ('q_la_PHAK_025', 8, 'Pitot-Static Flight Instruments'),
    ('q_la_PHAK_026', 8, 'Pitot-Static Flight Instruments'),
    ('q_la_PHAK_027', 8, 'Pitot-Static Flight Instruments'),
    ('q_la_PHAK_028', 8, 'Gyroscopic Flight Instruments'),
    ('q_la_PHAK_029', 8, 'Compass Systems'),
    ('q_la_PHAK_030', 8, 'Compass Systems'),
    ('q_la_PHAK_031', 11, 'Structure of the Atmosphere'),
    ('q_la_PHAK_032', 11, 'Structure of the Atmosphere'),
    ('q_la_PHAK_033', 11, 'Takeoff and Landing Performance'),
    ('q_la_PHAK_034', 12, 'Atmospheric Stability'),
    ('q_la_PHAK_035', 12, 'Fronts'),
    ('q_la_PHAK_036', 12, 'Thunderstorms'),
    ('q_la_PHAK_037', 12, 'Moisture and Temperature'),
    ('q_la_PHAK_038', 12, 'Atmospheric Stability'),
    ('q_la_PHAK_039', 12, 'Moisture and Temperature'),
    ('q_la_PHAK_040', 13, 'Aviation Weather Reports'),
    ('q_la_PHAK_041', 13, 'Aviation Forecasts'),
    ('q_la_PHAK_042', 17, 'Health and Physiological Factors Affecting Pilot Performance'),
    ('q_la_PHAK_043', 17, 'Health and Physiological Factors Affecting Pilot Performance'),
    ('q_la_PHAK_044', 17, 'Health and Physiological Factors Affecting Pilot Performance'),
    ('q_la_PHAK_045', 17, 'Health and Physiological Factors Affecting Pilot Performance'),
    ('q_la_PHAK_046', 17, 'Health and Physiological Factors Affecting Pilot Performance'),
    ('q_la_PHAK_047', 2, 'Risk Management'),
    ('q_la_PHAK_048', 2, 'Risk Management'),
    ('q_la_PHAK_049', 15, 'Controlled Airspace'),
    ('q_la_PHAK_050', 15, 'Air Traffic Control and the National Airspace System'),
    ('q_la_JEPP_001', 1, 'Definiciones'),
    ('q_la_JEPP_002', 1, 'Definiciones'),
    ('q_la_JEPP_003', 1, 'Definiciones'),
    ('q_la_JEPP_004', 1, 'Definiciones'),
    ('q_la_JEPP_005', 1, 'Definiciones'),
    ('q_la_JEPP_006', 1, 'Definiciones'),
    ('q_la_JEPP_007', 1, 'Definiciones'),
    ('q_la_JEPP_008', 1, 'Definiciones'),
    ('q_la_JEPP_009', 1, 'Definiciones'),
    ('q_la_JEPP_010', 1, 'Definiciones'),
    ('q_la_JEPP_011', 1, 'Definiciones'),
    ('q_la_JEPP_012', 1, 'Definiciones'),
    ('q_la_JEPP_013', 2, 'Enroute Chart Legend'),
    ('q_la_JEPP_014', 1, 'Definiciones'),
    ('q_la_JEPP_015', 1, 'Definiciones'),
    ('q_la_JEPP_016', 2, 'Approach Chart Legend'),
    ('q_la_JEPP_017', 2, 'Crossing Altitudes in the Chart Planview'),
    ('q_la_JEPP_018', 2, 'Crossing Altitudes in the Chart Planview'),
    ('q_la_JEPP_019', 2, 'Crossing Altitudes in the Chart Planview'),
    ('q_la_JEPP_020', 2, 'Crossing Altitudes in the Chart Planview'),
    ('q_la_JEPP_021', 2, 'Crossing Altitudes in the Chart Planview'),
    ('q_la_JEPP_022', 2, 'Enroute Chart Legend'),
    ('q_la_JEPP_023', 2, 'Enroute Chart Legend'),
    ('q_la_JEPP_024', 5, 'En-route Procedures'),
    ('q_la_JEPP_025', 1, 'Definiciones'),
    ('q_la_JEPP_026', 1, 'Definiciones'),
    ('q_la_JEPP_027', 2, 'NAVAID Symbols'),
    ('q_la_JEPP_028', 2, 'NAVAID Symbols'),
    ('q_la_JEPP_029', 2, 'NAVAID Symbols'),
    ('q_la_JEPP_030', 2, 'Enroute Chart Legend'),
    ('q_la_JEPP_031', 2, 'Enroute Chart Legend'),
    ('q_la_JEPP_032', 2, 'Enroute Chart Legend'),
    ('q_la_JEPP_033', 2, 'Enroute Chart Legend'),
    ('q_la_JEPP_034', 2, 'Enroute Chart Legend'),
    ('q_la_JEPP_035', 2, 'Approach Chart Legend'),
    ('q_la_JEPP_036', 2, 'Approach Chart Legend'),
    ('q_la_JEPP_037', 2, 'Approach Chart Legend'),
    ('q_la_JEPP_038', 2, 'Approach Chart Legend'),
    ('q_la_JEPP_039', 2, 'Approach Chart Legend'),
    ('q_la_JEPP_040', 2, 'Approach Chart Legend'),
    ('q_la_JEPP_041', 2, 'Approach Chart Legend'),
    ('q_la_JEPP_042', 2, 'Approach Chart Legend'),
    ('q_la_JEPP_043', 2, 'Approach Chart Legend'),
    ('q_la_JEPP_044', 2, 'Airport Chart Legend'),
    ('q_la_JEPP_045', 2, 'Approach Chart Legend'),
    ('q_la_JEPP_046', 2, 'Enroute Chart Legend'),
    ('q_la_JEPP_047', 2, 'SID/DP and STAR Chart Legend'),
    ('q_la_JEPP_048', 2, 'Approach Chart Legend'),
    ('q_la_JEPP_049', 1, 'Definiciones'),
    ('q_la_JEPP_050', 1, 'Definiciones'),
    ('q_la_ANX10_001', 2, NULL),
    ('q_la_ANX10_002', 3, NULL),
    ('q_la_ANX10_003', 5, NULL),
    ('q_la_ANX10_004', 5, NULL),
    ('q_la_ANX10_005', 5, NULL),
    ('q_la_ANX10_006', 5, NULL),
    ('q_la_ANX10_007', 5, NULL),
    ('q_la_ANX10_008', 5, NULL),
    ('q_la_ANX10_009', 5, NULL),
    ('q_la_ANX10_010', 5, NULL),
    ('q_la_ANX10_011', 5, NULL),
    ('q_la_ANX10_012', 5, NULL),
    ('q_la_ANX10_013', 5, NULL),
    ('q_la_ANX10_014', 5, NULL),
    ('q_la_ANX10_015', 5, NULL),
    ('q_la_ANX10_016', 5, NULL),
    ('q_la_ANX10_017', 5, NULL),
    ('q_la_ANX10_018', 5, NULL),
    ('q_la_ANX10_019', 5, NULL),
    ('q_la_ANX10_020', 5, NULL),
    ('q_la_ANX10_021', 5, NULL),
    ('q_la_ANX10_022', 5, NULL),
    ('q_la_ANX10_023', 5, NULL),
    ('q_la_ANX10_024', 5, NULL),
    ('q_la_ANX10_025', 5, NULL),
    ('q_la_ANX10_026', 5, NULL),
    ('q_la_ANX10_027', 5, NULL),
    ('q_la_ANX10_028', 5, NULL),
    ('q_la_ANX10_029', 5, NULL),
    ('q_la_ANX10_030', 5, NULL),
    ('q_la_ANX10_031', 5, NULL),
    ('q_la_ANX10_032', 5, NULL),
    ('q_la_ANX10_033', 5, NULL),
    ('q_la_ANX10_034', 5, NULL),
    ('q_la_ANX10_035', 5, NULL),
    ('q_la_ANX10_036', 5, NULL),
    ('q_la_ANX10_037', 5, NULL),
    ('q_la_ANX10_038', 5, NULL),
    ('q_la_ANX10_039', 5, NULL),
    ('q_la_ANX10_040', 5, NULL),
    ('q_la_ANX10_041', 5, NULL),
    ('q_la_ANX10_042', 5, NULL),
    ('q_la_ANX10_043', 5, NULL),
    ('q_la_ANX10_044', 5, NULL),
    ('q_la_ANX10_045', 5, NULL),
    ('q_la_ANX10_046', 4, NULL),
    ('q_la_ANX10_047', 4, NULL),
    ('q_la_ANX10_048', 4, NULL),
    ('q_la_ANX10_049', 4, NULL),
    ('q_la_ANX10_050', 4, NULL),
    ('q_la_CPAM_001', 3, 'Disposiciones generales (art. 3)'),
    ('q_la_CPAM_002', 3, 'Autoridad de aviación civil (art. 7)'),
    ('q_la_CPAM_003', 3, 'Autoridad de aviación civil (art. 7)'),
    ('q_la_CPAM_004', 3, 'Servicio de transporte aéreo (art. 17 Bis)'),
    ('q_la_CPAM_005', 3, 'Servicio de transporte aéreo (art. 17 Bis)'),
    ('q_la_CPAM_006', 3, 'Servicio de transporte aéreo (art. 17 Bis)'),
    ('q_la_CPAM_007', 3, 'Servicio de transporte aéreo (art. 17 Bis)'),
    ('q_la_CPAM_008', 3, 'Servicio de transporte aéreo (art. 17 Bis)'),
    ('q_la_CPAM_009', 3, 'Disposiciones generales (art. 3)'),
    ('q_la_CPAM_010', 3, 'Disposiciones generales (art. 3)'),
    ('q_la_CPAM_011', 3, 'Disposiciones generales (art. 3)'),
    ('q_la_CPAM_012', 3, NULL),
    ('q_la_CPAM_013', 3, NULL),
    ('q_la_CPAM_014', 3, NULL),
    ('q_la_CPAM_015', 3, NULL),
    ('q_la_CPAM_016', 3, 'Personal técnico aeronáutico (art. 38)'),
    ('q_la_CPAM_017', 3, 'Personal técnico aeronáutico (art. 38)'),
    ('q_la_CPAM_018', 3, 'Personal técnico aeronáutico (art. 38)'),
    ('q_la_CPAM_019', 3, 'Personal técnico aeronáutico (art. 38)'),
    ('q_la_CPAM_020', 3, 'Personal técnico aeronáutico (art. 38)'),
    ('q_la_CPAM_021', 4, 'Personal de vuelo (arts. 77 a 86)'),
    ('q_la_CPAM_022', 3, 'Personal técnico aeronáutico (art. 38)'),
    ('q_la_CPAM_023', 6, 'Evaluación médica al personal técnico-aeronáutico y aspirantes (arts. 13 a 17)'),
    ('q_la_CPAM_024', 6, 'Evaluación médica al personal técnico-aeronáutico y aspirantes (arts. 13 a 17)'),
    ('q_la_CPAM_025', 6, 'Evaluación médica al personal técnico-aeronáutico y aspirantes (arts. 13 a 17)'),
    ('q_la_CPAM_026', 6, 'Evaluación médica al personal técnico-aeronáutico y aspirantes (arts. 13 a 17)'),
    ('q_la_CPAM_027', 3, 'Comandante de la aeronave (arts. 40 a 41)'),
    ('q_la_CPAM_028', 3, 'Comandante de la aeronave (arts. 40 a 41)'),
    ('q_la_CPAM_029', 3, 'Comandante de la aeronave (arts. 40 a 41)'),
    ('q_la_CPAM_030', 4, 'Instrumentos, equipo y documentos de vuelo (art. 131)'),
    ('q_la_CPAM_031', 3, 'Accidentes y búsqueda y salvamento (arts. 79 a 82)'),
    ('q_la_CPAM_032', 4, 'Instrumentos, equipo y documentos de vuelo (art. 131)'),
    ('q_la_CPAM_033', 9, 'Trabajo de las tripulaciones aeronáuticas (arts. 215 a 245)'),
    ('q_la_CPAM_034', 9, 'Trabajo de las tripulaciones aeronáuticas (arts. 215 a 245)'),
    ('q_la_CPAM_035', 9, 'Trabajo de las tripulaciones aeronáuticas (arts. 215 a 245)'),
    ('q_la_CPAM_036', 9, 'Trabajo de las tripulaciones aeronáuticas (arts. 215 a 245)'),
    ('q_la_CPAM_037', 9, 'Trabajo de las tripulaciones aeronáuticas (arts. 215 a 245)'),
    ('q_la_CPAM_038', 3, 'Sanciones (arts. 88 a 90)'),
    ('q_la_CPAM_039', 4, 'Personal de vuelo (arts. 77 a 86)'),
    ('q_la_CPAM_040', 9, 'Trabajo de las tripulaciones aeronáuticas (arts. 215 a 245)'),
    ('q_la_CPAM_041', 3, NULL),
    ('q_la_CPAM_042', 3, NULL),
    ('q_la_CPAM_043', 3, 'Daños a terceros (arts. 70 a 71)'),
    ('q_la_CPAM_044', 3, 'Servicio de transporte aéreo (art. 17 Bis)'),
    ('q_la_CPAM_045', 4, 'Operaciones de vuelo (arts. 111 a 120)'),
    ('q_la_CPAM_046', 2, 'Anexos OACI'),
    ('q_la_CPAM_047', 2, 'Anexos OACI'),
    ('q_la_CPAM_048', 2, 'Convenio de Chicago'),
    ('q_la_CPAM_049', 3, NULL),
    ('q_la_CPAM_050', 1, NULL)
)
update public.content c
set data = (c.data - 'seccion')
  || jsonb_build_object('capitulo', m.cap, 'temario', 'connect-2026')
  || case when m.sec is null then '{}'::jsonb else jsonb_build_object('seccion', m.sec) end
from m
where c.collection = 'questions'
  and c.id = m.id;

-- 2) Jeppesen (banco importado): capítulo de la Introduction → bloque del temario.
--    Si la sección ya nombra un tema de los bloques 4 a 8 se respeta ese bloque.
update public.content c
set data = c.data || jsonb_build_object(
  'capitulo',
  case
    when s ~ '(emergenc|distress|socorro|unlawful|interferencia il|intercept|search and rescue|salvamento|minimum fuel)' then 8
    when s ~ '(\mpbn\M|performance-based|surveillance|vigilancia|pbcs|cpdlc)' then 7
    when s ~ '(annex 2|annex 10|annex 11|anexo 2|anexo 10|anexo 11|doc 4444|appendix [124]|air traffic management)' then 6
    when s ~ '(departure procedures|en-route procedures|enroute procedures|arrival procedures|approach procedures|holding procedures|altimeter setting|transponder operating|noise abatement|mach number technique|operational flight information)' then 5
    when s ~ '(frequency band|frequency allocation|airborne station|effective range|navigation aids)' then 4
    when cap in (1) then 1
    when cap in (0, 2, 3, 6) then 2
    when cap in (4, 5) then 3
    else cap
  end,
  'temario', 'connect-2026')
from (
  select id,
    coalesce(nullif(data->>'capitulo', ''), '0')::int as cap,
    lower(coalesce(data->>'seccion', '') || ' ' || coalesce(data->>'capituloTitulo', '')) as s
  from public.content
  where collection = 'questions' and data->>'fuente' = 'JEPP'
) x
where c.collection = 'questions'
  and c.id = x.id
  and coalesce(c.data->>'temario', '') <> 'connect-2026';

-- 3) Legislación (banco importado): capítulos 1 a 5 (Art. 32 y convenios) →
--    Constitución (1) o convenios (2); el compendio nacional (antiguo cap. 9 y
--    cualquier reactivo que cite una ley) se reparte por ordenamiento.
update public.content c
set data = c.data || jsonb_build_object(
  'capitulo',
  case
    when x.cap in (2, 3, 4, 5) then 2
    when s ~ '(constituci|art[íi]culo 32|art\. 32)' and x.cap = 1 then 1
    when s ~ 'ley federal del trabajo|\mlft\M|tripulaciones aeron' then 9
    when s ~ 'reglamento de la ley de aeropuertos|ley de aeropuertos|aeródromo|aeropuerto' then 5
    when s ~ 'medicina de aviaci|psicof[íi]sic|aptitud m[ée]dica|certificado m[ée]dico' then 6
    when s ~ 'reglamento de la ley aduanera' then 8
    when s ~ 'ley aduanera|aduan' then 7
    when s ~ 'circular obligatoria|\mco av|\mco sa' then 10
    when s ~ 'reglamento de la ley de aviaci' then 4
    when s ~ 'ley de aviaci[óo]n civil|\mlac\M' then 3
    when x.cap = 1 then 1
    else 3
  end,
  'temario', 'connect-2026')
from (
  select id,
    coalesce(nullif(data->>'capitulo', ''), '0')::int as cap,
    lower(coalesce(data->>'cite', '') || ' ' || coalesce(data->>'seccion', '') || ' ' || coalesce(data->>'text', '')) as s
  from public.content
  where collection = 'questions' and data->>'fuente' = 'LEG'
) x
where c.collection = 'questions'
  and c.id = x.id
  and coalesce(c.data->>'temario', '') <> 'connect-2026';

-- 4) Anexo 10 (reactivos fuera de la semilla, si los hubiera): capítulo del
--    Volumen II por tema; lo no reconocido cae en el cap. 5 (radiotelefonía).
update public.content c
set data = c.data || jsonb_build_object(
  'capitulo',
  case
    when s ~ '(\maftn\M|servicio fijo|fixed service)' then 4
    when s ~ '(volmet|radiodifusi|broadcast)' then 7
    when s ~ '(cpdlc|enlace de datos|data link)' then 8
    when s ~ '(radionavegaci|radio navigation)' then 6
    when s ~ '(divisi[óo]n del servicio|cuatro partes|horas de servicio|hours of service|supervisi)' then 2
    when s ~ '(sistema horario|\mutc\M|time system|abreviaturas y c[óo]digos|cancelaci[óo]n de mensajes)' then 3
    when s ~ '^\s*(defin|se define|definici)' then 1
    else 5
  end,
  'temario', 'connect-2026')
from (
  select id,
    lower(coalesce(data->>'seccion', '') || ' ' || coalesce(data->>'cite', '') || ' ' || coalesce(data->>'text', '')) as s
  from public.content
  where collection = 'questions' and data->>'fuente' = 'ANX10'
) x
where c.collection = 'questions'
  and c.id = x.id
  and coalesce(c.data->>'temario', '') <> 'connect-2026';

-- 5) Título del capítulo tal como lo nombra el temario (lo que ven alumnas,
--    Pathy y el panel admin junto al número).
with t(fuente, cap, titulo) as (
  values
    ('JEPP', 1, 'Lenguaje Jeppesen: Definiciones y Abreviaturas'),
    ('JEPP', 2, 'Simbología y Lectura de Cartas'),
    ('JEPP', 3, 'Señales y Marcas de Aeródromo'),
    ('JEPP', 4, 'Radioayudas y Fundamentos de Radiocomunicación'),
    ('JEPP', 5, 'Procedimientos de Vuelo'),
    ('JEPP', 6, 'Marco Normativo ICAO y Gestión del Tránsito Aéreo'),
    ('JEPP', 7, 'PBN, Vigilancia y Enlace de Datos'),
    ('JEPP', 8, 'Emergencias y Contingencias'),
    ('LEG', 1, 'Constitución Política de los Estados Unidos Mexicanos'),
    ('LEG', 2, 'Convenios internacionales'),
    ('LEG', 3, 'Ley de Aviación Civil'),
    ('LEG', 4, 'Reglamento de la Ley de Aviación Civil'),
    ('LEG', 5, 'Reglamento de la Ley de Aeropuertos'),
    ('LEG', 6, 'Reglamento de Medicina de Aviación Civil'),
    ('LEG', 7, 'Ley Aduanera'),
    ('LEG', 8, 'Reglamento de la Ley Aduanera'),
    ('LEG', 9, 'Ley Federal del Trabajo'),
    ('LEG', 10, 'Circulares Obligatorias'),
    ('ANX10', 1, 'Definiciones'),
    ('ANX10', 2, 'Disposiciones administrativas del servicio internacional de telecomunicaciones aeronáuticas'),
    ('ANX10', 3, 'Procedimientos generales del servicio internacional de telecomunicaciones aeronáuticas'),
    ('ANX10', 4, 'Servicio fijo aeronáutico (AFS)'),
    ('ANX10', 5, 'Servicio móvil aeronáutico — comunicaciones orales'),
    ('ANX10', 6, 'Servicio de radionavegación aeronáutica'),
    ('ANX10', 7, 'Servicio de radiodifusión aeronáutica'),
    ('ANX10', 8, 'Servicio móvil aeronáutico — comunicaciones por enlace de datos')
)
update public.content c
set data = c.data || jsonb_build_object('capituloTitulo', t.titulo)
from t
where c.collection = 'questions'
  and c.data->>'fuente' = t.fuente
  and coalesce(nullif(c.data->>'capitulo', ''), '0')::int = t.cap
  and coalesce(c.data->>'capituloTitulo', '') <> t.titulo;
