/** This isolated UI fixture must never submit reports or contact an account. */
export async function flushCloudWrites() {
  throw new Error("External writes are disabled in the isolated CIAAC fixture.");
}
export function submitReport() {
  throw new Error("External writes are disabled in the isolated CIAAC fixture.");
}
