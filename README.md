This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Word list workflow

To manage the Spanish word lists:

1. Put daily-answer candidates in `data/answers-es.txt` (one 5-letter word per line).
2. Put the full playable list in `data/allowed-es.txt` (include the answers as well).
3. Run `pnpm generate:wordlists` (requires `pnpm install` to pick up the `tsx` dependency).

The script outputs `constants/wordlist.ts` with the updated `Rf`, `Pf`, and `Yf` structures while keeping accent handling intact.


## Analytics and advertising

`lib/site-scripts.ts` contains independent switches for Google Analytics, AdSense, Adsterra Social Bar, Popunder, and banners. Real vendor scripts load only with `NODE_ENV=production` on `lapalabra-deldia.com`. Development and preview hosts load no vendor scripts; wide desktop layouts show banner placeholders instead.

The left banner is 160×600 and the right banner is 160×300. They mount only on desktop viewports at least 1728px wide and 760px tall, with a mouse/trackpad, leaving room around the existing 1280px game container. Mobile does not mount banner iframes or load their scripts. The Social Bar retains its existing mobile exclusion on game/finder pages; AdSense and GA remain available on mobile in production.

Popunder is disabled because [AdSense placement policies](https://support.google.com/adsense/answer/1346295?hl=en) prohibit Google ads on sites that contain or trigger pop-unders, including third-party pop-unders. The dormant loader remains guarded by its disabled switch. A future in-page Adsterra banner dialog requires a separate banner unit; it must not trigger browser pop-under windows.
