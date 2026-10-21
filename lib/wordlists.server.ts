import { getCloudflareContext } from "@opennextjs/cloudflare";
import type {
  WordLength,
  WordListData,
  WordListStats,
  AnswerWordListPayload,
} from "@/constants/wordlist-metadata";
import { WORD_LENGTHS } from "@/constants/wordlist-metadata";
import { WORD_LIST_SUMMARY } from "@/constants/wordlist-manifest";
import { getLocalWordList } from "@/lib/wordlists.local";
import { registerWordList, getUppercaseWordList } from "@/lib/words";
import type { WordListBundle } from "@/lib/wordlist-types";

const BINDING_NAME = process.env.WORDLIST_KV_BINDING?.trim() || "WORDLISTS";
const BUNDLE_KEY_PREFIX = process.env.WORDLIST_BUNDLE_KV_KEY_PREFIX?.trim() || "wordlists-bundle:";
const FINDER_KEY_PREFIX = process.env.WORDLIST_FINDER_KV_KEY_PREFIX?.trim() || "wordlists-finder:";
const ANSWER_KEY_PREFIX = process.env.WORDLIST_ANSWER_KV_KEY_PREFIX?.trim() || "wordlists-answer:";

export const FINDER_PREVIEW_LIMIT = Number.parseInt(process.env.FINDER_PREVIEW_LIMIT ?? "300", 10);

const bundleCache = new Map<WordLength, Promise<WordListBundle>>();
const finderPreviewCache = new Map<WordLength, Promise<FinderPreviewData>>();
const answerListCache = new Map<WordLength, Promise<readonly string[]>>();

const BROWSER_ONLY_WORD_LENGTHS = new Set<WordLength>(
  WORD_LENGTHS.filter((length) => length >= 7),
);

const SPANISH_LOCALE = "es-ES";

type KvNamespace = {
  get: (key: string, options?: { type?: "text" | "json" | "arrayBuffer" | "stream" }) => Promise<unknown>;
};

type FinderPreviewStats = WordListStats;

export type FinderPreviewData = {
  preview: readonly string[];
  stats: FinderPreviewStats;
};

export type GamePageData = {
  wordListData: WordListData | null;
  stats: WordListStats;
  dailySolution: string;
  requiresBrowserBundle: boolean;
};

const shouldUseLocalWordlists = () => {
  if (process.env.USE_LOCAL_WORDLISTS === "1") {
    return true;
  }
  return process.env.NODE_ENV !== "production";
};

export const isBrowserOnlyWordLength = (wordLength: WordLength): boolean =>
  BROWSER_ONLY_WORD_LENGTHS.has(wordLength);

const shouldDeferWordListToBrowser = (wordLength: WordLength): boolean =>
  isBrowserOnlyWordLength(wordLength);

const isWordLength = (value: number): value is WordLength => WORD_LENGTHS.includes(value as WordLength);

const ensureWordLength = (value: WordLength) => {
  if (!isWordLength(value)) {
    throw new Error(`Unsupported word length: ${value}`);
  }
};

async function getKvNamespace(): Promise<KvNamespace> {
  const context = await getCloudflareContext({ async: true });
  const env = context?.env as Record<string, unknown> | undefined;
  if (!env) {
    throw new Error("Cloudflare environment bindings are unavailable in the current context.");
  }

  const namespace = env[BINDING_NAME] as KvNamespace | undefined;
  if (!namespace || typeof namespace.get !== "function") {
    throw new Error(`KV binding '${BINDING_NAME}' is not available. Ensure it is defined in wrangler.jsonc.`);
  }

  return namespace;
}

const toBundleKey = (wordLength: WordLength) => `${BUNDLE_KEY_PREFIX}${wordLength}`;
const toAnswerKey = (wordLength: WordLength) => `${ANSWER_KEY_PREFIX}${wordLength}`;

const normalizeStats = (stats: Partial<WordListStats> | undefined, wordLength: WordLength): WordListStats => {
  if (!stats) {
    throw new Error(`KV bundle for ${wordLength} letras no incluye estadísticas.`);
  }

  const answers = Number(stats.answers);
  const allowed = Number(stats.allowed);
  const unique = Number(stats.unique);

  if (!Number.isFinite(answers) || !Number.isFinite(allowed) || !Number.isFinite(unique)) {
    throw new Error(`KV bundle para ${wordLength} letras tiene estadísticas inválidas.`);
  }

  return { answers, allowed, unique };
};

const normalizeAccentMap = (accentMap: unknown, wordLength: WordLength): Record<string, string> => {
  if (!accentMap || typeof accentMap !== "object") {
    throw new Error(`KV bundle para ${wordLength} letras tiene un accentMap inválido.`);
  }

  const entries = Object.entries(accentMap as Record<string, unknown>);
  return Object.fromEntries(entries.filter((entry): entry is [string, string] => typeof entry[1] === "string"));
};

