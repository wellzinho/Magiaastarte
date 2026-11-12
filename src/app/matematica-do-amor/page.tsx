import type { Metadata } from "next";
import { ChatLoader } from "@/features/matematica-do-amor/components/chat/ChatLoader";

export const metadata: Metadata = {
  title: "Matemática do Amor · Magia Astarte",
  description: "Leitura guiada de numerologia amorosa. A conta sai das datas de nascimento, com uma prévia grátis.",
};

export default function MatematicaDoAmorPage() {
  return <ChatLoader />;
}
