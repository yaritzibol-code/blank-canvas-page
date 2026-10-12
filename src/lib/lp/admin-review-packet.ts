import { z } from "zod";
import type { HandbookLearningPathDocument } from "./handbook-types";
import { validateApprovedAircraftTeachingBoard } from "./ciaac-aircraft-approved/teaching-board";

export const REVIEW_PACKET_MAX_BYTES = 32 * 1024 * 1024;
export const REVIEW_PACKET_EXPECTED_LESSONS = 129;
export const REVIEW_AUTH_INTERVAL_MS = 30_000;
function fail(message: string): never {
  throw new Error(message);
}
const unsafeKey = (key: string) => ["__proto__", "prototype", "constructor"].includes(key);

/** Bounded JSON parser: duplicate keys must be rejected before JSON.parse could erase them. */
export function parseReviewJSON(text: string): unknown {
  if (new TextEncoder().encode(text).byteLength > REVIEW_PACKET_MAX_BYTES)
    fail("El archivo supera 32 MiB.");
  let position = 0;
  let nodes = 0;
  const whitespace = () => {
    while (/[\x20\t\r\n]/.test(text[position] ?? "!")) position++;
  };
  const string = (): string => {
    const start = position++;
    while (position < text.length) {
      const char = text[position++];
      if (char === "\\") position++;
      else if (char === '"') {
        const value = JSON.parse(text.slice(start, position)) as string;
        if (value.length > 512 * 1024) fail("Una cadena supera el límite del paquete.");
        return value;
      }
    }
    return fail("JSON incompleto.");
  };
  const value = (depth: number): unknown => {
    if (++nodes > 400_000 || depth > 32) fail("El paquete excede los límites de estructura.");
    whitespace();
    const char = text[position];
    if (char === '"') return string();
    if (char === "{" || char === "[") {
      const object = char === "{";
      position++;
      const result: Record<string, unknown> | unknown[] = object ? Object.create(null) : [];
      const keys = new Set<string>();
      let count = 0;
      whitespace();
      const end = object ? "}" : "]";
      if (text[position] === end) {
        position++;
        return result;
      }
      while (position < text.length) {
        if (++count > 2000) fail("Demasiados elementos en una colección.");
        whitespace();
        if (object) {
          if (text[position] !== '"') fail("Clave JSON inválida.");
          const key = string();
          if (unsafeKey(key) || keys.has(key)) fail("Clave insegura o duplicada en el paquete.");
          keys.add(key);
          whitespace();
          if (text[position++] !== ":") fail("JSON inválido.");
          (result as Record<string, unknown>)[key] = value(depth + 1);
        } else (result as unknown[]).push(value(depth + 1));
        whitespace();
        const separator = text[position++];
        if (separator === end) return result;
        if (separator !== ",") fail("JSON inválido.");
      }
      return fail("JSON incompleto.");
    }
    const match = /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(
      text.slice(position),
    );
    if (!match) return fail("JSON inválido.");
    position += match[0].length;
    const primitive = JSON.parse(match[0]);
    if (typeof primitive === "number" && !Number.isFinite(primitive))
      fail("Número fuera de rango.");
    return primitive;
  };
  const result = value(0);
  whitespace();
  if (position !== text.length) fail("Contenido adicional fuera del JSON.");
  return result;
}

const plain = z
  .string()
  .max(32_768)
  .refine(
    // Reject markup and control characters rather than silently altering lesson text.
    // eslint-disable-next-line no-control-regex
    (s) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]|<\/?[a-z!]|javascript\s*:/i.test(s),
    "Texto o marcado inseguro",
  );
