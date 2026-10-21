import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Game from "@/components/game";
import SEOContent from "@/components/seo-content";
import Footer from "@/components/footer";
import { createMetadata } from "@/lib/seo";
import { DEFAULT_WORD_LENGTH } from "@/lib/words";
import { getGamePageData } from "@/lib/wordlists.server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });

  return createMetadata({
    locale,
    pathname: "/",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
  });
}

export default async function Home() {
  const { wordListData, dailySolution, requiresBrowserBundle } = await getGamePageData(DEFAULT_WORD_LENGTH);

  if (!wordListData || requiresBrowserBundle) {
    throw new Error("No se pudieron cargar los datos del diccionario por defecto.");
  }

  return (
    <div>
      <main>
        <Game wordListData={wordListData} initialDailySolution={dailySolution} />
        <SEOContent />
      </main>
      <Footer />
    </div>
  );
}
