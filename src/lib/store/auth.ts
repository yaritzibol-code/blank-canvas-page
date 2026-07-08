import { read, write, uid, nowISO } from "./db";
import type { User, PlanTier, UserPrefs } from "./types";

const USERS_KEY = "users";
const SESSION_KEY = "session";

/**
 * Hash determinista simple (FNV-1a con sal). Suficiente para el MVP local:
 * evita guardar contraseñas en claro; una pasarela de auth real lo sustituirá.
 */
export function hashPassword(pw: string): string {
  const salted = `flightpath::${pw}::ciaac`;
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < salted.length; i++) {
    const c = salted.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ ((c << 5) | (c >>> 3)), 0x85ebca6b) >>> 0;
  }
  return `${h1.toString(36)}.${h2.toString(36)}`;
}

export function defaultPrefs(): UserPrefs {
  return {
    theme: "claro",
    textSize: "Normal",
    toggles: { whatsapp: true, racha: true, simulador: true, bitacora: true, pathy: true },
  };
}

export function getUsers(): User[] {
  return read<User[]>(USERS_KEY, []);
}

export function saveUsers(users: User[]) {
  write(USERS_KEY, users);
}

export function getUserById(id: string): User | null {
  return getUsers().find((u) => u.id === id) ?? null;
}

export function getUserByEmail(email: string): User | null {
  const e = email.trim().toLowerCase();
  return getUsers().find((u) => u.email.toLowerCase() === e) ?? null;
}

export function updateUser(id: string, patch: Partial<User>): User | null {
  let updated: User | null = null;
  const users = getUsers().map((u) => {
    if (u.id !== id) return u;
    updated = { ...u, ...patch };
    return updated;
  });
  if (updated) saveUsers(users);
  return updated;
}

export function getSessionUserId(): string | null {
  return read<string | null>(SESSION_KEY, null);
}

export function getSessionUser(): User | null {
  const id = getSessionUserId();
  return id ? getUserById(id) : null;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
  user?: User;
}

export function register(input: {
  nombre: string;
  email: string;
  password: string;
  marketingOptIn?: boolean;
}): AuthResult {
  const nombre = input.nombre.trim();
  const email = input.email.trim().toLowerCase();
  if (!nombre) return { ok: false, error: "Escribe tu nombre completo." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "Escribe un correo válido." };
  if (input.password.length < 8)
    return { ok: false, error: "La contraseña debe tener mínimo 8 caracteres." };
  if (getUserByEmail(email))
    return { ok: false, error: "Ya existe una cuenta con este correo. Inicia sesión." };

  const now = nowISO();
  const user: User = {
    id: uid("usr"),
    nombre,
    email,
    passwordHash: hashPassword(input.password),
    whatsapp: "",
    whatsappEstado: "sin_numero",
    escuela: "",
    fechaCiaac: null,
    perfilCiaac: "",
    role: "student",
    plan: "basica",
    planNombre: "Suscripción básica",
    accessStatus: "activo",
    accessStart: now,
    accessEnd: null,
    createdAt: now,
    lastAccess: now,
    marketingOptIn: !!input.marketingOptIn,
    onboardingDone: false,
    deactivatedAt: null,
    notasInternas: "",
    prefs: defaultPrefs(),
  };
  saveUsers([...getUsers(), user]);
  write(SESSION_KEY, user.id);
  return { ok: true, user };
}

export function login(email: string, password: string): AuthResult {
  const user = getUserByEmail(email);
  if (!user) return { ok: false, error: "No encontramos una cuenta con ese correo." };
  if (user.passwordHash !== hashPassword(password))
    return { ok: false, error: "Contraseña incorrecta. Inténtalo de nuevo." };
  if (user.deactivatedAt) {
    // Cuenta en periodo de recuperación de 30 días: iniciar sesión la reactiva.
    updateUser(user.id, { deactivatedAt: null, lastAccess: nowISO() });
  } else {
    updateUser(user.id, { lastAccess: nowISO() });
  }
  write(SESSION_KEY, user.id);
  return { ok: true, user: getUserById(user.id) ?? user };
}

export function logout() {
  write(SESSION_KEY, null);
}

export function changePassword(userId: string, actual: string, nueva: string): AuthResult {
  const user = getUserById(userId);
  if (!user) return { ok: false, error: "Sesión no válida." };
  if (user.passwordHash !== hashPassword(actual))
    return { ok: false, error: "La contraseña actual no es correcta." };
  if (nueva.length < 8)
    return { ok: false, error: "La nueva contraseña debe tener mínimo 8 caracteres." };
  updateUser(userId, { passwordHash: hashPassword(nueva) });
  return { ok: true };
}

/** Restablecimiento local (MVP sin correo): valida que el correo exista. */
export function resetPassword(email: string, nueva: string): AuthResult {
  const user = getUserByEmail(email);
  if (!user) return { ok: false, error: "No encontramos una cuenta con ese correo." };
  if (nueva.length < 8)
    return { ok: false, error: "La nueva contraseña debe tener mínimo 8 caracteres." };
  updateUser(user.id, { passwordHash: hashPassword(nueva) });
  return { ok: true };
}

/** Solicitud de eliminación: desactiva la cuenta con 30 días para recuperar. */
export function requestAccountDeletion(userId: string) {
  updateUser(userId, { deactivatedAt: nowISO() });
  write(SESSION_KEY, null);
}

/** Elimina definitivamente cuentas cuya desactivación superó los 30 días. */
export function purgeExpiredAccounts() {
  const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
  const users = getUsers();
  const keep = users.filter(
    (u) => !u.deactivatedAt || new Date(u.deactivatedAt).getTime() > cutoff,
  );
  if (keep.length !== users.length) saveUsers(keep);
}
