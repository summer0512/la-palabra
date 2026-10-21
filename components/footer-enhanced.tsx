'use client';

import Link from 'next/link';

export default function FooterEnhanced() {
  return (
    <>
      {/* Main Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 flex">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold mb-4">La Palabra del Día</h3>
              <p className="text-gray-300 text-sm mb-4">
                El juego de palabras más popular en español. Juega la palabra de hoy y el modo infinito gratis.
              </p>
              <p className="text-gray-400 text-xs">
                lapalabra-deldia.com © 2025
              </p>
            </div>

            {/* Game Modes */}
            <div>
              <h4 className="font-semibold mb-4">Modos de juego</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                    Palabra de hoy
                  </Link>
                </li>
                <li>
                  <Link href="/#modos-de-juego" className="text-gray-300 hover:text-white transition-colors">
                    Modo infinito
                  </Link>
                </li>
                <li>
                  <Link href="/guia-palabra#desafios" className="text-gray-300 hover:text-white transition-colors">
                    Desafíos personalizados
                  </Link>
                </li>
              </ul>
            </div>

            {/* Guides & Tips */}
            <div>
              <h4 className="font-semibold mb-4">Guías y consejos</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/guia-palabra#estrategias" className="text-gray-300 hover:text-white transition-colors">
                    Estrategias para ganar
                  </Link>
                </li>
                <li>
                  <Link href="/guia-palabra#intro" className="text-gray-300 hover:text-white transition-colors">
                    Consejos de la palabra de hoy
                  </Link>
                </li>
                <li>
                  <Link href="/guia-palabra#faq" className="text-gray-300 hover:text-white transition-colors">
                    La Palabra vs Wordle
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="mailto:contacto@lapalabra-deldia.com?subject=La%20Palabra%20del%20D%C3%ADa" 
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Contacto
                  </a>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                    Términos de uso
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              La Palabra del Día - El mejor juego de palabras en español |
              <span className="ml-2">
                <Link href="/" className="text-blue-400 hover:text-blue-300">
                  Juega ahora
                </Link>
              </span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

