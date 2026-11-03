import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BelaVez — cuidado no seu tempo",
  description: "Agendamento e acompanhamento de procedimentos estéticos, com uma rotina mais leve para clínicas e clientes.",
  icons: { icon: "/belavez-mark.svg", shortcut: "/belavez-mark.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
