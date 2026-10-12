// Deliberately synthetic data. Never add private course drafts or their assets here.
const candidateId = "ciaac/synthetic/module/sample";
const publishedId = "ciaac/synthetic/module/published";
const missingId = "ciaac/synthetic/module/missing";
const svgPath = "/private-review/synthetic.svg";
function makePacket() {
  const figure = {
    chapter: 1,
    topic: 1,
    anchor: 1,
    pdf_page: 1,
    number: "S1",
    file: svgPath,
    observe: "Synthetic shape only.",
    alt: "A synthetic square",
    assetAspectRatio: 2,
  };
  const card = {
    title: "Synthetic card",
    text: "This is a synthetic review fixture.",
    covers: [1],
  };
  const document = {
    number: 1,
    title: "Synthetic sample",
    intro: "Private importer test content only.",
    cards: [card],
    questions: [
      {
        prompt: "Choose the square",
        options: ["Square", "Circle"],
        feedback: "The square has four equal sides.",
        correct: 0,
        order: [0, 1],
      },
    ],
    tips: ["Inspect the figure."],
    chapter: 1,
    chapter_name: "Synthetic",
    name: "Synthetic sample",
    subtopics: [],
    source_pdf_page: null,
    source_print_page: "",
    figures: [figure],
    exercise: {
      kind: "match",
      title: "Match shapes",
      instruction: "Match the synthetic names.",
      pairs: [
        ["Square", "Four sides"],
        ["Circle", "Round"],
      ],
      order: [1, 0],
    },
    objectives: ["Test the private importer"],
    minutes: 1,
    stages: [
      { kind: "intro", nav: "Start" },
      {
        kind: "content",
        nav: "Inspect",
        title: "Synthetic content",
        cards: [card],
        figures: [figure],
      },
      { kind: "quiz", nav: "Question", questions: [0] },
      { kind: "exercise", nav: "Match" },
      { kind: "finish", nav: "Finish" },
    ],
    sources: [
      {
        id: "synthetic-source",
        title: "FAA public home",
        role: "Synthetic link test",
        url: "https://www.faa.gov/",
      },
    ],
    completionChecks: ["Inspected synthetic content"],
  };
  return {
    format: "flightpath.admin-review",
    version: 1,
    title: "Synthetic private review",
    createdAt: "2026-01-01T00:00:00Z",
    catalog: [
      {
        id: publishedId,
        code: "PUB",
        title: "Published synthetic",
        subjectId: "synthetic",
        subject: "Synthetic subject",
        order: 0,
        status: "published",
        notes: [],
      },
      {
        id: candidateId,
        code: "SYN",
        title: document.title,
        subjectId: "synthetic",
        subject: "Synthetic subject",
        order: 1,
        status: "candidate",
        notes: ["Synthetic reservation"],
      },
      {
        id: missingId,
        code: "MISS",
        title: "Missing synthetic",
        subjectId: "synthetic",
        subject: "Synthetic subject",
        order: 2,
        status: "incomplete",
        notes: ["Body still missing"],
      },
    ],
    documents: { [candidateId]: document },
    assets: {
      [svgPath]: {
        mime: "image/svg+xml",
        content:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><!-- discarded --><defs><linearGradient id="shade"><stop offset="0%" stop-color="#fff"/><stop offset="100%" stop-color="#ccc"/></linearGradient></defs><rect x="50" y="10" width="80" height="80" fill="url(#shade)"/><text x="10" y="95" font-family="Arial">Synthetic</text></svg>',
      },
    },
  };
}
module.exports = { makePacket, candidateId, publishedId, missingId, svgPath };
