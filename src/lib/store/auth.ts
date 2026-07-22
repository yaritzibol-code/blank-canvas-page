import { read, write, uid, nowISO, touch } from "./db";
import { supa, cloudEnabled } from "./cloud";
import type { User, PlanTier, UserPrefs } from "./types";
import type { SupabaseClient } from "@supabase/supabase-js";

const USERS_KEY = "users";
const SESSION_KEY = "session";

/**
 * Con Lovable Cloud activo, las cuentas viven en Supabase Auth y el perfil en
 * la tabla `profiles`; localStorage funciona como espejo síncrono para que las
 * pantallas sigan leyendo con la misma API. Sin nube, todo es local (MVP).
 */

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
  /** Mensaje informativo (p. ej. "revisa tu correo") sin ser un error. */
  info?: string;
}

/* ───────────────────── Soporte de sesión en la nube ───────────────────── */

function newLocalUser(nombre: string, email: string, marketingOptIn: boolean, passwordHash: string): User {
  const now = nowISO();
  return {
    id: uid("usr"),
    nombre,
    email,
    passwordHash,
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
    marketingOptIn,
    onboardingDone: false,
    deactivatedAt: null,
    notasInternas: "",
    prefs: defaultPrefs(),
  };
}

/** Espeja al usuario de la nube en la colección local y abre la sesión. */
function mirrorCloudUser(user: User) {
  const users = getUsers().filter((u) => u.id !== user.id && u.email.toLowerCase() !== user.email.toLowerCase());
  saveUsers([...users, user]);
  write(SESSION_KEY, user.id);
}

/** Lee el perfil de la nube del usuario autenticado (con reintento breve: el trigger puede tardar). */
async function fetchOwnProfile(userId: string): Promise<{ id: string; email: string; role: string; data: Record<string, unknown> } | null> {
  const s = supa();
  if (!s) return null;
  for (let i = 0; i < 3; i++) {
    const { data } = await s.from("profiles").select("id,email,role,data").eq("id", userId).maybeSingle();
    if (data) return data;
    await new Promise((r) => setTimeout(r, 600));
  }
  return null;
}

let openInFlight: { userId: string; promise: Promise<AuthResult> } | null = null;

async function openCloudSession(userId: string): Promise<AuthResult> {
  // El flujo OAuth puede disparar la apertura dos veces (restore + evento
  // SIGNED_IN); reutiliza la que ya está en curso para el mismo usuario.
  if (openInFlight?.userId === userId) return openInFlight.promise;
  const promise = doOpenCloudSession(userId).finally(() => {
    if (openInFlight?.userId === userId) openInFlight = null;
  });
  openInFlight = { userId, promise };
  return promise;
}

async function doOpenCloudSession(userId: string): Promise<AuthResult> {
  const prof = await fetchOwnProfile(userId);
  if (!prof) return { ok: false, error: "No pudimos cargar tu perfil. Inténtalo de nuevo." };
  const base = newLocalUser(String((prof.data as { nombre?: string }).nombre ?? ""), prof.email, false, "");
  const user: User = {
    ...base,
    ...(prof.data as Partial<User>),
    id: prof.id,
    email: prof.email,
    passwordHash: "",
    role: prof.role === "admin" ? "admin" : "student",
    lastAccess: nowISO(),
    deactivatedAt: null, // iniciar sesión dentro de los 30 días reactiva la cuenta
  };
  mirrorCloudUser(user);
  const { startCloudSession } = await import("./sync");
  await startCloudSession(user.id, user.role === "admin");
  updateUser(user.id, { lastAccess: nowISO(), deactivatedAt: null });
  return { ok: true, user };
}

/* ─────────────── Restauración y eventos globales de sesión ─────────────── */

let authSettled = false;

function markAuthSettled() {
  if (authSettled) return;
  authSettled = true;
  touch(); // re-evalúa guards/hooks que esperaban la restauración
}

/**
 * true cuando ya se sabe si hay sesión de nube o no (o cuando no hay nube).
 * Los guards de rutas privadas esperan esto antes de redirigir a /login para
 * no rebotar al usuario mientras la sesión OAuth/recovery se procesa.
 */
