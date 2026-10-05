# Approved Aircraft curriculum rollout

## Scope and activation

- The approved Aircraft scope is 19 learning paths; the catalog records the live titles and topic lines without composing lesson explanations.
- New explanations must be captured from NotebookLM, then checked against the approved scope and primary source locators. Legacy lesson prose is reference material only.
- The new subject overlay activates only when all AM01–AM05 pass the publication gate. A partial or blank first block leaves the existing subject unchanged.
- AM06–AM19 stay unavailable until their own reviewed documents are supplied. The normal sequential and plan gates still apply.
- No fixed stage count is imposed. Each explanation stage has one focused idea and a relevant, verified visual.

## Progress and route preservation

- Legacy taxonomy JSON and all 40 old Aircraft IDs stay intact. The approved subject uses distinct IDs under `itinerario-aprobado-2026-10`.
- `lpSubjectForContainer` and `findLp` resolve legacy links against the old 40-item sequence. The LP route and container route both use this resolver.
- The subject page shows a separate previous-version history section for learners with old activity.
- `projectApprovedAircraftProgress` is read-only. Old completion, stage indexes and answers never become completion in a new regrouped LP.
- New journeys use curriculum- and LP-specific versions. Foreign/legacy saved payloads are retained only as previousJourney context; old completion flags do not finish a new LP.
- All40 legacy full-subject completion still produces a pending historical FP bonus. The existing stable materia event key prevents duplicate subject bonuses when both curricula are completed.
- Current subject/achievement counts describe the new 19-LP sequence. Previously earned badges and paid reward rows are not removed. Existing flashcards remain available; their old-title grouping may fall into Otras tarjetas.

## Content and visual intake

- `documents.json`: complete native Handbook documents, keyed by the new ID. AM01–AM05 now contain selected captured NotebookLM explanations and audited replacement text; AM06–AM19 remain unavailable.
- `publication-review.json`: one review row per released LP, exact curriculum version, SHA-256 of captured NotebookLM explanation, and strict true flags for scope, visual and assessment review. The hash does not replace review of the actual artifact.
- Raw NotebookLM artifacts, private source URLs and draft identifiers remain outside the application bundle.
- The gate rejects blank/malformed explanations, unusable questions, invalid option order, unreachable questions, invalid diagnostic indexes, invalid stage topology, unsupported exercises, missing completion checks, private source links and absent review evidence.
- Build tests additionally check actual image file existence. Detailed illustration geometry must be inspected in pixels; generated images are not assumed mechanically correct.
- Native illustrations can show one restrained focus marker or a verified viewport crop. Only the attention marker pulses. Baked-in pistons, rods and valves do not pretend to move.
- User-supplied engine screenshot guides the level of cutaway detail and differentiated internal materials, rather than dictating technical claims or exact aviation engine architecture.

## Approved map and NotebookLM gaps

### AM01 Clasificación visual de las aeronaves

- Peso con respecto al aire: aeróstatos y aerodinos.
- Ala fija: número, posición y forma de las alas; reconocimiento y clasificación general de ala rotativa.
- Tipo, número y posición de motores; tipo y posición del tren de aterrizaje.
- Forma de despegue y aterrizaje y tipo de cabina.
- Proposed support: Ejemplos visuales breves y un solo minijuego final de reconocimiento con varias características por aeronave.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM02 Estructura y aeronavegabilidad

- Diseño, certificación y aeronavegabilidad.
- Grupos de estudio: sustentador con alas arriostradas y cantilever; empenajes vertical y horizontal; fuselaje compuesto, monocoque y semimonocoque; tren de aterrizaje y motor.
- Proposed support: Reconocer los grupos estructurales sobre una aeronave.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM03 Motor Alternativo

- Sinonimos
- Partes del motor (funciones de cada una de las partes)
- Clasificación por la posición de los cilindros 
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM04 Ciclo de Otto

- 4 fases 
- Traslape valvular
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM05 Potencia del motor alternativo

- Potencia nominal, indicada y al freno.
- Proposed support: Comparar los tres tipos de potencia en un mismo motor.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM06 Alimentación y mezcla del motor alternativo

- Sistemas de ignición, inducción y combustible: función, partes, tipos y funcionamiento por carburador.
- Tipos de mezcla, octanaje y función del sistema de succión.
- Proposed support: Seguir el recorrido de aire y combustible y reconocer la mezcla.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM07 Anormalidades de la combustión

- Preignición, detonación y postcombustión; aclaración del término precombustión.
- Proposed support: Distinguir las anormalidades en situaciones breves.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM08 Enfriamiento escape y lubricación

- Enfriamiento, escape y lubricación: función, partes y tipos.
- Aceites, bases y viscosidad.
- Proposed support: Reconocer el recorrido y la función de cada sistema.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM09 Hélices tipos paso y fuerzas

