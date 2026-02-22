// app/layout.tsx
import "./globals.css";
import "leaflet/dist/leaflet.css";
import ClientRoot from "@/app/_components/ClientRoot";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        hello
      </body>
    </html>
  );
}
