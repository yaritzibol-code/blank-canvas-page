import { read, update } from "./db";

export interface LibraryReadingProgress {
  id: string;
  userId: string;
  materialId: string;
  lastPage: number;
  furthestPage: number;
  totalPages: number;
  visitedPages: number[];
  bookmarks: number[];
  readingZoom?: number;
  readingFit?: "width" | "page";
  updatedAt: string;
}

const KEY = "library_progress";

export function getLibraryProgress(userId: string, materialId: string): LibraryReadingProgress | null {
  return read<LibraryReadingProgress[]>(KEY, []).find(
    (entry) => entry.userId === userId && entry.materialId === materialId,
  ) ?? null;
}

export function getLibraryProgressForUser(userId: string): LibraryReadingProgress[] {
  return read<LibraryReadingProgress[]>(KEY, []).filter((entry) => entry.userId === userId);
}

export function saveLibraryPage(userId: string, materialId: string, page: number, totalPages: number): void {
  if (!userId || !materialId || !Number.isInteger(page) || page < 1 || !Number.isInteger(totalPages) || totalPages < 1) return;
  update<LibraryReadingProgress[]>(KEY, [], (entries) => {
    const id = `${userId}:${materialId}`;
    const current = entries.find((entry) => entry.id === id);
    const next: LibraryReadingProgress = {
      ...current,
      id, userId, materialId,
      lastPage: Math.min(page, totalPages),
      furthestPage: Math.max(current?.furthestPage ?? 1, Math.min(page, totalPages)),
      totalPages,
      visitedPages: [...new Set([...(current?.visitedPages ?? []), Math.min(page, totalPages)])].sort((a, b) => a - b),
      bookmarks: current?.bookmarks ?? [],
      updatedAt: new Date().toISOString(),
    };
    return [...entries.filter((entry) => entry.id !== id), next];
  });
}

export function saveLibraryReaderPreferences(
  userId: string,
  materialId: string,
  preferences: { zoom: number; fit: "width" | "page" },
): void {
  if (!userId || !materialId || !Number.isFinite(preferences.zoom)) return;
  update<LibraryReadingProgress[]>(KEY, [], (entries) => entries.map((entry) =>
    entry.userId === userId && entry.materialId === materialId
      ? { ...entry, readingZoom: preferences.zoom, readingFit: preferences.fit, updatedAt: new Date().toISOString() }
      : entry,
  ));
}

export function toggleLibraryBookmark(userId: string, materialId: string, page: number): void {
  if (!userId || !materialId || !Number.isInteger(page) || page < 1) return;
  update<LibraryReadingProgress[]>(KEY, [], (entries) => {
    const id = `${userId}:${materialId}`;
    const current = entries.find((entry) => entry.id === id);
    if (!current) return entries;
    const bookmarks = current.bookmarks.includes(page)
      ? current.bookmarks.filter((value) => value !== page)
      : [...current.bookmarks, page].sort((a, b) => a - b);
    return entries.map((entry) => entry.id === id ? { ...entry, bookmarks, updatedAt: new Date().toISOString() } : entry);
  });
}
