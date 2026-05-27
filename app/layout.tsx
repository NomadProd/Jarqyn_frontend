import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Unbounded } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const sans = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
  variable: "--font-sans"
});

const display = Unbounded({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
  variable: "--font-display"
});

const editorial = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  display: "swap",
  variable: "--font-editorial",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "ЖАРҚЫН | Jarqyn",
  description:
    "ЖАРҚЫН — яркое поколение Казахстана. Идентичность, принадлежность и новая форма для тех, кто вырос из старых правил."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${sans.variable} ${display.variable} ${editorial.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