export function isAuthSettled(): boolean {
  return !cloudEnabled() || authSettled;
}

let listenerAttached = false;

/**
 * Listener global de auth: completa el login de Google (popup o redirect),
 * encamina los enlaces de recuperación a /reset-password y limpia la sesión
 * local si la de Supabase se cierra (p. ej. desde otra pestaña).
 */
function attachAuthListener(s: SupabaseClient) {
  if (listenerAttached || typeof window === "undefined") return;
  listenerAttached = true;
  let recoveryFlow = false;
  s.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") recoveryFlow = true;
    // Diferido: no llamar a Supabase dentro del callback (lock interno del SDK).
    setTimeout(() => {
      if (event === "PASSWORD_RECOVERY") {
        if (window.location.pathname !== "/reset-password") {
          window.location.replace("/reset-password");
        }
        return;
      }
      if (event === "SIGNED_IN" && session?.user) {
        if (recoveryFlow) return; // lo maneja /reset-password
        const userId = session.user.id;
        const finish = () => {
          markAuthSettled();
          // Tras OAuth el broker regresa al origen (o a /login); con la sesión
          // ya espejada, lleva al usuario a su dashboard.
          const path = window.location.pathname;
          if (path === "/" || path === "/login" || path === "/register") {
            window.location.href = "/dashboard";
          }
        };
        if (getSessionUserId() !== userId) {
          void openCloudSession(userId).then((res) => {
            if (res.ok) finish();
            else markAuthSettled();
          });
        } else {
          finish();
        }
        return;
      }
      if (event === "SIGNED_OUT" && getSessionUserId()) {
        void import("./sync").then(({ stopCloudSession }) => stopCloudSession());
        write(SESSION_KEY, null);
      }
    }, 0);
  });
}

/** Restaura la sesión de nube al abrir la app (la llama initOnce en hooks.ts). */
export async function restoreCloudSession(): Promise<void> {
  if (!cloudEnabled()) {
    markAuthSettled();
    return;
  }
  const s = supa();
  if (!s) {
    markAuthSettled();
    return;
  }
  attachAuthListener(s);
  try {
    // getSession espera a que el SDK procese los tokens del hash de la URL
    // (retorno de OAuth, confirmación de correo, enlace de recuperación).
    const { data } = await s.auth.getSession();
    const cloudUser = data.session?.user;
    if (cloudUser) {
      const local = getSessionUserId();
      if (local !== cloudUser.id) {
        // Sesión nueva (OAuth, confirmación, recovery): espeja antes de
        // liberar los guards para que no reboten a /login.
        await openCloudSession(cloudUser.id);
      } else {
        // Ya hay espejo local: los guards pueden decidir de inmediato y la
        // hidratación de datos corre en segundo plano.
        markAuthSettled();
        const { startCloudSession } = await import("./sync");
        const me = getUserById(cloudUser.id);
        await startCloudSession(cloudUser.id, me?.role === "admin");
      }
    } else if (getSessionUserId()) {
      // En modo nube la sesión de Supabase manda: sin ella no hay sesión local.
      write(SESSION_KEY, null);
    }
  } finally {
    markAuthSettled();
  }
}

export async function register(input: {
  nombre: string;
  email: string;
  password: string;
  marketingOptIn?: boolean;
}): Promise<AuthResult> {
  const nombre = input.nombre.trim();
  const email = input.email.trim().toLowerCase();
  if (!nombre) return { ok: false, error: "Escribe tu nombre completo." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "Escribe un correo válido." };
  if (input.password.length < 8)
    return { ok: false, error: "La contraseña debe tener mínimo 8 caracteres." };

  if (cloudEnabled()) {
    const s = supa()!;
    const emailRedirectTo = typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;
    const { data, error } = await s.auth.signUp({
      email,
      password: input.password,
      options: { data: { nombre, marketingOptIn: !!input.marketingOptIn }, emailRedirectTo },
    });
    if (error) {
      const msg = /already registered/i.test(error.message)
        ? "Ya existe una cuenta con este correo. Inicia sesión."
        : error.message;
      return { ok: false, error: msg };
    }
    if (!data.session) {
      return { ok: true, info: "Te enviamos un correo para confirmar tu cuenta. Confírmala e inicia sesión." };
    }
    return openCloudSession(data.user!.id);
  }

  return registerLocal({ nombre, email, password: input.password, marketingOptIn: input.marketingOptIn });
}