const short = plain.refine((s) => s.length <= 600, "Texto demasiado largo");
const nonemptyText = plain.refine((s) => s.length > 0, "Texto vacío");
const nonempty = plain.refine(
  (s) => s.length > 0 && s.length <= 4096,
  "Texto vacío o demasiado largo",
);
const index = z.number().int().min(0).max(100_000);
const scalar = z.number().finite().min(0).max(100_000);
const percent = z.number().finite().min(0).max(100);
const indexes = z.array(index).max(256);
const strings = z.array(plain).max(256);
const identifier = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-]*(?:\/[a-z0-9][a-z0-9-]*){2,5}$/)
  .max(240);
const logicalPath = z
  .string()
  .max(500)
  .regex(/^\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.svg$/);
const publicHTTPS = z
  .string()
  .max(2048)
  .refine((input) => {
    try {
      const url = new URL(input);
      const host = url.hostname.toLowerCase();
      return (
        url.protocol === "https:" &&
        !url.username &&
        !url.password &&
        (!url.port || url.port === "443") &&
        /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,63}$/.test(host) &&
        !/(?:^|\.)(?:localhost|local|internal|test|invalid|example|onion)$/.test(host) &&
        // eslint-disable-next-line no-control-regex
        !/[\s\\\u0000-\u001f]/.test(input)
      );
    } catch {
      return false;
    }
  }, "La referencia debe ser una URL HTTPS pública");
const card = z
  .object({
    title: nonempty,
    text: plain,
    detailText: plain.optional(),
    covers: indexes,
    wide: z.boolean().optional(),
  })
  .strict();
const crop = z
  .object({
    x: percent,
    y: percent,
    width: z.number().min(0.1).max(100),
    height: z.number().min(0.1).max(100),
    assetAspectRatio: z.number().min(0.01).max(100),
  })
  .strict()
  .refine((v) => v.x + v.width <= 100 && v.y + v.height <= 100);
const figure = z
  .object({
    caption: plain.optional(),
    chapter: index,
    topic: index,
    anchor: index,
    pdf_page: index,
    number: nonempty,
    file: logicalPath,
    observe: plain,
    alt: nonempty,
    heading: short.optional(),
    assetAspectRatio: z.number().min(0.01).max(100).optional(),
    crop: crop.optional(),
    focus: z.object({ x: percent, y: percent, label: short }).strict().optional(),
  })
  .strict();
const boardShared = {
  contextFigureNumber: nonempty.optional(),
  noteCardIndexes: indexes.optional(),
};
const board = z.discriminatedUnion("kind", [
  z
    .object({
      ...boardShared,
      kind: z.literal("comparison"),
      panels: z
        .array(z.object({ title: nonempty, figureNumber: nonempty, cardIndexes: indexes }).strict())
        .min(2)
        .max(32),
    })
    .strict(),
  z
    .object({
      ...boardShared,
      kind: z.literal("mechanism"),
      figureNumber: nonempty,
      parts: z
        .array(
          z
            .object({
              cardIndex: index,
              x: percent,
              y: percent,
              labelX: percent.optional(),
              labelY: percent.optional(),
            })
            .strict(),
        )
        .min(1)
        .max(64),
    })
    .strict(),
]);
const question = z
  .object({
    prompt: nonempty,
    options: z.array(nonempty).min(2).max(12),
    feedback: plain,
    correct: index,
    order: indexes,
    after: index.optional(),
    chapter: index.optional(),
    topic: index.optional(),
  })
  .strict();
