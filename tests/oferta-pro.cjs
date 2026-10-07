const assert = require("node:assert/strict");
const path = require("node:path");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const esbuild = process.env.FP_TEST_ESBUILD
  ? require(process.env.FP_TEST_ESBUILD)
  : createRequire(require.resolve("vite/package.json"))("esbuild");
(async () => {
  const bundled = await esbuild.build({
    entryPoints: [path.join(root, "src/lib/oferta-pro.ts")],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
  });
  const mod = { exports: {} };
  new Function("module", "exports", bundled.outputFiles[0].text)(mod, mod.exports);
  const {
    OFERTA_PRO_VIGENCIA_MS,
    contarDiasActivos,
    diaLocal,
    esMotivoRechazo,
    oferta20Vigente,
    precioConOferta,
    siguienteIntento,
  } = mod.exports;

  // Las 23:30 de CDMX ya son el día siguiente en UTC: cuenta la hora de México.
  const lunesNoche = Date.parse("2026-10-06T05:30:00Z"); // lunes 5, 23:30 en CDMX
  const lunesTarde = Date.parse("2026-10-05T20:00:00Z"); // lunes 5, 14:00 en CDMX
  const martes = Date.parse("2026-10-06T18:00:00Z"); // martes 6, 12:00 en CDMX
  const miercoles = Date.parse("2026-10-07T18:00:00Z");
  assert.equal(diaLocal(lunesNoche), "2026-10-05");
  assert.equal(diaLocal(martes), "2026-10-06");

  // Hoy siempre cuenta aunque la sesión aún no esté guardada; varias sesiones
  // del mismo día cuentan una vez; fechas inválidas se ignoran.
  assert.equal(contarDiasActivos([], lunesTarde), 1);
  assert.equal(contarDiasActivos([new Date(lunesTarde).toISOString(), lunesNoche], lunesNoche), 1);
  assert.equal(contarDiasActivos([lunesTarde, "no-es-fecha"], martes), 2);
  assert.equal(contarDiasActivos([lunesTarde, martes], miercoles), 3);

  // Día 1: nada. Día 2: primer popup del 20%.
  assert.equal(siguienteIntento(undefined, 1, lunesTarde), null);
  assert.equal(siguienteIntento({}, 2, martes), 1);

  // Ya salió el primero hoy: no se repite el mismo día aunque recargue.
  const trasPrimero = { intentos: [{ dia: diaLocal(martes), en: martes, respuesta: "rechazo" }] };
  assert.equal(siguienteIntento(trasPrimero, 2, martes + 60_000), null);
  // Tercer día de actividad (otro día): segundo popup.
  assert.equal(siguienteIntento(trasPrimero, 3, miercoles), 2);
  // Otro día pero sin tercer día de actividad (p. ej. datos incompletos): espera.
  assert.equal(siguienteIntento(trasPrimero, 2, miercoles), null);
  // Después del segundo ya no hay más popups.
  const trasSegundo = {
    intentos: [...trasPrimero.intentos, { dia: diaLocal(miercoles), en: miercoles, respuesta: "rechazo" }],
  };
  assert.equal(siguienteIntento(trasSegundo, 9, miercoles + 7 * 86_400_000), null);

  // El 20% se cobra sólo dentro de las 24 h del último popup.
  assert.equal(oferta20Vigente(undefined, martes), false);
  assert.equal(oferta20Vigente(trasPrimero, martes + OFERTA_PRO_VIGENCIA_MS - 1), true);
  assert.equal(oferta20Vigente(trasPrimero, martes + OFERTA_PRO_VIGENCIA_MS), false);
  assert.equal(oferta20Vigente(trasSegundo, miercoles + 3_600_000), true);

  assert.equal(precioConOferta(3000), 2400);
  assert.equal(esMotivoRechazo("caro"), true);
  assert.equal(esMotivoRechazo("cualquier-cosa"), false);

  console.log("oferta-pro: ok");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