function registerLocal(input: {
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

  const user = newLocalUser(nombre, email, !!input.marketingOptIn, hashPassword(input.password));
  saveUsers([...getUsers(), user]);
  write(SESSION_KEY, user.id);
  return { ok: true, user };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  if (cloudEnabled()) {
    const s = supa()!;
    const { data, error } = await s.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) {
      const msg = /invalid login credentials/i.test(error.message)
        ? "Correo o contraseña incorrectos. Inténtalo de nuevo."
        : /email not confirmed/i.test(error.message)
          ? "Confirma tu correo antes de iniciar sesión (revisa tu bandeja)."
          : error.message;
      return { ok: false, error: msg };
    }
    return openCloudSession(data.user.id);
  }

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
  if (cloudEnabled()) {
    void import("./sync").then(({ stopCloudSession }) => stopCloudSession());
    void supa()?.auth.signOut();
  }
  write(SESSION_KEY, null);
}

export async function changePassword(userId: string, actual: string, nueva: string): Promise<AuthResult> {
  const user = getUserById(userId);
  if (!user) return { ok: false, error: "Sesión no válida." };
  if (nueva.length < 8)
    return { ok: false, error: "La nueva contraseña debe tener mínimo 8 caracteres." };

  if (cloudEnabled()) {
    const s = supa()!;
    // Verifica la contraseña actual re-autenticando.
    const { error: authErr } = await s.auth.signInWithPassword({ email: user.email, password: actual });
    if (authErr) return { ok: false, error: "La contraseña actual no es correcta." };
    const { error } = await s.auth.updateUser({ password: nueva });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  if (user.passwordHash !== hashPassword(actual))
    return { ok: false, error: "La contraseña actual no es correcta." };
  updateUser(userId, { passwordHash: hashPassword(nueva) });
  return { ok: true };
}

/**
 * Restablecimiento de contraseña.
 * Nube: envía el enlace de recuperación al correo (la nueva contraseña se
 * define desde ese enlace). Local (MVP sin correo): la actualiza directo.
 */
export async function resetPassword(email: string, nueva: string): Promise<AuthResult> {
  if (cloudEnabled()) {
    const s = supa()!;
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
    const { error } = await s.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
    if (error) return { ok: false, error: error.message };
    return { ok: true, info: "Te enviamos un correo con el enlace para restablecer tu contraseña." };
  }
  const user = getUserByEmail(email);
  if (!user) return { ok: false, error: "No encontramos una cuenta con ese correo." };
  if (nueva.length < 8)
    return { ok: false, error: "La nueva contraseña debe tener mínimo 8 caracteres." };
  updateUser(user.id, { passwordHash: hashPassword(nueva) });
  return { ok: true };
}

/** Actualiza la contraseña del usuario autenticado (usado desde /reset-password). */
export async function updateCurrentPassword(nueva: string): Promise<AuthResult> {
  if (nueva.length < 8) return { ok: false, error: "La nueva contraseña debe tener mínimo 8 caracteres." };
  if (cloudEnabled()) {
    const s = supa()!;
    const { error } = await s.auth.updateUser({ password: nueva });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }
  return { ok: false, error: "Restablecimiento por enlace requiere Lovable Cloud." };
}

/** Solicitud de eliminación: desactiva la cuenta con 30 días para recuperar. */
export function requestAccountDeletion(userId: string) {
  updateUser(userId, { deactivatedAt: nowISO() });
  if (cloudEnabled()) {
    // Persiste la desactivación antes de cerrar la sesión de nube.
    const user = getUserById(userId);
    const s = supa();
    if (user && s) {
      const { id, email, role, passwordHash: _pw, ...data } = user;
      void s
        .from("profiles")
        .upsert({ id, email, role, data })
        .then(() => {
          void import("./sync").then(({ stopCloudSession }) => stopCloudSession());
          void s.auth.signOut();
        });
    }
  }
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
