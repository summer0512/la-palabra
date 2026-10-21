import { ReactNode } from "react";

type Props = { children: ReactNode };

// Scripts are mounted inside the localized document body.
export default function RootLayout({ children }: Props) {
  return <>{children}</>;
}
