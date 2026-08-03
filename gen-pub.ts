import { seedQuestions, seedMateriales } from "./src/lib/store/seed";
const qs = seedQuestions().filter((q: any) => q.id.startsWith("q_la_"));
console.log(JSON.stringify({ q: qs, m: seedMateriales() }));
