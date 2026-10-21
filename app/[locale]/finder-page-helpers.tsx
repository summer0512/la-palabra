import type { Metadata } from "next";
import type { WordLength } from "@/constants/wordlist-metadata";
import { createMetadata, createBreadcrumbStructuredData } from "@/lib/seo";
import { getFinderCopy, getFinderPath } from "@/lib/length-pages";
import { FinderSeoContentSection } from "@/components/length-pages/FinderSeoContent";
import WordFinderClient from "@/app/[locale]/buscador-palabras/word-finder-client";
import Footer from "@/components/footer";
import { getFinderSeoContent } from "@/lib/length-seo-content";
import { FINDER_PREVIEW_LIMIT, getFinderPreviewData } from "@/lib/wordlists.server";

const numberFormatter = new Intl.NumberFormat("es-ES");
const formatNumber = (value: number) => numberFormatter.format(value);

type FinderPageConfig = {
  wordLength: WordLength;
};

export const makeFinderMetadata =
  ({ wordLength }: FinderPageConfig) =>
  async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
    const { locale } = await params;
    const { stats } = await getFinderPreviewData(wordLength);
    const copy = getFinderCopy(wordLength, stats.unique);
    const pathname = getFinderPath(wordLength);

    return createMetadata({
      locale,
      pathname,
      title: copy.title,
      description: copy.description,
      keywords: copy.keywords,
    });
  };

export const makeFinderPage =
  ({ wordLength }: FinderPageConfig) =>
  async ({ params }: { params: Promise<{ locale: string }> }) => {
    const { locale } = await params;
    const pathname = getFinderPath(wordLength);
    const { preview, stats } = await getFinderPreviewData(wordLength);
    const copy = getFinderCopy(wordLength, stats.unique);
    const seoContent = getFinderSeoContent(wordLength, "accented", stats, formatNumber);

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
          <WordFinderClient
            wordLength={wordLength}
            initialWords={preview}
            initialTotalMatches={stats.unique}
            resultsPageSize={FINDER_PREVIEW_LIMIT}
            heroTitle={copy.heading}
            heroSubtitle={copy.subheading}
            heroHelper={`Palabras de ${wordLength} letras con y sin acentos.`}
          />

          <FinderSeoContentSection content={seoContent} stats={stats} length={wordLength} />
        </div>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      </>
    );
  };
