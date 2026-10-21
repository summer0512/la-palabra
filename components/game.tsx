'use client';
import { BarChart3, HelpCircle, Info, PlusCircle, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Alert } from "@/components/alerts/Alert";
import { Grid } from "@/components/grid/Grid";
import { Keyboard } from "@/components/keyboard/Keyboard";
import { InfoModal } from "@/components/modals/InfoModal";
import { WinModal } from "@/components/modals/WinModal";
import { LoseModal } from "@/components/modals/LoseModal";
import { CreateGameModal } from "@/components/modals/CreateGameModal";
import { ModeInfoModal } from "@/components/modals/ModeInfoModal";
import { StatsModal } from "@/components/modals/StatsModal";
import { Confetti } from "@/components/confetti";
import {
  isWordInWordList,
  getAvailableWordLengths,
  isSupportedWordLength,
  isWinningWord,
  stripAccents,
  DEFAULT_WORD_LENGTH,
  DEFAULT_ACCENT_MODE,
  type WordLength,
  type AccentMode,
  registerWordList,
  type WordSettings,
  type WordListData,
} from "@/lib/words";
import { getChallengeWordFromUrl, clearChallengeFromUrl } from "@/lib/share";
import { getGamePath, getFinderPath } from "@/lib/length-pages";
import { completeDailyGame, isDailyGameCompleted } from "@/lib/dailyGame";
import { DEFAULT_STATS, loadStats, recordGameResult, StoredStats } from "@/lib/stats";

type GameMode = "daily" | "infinite" | "challenge";

const DAILY_STORAGE_KEY = "palabra-diaria-progreso";
const CHALLENGE_STORAGE_PREFIX = "palabra-desafio-progreso:";
// const POPUNDER_SCRIPT_SRC = "https://pl29091407.profitablecpmratenetwork.com/c0/e0/50/c0e05061fccfa5f304e0861873bebc97.js";
const POPUNDER_SESSION_SHOWN_KEY = "palabra-popunder-session-shown-count";
const POPUNDER_LAST_SHOWN_AT_KEY = "palabra-popunder-last-shown-at";
const POPUNDER_COMPLETED_ROUNDS_KEY = "palabra-popunder-completed-rounds";
const POPUNDER_SESSION_CAP = 1;
const POPUNDER_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const POPUNDER_MIN_COMPLETED_ROUNDS = 2;

interface StoredGameState {
  solution: string;
  guesses: string[];
  currentGuess: string;
  isGameWon: boolean;
  isGameLost: boolean;
  playedOn?: string;
  challengeId?: string;
  wordLength?: WordLength;
  accentMode?: AccentMode;
}

const getTodayString = (): string => new Date().toISOString().split("T")[0];
const toStorageIdentifier = (value: string): string => value.trim().toLowerCase();
const buildVariantSuffix = (settings: WordSettings): string => `${settings.wordLength}-${settings.accentMode}`;

const getStorageKeys = (mode: GameMode, settings: WordSettings, identifier?: string | null): string[] => {
  const suffix = buildVariantSuffix(settings);

  if (mode === "daily") {
    const keys = [`${DAILY_STORAGE_KEY}-${suffix}`];
    if (settings.wordLength === DEFAULT_WORD_LENGTH && settings.accentMode === DEFAULT_ACCENT_MODE) {
      keys.push(DAILY_STORAGE_KEY);
    }
    return keys;
  }

  if (mode === "challenge" && identifier) {
    const primary = `${CHALLENGE_STORAGE_PREFIX}${suffix}:${identifier}`;
    const keys = [primary];
    if (settings.wordLength === DEFAULT_WORD_LENGTH && settings.accentMode === DEFAULT_ACCENT_MODE) {
      keys.push(`${CHALLENGE_STORAGE_PREFIX}${identifier}`);
    }
    return keys;
  }

  return [];
};

const getPrimaryStorageKey = (mode: GameMode, settings: WordSettings, identifier?: string | null): string | null => {
  const [primary] = getStorageKeys(mode, settings, identifier);
  return primary ?? null;
};

const MODE_LABELS: Record<GameMode, string> = {
  daily: "modo diario",
  infinite: "modo infinito",
  challenge: "modo desafío",
};

