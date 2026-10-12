/** Contract tests using real domain modules and an in-memory database. NOT live E2E. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { isolatedStore } = require("./helpers/isolated-store.cjs");
const user = Object.freeze({
  id: "qa-student-a",
  email: "student-a@example.invalid",
  nombre: "Estudiante de prueba A",
});
const other = "qa-student-b";
const setup = () => {
  const harness = isolatedStore();
  return { ...harness, domain: harness.load("src/lib/store/domain.ts") };
};

test("question bank excludes drafts/hidden questions and limits deterministic free set", () => {
  const { domain: d } = setup();
  for (let i = 0; i < 14; i++)
    d.createQuestion({
      materia: "aerodinamica",
      text: `Fixture ${i}`,
      options: ["A", "B"],
      correctIndex: 0,
      explanation: "Fixture",
      status: i < 12 ? "publicada" : "borrador",
    });
  d.createQuestion({
    materia: "otra",
    text: "Other subject",
    options: ["A"],
    correctIndex: 0,
    explanation: "",
    status: "publicada",
  });
  assert.equal(d.getPublishedQuestions("aerodinamica").length, 12);
  assert.equal(d.getFreeQuestions("aerodinamica").length, 10);
  const q = d.getPublishedQuestions("aerodinamica")[0];
  d.saveQuestion({ ...q, status: "oculta" });
  assert.equal(d.getPublishedQuestions("aerodinamica").length, 11);
  assert.equal(
    d.getFreeQuestions("aerodinamica").some((x) => x.id === q.id),
    false,
  );
});

test("quiz and interrupted simulator preserve actual answers and isolate accounts", async () => {
  const { domain: d, load, evidence } = setup();
  d.saveQuizAttempt({
    userId: user.id,
    materias: ["aerodinamica"],
    total: 10,
    correct: 8,
    durationMin: 5,
    porMateria: { aerodinamica: { correct: 8, total: 10 } },
  });
  d.saveSimAttempt({
    userId: user.id,
    total: 310,
    answered: 3,
    correct: 2,
    scorePct: 1,
    durationSecs: 120,
    porMateria: { aerodinamica: { correct: 2, total: 310 } },
  });
  const a = load("src/lib/store/analytics.ts");
  const stats = a.studentStats(user.id);
  assert.equal(stats.answered, 13);
  assert.equal(stats.quizCount, 1);
  assert.equal(stats.simCount, 1);
  assert.equal(d.getQuizAttempts(other).length, 0);
  assert.equal(d.getSimAttempts(other).length, 0);
  assert.equal(a.studentStats(other).answered, 0);
  await new Promise(setImmediate);
  assert.equal(evidence.length, 2); // captured locally, never transmitted
});

test("learning paths keep first answer, retry consolidation, complete once, and isolate courses/users", () => {
  const { domain: d, load } = setup();
  const lp = load("src/lib/store/learning-course.ts");
  lp.answerLpQuestion(user.id, "jeppesen", "q1", 1);
  lp.answerLpQuestion(user.id, "jeppesen", "q1", 2);
  assert.equal(lp.getLpState(user.id, "jeppesen").answers.q1, 1);
  assert.equal(lp.getLpState(other, "jeppesen").answers.q1, undefined);
  assert.equal(lp.getLpState(user.id, "atp").answers.q1, undefined);
  const activity = { id: "c1", type: "true_false", answer: true };
  assert.equal(lp.saveLpConsolidation(user.id, "jeppesen", activity, false).correct, false);
  assert.equal(lp.saveLpConsolidation(user.id, "jeppesen", activity, true).correct, true);
  lp.completeLpLesson(user.id, "jepp/", "Jeppesen", "lesson1", "Fixture");
  lp.completeLpLesson(user.id, "jepp/", "Jeppesen", "lesson1", "Fixture");
  assert.equal(d.getTemaProgress(user.id).length, 1);
  assert.equal(d.getActivity(user.id).length, 1);
  assert.equal(lp.isLpLessonCompleted(other, "jepp/", "lesson1"), false);
});

test("library resumes reading, clamps pages, toggles bookmarks and isolates users", () => {
  const { load } = setup();
  const library = load("src/lib/store/library-progress.ts");
  library.saveLibraryPage(user.id, "manual", 4, 10);
  library.saveLibraryPage(user.id, "manual", 2, 10);
  assert.equal(library.getLibraryProgress(user.id, "manual").lastPage, 2);
  assert.equal(library.getLibraryProgress(user.id, "manual").furthestPage, 4);
  library.saveLibraryPage(user.id, "manual", 99, 10);
  assert.equal(library.getLibraryProgress(user.id, "manual").lastPage, 10);
  library.saveLibraryPage(user.id, "manual", -1, 10);
  assert.equal(library.getLibraryProgress(user.id, "manual").lastPage, 10);
  library.toggleLibraryBookmark(user.id, "manual", 4);
  assert.equal(library.getLibraryProgress(user.id, "manual").bookmarks.length, 1);
  library.toggleLibraryBookmark(user.id, "manual", 4);
  assert.equal(library.getLibraryProgress(user.id, "manual").bookmarks.length, 0);
  assert.equal(library.getLibraryProgress(other, "manual"), null);
});

test("all seven COMPASS modules record simulated results and separate user histories", () => {
  const { load } = setup();
  const compass = load("src/lib/store/compass.ts");
  const { COMPASS_MODULES } = load("src/modules/compass/config.ts");
  assert.equal(COMPASS_MODULES.length, 7);
  for (const module of COMPASS_MODULES) {
    compass.saveCompassSession({
      userId: user.id,
      mode: "practica",
      level: 2,
      seed: 42,
      result: {
        moduleId: module.id,
        input: "teclado",
        durationSec: 60,
        score: 80,
        metrics: [],
        raw: {},
        interruptions: 0,
        advice: "Fixture",
      },
    });
    assert.equal(compass.compassModuleStats(user.id, module.id).mejorScore, 80);
  }
  assert.equal(compass.getCompassSessions(user.id).length, 7);
  assert.equal(compass.getCompassSessions(other).length, 0);
});

test("RTARI stores synthetic transcript locally and counts distinct reviewed questions", () => {
  const { load } = setup();
  const rtari = load("src/lib/store/rtari.ts");
  rtari.saveRtariSession({
    userId: user.id,
    durationSec: 120,
    nivel: "estandar",
    voice: "alloy",
    questionIds: ["q1", "q1", "q2"],
    turns: [{ role: "candidate", text: "Synthetic response", at: 0 }],
  });
  assert.equal(rtari.rtariStats(user.id).sesiones, 1);
  assert.equal(rtari.rtariStats(user.id).minutos, 2);
  assert.equal(rtari.rtariStats(user.id).preguntasVistas, 2);
  assert.equal(rtari.rtariStats(user.id).ultimoNivel, null);
  assert.equal(rtari.getRtariSessions(other).length, 0);
});

test("logbook and reminder edit/delete retain account isolation", () => {
  const { domain: d } = setup();
  d.saveBitacoraEntry({
    userId: user.id,
    text: "Synthetic practice note",
    emotionIcon: "smile",
    moodLabel: "Bien",
    motiv: 3,
    conc: 3,
    conf: 3,
    materias: [],
    pathyMsg: "Fixture",
  });
  assert.equal(d.getBitacora(user.id).length, 1);
  assert.equal(d.getBitacora(other).length, 0);
  const reminder = {
    id: "r1",
    userId: user.id,
    tipo: "estudio",
    titulo: "Practice",
    sub: "",
    hora: "19:00",
    dias: [true, false, false, false, false, false, false],
    enabled: true,
    icon: "book",
    iconBg: "",
    tags: [],
    ultimoEnvio: null,
    createdAt: new Date().toISOString(),
  };
  d.saveReminder(reminder);
  d.saveReminder({ ...reminder, titulo: "Practice updated" });
  assert.equal(d.getReminders(user.id).length, 1);
  assert.equal(d.getReminders(user.id)[0].titulo, "Practice updated");
  assert.equal(d.getReminders(other).length, 0);
  d.deleteReminder("r1");
  assert.equal(d.getReminders(user.id).length, 0);
});

test("harness refuses auth, production database and network modules", () => {
  const { load } = setup();
  for (const file of [
    "src/lib/store/auth.ts",
    "src/lib/store/db.ts",
    "src/lib/store/cloud.ts",
    "node:https",
  ]) {
    assert.throws(() => load(file), /not approved/);
  }
  assert.match(user.email, /@example\.invalid$/);
  assert.equal("password" in user, false);
});
