import { GoogleTagManager } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://magiaastarte.com.br";

export const metadata: Metadata = {
  title: "21 Práticas de Pombagira | Magia Astarte",
  description:
    "Aprenda 21 práticas de Pombagira explicadas passo a passo: para que servem, o que você precisa, como fazer e o significado dos principais elementos.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "21 Práticas de Pombagira | Magia Astarte",
    description:
      "Aprenda 21 práticas de Pombagira explicadas passo a passo: para que servem, o que você precisa, como fazer e o significado dos principais elementos.",
    locale: "pt_BR",
    type: "website",
    siteName: "Magia Astarte",
  },
  twitter: {
    card: "summary_large_image",
    title: "21 Práticas de Pombagira | Magia Astarte",
    description:
      "Aprenda 21 práticas de Pombagira explicadas passo a passo: para que servem, o que você precisa, como fazer e o significado dos principais elementos.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased pb-16 md:pb-0">
        <MetaPixel />
        {children}
      </body>
      <GoogleTagManager gtmId="GTM-WFQ78SNN" />
    </html>
  );
}
