"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MultiSelectDropdown from "@/components/ui/multi-select-dropdown";
import { Badge } from "@/components/ui/badge";
import { getGamePath } from "@/lib/length-pages";
import { loadBrowserWordListBundle, toWordListData } from "@/lib/browser-wordlists";
import {
  getPlainUppercaseWordList,
  getUppercaseWordList,
  registerWordList,
  stripAccents,
  type WordLength,
} from "@/lib/words";
import { Filter, RotateCcw, Target, Info, Zap, BookOpen, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  "\u00D1",
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
  "\u00C1",
  "\u00C9",
  "\u00CD",
  "\u00D3",
  "\u00DA",
  "\u00DC",
];

const LETTER_SET = new Set(LETTER_OPTIONS);
const LETTER_OPTIONS_PLAIN = LETTER_OPTIONS.filter(
  (letter) => !["Á", "É", "Í", "Ó", "Ú", "Ü"].includes(letter)
);
const UPPERCASE_LOCALE = "es-ES";

const RESULTS_ERROR_MESSAGE = "No pudimos cargar los resultados. Intenta de nuevo.";

type WordFinderClientProps = {
  wordLength: WordLength;
  initialWords: readonly string[];
  initialTotalMatches: number;
  resultsPageSize: number;
  heroTitle?: string;
  heroSubtitle?: string;
  heroHelper?: string;
};

const sanitizeLetter = (rawValue: string) => {
  if (!rawValue) {
    return "";
  }
  const normalized = rawValue.toLocaleUpperCase(UPPERCASE_LOCALE);
  for (const char of Array.from(normalized)) {
    if (LETTER_SET.has(char)) {
      return char;
    }
  }
  return "";
};

const createEmptyPositions = (length: number) => Array.from({ length }, () => "");