- Tipos de hélice y paso.
- Fuerzas sobre la hélice y potencia de las plantas motrices.
- Proposed support: Comparar visualmente tipos y cambios de paso.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM10 Motor a reacción y sus componentes

- Componentes del motor a reacción y sus funciones.
- Proposed support: Localizar los componentes en un esquema del motor.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM11 Ciclo Brayton

- Ciclo Brayton y diferencias con el ciclo Otto.
- Proposed support: Ordenar el ciclo y compararlo con Otto.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM12 Tipos de motores a reacción y empuje

- Tipos de motores a reacción; relación bypass y flujos primario y secundario.
- Ventajas y desventajas frente al motor recíproco y causas de variación del empuje.
- Proposed support: Comparar arquitecturas, flujos y generación de empuje.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM13 Anormalidades del motor a reacción

- Desplome del compresor; hot start, wet start y hung start.
- FOD y su clasificación.
- Proposed support: Reconocimiento de anormalidades a partir de una secuencia o indicación.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM14 Sistemas hidráulico y neumático

- Sistemas hidráulico y neumático: generalidades, función, importancia, partes, tipos y operación.
- Sistema hidráulico: propiedades y uso de líquidos; depósitos y ventajas del sistema.
- Proposed support: Seguir el suministro a los equipos consumidores.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM15 Presurización y aire acondicionado

- Presurización y aire acondicionado: componentes, funciones y operación.
- Tipos de control manual y automatizado citados en el temario, con alcance por validar.
- Proposed support: Relacionar suministro, control y condiciones de cabina.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM16 Protección contra hielo y lluvia

- Anti-icing y de-icing; protección contra lluvia e inspección previa al vuelo.
- Proposed support: Reconocer sistemas y comprobaciones previas al vuelo.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM17 Fuego detección y extinción

- Tipos de fuego, clases de extintores y sistemas detectores.
- Proposed support: Relacionar fuego, detección y extinción.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM18 Tren de aterrizaje y frenos

- Ciclo, mecanismos y operación del tren de aterrizaje.
- Sistemas de frenos: tambor, balatas y conjunto de discos.
- Proposed support: Secuencia visual de extensión y frenado.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

### AM19 Sistemas eléctricos y fuentes de alimentación

- Sistema eléctrico del motor alternativo: función, partes y tipos.
- Alimentación de corriente, distribución y operación del sistema eléctrico.
- APU y GPU.
- Proposed support: Seguir la alimentación de un equipo en un diagrama sencillo.
- Intake gap: complete NotebookLM-authored explanation, supported source locators, scoped assessment and reviewed visual coverage.

## Safe release checklist

1. Capture NotebookLM AM01–AM05 text and its provenance. Preserve the source artifact separately.
2. Package the captured explanations into native documents without filling gaps with newly authored technical teaching.
3. Match every explanation to verified visual geometry and record safe callouts. AM01 keeps all classification criteria in one LP and one final recognition game.
4. Verify the publication gate, all new IDs, unchanged old routes, all published assets, and no private artifact URLs in learner-visible content.
5. Run the focused structure suite, existing Aircraft/Aero native renderer and completion suites, FP suites, TypeScript checks, lint and production build. Re-run against final authored JSON.
6. Exercise AM01–AM05 in desktop/mobile preview, resume/reload, wrong answers, earlier-stage review, exit/back, repeated completion, legacy-history access, Básica/Pro gates and AM06 locked state.
7. Commit only the owned Aircraft integration/asset files; leave pre-existing paused Legislation and taxonomy.json edits untouched. Coordinate remote baseline and publication with the task owner.

## Open distribution issue outside this implementation

The live distribution body contains 129 LP headings while its summary says 132. Legislation contains 17 headings and jumps from LG03 to LG07, while its summary still says 20; FH07 still refers to LG04. Those live edits are preserved. No missing legislation rows are reconstructed or renumbered here.

## First-block verification status

AM01–AM05 contain 52 concise explanation cards; individual cards contain 7–51 words. Stage totals are 19, 14, 17, 10 and 8, reflecting the scope of each topic. AM01 ends in exactly one illustrated recognition matching game. The source-selection ledger and raw authoring inputs are retained outside the app.

TypeScript, scoped lint, structural/publication-gate tests, actual React DOM interaction tests, asset existence and PNG/WebP header and runtime-dimension tests pass. The complete production build passes with an 8GB Node heap; the default heap was insufficient. Whole-repository lint retains unrelated repository-wide issues.

Real Chromium screenshot QA was blocked by the environment refusing the browser process socket. It was not bypassed. Actual desktop/mobile layout, scrolling and interactive browser rendering remain for authorized preview QA after the scoped sync. No production deployment is claimed by this commit.

The seven engine/structure PNG authoring masters are archived outside the repository. Their full-resolution WebP versions serve both normal and enlarged views. The six classification PNGs are retained because the runtime uses them directly.
