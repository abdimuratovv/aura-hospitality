import "./globals.css";

export const metadata = {
  title: "AURA · Hospitality Intelligence",
  description: "AI-driven audit, fraud detection and revenue-leakage recovery for hospitality finance teams.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