export default function WordFinderClient({
  wordLength,
  initialWords,
  initialTotalMatches,
  resultsPageSize,
  heroTitle,
  heroSubtitle,
  heroHelper,
}: WordFinderClientProps) {
  const t = useTranslations("WordFinderPage");
  const positionCount = wordLength;
  const [positionLetters, setPositionLetters] = useState<string[]>(() => createEmptyPositions(positionCount));
  const [includeLetters, setIncludeLetters] = useState<string[]>([]);
  const [excludeLetters, setExcludeLetters] = useState<string[]>([]);
  const [respectAccents, setRespectAccents] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [hasInitializedFromParams, setHasInitializedFromParams] = useState(false);
  const [uppercaseWordList, setUppercaseWordListState] = useState<ReadonlyArray<string> | null>(null);
  const [plainUppercaseWordList, setPlainUppercaseWordListState] = useState<ReadonlyArray<string> | null>(null);
  const [isWordListLoading, setIsWordListLoading] = useState(true);
  const [wordListError, setWordListError] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>(() => Array.from(initialWords).slice(0, resultsPageSize));
  const [totalMatches, setTotalMatches] = useState(initialTotalMatches);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const positionRefs = useRef<Array<HTMLInputElement | null>>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    setPositionLetters((prev) => {
      if (prev.length === positionCount) {
        return prev;
      }
      const next = createEmptyPositions(positionCount);
      for (let i = 0; i < Math.min(prev.length, positionCount); i += 1) {
        next[i] = prev[i];
      }
      return next;
    });
  }, [positionCount]);

  useEffect(() => {
    positionRefs.current = Array.from({ length: positionCount }, (_, index) => positionRefs.current[index] ?? null);
  }, [positionCount]);

  useEffect(() => {
    setResults(Array.from(initialWords).slice(0, resultsPageSize));
    setTotalMatches(initialTotalMatches);
    setResultsError(null);
  }, [initialWords, initialTotalMatches, resultsPageSize]);

  useEffect(() => {
    let isActive = true;
    setIsWordListLoading(true);
    setWordListError(null);

    loadBrowserWordListBundle(wordLength)
      .then((bundle) => {
        if (!isActive) {
          return;
        }
        const data = toWordListData(bundle);
        registerWordList(wordLength, data);
        setUppercaseWordListState(getUppercaseWordList(wordLength));
        setPlainUppercaseWordListState(getPlainUppercaseWordList(wordLength));
        setTotalMatches(bundle.stats.unique);
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }
        console.error("[finder] no se pudo cargar el diccionario", error);
        setWordListError("No pudimos cargar el diccionario completo. Intenta recargar la página.");
        setUppercaseWordListState(null);
        setPlainUppercaseWordListState(null);
      })
      .finally(() => {
        if (isActive) {
          setIsWordListLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [wordLength]);

  useEffect(() => {
    if (hasInitializedFromParams) {
      return;
    }
    if (!searchParams) {
      return;
    }

    const accParam = searchParams.get("acc");
    const includeParam = searchParams.get("incl");
    const excludeParam = searchParams.get("excl");
    const positionsParam = searchParams.get("pos");

    if (accParam === "1") {
      setRespectAccents(true);
    }

    if (positionsParam && positionsParam.length === positionCount) {
      setPositionLetters(
        Array.from(positionsParam).map((char) => {
          if (char === "_") {
            return "";
          }
          return sanitizeLetter(char);
        })
      );
    }

    const parseLettersParam = (value: string | null) => {
      if (!value) {
        return [];
      }
      return Array.from(value)
        .map((char) => sanitizeLetter(char))
        .filter(Boolean);
    };

    const parsedInclude = parseLettersParam(includeParam);
    if (parsedInclude.length) {
      setIncludeLetters(parsedInclude);
    }
    const parsedExclude = parseLettersParam(excludeParam);
    if (parsedExclude.length) {
      setExcludeLetters(parsedExclude);
    }

    setHasInitializedFromParams(true);
  }, [searchParams, positionCount, hasInitializedFromParams]);

  useEffect(() => {
    if (!hasInitializedFromParams) {
      return;
    }
    if (!respectAccents) {
      setIncludeLetters((prev) => {
        const current = Array.isArray(prev) ? prev : [];
        const unique = new Set(current.map((letter) => stripAccents(letter)));
        return Array.from(unique);
      });
      setExcludeLetters((prev) => {
        const current = Array.isArray(prev) ? prev : [];
        const unique = new Set(current.map((letter) => stripAccents(letter)));
        return Array.from(unique);
      });
      setPositionLetters((prev) =>
        prev.map((letter) => (letter ? stripAccents(letter) : ""))
      );
    }
  }, [respectAccents, hasInitializedFromParams]);

  useEffect(() => {
    if (!shareFeedback) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setShareFeedback(null);
    }, 2500);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [shareFeedback]);

  const updatePosition = useCallback(
    (index: number, rawValue: string) => {
      const sanitized = sanitizeLetter(rawValue);
      const finalValue = respectAccents ? sanitized : stripAccents(sanitized);
      const valueForRemoval = finalValue || sanitized;

      setPositionLetters((prev) => {
        const next = [...prev];
        next[index] = finalValue;
        return next;
      });

      if (valueForRemoval) {
        setIncludeLetters((prev) => {
          const current = Array.isArray(prev) ? prev : [];
          return current.filter((letter) => letter !== valueForRemoval);
        });
        setExcludeLetters((prev) => {
          const current = Array.isArray(prev) ? prev : [];
          return current.filter((letter) => letter !== valueForRemoval);
        });
      }

      return finalValue;
    },
    [respectAccents]
  );

  const handlePositionChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, index: number) => {
      const sanitized = updatePosition(index, event.target.value);

      if (sanitized && index < positionCount - 1) {
        const nextRef = positionRefs.current[index + 1];
        nextRef?.focus();
        nextRef?.select?.();
      }
    },
    [positionCount, updatePosition]
  );

  const handlePositionKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>, index: number) => {
      if (event.key === "Backspace") {
        if (positionLetters[index]) {
          event.preventDefault();
          updatePosition(index, "");
          return;
        }
        if (index > 0) {
          event.preventDefault();
          const previousIndex = index - 1;
          updatePosition(previousIndex, "");
          const previousRef = positionRefs.current[previousIndex];
          previousRef?.focus();
          previousRef?.select?.();
        }
        return;
      }

      if (event.key === "Delete") {
        event.preventDefault();
        updatePosition(index, "");
        return;
      }

      if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        positionRefs.current[index - 1]?.focus();
        return;
      }

      if (event.key === "ArrowRight" && index < positionCount - 1) {
        event.preventDefault();
        positionRefs.current[index + 1]?.focus();
      }
    },
    [positionLetters, positionCount, updatePosition]
  );

  const handleIncludeSelect = useCallback(
    (letter: string) => {
      const sanitized = sanitizeLetter(letter);
      if (!sanitized) {
        return;
      }
      const normalized = respectAccents ? sanitized : stripAccents(sanitized);

      setIncludeLetters((prev) => {
        const current = Array.isArray(prev) ? prev : [];
        return current.includes(normalized) ? current : [...current, normalized];
      });
      setExcludeLetters((prev) => {
        const current = Array.isArray(prev) ? prev : [];
        return current.filter((item) => item !== normalized);
      });
      setPositionLetters((prev) => prev.map((item) => (item === normalized ? "" : item)));
    },
    [respectAccents]
  );

  const handleIncludeRemove = useCallback((letter: string) => {
    setIncludeLetters((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      return current.filter((item) => item !== letter);
    });
  }, []);

  const handleIncludeClearAll = useCallback(() => {
    setIncludeLetters([]);
  }, []);

  const handleExcludeSelect = useCallback(
    (letter: string) => {
      const sanitized = sanitizeLetter(letter);
      if (!sanitized) {
        return;
      }
      const normalized = respectAccents ? sanitized : stripAccents(sanitized);

      setExcludeLetters((prev) => {
        const current = Array.isArray(prev) ? prev : [];
        return current.includes(normalized) ? current : [...current, normalized];
      });
      setIncludeLetters((prev) => {
        const current = Array.isArray(prev) ? prev : [];
        return current.filter((item) => item !== normalized);
      });
      setPositionLetters((prev) => prev.map((item) => (item === normalized ? "" : item)));
    },
    [respectAccents]
  );

  const handleExcludeRemove = useCallback((letter: string) => {
    setExcludeLetters((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      return current.filter((item) => item !== letter);
    });
  }, []);

  const handleExcludeClearAll = useCallback(() => {
    setExcludeLetters([]);
  }, []);

  const resetFilters = useCallback(() => {
    setPositionLetters(createEmptyPositions(positionCount));
    setIncludeLetters([]);
    setExcludeLetters([]);
    setShareFeedback(null);
    positionRefs.current[0]?.focus();
  }, [positionCount]);

  const availableLetters = useMemo(
    () => (respectAccents ? LETTER_OPTIONS : LETTER_OPTIONS_PLAIN),
    [respectAccents]
  );

  const gamePagePath = useMemo(() => getGamePath(wordLength, "plain"), [wordLength]);

  const activePositionLetters = useMemo(() => positionLetters.filter(Boolean), [positionLetters]);

  const includeDisabledLetters = useMemo(() => {
    if (respectAccents) {
      return Array.from(new Set([...excludeLetters, ...activePositionLetters]));
    }
    const normalized = [...excludeLetters, ...activePositionLetters]
      .filter(Boolean)
      .map((letter) => stripAccents(letter));
    return Array.from(new Set(normalized));
  }, [respectAccents, excludeLetters, activePositionLetters]);

  const excludeDisabledLetters = useMemo(() => {
    if (respectAccents) {
      return Array.from(new Set([...includeLetters, ...activePositionLetters]));
    }
    const normalized = [...includeLetters, ...activePositionLetters]
      .filter(Boolean)
      .map((letter) => stripAccents(letter));
    return Array.from(new Set(normalized));
  }, [respectAccents, includeLetters, activePositionLetters]);

  const finderSearchQuery = useMemo(() => {
    const params = new URLSearchParams();

    if (positionLetters.some((letter) => letter)) {
      const positionsValue = positionLetters.map((letter) => (letter ? letter : "_")).join("");
      params.set("pos", positionsValue);
    }

    if (includeLetters.length > 0) {
      params.set("incl", includeLetters.join(""));
    }

    if (excludeLetters.length > 0) {
      params.set("excl", excludeLetters.join(""));
    }

    if (respectAccents) {
      params.set("acc", "1");
    }

    return params.toString();
  }, [positionLetters, includeLetters, excludeLetters, respectAccents]);

  const buildShareUrl = useCallback(() => {
    if (typeof window === "undefined") {
      return "";
    }
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const query = finderSearchQuery;
    return query ? `${baseUrl}?${query}` : baseUrl;
  }, [finderSearchQuery]);

  useEffect(() => {
    if (!hasInitializedFromParams) {
      return;
    }

    if (isWordListLoading) {
      setIsLoadingResults(true);
      return;
    }

    if (wordListError) {
      setResultsError(wordListError);
      setIsLoadingResults(false);
      return;
    }

    if (!uppercaseWordList || !plainUppercaseWordList) {
      setResultsError(RESULTS_ERROR_MESSAGE);
      setIsLoadingResults(false);
      return;
    }

    setIsLoadingResults(true);
    setResultsError(null);

    const normalizedPositionLetters = respectAccents
      ? positionLetters
      : positionLetters.map((letter) => (letter ? stripAccents(letter) : ""));

    const normalizedIncludeLetters = respectAccents
      ? includeLetters
      : includeLetters.map((letter) => stripAccents(letter));

    const normalizedExcludeLetters = respectAccents
      ? excludeLetters
      : excludeLetters.map((letter) => stripAccents(letter));

    const includeFilter = Array.from(new Set(normalizedIncludeLetters.filter(Boolean)));
    const excludeFilter = Array.from(new Set(normalizedExcludeLetters.filter(Boolean)));

    const comparisonWordList = respectAccents ? uppercaseWordList : plainUppercaseWordList;

    const matches: string[] = [];
    let total = 0;

    for (let index = 0; index < comparisonWordList.length; index += 1) {
      const comparisonWord = comparisonWordList[index];
      const originalWord = uppercaseWordList[index];

      let matchesPositions = true;
      for (let positionIndex = 0; positionIndex < wordLength; positionIndex += 1) {
        const target = normalizedPositionLetters[positionIndex];
        if (target && comparisonWord[positionIndex] !== target) {
          matchesPositions = false;
          break;
        }
      }

      if (!matchesPositions) {
        continue;
      }

      if (includeFilter.length > 0) {
        let includesAll = true;
        for (const letter of includeFilter) {
          if (!comparisonWord.includes(letter)) {
            includesAll = false;
            break;
          }
        }
        if (!includesAll) {
          continue;
        }
      }

      if (excludeFilter.length > 0) {
        let excludesAll = true;
        for (const letter of excludeFilter) {
          if (letter && comparisonWord.includes(letter)) {
            excludesAll = false;
            break;
          }
        }
        if (!excludesAll) {
          continue;
        }
      }

      total += 1;
      if (matches.length < resultsPageSize) {
        matches.push(originalWord);
      }
    }

    setResults(matches);
    setTotalMatches(total);
    setResultsError(null);
    setIsLoadingResults(false);
  }, [
    hasInitializedFromParams,
    includeLetters,
    excludeLetters,
    respectAccents,
    positionLetters,
    wordLength,
    resultsPageSize,
    isWordListLoading,
    wordListError,
    uppercaseWordList,
    plainUppercaseWordList,
  ]);

  const handleShare = useCallback(async () => {
    const url = buildShareUrl();
    if (!url) {
      return;
    }
    const shareTitle = heroTitle ?? t("shareTitle", { wordLength });
    const shareText = t("shareDescription");

    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url });
        setShareFeedback({ message: t("shareCopied"), type: "success" });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareFeedback({ message: t("shareCopied"), type: "success" });
        return;
      }
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShareFeedback({ message: t("shareCopied"), type: "success" });
    } catch (error) {
      console.error(error);
      setShareFeedback({ message: t("shareError"), type: "error" });
    }
  }, [buildShareUrl, heroTitle, t, wordLength]);

  const setAccentMode = useCallback((value: boolean) => {
    setRespectAccents(value);
  }, []);

  const hasFilters = useMemo(
    () => positionLetters.some(Boolean) || includeLetters.length > 0 || excludeLetters.length > 0,
    [positionLetters, includeLetters, excludeLetters]
  );

  const resultsCountLabel = useMemo(() => new Intl.NumberFormat('es-ES').format(totalMatches), [totalMatches]);
  const resultsPageSizeLabel = useMemo(
    () => new Intl.NumberFormat('es-ES').format(resultsPageSize),
    [resultsPageSize]
  );

  const tips = useMemo(() => {
    const raw = t.raw("tipsList");
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [t]);


  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-primary-green px-4 py-1.5 text-xs font-semibold text-primary-green transition hover:bg-primary-green/10"
            >
              {t("topNav.home")}
            </Link>
            <Link
              href={gamePagePath}
              className="inline-flex items-center rounded-full border border-primary-green px-4 py-1.5 text-xs font-semibold text-primary-green transition hover:bg-primary-green/10"
            >
              {t("topNav.game", { wordLength })}
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {shareFeedback ? (
              <span
                className={cn(
                  "text-xs font-medium",
                  shareFeedback.type === "error" ? "text-rose-600" : "text-primary-green"
                )}
              >
                {shareFeedback.message}
              </span>
            ) : null}
            <Button type="button" variant="secondary" onClick={handleShare} className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              {t("shareButton")}
            </Button>
          </div>
        </div>
        <div className="space-y-3 text-center">
          <Badge variant="secondary" className="mx-auto w-fit px-4 py-1 uppercase tracking-wide">
            {t("badge")}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{heroTitle ?? t("heroTitle")}</h1>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg">{heroSubtitle ?? t("heroDescription")}</p>
          <p className="mx-auto max-w-3xl text-sm text-muted-foreground">{heroHelper ?? t("heroHelper")}</p>
        </div>
      </section>

      <Card className="border-2 border-green-500 shadow-lg dark:border-green-900">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span className="rounded-lg bg-green-100 p-2 text-green-600 dark:bg-green-900 dark:text-green-300">
                  <Filter className="h-5 w-5" />
                </span>
                {t("filtersTitle", { wordLength })}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {t("filtersDescription")}
              </CardDescription>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <div className="flex flex-wrap gap-2 md:justify-end">
                <div className="inline-flex rounded-md border border-primary-green/40 overflow-hidden">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setAccentMode(false)}
                    className={cn(
                      "flex-1 rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-wide",
                      respectAccents
                        ? "bg-transparent text-primary-green hover:bg-primary-green/5"
                        : "bg-primary-green text-white hover:bg-primary-green",
                      "border-r border-primary-green/40"
                    )}
                    aria-pressed={!respectAccents}
                  >
                    {t("accentToggle.off")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setAccentMode(true)}
                    className={cn(
                      "flex-1 rounded-none px-4 py-2 text-xs font-semibold uppercase tracking-wide",
                      respectAccents
                        ? "bg-primary-green text-white hover:bg-primary-green"
                        : "bg-transparent text-primary-green hover:bg-primary-green/5"
                    )}
                    aria-pressed={respectAccents}
                  >
                    {t("accentToggle.on")}
                  </Button>
                </div>
                <Button type="button" variant="outline" onClick={resetFilters} className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  {t("resetButton")}
                </Button>
              </div>
              <span className="text-xs text-muted-foreground max-w-xs text-pretty md:text-right">
                {t("accentToggle.helper")}
              </span>
              {!hasFilters && <span className="text-xs text-muted-foreground md:text-right">{t("resetHelper")}</span>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="grid gap-6 md:grid-cols-7">
            <div className="space-y-3 col-span-7 md:col-span-3">
              <div className="flex items-start justify-between gap-3 relative">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold uppercase tracking-wide text-green-600 dark:text-green-300">
                    {t("positionSectionTitle")}
                  </h2>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <span>{t("positionSectionDescription")}</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="hidden md:absolute right-0 whitespace-nowrap bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950/30 dark:text-green-200 md:inline-flex"
                >
                  {t("positionBadge", { wordLength })}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                {positionLetters.map((letter, index) => (
                  <Input
                    key={index}
                    ref={(element) => {
                      positionRefs.current[index] = element;
                    }}
                    value={letter}
                    inputMode="text"
                    maxLength={1}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label={t("positionInputAria", { position: index + 1 })}
                    className={cn(
                      "h-10 max-w-[40px] text-center text-lg font-semibold uppercase tracking-wide px-0",
                      letter
                        ? "bg-green-600 text-white dark:border-green-400 dark:text-green-300"
                        : "text-muted-foreground"
                    )}
                    onChange={(event) => handlePositionChange(event, index)}
                    onKeyDown={(event) => handlePositionKeyDown(event, index)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2 col-span-7 md:col-span-2">
              <h3 className="text-base font-semibold uppercase tracking-wide text-yellow-500 dark:text-yellow-300">
                {t("includeSectionTitle")}
              </h3>
              <p className="text-sm text-muted-foreground">{t("includeSectionDescription")}</p>
              <MultiSelectDropdown
                selectedLetters={includeLetters}
                availableLetters={availableLetters}
                disabledLetters={includeDisabledLetters}
                onSelect={handleIncludeSelect}
                onRemove={handleIncludeRemove}
                onClearAll={handleIncludeClearAll}
                placeholder={t("includePlaceholder")}
                variant="include"
                allowClear={true}
              />
            </div>

            <div className="space-y-2 col-span-7 md:col-span-2">
              <h3 className="text-base font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                {t("excludeSectionTitle")}
              </h3>
              <p className="text-sm text-muted-foreground min-h-[60px]">{t("excludeSectionDescription")}</p>
              <MultiSelectDropdown
                selectedLetters={excludeLetters}
                availableLetters={availableLetters}
                disabledLetters={excludeDisabledLetters}
                onSelect={handleExcludeSelect}
                onRemove={handleExcludeRemove}
                onClearAll={handleExcludeClearAll}
                placeholder={t("excludePlaceholder")}
                variant="exclude"
                allowClear={true}
              />
            </div>
          </section>
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-100 shadow-lg dark:border-blue-900">
        <CardHeader>
          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  <Target className="h-5 w-5" />
                </span>
                {t("resultsTitle")}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {t("resultsDescription")}
              </CardDescription>
              <p className="text-sm text-muted-foreground">Coincidencias encontradas: {resultsCountLabel}</p>
              <p className="text-xs text-muted-foreground">
                Mostramos un máximo de {resultsPageSizeLabel} resultados por búsqueda.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {resultsError ? (
            <div className="rounded-lg border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
              {resultsError}
            </div>
          ) : null}
          {isLoadingResults ? (
            <div className="rounded-lg border border-muted-foreground/30 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
              Buscando coincidencias…
            </div>
          ) : null}
          {results.length === 0 && !isLoadingResults ? (
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/40 p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <Info className="h-6 w-6 text-muted-foreground" />
                <p className="max-w-xl text-sm text-muted-foreground">{t("noResultsDescription")}</p>
              </div>
            </div>
          ) : (
            <>
              <ul className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
                {results.map((word) => (
                  <li
                    key={word}
                    className="text-xs uppercase tracking-wide py-0 my-0"
                  >
                    {word},
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-amber-100 shadow-lg dark:border-amber-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900 dark:text-amber-300">
              <BookOpen className="h-5 w-5" />
            </span>
            {t("tipsTitle")}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {t("tipsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="grid gap-3 md:grid-cols-3">
            {tips.map((tip, index) => (
              <li
                key={index}
                className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-semibold text-amber-800 dark:bg-amber-800 dark:text-amber-100">
                  {index + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <Zap className="h-4 w-4" />
            <span>{t("tipsFooter")}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
