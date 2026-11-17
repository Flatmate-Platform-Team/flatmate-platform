import "./globals.css";

export const metadata = {
  title: "Avenli — Find your people. Find your place.",
  description: "Discover spaces and compatible flatmates.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