const normalizeWordArray = (value: unknown, kind: string, wordLength: WordLength): string[] => {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`KV bundle para ${wordLength} letras tiene un arreglo '${kind}' inválido.`);
  }
  return value as string[];
};

const normalizeBundle = (raw: unknown, wordLength: WordLength): WordListBundle => {
  if (!raw || typeof raw !== "object") {
    throw new Error(`KV bundle para ${wordLength} letras es inválido.`);
  }

  const record = raw as Partial<WordListBundle>;
  const allowed = normalizeWordArray(record.allowed, "allowed", wordLength);
  const answers = normalizeWordArray(record.answers, "answers", wordLength);
  const accentMap = normalizeAccentMap(record.accentMap, wordLength);
  const stats = normalizeStats(record.stats, wordLength);

  const version = typeof record.version === "string" ? record.version : undefined;
  const checksum = typeof record.checksum === "string" ? record.checksum : undefined;
  const generatedAt = typeof record.generatedAt === "string" ? record.generatedAt : undefined;

  return {
    allowed,
    answers,
    accentMap,
    stats,
    version,
    checksum,
    generatedAt,
  };
};

const normalizeAnswerPayload = (raw: unknown, wordLength: WordLength): readonly string[] => {
  if (!raw || typeof raw !== "object") {
    throw new Error(`KV answer payload para ${wordLength} letras es inválido.`);
  }

  const record = raw as Partial<AnswerWordListPayload>;
  if (!Array.isArray(record.answers) || record.answers.some((entry) => typeof entry !== "string")) {
    throw new Error(`KV answer payload para ${wordLength} letras contiene respuestas inválidas.`);
  }

  return record.answers;
};

const deriveStatsFromWordListData = (wordListData: WordListData): WordListStats => {
  const answers = wordListData.answers.length;
  const allowed = wordListData.allowed.length;
  const unique = new Set([
    ...wordListData.allowed,
    ...wordListData.answers,
    ...Object.keys(wordListData.accentMap),
    ...Object.values(wordListData.accentMap),
  ]).size;

  return { answers, allowed, unique };
};

const buildLocalBundle = async (wordLength: WordLength): Promise<WordListBundle> => {
  const data = await getLocalWordList(wordLength);
  const stats = deriveStatsFromWordListData(data);
  return {
    ...data,
    stats,
    version: "local",
    checksum: undefined,
    generatedAt: undefined,
  };
};

async function readBundleFromKv(wordLength: WordLength): Promise<WordListBundle> {
  ensureWordLength(wordLength);
  const namespace = await getKvNamespace();
  const key = toBundleKey(wordLength);
  const value = await namespace.get(key, { type: "json" });
  if (!value) {
    throw new Error(`KV key '${key}' returned no value.`);
  }

  return normalizeBundle(value, wordLength);
}

async function readAnswerListFromKv(wordLength: WordLength): Promise<readonly string[]> {
  ensureWordLength(wordLength);
  const namespace = await getKvNamespace();
  const key = toAnswerKey(wordLength);
  const value = await namespace.get(key, { type: "json" });
  if (!value) {
    throw new Error(`KV key '${key}' returned no value.`);
  }

  return normalizeAnswerPayload(value, wordLength);
}