const createInfiniteGameId = (): string => {
  const randomSegment = Math.random().toString(36).slice(2, 8);
  return `infinite-${Date.now().toString(36)}-${randomSegment}`;
};

const MAX_GUESSES = 6;
const ACCENT_MODE_OPTIONS: readonly AccentMode[] = ["plain", "accented"];
const SETTINGS_STORAGE_KEY = "palabra-settings";

type GameProps = {
  wordListData: WordListData;
  initialWordLength?: WordLength;
  initialAccentMode?: AccentMode;
  initialDailySolution: string;
};

function Game({ wordListData, initialWordLength, initialAccentMode, initialDailySolution }: GameProps) {
  const initialLength =
    initialWordLength !== undefined && isSupportedWordLength(initialWordLength)
      ? initialWordLength
      : DEFAULT_WORD_LENGTH;
  const initialAccent = initialAccentMode ?? DEFAULT_ACCENT_MODE;

  const registeredWordListRef = useRef<WordListData | null>(null);

  if (registeredWordListRef.current !== wordListData) {
    registerWordList(initialLength, wordListData);
    registeredWordListRef.current = wordListData;
  }

  const [mode, setMode] = useState<GameMode>("daily");
  const [challengeWord, setChallengeWord] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isGameWon, setIsGameWon] = useState(false);
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isModeInfoOpen, setIsModeInfoOpen] = useState(false);
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false);
  const [isGameLost, setIsGameLost] = useState(false);
  const [isLoseModalOpen, setIsLoseModalOpen] = useState(false);
  const [isCreateGameModalOpen, setIsCreateGameModalOpen] = useState(false);
  const [revealingRowIndex, setRevealingRowIndex] = useState<number | undefined>();
  const [currentSolution, setCurrentSolution] = useState<string>(initialDailySolution);
  const [isMounted, setIsMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [initialModeResolved, setInitialModeResolved] = useState(false);
  const [stats, setStats] = useState<StoredStats>(() => ({
    ...DEFAULT_STATS,
    guessDistribution: { ...DEFAULT_STATS.guessDistribution },
    recordedGameIds: [...DEFAULT_STATS.recordedGameIds],
  }));
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [infiniteGameId, setInfiniteGameId] = useState<string>(() => createInfiniteGameId());

  const wordLength = initialLength;
  const [accentMode, setAccentMode] = useState<AccentMode>(initialAccent);
  const settings = useMemo<WordSettings>(() => ({ wordLength, accentMode }), [wordLength, accentMode]);
  const dailyVariantKey = useMemo(() => buildVariantSuffix(settings), [settings]);

  const locale = useLocale();
  const localePathPrefix = locale ? `/${locale}` : "";

  const wordLengthOptions = useMemo(() => getAvailableWordLengths(), []);
  const finderHref = useMemo(() => `${localePathPrefix}${getFinderPath(wordLength)}`, [localePathPrefix, wordLength]);



  useEffect(() => {
    const hasInitialOverride = initialWordLength !== undefined || initialAccentMode !== undefined;

    if (typeof window === "undefined") {
      setIsMounted(true);
      return;
    }

    if (hasInitialOverride) {
      setIsMounted(true);
      return;
    }

    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<WordSettings>;
        if (parsed.accentMode === "accented" || parsed.accentMode === "plain") {
          setAccentMode(parsed.accentMode);
        }
      }
    } catch (error) {
      console.warn("No se pudieron cargar las preferencias guardadas:", error);
    } finally {
      setIsMounted(true);
    }
  }, [initialWordLength, initialAccentMode]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({ wordLength, accentMode })
      );
    } catch (error) {
      console.warn("No se pudieron guardar las preferencias:", error);
    }
  }, [isMounted, wordLength, accentMode]);

  const skipWinEffectsRef = useRef(false);
  const skipLoseEffectsRef = useRef(false);
  const hasUserPlayedRoundRef = useRef(false);
  const previousRoundEndedRef = useRef(false);
  const popunderShownRoundRef = useRef<string | null>(null);
  const pendingPopunderRoundKeyRef = useRef<string | null>(null);
  const sessionShownCountFallbackRef = useRef(0);
  const lastShownAtFallbackRef = useRef(0);
  const completedRoundsFallbackRef = useRef(0);

  const initializeGameState = useCallback(
    (
      state: {
        solution: string;
        guesses?: string[];
        currentGuess?: string;
        isGameWon?: boolean;
        isGameLost?: boolean;
      },
      options?: { skipCompletionEffects?: boolean },
    ) => {
      if (options?.skipCompletionEffects) {
        if (state.isGameWon) {
          skipWinEffectsRef.current = true;
        }
        if (state.isGameLost) {
        skipLoseEffectsRef.current = true;
      }
    }

    setCurrentSolution(state.solution);
    setGuesses(state.guesses ?? []);
    setCurrentGuess(state.currentGuess ?? "");
    setIsGameWon(state.isGameWon ?? false);
    setIsGameLost(state.isGameLost ?? false);
    setIsWinModalOpen(false);
      setIsLoseModalOpen(false);
      setShowConfetti(false);
      setRevealingRowIndex(undefined);
      hasUserPlayedRoundRef.current = false;
      previousRoundEndedRef.current = Boolean(state.isGameWon || state.isGameLost);
      pendingPopunderRoundKeyRef.current = null;
    },
    [],
  );

  const getRoundKey = useCallback((targetMode: GameMode = mode): string | null => {
    if (!currentSolution) {
      return null;
    }

    if (targetMode === "daily") {
      return `daily-${buildVariantSuffix(settings)}-${getTodayString()}`;
    }

    if (targetMode === "challenge") {
      return `challenge-${buildVariantSuffix(settings)}-${toStorageIdentifier(currentSolution)}`;
    }

    return `infinite-${buildVariantSuffix(settings)}-${infiniteGameId}`;
  }, [mode, currentSolution, settings, infiniteGameId]);

  // const triggerPopunder = useCallback(() => {
  //   if (!isMounted || typeof document === "undefined") {
  //     return;
  //   }

  //   const existingScript = document.querySelector('script[data-adsterra-popunder="true"]');
  //   if (existingScript) {
  //     existingScript.remove();
  //   }

  //   const script = document.createElement("script");
  //   script.src = POPUNDER_SCRIPT_SRC;
  //   script.async = true;
  //   script.setAttribute("data-adsterra-popunder", "true");
  //   document.body.appendChild(script);
  // }, [isMounted]);

  const readStoredNumber = useCallback((
    storage: "localStorage" | "sessionStorage",
    key: string,
    fallbackRef: { current: number },
  ): number => {
    if (!isMounted || typeof window === "undefined") {
      return fallbackRef.current;
    }

    try {
      const raw = window[storage].getItem(key);
      if (!raw) {
        return fallbackRef.current;
      }

      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed >= 0) {
        fallbackRef.current = parsed;
        return parsed;
      }
    } catch (error) {
      console.error(`Failed to read ${key}:`, error);
    }

    return fallbackRef.current;
  }, [isMounted]);

  const writeStoredNumber = useCallback((
    storage: "localStorage" | "sessionStorage",
    key: string,
    value: number,
    fallbackRef: { current: number },
  ) => {
    fallbackRef.current = value;

    if (!isMounted || typeof window === "undefined") {
      return;
    }

    try {
      window[storage].setItem(key, String(value));
    } catch (error) {
      console.error(`Failed to write ${key}:`, error);
    }
  }, [isMounted]);

  const incrementCompletedRounds = useCallback((): number => {
    const current = readStoredNumber("localStorage", POPUNDER_COMPLETED_ROUNDS_KEY, completedRoundsFallbackRef);
    const next = current + 1;
    writeStoredNumber("localStorage", POPUNDER_COMPLETED_ROUNDS_KEY, next, completedRoundsFallbackRef);
    return next;
  }, [readStoredNumber, writeStoredNumber]);

  const canShowPopunder = useCallback((completedRounds: number): boolean => {
    if (completedRounds < POPUNDER_MIN_COMPLETED_ROUNDS) {
      return false;
    }

    const sessionShownCount = readStoredNumber(
      "sessionStorage",
      POPUNDER_SESSION_SHOWN_KEY,
      sessionShownCountFallbackRef
    );
    if (sessionShownCount >= POPUNDER_SESSION_CAP) {
      return false;
    }

    const lastShownAt = readStoredNumber("localStorage", POPUNDER_LAST_SHOWN_AT_KEY, lastShownAtFallbackRef);
    if (lastShownAt > 0 && Date.now() - lastShownAt < POPUNDER_COOLDOWN_MS) {
      return false;
    }

    return true;
  }, [readStoredNumber]);

  const markPopunderShown = useCallback(() => {
    const sessionShownCount = readStoredNumber(
      "sessionStorage",
      POPUNDER_SESSION_SHOWN_KEY,
      sessionShownCountFallbackRef
    );
    writeStoredNumber(
      "sessionStorage",
      POPUNDER_SESSION_SHOWN_KEY,
      sessionShownCount + 1,
      sessionShownCountFallbackRef
    );
    writeStoredNumber("localStorage", POPUNDER_LAST_SHOWN_AT_KEY, Date.now(), lastShownAtFallbackRef);
  }, [readStoredNumber, writeStoredNumber]);

  const restoreState = useCallback((targetMode: GameMode, solution: string, activeSettings: WordSettings) => {
    if (typeof window === "undefined") {
      initializeGameState({ solution });
      return;
    }

    const identifier = targetMode === "challenge" ? toStorageIdentifier(solution) : null;
    const keys = getStorageKeys(targetMode, activeSettings, identifier);

    if (keys.length === 0) {
      initializeGameState({ solution });
      return;
    }

    const [primaryKey] = keys;

    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) {
          continue;
        }

        const stored = JSON.parse(raw) as Partial<StoredGameState>;

        if (!stored.solution || stored.solution !== solution) {
          localStorage.removeItem(key);
          continue;
        }

        if (targetMode === "daily") {
          const today = getTodayString();
          if (stored.playedOn && stored.playedOn !== today) {
            localStorage.removeItem(key);
            continue;
          }
        }

        if (targetMode === "challenge" && identifier) {
          if (stored.challengeId && stored.challengeId !== identifier) {
            localStorage.removeItem(key);
            continue;
          }
        }

        initializeGameState(
          {
            solution,
            guesses: stored.guesses ?? [],
            currentGuess: stored.currentGuess ?? "",
            isGameWon: stored.isGameWon ?? false,
            isGameLost: stored.isGameLost ?? false,
          },
          { skipCompletionEffects: Boolean(stored.isGameWon || stored.isGameLost) }
        );

        if (key !== primaryKey) {
          try {
            localStorage.removeItem(key);
          } catch (cleanupError) {
            console.warn("No se pudo limpiar el estado antiguo", cleanupError);
          }
        }

        return;
      } catch (error) {
        console.error("Failed to restore game state:", error);
        localStorage.removeItem(key);
      }
    }

    initializeGameState({ solution });
  }, [initializeGameState]);

  const fetchSolution = useCallback(
    async (length: WordLength, mode: "daily" | "infinite"): Promise<string> => {
      const params = new URLSearchParams({ mode });
      const response = await fetch(`/api/game-solution/${length}?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Failed to fetch ${mode} solution (${response.status}): ${errorBody}`);
      }

      const payload = (await response.json()) as { solution?: unknown };
      if (typeof payload.solution !== "string" || payload.solution.length === 0) {
        throw new Error(`Invalid ${mode} solution payload.`);
      }

      return payload.solution;
    },
    []
  );

  const startInfiniteGame = useCallback(
    async (overrideSettings?: WordSettings) => {
      const activeSettings = overrideSettings ?? settings;
      try {
        const newSolution = await fetchSolution(activeSettings.wordLength, "infinite");
        setInfiniteGameId(createInfiniteGameId());
        initializeGameState({ solution: newSolution });
      } catch (error) {
        console.error("Failed to fetch infinite game solution:", error);
      }
    },
    [fetchSolution, initializeGameState, settings]
  );

  const getGameIdentifier = (targetMode: GameMode = mode, solution: string = currentSolution): string | null => {
    if (!solution) {
      return null;
    }

    if (targetMode === "daily") {
      return `daily-${getTodayString()}`;
    }

    if (targetMode === "challenge") {
      return `challenge-${toStorageIdentifier(solution)}`;
    }

    if (targetMode === "infinite") {
      return infiniteGameId;
    }

    return null;
  };

  const recordStatsResult = (won: boolean, guessesUsed: number) => {
    if (typeof window === "undefined") {
      return;
    }

    const gameId = getGameIdentifier();
    if (!gameId) {
      return;
    }

    const updatedStats = recordGameResult({ gameId, won, guesses: guessesUsed });
    setStats(updatedStats);
  };

  const openStatsModal = () => {
    if (typeof window !== "undefined") {
      setStats(loadStats());
    }
    setIsStatsModalOpen(true);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    setStats(loadStats());
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    // console.log(`[PALABRA] Palavra do modo diário: ${getWordOfDay(wordLength)}`);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || initialModeResolved) {
      return;
    }

    const challengePayload = getChallengeWordFromUrl();

    if (challengePayload) {
      const { word, wordLength: payloadLength, accentMode: payloadAccent } = challengePayload;
      const resolvedLength = isSupportedWordLength(payloadLength) ? payloadLength : DEFAULT_WORD_LENGTH;
      const resolvedAccent = payloadAccent ?? DEFAULT_ACCENT_MODE;

      if (resolvedLength !== wordLength || resolvedAccent !== accentMode) {
        if (typeof window !== "undefined") {
          const search = window.location.search;
          const targetPath = `${localePathPrefix}${getGamePath(resolvedLength, resolvedAccent)}`;
          window.location.assign(`${targetPath}${search}`);
        }
        return;
      }

      const challengeSettings: WordSettings = { wordLength, accentMode: resolvedAccent };

      setAccentMode(resolvedAccent);
      setChallengeWord(word);
      setMode("challenge");
      restoreState("challenge", word, challengeSettings);
    } else {
      const dailyCompleted = isDailyGameCompleted(dailyVariantKey);

      if (dailyCompleted) {
        setMode("infinite");
      } else {
        setMode("daily");
      }
    }

    setInitialModeResolved(true);
  }, [
    isMounted,
    initialModeResolved,
    accentMode,
    localePathPrefix,
    wordLength,
    restoreState,
    dailyVariantKey,
  ]);

  useEffect(() => {
    if (!isMounted || !initialModeResolved) {
      return;
    }

    let cancelled = false;

    const resolveSolutionForMode = async () => {
      if (mode === "daily") {
        try {
          const solution = await fetchSolution(wordLength, "daily");
          if (!cancelled) {
            restoreState("daily", solution, settings);
          }
        } catch (error) {
          console.error("Failed to fetch daily game solution:", error);
        }
      } else if (mode === "infinite") {
        await startInfiniteGame(settings);
      } else if (mode === "challenge" && challengeWord) {
        restoreState("challenge", challengeWord, settings);
      }
    };

    void resolveSolutionForMode();

    return () => {
      cancelled = true;
    };
  }, [
    mode,
    isMounted,
    initialModeResolved,
    challengeWord,
    settings,
    wordLength,
    fetchSolution,
    startInfiniteGame,
    restoreState,
  ]);

  useEffect(() => {
    if (skipWinEffectsRef.current) {
      skipWinEffectsRef.current = false;
      return;
    }

    if (!isGameWon) {
      return;
    }

    setShowConfetti(true);
    const timeoutId = window.setTimeout(() => {
      setIsWinModalOpen(true);
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [isGameWon]);

  useEffect(() => {
    if (skipLoseEffectsRef.current) {
      skipLoseEffectsRef.current = false;
      return;
    }

    if (isGameLost) {
      setIsLoseModalOpen(true);
    }
  }, [isGameLost]);

  useEffect(() => {
    const roundEnded = isGameWon || isGameLost;

    if (roundEnded && !previousRoundEndedRef.current && hasUserPlayedRoundRef.current) {
      const completedRounds = incrementCompletedRounds();
      const roundKey = getRoundKey();

      if (roundKey && popunderShownRoundRef.current !== roundKey && canShowPopunder(completedRounds)) {
        pendingPopunderRoundKeyRef.current = roundKey;
      } else {
        pendingPopunderRoundKeyRef.current = null;
      }
    }

    previousRoundEndedRef.current = roundEnded;
  }, [
    isGameWon,
    isGameLost,
    incrementCompletedRounds,
    getRoundKey,
    canShowPopunder,
    // triggerPopunder,
    markPopunderShown
  ]);

  useEffect(() => {
    if (!isMounted || !initialModeResolved) {
      return;
    }

    if (mode === "infinite") {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const solution = currentSolution;
    if (!solution) {
      return;
    }

    const identifier = mode === "challenge" ? toStorageIdentifier(solution) : null;
    const key = getPrimaryStorageKey(mode, settings, identifier);

    if (!key) {
      return;
    }

    const payload: StoredGameState = {
      solution,
      guesses,
      currentGuess,
      isGameWon,
      isGameLost,
      wordLength: settings.wordLength,
      accentMode: settings.accentMode,
    };

    if (mode === "daily") {
      payload.playedOn = getTodayString();
    } else if (mode === "challenge") {
      payload.challengeId = identifier ?? undefined;
    }

    try {
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (error) {
      console.error("Failed to persist game state:", error);
    }
  }, [guesses, currentGuess, isGameWon, isGameLost, mode, currentSolution, settings, isMounted, initialModeResolved]);

  useEffect(() => {
    if (!isMounted || !initialModeResolved) {
      return;
    }

    if (!currentSolution) {
      return;
    }

    // const label = MODE_LABELS[mode];
    // console.log(`[PALABRA] Palavra atual (${label}): ${currentSolution}`);
  }, [mode, currentSolution, isMounted, initialModeResolved]);

  useEffect(() => {
    setCurrentGuess((prev) => prev.slice(0, wordLength));
  }, [wordLength]);

  const onChar = useCallback(
    (value: string) => {
      if (isGameWon || isGameLost) {
        return;
      }

      if (guesses.length >= MAX_GUESSES) {
        return;
      }

      setCurrentGuess((prev) => {
        if (prev.length >= wordLength) {
          return prev;
        }

        const upper = value.toLocaleUpperCase("es-ES");
        const sanitized = accentMode === "plain" ? stripAccents(upper) : upper;

        if (!/^[A-ZÑÁÉÍÓÚÜ]$/.test(sanitized)) {
          return prev;
        }

        return `${prev}${sanitized}`;
      });
    },
    [accentMode, guesses.length, isGameLost, isGameWon, wordLength]
  );

  const onDelete = useCallback(() => {
    if (isGameWon || isGameLost) {
      return;
    }

    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [isGameLost, isGameWon]);

  const onEnter = useCallback(() => {
    if (isGameWon || isGameLost) {
      return;
    }

    if (currentGuess.length !== wordLength) {
      return;
    }

    if (!isWordInWordList(currentGuess, settings)) {
      setIsWordNotFoundAlertOpen(true);
      setTimeout(() => {
        setIsWordNotFoundAlertOpen(false);
      }, 2000);
      return;
    }

    if (guesses.length >= MAX_GUESSES) {
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    const currentRowIndex = guesses.length;
    hasUserPlayedRoundRef.current = true;

    setRevealingRowIndex(currentRowIndex);
    setGuesses(newGuesses);
    setCurrentGuess("");

    const winningWord = isWinningWord(currentGuess, currentSolution, settings);

    setTimeout(() => {
      setRevealingRowIndex(undefined);

      if (winningWord) {
        if (mode === "daily") {
          completeDailyGame(dailyVariantKey, true, newGuesses.length, currentSolution);
        }
        recordStatsResult(true, newGuesses.length);
        setIsGameWon(true);
      } else if (newGuesses.length >= MAX_GUESSES) {
        if (mode === "daily") {
          completeDailyGame(dailyVariantKey, false, newGuesses.length, currentSolution);
        }
        recordStatsResult(false, newGuesses.length);
        setIsGameLost(true);
      }
    }, 600);
  }, [
    currentGuess,
    currentSolution,
    guesses,
    isGameLost,
    isGameWon,
    mode,
    settings,
    wordLength,
    dailyVariantKey,
  ]);

  const handleNewGame = useCallback(() => {
    const pendingRoundKey = pendingPopunderRoundKeyRef.current;
    if (pendingRoundKey) {
      // triggerPopunder();
      markPopunderShown();
      popunderShownRoundRef.current = pendingRoundKey;
      pendingPopunderRoundKeyRef.current = null;
    }

    if (mode === "challenge") {
      if (typeof window !== "undefined") {
        const key = getPrimaryStorageKey("challenge", settings, toStorageIdentifier(currentSolution));
        if (key) {
          localStorage.removeItem(key);
        }
        clearChallengeFromUrl();
      }
      setChallengeWord(null);
      setMode("infinite");
      return;
    }

    if (mode === "daily") {
      setMode("infinite");
      return;
    }

    void startInfiniteGame(settings);
  }, [
    currentSolution,
    mode,
    settings,
    startInfiniteGame,
    // triggerPopunder,
    markPopunderShown
  ]);

  const handleModeSelection = (selected: "daily" | "infinite") => {
    if (mode === "challenge") {
      return;
    }
    if (selected === mode) {
      return;
    }
    setMode(selected);
  };

  useEffect(() => {
    const plainPattern = /^[a-zñáéíóúü]$/i;
    const accentedPattern = /^[a-zñáéíóúü]$/i;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isInfoModalOpen || isCreateGameModalOpen) {
        return;
      }

      if (event.key === 'Enter') {
        if (isGameLost || isGameWon) {
          handleNewGame();
        } else {
          onEnter();
        }
        return;
      }

      if (event.key === 'Backspace') {
        if (!isGameWon && !isGameLost) {
          onDelete();
        }
        return;
      }

      const pattern = accentMode === 'accented' ? accentedPattern : plainPattern;

      if (pattern.test(event.key)) {
        if (!isGameWon && !isGameLost) {
          onChar(event.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onChar, onDelete, onEnter, handleNewGame, isGameWon, isGameLost, isCreateGameModalOpen, isInfoModalOpen, accentMode]);

  const primaryActionLabel = mode === "infinite" ? "NUEVO JUEGO" : "IR AL MODO INFINITO";

  return (
    <>
      <Confetti trigger={showConfetti} duration={3000} />
      <Alert message="Palabra no encontrada" isOpen={isWordNotFoundAlertOpen} />
      <div className="pb-8 pt-2 max-w-7xl mx-auto sm:px-6 lg:px-8 game-container">
        <div className="flex w-full max-w-xl mx-auto items-center justify-between mb-3 gap-4">
          <div className="flex items-center gap-2 flex-1 pl-2">
            <div className="flex">
              <div className="flex justify-center sm:justify-start">
                <div className="inline-flex items-center bg-gray-100 rounded-full p-1 text-xs font-medium text-gray-600">
                  {mode === "challenge" ? (
                    <label className="px-3 py-1 rounded-full cursor-pointer transition bg-white text-primary-green shadow">
                      <input
                        type="radio"
                        name="game-mode"
                        className="sr-only"
                        checked={true}
                        readOnly
                      />
                      Desafío
                    </label>
                  ) : (
                    <>
                      <label
                        className={`px-3 py-1 rounded-full cursor-pointer transition ${mode === "daily" ? "bg-white text-primary-green shadow" : "hover:text-gray-800"}`}
                      >
                        <input
                          type="radio"
                          name="game-mode"
                          className="sr-only"
                          checked={mode === "daily"}
                          onChange={() => handleModeSelection("daily")}
                        />
                        Diario
                      </label>
                      <label
                        className={`px-3 py-1 rounded-full cursor-pointer transition ${mode === "infinite" ? "bg-white text-primary-green shadow" : "hover:text-gray-800"}`}
                      >
                        <input
                          type="radio"
                          name="game-mode"
                          className="sr-only"
                          checked={mode === "infinite"}
                          onChange={() => handleModeSelection("infinite")}
                        />
                        Infinito
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsModeInfoOpen(true)}
              title="Información del modo actual"
              className="p-1 rounded bg-gray-100 transition-colors ml-auto"
            >
              <Info className="h-6 w-6 text-gray-600 hover:text-primary-green transition-colors" />
            </button>
          </div>
          <div className="flex items-center space-x-2 pr-2">

            {mode === "infinite" && (
              <button
                onClick={handleNewGame}
                title="Nuevo Juego"
                className="hidden sm:inline-flex items-center p-1 px-3 rounded bg-primary-green transition-colors ml-1 text-white"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Nuevo Juego
              </button>
            )}
            {mode === "infinite" && (
              <button
                onClick={handleNewGame}
                title="Nuevo Juego"
                className="sm:hidden p-1 rounded bg-primary-green text-white transition-colors"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={openStatsModal}
              title="Estadísticas"
              className="p-1 rounded bg-gray-100 transition-colors"
            >
              <BarChart3 className="h-6 w-6 text-gray-600 hover:text-primary-green transition-colors" />
            </button>
            <button
              onClick={() => setIsCreateGameModalOpen(true)}
              title="Crear desafío"
              className="p-1 rounded bg-gray-100 transition-colors"
            >
              <PlusCircle className="h-6 w-6 text-gray-600 hover:text-primary-green transition-colors" />
            </button>
            <button
              onClick={() => setIsInfoModalOpen(true)}
              title="Cómo jugar"
              className="p-1 rounded bg-gray-100 transition-colors"
            >
              <HelpCircle className="h-6 w-6 text-gray-600 hover:text-primary-green transition-colors" />
            </button>
          </div>
        </div>
        <Grid guesses={guesses} currentGuess={currentGuess} revealingRowIndex={revealingRowIndex} solution={currentSolution} settings={settings} wordLength={wordLength} maxGuesses={MAX_GUESSES} isGameOver={isGameWon || isGameLost} />

        <div className="flex flex-wrap items-center gap-2 ml-3 justify-center mb-4">
          <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
            <span className="text-[10px] uppercase tracking-wide text-gray-500">Longitud</span>
            {wordLengthOptions.map((length) => {
              const isActive = length === wordLength;
              const href = `${localePathPrefix}${getGamePath(length, accentMode)}`;
              const isDisabled = mode === "challenge";

              return (
                <a
                  key={length}
                  href={href}
                  className={`px-2 py-1 text-xs font-semibold rounded-full transition ${isActive
                      ? "bg-white text-primary-green shadow"
                      : "text-gray-600 hover:text-gray-800"
                    } ${isDisabled ? "opacity-60 pointer-events-none" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {length}
                </a>
              );
            })}

          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
            <span className="text-[10px] uppercase tracking-wide text-gray-500">Acentos</span>
            {ACCENT_MODE_OPTIONS.map((option) => {
              const isActive = option === accentMode;
              const href = `${localePathPrefix}${getGamePath(wordLength, option)}`;
              const isDisabled = mode === "challenge";
              const label = option === "plain" ? "Sin" : "Con";

              return (
                <a
                  key={option}
                  href={href}
                  className={`px-2 py-1 text-xs font-semibold rounded-full transition ${isActive
                      ? "bg-white text-primary-green shadow"
                      : "text-gray-600 hover:text-gray-800"
                    } ${isDisabled ? "opacity-60 pointer-events-none" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  aria-disabled={isDisabled || undefined}
                >
                  {label}
                </a>
              );
            })}
            <a
              href={finderHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 text-xs font-semibold rounded-full bg-primary-green text-white hover:bg-primary-green/90 transition"
              title="Abrir buscador de palabras"
            >
              Buscador Palabra
            </a>
          </div>
        </div>

        <Keyboard
          onChar={onChar}
          onDelete={onDelete}
          onEnter={onEnter}
          guesses={guesses}
          solution={currentSolution}
          settings={settings}
        />
        <WinModal
          isOpen={isWinModalOpen}
          handleClose={() => {
            setIsWinModalOpen(false);
            setShowConfetti(false);
          }}
          guesses={guesses}
          solution={currentSolution}
          primaryActionLabel={primaryActionLabel}
          onPrimaryAction={handleNewGame}
          onShowStats={openStatsModal}
          settings={settings}
          maxGuesses={MAX_GUESSES}
        />
        <LoseModal
          isOpen={isLoseModalOpen}
          handleClose={() => setIsLoseModalOpen(false)}
          guesses={guesses}
          solution={currentSolution}
          primaryActionLabel={primaryActionLabel}
          onPrimaryAction={handleNewGame}
          onShowStats={openStatsModal}
          settings={settings}
        />
        <InfoModal
          isOpen={isInfoModalOpen}
          handleClose={() => setIsInfoModalOpen(false)}
        />
        <StatsModal
          isOpen={isStatsModalOpen}
          handleClose={() => setIsStatsModalOpen(false)}
          stats={stats}
        />
        <ModeInfoModal
          isOpen={isModeInfoOpen}
          handleClose={() => setIsModeInfoOpen(false)}
          currentMode={mode}
        />
        <CreateGameModal
          isOpen={isCreateGameModalOpen}
          handleClose={() => setIsCreateGameModalOpen(false)}
          settings={settings}
        />
      </div>
    </>
  );
}

export default Game;
