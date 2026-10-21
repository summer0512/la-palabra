import { getGuessStatuses } from "./statuses";
import {
  isSupportedWordLength,
  DEFAULT_WORD_LENGTH,
  DEFAULT_ACCENT_MODE,
  type WordSettings,
  type WordLength,
  type AccentMode,
} from "./words";

const DEFAULT_MAX_ATTEMPTS = 6;
const SPANISH_LOCALE = "es-ES";

export interface ChallengePayload {
  word: string;
  wordLength: WordLength;
  accentMode: AccentMode;
}

const toUpper = (value: string) => value.toLocaleUpperCase(SPANISH_LOCALE);

export const generateShareText = (
  guesses: string[],
  solution: string,
  gameWon: boolean,
  settings: WordSettings,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS
): string => {
  const attempts = guesses.length;

  const emojiGrid = guesses
    .map((guess) => {
      const statuses = getGuessStatuses(guess, solution, settings);
      return statuses
        .map((status) => {
          switch (status) {
            case "correct":
              return "🟩";
            case "present":
              return "🟨";
            default:
              return "⬜";
          }
        })
        .join("");
    })
    .join("\n");

  const resultText = gameWon
    ? `¡Conseguí adivinar esta palabra en ${attempts}/${maxAttempts} intentos! 🎉`
    : `No conseguí adivinar esta palabra en ${maxAttempts} intentos. 😅`;

  const modeLabel = settings.accentMode === "accented" ? "con acentos" : "sin acentos";

  const shareText = `${resultText}\n\n${emojiGrid}\n\nModo: ${modeLabel} · Longitud: ${settings.wordLength}\nLA PALABRA DEL DÍA: https://lapalabra-deldia.com`;

  return shareText;
};

export const generateTwitterShareUrl = (
  shareText: string,
  gameUrl: string = typeof window !== "undefined" ? window.location.origin : ""
): string => {
  const encodedText = encodeURIComponent(`${shareText} ${gameUrl}`);
  return `https://x.com/intent/post?text=${encodedText}`;
};

export const generateChallengeUrl = (solution: string, settings: WordSettings): string => {
  const payload: ChallengePayload = {
    word: solution.toLowerCase(),

    wordLength: settings.wordLength,
    accentMode: settings.accentMode,
  };

  const encoded = btoa(JSON.stringify(payload));
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  return `${baseUrl}?challenge=${encoded}`;
};

export const getChallengeWordFromUrl = (): ChallengePayload | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const challengeParam = urlParams.get("challenge");

    if (!challengeParam) {
      return null;
    }

    const decoded = atob(challengeParam);

    try {
      const parsed = JSON.parse(decoded) as Partial<ChallengePayload> & { word?: string };
      if (!parsed.word) {
        return null;
      }

      const rawWord = toUpper(parsed.word);
      const inferredLength = Array.from(rawWord).length as number;
      const wordLength = isSupportedWordLength(inferredLength)
        ? (inferredLength as WordLength)
        : DEFAULT_WORD_LENGTH;
      const accentMode =
        parsed.accentMode === "accented" || parsed.accentMode === "plain"
          ? parsed.accentMode
          : DEFAULT_ACCENT_MODE;

      return {
        word: rawWord,
        wordLength,
        accentMode,
      };
    } catch (parseError) {
      const legacyWord = toUpper(decoded);
      const legacyLength = Array.from(legacyWord).length as number;
      if (!isSupportedWordLength(legacyLength)) {
        return null;
      }

      return {
        word: legacyWord,
        wordLength: legacyLength as WordLength,
        accentMode: DEFAULT_ACCENT_MODE,
      };
    }
  } catch (error) {
    console.warn("Failed to decode challenge parameter:", error);
    return null;
  }
};

export const isChallengeMode = (): boolean => {
  return getChallengeWordFromUrl() !== null;
};

export const clearChallengeFromUrl = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete("challenge");
  window.history.replaceState({}, "", url.toString());
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand("copy");
      document.body.removeChild(textArea);
      return result;
    } catch (fallbackErr) {
      return false;
    }
  }
};
