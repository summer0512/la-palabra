import {ReactNode} from 'react';
import Script from 'next/script';
// import AdsterraSocialBar from '@/components/adsterra-socialbar';

type Props = {
  children: ReactNode;
};

// Since we have a `not-found.tsx` page on the root, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({children}: Props) {
  return(
    <>
      <Script
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2623631636848395"
        crossOrigin="anonymous"
      />
      {/* <AdsterraSocialBar /> */}
      {children}
      <Script
        strategy="lazyOnload"
        src="https://www.googletagmanager.com/gtag/js?id=G-LDJMHJJ77D"
      />
      <Script
        id="google-analytics"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LDJMHJJ77D');
          `,
        }}
      />
    </>
    )
}
