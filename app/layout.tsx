import type { Metadata, Viewport } from "next";
import { Fraunces, Caveat, Figtree } from "next/font/google";
import "./globals.css";
import "./extras.css";
import "./cozy.css";
import "./room.css";
import "./world.css";
import "./lite.css";

// Fraunces (serif blanda, con el eje SOFT) para los títulos; Caveat para lo "escrito a mano"; Figtree para leer.
const display = Fraunces({ subsets: ["latin"], variable: "--font-display", axes: ["opsz", "SOFT"], display: "swap" });
const hand = Caveat({ subsets: ["latin"], variable: "--font-hand", display: "swap" });
const body = Figtree({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "Feliz cumpleaños, ShuraHiwa",
  description: "Una noche en un cuarto de luces cálidas: tarot, deseos, cariño y a Motoperro para ShuraHiwa.",
};

export const viewport: Viewport = {
  themeColor: "#1c0f1e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${hand.variable} ${body.variable}`}>
      <body>
        <noscript>
          <style>{`.hero-title{visibility:visible!important}[data-in]{visibility:visible!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
