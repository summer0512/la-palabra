import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata, createBreadcrumbStructuredData } from "@/lib/seo";
import type { WordLength } from "@/constants/wordlist-metadata";
import { getGameCopy, getGamePath, getFinderPath } from "@/lib/length-pages";
import { getGameSeoContent } from "@/lib/length-seo-content";
import { GameSeoContentSection } from "@/components/length-pages/GameSeoContent";
import Game from "@/components/game";
import { GameBrowserEntry } from "@/components/game-browser-entry";
import Footer from "@/components/footer";
import type { AccentMode } from "@/lib/words";
import { DEFAULT_ACCENT_MODE } from "@/lib/words";
import { getGamePageData } from "@/lib/wordlists.server";

const numberFormatter = new Intl.NumberFormat("es-ES");

const formatNumber = (value: number) => numberFormatter.format(value);

type LengthGameConfig = {
  wordLength: WordLength;
  accentMode?: AccentMode;
};

export const makeLengthGameMetadata =
  ({ wordLength, accentMode = DEFAULT_ACCENT_MODE }: LengthGameConfig) =>
  async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
    const { locale } = await params;
    const copy = getGameCopy(wordLength, accentMode);
    const pathname = getGamePath(wordLength, accentMode);

    return createMetadata({
      locale,
      pathname,
      title: copy.title,
      description: copy.description,
      keywords: copy.keywords,
    });
  };

export const makeLengthGamePage =
  ({ wordLength, accentMode = DEFAULT_ACCENT_MODE }: LengthGameConfig) =>
  async ({ params }: { params: Promise<{ locale: string }> }) => {
    const { locale } = await params;
    const copy = getGameCopy(wordLength, accentMode);
    const pathname = getGamePath(wordLength, accentMode);
    const finderPath = getFinderPath(wordLength);
    const { wordListData, stats, dailySolution, requiresBrowserBundle } = await getGamePageData(wordLength);
    const seoContent = getGameSeoContent(wordLength, accentMode, stats, formatNumber);

    if (!requiresBrowserBundle && !wordListData) {
      throw new Error(`No se pudieron cargar los datos del diccionario para ${wordLength} letras.`);
    }

    const breadcrumb = createBreadcrumbStructuredData({
      locale,
      items: [
        { name: "La Palabra del Día", path: "/" },
        { name: copy.heading, path: pathname },
      ],
    });

    return (
      <>
        <div className="mx-auto w-full max-w-5xl space-y-10 py-10">
          <header className="space-y-4 text-center">
            <p className="text-xs uppercase tracking-wide text-primary-green">
              Juego de {wordLength} letras {accentMode === "accented" ? "con acentos" : "sin acentos"}
            </p>
            <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">{copy.heading}</h1>
            <p className="text-base text-muted-foreground sm:text-lg">{copy.subheading}</p>
            <div className="mt-4">
              <Link
                href={finderPath}
                className="inline-flex items-center rounded-full border border-primary-green px-4 py-1.5 text-xs font-semibold text-primary-green transition hover:bg-primary-green/10"
              >
                Ver buscador de palabras de {wordLength} letras
              </Link>
            </div>
          </header>

          <section className="rounded-3xl border border-gray-100 bg-white/80 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
            {requiresBrowserBundle ? (
              <GameBrowserEntry
                wordLength={wordLength}
                initialAccentMode={accentMode}
                initialDailySolution={dailySolution}
              />
            ) : (
              <Game
                initialWordLength={wordLength}
                initialAccentMode={accentMode}
                wordListData={wordListData!}
                initialDailySolution={dailySolution}
              />
            )}
          </section>

          <GameSeoContentSection content={seoContent} stats={stats} length={wordLength} accentMode={accentMode} />
        </div>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      </>
    );
  };
