import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { WordLength } from "@/constants/wordlist-metadata";
import { getFinderPageData, isBrowserOnlyWordLength } from "@/lib/wordlists.server";
import { getPlainUppercaseWordList, isSupportedWordLength, stripAccents } from "@/lib/words";

const LETTER_OPTIONS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "Ñ",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "Á",
  "É",
  "Í",
  "Ó",
  "Ú",
  "Ü",
];

const LETTER_SET = new Set(LETTER_OPTIONS);
const RESULTS_PAGE_SIZE = Number.parseInt(process.env.FINDER_PREVIEW_LIMIT ?? "100", 10);

const sanitizeLetter = (rawValue: string): string => {
  const normalized = rawValue.toLocaleUpperCase("es-ES");
  for (const char of Array.from(normalized)) {
    if (LETTER_SET.has(char)) {
      return char;
    }
  }
  return "";
};

const dedupeLetters = (letters: string[]): string[] => {
  return Array.from(new Set(letters.filter(Boolean)));
};

type FinderSearchPayload = {
  words: string[];
  total: number;
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ length: string }> }) {
  const { length } = await params;
  const lengthParam = Number.parseInt(length, 10);
  if (!isSupportedWordLength(lengthParam)) {
    return NextResponse.json({ error: "Longitud no soportada" }, { status: 400 });
  }

  const wordLength = lengthParam as WordLength;
  if (isBrowserOnlyWordLength(wordLength)) {
    return NextResponse.json(
      { error: "Esta longitud solo admite filtrado desde el navegador." },
      { status: 400 },
    );
  }
  const url = request.nextUrl;
  const respectAccents = url.searchParams.get("acc") === "1";

  const parseLettersParam = (value: string | null): string[] => {
    if (!value) {
      return [];
    }
    const parsed = Array.from(value)
      .map((char) => sanitizeLetter(char))
      .filter(Boolean);
    return dedupeLetters(parsed);
  };

  const includeLetters = parseLettersParam(url.searchParams.get("incl"));
  const excludeLetters = parseLettersParam(url.searchParams.get("excl"));

  const positionLetters = Array.from({ length: wordLength }, () => "");
  const positionsParam = url.searchParams.get("pos");
  if (positionsParam && positionsParam.length === wordLength) {
    for (let index = 0; index < wordLength; index += 1) {
      const char = positionsParam[index];
      if (char === "_") {
        continue;
      }
      const sanitized = sanitizeLetter(char);
      if (sanitized) {
        positionLetters[index] = sanitized;
      }
    }
  }

  const normalizedPositionLetters = respectAccents
    ? positionLetters
    : positionLetters.map((letter) => (letter ? stripAccents(letter) : ""));

  const normalizedIncludeLetters = respectAccents
    ? includeLetters
    : includeLetters.map((letter) => stripAccents(letter));

  const normalizedExcludeLetters = respectAccents
    ? excludeLetters
    : excludeLetters.map((letter) => stripAccents(letter));

  const hasIncludeFilter = normalizedIncludeLetters.length > 0;
  const hasExcludeFilter = normalizedExcludeLetters.length > 0;

  const wordList = await getFinderPageData(wordLength);
  const comparisonWordList = respectAccents ? wordList : getPlainUppercaseWordList(wordLength);

  const matches: string[] = [];
  let totalMatches = 0;

  for (let listIndex = 0; listIndex < wordList.length; listIndex += 1) {
    const word = wordList[listIndex];
    const comparisonWord = comparisonWordList[listIndex];

    let matchesPositions = true;
    for (let index = 0; index < wordLength; index += 1) {
      const target = normalizedPositionLetters[index];
      if (target && comparisonWord[index] !== target) {
        matchesPositions = false;
        break;
      }
    }

    if (!matchesPositions) {
      continue;
    }

    if (hasIncludeFilter) {
      let includesAll = true;
      for (const letter of normalizedIncludeLetters) {
        if (!comparisonWord.includes(letter)) {
          includesAll = false;
          break;
        }
      }
      if (!includesAll) {
        continue;
      }
    }

    if (hasExcludeFilter) {
      let excludesAll = true;
      for (const letter of normalizedExcludeLetters) {
        if (letter && comparisonWord.includes(letter)) {
          excludesAll = false;
          break;
        }
      }
      if (!excludesAll) {
        continue;
      }
    }

    totalMatches += 1;
    if (matches.length < RESULTS_PAGE_SIZE) {
      matches.push(word);
    }
  }

  const payload: FinderSearchPayload = {
    words: matches,
    total: totalMatches,
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
