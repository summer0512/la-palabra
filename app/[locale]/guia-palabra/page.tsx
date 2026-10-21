import type { Metadata } from "next";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { BarChart3 } from "lucide-react";
import Footer from "@/components/footer";
import { createBreadcrumbStructuredData, createMetadata } from "@/lib/seo";
import { WORD_LENGTH_VARIANTS, getGuidePath } from "@/lib/length-pages";

const sections = [
  {
    id: "introduccion",
    titleKey: "intro.title",
    descriptionKey: "intro.description",
  },
  {
    id: "estrategias",
    titleKey: "strategies.title",
    descriptionKey: "strategies.description",
  },
  {
    id: "modos-de-juego",
    titleKey: "modes.title",
    descriptionKey: "modes.description",
  },
  {
    id: "desafios",
    titleKey: "challenges.title",
    descriptionKey: "challenges.description",
  },
  {
    id: "estadisticas",
    titleKey: "stats.title",
    descriptionKey: "stats.description",
  },
  {
    id: "recursos",
    titleKey: "resources.title",
    descriptionKey: "resources.description",
  },
  {
    id: "faq",
    titleKey: "faq.title",
    descriptionKey: "faq.description",
  },
] as const;


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "GuidePage" });

  return createMetadata({
    locale,
    pathname: "/guia-palabra",
    title: t("meta.title"),
    description: t("meta.description"),
    keywords: t("meta.keywords"),
  });
}

