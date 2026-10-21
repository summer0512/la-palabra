import type { Metadata } from "next";
import { useLocale } from "next-intl";
import Footer from "@/components/footer";
import { createBreadcrumbStructuredData, createMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return createMetadata({
    locale,
    pathname: "/sobre-nosotros",
    title: "Sobre nosotros | La Palabra del Dia",
    description: "Conoce al creador de La Palabra del Dia y el origen del proyecto.",
    keywords: "sobre nosotros, creador, la palabra del dia, wordle espanol",
  });
}

export default function AboutPage() {
  const locale = useLocale();
  const breadcrumbStructuredData = createBreadcrumbStructuredData({
    locale,
    items: [
      { name: "La Palabra del Dia", path: "/" },
      { name: "Sobre nosotros", path: "/sobre-nosotros" },
    ],
  });
  const breadcrumbStructuredDataJson = JSON.stringify(breadcrumbStructuredData);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 space-y-10 text-gray-800">
        <header className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-green">La Palabra del Dia</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Sobre nosotros</h1>
          <p className="text-base leading-7">
            Soy un desarrollador independiente de China y un fan de Wordle. Este proyecto nacio como un hobby
            y como una forma de practicar espanol mientras construia un sitio util para otros jugadores.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Por que existe este sitio</h2>
          <p className="text-base leading-7">
            Queria un Wordle en espanol con opciones claras para practicar, un buscador util y guias que realmente
            ayuden a mejorar. La Palabra del Dia es el resultado de esa idea.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-gray-900">Contacto</h2>
          <p className="text-base leading-7">
            Si tienes comentarios o sugerencias, puedes escribirme directamente.
          </p>
          <p className="text-base leading-7">
            <span className="font-semibold">Correo: </span>
            <a className="text-primary-green hover:underline" href="mailto:contacto@lapalabra-deldia.com">
              contacto@lapalabra-deldia.com
            </a>
          </p>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbStructuredDataJson }}
      />
    </div>
  );
}
