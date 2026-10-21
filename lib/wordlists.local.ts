import { promises as fs } from "fs";
import path from "path";
import type { WordLength, WordListData } from "@/constants/wordlist-metadata";
import { WORD_LENGTHS } from "@/constants/wordlist-metadata";
import { stripAccents } from "@/lib/words";

const DATA_DIR = path.resolve(process.cwd(), "data");
const ANSWERS_DIR = path.join(DATA_DIR, "answers");
const LETTER_REGEX = new RegExp(String.raw`^\p{Letter}+$`, "u");

const locale = "es-ES";

const wordLengthSet = new Set<WordLength>(WORD_LENGTHS);

const localCache = new Map<WordLength, Promise<WordListData>>();

const toLowerCase = (value: string) => value.toLocaleLowerCase(locale);

const countGraphemes = (value: string) => Array.from(value).length;

const getFilePrefix = (wordLength: WordLength) => wordLength.toString().padStart(2, "0");

const parseWordList = (raw: string, wordLength: WordLength, source: string): string[] => {
  const words = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((word) => toLowerCase(word));

  const unique = new Set<string>();

  for (const word of words) {
    if (countGraphemes(word) !== wordLength) {
      throw new Error(
        `La palabra '${word}' del archivo ${source} no tiene exactamente ${wordLength} caracteres.`
      );
    }

    if (!LETTER_REGEX.test(word)) {
      throw new Error(`La palabra '${word}' del archivo ${source} contiene caracteres inválidos.`);
    }

    unique.add(word);
  }

  return Array.from(unique);
};

export const buildAccentMap = (words: readonly string[]): Record<string, string> => {
  const map = new Map<string, string>();
  for (const word of words) {
    const base = stripAccents(word);
    if (base === word) {
      continue;
    }
    if (map.has(base)) {
      continue;
    }
    map.set(base, word);
  }
  return Object.fromEntries(Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, locale)));
};

async function readLocalWordList(wordLength: WordLength): Promise<WordListData> {
  if (!wordLengthSet.has(wordLength)) {
    throw new Error(`Longitud de palabra no soportada: ${wordLength}`);
  }

  const prefix = getFilePrefix(wordLength);
  const allowedPath = path.join(DATA_DIR, `${prefix}.txt`);
  const answersPath = path.join(ANSWERS_DIR, `${prefix}.txt`);

  const [allowedRaw, answersRaw] = await Promise.all([
    fs.readFile(allowedPath, "utf8"),
    fs.readFile(answersPath, "utf8"),
  ]);

  const allowed = parseWordList(allowedRaw, wordLength, allowedPath);
  const answers = parseWordList(answersRaw, wordLength, answersPath);
  const accentMap = buildAccentMap([...allowed, ...answers]);

  return {
    allowed,
    answers,
    accentMap,
  };
}

export async function getLocalWordList(wordLength: WordLength): Promise<WordListData> {
  const cached = localCache.get(wordLength);
  if (cached) {
    return cached;
  }

  const promise = readLocalWordList(wordLength);
  localCache.set(wordLength, promise);
  try {
    return await promise;
  } catch (error) {
    localCache.delete(wordLength);
    throw error;
  }
}