export default function GuidePage() {
  const locale = useLocale();
  const t = useTranslations("GuidePage");

  const breadcrumbStructuredData = createBreadcrumbStructuredData({
    locale,
    items: [
      { name: "La Palabra del Día", path: "/" },
      { name: t("hero.title"), path: "/guia-palabra" },
    ],
  });
  const breadcrumbStructuredDataJson = JSON.stringify(breadcrumbStructuredData);

  const guideSections = sections.map((entry) => {
    // Get the correct items key based on the mapping
    let itemsKey = `${entry.id}.items`;
    if (entry.id === "introduccion") itemsKey = "intro.items";
    else if (entry.id === "estrategias") itemsKey = "strategies.items";
    else if (entry.id === "modos-de-juego") itemsKey = "modes.items";
    else if (entry.id === "desafios") itemsKey = "challenges.items";
    else if (entry.id === "estadisticas") itemsKey = "stats.items";
    else if (entry.id === "recursos") itemsKey = "resources.items";
    else if (entry.id === "faq") itemsKey = "faq.entries";

    let items: string[] | undefined;
    if (entry.id === "faq") {
      // For FAQ, extract questions from entries
      const faqEntries = t.raw("faq.entries") as Array<{ question: string; answer: string }>;
      items = faqEntries?.map(entry => entry.question);
    } else {
      items = t.raw(itemsKey) as string[] | undefined;
    }

    return {
      ...entry,
      title: t(entry.titleKey),
      description: t(entry.descriptionKey),
      items,
    };
  });

  const faqEntries = t.raw("faq.entries") as Array<{ question: string; answer: string }>;
  const lengthGuides = WORD_LENGTH_VARIANTS.map((length) => ({
    length,
    href: getGuidePath(length),
    title: `Guía de ${length} letras`,
    description: `Estrategias, aperturas y tips para palabras de ${length} letras.`,
  }));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://lapalabra-deldia.com";
  const canonicalUrl = `${siteUrl}/guia-palabra`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: t("hero.title"),
    description: t("meta.description"),
    inLanguage: locale === "es" ? "es-ES" : locale,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    potentialAction: {
      '@type': 'ReadAction',
      target: canonicalUrl,
    },
    author: {
      '@type': 'Organization',
      name: 'La Palabra del Día',
      url: 'https://lapalabra-deldia.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'La Palabra del Día',
      url: 'https://lapalabra-deldia.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lapalabra-deldia.com/logo.png',
      },
    },
    datePublished: '2025-01-01',
    dateModified: '2025-10-17',
    articleSection: 'Juegos de Palabras',
    keywords: t("meta.keywords"),
  };

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqEntries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  };

  const howToStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Cómo Jugar La Palabra del Día - Guía Completa',
    description: 'Aprende a jugar La Palabra del Día en menos de 1 minuto',
    image: 'https://lapalabra-deldia.com/images/como-jugar-palabra.jpg',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Escribe una palabra',
        text: 'Comienza escribiendo cualquier palabra de 5 letras en español en La Palabra del Día.',
        image: 'https://lapalabra-deldia.com/images/paso-1.jpg',
      },
      {
        '@type': 'HowToStep',
        name: 'Observa los colores',
        text: '🟩 Verde: letra correcta en el lugar correcto | 🟨 Amarillo: letra existe, pero está en el lugar incorrecto | ⬛ Gris: letra no existe en la palabra',
        image: 'https://lapalabra-deldia.com/images/paso-2.jpg',
      },
      {
        '@type': 'HowToStep',
        name: 'Usa las pistas',
        text: 'Basado en los colores, haz tu próximo intento. Elimina letras grises, reposiciona las amarillas y mantén las verdes en su lugar.',
        image: 'https://lapalabra-deldia.com/images/paso-3.jpg',
      },
      {
        '@type': 'HowToStep',
        name: 'Descubre la palabra',
        text: 'Tienes 6 intentos para descubrir la palabra secreta. ¡Cuántos menos intentos uses, mejor tu puntuación!',
        image: 'https://lapalabra-deldia.com/images/paso-4.jpg',
      },
    ],
  };

  const courseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Guía Completa de La Palabra del Día',
    description: 'Aprende estrategias ganadoras y domina el juego La Palabra del Día en español',
    provider: {
      '@type': 'Organization',
      name: 'La Palabra del Día',
      url: 'https://lapalabra-deldia.com',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      instructor: {
        '@type': 'Organization',
        name: 'La Palabra del Día',
      },
    },
    teaches: [
      'Estrategias de apertura para La Palabra del Día',
      'Cómo interpretar los colores del juego',
      'Mejores palabras iniciales',
      'Análisis de estadísticas',
      'Cómo jugar Palabra Infinito',
      'Creación de desafíos personalizados',
    ],
    inLanguage: locale === "es" ? "es-ES" : locale,
    about: [
      'Juego de palabras',
      'La Palabra del Día',
      'Wordle español',
      'Estrategias de juego',
    ],
  };

  const videoGameStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'La Palabra del Día - Juego de Palabras en Español',
    description: '¡Juega a La Palabra del Día online gratis! El juego de palabras más popular en español.',
    url: 'https://lapalabra-deldia.com',
    genre: ['Puzzle', 'Word Game', 'Educational'],
    gamePlatform: 'Web Browser',
    applicationCategory: 'Game',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
    publisher: {
      '@type': 'Organization',
      name: 'La Palabra del Día',
      url: 'https://lapalabra-deldia.com',
    },
    inLanguage: 'es-ES',
  };

  const structuredDataJson = JSON.stringify(structuredData);
  const faqStructuredDataJson = JSON.stringify(faqStructuredData);
  const howToStructuredDataJson = JSON.stringify(howToStructuredData);
  const courseStructuredDataJson = JSON.stringify(courseStructuredData);
  const videoGameStructuredDataJson = JSON.stringify(videoGameStructuredData);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <section className="bg-[#ecf0e2] py-12">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-green">
              La Palabra Academy
            </p>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t("hero.title")}</h1>
            <p className="mx-auto max-w-3xl text-base text-gray-700 sm:text-lg">
              {t("hero.subtitle")}
            </p>
            <p className="mx-auto max-w-3xl text-sm leading-relaxed text-gray-600">
              {t("hero.content")}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="#introduccion"
                className="inline-flex items-center justify-center rounded-full bg-primary-green px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-green/80"
              >
                {t("hero.cta")}
              </Link>
              <Link
                href="#modos-de-juego"
                className="inline-flex items-center justify-center rounded-full border border-primary-green/30 px-6 py-2 text-sm font-semibold text-primary-green transition hover:border-primary-green hover:text-primary-green"
              >
                {t("modes.title")}
              </Link>
            </div>
          </div>
        </section>

        <nav className="border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="mx-auto flex max-w-5xl flex-wrap gap-3 px-4 py-4 text-sm">
            {guideSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full border border-gray-200 px-4 py-1 text-gray-600 transition hover:border-primary-green hover:text-primary-green"
              >
                {section.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-12">
          {guideSections.map((section) => (
            <section key={section.id} id={section.id} className="space-y-6 scroll-mt-24">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-green">
                  {section.id.replace("-", " ")}
                </p>
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                <p className="text-sm leading-relaxed text-gray-600">{section.description}</p>
              </div>

              {section.items && section.items.length > 0 && (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <li key={item} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {section.id === "estadisticas" && (
                <div className="rounded-xl border border-primary-green/20 bg-[#ecf0e2] p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t("stats.cta")}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t("stats.ctaDescription")}
                  </p>
                  <div className="flex gap-3">
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center rounded-full bg-primary-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-green/80"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Ver Estadísticas
                    </Link>
                    <span className="inline-flex items-center text-xs text-gray-500">
                      📊 Ícono en la esquina superior derecha
                    </span>
                  </div>
                </div>
              )}
            </section>
          ))}

          <section id="faq" className="space-y-6 scroll-mt-24">
            <div className="space-y-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-green">
                FAQ La Palabra Academy
              </p>
              <h2 className="text-2xl font-bold text-gray-900">{t("faq.title")}</h2>
              <p className="text-sm leading-relaxed text-gray-600">{t("faq.description")}</p>
            </div>
            <div className="space-y-4">
              {faqEntries.map((entry, index) => (
                <details key={entry.question} className="group rounded-xl border border-gray-200 bg-white/80 p-4">
                  <summary className="flex cursor-pointer items-center justify-between text-left text-sm font-semibold text-gray-800">
                    <span>
                      <span className="mr-3 text-primary-green">{index + 1}.</span>
                      {entry.question}
                    </span>
                    <span className="text-primary-green transition group-open:-rotate-180">▼</span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {entry.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-primary-green/20 bg-[#ecf0e2] p-6">
            <h3 className="text-lg font-semibold text-gray-900">Otros recursos</h3>
            <p className="mt-2 text-sm text-gray-600">
              Explora contenidos complementarios sobre la palabra de hoy, desafíos personalizados y juegos de palabras en español.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(t.raw("pointers") as Array<{ title: string; description: string; href: string }>).map((pointer) => (
                <Link
                  key={pointer.href}
                  href={pointer.href}
                  className="rounded-xl border border-white/60 bg-white p-4 text-sm leading-relaxed text-gray-700 transition hover:border-primary-green/40"
                >
                  <span className="font-semibold text-primary-green block mb-1">{pointer.title}</span>
                  {pointer.description}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="space-y-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-green">
                Guías por longitud
              </p>
              <h2 className="text-2xl font-bold text-gray-900">Guías de 3 a 11 letras</h2>
              <p className="text-sm text-gray-600">
                Una guía dedicada para cada longitud, con aperturas y tácticas específicas.
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lengthGuides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-sm leading-relaxed text-gray-700 transition hover:border-primary-green/40 hover:bg-white"
                >
                  <span className="font-semibold text-primary-green block mb-1">{guide.title}</span>
                  {guide.description}
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Guías relacionadas</h2>
              <p className="text-sm text-gray-600">Profundiza aún más en el mundo de los juegos de palabras</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/" className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-left transition hover:border-primary-green/50 hover:bg-white">
                <h3 className="font-semibold text-primary-green mb-2">← Volver al juego</h3>
                <p className="text-sm text-gray-600">Juega la palabra de hoy y practica en modo infinito</p>
              </Link>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                <h3 className="font-semibold text-gray-800 mb-2">📊 Mejora tus estadísticas</h3>
                <p className="text-sm text-gray-600">Acompaña tu progreso y sube de nivel en La Palabra del Día</p>
                <Link href="/#estadisticas" className="text-primary-green text-sm font-medium mt-2 inline-block">Ver estadísticas →</Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbStructuredDataJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqStructuredDataJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: howToStructuredDataJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: courseStructuredDataJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: videoGameStructuredDataJson }} />
    </div>
  );
}

