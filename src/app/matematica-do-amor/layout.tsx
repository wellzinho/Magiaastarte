import type { Metadata, Viewport } from "next";
import styles from "./matematica.module.css";

export const metadata: Metadata = {
  title: "Matemática do Amor · Magia Astarte",
  description: "Leitura guiada de numerologia amorosa. A conta sai das datas de nascimento, com uma prévia grátis.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function MatematicaDoAmorLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.shell}>{children}</div>;
}
