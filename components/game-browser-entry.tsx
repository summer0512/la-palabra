"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Game from "@/components/game";
import { GameLoadingPlaceholder } from "@/components/game-loading-placeholder";
import { Button } from "@/components/ui/button";
import { loadBrowserWordListBundle, toWordListData } from "@/lib/browser-wordlists";
import { registerWordList, type AccentMode, type WordLength, type WordListData } from "@/lib/words";

type GameBrowserEntryProps = {
  wordLength: WordLength;
  initialDailySolution: string;
  initialAccentMode?: AccentMode;
};

type LoadStatus = "idle" | "loading" | "ready" | "error";

export function GameBrowserEntry({
  wordLength,
  initialDailySolution,
  initialAccentMode,
}: GameBrowserEntryProps) {
  const [wordListData, setWordListData] = useState<WordListData | null>(null);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const isLoading = status === "loading";

  const runLoad = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setStatus("loading");
    setErrorMessage(null);

    try {
      const bundle = await loadBrowserWordListBundle(wordLength);
      const data = toWordListData(bundle);
      registerWordList(wordLength, data);

      if (requestIdRef.current !== requestId) {
        return;
      }

      setWordListData(data);
      setStatus("ready");
    } catch (error) {
      console.error("[game] no se pudo cargar el diccionario del navegador", error);
      if (requestIdRef.current !== requestId) {
        return;
      }
      setWordListData(null);
      setStatus("error");
      setErrorMessage("No pudimos cargar el diccionario. Intenta de nuevo en unos segundos.");
    }
  }, [wordLength]);

  useEffect(() => {
    void runLoad();
  }, [runLoad]);

  if (status === "loading" || status === "idle") {
    return <GameLoadingPlaceholder wordLength={wordLength} />;
  }

  if (status === "error" || !wordListData) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="max-w-md space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Estamos cargando tu diccionario
          </h2>
          <p className="text-base text-muted-foreground">
            {errorMessage ??
              "No pudimos cargar el diccionario. Comprueba tu conexión o vuelve a intentarlo."}
          </p>
        </div>
        <Button onClick={runLoad} disabled={isLoading}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <Game
      wordListData={wordListData}
      initialWordLength={wordLength}
      initialAccentMode={initialAccentMode}
      initialDailySolution={initialDailySolution}
    />
  );
}
