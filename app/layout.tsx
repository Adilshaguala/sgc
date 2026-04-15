import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const fontSans = Instrument_Sans({subsets:['latin'],variable:'--font-sans'});


export const metadata: Metadata = {
  title: "CEAD/UPM - Sistema de Gestao de Contratos",
  description: "Sistema de gestao de contratos para o Centro de Educacao Aberta e a Distancia da Universidade Pedagogica de Maputo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" suppressHydrationWarning className={`${fontSans.variable} bg-background`}>
      <body
        className="antialiased"
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