const stage = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("intro"), nav: nonempty }).strict(),
  z
    .object({
      kind: z.literal("content"),
      id: nonempty.optional(),
      nav: nonempty,
      title: nonempty,
      cards: z.array(card).max(100),
      figures: z.array(figure).max(64),
      board: board.optional(),
      propellerDiagram: z.enum(["geometry", "pitch", "forces"]).optional(),
      visualStage: index.optional(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("quiz"),
      nav: nonempty,
      questions: indexes.min(1),
      cards: z.array(card).max(100).optional(),
      diagnostic: z.boolean().optional(),
    })
    .strict(),
  z.object({ kind: z.literal("exercise"), nav: nonempty }).strict(),
  z.object({ kind: z.literal("activity"), nav: nonempty, activityIndex: index }).strict(),
  z.object({ kind: z.literal("finish"), nav: nonempty }).strict(),
]);
const exercise = z.union([
  z
    .object({
      kind: z.literal("match"),
      title: nonempty,
      instruction: plain,
      pairs: z
        .array(z.tuple([nonemptyText, nonemptyText]))
        .min(1)
        .max(64),
      order: indexes,
    })
    .strict(),
  z
    .object({
      kind: z.literal("sequence"),
      title: nonempty,
      instruction: plain,
      items: z.array(nonempty).min(1).max(64),
      order: indexes,
    })
    .strict(),
  z
    .object({
      kind: z.enum([
        "axes",
        "load",
        "turn",
        "radius",
        "pitot",
        "balance",
        "metar",
        "papi",
        "wind",
        "fuel",
      ]),
      title: nonempty,
      instruction: plain,
    })
    .strict(),
]);
const activity = z
  .object({
    title: nonempty,
    kind: z.enum([
      "true_false",
      "fill_blank",
      "multiple_choice",
      "short_answer",
      "match",
      "classification",
      "diagram_label",
      "calculation",
      "fill_table",
    ]),
    instruction: plain,
    items: strings,
    answer: z.union([plain, strings]),
    runtimeMapping: z
      .object({ questions: indexes.optional(), exercise: z.boolean().optional() })
      .strict(),
  })
  .strict();
const documentSchema = z
  .object({
    contentVersion: short.optional(),
    assessmentVersion: short.optional(),
    number: index,
    title: nonempty,
    intro: plain,
    cards: z.array(card).max(256),
    questions: z.array(question).max(256),
    tips: strings,
    chapter: index,
    chapter_name: short,
    name: short,
    subtopics: z
      .array(
        z
          .object({
            level: index,
            name: short,
            source_pdf_page: index.nullable(),
            source_print_page: short,
            source_method: short,
          })
          .strict(),
      )
      .max(256),
    source_pdf_page: index.nullable(),
    source_print_page: short,
    figures: z.array(figure).max(256),
    exercise: exercise.nullable(),
    objectives: strings,
    minutes: scalar,
    stages: z.array(stage).min(1).max(128),
    sourceLabel: short.optional(),
    chapterLabel: short.optional(),
    sources: z
      .array(
        z
          .object({
            id: nonempty,
            title: nonempty,
            url: publicHTTPS.optional(),
            role: plain,
            verified_locators: strings.optional(),
            limit: plain.optional(),
          })
          .strict(),
      )
      .max(64)
      .optional(),
    completionChecks: strings.optional(),
    ciaac: z
      .object({ lessonNumber: index, activities: z.array(activity).max(128) })
      .strict()
      .optional(),
    exerciseFigures: z.array(figure).max(64).optional(),
  })
  .strict();
const catalogEntry = z
  .object({
    id: identifier,
    code: nonempty,
    title: nonempty,
    subjectId: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .max(120),
    subject: nonempty,
    order: index,
    status: z.enum(["published", "candidate", "source-pending", "incomplete"]),
    notes: strings,
  })
  .strict();
const packetSchema = z
  .object({
    format: z.literal("flightpath.admin-review"),
    version: z.literal(1),
    title: nonempty,
    createdAt: z.string().datetime({ offset: true }),
    catalog: z.array(catalogEntry).min(1).max(REVIEW_PACKET_EXPECTED_LESSONS),
    documents: z.record(identifier, documentSchema),
    assets: z.record(
      logicalPath,
      z
        .object({
          mime: z.literal("image/svg+xml"),
          content: z
            .string()
            .min(1)
            .max(512 * 1024),
        })
        .strict(),
    ),
  })
  .strict();
export type ReviewPacket = z.infer<typeof packetSchema>;
export type ReviewPacketEntry = ReviewPacket["catalog"][number];

