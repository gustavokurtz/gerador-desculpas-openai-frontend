// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// REMOVA: import { Toaster } from "@/components/ui/toaster";
import { Toaster } from "@/components/ui/sonner"; // ADICIONE: Importe o Toaster do Sonner

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gerador de Desculpas para Devs",
  description: "Sua fonte confiável de desculpas técnicas criativas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        {/* Use o Toaster do Sonner. Pode adicionar props como richColors, position, etc. */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}