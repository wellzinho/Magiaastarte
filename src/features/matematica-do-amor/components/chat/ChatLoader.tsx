"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import styles from "./chat.module.css";

const ChatExperience = dynamic(() => import("./ChatExperience").then((mod) => mod.ChatExperience), {
  ssr: false,
  loading: () => <ChatLoading />,
});

export function ChatLoader() {
  return <ChatExperience />;
}

function ChatLoading() {
  return (
    <main className={styles.page}>
      <section className={styles.column} aria-labelledby="titulo-leitura">
        <header className={styles.header}>
          <span className={styles.avatar} aria-hidden="true">
            <Image className={styles.avatarImage} src="/matematica-do-amor/astarte-mark.png" alt="" width={80} height={80} />
          </span>
          <div className={styles.titles}>
            <h1 id="titulo-leitura" className={styles.title}>
              Matemática do Amor
            </h1>
            <p className={styles.subtitle}>Leitura de compatibilidade amorosa</p>
          </div>
        </header>
        <p className={styles.loading}>Carregando a conversa neste aparelho.</p>
      </section>
    </main>
  );
}
