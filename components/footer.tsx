'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { WORD_LENGTH_VARIANTS, getGuidePath } from '@/lib/length-pages';

export default function Footer() {
  const t = useTranslations('Footer');

  const navLinks = [
    { href: '/guia-palabra', label: t('guide') },
    { href: '/sobre-nosotros', label: t('about') },
    { href: '/privacy', label: t('privacy') },
    { href: '/terms', label: t('terms') },
  ];

  const partnerLinks = [
    { name: 'Sutom en francés', href: 'https://jeuxdelettes.com', follow: true },
    { name: 'Wordle en alemán', href: 'https://wortchamp.com', follow: true },
    { name: 'SudokuAgora', href: 'https://sudokuagora.com/', follow: true },
    { name: 'SudokuDefi', href: 'https://sudokudefi.com/', follow: true },
    // { name: 'Morse Code Kit', href: 'https://morsecodekit.com/', follow: true },
    // { name: 'PrintableGen', href: 'https://printablegen.com/', follow: true },
    // { name: 'Generate Org Chart', href: 'https://generateorgchart.com/', follow: true },
    // { name: 'Size Chart Kit', href: 'https://sizechartkit.com/', follow: true },
    // { name: 'Device Test Tools', href: 'https://devicetesttools.com/', follow: true },
    // { name: 'IBAN Tools', href: 'https://ibantools.net/', follow: true },
    // { name: 'Randlyx', href: 'https://randlyx.com/', follow: true },
    // { name: 'Subnautica Hub', href: 'https://subnauticahub.com/', follow: true },
    // { name: 'Test Score Hub', href: 'https://testscorehub.com/', follow: true },
    // { name: "EasyPdfNow", href: "https://easypdfnow.com/", follow: true },
    // { name: "Solarpunk Hub", href: "https://solarpunkhub.com/", follow: true },
    // { name: "GAG2Hub", href: "https://gag2hub.com/", follow: true },
  ];

  return (
    <footer className="border-t border-gray-200 py-6">
      <div className="container mx-auto px-4 text-center">
        <div className="space-y-2">
          <p className="text-gray-600 text-sm">{t('copyright')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-green-600 hover:text-green-700 text-sm transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="text-gray-600">Enlaces recomendados:</span>
            {partnerLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel={item.follow ? 'noopener noreferrer' : 'nofollow noopener noreferrer'}
                className="text-green-600 hover:text-green-700 transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
            {WORD_LENGTH_VARIANTS.map((length) => (
              <Link
                key={length}
                href={getGuidePath(length)}
                className="rounded-full border border-gray-200 px-2 py-1 text-gray-600 transition-colors hover:border-green-500 hover:text-green-700"
              >
                Guia {length}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