/** SVG is never inserted as HTML. Only reserialized inert vector primitives become image Blobs. */
export function validateReviewSVG(content: string, budget?: { remaining: number }): string {
  if (/<!DOCTYPE|<!ENTITY|<\?|\b(?:javascript|data)\s*:/i.test(content))
    fail("SVG con instrucciones, entidades o recursos no permitidos.");
  const xml = new DOMParser().parseFromString(content, "image/svg+xml");
  if (xml.querySelector("parsererror") || xml.documentElement.localName !== "svg")
    fail("SVG inválido.");
  const tags = new Set([
    "svg",
    "g",
    "path",
    "rect",
    "circle",
    "ellipse",
    "line",
    "polyline",
    "polygon",
    "text",
    "tspan",
    "title",
    "desc",
    "defs",
    "linearGradient",
    "radialGradient",
    "stop",
    "clipPath",
    "mask",
    "marker",
    "pattern",
  ]);
  const attributes = new Set([
    "id",
    "xmlns",
    "viewBox",
    "width",
    "height",
    "x",
    "y",
    "x1",
    "x2",
    "y1",
    "y2",
    "cx",
    "cy",
    "r",
    "rx",
    "ry",
    "d",
    "points",
    "transform",
    "fill",
    "fill-rule",
    "fill-opacity",
    "stroke",
    "stroke-width",
    "stroke-opacity",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-miterlimit",
    "stroke-dasharray",
    "stroke-dashoffset",
    "opacity",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "text-anchor",
    "dominant-baseline",
    "alignment-baseline",
    "letter-spacing",
    "word-spacing",
    "dx",
    "dy",
    "rotate",
    "textLength",
    "lengthAdjust",
    "preserveAspectRatio",
    "patternUnits",
    "patternContentUnits",
    "patternTransform",
    "gradientUnits",
    "gradientTransform",
    "spreadMethod",
    "offset",
    "stop-color",
    "stop-opacity",
    "fx",
    "fy",
    "fr",
    "clip-path",
    "clip-rule",
    "clipPathUnits",
    "mask",
    "maskUnits",
    "maskContentUnits",
    "marker-start",
    "marker-mid",
    "marker-end",
    "markerWidth",
    "markerHeight",
    "refX",
    "refY",
    "orient",
    "markerUnits",
    "vector-effect",
    "paint-order",
    "role",
    "aria-label",
    "aria-hidden",
    "aria-labelledby",
    "xml:space",
    "lang",
    "data-essential",
    "data-layout-plate",
  ]);
  const elements = [...xml.querySelectorAll("*")];
  if (elements.length > 4000) fail("SVG demasiado complejo.");
  if (budget) {
    budget.remaining -= elements.length;
    if (budget.remaining < 0) fail("El conjunto de SVG excede el límite de complejidad.");
  }
  const ids = new Set<string>();
  const references: string[] = [];
  for (const element of elements) {
    if (
      !tags.has(element.localName) ||
      element.namespaceURI !== "http://www.w3.org/2000/svg" ||
      element.prefix
    )
      fail("Elemento SVG no permitido.");
    let depth = 0;
    for (let parent = element.parentElement; parent; parent = parent.parentElement)
      if (++depth > 32) fail("SVG demasiado profundo.");
    for (const attribute of [...element.attributes]) {
      const { name, value } = attribute;
      if (
        !attributes.has(name) ||
        (attribute.namespaceURI &&
          name !== "xmlns" &&
          !(
            name === "xml:space" &&
            attribute.namespaceURI === "http://www.w3.org/XML/1998/namespace"
          ))
      )
        fail("Atributo SVG no permitido.");
      if (name === "xmlns") {
        if (value !== "http://www.w3.org/2000/svg") fail("Espacio SVG inválido.");
        continue;
      }
      if (
        // eslint-disable-next-line no-control-regex
        /[<>\\\u0000-\u001f]|(?:https?|data|javascript):|expression\s*\(|-moz-binding|behavior\s*:|@|\/\*|\*\//i.test(
          value,
        )
      )
        fail("Valor SVG inseguro.");
      if (name === "xml:space" && !["preserve", "default"].includes(value))
        fail("Espaciado SVG inválido.");
      if (name === "aria-labelledby") references.push(...value.split(/\s+/));
      if (name === "id") {
        if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,100}$/.test(value) || ids.has(value))
          fail("Identificador SVG inválido o duplicado.");
        ids.add(value);
      }
      if (/url\s*\(/i.test(value)) {
        const match = /^url\(#([a-zA-Z][a-zA-Z0-9_-]{0,100})\)$/.exec(value);
        if (
          !match ||
          ![
            "fill",
            "stroke",
            "clip-path",
            "mask",
            "marker-start",
            "marker-mid",
            "marker-end",
          ].includes(name)
        )
          fail("Referencia SVG externa o inválida.");
        references.push(match[1]);
      }
      if (
        ["width", "height", "r", "rx", "ry", "font-size", "markerWidth", "markerHeight"].includes(
          name,
        ) &&
        !/^(?:\d+(?:\.\d+)?|\.\d+)(?:px|pt|em|%)?$/.test(value)
      )
        fail("Dimensión SVG inválida.");
      if (
        ["width", "height", "r", "rx", "ry", "font-size", "markerWidth", "markerHeight"].includes(
          name,
        ) &&
        parseFloat(value) > 16384
      )
        fail("Dimensión SVG demasiado grande.");
    }
  }
  if (references.some((id) => !ids.has(id))) fail("Referencia SVG interna sin resolver.");
  const walker = xml.createTreeWalker(xml, 128 | 8); // Processing instructions and comments.
  const remove: Node[] = [];
  while (walker.nextNode()) {
    if (walker.currentNode.nodeType === 7) fail("Instrucción SVG no permitida.");
    remove.push(walker.currentNode);
  }
  for (const node of remove) node.parentNode?.removeChild(node);
  return new XMLSerializer().serializeToString(xml.documentElement);
}

