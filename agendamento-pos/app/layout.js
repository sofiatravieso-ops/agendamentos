import "./globals.css";

export const metadata = {
  title: "Agendamento dos Testes - Pós",
  description: "Agende seus testes do pós-treino",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen text-[18px] leading-relaxed">
        <div className="max-w-md mx-auto px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
