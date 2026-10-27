import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import "./extras.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const body = Figtree({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Feliz cumpleaños, ShuraHiwa",
  description: "Una noche en carretera que termina en amanecer. Tarot, deseos y cariño para ShuraHiwa.",
};

export const viewport: Viewport = {
  themeColor: "#0a0822",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body>
        <noscript>
          <style>{`.hero-title{visibility:visible!important}[data-in]{visibility:visible!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