export function validateReviewPacket(
  text: string,
  publishedIds: ReadonlySet<string>,
): ReviewPacket {
  const checked = packetSchema.safeParse(parseReviewJSON(text));
  if (!checked.success)
    fail(`Paquete incompatible: ${checked.error.issues[0]?.path.join(".") || "estructura"}.`);
  const packet = checked.data;
  const ids = new Set<string>();
  const codes = new Set<string>();
  const usedAssets = new Set<string>();
  const permutation = (order: number[], count: number) =>
    order.length === count && new Set(order).size === count && order.every((i) => i < count);
  const checkIndexes = (references: number[], count: number) => {
    if (references.some((i) => i >= count) || new Set(references).size !== references.length)
      fail("Referencia de ejercicio sin resolver o duplicada.");
  };
  for (const entry of packet.catalog) {
    if (ids.has(entry.id) || codes.has(entry.code)) fail("Lección o código duplicado.");
    ids.add(entry.id);
    codes.add(entry.code);
    if (!entry.id.startsWith(`ciaac/${entry.subjectId}/`))
      fail("La materia no coincide con el identificador.");
    const document = packet.documents[entry.id];
    if (entry.status === "published") {
      if (!publishedIds.has(entry.id) || document)
        fail(
          "Una lección publicada debe verificarse en el servidor y no incluir contenido privado.",
        );
      continue;
    }
    if (publishedIds.has(entry.id)) fail("El paquete no puede sustituir una lección publicada.");
    if (!document) {
      if (entry.status !== "incomplete") fail("Falta el documento de una lección.");
      continue;
    }
    if (document.title !== entry.title)
      fail("El título del documento no coincide con el catálogo.");
    for (const q of document.questions)
      if (q.correct >= q.options.length || !permutation(q.order, q.options.length))
        fail("Opciones de pregunta inválidas.");
    if (
      document.exercise?.kind === "match" &&
      !permutation(document.exercise.order, document.exercise.pairs.length)
    )
      fail("Orden del ejercicio inválido.");
    if (
      document.exercise?.kind === "sequence" &&
      !permutation(document.exercise.order, document.exercise.items.length)
    )
      fail("Orden del ejercicio inválido.");
    if (
      document.sources &&
      new Set(document.sources.map((source) => source.id)).size !== document.sources.length
    )
      fail("Fuente duplicada.");
    for (const activity of document.ciaac?.activities ?? []) {
      checkIndexes(activity.runtimeMapping.questions ?? [], document.questions.length);
      if (activity.runtimeMapping.exercise && !document.exercise) fail("Actividad sin ejercicio.");
    }
    const figures = [...document.figures, ...(document.exerciseFigures ?? [])];
    for (const stage of document.stages) {
      if (stage.kind === "quiz") checkIndexes(stage.questions, document.questions.length);
      if (
        stage.kind === "activity" &&
        stage.activityIndex >= (document.ciaac?.activities.length ?? 0)
      )
        fail("Actividad sin resolver.");
      if (stage.kind === "exercise" && !document.exercise) fail("Etapa sin ejercicio.");
      if (stage.kind === "content") {
        figures.push(...stage.figures);
        if (new Set(stage.figures.map((f) => f.number)).size !== stage.figures.length)
          fail("Figura de etapa duplicada.");
        if (stage.board && validateApprovedAircraftTeachingBoard(stage, stage.board).length)
          fail("Referencias de tablero inválidas.");
        if (stage.propellerDiagram && (document.number !== 9 || !stage.figures.length))
          fail("Diagrama de hélice inválido.");
      }
    }
    for (const figure of figures) {
      if (!Object.hasOwn(packet.assets, figure.file)) fail("Falta una ilustración del paquete.");
      usedAssets.add(figure.file);
    }
  }
  if (Object.keys(packet.documents).some((id) => !ids.has(id)))
    fail("Documento fuera del catálogo.");
  if (Object.keys(packet.assets).length > 1500) fail("El paquete supera 1500 ilustraciones.");
  const svgBudget = { remaining: 300_000 };
  for (const [path, asset] of Object.entries(packet.assets)) {
    if (!usedAssets.has(path)) fail("Ilustración sin referencia en el catálogo.");
    asset.content = validateReviewSVG(asset.content, svgBudget);
  }
  return packet;
}

