import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import WordFinderClient from "./word-finder-client";
import Footer from "@/components/footer";
import { createBreadcrumbStructuredData, createMetadata } from "@/lib/seo";
import { DEFAULT_WORD_LENGTH } from "@/lib/words";
import { FINDER_PREVIEW_LIMIT, getFinderPreviewData } from "@/lib/wordlists.server";
import { getGuidePath, getGamePath } from "@/lib/length-pages";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WordFinderPage" });

  return createMetadata({
    locale,
    pathname: "/buscador-palabras",
    title: t("meta.title"),
    description: t("meta.description"),
    keywords: t("meta.keywords"),
  });
}

export default async function WordFinderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "WordFinderPage" });
  const { preview, stats } = await getFinderPreviewData(DEFAULT_WORD_LENGTH);
  const guidePath = getGuidePath(DEFAULT_WORD_LENGTH);
  const gamePath = getGamePath(DEFAULT_WORD_LENGTH, "plain");

  const breadcrumbStructuredData = createBreadcrumbStructuredData({
    locale,
    items: [
      { name: "La Palabra del Día", path: "/" },
      { name: t("breadcrumbLabel"), path: "/buscador-palabras" },
    ],
  });
  const breadcrumbStructuredDataJson = JSON.stringify(breadcrumbStructuredData);

  const rawParagraphs = t.raw("seoSection.paragraphs");
  const seoParagraphs = Array.isArray(rawParagraphs) ? (rawParagraphs as string[]) : [];

  const rawHighlights = t.raw("seoSection.highlights");
  const seoHighlights = Array.isArray(rawHighlights)
    ? (rawHighlights as { title: string; description: string }[])
    : [];

  const rawFaq = t.raw("seoSection.faq");
  const faqEntries = Array.isArray(rawFaq)
    ? (rawFaq as { question: string; answer: string }[])
    : [];

  const faqStructuredDataJson = faqEntries.length
    ? JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqEntries.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      })
    : null;

  return (
    <>
      <div className="pb-12">
        <main className="container max-w-5xl space-y-12 py-10">
          <WordFinderClient
            wordLength={DEFAULT_WORD_LENGTH}
            initialWords={preview}
            initialTotalMatches={stats.unique}
            resultsPageSize={FINDER_PREVIEW_LIMIT}
          />

          <section className="space-y-5 rounded-3xl border border-muted bg-background/60 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">{t("seoSection.title")}</h2>
            <p className="text-muted-foreground">{t("seoSection.subtitle")}</p>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              {seoParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            {seoHighlights.length > 0 && (
              <div className="grid gap-4 md:grid-cols-3">
                {seoHighlights.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
                  >
                    <h3 className="text-base font-semibold text-emerald-700 dark:text-emerald-200">{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="grid gap-4 rounded-3xl border border-primary-green/20 bg-[#ecf0e2] p-6 md:grid-cols-2">
            <Link
              href={guidePath}
              className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm leading-relaxed text-gray-700 transition hover:border-primary-green/40"
            >
              <span className="block text-sm font-semibold text-primary-green">Guia de 5 letras</span>
              Estrategias, aperturas recomendadas y tecnicas para resolver en 6 intentos.
            </Link>
            <Link
              href={gamePath}
              className="rounded-2xl border border-white/70 bg-white/80 p-4 text-sm leading-relaxed text-gray-700 transition hover:border-primary-green/40"
            >
              <span className="block text-sm font-semibold text-primary-green">Volver al juego</span>
              Juega la palabra diaria o practica en el modo infinito sin salir del sitio.
            </Link>
          </section>

          {faqEntries.length > 0 && (
            <section className="space-y-4 rounded-3xl border border-muted bg-background/60 p-6 shadow-sm">
              <h2 className="text-2xl font-semibold">{t("seoSection.faqTitle")}</h2>
              <p className="text-muted-foreground">{t("seoSection.faqSubtitle")}</p>
              <div className="space-y-3">
                {faqEntries.map((item, index) => (
                  <details
                    key={index}
                    className="group rounded-2xl border border-muted-foreground/30 bg-card/70 p-4"
                  >
                    <summary className="cursor-pointer text-base font-medium leading-6">
                      {item.question}
                    </summary>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbStructuredDataJson }}
      />
      {faqStructuredDataJson ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faqStructuredDataJson }}
        />
      ) : null}
    </>
  );
}
