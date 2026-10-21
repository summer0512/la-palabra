import { WORD_LENGTHS, type WordLength, type WordListData } from "@/constants/wordlist-metadata";

export type { WordLength, WordListData } from "@/constants/wordlist-metadata";

export type AccentMode = "plain" | "accented";

export interface WordSettings {
  wordLength: WordLength;
  accentMode: AccentMode;
}

export const DEFAULT_WORD_LENGTH: WordLength = 5;
export const DEFAULT_ACCENT_MODE: AccentMode = "plain";
export const DEFAULT_SETTINGS: WordSettings = {
  wordLength: DEFAULT_WORD_LENGTH,
  accentMode: DEFAULT_ACCENT_MODE,
};

const SPANISH_LOCALE = "es-ES";
const DIACRITIC_PATTERN = new RegExp(String.raw`\p{Diacritic}`, "gu");

const keepDiacriticsFor = new Map<string, string>([
  ["\u00f1", "__enie__"],
  ["\u00d1", "__ENIE__"],
]);

type PreparedWordList = {
  data: WordListData;
  allowedSet: Set<string>;
  answersSet: Set<string>;
};

const rawDataCache = new Map<WordLength, WordListData>();
const preparedCache = new Map<WordLength, PreparedWordList>();
const uppercaseCache = new Map<WordLength, string[]>();
const plainUppercaseCache = new Map<WordLength, string[]>();

const toLowerCase = (value: string) => value.toLocaleLowerCase(SPANISH_LOCALE);
const toSpanishUppercase = (value: string) => value.toLocaleUpperCase(SPANISH_LOCALE);

export const stripAccents = (word: string): string => {
  let protectedWord = word;
  keepDiacriticsFor.forEach((placeholder, char) => {
    protectedWord = protectedWord.replace(new RegExp(char, "g"), placeholder);
  });

  const normalized = protectedWord
    .normalize("NFD")
    .replace(DIACRITIC_PATTERN, "")
    .normalize("NFC");

  let restored = normalized;
  keepDiacriticsFor.forEach((placeholder, char) => {
    restored = restored.replace(new RegExp(placeholder, "g"), char);
  });

  return restored;
};

export const hasWordList = (wordLength: WordLength): boolean => rawDataCache.has(wordLength);

export const registerWordList = (wordLength: WordLength, data: WordListData): void => {
  rawDataCache.set(wordLength, data);
  preparedCache.delete(wordLength);
  uppercaseCache.delete(wordLength);
  plainUppercaseCache.delete(wordLength);
};

const ensureWordListData = (wordLength: WordLength): WordListData => {
  const data = rawDataCache.get(wordLength);
  if (!data) {
    throw new Error(
      `No hay datos cargados para palabras de longitud ${wordLength}. ` +
        `Registre los datos con registerWordList(${wordLength}) antes de usarlos.`
    );
  }
  return data;
};

export const loadWordList = async (wordLength: WordLength): Promise<WordListData> => {
  throw new Error('loadWordList is not supported at runtime. Registra los datos con getWordListData antes de usar los helpers.');
};

const getPreparedWordList = (wordLength: WordLength): PreparedWordList => {
  const cached = preparedCache.get(wordLength);
  if (cached) {
    return cached;
  }

  const data = ensureWordListData(wordLength);

  const prepared: PreparedWordList = {
    data,
    allowedSet: new Set(data.allowed),
    answersSet: new Set(data.answers),
  };

  preparedCache.set(wordLength, prepared);
  return prepared;
};

export const isSupportedWordLength = (value: number): value is WordLength => {
  return WORD_LENGTHS.includes(value as WordLength);
};

export const getAvailableWordLengths = (): readonly WordLength[] => WORD_LENGTHS;

export const normalizeWord = (word: string, settings: WordSettings): string => {
  const lower = toLowerCase(word);
  if (settings.accentMode === "accented") {
    return lower;
  }

  return stripAccents(lower);
};

