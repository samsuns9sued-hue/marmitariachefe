import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- ESSA LINHA É OBRIGATÓRIA!
import { Toaster } from "sonner"; // Para as notificações funcionarem

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Marmitaria da Mãe",
  description: "Peça sua marmita online",
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
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}