export async function getWordListBundle(wordLength: WordLength): Promise<WordListBundle> {
  const cached = bundleCache.get(wordLength);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    if (shouldUseLocalWordlists()) {
      return buildLocalBundle(wordLength);
    }

    try {
      return await readBundleFromKv(wordLength);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[wordlists] KV bundle load failed para longitud ${wordLength}. Se usará el diccionario local.`,
          error,
        );
        return buildLocalBundle(wordLength);
      }
      throw error;
    }
  })();

  bundleCache.set(wordLength, promise);
  try {
    return await promise;
  } catch (error) {
    bundleCache.delete(wordLength);
    throw error;
  }
}

export async function getWordListData(wordLength: WordLength): Promise<WordListData> {
  const bundle = await getWordListBundle(wordLength);
  registerWordList(wordLength, bundle);
  return {
    allowed: bundle.allowed,
    answers: bundle.answers,
    accentMap: bundle.accentMap,
  };
}

export async function getWordListStats(wordLength: WordLength): Promise<WordListStats> {
  if (!shouldDeferWordListToBrowser(wordLength)) {
    const bundle = await getWordListBundle(wordLength);
    return bundle.stats;
  }

  const summary = WORD_LIST_SUMMARY[wordLength];
  if (!summary) {
    throw new Error(`No hay estadísticas disponibles para palabras de longitud ${wordLength}.`);
  }

  return {
    answers: summary.answers,
    allowed: summary.allowed,
    unique: summary.unique,
  };
}

export async function getAnswerList(wordLength: WordLength): Promise<readonly string[]> {
  if (shouldUseLocalWordlists()) {
    const data = await getLocalWordList(wordLength);
    return data.answers;
  }

  if (!shouldDeferWordListToBrowser(wordLength)) {
    const bundle = await getWordListBundle(wordLength);
    return bundle.answers;
  }

  const cached = answerListCache.get(wordLength);
  if (cached) {
    return cached;
  }

  const promise = readAnswerListFromKv(wordLength).catch((error) => {
    answerListCache.delete(wordLength);
    throw error;
  });
  answerListCache.set(wordLength, promise);
  return promise;
}

const buildFinderPreview = async (wordLength: WordLength): Promise<FinderPreviewData> => {
  if (shouldDeferWordListToBrowser(wordLength) && !shouldUseLocalWordlists()) {
    throw new Error(
      `Finder preview fallback no soportado para ${wordLength} letras sin datos locales disponibles.`,
    );
  }

  const bundle = await getWordListBundle(wordLength);
  registerWordList(wordLength, bundle);
  const uppercaseWordList = getUppercaseWordList(wordLength);
  const preview = uppercaseWordList.slice(0, FINDER_PREVIEW_LIMIT);
  return { preview, stats: bundle.stats };
};

async function readFinderPreviewFromKv(wordLength: WordLength): Promise<FinderPreviewData> {
  const namespace = await getKvNamespace();
  const key = `${FINDER_KEY_PREFIX}${wordLength}`;
  const value = await namespace.get(key, { type: "json" });
  if (!value) {
    throw new Error(`KV key '${key}' returned no value.`);
  }

  const parsed = value as FinderPreviewData;
  if (!parsed.preview || !Array.isArray(parsed.preview)) {
    throw new Error(`KV key '${key}' returned an invalid preview payload.`);
  }
  if (!parsed.stats) {
    throw new Error(`KV key '${key}' returned no stats payload.`);
  }

  return parsed;
}

export async function getFinderPreviewData(wordLength: WordLength): Promise<FinderPreviewData> {
  if (shouldUseLocalWordlists()) {
    return buildFinderPreview(wordLength);
  }

  const cached = finderPreviewCache.get(wordLength);
  if (cached) {
    return cached;
  }

  const promise = readFinderPreviewFromKv(wordLength);
  finderPreviewCache.set(wordLength, promise);
  try {
    return await promise;
  } catch (error) {
    finderPreviewCache.delete(wordLength);
    console.warn(
      `[wordlists] Finder preview load failed para longitud ${wordLength}. Se generará usando la lista completa.`,
      error,
    );
    const fallback = buildFinderPreview(wordLength);
    finderPreviewCache.set(wordLength, fallback);
    return fallback;
  }
}

export async function getFinderPageData(wordLength: WordLength): Promise<readonly string[]> {
  if (shouldDeferWordListToBrowser(wordLength) && !shouldUseLocalWordlists()) {
    throw new Error(
      `El listado completo para ${wordLength} letras solo está disponible en el navegador.`,
    );
  }

  const bundle = await getWordListBundle(wordLength);
  registerWordList(wordLength, bundle);
  const uppercaseWordList = getUppercaseWordList(wordLength);
  return uppercaseWordList;
}

export async function getGamePageData(wordLength: WordLength): Promise<GamePageData> {
  const requiresBrowserBundle = isBrowserOnlyWordLength(wordLength);

  let wordListData: WordListData | null = null;
  let stats: WordListStats;

  if (!requiresBrowserBundle) {
    const bundle = await getWordListBundle(wordLength);
    registerWordList(wordLength, bundle);
    wordListData = {
      allowed: bundle.allowed,
      answers: bundle.answers,
      accentMap: bundle.accentMap,
    };
    stats = bundle.stats;
  } else {
    stats = await getWordListStats(wordLength);
  }

  const dailySolution = await getDailySolution(wordLength);
  return {
    wordListData,
    stats,
    dailySolution,
    requiresBrowserBundle,
  };
}

export function clearWordListCache(): void {
  bundleCache.clear();
  finderPreviewCache.clear();
}

const getDaysSinceEpoch = (): number => {
  const epochDate = new Date(2022, 0, 2, 0, 0, 0, 0);
  const now = new Date();
  return Math.floor((now.getTime() - epochDate.getTime()) / (24 * 60 * 60 * 1000));
};

const ensureAnswersAvailable = (answers: readonly string[], wordLength: WordLength) => {
  if (answers.length === 0) {
    throw new Error(`La lista de respuestas para ${wordLength} letras está vacía.`);
  }
};

export async function getDailySolution(wordLength: WordLength): Promise<string> {
  const answers = await getAnswerList(wordLength);
  ensureAnswersAvailable(answers, wordLength);
  const index = getDaysSinceEpoch() % answers.length;
  return answers[index].toLocaleUpperCase(SPANISH_LOCALE);
}

export async function getRandomSolution(wordLength: WordLength): Promise<string> {
  const answers = await getAnswerList(wordLength);
  ensureAnswersAvailable(answers, wordLength);
  const index = Math.floor(Math.random() * answers.length);
  return answers[index].toLocaleUpperCase(SPANISH_LOCALE);
}
