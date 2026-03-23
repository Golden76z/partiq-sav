import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "PartiQ SAV — Assistant IA DELABIE · KWC · DVS",
  description: "Plateforme SAV intelligente pour la gestion des pièces détachées et du support technique DELABIE, KWC et DVS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