export const isWordInWordList = (word: string, settings: WordSettings): boolean => {
  const lower = toLowerCase(word);
  if (Array.from(lower).length !== settings.wordLength) {
    return false;
  }

  const { allowedSet, answersSet, data } = getPreparedWordList(settings.wordLength);

  if (settings.accentMode === "accented") {
    return allowedSet.has(lower) || answersSet.has(lower);
  }

  const base = stripAccents(lower);

  if (allowedSet.has(base) || answersSet.has(base)) {
    return true;
  }

  const canonical = data.accentMap[base];
  if (canonical && (allowedSet.has(canonical) || answersSet.has(canonical))) {
    return true;
  }

  return false;
};

export const isWinningWord = (word: string, solution: string, settings: WordSettings): boolean => {
  const normalizedInput = normalizeWord(word, settings);
  const normalizedSolution = normalizeWord(solution, settings);
  return normalizedInput === normalizedSolution;
};

const getDaysSinceEpoch = (): number => {
  const epochDate = new Date(2022, 0, 2, 0, 0, 0, 0);
  const now = new Date();
  return Math.floor((now.getTime() - epochDate.getTime()) / (24 * 60 * 60 * 1000));
};

export const getWordOfDay = (wordLength: WordLength): string => {
  const { data } = getPreparedWordList(wordLength);
  const answers = data.answers;
  if (answers.length === 0) {
    throw new Error(`La lista de respuestas para ${wordLength} letras est谩 vac铆a.`);
  }

  const index = getDaysSinceEpoch() % answers.length;
  return answers[index].toLocaleUpperCase(SPANISH_LOCALE);
};

export const getRandomWord = (wordLength: WordLength): string => {
  const { data } = getPreparedWordList(wordLength);
  const answers = data.answers;
  if (answers.length === 0) {
    throw new Error(`La lista de respuestas para ${wordLength} letras est谩 vac铆a.`);
  }

  const index = Math.floor(Math.random() * answers.length);
  return answers[index].toLocaleUpperCase(SPANISH_LOCALE);
};

const KEYBOARD_CHARACTERS = new Set(
  Array.from("ABCDEFGHIJKLMN\u00d1OPQRSTUVWXYZ\u00c1\u00c9\u00cd\u00d3\u00da\u00dc")
);

const buildUppercaseWordList = (wordLength: WordLength): string[] => {
  const data = ensureWordListData(wordLength);
  const accepted = new Set<string>();

  const addWord = (word?: string) => {
    if (!word) {
      return;
    }

    const trimmed = word.trim();
    if (!trimmed) {
      return;
    }

    if (Array.from(trimmed).length !== wordLength) {
      return;
    }

    const upper = toSpanishUppercase(trimmed);
    if (Array.from(upper).every((char) => KEYBOARD_CHARACTERS.has(char))) {
      accepted.add(upper);
    }
  };

  data.allowed.forEach(addWord);
  data.answers.forEach(addWord);
  Object.keys(data.accentMap).forEach(addWord);
  Object.values(data.accentMap).forEach(addWord);

  return Array.from(accepted).sort((a, b) => a.localeCompare(b, "es"));
};

export const getUppercaseWordList = (wordLength: WordLength): readonly string[] => {
  const cached = uppercaseCache.get(wordLength);
  if (cached) {
    return cached;
  }

  const generated = buildUppercaseWordList(wordLength);
  uppercaseCache.set(wordLength, generated);
  return generated;
};

export const getPlainUppercaseWordList = (wordLength: WordLength): readonly string[] => {
  const cached = plainUppercaseCache.get(wordLength);
  if (cached) {
    return cached;
  }

  const uppercase = getUppercaseWordList(wordLength);
  const generated = uppercase.map((word) => stripAccents(word));
  plainUppercaseCache.set(wordLength, generated);
  return generated;
};

export const getWordListData = (wordLength: WordLength): WordListData => {
  return ensureWordListData(wordLength);
};