export interface MaterializedReviewPacket {
  packet: ReviewPacket;
  documents: Record<string, HandbookLearningPathDocument>;
  dispose: () => void;
}
/** Called only after validation and a fresh server authorization. All URLs have one owner. */
export function materializeReviewPacket(packet: ReviewPacket): MaterializedReviewPacket {
  const urls = new Map<string, string>();
  let disposed = false;
  const dispose = () => {
    if (!disposed) {
      disposed = true;
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
    }
  };
  try {
    for (const [path, asset] of Object.entries(packet.assets))
      urls.set(path, URL.createObjectURL(new Blob([asset.content], { type: "image/svg+xml" })));
    const documents = Object.fromEntries(
      Object.entries(packet.documents).map(([id, document]) => {
        const remapFigure = (item: z.infer<typeof figure>) => ({
          ...item,
          file: urls.get(item.file) ?? fail("Ilustración sin resolver."),
        });
        return [
          id,
          {
            ...document,
            figures: document.figures.map(remapFigure),
            exerciseFigures: document.exerciseFigures?.map(remapFigure),
            stages: document.stages.map((stage) =>
              stage.kind === "content"
                ? { ...stage, figures: stage.figures.map(remapFigure) }
                : stage,
            ),
          },
        ];
      }),
    );
    return { packet, documents, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}
