import { normalizeWord, stripAccents, type WordSettings } from "./words";

export type CharStatus = "absent" | "present" | "correct";

export type CharValue =
  | "Q"
  | "W"
  | "E"
  | "R"
  | "T"
  | "Y"
  | "U"
  | "I"
  | "O"
  | "P"
  | "A"
  | "S"
  | "D"
  | "F"
  | "G"
  | "H"
  | "J"
  | "K"
  | "L"
  | "Z"
  | "X"
  | "C"
  | "V"
  | "B"
  | "N"
  | "M"
  | "\u00d1"
  | "\u00c1"
  | "\u00c9"
  | "\u00cd"
  | "\u00d3"
  | "\u00da"
  | "\u00dc";

const SPANISH_LOCALE = "es-ES";

const toUpper = (value: string) => value.toLocaleUpperCase(SPANISH_LOCALE);

const applyStatus = (
  registry: Record<string, CharStatus>,
  key: string,
  status: CharStatus
) => {
  const current = registry[key];
  if (!current) {
    registry[key] = status;
    return;
  }

  if (current === "correct" || current === status) {
    return;
  }

  if (status === "correct") {
    registry[key] = status;
    return;
  }

  if (current === "present" && status === "absent") {
    return;
  }

  registry[key] = status;
};

export const getStatuses = (
  guesses: string[],
  solutionWord: string,
  settings: WordSettings
): Record<string, CharStatus> => {
  const charStatuses: Record<string, CharStatus> = {};
  const normalizedSolution = normalizeWord(solutionWord, settings);
  const solutionLetters = Array.from(normalizedSolution);

  guesses.forEach((guess) => {
    const normalizedGuess = normalizeWord(guess, settings);
    const guessLetters = Array.from(normalizedGuess);

    guessLetters.forEach((letter, index) => {
      const present = solutionLetters.includes(letter);
      const correct = letter === solutionLetters[index];

      const key = settings.accentMode === "plain"
        ? toUpper(stripAccents(letter))
        : toUpper(letter);

      if (!present) {
        applyStatus(charStatuses, key, "absent");
        return;
      }

      if (correct) {
        applyStatus(charStatuses, key, "correct");
        return;
      }

      applyStatus(charStatuses, key, "present");
    });
  });

  return charStatuses;
};

export const getGuessStatuses = (
  guess: string,
  solutionWord: string,
  settings: WordSettings
): CharStatus[] => {
  const normalizedSolution = normalizeWord(solutionWord, settings);
  const normalizedGuess = normalizeWord(guess, settings);

  const solutionLetters = Array.from(normalizedSolution);
  const guessLetters = Array.from(normalizedGuess);

  const taken = solutionLetters.map(() => false);
  const statuses: CharStatus[] = Array.from({ length: guessLetters.length });

  guessLetters.forEach((letter, index) => {
    if (letter === solutionLetters[index]) {
      statuses[index] = "correct";
      taken[index] = true;
    }
  });

  guessLetters.forEach((letter, index) => {
    if (statuses[index]) {
      return;
    }

    if (!solutionLetters.includes(letter)) {
      statuses[index] = "absent";
      return;
    }

    const matchIndex = solutionLetters.findIndex((value, position) => value === letter && !taken[position]);
    if (matchIndex > -1) {
      statuses[index] = "present";
      taken[matchIndex] = true;
      return;
    }

    statuses[index] = "absent";
  });

  return statuses;
};
