import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dhirajraikantiwar.com"),
  title: "Dhiraj Raikantiwar | Data & AI Transformation Leader",
  description:
    "Enterprise data, analytics, and AI leadership across banking, media, and retail.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Dhiraj Raikantiwar | Data & AI Transformation Leader",
    description:
      "Enterprise data, analytics, and AI leadership across banking, media, and retail.",
    siteName: "Dhiraj Raikantiwar",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><div style={{ display: "none" }} dangerouslySetInnerHTML={{ __html: "<!-- THESIS: Signals assemble into a real leader, then into decisions. OWN-WORLD: Mineral navy, luminous silver, ice blue, cobalt; geometric display type and precise circular controls. STORY: Meet Dhiraj, explore enterprise evidence, discover products, start a conversation. FIRST VIEWPORT: Monumental interactive point portrait right; two-line 140px headline left; work and sound actions below; thin navigation above. FORM: User-selected experimental particle assembly, b2c4cddb. SIGNATURE: Pointer repulsion and scroll dissolution; original crossfaded score with explicit sound control. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance -->" }} />{children}</body>
    </html>
  );
}
